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

export const registerCanvasHandlers = (_io: Server, socket: Socket) => {
  /**
   * 1. Broadcasts real-time canvas drawings / scene modifications to peers.
   */
  socket.on("canvas:update", (payload: CanvasUpdatePayload) => {
    const { roomId, elements } = payload;
    if (!roomId || !Array.isArray(elements)) return;

    const { canonicalId, canonicalCode, targetRooms } = roomStateManager.getRoomChannels(roomId, socket);

    // Persist current scene elements in room memory under canonical ID and code
    roomStateManager.setCanvasScene(canonicalId, elements);
    if (canonicalCode && canonicalCode !== canonicalId) {
      roomStateManager.setCanvasScene(canonicalCode, elements);
    }

    // Relay to other peers across all channel aliases (prevent echo to sender)
    socket.to(targetRooms).emit("canvas:update", {
      elements,
      senderSocketId: socket.id,
    });
  });

  /**
   * 2. Delivers initial canvas scene to newly joined peer.
   */
  socket.on("canvas:get-init", (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (!roomId) return;

    const { canonicalId, canonicalCode } = roomStateManager.getRoomChannels(roomId, socket);

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

    const { targetRooms } = roomStateManager.getRoomChannels(roomId, socket);

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
