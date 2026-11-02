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

    // Persist current scene elements in room memory
    roomStateManager.setCanvasScene(roomId, elements);

    // Relay to other peers in the room (prevent echo to sender)
    socket.to(roomId).emit("canvas:update", {
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

    const elements = roomStateManager.getCanvasScene(roomId);
    socket.emit("canvas:init", { elements });
  });

  /**
   * 3. Broadcasts collaborator live pointer coordinates and cursor labels.
   */
  socket.on("canvas:pointer", (payload: CanvasPointerPayload) => {
    const { roomId, pointer, collaborator, button } = payload;
    if (!roomId || !pointer) return;

    socket.to(roomId).emit("canvas:pointer", {
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

