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
  if (!socketServerInstance) return;

  const payload = {
    roomId,
    roomCode,
    reason,
    endedAt: endedAt.toISOString(),
    duration,
  };

  // Broadcast to both ID and Code room channels
  socketServerInstance.to(roomId).emit("room:terminated", payload);
  socketServerInstance.to(roomCode).emit("room:terminated", payload);

  // Evict all socket connections from the room
  socketServerInstance.in(roomId).socketsLeave(roomId);
  socketServerInstance.in(roomCode).socketsLeave(roomCode);

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
  if (!socketServerInstance) return;

  socketServerInstance.to(roomId).emit("room:updated", updatedData);
  socketServerInstance.to(roomCode).emit("room:updated", updatedData);
};

/**
 * Periodic background task that auto-terminates rooms when their scheduledEndTime is reached.
 */
export const checkAndTerminateExpiredRooms = async () => {
  try {
    const now = new Date();

    // Find all active or scheduled rooms where scheduledEndTime has passed
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
  } catch (error) {
    console.error("[Room Lifecycle] Error checking expired rooms:", error);
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

