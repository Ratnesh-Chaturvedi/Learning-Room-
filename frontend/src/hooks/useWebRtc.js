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
 * Helpers to safely find audio, camera video, and screen video transceivers on a RTCPeerConnection
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

function getCameraTransceiver(pc) {
  if (!pc?.getTransceivers) return null;
  const list = pc.getTransceivers();
  const videoTransceivers = list.filter(
    (t) =>
      t.sender?.track?.kind === 'video' ||
      t.receiver?.track?.kind === 'video' ||
      t.mid === '1'
  );
  return videoTransceivers[0] || null;
}

function getScreenTransceiver(pc) {
  if (!pc?.getTransceivers) return null;
  const list = pc.getTransceivers();
  const videoTransceivers = list.filter(
    (t) =>
      t.sender?.track?.kind === 'video' ||
      t.receiver?.track?.kind === 'video' ||
      t.mid === '2'
  );
  return videoTransceivers[1] || null;
}

// WebRTC mesh hook managing multi-stream media, peer connections, and signaling
export function useWebRtc({ roomId, socket, user: _user, isMuted, isVideoOn, isEnabled = true }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream } (camera + audio)
  const [remoteScreenStreams, setRemoteScreenStreams] = useState({}); // { [socketId]: MediaStream } (screen share)
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

  // Helper: Create and configure RTCPeerConnection for a specific remote peer with 3 pre-allocated transceivers
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

      // Pre-allocate audio (mid 0), camera (mid 1), and screen (mid 2) transceivers
      try {
        const stream = localStreamRef.current;
        pc.addTransceiver('audio', { direction: 'sendrecv', streams: [stream] });
        pc.addTransceiver('video', { direction: 'sendrecv', streams: [stream] });
        pc.addTransceiver('video', { direction: 'sendrecv' });
      } catch (err) {
        console.warn('[WebRTC] addTransceiver fallback:', err);
      }

      // Attach current live audio, camera, and screen tracks immediately
      const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
      const cameraTrack = isVideoOnRef.current
        ? localStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
        : null;
      const screenTrack = isScreenSharingRef.current
        ? screenStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
        : null;

      const audioT = getAudioTransceiver(pc);
      const cameraT = getCameraTransceiver(pc);
      const screenT = getScreenTransceiver(pc);

      if (audioT && audioTrack) {
        audioT.sender.replaceTrack(audioTrack).catch(() => {});
      }
      if (cameraT && cameraTrack) {
        cameraT.sender.replaceTrack(cameraTrack).catch(() => {});
      }
      if (screenT && screenTrack) {
        screenT.sender.replaceTrack(screenTrack).catch(() => {});
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
        const track = event.track;
        const transceiver = event.transceiver;
        const screenT = getScreenTransceiver(pc);
        const isScreen =
          transceiver === screenT ||
          transceiver?.mid === '2' ||
          (track.kind === 'video' &&
            pc.getTransceivers().filter((t) => t.receiver?.track?.kind === 'video')[1] === transceiver);

        if (track.kind === 'audio') {
          // Audio track belongs in remoteStreams
          setRemoteStreams((prev) => {
            let stream = prev[targetSocketId];
            if (!stream) {
              stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream();
            }
            stream.getAudioTracks().forEach((existingTrack) => {
              if (existingTrack.id !== track.id) {
                stream.removeTrack(existingTrack);
              }
            });
            if (!stream.getTracks().some((t) => t.id === track.id)) {
              stream.addTrack(track);
            }
            return {
              ...prev,
              [targetSocketId]: new MediaStream(stream.getTracks()),
            };
          });
        } else if (isScreen) {
          // Screen share video track belongs in remoteScreenStreams
          setRemoteScreenStreams((prev) => {
            let stream = prev[targetSocketId];
            if (!stream) {
              stream = new MediaStream();
            }
            stream.getVideoTracks().forEach((existingTrack) => {
              if (existingTrack.id !== track.id) {
                stream.removeTrack(existingTrack);
              }
            });
            if (!stream.getTracks().some((t) => t.id === track.id)) {
              stream.addTrack(track);
            }
            return {
              ...prev,
              [targetSocketId]: new MediaStream(stream.getTracks()),
            };
          });
        } else {
          // Camera video track belongs in remoteStreams
          setRemoteStreams((prev) => {
            let stream = prev[targetSocketId];
            if (!stream) {
              stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream();
            }
            stream.getVideoTracks().forEach((existingTrack) => {
              if (existingTrack.id !== track.id) {
                stream.removeTrack(existingTrack);
              }
            });
            if (!stream.getTracks().some((t) => t.id === track.id)) {
              stream.addTrack(track);
            }
            return {
              ...prev,
              [targetSocketId]: new MediaStream(stream.getTracks()),
            };
          });
        }

        // Listen for track unmute / mute / ended events
        const triggerStreamRefresh = () => {
          if (isScreen) {
            setRemoteScreenStreams((prev) => {
              const currentStream = prev[targetSocketId];
              if (!currentStream) return prev;
              return {
                ...prev,
                [targetSocketId]: new MediaStream(currentStream.getTracks()),
              };
            });
          } else {
            setRemoteStreams((prev) => {
              const currentStream = prev[targetSocketId];
              if (!currentStream) return prev;
              return {
                ...prev,
                [targetSocketId]: new MediaStream(currentStream.getTracks()),
              };
            });
          }
        };

        track.onunmute = triggerStreamRefresh;
        track.onmute = triggerStreamRefresh;
        track.onended = triggerStreamRefresh;
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
          setRemoteScreenStreams((prev) => {
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

            // Replace camera video sender with null and renegotiate across all peers
            for (const pc of Object.values(peerConnectionsRef.current)) {
              const cameraT = getCameraTransceiver(pc);
              if (cameraT?.sender) {
                await cameraT.sender.replaceTrack(null).catch(() => {});
              }
            }
            await renegotiateAllPeers();
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

                // Replace camera video sender with new camera track and renegotiate
                for (const pc of Object.values(peerConnectionsRef.current)) {
                  const cameraT = getCameraTransceiver(pc);
                  if (cameraT) {
                    try {
                      cameraT.direction = 'sendrecv';
                    } catch {}
                    if (cameraT.sender) {
                      await cameraT.sender.replaceTrack(newVideoTrack).catch(() => {});
                    }
                  }
                }
                await renegotiateAllPeers();
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
    const cameraTrack = localStream.getVideoTracks().find((t) => t.readyState === 'live') || null;

    Object.entries(peerConnectionsRef.current).forEach(([targetSocketId, pc]) => {
      const audioT = getAudioTransceiver(pc);
      const cameraT = getCameraTransceiver(pc);

      if (audioT && audioTrack) {
        audioT.sender.replaceTrack(audioTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing audio track:', targetSocketId, err);
        });
      }
      if (cameraT && cameraTrack) {
        cameraT.sender.replaceTrack(cameraTrack).catch((err) => {
          console.warn('[WebRTC] Error replacing camera video track:', targetSocketId, err);
        });
      }
      renegotiate(pc, targetSocketId);
    });
  }, [localStream, renegotiate]);

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

          const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
          const cameraTrack = isVideoOnRef.current
            ? localStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
            : null;
          const screenTrack = isScreenSharingRef.current
            ? screenStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
            : null;

          const audioT = getAudioTransceiver(pc);
          const cameraT = getCameraTransceiver(pc);
          const screenT = getScreenTransceiver(pc);

          if (audioT && audioTrack) audioT.sender.replaceTrack(audioTrack).catch(() => {});
          if (cameraT && cameraTrack) cameraT.sender.replaceTrack(cameraTrack).catch(() => {});
          if (screenT && screenTrack) screenT.sender.replaceTrack(screenTrack).catch(() => {});

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

        const audioTrack = localStreamRef.current?.getAudioTracks().find((t) => t.readyState === 'live');
        const cameraTrack = isVideoOnRef.current
          ? localStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
          : null;
        const screenTrack = isScreenSharingRef.current
          ? screenStreamRef.current?.getVideoTracks().find((t) => t.readyState === 'live') || null
          : null;

        const audioT = getAudioTransceiver(pc);
        const cameraT = getCameraTransceiver(pc);
        const screenT = getScreenTransceiver(pc);

        if (audioT && audioTrack) audioT.sender.replaceTrack(audioTrack).catch(() => {});
        if (cameraT && cameraTrack) cameraT.sender.replaceTrack(cameraTrack).catch(() => {});
        if (screenT && screenTrack) screenT.sender.replaceTrack(screenTrack).catch(() => {});

        // Handle offer collision with polite rollback
        if (pc.signalingState !== 'stable') {
          if (socket.id && callerSocketId && socket.id > callerSocketId) {
            try {
              await pc.setLocalDescription({ type: 'rollback' });
            } catch (_e) {}
          } else {
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
        setRemoteScreenStreams({});
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
      setRemoteScreenStreams((prev) => {
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
  }, [socket, createPeerConnection, isEnabled]);

  // Stop screen sharing (completely separated from camera)
  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);

    // Stop screen track on screen transceiver across all peers (camera track remains untouched)
    for (const [targetSocketId, pc] of Object.entries(peerConnectionsRef.current)) {
      const screenT = getScreenTransceiver(pc);
      if (screenT?.sender) {
        await screenT.sender.replaceTrack(null).catch((err) => {
          console.warn('[WebRTC] Error removing screen track:', targetSocketId, err);
        });
      }
    }
    await renegotiateAllPeers();

    if (socket && roomId) {
      socket.emit('media:toggle-screenshare', { roomId, isScreenSharing: false });
    }
  }, [socket, roomId, renegotiateAllPeers]);

  // Start screen sharing (Google Meet style display capture; does not require camera)
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

      // Attach screen track to screen transceiver across all active peer connections
      for (const [targetSocketId, pc] of Object.entries(peerConnectionsRef.current)) {
        const screenT = getScreenTransceiver(pc);
        if (screenT) {
          try {
            screenT.direction = 'sendrecv';
          } catch {}
          if (screenT.sender) {
            await screenT.sender.replaceTrack(screenTrack).catch((err) => {
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
    remoteScreenStreams,
    mediaError,
    isScreenSharing,
    screenStream,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}

export default useWebRtc;
