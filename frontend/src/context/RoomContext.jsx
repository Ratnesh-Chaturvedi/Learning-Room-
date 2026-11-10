import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useWebRtc } from '../hooks/useWebRtc';
import { roomApi } from '../api/room.api';

const RoomContext = createContext(null);

/**
 * RoomProvider
 * Centralizes real-time state management, WebRTC media streams, socket signaling,
 * knock approval queue, live chat, and room theming for the active collaboration room.
 */
export function RoomProvider({ roomId: rawRoomId, inviteToken = '', children }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme: globalTheme } = useTheme();

  // Normalize room code to uppercase for guaranteed matching across participants
  const roomId = useMemo(() => (rawRoomId || '').trim().toUpperCase(), [rawRoomId]);

  // Socket instance created once per provider mount with smart cloud / localhost fallback
  const socket = useMemo(() => {
    const isProductionHost =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !window.location.hostname.startsWith('192.168.') &&
      !window.location.hostname.startsWith('10.') &&
      !window.location.hostname.endsWith('.local');

    const configuredSocketUrl = (
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
        : '') ||
      ''
    ).replace(/\/+$/, '');

    let socketUrl = configuredSocketUrl;
    if (!socketUrl) {
      if (isProductionHost) {
        socketUrl = 'https://learning-room-backend.onrender.com';
      } else {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        socketUrl = `http://${host}:5000`;
      }
    } else if (isProductionHost && socketUrl.includes('localhost')) {
      socketUrl = 'https://learning-room-backend.onrender.com';
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('learningroom_token') || '' : '';
    return io(socketUrl, {
      auth: {
        token,
      },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 15000,
    });
  }, []);

  const [isSocketConnected, setIsSocketConnected] = useState(() => socket?.connected || false);
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);
    const onConnectError = (err) => {
      console.warn('[Room Socket] Connection error:', err.message);
      setIsSocketConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  // Room metadata state
  const [roomTitle, setRoomTitle] = useState('Learning Room');
  const [roomDetails, setRoomDetails] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Private Waiting Room & Knock states
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState(
    'Waiting for the host to let you in...'
  );
  const [knockRequests, setKnockRequests] = useState([]);

  // Connected WebRTC Peers
  const [peers, setPeers] = useState([]);

  // Real-time Chat
  const [chatMessages, setChatMessages] = useState([]);

  // Media states (Camera defaults to off to protect privacy and avoid unwanted webcam LED lighting)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isVideoGalleryOpen, setIsVideoGalleryOpen] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeCallTime, setActiveCallTime] = useState(0);

  // Room Termination State
  const [isRoomTerminated, setIsRoomTerminated] = useState(false);
  const [terminationInfo, setTerminationInfo] = useState(null);

  // Scheduled Room State (Holding room until scheduledAt arrives or host starts early)
  const [isRoomScheduled, setIsRoomScheduled] = useState(false);
  const [scheduledInfo, setScheduledInfo] = useState(null);

  // Keep refs for media states so socket effects never tear down connections on mute/video toggle
  const isMutedRef = useRef(isMuted);
  const isVideoOnRef = useRef(isVideoOn);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    isVideoOnRef.current = isVideoOn;
  }, [isVideoOn]);

  // Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Room-specific Theme state
  const [roomTheme, setRoomTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(`room_theme_${roomId}`);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_e) {
      // Ignore localStorage read errors
    }
    return globalTheme || 'light';
  });

  const handleToggleRoomTheme = useCallback(() => {
    setRoomTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(`room_theme_${roomId}`, next);
      } catch (_e) {
        // Ignore localStorage write errors
      }
      return next;
    });
  }, [roomId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', roomTheme);
    document.documentElement.classList.toggle('dark', roomTheme === 'dark');
    return () => {
      const fallbackTheme =
        localStorage.getItem('learningroom_theme') || globalTheme || 'light';
      document.documentElement.setAttribute('data-theme', fallbackTheme);
      document.documentElement.classList.toggle('dark', fallbackTheme === 'dark');
    };
  }, [roomTheme, globalTheme]);

  // Load Room Details from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchRoom = async () => {
      try {
        const res = await roomApi.getRoomDetails(roomId);
        const room = res.data?.room || res.data?.data || res.data;
        if (isMounted && room && (room.id || room.roomCode)) {
          if (room.status === 'ENDED') {
            setIsRoomTerminated(true);
            setTerminationInfo({
              reason: 'This room session has already been ended by the host.',
              endedAt: room.endedAt || new Date().toISOString(),
            });
            return;
          }

          // Check if scheduled end time has already elapsed
          if (room.scheduledEndTime && new Date(room.scheduledEndTime).getTime() <= Date.now()) {
            setIsRoomTerminated(true);
            setTerminationInfo({
              reason: 'This scheduled meeting duration has ended.',
              endedAt: room.scheduledEndTime,
            });
            return;
          }

          // Check if meeting has a planned start time in the future
          const isFutureScheduled =
            room.status === 'SCHEDULED' &&
            room.scheduledAt &&
            new Date(room.scheduledAt).getTime() > Date.now();

          if (isFutureScheduled) {
            setIsRoomScheduled(true);
            setScheduledInfo({
              title: room.title || 'Scheduled Meeting',
              scheduledAt: room.scheduledAt,
              scheduledEndTime: room.scheduledEndTime,
              creatorName: room.creator?.name || 'The Host',
            });
          } else {
            setIsRoomScheduled(false);
          }

          setRoomDetails(room);
          setRoomTitle(room.title || 'Learning Room');
        }
      } catch {
        // Fallback for custom codes
      }
    };
    fetchRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId, navigate]);

  const [guestId] = useState(() => `guest-${Math.random().toString(36).substring(2, 9)}`);
  const currentUser = useMemo(
    () => ({
      id: user?.id || guestId,
      name: user?.name || 'Collaborator',
      avatar: user?.avatar,
      color: '#635bdb',
    }),
    [user?.id, user?.name, user?.avatar, guestId]
  );

  // Determine whether current user is the host / creator
  const isHost = Boolean(
    currentUser?.id &&
    roomDetails &&
    (roomDetails.creatorId === currentUser.id || roomDetails.creator?.id === currentUser.id)
  );

  // Call timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebRTC Mesh Hook for live camera, microphone streams & screen sharing
  const {
    localStream,
    remoteStreams,
    isScreenSharing,
    screenStream,
    toggleScreenShare,
    startScreenShare,
    stopScreenShare,
  } = useWebRtc({
    roomId,
    socket,
    user: currentUser,
    isMuted,
    isVideoOn,
    isEnabled: !isRoomScheduled && !isRoomTerminated,
  });

  // Keep refs to latest stream values so socket event handlers
  // can stop tracks on room termination without stale closure bugs.
  const localStreamRef = useRef(localStream);
  const screenStreamRef = useRef(screenStream);
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);
  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // Auto-terminate meeting when scheduledEndTime is reached
  useEffect(() => {
    if (!roomDetails?.scheduledEndTime) return;
    const endTime = new Date(roomDetails.scheduledEndTime).getTime();
    const remainingMs = endTime - Date.now();

    const timer = setTimeout(() => {
      setIsRoomTerminated(true);
      setTerminationInfo({
        reason: 'This scheduled meeting duration has ended.',
        endedAt: roomDetails.scheduledEndTime,
      });
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch (_e) {
        // Ignore stream stop failure
      }
      try {
        socket?.disconnect();
      } catch (_e) {
        // Ignore disconnect failure
      }
    }, Math.max(0, remainingMs));

    return () => clearTimeout(timer);
  }, [roomDetails?.scheduledEndTime, socket]);

  // Auto-activate scheduled room when scheduled start time is reached
  useEffect(() => {
    if (!isRoomScheduled || !scheduledInfo?.scheduledAt) return;
    const startTime = new Date(scheduledInfo.scheduledAt).getTime();
    const remainingMs = startTime - Date.now();

    const triggerActivation = () => {
      setIsRoomScheduled(false);
      setRoomDetails((prev) => (prev ? { ...prev, status: 'ACTIVE' } : prev));
      if (socket?.connected) {
        socket.emit('webrtc:join-room', {
          roomId,
          inviteToken,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
          initialMediaState: {
            isAudioMuted: isMutedRef.current,
            isVideoOff: !isVideoOnRef.current,
          },
        });
      }
    };

    if (remainingMs <= 0) {
      triggerActivation();
      return;
    }

    const timer = setTimeout(triggerActivation, remainingMs);
    return () => clearTimeout(timer);
  }, [isRoomScheduled, scheduledInfo?.scheduledAt, socket, roomId, inviteToken, currentUser]);

  // Host starts scheduled room early
  const handleStartScheduledRoomEarly = useCallback(async () => {
    try {
      const targetId = roomDetails?.id || roomDetails?.roomCode || roomId;
      await roomApi.startRoom(targetId);
      setIsRoomScheduled(false);
      setRoomDetails((prev) => (prev ? { ...prev, status: 'ACTIVE' } : prev));
      if (socket?.connected) {
        socket.emit('webrtc:join-room', {
          roomId,
          inviteToken,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
          initialMediaState: {
            isAudioMuted: isMutedRef.current,
            isVideoOff: !isVideoOnRef.current,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to start scheduled room early:', err);
    }
  }, [roomDetails, roomId, socket, inviteToken, currentUser]);

  const formatCallTime = useCallback((secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);


  // Floating reactions trigger
  const triggerReaction = useCallback(
    (emoji, broadcast = true) => {
      const id = Date.now() + Math.random();
      const startX = 40 + Math.random() * 20;
      setFloatingReactions((prev) => [...prev, { id, emoji, startX }]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2400);

      if (broadcast && socket) {
        socket.emit('chat:reaction', { roomId, emoji });
      }
    },
    [roomId, socket]
  );

  // Socket.io initialization & WebRTC Signaling
  useEffect(() => {
    if (!socket) return;

    const emitJoinRoom = () => {
      socket.emit('webrtc:join-room', {
        roomId,
        inviteToken,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        initialMediaState: {
          isAudioMuted: isMutedRef.current,
          isVideoOff: !isVideoOnRef.current,
        },
      });
    };

    // If socket is already connected, emit immediately; otherwise wait for connect event
    if (socket.connected) {
      emitJoinRoom();
    }
    socket.on('connect', emitJoinRoom);

    // 🔒 WAITING ROOM: Intercepted because room is private
    const handleWaiting = (data) => {
      setIsWaiting(true);
      setWaitingMessage(data.message || 'Waiting for the host to let you in...');
    };

    // 🚪 KNOCK APPROVED: Host admitted user
    const handleKnockApproved = (data) => {
      setIsWaiting(false);
      setPeers(data.peers || []);
    };

    // 🚫 KNOCK DENIED: Host rejected admission
    const handleKnockDenied = (data) => {
      // Use non-blocking notification then navigate
      setTerminationInfo({
        reason: data.message || 'The host has denied your request to join this meeting.',
        endedAt: new Date().toISOString(),
      });
      setIsRoomTerminated(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    };

    // 🔔 HOST ALERT: Incoming knock request from a waiting guest
    const handleKnockRequest = (knockPeer) => {
      setKnockRequests((prev) => {
        if (prev.some((p) => p.socketId === knockPeer.socketId)) return prev;
        return [...prev, knockPeer];
      });
    };

    // 👥 PEER DISCOVERY & SYNCHRONIZATION
    const handleRoomPeers = (data) => {
      setIsWaiting(false);
      // Filter out self by socket ID and by user ID (prevents ghost self tile on reconnect/refresh)
      const myId = currentUser?.id;
      const filtered = (data?.peers || []).filter(
        (p) => p.socketId !== socket.id && (!myId || p.userId !== myId)
      );
      setPeers(filtered);
    };

    const handlePeerJoined = (newPeer) => {
      if (!newPeer || newPeer.socketId === socket.id) return;
      const myId = currentUser?.id;
      if (myId && newPeer.userId === myId) return; // Prevent ghost self duplicate
      setPeers((prev) => {
        if (prev.some((p) => p.socketId === newPeer.socketId || (myId && p.userId === newPeer.userId))) return prev;
        return [...prev, newPeer];
      });
    };

    const handlePeerLeft = (data) => {
      if (data?.socketId === 'all') {
        setPeers([]);
      } else {
        setPeers((prev) => prev.filter((p) => p.socketId !== data.socketId));
      }
    };

    // 🎙️ PEER MEDIA STATUS CHANGED
    const handleAudioStatus = ({ socketId, isAudioMuted }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isAudioMuted } : p))
      );
    };

    const handleVideoStatus = ({ socketId, isVideoOff }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff } : p))
      );
    };

    const handleHandRaise = ({ socketId, isHandRaised }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised } : p))
      );
    };

    // 🖥️ PEER SCREEN SHARE STATUS
    const handleScreenShareStatus = ({ socketId, isScreenSharing }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isScreenSharing } : p))
      );
    };

    // 🚪 KICKED BY HOST
    const handleKicked = (data) => {
      setTerminationInfo({
        reason: data?.reason || 'You were removed from this meeting by the host.',
        endedAt: new Date().toISOString(),
      });
      setIsRoomTerminated(true);
      setPeers([]);
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch (_e) {
        // Ignore stream stop failure
      }
      try {
        socket?.disconnect();
      } catch (_e) {
        // Ignore disconnect error
      }
      setTimeout(() => navigate('/dashboard'), 3000);
    };

    // 💬 REAL-TIME CHAT: Map real sender names and dynamic avatars
    const handleChatHistory = (history) => {
      if (!Array.isArray(history)) return;
      const formatted = history.map((msg) => ({
        id: msg.id,
        sender: msg.sender?.name || msg.senderName || 'Collaborator',
        avatar: msg.sender?.avatar || msg.avatar,
        time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        text: msg.text,
        isMe: (msg.sender?.id || msg.userId) === currentUser.id,
      }));
      setChatMessages(formatted);
    };

    const handleNewMessage = (msg) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.sender?.name || msg.senderName || 'Collaborator',
          avatar: msg.sender?.avatar || msg.avatar,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          text: msg.text,
          isMe: (msg.sender?.id || msg.userId) === currentUser.id,
        },
      ]);
    };

    // 🎉 FLOATING EMOJI REACTIONS
    const handleEmojiReaction = (data) => {
      triggerReaction(data.emoji, false);
    };

    // 🛑 ROOM TERMINATED (Instant reactive termination, no blocking alert)
    const handleRoomTerminated = (data) => {
      console.log('[Room] Meeting terminated by host:', data);
      setIsRoomTerminated(true);
      setTerminationInfo({
        reason: data?.reason || 'The host has ended this meeting.',
        endedAt: data?.endedAt || new Date().toISOString(),
      });
      setPeers([]);
      // Use refs to get current stream values — the socket handler closes over mount-time values
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch (_e) {
        // Ignore stream stop failure
      }
      try {
        socket?.disconnect();
      } catch (_e) {
        // Ignore disconnect error
      }
    };

    // 📅 SCHEDULED ROOM: Not started yet
    const handleRoomScheduled = (data) => {
      setIsRoomScheduled(true);
      setScheduledInfo({
        title: data?.title || roomTitle,
        scheduledAt: data?.scheduledAt,
        scheduledEndTime: data?.scheduledEndTime,
        creatorName: 'The Host',
      });
    };

    // 🔄 ROOM UPDATED: e.g. Host started room early
    const handleRoomUpdated = (data) => {
      if (data?.status === 'ACTIVE') {
        setIsRoomScheduled(false);
        setRoomDetails((prev) => (prev ? { ...prev, status: 'ACTIVE' } : prev));
        socket.emit('webrtc:join-room', {
          roomId,
          inviteToken,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
          initialMediaState: {
            isAudioMuted: isMutedRef.current,
            isVideoOff: !isVideoOnRef.current,
          },
        });
      }
    };

    // ⚠️ ROOM ERROR
    const handleRoomError = (data) => {
      alert(data?.message || 'Room error or session expired.');
      navigate('/dashboard');
    };

    socket.on('room:waiting', handleWaiting);
    socket.on('room:knock-approved', handleKnockApproved);
    socket.on('room:knock-denied', handleKnockDenied);
    socket.on('room:knock-request', handleKnockRequest);
    socket.on('room:scheduled', handleRoomScheduled);
    socket.on('room:updated', handleRoomUpdated);
    socket.on('webrtc:room-peers', handleRoomPeers);
    socket.on('webrtc:peer-joined', handlePeerJoined);
    socket.on('webrtc:peer-left', handlePeerLeft);
    socket.on('media:audio-status-changed', handleAudioStatus);
    socket.on('media:video-status-changed', handleVideoStatus);
    socket.on('media:hand-raise-changed', handleHandRaise);
    socket.on('media:screenshare-status-changed', handleScreenShareStatus);
    socket.on('chat:history', handleChatHistory);
    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:emoji-reaction', handleEmojiReaction);
    socket.on('chat:reaction', handleEmojiReaction);
    socket.on('room:terminated', handleRoomTerminated);
    socket.on('room:kicked', handleKicked);
    socket.on('room:error', handleRoomError);

    return () => {
      socket.off('connect', emitJoinRoom);
      socket.off('room:waiting', handleWaiting);
      socket.off('room:knock-approved', handleKnockApproved);
      socket.off('room:knock-denied', handleKnockDenied);
      socket.off('room:knock-request', handleKnockRequest);
      socket.off('room:scheduled', handleRoomScheduled);
      socket.off('room:updated', handleRoomUpdated);
      socket.off('webrtc:room-peers', handleRoomPeers);
      socket.off('webrtc:peer-joined', handlePeerJoined);
      socket.off('webrtc:peer-left', handlePeerLeft);
      socket.off('media:audio-status-changed', handleAudioStatus);
      socket.off('media:video-status-changed', handleVideoStatus);
      socket.off('media:hand-raise-changed', handleHandRaise);
      socket.off('media:screenshare-status-changed', handleScreenShareStatus);
      socket.off('chat:history', handleChatHistory);
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:emoji-reaction', handleEmojiReaction);
      socket.off('chat:reaction', handleEmojiReaction);
      socket.off('room:terminated', handleRoomTerminated);
      socket.off('room:kicked', handleKicked);
      socket.off('room:error', handleRoomError);
    };
  }, [
    socket,
    roomId,
    inviteToken,
    currentUser.id,
    currentUser.name,
    currentUser.avatar,
    roomTitle,
    navigate,
    triggerReaction,
  ]);

  // Cleanup socket on unmount only
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Host Knock Decisions
  const handleApproveKnock = useCallback(
    (targetSocketId) => {
      socket?.emit('room:approve-knock', {
        roomId,
        targetSocketId,
      });
      setKnockRequests((prev) => prev.filter((p) => p.socketId !== targetSocketId));
    },
    [socket, roomId]
  );

  const handleDenyKnock = useCallback(
    (targetSocketId) => {
      socket?.emit('room:deny-knock', {
        roomId,
        targetSocketId,
      });
      setKnockRequests((prev) => prev.filter((p) => p.socketId !== targetSocketId));
    },
    [socket, roomId]
  );

  // Media Toggles
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      socket?.emit('media:toggle-audio', {
        roomId,
        isMuted: nextMuted,
      });
      return nextMuted;
    });
  }, [socket, roomId]);

  const handleToggleVideo = useCallback(() => {
    setIsVideoOn((prev) => {
      const nextVideo = !prev;
      socket?.emit('media:toggle-video', {
        roomId,
        isVideoOff: !nextVideo,
      });
      return nextVideo;
    });
  }, [socket, roomId]);

  const handleToggleHand = useCallback(() => {
    setIsHandRaised((prev) => {
      const nextHand = !prev;
      socket?.emit('media:raise-hand', {
        roomId,
        isHandRaised: nextHand,
      });
      return nextHand;
    });
  }, [socket, roomId]);

  // Chat message sending
  const handleSendChatMessage = useCallback(
    (text) => {
      if (!text?.trim() || !socket) return;
      socket.emit('chat:send-message', {
        roomId,
        text: text.trim(),
      });
    },
    [socket, roomId]
  );

  const handleCopyInvite = useCallback(() => {
    const origin = window.location.origin;
    const tokenQuery = roomDetails?.inviteToken
      ? `?token=${roomDetails.inviteToken}`
      : '';
    const inviteUrl = `${origin}/room/${roomId}${tokenQuery}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }, [roomDetails, roomId]);

  const handleLeaveRoom = useCallback(() => {
    try {
      socket?.emit('webrtc:leave-room');
    } catch (_e) {
      // Ignore leave socket emit failure
    }
    navigate('/dashboard');
  }, [socket, navigate]);

  // Host kicks a participant from the room
  const handleKickPeer = useCallback(
    (targetSocketId, peerName = 'Participant') => {
      if (!isHost) return;
      // Emit kick immediately — no blocking confirm dialog
      socket?.emit('room:kick-peer', {
        roomId,
        targetSocketId,
        reason: `${peerName} was removed from the meeting by the host.`,
      });
    },
    [isHost, socket, roomId]
  );

  // Host terminates room for all participants
  const handleEndRoomForAll = useCallback(async () => {
    // No blocking confirm — host button click is intentional
    const targetId = roomDetails?.roomCode || roomDetails?.id || roomId;
    // 1. Immediately emit socket end-session for instant eviction across all clients
    socket?.emit('room:end-session', { roomId: targetId });
    // 2. Instantly update local state to terminated
    setIsRoomTerminated(true);
    setTerminationInfo({
      reason: 'You ended this meeting for everyone.',
      endedAt: new Date().toISOString(),
    });
    setPeers([]);
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (_e) {
      // Ignore stream stop failure
    }
    // 3. Persist termination in database via REST endpoint
    roomApi.endRoom(targetId).catch(() => {});
  }, [roomDetails?.roomCode, roomDetails?.id, roomId, socket]);

  const value = useMemo(
    () => ({
      roomId,
      socket,
      isSocketConnected,
      currentUser,
      // Metadata
      roomTitle,
      setRoomTitle,
      roomDetails,
      isEditingTitle,
      setIsEditingTitle,
      copiedLink,
      handleCopyInvite,
      isHost,
      handleEndRoomForAll,
      // Room Termination
      isRoomTerminated,
      terminationInfo,
      // Scheduled Room State
      isRoomScheduled,
      scheduledInfo,
      handleStartScheduledRoomEarly,
      // Knock / Waiting Room
      isWaiting,
      waitingMessage,
      knockRequests,
      handleApproveKnock,
      handleDenyKnock,
      // Members & Moderation
      isMembersOpen,
      setIsMembersOpen,
      handleKickPeer,
      // Peers & Media
      peers,
      localStream,
      remoteStreams,
      isMuted,
      setIsMuted,
      handleToggleMute,
      isVideoOn,
      setIsVideoOn,
      handleToggleVideo,
      isVideoGalleryOpen,
      setIsVideoGalleryOpen,
      isHandRaised,
      setIsHandRaised,
      handleToggleHand,
      isScreenSharing,
      screenStream,
      toggleScreenShare,
      startScreenShare,
      stopScreenShare,
      // Call timer
      activeCallTime,
      formatCallTime,
      // Chat & Reactions
      isChatOpen,
      setIsChatOpen,
      chatMessages,
      handleSendChatMessage,
      floatingReactions,
      triggerReaction,
      // Theming & Navigation
      roomTheme,
      handleToggleRoomTheme,
      handleLeaveRoom,
    }),
    [
      roomId,
      socket,
      isSocketConnected,
      currentUser,
      roomTitle,
      roomDetails,
      isEditingTitle,
      copiedLink,
      handleCopyInvite,
      isHost,
      handleEndRoomForAll,
      isRoomTerminated,
      terminationInfo,
      isRoomScheduled,
      scheduledInfo,
      handleStartScheduledRoomEarly,
      isWaiting,
      waitingMessage,
      knockRequests,
      handleApproveKnock,
      handleDenyKnock,
      isMembersOpen,
      handleKickPeer,
      peers,
      localStream,
      remoteStreams,
      isMuted,
      handleToggleMute,
      isVideoOn,
      handleToggleVideo,
      isVideoGalleryOpen,
      isHandRaised,
      handleToggleHand,
      isScreenSharing,
      screenStream,
      toggleScreenShare,
      startScreenShare,
      stopScreenShare,
      activeCallTime,
      formatCallTime,
      isChatOpen,
      chatMessages,
      handleSendChatMessage,
      floatingReactions,
      triggerReaction,
      roomTheme,
      handleToggleRoomTheme,
      handleLeaveRoom,
    ]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);
  return context;
}

export default RoomContext;
