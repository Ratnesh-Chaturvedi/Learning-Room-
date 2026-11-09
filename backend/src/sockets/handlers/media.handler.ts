import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";
import type { ToggleMediaPayload } from "../types/socket.types.ts";

export const registerMediaHandlers = (io: Server, socket: Socket) => {
  /**
   * Toggles microphone mute state across peers in room.
   */
  socket.on("media:toggle-audio", (payload: ToggleMediaPayload) => {
    const rawRoomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!rawRoomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(rawRoomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const updated = roomStateManager.updatePeerMedia(canonicalId, socket.id, {
      isAudioMuted: payload.isMuted,
    });

    if (updated) {
      const statusPayload = {
        socketId: socket.id,
        userId: updated.userId,
        isAudioMuted: updated.isAudioMuted,
      };

      const targetRooms = Array.from(new Set([canonicalId, canonicalCode, rawRoomId].filter(Boolean)));
      io.to(targetRooms).emit("media:audio-status-changed", statusPayload);
    }
  });

  /**
   * Toggles camera video state across peers in room.
   */
  socket.on("media:toggle-video", (payload: ToggleMediaPayload) => {
    const rawRoomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!rawRoomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(rawRoomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const updated = roomStateManager.updatePeerMedia(canonicalId, socket.id, {
      isVideoOff: payload.isVideoOff,
    });

    if (updated) {
      const statusPayload = {
        socketId: socket.id,
        userId: updated.userId,
        isVideoOff: updated.isVideoOff,
      };

      const targetRooms = Array.from(new Set([canonicalId, canonicalCode, rawRoomId].filter(Boolean)));
      io.to(targetRooms).emit("media:video-status-changed", statusPayload);
    }
  });

  /**
   * Toggles hand raise reaction across peers in room.
   */
  socket.on("media:raise-hand", (payload: ToggleMediaPayload) => {
    const rawRoomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!rawRoomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(rawRoomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const updated = roomStateManager.updatePeerMedia(canonicalId, socket.id, {
      isHandRaised: payload.isHandRaised,
    });

    if (updated) {
      const statusPayload = {
        socketId: socket.id,
        userId: updated.userId,
        isHandRaised: updated.isHandRaised,
      };

      const targetRooms = Array.from(new Set([canonicalId, canonicalCode, rawRoomId].filter(Boolean)));
      io.to(targetRooms).emit("media:hand-raise-changed", statusPayload);
    }
  });

  /**
   * Toggles screen sharing state across peers in room.
   */
  socket.on("media:toggle-screenshare", (payload: { roomId?: string; isScreenSharing: boolean }) => {
    const rawRoomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!rawRoomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(rawRoomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const updated = roomStateManager.updatePeerMedia(canonicalId, socket.id, {
      isScreenSharing: payload.isScreenSharing,
    });

    if (updated) {
      const statusPayload = {
        socketId: socket.id,
        userId: updated.userId,
        isScreenSharing: updated.isScreenSharing ?? false,
      };

      const targetRooms = Array.from(new Set([canonicalId, canonicalCode, rawRoomId].filter(Boolean)));
      io.to(targetRooms).emit("media:screenshare-status-changed", statusPayload);
    }
  });
};

export default registerMediaHandlers;
