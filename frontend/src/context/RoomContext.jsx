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
export function RoomProvider({ roomId, inviteToken = '', children }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme: globalTheme } = useTheme();

  // Socket instance created once per provider mount
  const socket = useMemo(() => {
    const rawSocketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
        : '') ||
      'http://localhost:5000';
    const socketUrl = rawSocketUrl.replace(/\/+$/, '');
    return io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
  }, []);

  // Room metadata state
  const [roomTitle, setRoomTitle] = useState('Learning Room');
  const [roomDetails, setRoomDetails] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
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

  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVideoGalleryOpen, setIsVideoGalleryOpen] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeCallTime, setActiveCallTime] = useState(0);

  // Floating Reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Room-specific Theme state
  const [roomTheme, setRoomTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(`room_theme_${roomId}`);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return globalTheme || 'light';
  });

  const handleToggleRoomTheme = useCallback(() => {
    setRoomTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(`room_theme_${roomId}`, next);
      } catch {}
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
        if (isMounted && res.data?.room) {
          setRoomDetails(res.data.room);
          setRoomTitle(res.data.room.title || 'Learning Room');
        }
      } catch {
        // Fallback for custom codes
      }
    };
    fetchRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Call timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCallTime = useCallback((secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

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

  // WebRTC Mesh Hook for live camera & microphone streams
  const { localStream, remoteStreams } = useWebRtc({
    roomId,
    socket,
    user: currentUser,
    isMuted,
    isVideoOn,
  });

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

    socket.on('connect', () => {
      socket.emit('webrtc:join-room', {
        roomId,
        inviteToken,
        user: {
          id: user?.id,
          name: user?.name || 'Collaborator',
          avatar: user?.avatar,
        },
        initialMediaState: {
          isAudioMuted: isMuted,
          isVideoOff: !isVideoOn,
        },
      });
    });

    // 🔒 WAITING ROOM: Intercepted because room is private
    socket.on('room:waiting', (data) => {
      setIsWaiting(true);
      setWaitingMessage(data.message || 'Waiting for the host to let you in...');
    });

    // 🚪 KNOCK APPROVED: Host admitted user
    socket.on('room:knock-approved', (data) => {
      setIsWaiting(false);
      setPeers(data.peers || []);
    });

    // 🚫 KNOCK DENIED: Host rejected admission
    socket.on('room:knock-denied', (data) => {
      alert(data.message || 'The host has denied your request to join this meeting.');
      navigate('/dashboard');
    });

    // 🔔 HOST ALERT: Incoming knock request from a waiting guest
    socket.on('room:knock-request', (knockPeer) => {
      setKnockRequests((prev) => {
        if (prev.some((p) => p.socketId === knockPeer.socketId)) return prev;
        return [...prev, knockPeer];
      });
    });

    // 👥 PEER DISCOVERY & SYNCHRONIZATION
    socket.on('webrtc:room-peers', (data) => {
      setIsWaiting(false);
      setPeers(data.peers || []);
    });

    socket.on('webrtc:peer-joined', (newPeer) => {
      setPeers((prev) => {
        if (prev.some((p) => p.socketId === newPeer.socketId)) return prev;
        return [...prev, newPeer];
      });
    });

    socket.on('webrtc:peer-left', (data) => {
      setPeers((prev) => prev.filter((p) => p.socketId !== data.socketId));
    });

    // 🎙️ PEER MEDIA STATUS CHANGED
    socket.on('media:audio-status-changed', ({ socketId, isAudioMuted }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isAudioMuted } : p))
      );
    });

    socket.on('media:video-status-changed', ({ socketId, isVideoOff }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff } : p))
      );
    });

    socket.on('media:hand-raise-changed', ({ socketId, isHandRaised }) => {
      setPeers((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised } : p))
      );
    });

    // 💬 REAL-TIME CHAT: Map real sender names and dynamic avatars
    socket.on('chat:history', (history) => {
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
        isMe: (msg.sender?.id || msg.userId) === user?.id,
      }));
      setChatMessages(formatted);
    });

    socket.on('chat:new-message', (msg) => {
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
          isMe: (msg.sender?.id || msg.userId) === user?.id,
        },
      ]);
    });

    // 🎉 FLOATING EMOJI REACTIONS
    socket.on('chat:emoji-reaction', (data) => {
      triggerReaction(data.emoji, false);
    });
    socket.on('chat:reaction', (data) => {
      triggerReaction(data.emoji, false);
    });

    // 🛑 ROOM TERMINATED
    socket.on('room:terminated', (data) => {
      alert(`Meeting Ended: ${data.reason || 'The host has ended this meeting.'}`);
      navigate('/dashboard');
    });

    return () => {
      socket.disconnect();
    };
  }, [
    socket,
    roomId,
    inviteToken,
    user?.id,
    user?.name,
    user?.avatar,
    isMuted,
    isVideoOn,
    navigate,
    triggerReaction,
  ]);

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
  }, [roomDetails?.inviteToken, roomId]);

  const handleLeaveRoom = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const value = useMemo(
    () => ({
      roomId,
      socket,
      currentUser,
      // Metadata
      roomTitle,
      setRoomTitle,
      roomDetails,
      isEditingTitle,
      setIsEditingTitle,
      copiedLink,
      handleCopyInvite,
      // Knock / Waiting Room
      isWaiting,
      waitingMessage,
      knockRequests,
      handleApproveKnock,
      handleDenyKnock,
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
      currentUser,
      roomTitle,
      roomDetails,
      isEditingTitle,
      copiedLink,
      handleCopyInvite,
      isWaiting,
      waitingMessage,
      knockRequests,
      handleApproveKnock,
      handleDenyKnock,
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
