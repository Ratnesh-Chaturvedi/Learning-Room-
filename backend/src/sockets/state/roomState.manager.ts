import type { PeerUser, WaitingPeer, ChatMessage, RoomMeta } from "../types/socket.types.ts";

/**
 * Scalable in-memory state manager for live room peer connections, media status,
 * private waiting rooms (knock queue), and ephemeral chat.
 */
class RoomStateManager {
  // Map of canonicalRoomId -> Map of socketId -> PeerUser (admitted active peers)
  private rooms: Map<string, Map<string, PeerUser>> = new Map();

  // Map of canonicalRoomId -> Map of socketId -> WaitingPeer (waiting room knock queue)
  private waitingRooms: Map<string, Map<string, WaitingPeer>> = new Map();

  // Reverse index: socketId -> canonicalRoomId for O(1) disconnect cleanup
  private socketToRoom: Map<string, string> = new Map();

  // Ephemeral room chat history: canonicalRoomId -> ChatMessage[] (kept up to 100 per room)
  private chatHistories: Map<string, ChatMessage[]> = new Map();

  // In-memory real-time canvas state per room: canonicalRoomId -> elements array
  private canvasScenes: Map<string, unknown[]> = new Map();

  // In-memory real-time canvas binary files per room (photos/images): canonicalRoomId -> Record<fileId, BinaryFileData>
  private canvasFiles: Map<string, Record<string, unknown>> = new Map();

  // Cache of room access & privacy metadata for fast in-memory routing
  private roomMetaCache: Map<string, RoomMeta> = new Map();

  // Set of permanently ended room IDs and codes
  private endedRooms: Set<string> = new Set();

  // Map of canonicalRoomId -> Set of kicked/banned user identifiers (userId or socketId)
  private bannedUsers: Map<string, Set<string>> = new Map();

  /**
   * Sets room metadata into in-memory cache.
   */
  public setRoomMeta(key: string, meta: RoomMeta): void {
    if (!key) return;
    this.roomMetaCache.set(key, meta);
    if (meta.id) this.roomMetaCache.set(meta.id, meta);
    if (meta.roomCode) {
      this.roomMetaCache.set(meta.roomCode, meta);
      this.roomMetaCache.set(meta.roomCode.toUpperCase(), meta);

      // Merge and bridge states if room was joined using roomCode before meta was resolved
      const codeKey = meta.roomCode.toUpperCase();
      if (meta.id && meta.id !== codeKey) {
        // Bridge active peers
        const codePeers = this.rooms.get(codeKey);
        if (codePeers) {
          const idPeers = this.rooms.get(meta.id) || new Map();
          codePeers.forEach((p, sId) => {
            idPeers.set(sId, p);
            this.socketToRoom.set(sId, meta.id);
          });
          this.rooms.set(meta.id, idPeers);
          this.rooms.set(codeKey, idPeers);
        }

        // Bridge waiting peers
        const codeWaiting = this.waitingRooms.get(codeKey);
        if (codeWaiting) {
          const idWaiting = this.waitingRooms.get(meta.id) || new Map();
          codeWaiting.forEach((wp, sId) => idWaiting.set(sId, wp));
          this.waitingRooms.set(meta.id, idWaiting);
          this.waitingRooms.set(codeKey, idWaiting);
        }

        // Bridge chat history
        const codeChat = this.chatHistories.get(codeKey);
        if (codeChat) {
          const idChat = this.chatHistories.get(meta.id) || [];
          this.chatHistories.set(meta.id, [...idChat, ...codeChat]);
          this.chatHistories.set(codeKey, this.chatHistories.get(meta.id)!);
        }

        // Bridge canvas scene
        const codeCanvas = this.canvasScenes.get(codeKey);
        if (codeCanvas && !this.canvasScenes.has(meta.id)) {
          this.canvasScenes.set(meta.id, codeCanvas);
          this.canvasScenes.set(codeKey, codeCanvas);
        }

        // Bridge canvas binary files
        const codeFiles = this.canvasFiles.get(codeKey);
        if (codeFiles) {
          const idFiles = this.canvasFiles.get(meta.id) || {};
          const mergedFiles = { ...idFiles, ...codeFiles };
          this.canvasFiles.set(meta.id, mergedFiles);
          this.canvasFiles.set(codeKey, mergedFiles);
        }
      }
    }
  }

