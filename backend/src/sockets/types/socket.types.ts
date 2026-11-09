/**
 * WebRTC Session Description and ICE Candidate data interfaces (Node.js backend compatible)
 */
export type RTCSessionDescriptionData = {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp?: string;
  [key: string]: unknown;
} | unknown;

export type RTCIceCandidateData = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
  [key: string]: unknown;
} | unknown;

/**
 * Room privacy and access metadata cached in memory
 */
export interface RoomMeta {
  id: string;
  roomCode?: string;
  isPrivate: boolean;
  creatorId?: string | null;
  inviteToken?: string | null;
  status?: "ACTIVE" | "SCHEDULED" | "ENDED";
}

/**
 * Information regarding a connected peer in a live collaborative room.
 */
export interface PeerUser {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing?: boolean;
  joinedAt: string;
}

/**
 * A user waiting in the knock/admission queue for host approval.
 */
export interface WaitingPeer {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  requestedAt: string;
}

/**
 * WebRTC Signaling Data Payloads
 */
export interface JoinRoomPayload {
  roomId: string;
  inviteToken?: string;
  user?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
  initialMediaState?: {
    isAudioMuted?: boolean;
    isVideoOff?: boolean;
  };
}

export interface KnockDecisionPayload {
  roomId: string;
  targetSocketId: string;
}

export interface WebRtcOfferPayload {
  targetSocketId: string;
  sdp: RTCSessionDescriptionData;
}

export interface WebRtcAnswerPayload {
  targetSocketId: string;
  sdp: RTCSessionDescriptionData;
}

export interface WebRtcIceCandidatePayload {
  targetSocketId: string;
  candidate: RTCIceCandidateData;
}

/**
 * Live Room Media Controls
 */
export interface ToggleMediaPayload {
  roomId: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
}

/**
 * Live Room Chat
 */
export interface SendChatMessagePayload {
  roomId: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
}

export interface EmojiReactionPayload {
  roomId: string;
  emoji: string;
  startX?: number;
}

export interface KickPeerPayload {
  roomId: string;
  targetSocketId: string;
  targetUserId?: string;
  reason?: string;
}

export interface ToggleScreenSharePayload {
  roomId: string;
  isScreenSharing: boolean;
}
