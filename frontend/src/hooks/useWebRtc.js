import { useState, useEffect, useRef, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * useWebRtc Hook
 * Production WebRTC Mesh implementation managing:
 * - Local camera and microphone stream capture
 * - Dynamic RTCPeerConnection negotiation (offer/answer/ICE)
 * - Remote peer audio and video stream mapping
 * - Real-time track mute/enable toggling without dropping peer connections
 */
export function useWebRtc({ roomId, socket, user, isMuted, isVideoOn }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [mediaError, setMediaError] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const pendingCandidatesRef = useRef({}); // { [socketId]: RTCIceCandidate[] }

  // 1. Initialize Local Media Stream (Camera + Microphone)
  useEffect(() => {
    let isMounted = true;

    const startLocalMedia = async () => {
      try {
        let stream = null;
        try {
          // Attempt Video + Audio
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 24 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (videoError) {
          console.warn('[WebRTC] Camera unavailable or permission denied, falling back to audio only:', videoError);
          // Fallback to audio only
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Apply initial mute/video states
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMuted;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = isVideoOn;
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        setMediaError(null);
      } catch (err) {
        console.error('[WebRTC] Failed to capture microphone or camera:', err);
        if (isMounted) {
          setMediaError('Microphone or Camera access was denied or not found.');
        }
      }
    };

    startLocalMedia();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      // Close all peer connections on unmount
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try {
          pc.close();
        } catch {}
      });
      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};
    };
  }, []);

  // 2. Synchronize Mute (Audio Track) state
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // 3. Synchronize Video (Camera Track) state
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOn;
      });
    }
  }, [isVideoOn]);

  // Helper: Create a RTCPeerConnection for a specific remote peer
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      if (peerConnectionsRef.current[targetSocketId]) {
        return peerConnectionsRef.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current[targetSocketId] = pc;

      // Add local stream tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc:ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle incoming remote audio/video tracks
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream) {
          setRemoteStreams((prev) => ({
            ...prev,
            [targetSocketId]: stream,
          }));
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[targetSocketId];
            return next;
          });
        }
      };

      return pc;
    },
    [socket]
  );

  // 4. WebRTC Signaling Listeners
  useEffect(() => {
    if (!socket) return;

    // A. When existing peers in room are received, initiate offer to each
    const handleRoomPeers = async ({ peers }) => {
      if (!peers || !Array.isArray(peers)) return;

      for (const peer of peers) {
        const targetSocketId = peer.socketId;
        if (!targetSocketId || targetSocketId === socket.id) continue;

        try {
          const pc = createPeerConnection(targetSocketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('webrtc:offer', {
            targetSocketId,
            sdp: offer,
          });
        } catch (err) {
          console.warn('[WebRTC] Error initiating offer to peer:', targetSocketId, err);
        }
      }
    };

    // B. Handle incoming Offer from a peer
    const handleOffer = async ({ callerSocketId, sdp }) => {
      if (!callerSocketId || !sdp) return;

      try {
        const pc = createPeerConnection(callerSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        // Flush any pending ICE candidates queued before remote description was set
        if (pendingCandidatesRef.current[callerSocketId]) {
          for (const cand of pendingCandidatesRef.current[callerSocketId]) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
          delete pendingCandidatesRef.current[callerSocketId];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          targetSocketId: callerSocketId,
          sdp: answer,
        });
      } catch (err) {
        console.warn('[WebRTC] Error answering offer from peer:', callerSocketId, err);
      }
    };

    // C. Handle incoming Answer from a peer
    const handleAnswer = async ({ responderSocketId, sdp }) => {
      if (!responderSocketId || !sdp) return;

      try {
        const pc = peerConnectionsRef.current[responderSocketId];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));

          // Flush queued candidates
          if (pendingCandidatesRef.current[responderSocketId]) {
            for (const cand of pendingCandidatesRef.current[responderSocketId]) {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            delete pendingCandidatesRef.current[responderSocketId];
          }
        }
      } catch (err) {
        console.warn('[WebRTC] Error setting remote answer from peer:', responderSocketId, err);
      }
    };

    // D. Handle incoming ICE Candidate
    const handleIceCandidate = async ({ senderSocketId, candidate }) => {
      if (!senderSocketId || !candidate) return;

      try {
        const pc = peerConnectionsRef.current[senderSocketId];
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate until setRemoteDescription finishes
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }
          pendingCandidatesRef.current[senderSocketId].push(candidate);
        }
      } catch (err) {
        console.warn('[WebRTC] Error adding ICE candidate from peer:', senderSocketId, err);
      }
    };

    // E. Handle peer disconnecting
    const handlePeerLeft = ({ socketId }) => {
      if (peerConnectionsRef.current[socketId]) {
        try {
          peerConnectionsRef.current[socketId].close();
        } catch {}
        delete peerConnectionsRef.current[socketId];
      }
      delete pendingCandidatesRef.current[socketId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on('webrtc:room-peers', handleRoomPeers);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:peer-left', handlePeerLeft);

    return () => {
      socket.off('webrtc:room-peers', handleRoomPeers);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:peer-left', handlePeerLeft);
    };
  }, [socket, createPeerConnection]);

  return {
    localStream,
    remoteStreams,
    mediaError,
  };
}

export default useWebRtc;

