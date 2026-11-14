import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";

export interface CanvasUpdatePayload {
  roomId: string;
  elements: unknown[];
  files?: Record<string, unknown>;
  appState?: Record<string, unknown>;
}

export interface CanvasPointerPayload {
  roomId: string;
  pointer: { x: number; y: number };
  button?: "down" | "up";
  collaborator: {
    id: string;
    name: string;
    color?: string;
  };
}

export const registerCanvasHandlers = (_io: Server, socket: Socket) => {
  /**
   * 1. Broadcasts real-time canvas drawings, images, and scene modifications to peers.
   */
  socket.on("canvas:update", (payload: CanvasUpdatePayload) => {
    const { roomId, elements, files } = payload;
    if (!roomId || !Array.isArray(elements)) return;

    const { canonicalId, canonicalCode, targetRooms } = roomStateManager.getRoomChannels(roomId, socket);
    const userId = socket.data?.userId || socket.data?.user?.id;

    // Security Gate: Reject updates from kicked/banned users immediately
    if (roomStateManager.isUserBanned(canonicalId, userId, socket.id)) {
      socket.emit("room:kicked", {
        roomId: canonicalCode || canonicalId,
        reason: "You were removed from this meeting by the host.",
      });
      socket.disconnect(true);
      return;
    }

    // Persist current scene elements and binary image files in room memory under canonical ID and code
    roomStateManager.setCanvasScene(canonicalId, elements, files);
    if (canonicalCode && canonicalCode !== canonicalId) {
      roomStateManager.setCanvasScene(canonicalCode, elements, files);
    }

    // Relay to other peers across all channel aliases (prevent echo to sender)
    socket.to(targetRooms).emit("canvas:update", {
      elements,
      files: files || {},
      senderSocketId: socket.id,
    });
  });

  /**
   * 2. Delivers initial canvas scene and binary files (photos/images) to newly joined peer.
   */
  socket.on("canvas:get-init", (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (!roomId) return;

    const { canonicalId, canonicalCode } = roomStateManager.getRoomChannels(roomId, socket);

    let elements = roomStateManager.getCanvasScene(canonicalId);
    let files = roomStateManager.getCanvasFiles(canonicalId);
    if ((!elements || elements.length === 0) && canonicalCode) {
      elements = roomStateManager.getCanvasScene(canonicalCode);
      files = roomStateManager.getCanvasFiles(canonicalCode);
    }
    socket.emit("canvas:init", {
      elements: elements || [],
      files: files || {},
    });
  });

  /**
   * 3. Broadcasts collaborator live pointer coordinates and cursor labels.
   */
  socket.on("canvas:pointer", (payload: CanvasPointerPayload) => {
    const { roomId, pointer, collaborator, button } = payload;
    if (!roomId || !pointer) return;

    const { canonicalId, canonicalCode, targetRooms } = roomStateManager.getRoomChannels(roomId, socket);
    const userId = socket.data?.userId || socket.data?.user?.id;

    // Security Gate: Reject pointer updates from kicked/banned users immediately
    if (roomStateManager.isUserBanned(canonicalId, userId, socket.id)) {
      socket.emit("room:kicked", {
        roomId: canonicalCode || canonicalId,
        reason: "You were removed from this meeting by the host.",
      });
      socket.disconnect(true);
      return;
    }

    socket.to(targetRooms).emit("canvas:pointer", {
      collaborator: {
        ...collaborator,
        pointer,
        button,
      },
      senderSocketId: socket.id,
    });
  });
};

export default registerCanvasHandlers;
