import type { Server } from "socket.io";
import prisma from "../../config/db.ts";
import { RoomStatus } from "@prisma/client";
import { roomStateManager } from "../state/roomState.manager.ts";

let socketServerInstance: Server | null = null;

export const setSocketServerInstance = (io: Server) => {
  socketServerInstance = io;
};

// Broadcast room termination to active peers and clean up sockets
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

// Broadcast room configuration changes to active peers
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

// Auto-terminate expired rooms and activate scheduled rooms
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

// Active empty-room auto-termination timers
const emptyRoomTimers = new Map<string, NodeJS.Timeout>();

// Schedule 5-minute empty room auto-termination countdown
export const scheduleEmptyRoomTermination = (
  roomId: string,
  timeoutMs: number = 5 * 60 * 1000
): void => {
  if (!roomId) return;
  const canonicalKey = roomStateManager.getCanonicalKey(roomId) || roomId.trim().toUpperCase();

  // Cancel any prior timer for this room to prevent duplicate execution
  if (emptyRoomTimers.has(canonicalKey)) {
    clearTimeout(emptyRoomTimers.get(canonicalKey)!);
    emptyRoomTimers.delete(canonicalKey);
  }

  const meta = roomStateManager.getRoomMeta(canonicalKey);
  const altKey = meta?.roomCode ? meta.roomCode.toUpperCase() : undefined;
  if (altKey && emptyRoomTimers.has(altKey)) {
    clearTimeout(emptyRoomTimers.get(altKey)!);
    emptyRoomTimers.delete(altKey);
  }

  console.log(
    `[Room Lifecycle] Room ${canonicalKey} is empty. Scheduled auto-termination in ${
      timeoutMs / 1000
    }s.`
  );

  const timer = setTimeout(async () => {
    emptyRoomTimers.delete(canonicalKey);
    if (altKey) emptyRoomTimers.delete(altKey);

    // Double-check: ensure room remains strictly empty
    const currentPeers = roomStateManager.getRoomPeers(canonicalKey);
    if (currentPeers.length > 0) {
      console.log(
        `[Room Lifecycle] Empty room termination cancelled: ${currentPeers.length} peer(s) found in ${canonicalKey}.`
      );
      return;
    }

    try {
      const room = await prisma.room
        .findFirst({
          where: {
            OR: [
              { id: canonicalKey },
              { id: canonicalKey.toLowerCase() },
              { roomCode: canonicalKey.toUpperCase() },
            ],
          },
        })
        .catch(() => null);

      if (room && room.status === RoomStatus.ACTIVE) {
        const endedAt = new Date();
        const duration = Math.max(
          0,
          Math.floor((endedAt.getTime() - room.createdAt.getTime()) / 1000)
        );

        await prisma.room
          .update({
            where: { id: room.id },
            data: {
              status: RoomStatus.ENDED,
              endedAt,
              duration,
            },
          })
          .catch((dbErr) =>
            console.warn("[Room Lifecycle] Failed updating ended status in DB:", dbErr)
          );

        broadcastRoomTerminated(
          room.id,
          room.roomCode,
          "This room was automatically closed after being empty for 5 minutes.",
          endedAt,
          duration
        );

        console.log(
          `[Room Lifecycle] Room ${room.roomCode} (${room.id}) successfully auto-terminated after 5 minutes empty.`
        );
      } else {
        // In-memory or non-DB room cleanup
        roomStateManager.markRoomEnded(canonicalKey);
        if (altKey) roomStateManager.markRoomEnded(altKey);
        broadcastRoomTerminated(
          canonicalKey,
          altKey || canonicalKey,
          "This room was automatically closed after being empty for 5 minutes."
        );
      }
    } catch (err) {
      console.error(`[Room Lifecycle] Error auto-terminating empty room ${canonicalKey}:`, err);
    }
  }, timeoutMs);

  emptyRoomTimers.set(canonicalKey, timer);
  if (altKey && altKey !== canonicalKey) {
    emptyRoomTimers.set(altKey, timer);
  }
};

// Cancel pending empty-room termination countdown
export const cancelEmptyRoomTermination = (roomId: string): boolean => {
  if (!roomId) return false;
  const canonicalKey = roomStateManager.getCanonicalKey(roomId) || roomId.trim().toUpperCase();
  const meta = roomStateManager.getRoomMeta(canonicalKey);
  const altKey = meta?.roomCode ? meta.roomCode.toUpperCase() : undefined;

  let cancelled = false;

  const timer1 = emptyRoomTimers.get(canonicalKey);
  if (timer1) {
    clearTimeout(timer1);
    emptyRoomTimers.delete(canonicalKey);
    cancelled = true;
  }

  if (altKey) {
    const timer2 = emptyRoomTimers.get(altKey);
    if (timer2) {
      clearTimeout(timer2);
      emptyRoomTimers.delete(altKey);
      cancelled = true;
    }
  }

  if (cancelled) {
    console.log(`[Room Lifecycle] Cancelled empty room termination timer for room ${canonicalKey}.`);
  }

  return cancelled;
};

// Check if empty-room auto-termination is pending
export const hasPendingEmptyRoomTermination = (roomId: string): boolean => {
  const canonicalKey = roomStateManager.getCanonicalKey(roomId) || roomId.trim().toUpperCase();
  return emptyRoomTimers.has(canonicalKey);
};

// Start periodic room expiration supervisor
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
