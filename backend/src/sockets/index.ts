import type { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middlewares/socketAuth.middleware.ts";
import { registerWebRtcHandlers } from "./handlers/webrtc.handler.ts";
import { registerMediaHandlers } from "./handlers/media.handler.ts";
import { registerChatHandlers } from "./handlers/chat.handler.ts";
import { registerCanvasHandlers } from "./handlers/canvas.handler.ts";
import { roomStateManager } from "./state/roomState.manager.ts";
import {
  setSocketServerInstance,
  startRoomExpirationWatcher,
} from "./services/roomSocket.service.ts";

/**
 * Initializes all real-time Socket.io handlers:
 * - WebRTC Multi-Peer Mesh Signaling (Voice & Video)
 * - Media Status Controls (Mic mute, Camera off, Hand raise)
 * - Room Live Chat & Typing Indicators
 * - Connection Lifecycle & Graceful Disconnect Cleanups
 * - Automatic Expiration & Room Termination Supervisor
 */
export const initSocketServer = (io: Server): void => {
  // Store instance for cross-service broadcasts
  setSocketServerInstance(io);

  // Start background room expiration worker (runs every 30 seconds)
  startRoomExpirationWatcher(30000);

  // Handshake authentication
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Register modular feature handlers
    registerWebRtcHandlers(io, socket);
    registerMediaHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerCanvasHandlers(io, socket);

    // Global disconnect handling (network drop, tab close, navigation)
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);

      // Clean up peer from active room state
      const { roomId, removedPeer, remainingPeers } = roomStateManager.removePeer(socket.id);

      if (roomId && removedPeer) {
        const meta = roomStateManager.getRoomMeta(roomId);
        const leavePayload = {
          socketId: socket.id,
          userId: removedPeer.userId,
        };

        // Notify other room participants across all channel aliases
        io.to(roomId).emit("webrtc:peer-left", leavePayload);
        if (meta?.roomCode && meta.roomCode !== roomId) {
          io.to(meta.roomCode).emit("webrtc:peer-left", leavePayload);
        }
        if (meta?.id && meta.id !== roomId) {
          io.to(meta.id).emit("webrtc:peer-left", leavePayload);
        }

        console.log(`[Socket] Notified room ${roomId} of disconnected peer: ${removedPeer.name}. Remaining: ${remainingPeers.length}`);
      }
    });
  });
};

export default initSocketServer;
