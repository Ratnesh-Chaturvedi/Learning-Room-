import type { Server, Socket } from "socket.io";
import { roomStateManager } from "../state/roomState.manager.ts";

export interface CanvasUpdatePayload {
  roomId: string;
  elements: unknown[];
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

export const registerCanvasHandlers = (io: Server, socket: Socket) => {
  /**
   * 1. Broadcasts real-time canvas drawings / scene modifications to peers.
   */
  socket.on("canvas:update", (payload: CanvasUpdatePayload) => {
    const { roomId, elements } = payload;
    if (!roomId || !Array.isArray(elements)) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    // Persist current scene elements in room memory under canonical ID and code
    roomStateManager.setCanvasScene(canonicalId, elements);
    if (canonicalCode && canonicalCode !== canonicalId) {
      roomStateManager.setCanvasScene(canonicalCode, elements);
    }

    const updatePayload = {
      elements,
      senderSocketId: socket.id,
    };

    // Relay to other peers across all channel aliases (prevent echo to sender, deduplicated)
    const targetRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    socket.to(targetRooms).emit("canvas:update", updatePayload);
  });

  /**
   * 2. Delivers initial canvas scene to newly joined peer.
   */
  socket.on("canvas:get-init", (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (!roomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    let elements = roomStateManager.getCanvasScene(canonicalId);
    if ((!elements || elements.length === 0) && canonicalCode) {
      elements = roomStateManager.getCanvasScene(canonicalCode);
    }
    socket.emit("canvas:init", { elements: elements || [] });
  });

  /**
   * 3. Broadcasts collaborator live pointer coordinates and cursor labels.
   */
  socket.on("canvas:pointer", (payload: CanvasPointerPayload) => {
    const { roomId, pointer, collaborator, button } = payload;
    if (!roomId || !pointer) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode;

    const pointerPayload = {
      collaborator: {
        ...collaborator,
        pointer,
        button,
      },
      senderSocketId: socket.id,
    };

    const targetRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    socket.to(targetRooms).emit("canvas:pointer", pointerPayload);
  });
};

export default registerCanvasHandlers;