  /**
   * Gets cached room metadata.
   */
  public getRoomMeta(roomIdOrCode: string): RoomMeta | undefined {
    if (!roomIdOrCode) return undefined;
    const clean = roomIdOrCode.trim();
    return (
      this.roomMetaCache.get(clean) ||
      this.roomMetaCache.get(clean.toUpperCase())
    );
  }

  /**
   * Resolves a room UUID or code to the canonical room ID.
   */
  public getCanonicalKey(roomIdOrCode: string): string {
    if (!roomIdOrCode) return roomIdOrCode;
    const clean = roomIdOrCode.trim();
    const meta = this.getRoomMeta(clean);
    return meta?.id || clean.toUpperCase();
  }

  /**
   * Marks a room as ended in cache and cleans up all active peers and waiting queues.
   */
  public markRoomEnded(roomIdOrCode: string): void {
    if (!roomIdOrCode) return;
    const cleanKey = roomIdOrCode.trim();
    this.endedRooms.add(cleanKey);
    this.endedRooms.add(cleanKey.toUpperCase());

    const meta = this.getRoomMeta(roomIdOrCode);
    if (meta) {
      meta.status = "ENDED";
      this.setRoomMeta(meta.id, meta);
      if (meta.roomCode) this.setRoomMeta(meta.roomCode, meta);
      if (meta.id) {
        this.endedRooms.add(meta.id);
        this.endedRooms.add(meta.id.toUpperCase());
      }
    } else {
      this.roomMetaCache.set(cleanKey, {
        id: cleanKey,
        roomCode: cleanKey.toUpperCase(),
        isPrivate: false,
        status: "ENDED",
      });
      this.roomMetaCache.set(cleanKey.toUpperCase(), {
        id: cleanKey,
        roomCode: cleanKey.toUpperCase(),
        isPrivate: false,
        status: "ENDED",
      });
    }

    const canonicalKey = meta?.id || cleanKey;

    this.rooms.delete(cleanKey);
    this.waitingRooms.delete(cleanKey);
    this.rooms.delete(cleanKey.toUpperCase());
    this.waitingRooms.delete(cleanKey.toUpperCase());
    this.rooms.delete(canonicalKey);
    this.waitingRooms.delete(canonicalKey);

    if (meta?.roomCode) {
      this.rooms.delete(meta.roomCode);
      this.rooms.delete(meta.roomCode.toUpperCase());
      this.waitingRooms.delete(meta.roomCode);
      this.waitingRooms.delete(meta.roomCode.toUpperCase());
    }
  }

  /**
   * Checks whether a room has already been terminated.
   */
  public isRoomEnded(roomIdOrCode: string): boolean {
    if (!roomIdOrCode) return false;
    const cleanKey = roomIdOrCode.trim();
    if (this.endedRooms.has(cleanKey) || this.endedRooms.has(cleanKey.toUpperCase())) {
      return true;
    }
    const meta = this.getRoomMeta(cleanKey);
    return meta?.status === "ENDED";
  }

  /**
   * Adds or updates an active peer inside a room.
   */
  public addPeer(roomId: string, peer: PeerUser): PeerUser[] {
    const key = this.getCanonicalKey(roomId);
    const meta = this.getRoomMeta(roomId);
    const altKey = meta?.roomCode ? meta.roomCode.toUpperCase() : undefined;

    // If peer was in waiting room, remove from waiting
    this.removeWaitingPeer(key, peer.socketId);
    if (altKey && altKey !== key) {
      this.removeWaitingPeer(altKey, peer.socketId);
    }

    if (!this.rooms.has(key)) {
      this.rooms.set(key, new Map());
    }

    const roomPeers = this.rooms.get(key)!;

    // Clean up any stale/ghost sockets for the same registered user ID (e.g. from page refresh or reconnect)
    if (peer.userId && !peer.userId.startsWith('guest-') && !peer.userId.startsWith('user-')) {
      for (const [existingSocketId, existingPeer] of roomPeers.entries()) {
        if (existingPeer.userId === peer.userId && existingSocketId !== peer.socketId) {
          roomPeers.delete(existingSocketId);
          this.socketToRoom.delete(existingSocketId);
        }
      }
    }

    roomPeers.set(peer.socketId, peer);
    this.socketToRoom.set(peer.socketId, key);

    // Keep alternative room alias maps in sync as identical reference
    if (altKey && altKey !== key) {
      this.rooms.set(altKey, roomPeers);
    }
    if (meta?.id && meta.id !== key) {
      this.rooms.set(meta.id, roomPeers);
    }

    return Array.from(roomPeers.values());
  }

