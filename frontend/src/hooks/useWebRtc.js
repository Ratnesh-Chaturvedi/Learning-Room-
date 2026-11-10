import { useState, useEffect, useRef, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const pendingCandidatesRef = useRef({}); // { [socketId]: RTCIceCandidate[] }

  // 1. Initialize Local Media Stream (Microphone always, Camera only if isVideoOn is true)
  useEffect(() => {
    let isMounted = true;

    const startLocalMedia = async () => {
      try {
        let stream = null;
        if (isVideoOn) {
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
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
          }
        } else {
          // Camera is NOT on: only request microphone. Never touch or activate camera hardware.
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
          } catch (audioErr) {
            console.warn('[WebRTC] Microphone unavailable, starting empty stream:', audioErr);
            stream = new MediaStream();
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Apply initial mute/video states
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMuted;
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
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
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

  // 3. Synchronize Video (Camera Track) state with true hardware release & LED turn-off
  const isTogglingVideoRef = useRef(false);
  useEffect(() => {
    const handleVideoSync = async () => {
      if (!localStreamRef.current || isTogglingVideoRef.current) return;
      isTogglingVideoRef.current = true;
      try {
        const stream = localStreamRef.current;
        const currentVideoTracks = stream.getVideoTracks();

        if (!isVideoOn) {
          // Camera turned OFF: Stop all video tracks so webcam hardware LED immediately turns OFF!
          if (currentVideoTracks.length > 0) {
            currentVideoTracks.forEach((t) => {
              t.stop();
              stream.removeTrack(t);
            });
            // If not screen sharing, replace video sender with null across all active peer connections
            if (!screenStreamRef.current) {
              Object.values(peerConnectionsRef.current).forEach((pc) => {
                // Index 1 is always the video transceiver (audio is index 0)
                const videoT = pc.getTransceivers ? pc.getTransceivers()[1] : null;
                if (videoT?.sender) {
                  videoT.sender.replaceTrack(null).catch(() => {});
                }
              });
            }
            setLocalStream(new MediaStream(stream.getTracks()));
          }
        } else {
          // Camera turned ON: If no active video track, acquire camera hardware
          const activeTrack = currentVideoTracks.find((t) => t.readyState === 'live');
          if (!activeTrack) {
            try {
              const freshMedia = await navigator.mediaDevices.getUserMedia({
                video: {
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  frameRate: { ideal: 24 },
                },
              });
              const newVideoTrack = freshMedia.getVideoTracks()[0];
              if (newVideoTrack) {
                stream.addTrack(newVideoTrack);
                if (!screenStreamRef.current) {
                  Object.values(peerConnectionsRef.current).forEach((pc) => {
                    // Index 1 is always the video transceiver (audio is index 0)
                    const videoT = pc.getTransceivers ? pc.getTransceivers()[1] : null;
                    if (videoT?.sender) {
                      videoT.sender.replaceTrack(newVideoTrack).catch(() => {});
                    }
                  });
                }
                setLocalStream(new MediaStream(stream.getTracks()));
              }
            } catch (err) {
              console.warn('[WebRTC] Unable to re-acquire camera video track:', err);
            }
          }
        }
      } finally {
        isTogglingVideoRef.current = false;
      }
    };

    handleVideoSync();
  }, [isVideoOn]);

  // 4. Attach local tracks to all existing peer connections when local stream becomes available
  useEffect(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    const videoTrack = localStream.getVideoTracks()[0];

    Object.entries(peerConnectionsRef.current).forEach(([targetSocketId, pc]) => {
      // Transceivers are always added in order: index 0 = audio, index 1 = video.
      // Using index lookup is safe on both caller and answerer because addTransceiver
      // was called audio-first. Avoid t.receiver.track.kind — it is null on the
      // caller side before remote SDP is applied.
      const transceivers = pc.getTransceivers();
      const audioT = transceivers[0];
      const videoT = transceivers[1];

      if (audioT && audioTrack) {
        audioT.sender.replaceTrack(audioTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing audio track:', targetSocketId, err);
        });
      }
      if (videoT && videoTrack) {
        videoT.sender.replaceTrack(videoTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing video track:', targetSocketId, err);
        });
      }
    });
  }, [localStream]);

  // Helper: Create a RTCPeerConnection for a specific remote peer
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      if (peerConnectionsRef.current[targetSocketId]) {
        return peerConnectionsRef.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current[targetSocketId] = pc;

      // Always pre-allocate audio and video transceivers so initial SDP offer/answer
      // ALWAYS includes m=audio and m=video sections even if hardware stream isn't ready yet!
      try {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        pc.addTransceiver('video', { direction: 'sendrecv' });
      } catch (err) {
        console.warn('[WebRTC] addTransceiver fallback:', err);
      }

      // Add local stream tracks to transceivers if stream is already initialized
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        // Index 0 = audio transceiver, index 1 = video transceiver (matches addTransceiver order above)
        const transceivers = pc.getTransceivers();
        const audioT = transceivers[0];
        const videoT = transceivers[1];

        if (audioT && audioTrack) {
          audioT.sender.replaceTrack(audioTrack).catch(() => {});
        }
        if (videoT && videoTrack) {
          videoT.sender.replaceTrack(videoTrack).catch(() => {});
        }
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
      // Use event.streams[0] directly — creating a snapshot with new MediaStream(...)
      // breaks React re-renders because the object reference never changes on subsequent tracks.
      pc.ontrack = (event) => {
        const incomingStream = event.streams && event.streams[0];
        if (!incomingStream) {
          // Fallback: wrap single track when stream isn't provided (rare)
          setRemoteStreams((prev) => ({
            ...prev,
            [targetSocketId]: prev[targetSocketId] || new MediaStream([event.track]),
          }));
          return;
        }
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: incomingStream,
        }));
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
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

  // 5. WebRTC Signaling Listeners
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

        // Ensure current local tracks are attached to transceivers before answering
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          // Use index because on the answerer side receiver tracks are also null
          // until after setRemoteDescription — using index is always safe here.
          const transceivers = pc.getTransceivers();
          const audioT = transceivers[0];
          const videoT = transceivers[1];
          if (audioT && audioTrack) audioT.sender.replaceTrack(audioTrack).catch(() => {});
          if (videoT && videoTrack) videoT.sender.replaceTrack(videoTrack).catch(() => {});
        }

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
      // 'all' is emitted when host terminates the room — close every peer connection
      if (socketId === 'all') {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          try { pc.close(); } catch {}
        });
        peerConnectionsRef.current = {};
        pendingCandidatesRef.current = {};
        setRemoteStreams({});
        return;
      }
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
    socket.on('room:knock-approved', handleRoomPeers);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:peer-left', handlePeerLeft);

    return () => {
      socket.off('webrtc:room-peers', handleRoomPeers);
      socket.off('room:knock-approved', handleRoomPeers);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:peer-left', handlePeerLeft);
    };
  }, [socket, createPeerConnection]);

  // Stop screen sharing and restore camera video track
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);

    // Restore local camera video track on all peer connections
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    Object.entries(peerConnectionsRef.current).forEach(([targetSocketId, pc]) => {
      // Index 1 is always the video transceiver (audio was added first)
      const videoSender = pc.getTransceivers()[1]?.sender;
      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack).catch((err) => {
          console.warn('[WebRTC] Error restoring camera track:', targetSocketId, err);
        });
      }
    });

    if (socket && roomId) {
      socket.emit('media:toggle-screenshare', { roomId, isScreenSharing: false });
    }
  }, [socket, roomId]);

  // Start screen sharing (Google Meet style display capture)
  const startScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported by your current browser.');
        return false;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) return false;

      screenStreamRef.current = displayStream;
      setScreenStream(displayStream);
      setIsScreenSharing(true);

      // Replace video track with screen track across all active peer connections
      Object.entries(peerConnectionsRef.current).forEach(([targetSocketId, pc]) => {
        // Index 1 is always the video transceiver (audio was added first at index 0)
        const videoSender = pc.getTransceivers()[1]?.sender;
        if (videoSender) {
          videoSender.replaceTrack(screenTrack).catch((err) => {
            console.warn('[WebRTC] Error replacing with screen track:', targetSocketId, err);
          });
        }
      });

      // Notify other peers in the room
      if (socket && roomId) {
        socket.emit('media:toggle-screenshare', { roomId, isScreenSharing: true });
      }

      // Handle user clicking native browser "Stop sharing" floating bar
      screenTrack.onended = () => {
        stopScreenShare();
      };

      return true;
    } catch (err) {
      console.warn('[WebRTC] Screen sharing cancelled or failed:', err);
      return false;
    }
  }, [socket, roomId, stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return false;
    } else {
      return await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  return {
    localStream,
    remoteStreams,
    mediaError,
    isScreenSharing,
    screenStream,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}

export default useWebRtc;
