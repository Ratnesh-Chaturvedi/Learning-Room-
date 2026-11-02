import crypto from "node:crypto";
import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";
import type {
  SendChatMessagePayload,
  ChatMessage,
  EmojiReactionPayload,
} from "../types/socket.types.ts";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  /**
   * Broadcasts real-time chat messages to all peers in the room.
   */
  socket.on("chat:send-message", (payload: SendChatMessagePayload) => {
    const { roomId, text } = payload;
    if (!roomId || !text || !text.trim()) return;

    const authUser = socket.data?.user;
    const peer = roomStateManager.getPeer(roomId, socket.id);

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      roomId,
      sender: {
        id: authUser?.id || peer?.userId || socket.id,
        name: authUser?.name || peer?.name || "Collaborator",
        avatar: authUser?.avatar || peer?.avatar,
      },
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Store in ephemeral memory history
    roomStateManager.addChatMessage(roomId, message);

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("chat:new-message", message);
  });

  /**
   * Broadcasts live typing indicator to others in the room.
   */
  socket.on("chat:typing", (payload: { roomId: string; isTyping: boolean }) => {
    const { roomId, isTyping } = payload;
    if (!roomId) return;

    const peer = roomStateManager.getPeer(roomId, socket.id);

    socket.to(roomId).emit("chat:user-typing", {
      socketId: socket.id,
      userId: peer?.userId || socket.id,
      name: peer?.name || "Someone",
      isTyping,
    });
  });

  /**
   * Broadcasts floating emoji reaction animations across collaborator screens.
   */
  socket.on("chat:reaction", (payload: EmojiReactionPayload) => {
    const { roomId, emoji, startX } = payload;
    if (!roomId || !emoji) return;

    const peer = roomStateManager.getPeer(roomId, socket.id);

    io.to(roomId).emit("chat:emoji-reaction", {
      id: crypto.randomUUID(),
      emoji,
      senderName: peer?.name || "Collaborator",
      startX: startX || Math.floor(40 + Math.random() * 20),
    });
  });
};

export default registerChatHandlers;