  /**
   * Helper to retrieve the active peers map for a canonical room ID or alias.
   */
  private getPeersMap(roomId: string): Map<string, PeerUser> | undefined {
    const key = this.getCanonicalKey(roomId);
    let map = this.rooms.get(key);
    if (!map) {
      const meta = this.getRoomMeta(roomId);
      if (meta?.id && this.rooms.has(meta.id)) {
        map = this.rooms.get(meta.id);
      } else if (meta?.roomCode && this.rooms.has(meta.roomCode.toUpperCase())) {
        map = this.rooms.get(meta.roomCode.toUpperCase());
      }
    }
    return map;
  }

  /**
   * Resolves canonical keys and all channel aliases for multi-room event broadcasts.
   */
  public getRoomChannels(roomId?: string, socket?: { id: string; data?: { canonicalId?: string; canonicalCode?: string } }): {
    canonicalId: string;
    canonicalCode?: string;
    targetRooms: string[];
  } {
    const raw = roomId || (socket ? this.socketToRoom.get(socket.id) : undefined) || "";
    const canonicalId = (socket?.data?.canonicalId as string) || this.getCanonicalKey(raw);
    const meta = this.getRoomMeta(canonicalId);
    const canonicalCode = (socket?.data?.canonicalCode as string) || meta?.roomCode;
    const targetRooms = Array.from(
      new Set(
        [
          canonicalId,
          canonicalCode,
          canonicalCode?.toUpperCase(),
          raw,
          raw.trim().toUpperCase(),
          socket?.data?.canonicalId,
          socket?.data?.canonicalCode,
        ].filter(Boolean) as string[]
      )
    );
    return { canonicalId, canonicalCode, targetRooms };
  }

  /**
   * Gets a specific active peer in a room.
   */
  public getPeer(roomId: string, socketId: string): PeerUser | undefined {
    let peer = this.getPeersMap(roomId)?.get(socketId);
    if (!peer) {
      const fallbackRoom = this.socketToRoom.get(socketId);
      if (fallbackRoom) peer = this.rooms.get(fallbackRoom)?.get(socketId);
    }
    return peer;
  }

  /**
   * Gets all active peers in a room.
   */
  public getRoomPeers(roomId: string): PeerUser[] {
    const peers = this.getPeersMap(roomId);
    return peers ? Array.from(peers.values()) : [];
  }

  /**
   * Updates audio, video, hand-raise, or screen share media flags of an active peer.
   */
  public updatePeerMedia(
    roomId: string,
    socketId: string,
    updates: Partial<Pick<PeerUser, "isAudioMuted" | "isVideoOff" | "isHandRaised" | "isScreenSharing">>
  ): PeerUser | null {
    const peer = this.getPeer(roomId, socketId);
    if (!peer) return null;
    Object.assign(peer, updates);
    return peer;
  }

  /**
   * Adds a user to the private room waiting queue (knock queue).
   */
  public addWaitingPeer(roomId: string, peer: WaitingPeer): void {
    const key = this.getCanonicalKey(roomId);
    if (!this.waitingRooms.has(key)) {
      this.waitingRooms.set(key, new Map());
    }
    this.waitingRooms.get(key)!.set(peer.socketId, peer);
    this.socketToRoom.set(peer.socketId, key);
  }

