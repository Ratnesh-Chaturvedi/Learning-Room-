import type { Server, Socket } from "socket.io";
import prisma from "../../config/db.ts";
import { roomStateManager } from "../state/roomState.manager.ts";
import type {
  JoinRoomPayload,
  KnockDecisionPayload,
  WebRtcOfferPayload,
  WebRtcAnswerPayload,
  WebRtcIceCandidatePayload,
  PeerUser,
  WaitingPeer,
} from "../types/socket.types.ts";

export const registerWebRtcHandlers = (io: Server, socket: Socket) => {
  /**
   * 1. Peer attempts to join a live collaborative room (with Public vs Private Knock support).
   */
  socket.on("webrtc:join-room", async (payload: JoinRoomPayload) => {
    const { roomId, inviteToken, user, initialMediaState } = payload;
    if (!roomId) return;

    const authUser = socket.data?.user;
    const userId = authUser?.id || user?.id || `user-${socket.id.slice(0, 5)}`;
    const name = authUser?.name || user?.name || "Collaborator";
    const avatar = authUser?.avatar || user?.avatar;

    // Check room privacy in cache or database
    let isPrivate = false;
    let isHost = false;
    let isAlreadyParticipant = false;
    let hasValidInvite = false;
    let hostCreatorId: string | null = null;
    let roomRecordId: string = roomId;

    const cachedMeta = roomStateManager.getRoomMeta(roomId);
    if (cachedMeta) {
      roomRecordId = cachedMeta.id;
      hostCreatorId = cachedMeta.creatorId;
      isPrivate = cachedMeta.isPrivate;
      isHost = cachedMeta.creatorId === userId;
      hasValidInvite = Boolean(
        cachedMeta.inviteToken && inviteToken && cachedMeta.inviteToken === inviteToken
      );
    } else {
      try {
        const roomPromise = prisma.room.findFirst({
          where: {
            OR: [{ roomCode: roomId.trim().toUpperCase() }, { id: roomId }],
          },
          include: {
            participants: { select: { id: true } },
          },
        });

        // 1.5s timeout so DB network delay never freezes real-time socket handshake
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const room = await Promise.race([roomPromise, timeoutPromise]);

        if (room) {
          roomRecordId = room.id;
          hostCreatorId = room.creatorId;
          isPrivate = room.isPrivate;
          isHost = room.creatorId === userId;
          isAlreadyParticipant = room.participants.some((p) => p.id === userId);
          hasValidInvite = Boolean(
            room.inviteToken && inviteToken && room.inviteToken === inviteToken
          );

          roomStateManager.setRoomMeta(room.id, {
            id: room.id,
            roomCode: room.roomCode,
            isPrivate: room.isPrivate,
            creatorId: room.creatorId,
            inviteToken: room.inviteToken,
          });
        }
      } catch {
        // Fallback: continue if DB check encounters issue
      }
    }

    // 🔒 PRIVATE ROOM GATEWAY: Knock / Waiting Room logic
    if (isPrivate && !isHost && !isAlreadyParticipant && !hasValidInvite) {
      const waitingPeer: WaitingPeer = {
        socketId: socket.id,
        userId,
        name,
        avatar,
        requestedAt: new Date().toISOString(),
      };

      // Add to waiting queue
      roomStateManager.addWaitingPeer(roomId, waitingPeer);

      // Notify the joining user that they are in the waiting room
      socket.emit("room:waiting", {
        roomId,
        message: "Waiting for the host to let you in...",
        user: waitingPeer,
      });

      // Notify the host(s) in the active room of the knock request
      io.to(roomId).emit("room:knock-request", waitingPeer);

      console.log(`[Knock Queue] ${name} (${socket.id}) is knocking to join private room ${roomId}`);
      return;
    }

    // 🚪 ADMITTED / PUBLIC: Direct Join Flow
    const peer: PeerUser = {
      socketId: socket.id,
      userId,
      name,
      avatar,
      isAudioMuted: initialMediaState?.isAudioMuted ?? false,
      isVideoOff: initialMediaState?.isVideoOff ?? false,
      isHandRaised: false,
      joinedAt: new Date().toISOString(),
    };

    const existingPeers = roomStateManager.getRoomPeers(roomId);
    roomStateManager.addPeer(roomId, peer);
    socket.join(roomId);

    // If room exists in DB, ensure user is registered in participants
    if (authUser?.id || user?.id) {
      prisma.room
        .update({
          where: { id: roomRecordId },
          data: { participants: { connect: { id: userId } } },
        })
        .catch(() => {});
    }

    // Reply to joining peer with list of existing peers
    socket.emit("webrtc:room-peers", {
      self: peer,
      peers: existingPeers,
    });

    // Announce new peer to existing room members
    socket.to(roomId).emit("webrtc:peer-joined", peer);

    // Deliver chat history
    const chatHistory = roomStateManager.getChatHistory(roomId);
    socket.emit("chat:history", chatHistory);

    console.log(`[WebRTC] Peer ${peer.name} (${socket.id}) admitted to room: ${roomId}. Total: ${existingPeers.length + 1}`);
  });

  /**
   * 2. Host Approves a Knock Request from the Waiting Queue.
   */
  socket.on("room:approve-knock", async (payload: KnockDecisionPayload) => {
    const { roomId, targetSocketId } = payload;
    if (!roomId || !targetSocketId) return;

    // Remove from waiting queue
    const waitingPeer = roomStateManager.removeWaitingPeer(roomId, targetSocketId);
    if (!waitingPeer) return;

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (!targetSocket) return;

    // Convert waiting peer into active room peer
    const peer: PeerUser = {
      socketId: waitingPeer.socketId,
      userId: waitingPeer.userId,
      name: waitingPeer.name,
      avatar: waitingPeer.avatar,
      isAudioMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      joinedAt: new Date().toISOString(),
    };

    const existingPeers = roomStateManager.getRoomPeers(roomId);
    roomStateManager.addPeer(roomId, peer);
    targetSocket.join(roomId);

    // Notify approved user that they have been admitted immediately
    targetSocket.emit("room:knock-approved", {
      roomId,
      self: peer,
      peers: existingPeers,
    });

    // Deliver chat history to newly admitted peer
    const chatHistory = roomStateManager.getChatHistory(roomId);
    targetSocket.emit("chat:history", chatHistory);

    // Broadcast new peer to all existing peers
    targetSocket.to(roomId).emit("webrtc:peer-joined", peer);

    // Record in DB participants asynchronously (fire-and-forget, non-blocking)
    if (peer.userId && !peer.userId.startsWith("user-")) {
      prisma.room
        .update({
          where: { id: roomId },
          data: { participants: { connect: { id: peer.userId } } },
        })
        .catch(() => {});
    }

    console.log(`[Knock Queue] Host approved ${peer.name} (${targetSocketId}) into room ${roomId}`);
  });

  /**
   * 3. Host Denies a Knock Request from the Waiting Queue.
   */
  socket.on("room:deny-knock", (payload: KnockDecisionPayload) => {
    const { roomId, targetSocketId } = payload;
    if (!roomId || !targetSocketId) return;

    const removed = roomStateManager.removeWaitingPeer(roomId, targetSocketId);
    const targetSocket = io.sockets.sockets.get(targetSocketId);

    if (targetSocket) {
      targetSocket.emit("room:knock-denied", {
        roomId,
        message: "The host has denied your request to join this meeting.",
      });
    }

    console.log(`[Knock Queue] Host denied ${removed?.name || targetSocketId} from room ${roomId}`);
  });

  /**
   * 4. Host fetches the list of users currently in the waiting queue.
   */
  socket.on("room:get-waiting-queue", (payload: { roomId: string }) => {
    if (!payload.roomId) return;
    const queue = roomStateManager.getWaitingPeers(payload.roomId);
    socket.emit("room:waiting-queue", { roomId: payload.roomId, queue });
  });

  /**
   * 5. Relay WebRTC SDP Offer to specific target peer.
   */
  socket.on("webrtc:offer", (payload: WebRtcOfferPayload) => {
    const { targetSocketId, sdp } = payload;
    if (!targetSocketId || !sdp) return;

    const roomId = roomStateManager.getRoomIdBySocketId(socket.id);
    const callerPeer = roomId ? roomStateManager.getPeer(roomId, socket.id) : null;

    io.to(targetSocketId).emit("webrtc:offer", {
      callerSocketId: socket.id,
      sdp,
      caller: callerPeer,
    });
  });

  /**
   * 6. Relay WebRTC SDP Answer back to caller peer.
   */
  socket.on("webrtc:answer", (payload: WebRtcAnswerPayload) => {
    const { targetSocketId, sdp } = payload;
    if (!targetSocketId || !sdp) return;

    io.to(targetSocketId).emit("webrtc:answer", {
      responderSocketId: socket.id,
      sdp,
    });
  });

  /**
   * 7. Relay ICE Candidate for NAT / firewall traversal.
   */
  socket.on("webrtc:ice-candidate", (payload: WebRtcIceCandidatePayload) => {
    const { targetSocketId, candidate } = payload;
    if (!targetSocketId || !candidate) return;

    io.to(targetSocketId).emit("webrtc:ice-candidate", {
      senderSocketId: socket.id,
      candidate,
    });
  });

  /**
   * 8. Explicitly leaves the room.
   */
  socket.on("webrtc:leave-room", () => {
    const { roomId, removedPeer, wasWaiting } = roomStateManager.removePeer(socket.id);
    if (roomId) {
      socket.leave(roomId);
      if (!wasWaiting && removedPeer) {
        io.to(roomId).emit("webrtc:peer-left", {
          socketId: socket.id,
          userId: removedPeer.userId,
        });
      }
    }
  });
};

export default registerWebRtcHandlers;
