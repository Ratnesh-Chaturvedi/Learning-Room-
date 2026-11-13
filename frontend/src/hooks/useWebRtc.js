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
 * Helper to safely find audio and video transceivers on a RTCPeerConnection
 */
function getAudioTransceiver(pc) {
  if (!pc?.getTransceivers) return null;
  const list = pc.getTransceivers();
  return (
    list.find(
      (t) =>
        t.sender?.track?.kind === 'audio' ||
        t.receiver?.track?.kind === 'audio' ||
        t.mid === '0'
    ) || list[0] || null
  );
}

function getVideoTransceiver(pc) {
  if (!pc?.getTransceivers) return null;
  const list = pc.getTransceivers();
  return (
    list.find(
      (t) =>
        t.sender?.track?.kind === 'video' ||
        t.receiver?.track?.kind === 'video' ||
        t.mid === '1'
    ) || list[1] || null
  );
}

/**
 * useWebRtc Hook
 * Production WebRTC Mesh implementation managing:
 * - Local camera and microphone stream capture with guaranteed hardware LED release on toggle
 * - Dynamic RTCPeerConnection negotiation (offer/answer/ICE)
 * - Remote peer audio and video stream mapping with live unmute/mute reactive state
 * - Full Google Meet style screen sharing with dynamic spotlight support
 */
