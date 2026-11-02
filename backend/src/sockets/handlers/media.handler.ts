import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";
import type { ToggleMediaPayload } from "../types/socket.types.ts";

export const registerMediaHandlers = (io: Server, socket: Socket) => {
  /**
   * Toggles microphone mute state across peers in room.
   */
  socket.on("media:toggle-audio", (payload: ToggleMediaPayload) => {
    const roomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!roomId) return;

    const updated = roomStateManager.updatePeerMedia(roomId, socket.id, {
      isAudioMuted: payload.isMuted,
    });

    if (updated) {
      io.to(roomId).emit("media:audio-status-changed", {
        socketId: socket.id,
        userId: updated.userId,
        isAudioMuted: updated.isAudioMuted,
      });
    }
  });

  /**
   * Toggles camera video state across peers in room.
   */
  socket.on("media:toggle-video", (payload: ToggleMediaPayload) => {
    const roomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!roomId) return;

    const updated = roomStateManager.updatePeerMedia(roomId, socket.id, {
      isVideoOff: payload.isVideoOff,
    });

    if (updated) {
      io.to(roomId).emit("media:video-status-changed", {
        socketId: socket.id,
        userId: updated.userId,
        isVideoOff: updated.isVideoOff,
      });
    }
  });

  /**
   * Toggles hand raise reaction across peers in room.
   */
  socket.on("media:raise-hand", (payload: ToggleMediaPayload) => {
    const roomId = payload.roomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!roomId) return;

    const updated = roomStateManager.updatePeerMedia(roomId, socket.id, {
      isHandRaised: payload.isHandRaised,
    });

    if (updated) {
      io.to(roomId).emit("media:hand-raise-changed", {
        socketId: socket.id,
        userId: updated.userId,
        isHandRaised: updated.isHandRaised,
      });
    }
  });
};

export default registerMediaHandlers;

