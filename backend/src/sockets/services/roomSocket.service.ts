import type { Server } from "socket.io";
import prisma from "../../config/db.ts";
import { RoomStatus } from "@prisma/client";
import { roomStateManager } from "../state/roomState.manager.ts";

let socketServerInstance: Server | null = null;

export const setSocketServerInstance = (io: Server) => {
  socketServerInstance = io;
};

/**
 * Broadcasts room termination event to all connected peers in that room and cleans up active connections.
 */
export const broadcastRoomTerminated = (
  roomId: string,
  roomCode: string,
  reason: string = "The host has ended this meeting.",
  endedAt: Date = new Date(),
  duration?: number | null
) => {
  // 1. Mark in-memory state as ended so future join attempts are instantly rejected
  roomStateManager.markRoomEnded(roomId);
  roomStateManager.markRoomEnded(roomCode);

  if (!socketServerInstance) return;
  const io = socketServerInstance;

  const payload = {
    roomId,
    roomCode,
    reason,
    endedAt: endedAt.toISOString(),
    duration,
  };

  const targetRooms = Array.from(
    new Set([roomId, roomId.toUpperCase(), roomCode, roomCode.toUpperCase()].filter(Boolean))
  );

  targetRooms.forEach((r) => {
    io.to(r).emit("room:terminated", payload);
    io.to(r).emit("webrtc:peer-left", { socketId: "all", reason });
    if (typeof io.in(r)?.socketsLeave === "function") {
      io.in(r).socketsLeave(r);
    }
  });

  console.log(`[Room Lifecycle] Room ${roomCode} (${roomId}) terminated: ${reason}`);
};

/**
 * Broadcasts room configuration changes (title, tools, schedule) to active peers.
 */
export const broadcastRoomUpdated = (
  roomId: string,
  roomCode: string,
  updatedData: unknown
) => {
  if (updatedData && typeof updatedData === "object" && "status" in updatedData) {
    const newStatus = (updatedData as { status?: "ACTIVE" | "SCHEDULED" | "ENDED" }).status;
    if (newStatus) {
      const cached = roomStateManager.getRoomMeta(roomId) || roomStateManager.getRoomMeta(roomCode);
      if (cached) {
        cached.status = newStatus;
        roomStateManager.setRoomMeta(roomId, cached);
        if (roomCode) roomStateManager.setRoomMeta(roomCode, cached);
      }
    }
  }

  if (!socketServerInstance) return;

  socketServerInstance.to(roomId).emit("room:updated", updatedData);
  socketServerInstance.to(roomCode).emit("room:updated", updatedData);
};

/**
 * Periodic background task that auto-terminates rooms when their scheduledEndTime is reached
 * and auto-activates scheduled rooms when their scheduledAt start time is reached.
 */
export const checkAndTerminateExpiredRooms = async () => {
  try {
    const now = new Date();

    // 1. Auto-terminate expired rooms
    const expiredRooms = await prisma.room.findMany({
      where: {
        status: { in: [RoomStatus.ACTIVE, RoomStatus.SCHEDULED] },
        scheduledEndTime: { lte: now },
      },
    });

    for (const room of expiredRooms) {
      const endedAt = room.scheduledEndTime || now;
      const duration = Math.max(
        0,
        Math.floor((endedAt.getTime() - room.createdAt.getTime()) / 1000)
      );

      await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.ENDED,
          endedAt,
          duration,
        },
      });

      broadcastRoomTerminated(
        room.id,
        room.roomCode,
        "Room scheduled duration has ended.",
        endedAt,
        duration
      );
    }

    // 2. Auto-activate scheduled rooms whose start time has arrived
    const readyScheduledRooms = await prisma.room.findMany({
      where: {
        status: RoomStatus.SCHEDULED,
        scheduledAt: { lte: now },
      },
    });

    for (const room of readyScheduledRooms) {
      await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.ACTIVE,
        },
      });

      broadcastRoomUpdated(room.id, room.roomCode, {
        status: RoomStatus.ACTIVE,
        message: "Scheduled meeting start time reached. Room is now active.",
      });
    }
  } catch (error) {
    console.error("[Room Lifecycle] Error checking expired/scheduled rooms:", error);
  }
};

let watcherInterval: NodeJS.Timeout | null = null;

/**
 * Starts periodic room expiration supervisor.
 */
export const startRoomExpirationWatcher = (intervalMs: number = 30000) => {
  if (watcherInterval) {
    clearInterval(watcherInterval);
  }
  console.log(`[Room Lifecycle] Scheduled expiration watcher active (polling every ${intervalMs / 1000}s)`);
  watcherInterval = setInterval(checkAndTerminateExpiredRooms, intervalMs);
  if (typeof watcherInterval.unref === "function") {
    watcherInterval.unref();
  }
  return watcherInterval;
};

export const stopRoomExpirationWatcher = () => {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
};
