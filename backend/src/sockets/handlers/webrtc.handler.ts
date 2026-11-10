import type { Server, Socket } from "socket.io";
import prisma from "../../config/db.ts";
import { roomStateManager } from "../state/roomState.manager.ts";
import { broadcastRoomUpdated } from "../services/roomSocket.service.ts";
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

    // 1. Check if room is ended in cache or ended registry
    if (roomStateManager.isRoomEnded(roomId)) {
      socket.emit("room:terminated", {
        roomId,
        reason: "This room session has already been ended by the host.",
      });
      return;
    }

    const cachedMeta = roomStateManager.getRoomMeta(roomId);

    // Check room privacy in cache or database
    let isPrivate = false;
    let isHost = false;
    let isAlreadyParticipant = false;
    let hasValidInvite = false;
    let roomFoundInDb = false;
    let hostCreatorId: string | null = null;
    let canonicalId: string = cachedMeta?.id || roomId.trim();
    let canonicalCode: string = cachedMeta?.roomCode || roomId.trim().toUpperCase();

    if (cachedMeta) {
      hostCreatorId = cachedMeta.creatorId || null;
      isPrivate = cachedMeta.isPrivate;
      isHost = cachedMeta.creatorId === userId;
      hasValidInvite = Boolean(
        cachedMeta.inviteToken && inviteToken && cachedMeta.inviteToken === inviteToken
      );

      // Intercept scheduled room if start time has not arrived yet
      if (cachedMeta.status === "SCHEDULED" && cachedMeta.scheduledAt) {
        const scheduledTime = new Date(cachedMeta.scheduledAt).getTime();
        if (scheduledTime <= Date.now()) {
          cachedMeta.status = "ACTIVE";
          roomStateManager.setRoomMeta(cachedMeta.id, cachedMeta);
        } else {
          socket.join(canonicalId);
          socket.join(canonicalCode);
          if (roomId !== canonicalId && roomId !== canonicalCode) {
            socket.join(roomId);
          }
          socket.emit("room:scheduled", {
            roomId: cachedMeta.id,
            roomCode: cachedMeta.roomCode,
            scheduledAt: cachedMeta.scheduledAt,
            scheduledEndTime: cachedMeta.scheduledEndTime,
            title: cachedMeta.title,
            message: "This meeting is scheduled for a future time.",
          });
          return;
        }
      }
    } else {
      try {
        const dbLookupPromise = prisma.room.findFirst({
          where: {
            OR: [
              { roomCode: roomId.trim().toUpperCase() },
              { id: roomId.trim() },
              { id: roomId.trim().toLowerCase() },
            ],
          },
          include: {
            participants: { select: { id: true } },
          },
        });

        // Fast timeout DB lookup (1.5s) to support cold Neon DB connections without breaking sync
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("DB lookup timeout")), 1500)
        );

        const room = await Promise.race([dbLookupPromise, timeoutPromise]);

        if (room) {
          // If room in DB has ended, reject immediately
          if (room.status === "ENDED") {
            roomStateManager.markRoomEnded(room.id);
            roomStateManager.markRoomEnded(room.roomCode);
            socket.emit("room:terminated", {
              roomId,
              reason: "This room session has already been ended by the host.",
            });
            return;
          }

          roomFoundInDb = true;
          canonicalId = room.id;
          canonicalCode = room.roomCode.toUpperCase();
          hostCreatorId = room.creatorId;
          isPrivate = room.isPrivate;
          isHost = room.creatorId === userId;
          isAlreadyParticipant = room.participants.some((p: { id: string }) => p.id === userId);
          hasValidInvite = Boolean(
            room.inviteToken && inviteToken && room.inviteToken === inviteToken
          );

          // Check if room is scheduled for the future
          if (room.status === "SCHEDULED" && room.scheduledAt) {
            const now = new Date();
            if (room.scheduledAt <= now) {
              await prisma.room
                .update({
                  where: { id: room.id },
                  data: { status: "ACTIVE" },
                })
                .catch(() => {});
              room.status = "ACTIVE";
              broadcastRoomUpdated(room.id, room.roomCode, {
                status: "ACTIVE",
                message: "Room is now active.",
              });
            } else {
              const scheduledMeta = {
                id: room.id,
                roomCode: room.roomCode,
                isPrivate: room.isPrivate,
                creatorId: room.creatorId,
                inviteToken: room.inviteToken,
                status: room.status,
                scheduledAt: room.scheduledAt,
                scheduledEndTime: room.scheduledEndTime,
                title: room.title,
              };

              roomStateManager.setRoomMeta(room.id, scheduledMeta);
              roomStateManager.setRoomMeta(room.roomCode, scheduledMeta);
              roomStateManager.setRoomMeta(roomId, scheduledMeta);

              socket.join(canonicalId);
              socket.join(canonicalCode);
              if (roomId !== canonicalId && roomId !== canonicalCode) {
                socket.join(roomId);
              }

              socket.emit("room:scheduled", {
                roomId: room.id,
                roomCode: room.roomCode,
                scheduledAt: room.scheduledAt,
                scheduledEndTime: room.scheduledEndTime,
                title: room.title,
                message: "This meeting is scheduled for a future time.",
              });
              return;
            }
          }

          const roomMeta = {
            id: room.id,
            roomCode: room.roomCode,
            isPrivate: room.isPrivate,
            creatorId: room.creatorId,
            inviteToken: room.inviteToken,
            status: room.status,
            scheduledAt: room.scheduledAt,
            scheduledEndTime: room.scheduledEndTime,
            title: room.title,
          };

          roomStateManager.setRoomMeta(room.id, roomMeta);
          roomStateManager.setRoomMeta(room.roomCode, roomMeta);
          roomStateManager.setRoomMeta(roomId, roomMeta);
        } else {
          // Room not found in DB: fallback to active collaborative session
          canonicalId = roomId.trim().toUpperCase();
          canonicalCode = canonicalId;
          isPrivate = false;

          roomStateManager.setRoomMeta(canonicalId, {
            id: canonicalId,
            roomCode: canonicalCode,
            isPrivate: false,
            creatorId: userId,
            inviteToken: null,
            status: "ACTIVE",
          });
        }
      } catch (err) {
        console.warn("[WebRTC] DB lookup skipped or failed, using in-memory session:", err);
        canonicalId = roomId.trim().toUpperCase();
        canonicalCode = canonicalId;
        isPrivate = false;

        roomStateManager.setRoomMeta(canonicalId, {
          id: canonicalId,
          roomCode: canonicalCode,
          isPrivate: false,
          creatorId: userId,
          inviteToken: null,
          status: "ACTIVE",
        });
      }
    }

    // Attach canonical IDs and user identity to socket data for fast cross-channel routing
    socket.data.canonicalId = canonicalId;
    socket.data.canonicalCode = canonicalCode;
    socket.data.userId = userId;

    // Check if user was previously kicked/banned from this room
    if (roomStateManager.isUserBanned(canonicalId, userId, socket.id)) {
      socket.emit("room:kicked", {
        roomId,
        reason: "You were removed from this meeting by the host and cannot rejoin.",
      });
      return;
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

      // Add to waiting queue under canonical room ID
      roomStateManager.addWaitingPeer(canonicalId, waitingPeer);

      // Notify the joining user that they are in the waiting room
      socket.emit("room:waiting", {
        roomId,
        message: "Waiting for the host to let you in...",
        user: waitingPeer,
      });

      // Notify the host(s) across all room channels
      io.to(canonicalId).emit("room:knock-request", waitingPeer);
      io.to(canonicalCode).emit("room:knock-request", waitingPeer);
      if (roomId !== canonicalId && roomId !== canonicalCode) {
        io.to(roomId).emit("room:knock-request", waitingPeer);
      }

      console.log(`[Knock Queue] ${name} (${socket.id}) is knocking to join private room ${canonicalCode}`);
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

    const existingPeers = roomStateManager.getRoomPeers(canonicalId);
    roomStateManager.addPeer(canonicalId, peer);

    // Join both canonical ID, canonical Code, and raw roomId socket channels
    socket.join(canonicalId);
    socket.join(canonicalCode);
    if (roomId !== canonicalId && roomId !== canonicalCode) {
      socket.join(roomId);
    }

    // If room exists in DB, ensure user is registered in participants
    if (roomFoundInDb && (authUser?.id || user?.id)) {
      prisma.room
        .update({
          where: { id: canonicalId },
          data: { participants: { connect: { id: userId } } },
        })
        .catch(() => {});
    }

    // Reply to joining peer with list of existing peers (excluding self by socketId and userId)
    const existingPeersForClient = existingPeers.filter(
      (p) => p.socketId !== socket.id && (!userId || p.userId !== userId)
    );
    socket.emit("webrtc:room-peers", {
      self: peer,
      peers: existingPeersForClient,
    });

    // Announce new peer across all channel aliases (deduplicated)
    const announceRooms = Array.from(
      new Set(
        [
          canonicalId,
          canonicalCode,
          canonicalCode.toUpperCase(),
          roomId,
          roomId.trim().toUpperCase(),
        ].filter(Boolean)
      )
    );
    socket.to(announceRooms).emit("webrtc:peer-joined", peer);

    // Deliver chat history from canonical ID
    const chatHistory = roomStateManager.getChatHistory(canonicalId);
    socket.emit("chat:history", chatHistory);

    console.log(`[WebRTC] Peer ${peer.name} (${socket.id}) admitted to room ${canonicalCode} (${canonicalId}). Total: ${existingPeers.length + 1}`);
  });

  /**
   * 2. Host Approves a Knock Request from the Waiting Queue.
   */
  socket.on("room:approve-knock", async (payload: KnockDecisionPayload) => {
    const { roomId, targetSocketId } = payload;
    if (!roomId || !targetSocketId) return;

    const canonicalId = roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = meta?.roomCode || canonicalId;

    // Remove from waiting queue
    const waitingPeer = roomStateManager.removeWaitingPeer(canonicalId, targetSocketId);
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

    const existingPeers = roomStateManager.getRoomPeers(canonicalId);
    roomStateManager.addPeer(canonicalId, peer);

    // Join all channel aliases
    targetSocket.join(canonicalId);
    targetSocket.join(canonicalCode);
    if (roomId !== canonicalId && roomId !== canonicalCode) {
      targetSocket.join(roomId);
    }

    // Notify approved user that they have been admitted immediately
    targetSocket.emit("room:knock-approved", {
      roomId,
      self: peer,
      peers: existingPeers,
    });

    // Also emit webrtc:room-peers to ensure peer-to-peer WebRTC mesh connects immediately
    targetSocket.emit("webrtc:room-peers", {
      self: peer,
      peers: existingPeers,
    });

    // Deliver chat history to newly admitted peer
    const chatHistory = roomStateManager.getChatHistory(canonicalId);
    targetSocket.emit("chat:history", chatHistory);

    // Broadcast new peer to all existing peers across channels (deduplicated)
    const approvedRooms = Array.from(new Set([canonicalId, canonicalCode, roomId].filter(Boolean)));
    targetSocket.to(approvedRooms).emit("webrtc:peer-joined", peer);

    // Record in DB participants asynchronously (fire-and-forget, non-blocking)
    if (peer.userId && !peer.userId.startsWith("user-")) {
      prisma.room
        .update({
          where: { id: canonicalId },
          data: { participants: { connect: { id: peer.userId } } },
        })
        .catch(() => {});
    }

    console.log(`[Knock Queue] Host approved ${peer.name} (${targetSocketId}) into room ${canonicalCode}`);
  });

  /**
   * 3. Host Denies a Knock Request from the Waiting Queue.
   */
  socket.on("room:deny-knock", (payload: KnockDecisionPayload) => {
    const { roomId, targetSocketId } = payload;
    if (!roomId || !targetSocketId) return;

    const canonicalId = roomStateManager.getCanonicalKey(roomId);
    const removed = roomStateManager.removeWaitingPeer(canonicalId, targetSocketId);
    const targetSocket = io.sockets.sockets.get(targetSocketId);

    if (targetSocket) {
      targetSocket.emit("room:knock-denied", {
        roomId,
        message: "The host has denied your request to join this meeting.",
      });
    }

    console.log(`[Knock Queue] Host denied ${removed?.name || targetSocketId} from room ${canonicalId}`);
  });

  /**
   * 4. Host fetches the list of users currently in the waiting queue.
   */
  socket.on("room:get-waiting-queue", (payload: { roomId: string }) => {
    if (!payload.roomId) return;
    const canonicalId = roomStateManager.getCanonicalKey(payload.roomId);
    const queue = roomStateManager.getWaitingPeers(canonicalId);
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
      const meta = roomStateManager.getRoomMeta(roomId);
      const canonicalCode = meta?.roomCode;

      socket.leave(roomId);
      if (canonicalCode) socket.leave(canonicalCode);

      if (!wasWaiting && removedPeer) {
        const leavePayload = {
          socketId: socket.id,
          userId: removedPeer.userId,
        };

        io.to(roomId).emit("webrtc:peer-left", leavePayload);
        if (canonicalCode && canonicalCode !== roomId) {
          io.to(canonicalCode).emit("webrtc:peer-left", leavePayload);
        }
      }
    }
  });

  /**
   * 9. Host ends the room session for all participants via socket.
   */
  socket.on("room:end-session", (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (!roomId) return;

    const canonicalId = socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
    const meta = roomStateManager.getRoomMeta(canonicalId);
    const canonicalCode = socket.data?.canonicalCode || meta?.roomCode || canonicalId;

    // Mark room as ended in state manager cache
    roomStateManager.markRoomEnded(canonicalId);
    if (canonicalCode) roomStateManager.markRoomEnded(canonicalCode);
    if (roomId !== canonicalId && roomId !== canonicalCode) {
      roomStateManager.markRoomEnded(roomId);
    }

    const targetRooms = Array.from(
      new Set(
        [
          canonicalId,
          canonicalCode,
          canonicalCode.toUpperCase(),
          roomId,
          roomId.trim().toUpperCase(),
        ].filter(Boolean)
      )
    );
    const termPayload = {
      roomId,
      roomCode: canonicalCode,
      reason: "The meeting host has ended this room session for everyone.",
      endedAt: new Date().toISOString(),
    };

    targetRooms.forEach((r) => {
      io.to(r).emit("room:terminated", termPayload);
      io.to(r).emit("webrtc:peer-left", { socketId: "all", reason: "Room ended" });
    });

    // Evict all sockets from these room channels
    for (const r of targetRooms) {
      if (typeof io.in(r)?.socketsLeave === "function") {
        io.in(r).socketsLeave(r);
      }
    }

    // Persist termination and disconnect all participants from room in DB if it exists
    prisma.room
      .findFirst({
        where: {
          OR: [{ id: canonicalId }, { roomCode: canonicalCode.toUpperCase() }],
        },
        select: { id: true },
      })
      .then((existingRoom) => {
        if (existingRoom) {
          return prisma.room.update({
            where: { id: existingRoom.id },
            data: {
              status: "ENDED",
              endedAt: new Date(),
              participants: { set: [] }, // Clears all participants from the room in DB
            },
          });
        }
      })
      .catch(() => {});

    console.log(`[WebRTC] Host ended room session: ${canonicalCode} (${canonicalId})`);
  });

  /**
   * 10. Host kicks a participant out of the live room session.
   */
  socket.on(
    "room:kick-peer",
    (payload: {
      roomId: string;
      targetSocketId: string;
      targetUserId?: string;
      reason?: string;
    }) => {
      const { roomId, targetSocketId, targetUserId, reason } = payload;
      if (!roomId || !targetSocketId) return;

      const canonicalId =
        socket.data?.canonicalId || roomStateManager.getCanonicalKey(roomId);
      const meta = roomStateManager.getRoomMeta(canonicalId);
      const canonicalCode =
        socket.data?.canonicalCode || meta?.roomCode || canonicalId;

      // Verify host permission (sender is room creator, socket.data.user, or socket.data.userId)
      const senderUserId = socket.data?.user?.id || socket.data?.userId;
      const isHost = meta
        ? meta.creatorId === senderUserId || meta.creatorId === socket.data?.user?.id
        : true;

      if (!isHost && meta?.creatorId && senderUserId && meta.creatorId !== senderUserId) {
        socket.emit("room:error", {
          message: "Only the room host can remove participants.",
        });
        return;
      }

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      const targetPeer = roomStateManager.getPeer(canonicalId, targetSocketId);
      const peerName = targetPeer?.name || "A participant";

      // 1. Record ban so kicked user cannot rejoin this session
      const bannedIdentifier = targetUserId || targetPeer?.userId || targetSocketId;
      roomStateManager.banUser(canonicalId, bannedIdentifier);
      if (targetPeer?.userId) roomStateManager.banUser(canonicalId, targetPeer.userId);
      roomStateManager.banUser(canonicalId, targetSocketId);

      // 2. Notify target peer that they were removed
      const kickReason =
        reason || "You were removed from this meeting by the host.";
      if (targetSocket) {
        targetSocket.emit("room:kicked", {
          roomId,
          reason: kickReason,
        });

        // Eject target socket from all room channels
        targetSocket.leave(canonicalId);
        targetSocket.leave(canonicalCode);
        if (roomId !== canonicalId && roomId !== canonicalCode) {
          targetSocket.leave(roomId);
        }
      }

      // 3. Remove peer from in-memory state manager
      roomStateManager.removePeer(targetSocketId);

      // 4. Notify remaining participants across all channel aliases
      const targetRooms = Array.from(
        new Set([canonicalId, canonicalCode, roomId].filter(Boolean))
      );
      const leavePayload = {
        socketId: targetSocketId,
        userId: targetUserId || targetPeer?.userId || targetSocketId,
        kicked: true,
        name: peerName,
      };
      io.to(targetRooms).emit("webrtc:peer-left", leavePayload);

      // 4. Send system announcement into room chat
      const systemMsg = {
        id: crypto.randomUUID(),
        roomId: canonicalId,
        sender: {
          id: "system",
          name: "Host Moderation",
          avatar: "",
        },
        text: `${peerName} was removed from the meeting by the host.`,
        timestamp: new Date().toISOString(),
      };
      roomStateManager.addChatMessage(canonicalId, systemMsg);
      io.to(targetRooms).emit("chat:new-message", systemMsg);

      console.log(
        `[Kick] Host kicked ${peerName} (${targetSocketId}) from room ${canonicalCode}`
      );
    }
  );
};

export default registerWebRtcHandlers;