  /**
   * Removes a user from the waiting queue.
   */
  public removeWaitingPeer(roomId: string, socketId: string): WaitingPeer | null {
    const key = this.getCanonicalKey(roomId);
    const waiting = this.waitingRooms.get(key);
    if (!waiting) return null;

    const peer = waiting.get(socketId) || null;
    waiting.delete(socketId);

    if (waiting.size === 0) {
      this.waitingRooms.delete(key);
    }

    return peer;
  }

  /**
   * Retrieves all users currently waiting in the knock queue for host approval.
   */
  public getWaitingPeers(roomId: string): WaitingPeer[] {
    const key = this.getCanonicalKey(roomId);
    const waiting = this.waitingRooms.get(key);
    if (!waiting) return [];
    return Array.from(waiting.values());
  }

  /**
   * Checks if a socket is in the waiting queue.
   */
  public isWaiting(roomId: string, socketId: string): boolean {
    const key = this.getCanonicalKey(roomId);
    return Boolean(this.waitingRooms.get(key)?.has(socketId));
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
    const key = this.getCanonicalKey(roomId);
    if (!this.chatHistories.has(key)) {
      this.chatHistories.set(key, []);
    }

    const history = this.chatHistories.get(key)!;
    history.push(message);

    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Returns recent chat messages for a room.
   */
  public getChatHistory(roomId: string): ChatMessage[] {
    const key = this.getCanonicalKey(roomId);
    return this.chatHistories.get(key) || [];
  }

  /**
   * Stores the latest Excalidraw canvas scene elements and optional binary files for a room.
   */
  public setCanvasScene(roomId: string, elements: unknown[], files?: Record<string, unknown>): void {
    const key = this.getCanonicalKey(roomId);
    this.canvasScenes.set(key, elements);
    if (files && typeof files === "object" && Object.keys(files).length > 0) {
      const existing = this.canvasFiles.get(key) || {};
      this.canvasFiles.set(key, { ...existing, ...files });
    }
  }

  /**
   * Retrieves the current Excalidraw canvas scene elements for a room.
   */
  public getCanvasScene(roomId: string): unknown[] {
    const key = this.getCanonicalKey(roomId);
    return this.canvasScenes.get(key) || [];
  }

  /**
   * Retrieves the current Excalidraw canvas binary files for a room.
   */
  public getCanvasFiles(roomId: string): Record<string, unknown> {
    const key = this.getCanonicalKey(roomId);
    return this.canvasFiles.get(key) || {};
  }

  /**
   * Records a banned/kicked user for a room to prevent them from rejoining.
   */
  public banUser(roomId: string, userIdentifier: string): void {
    if (!roomId || !userIdentifier) return;
    const canonicalKey = this.getCanonicalKey(roomId);
    if (!this.bannedUsers.has(canonicalKey)) {
      this.bannedUsers.set(canonicalKey, new Set());
    }
    this.bannedUsers.get(canonicalKey)!.add(userIdentifier);
    const meta = this.getRoomMeta(roomId);
    if (meta?.roomCode) {
      const codeKey = meta.roomCode.toUpperCase();
      if (!this.bannedUsers.has(codeKey)) {
        this.bannedUsers.set(codeKey, new Set());
      }
      this.bannedUsers.get(codeKey)!.add(userIdentifier);
    }
  }

  /**
   * Checks whether a user has been kicked from a room.
   */
  public isUserBanned(roomId: string, userId?: string, socketId?: string): boolean {
    if (!roomId) return false;
    const canonicalKey = this.getCanonicalKey(roomId);
    const banned = this.bannedUsers.get(canonicalKey);
    if (banned) {
      if (userId && banned.has(userId)) return true;
      if (socketId && banned.has(socketId)) return true;
    }
    const meta = this.getRoomMeta(roomId);
    if (meta?.roomCode) {
      const codeBanned = this.bannedUsers.get(meta.roomCode.toUpperCase());
      if (codeBanned) {
        if (userId && codeBanned.has(userId)) return true;
        if (socketId && codeBanned.has(socketId)) return true;
      }
    }
    return false;
  }
}

export const roomStateManager = new RoomStateManager();
export default roomStateManager;
