import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";
import type { ToggleMediaPayload, PeerUser } from "../types/socket.types.ts";

export const registerMediaHandlers = (io: Server, socket: Socket) => {
  const broadcastMediaUpdate = (
    rawRoomId: string | undefined,
    updates: Partial<Pick<PeerUser, "isAudioMuted" | "isVideoOff" | "isHandRaised" | "isScreenSharing">>,
    eventName: string
  ) => {
    const targetRoom = rawRoomId || roomStateManager.getRoomIdBySocketId(socket.id);
    if (!targetRoom) return;

    const { canonicalId, targetRooms } = roomStateManager.getRoomChannels(targetRoom, socket);
    const updated = roomStateManager.updatePeerMedia(canonicalId, socket.id, updates);

    if (updated) {
      io.to(targetRooms).emit(eventName, {
        socketId: socket.id,
        userId: updated.userId,
        ...updates,
      });
    }
  };

  /**
   * Toggles microphone mute state across peers in room.
   */
  socket.on("media:toggle-audio", (payload: ToggleMediaPayload) => {
    broadcastMediaUpdate(payload.roomId, { isAudioMuted: payload.isMuted }, "media:audio-status-changed");
  });

  /**
   * Toggles camera video state across peers in room.
   */
  socket.on("media:toggle-video", (payload: ToggleMediaPayload) => {
    broadcastMediaUpdate(payload.roomId, { isVideoOff: payload.isVideoOff }, "media:video-status-changed");
  });

  /**
   * Toggles hand raise reaction across peers in room.
   */
  socket.on("media:raise-hand", (payload: ToggleMediaPayload) => {
    broadcastMediaUpdate(payload.roomId, { isHandRaised: payload.isHandRaised }, "media:hand-raise-changed");
  });

  /**
   * Toggles screen sharing state across peers in room.
   */
  socket.on("media:toggle-screenshare", (payload: { roomId?: string; isScreenSharing: boolean }) => {
    broadcastMediaUpdate(payload.roomId, { isScreenSharing: payload.isScreenSharing }, "media:screenshare-status-changed");
  });
};

export default registerMediaHandlers;