export function useWebRtc({ roomId, socket, user: _user, isMuted, isVideoOn, isEnabled = true }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [mediaError, setMediaError] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  // Stable MediaStream instance guaranteed to exist from hook mount
  const localStreamRef = useRef(new MediaStream());
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const pendingCandidatesRef = useRef({}); // { [socketId]: RTCIceCandidate[] }

  const isMutedRef = useRef(isMuted);
  const isVideoOnRef = useRef(isVideoOn);
  const isScreenSharingRef = useRef(isScreenSharing);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isVideoOnRef.current = isVideoOn;
  }, [isVideoOn]);

  useEffect(() => {
    isScreenSharingRef.current = isScreenSharing;
  }, [isScreenSharing]);

  // Helper: Return the currently active local video track (screen track takes precedence over camera)
  const getActiveLocalVideoTrack = useCallback(() => {
    if (isScreenSharingRef.current && screenStreamRef.current) {
      const sTrack = screenStreamRef.current.getVideoTracks().find((t) => t.readyState === 'live');
      if (sTrack) return sTrack;
    }
    if (isVideoOnRef.current && localStreamRef.current) {
      const cTrack = localStreamRef.current.getVideoTracks().find((t) => t.readyState === 'live');
      if (cTrack) return cTrack;
    }
    return null;
  }, []);

  // Helper: Safely generate and send a renegotiation SDP offer to a specific peer
  const renegotiate = useCallback(
    async (pc, targetSocketId) => {
      if (!pc || !socket || pc.signalingState === 'closed') return;
      try {
        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', {
          targetSocketId,
          sdp: offer,
        });
      } catch (err) {
        console.warn('[WebRTC] Renegotiation offer error for peer:', targetSocketId, err);
      }
    },
    [socket]
  );

  // Helper: Renegotiate with all currently connected peers
  const renegotiateAllPeers = useCallback(async () => {
    const entries = Object.entries(peerConnectionsRef.current);
    for (const [targetSocketId, pc] of entries) {
      await renegotiate(pc, targetSocketId);
    }
  }, [renegotiate]);

  // Helper: Create and configure RTCPeerConnection for a specific remote peer
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      if (peerConnectionsRef.current[targetSocketId]) {
        const existingPc = peerConnectionsRef.current[targetSocketId];
        if (existingPc.connectionState !== 'closed' && existingPc.connectionState !== 'failed') {
          return existingPc;
        }
        try {
          existingPc.close();
        } catch {}
        delete peerConnectionsRef.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current[targetSocketId] = pc;

      // Pre-allocate audio and video transceivers with stable stream reference
      // so initial SDP offer/answer always contains both m=audio and m=video sections.
      try {
        const stream = localStreamRef.current;
        pc.addTransceiver('audio', { direction: 'sendrecv', streams: [stream] });
        pc.addTransceiver('video', { direction: 'sendrecv', streams: [stream] });
      } catch (err) {
        console.warn('[WebRTC] addTransceiver fallback:', err);
      }

      // Attach current live audio and video tracks immediately
      const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
      const activeVideoTrack = getActiveLocalVideoTrack();

      const audioT = getAudioTransceiver(pc);
      const videoT = getVideoTransceiver(pc);

      if (audioT && audioTrack) {
        audioT.sender.replaceTrack(audioTrack).catch(() => {});
      }
      if (videoT && activeVideoTrack) {
        videoT.sender.replaceTrack(activeVideoTrack).catch(() => {});
      }

      // Handle local ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc:ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle incoming remote media tracks (audio, camera video, screen share)
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          let stream = prev[targetSocketId];
          if (!stream) {
            stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream();
          }

          // Clean up ended or replaced tracks of same kind
          stream.getTracks().forEach((existingTrack) => {
            if (
              existingTrack.kind === event.track.kind &&
              (existingTrack.readyState === 'ended' || existingTrack.id !== event.track.id)
            ) {
              stream.removeTrack(existingTrack);
            }
          });

          // Ensure incoming track is in the MediaStream
          if (!stream.getTracks().some((t) => t.id === event.track.id)) {
            stream.addTrack(event.track);
          }

          return {
            ...prev,
            [targetSocketId]: new MediaStream(stream.getTracks()),
          };
        });

        // Listen for track unmute / mute / ended events
        // and immediately refresh the MediaStream reference so React state updates and video/audio play!
        const triggerStreamRefresh = () => {
          setRemoteStreams((prev) => {
            const currentStream = prev[targetSocketId];
            if (!currentStream) return prev;
            return {
              ...prev,
              [targetSocketId]: new MediaStream(currentStream.getTracks()),
            };
          });
        };

        event.track.onunmute = triggerStreamRefresh;
        event.track.onmute = triggerStreamRefresh;
        event.track.onended = triggerStreamRefresh;
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
    [socket, getActiveLocalVideoTrack]
  );

  // 1. Initialize Local Media Stream (Microphone always; camera if isVideoOn is initially true)
  useEffect(() => {
    if (!isEnabled) return;
    let isMounted = true;
    const localStreamInstance = localStreamRef.current;

    const startLocalMedia = async () => {
      try {
        let audioStream = null;
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (audioErr) {
          console.warn('[WebRTC] Microphone unavailable, starting empty stream:', audioErr);
        }

        if (!isMounted) {
          audioStream?.getTracks().forEach((t) => t.stop());
          return;
        }

        if (audioStream) {
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = !isMutedRef.current;
            localStreamInstance.addTrack(audioTrack);
          }
        }

        // If video was initially requested, acquire camera video
        if (isVideoOnRef.current) {
          try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 24 },
              },
            });
            if (isMounted) {
              const videoTrack = videoStream.getVideoTracks()[0];
              if (videoTrack) {
                localStreamInstance.addTrack(videoTrack);
              }
            } else {
              videoStream.getTracks().forEach((t) => t.stop());
            }
          } catch (vidErr) {
            console.warn('[WebRTC] Camera unavailable on startup:', vidErr);
          }
        }

        if (isMounted) {
          setLocalStream(new MediaStream(localStreamInstance.getTracks()));
          setMediaError(null);
        }
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
      const screenStreamInstance = screenStreamRef.current;
      if (localStreamInstance) {
        localStreamInstance.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamInstance) {
        screenStreamInstance.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try {
          pc.close();
        } catch (_e) {}
      });
      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};
    };
  }, [isEnabled]);

  // 2. Synchronize Mute (Audio Track) state
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // 3. Synchronize Video (Camera Track) state with true hardware release & LED turn-off, and renegotiate
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

            // If not screen sharing, replace video sender with null and renegotiate across all peers
            if (!screenStreamRef.current) {
              for (const pc of Object.values(peerConnectionsRef.current)) {
                const videoT = getVideoTransceiver(pc);
                if (videoT?.sender) {
                  await videoT.sender.replaceTrack(null).catch(() => {});
                }
              }
              await renegotiateAllPeers();
            }
            setLocalStream(new MediaStream(stream.getTracks()));
          }
        } else {
          // Camera turned ON: If no active live video track, acquire fresh camera hardware
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

                // If not screen sharing, replace video sender with new camera track and renegotiate
                if (!screenStreamRef.current) {
                  for (const pc of Object.values(peerConnectionsRef.current)) {
                    const videoT = getVideoTransceiver(pc);
                    if (videoT) {
                      try {
                        videoT.direction = 'sendrecv';
                      } catch {}
                      if (videoT.sender) {
                        await videoT.sender.replaceTrack(newVideoTrack).catch(() => {});
                      }
                    }
                  }
                  await renegotiateAllPeers();
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
  }, [isVideoOn, renegotiateAllPeers]);

  // 4. Attach local tracks to all existing peer connections whenever local stream changes & renegotiate
  useEffect(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks().find((t) => t.readyState === 'live');
    const activeVideoTrack = getActiveLocalVideoTrack();

    Object.entries(peerConnectionsRef.current).forEach(([targetSocketId, pc]) => {
      const audioT = getAudioTransceiver(pc);
      const videoT = getVideoTransceiver(pc);

      if (audioT && audioTrack) {
        audioT.sender.replaceTrack(audioTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing audio track:', targetSocketId, err);
        });
      }
      if (videoT && activeVideoTrack) {
        videoT.sender.replaceTrack(activeVideoTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing video track:', targetSocketId, err);
        });
      }
      renegotiate(pc, targetSocketId);
    });
  }, [localStream, getActiveLocalVideoTrack, renegotiate]);

  // 5. WebRTC Signaling Listeners
  useEffect(() => {
    if (!socket || !isEnabled) return;

    // A. When existing peers in room are received, initiate offer to each
    const handleRoomPeers = async ({ peers }) => {
      if (!peers || !Array.isArray(peers)) return;

      for (const peer of peers) {
        const targetSocketId = peer.socketId;
        if (!targetSocketId || targetSocketId === socket.id) continue;

        try {
          const pc = createPeerConnection(targetSocketId);

          // Ensure current active tracks are in place before creating offer
          const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
          const activeVideoTrack = getActiveLocalVideoTrack();
          const audioT = getAudioTransceiver(pc);
          const videoT = getVideoTransceiver(pc);
          if (audioT && audioTrack) audioT.sender.replaceTrack(audioTrack).catch(() => {});
          if (videoT && activeVideoTrack) videoT.sender.replaceTrack(activeVideoTrack).catch(() => {});

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

        // Ensure current active tracks are in place before answering
        const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
        const activeVideoTrack = getActiveLocalVideoTrack();
        const audioT = getAudioTransceiver(pc);
        const videoT = getVideoTransceiver(pc);
        if (audioT && audioTrack) audioT.sender.replaceTrack(audioTrack).catch(() => {});
        if (videoT && activeVideoTrack) videoT.sender.replaceTrack(activeVideoTrack).catch(() => {});

        // Handle offer collision with polite rollback
        if (pc.signalingState !== 'stable') {
          if (socket.id && callerSocketId && socket.id > callerSocketId) {
            try {
              await pc.setLocalDescription({ type: 'rollback' });
            } catch (_e) {}
          } else {
            // Impolite peer ignores colliding incoming offer
            return;
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        // Flush any queued ICE candidates
        if (pendingCandidatesRef.current[callerSocketId]) {
          for (const cand of pendingCandidatesRef.current[callerSocketId]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
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
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));

          // Flush queued candidates
          if (pendingCandidatesRef.current[responderSocketId]) {
            for (const cand of pendingCandidatesRef.current[responderSocketId]) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch {}
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
          if (!pendingCandidatesRef.current[senderSocketId]) {
            pendingCandidatesRef.current[senderSocketId] = [];
          }
          pendingCandidatesRef.current[senderSocketId].push(candidate);
        }
      } catch (err) {
        console.warn('[WebRTC] Error adding ICE candidate from peer:', senderSocketId, err);
      }
    };

    // E. Handle peer joined (pre-allocate peer connection)
    const handlePeerJoined = ({ socketId }) => {
      if (!socketId || socketId === socket.id) return;
      createPeerConnection(socketId);
    };

    // F. Handle peer disconnecting
    const handlePeerLeft = ({ socketId }) => {
      if (socketId === 'all') {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          try {
            pc.close();
          } catch {}
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
    socket.on('webrtc:peer-joined', handlePeerJoined);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:peer-left', handlePeerLeft);

    return () => {
      socket.off('webrtc:room-peers', handleRoomPeers);
      socket.off('room:knock-approved', handleRoomPeers);
      socket.off('webrtc:peer-joined', handlePeerJoined);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:peer-left', handlePeerLeft);
    };
  }, [socket, createPeerConnection, getActiveLocalVideoTrack, isEnabled]);

  // Stop screen sharing and restore camera video track
  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);

    // Restore camera video track on all peer connections if video is on, otherwise null
    const cameraTrack = isVideoOnRef.current
      ? localStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
      : null;

    for (const [targetSocketId, pc] of Object.entries(peerConnectionsRef.current)) {
      const videoT = getVideoTransceiver(pc);
      if (videoT?.sender) {
        await videoT.sender.replaceTrack(cameraTrack).catch((err) => {
          console.warn('[WebRTC] Error restoring camera track:', targetSocketId, err);
        });
      }
    }
    await renegotiateAllPeers();

    if (socket && roomId) {
      socket.emit('media:toggle-screenshare', { roomId, isScreenSharing: false });
    }
  }, [socket, roomId, renegotiateAllPeers]);

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
      for (const [targetSocketId, pc] of Object.entries(peerConnectionsRef.current)) {
        const videoT = getVideoTransceiver(pc);
        if (videoT) {
          try {
            videoT.direction = 'sendrecv';
          } catch {}
          if (videoT.sender) {
            await videoT.sender.replaceTrack(screenTrack).catch((err) => {
              console.warn('[WebRTC] Error replacing with screen track:', targetSocketId, err);
            });
          }
        }
      }
      await renegotiateAllPeers();

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
  }, [socket, roomId, stopScreenShare, renegotiateAllPeers]);

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