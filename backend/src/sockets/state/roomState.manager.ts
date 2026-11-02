import type { PeerUser, WaitingPeer, ChatMessage, RoomMeta } from "../types/socket.types.ts";

/**
 * Scalable in-memory state manager for live room peer connections, media status,
 * private waiting rooms (knock queue), and ephemeral chat.
 */
class RoomStateManager {
  // Map of roomId -> Map of socketId -> PeerUser (admitted active peers)
  private rooms: Map<string, Map<string, PeerUser>> = new Map();

  // Map of roomId -> Map of socketId -> WaitingPeer (waiting room knock queue)
  private waitingRooms: Map<string, Map<string, WaitingPeer>> = new Map();

  // Reverse index: socketId -> roomId for O(1) disconnect cleanup
  private socketToRoom: Map<string, string> = new Map();

  // Ephemeral room chat history: roomId -> ChatMessage[] (kept up to 100 per room)
  private chatHistories: Map<string, ChatMessage[]> = new Map();

  // In-memory real-time canvas state per room: roomId -> elements array
  private canvasScenes: Map<string, unknown[]> = new Map();

  // Cache of room access & privacy metadata for fast in-memory routing
  private roomMetaCache: Map<string, RoomMeta> = new Map();

  /**
   * Sets room metadata into in-memory cache.
   */
  public setRoomMeta(key: string, meta: RoomMeta): void {
    this.roomMetaCache.set(key, meta);
    if (meta.id) this.roomMetaCache.set(meta.id, meta);
    if (meta.roomCode) this.roomMetaCache.set(meta.roomCode.toUpperCase(), meta);
  }

  /**
   * Gets cached room metadata.
   */
  public getRoomMeta(roomIdOrCode: string): RoomMeta | undefined {
    return (
      this.roomMetaCache.get(roomIdOrCode) ||
      this.roomMetaCache.get(roomIdOrCode.toUpperCase())
    );
  }

  /**
   * Adds or updates an active peer inside a room.
   */
  public addPeer(roomId: string, peer: PeerUser): PeerUser[] {
    // If peer was in waiting room, remove from waiting
    this.removeWaitingPeer(roomId, peer.socketId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const roomPeers = this.rooms.get(roomId)!;
    roomPeers.set(peer.socketId, peer);
    this.socketToRoom.set(peer.socketId, roomId);

    return Array.from(roomPeers.values());
  }

  /**
   * Gets a specific active peer in a room.
   */
  public getPeer(roomId: string, socketId: string): PeerUser | undefined {
    return this.rooms.get(roomId)?.get(socketId);
  }

  /**
   * Gets all active peers in a room.
   */
  public getRoomPeers(roomId: string): PeerUser[] {
    const roomPeers = this.rooms.get(roomId);
    if (!roomPeers) return [];
    return Array.from(roomPeers.values());
  }

  /**
   * Updates audio, video, or hand-raise media flags of an active peer.
   */
  public updatePeerMedia(
    roomId: string,
    socketId: string,
    updates: Partial<Pick<PeerUser, "isAudioMuted" | "isVideoOff" | "isHandRaised">>
  ): PeerUser | null {
    const peer = this.rooms.get(roomId)?.get(socketId);
    if (!peer) return null;

    if (updates.isAudioMuted !== undefined) peer.isAudioMuted = updates.isAudioMuted;
    if (updates.isVideoOff !== undefined) peer.isVideoOff = updates.isVideoOff;
    if (updates.isHandRaised !== undefined) peer.isHandRaised = updates.isHandRaised;

    return peer;
  }

  /**
   * Adds a user to the private room waiting queue (knock queue).
   */
  public addWaitingPeer(roomId: string, peer: WaitingPeer): void {
    if (!this.waitingRooms.has(roomId)) {
      this.waitingRooms.set(roomId, new Map());
    }
    this.waitingRooms.get(roomId)!.set(peer.socketId, peer);
    this.socketToRoom.set(peer.socketId, roomId);
  }

  /**
   * Removes a user from the waiting queue.
   */
  public removeWaitingPeer(roomId: string, socketId: string): WaitingPeer | null {
    const waiting = this.waitingRooms.get(roomId);
    if (!waiting) return null;

    const peer = waiting.get(socketId) || null;
    waiting.delete(socketId);

    if (waiting.size === 0) {
      this.waitingRooms.delete(roomId);
    }

    return peer;
  }

  /**
   * Retrieves all users currently waiting in the knock queue for host approval.
   */
  public getWaitingPeers(roomId: string): WaitingPeer[] {
    const waiting = this.waitingRooms.get(roomId);
    if (!waiting) return [];
    return Array.from(waiting.values());
  }

  /**
   * Checks if a socket is in the waiting queue.
   */
  public isWaiting(roomId: string, socketId: string): boolean {
    return Boolean(this.waitingRooms.get(roomId)?.has(socketId));
  }

  /**
   * Removes a peer on disconnect or leave (cleans up active and waiting queues).
   */
  public removePeer(socketId: string): {
    roomId: string | null;
    removedPeer: PeerUser | null;
    wasWaiting: boolean;
    remainingPeers: PeerUser[];
  } {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) {
      return { roomId: null, removedPeer: null, wasWaiting: false, remainingPeers: [] };
    }

    this.socketToRoom.delete(socketId);

    // Clean up from waiting queue if present
    const waitingRemoved = this.removeWaitingPeer(roomId, socketId);
    if (waitingRemoved) {
      return { roomId, removedPeer: null, wasWaiting: true, remainingPeers: this.getRoomPeers(roomId) };
    }

    // Clean up from active room
    const roomPeers = this.rooms.get(roomId);
    if (!roomPeers) {
      return { roomId, removedPeer: null, wasWaiting: false, remainingPeers: [] };
    }

    const removedPeer = roomPeers.get(socketId) || null;
    roomPeers.delete(socketId);

    if (roomPeers.size === 0) {
      this.rooms.delete(roomId);
    }

    const remainingPeers = roomPeers ? Array.from(roomPeers.values()) : [];
    return { roomId, removedPeer, wasWaiting: false, remainingPeers };
  }

  /**
   * Returns the roomId associated with a socket.
   */
  public getRoomIdBySocketId(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  /**
   * Stores a chat message in memory for current room participants.
   */
  public addChatMessage(roomId: string, message: ChatMessage): void {
    if (!this.chatHistories.has(roomId)) {
      this.chatHistories.set(roomId, []);
    }

    const history = this.chatHistories.get(roomId)!;
    history.push(message);

    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Returns recent chat messages for a room.
   */
  public getChatHistory(roomId: string): ChatMessage[] {
    return this.chatHistories.get(roomId) || [];
  }

  /**
   * Stores the latest Excalidraw canvas scene elements for a room.
   */
  public setCanvasScene(roomId: string, elements: unknown[]): void {
    this.canvasScenes.set(roomId, elements);
  }

  /**
   * Retrieves the current Excalidraw canvas scene elements for a room.
   */
  public getCanvasScene(roomId: string): unknown[] {
    return this.canvasScenes.get(roomId) || [];
  }
}

export const roomStateManager = new RoomStateManager();
export default roomStateManager;
