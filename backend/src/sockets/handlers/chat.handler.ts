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

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const authUser = socket.data?.user;
    const peer = roomStateManager.getPeer(canonicalId, socket.id);

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      roomId: canonicalId,
      sender: {
        id: authUser?.id || peer?.userId || socket.id,
        name: authUser?.name || peer?.name || "Collaborator",
        avatar: authUser?.avatar || peer?.avatar,
      },
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Store in ephemeral memory history under canonical room key
    roomStateManager.addChatMessage(canonicalId, message);

    // Broadcast across all room channel aliases (deduplicated)
    const targetRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    io.to(targetRooms).emit("chat:new-message", message);
  });

  /**
   * Broadcasts live typing indicator to others in the room.
   */
  socket.on("chat:typing", (payload: { roomId: string; isTyping: boolean }) => {
    const { roomId, isTyping } = payload;
    if (!roomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const peer = roomStateManager.getPeer(canonicalId, socket.id);
    const typingPayload = {
      socketId: socket.id,
      userId: peer?.userId || socket.id,
      name: peer?.name || "Someone",
      isTyping,
    };

    const targetRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    socket.to(targetRooms).emit("chat:user-typing", typingPayload);
  });

  /**
   * Broadcasts floating emoji reaction animations across collaborator screens.
   */
  socket.on("chat:reaction", (payload: EmojiReactionPayload) => {
    const { roomId, emoji, startX } = payload;
    if (!roomId || !emoji) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const peer = roomStateManager.getPeer(canonicalId, socket.id);
    const reactionPayload = {
      id: crypto.randomUUID(),
      emoji,
      senderName: peer?.name || "Collaborator",
      startX: startX || Math.floor(40 + Math.random() * 20),
    };

    const targetRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    io.to(targetRooms).emit("chat:emoji-reaction", reactionPayload);
  });
};

export default registerChatHandlers;
