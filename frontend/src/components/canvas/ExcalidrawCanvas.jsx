import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

/**
 * Default sample elements for the landing page FloatingMockup preview
 */
const DEFAULT_PREVIEW_ELEMENTS = [
  {
    id: 'rect-1',
    type: 'rectangle',
    x: 80,
    y: 80,
    width: 220,
    height: 120,
    strokeColor: '#635bdb',
    backgroundColor: '#eeecff',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    roundness: { type: 3 },
  },
  {
    id: 'text-1',
    type: 'text',
    x: 105,
    y: 125,
    width: 170,
    height: 30,
    fontSize: 20,
    fontFamily: 1,
    text: 'System Design Room',
    textAlign: 'left',
    verticalAlign: 'top',
    strokeColor: '#39318f',
  },
  {
    id: 'arrow-1',
    type: 'arrow',
    x: 300,
    y: 140,
    width: 140,
    height: 0,
    strokeColor: '#248a62',
    strokeWidth: 2,
    roughness: 1,
    points: [
      [0, 0],
      [140, 0],
    ],
  },
  {
    id: 'rect-2',
    type: 'rectangle',
    x: 440,
    y: 80,
    width: 180,
    height: 120,
    strokeColor: '#248a62',
    backgroundColor: '#e6f7ef',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
  },
  {
    id: 'text-2',
    type: 'text',
    x: 470,
    y: 125,
    width: 120,
    height: 30,
    fontSize: 18,
    fontFamily: 1,
    text: 'API Gateway',
    textAlign: 'left',
    strokeColor: '#1e684a',
  },
];

/**
 * ExcalidrawCanvas Component
 * Robust Excalidraw integration with:
 * - Real-time multiplayer synchronization via Socket.io and BroadcastChannel
 * - LocalStorage room scene persistence
 * - Live collaborator cursor and user pointer sharing
 * - Reactive dark / light theme mode support
 */
export default function ExcalidrawCanvas({
  roomId = 'default',
  theme = 'light',
  user = { id: 'user-1', name: 'Participant', color: '#635bdb' },
  socket = null,
  isMockup = false,
  autoFocus = true,
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const storageKey = `excalidraw_room_${roomId}`;
  const channelName = `excalidraw_sync_channel_${roomId}`;

  // 1. Initialize room elements from localStorage or defaults without extra effect
  const [initialData] = useState(() => {
    try {
      const saved = localStorage.getItem(`excalidraw_room_${roomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          elements: parsed.elements || [],
          appState: {
            viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
            theme: theme === 'dark' ? 'dark' : 'light',
          },
        };
      }
    } catch {}

    if (isMockup) {
      return {
        elements: DEFAULT_PREVIEW_ELEMENTS,
        appState: {
          viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
          theme: theme === 'dark' ? 'dark' : 'light',
        },
      };
    }

    return {
      elements: [],
      appState: {
        viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
        theme: theme === 'dark' ? 'dark' : 'light',
      },
    };
  });

  const isRemoteUpdateRef = useRef(false);
  const channelRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // 2. Multi-Tab & Real-Time Sync via BroadcastChannel
  useEffect(() => {
    if (isMockup) return;

    try {
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !excalidrawAPI) return;

        if (data.type === 'SCENE_UPDATE' && data.elements) {
          isRemoteUpdateRef.current = true;
          excalidrawAPI.updateScene({
            elements: data.elements,
          });

          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ elements: data.elements })
            );
          } catch {}
        } else if (data.type === 'POINTER_UPDATE' && data.collaborator) {
          const currentCollaborators = new Map();
          currentCollaborators.set(data.collaborator.id, {
            username: data.collaborator.name,
            pointer: data.collaborator.pointer,
            button: data.collaborator.button,
            color: {
              background: data.collaborator.color || '#635bdb',
              stroke: data.collaborator.color || '#635bdb',
            },
          });
          excalidrawAPI.updateScene({
            collaborators: currentCollaborators,
          });
        }
      };

      return () => {
        channel.close();
      };
    } catch (err) {
      console.warn('BroadcastChannel sync unavailable:', err);
    }
  }, [channelName, excalidrawAPI, isMockup, storageKey]);

  // 3. Real-Time Multiplayer Canvas Sync via Socket.io
  useEffect(() => {
    if (!socket || isMockup) return;

    // Fetch initial canvas scene stored in room memory
    socket.emit('canvas:get-init', { roomId });

    const handleCanvasInit = (data) => {
      if (data?.elements && Array.isArray(data.elements) && data.elements.length > 0 && excalidrawAPI) {
        isRemoteUpdateRef.current = true;
        excalidrawAPI.updateScene({ elements: data.elements });
      }
    };

    const handleCanvasUpdate = (data) => {
      if (data?.elements && Array.isArray(data.elements) && excalidrawAPI) {
        isRemoteUpdateRef.current = true;
        excalidrawAPI.updateScene({ elements: data.elements });
      }
    };

    const handleCanvasPointer = (data) => {
      if (data?.collaborator && excalidrawAPI) {
        const collabMap = new Map();
        collabMap.set(data.collaborator.id, {
          username: data.collaborator.name,
          pointer: data.collaborator.pointer,
          button: data.collaborator.button,
          color: {
            background: data.collaborator.color || '#543FE3',
            stroke: data.collaborator.color || '#543FE3',
          },
        });
        excalidrawAPI.updateScene({ collaborators: collabMap });
      }
    };

    socket.on('canvas:init', handleCanvasInit);
    socket.on('canvas:update', handleCanvasUpdate);
    socket.on('canvas:pointer', handleCanvasPointer);

    return () => {
      socket.off('canvas:init', handleCanvasInit);
      socket.off('canvas:update', handleCanvasUpdate);
      socket.off('canvas:pointer', handleCanvasPointer);
    };
  }, [socket, roomId, excalidrawAPI, isMockup]);

  // 4. Synchronize theme changes into Excalidraw canvas
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        appState: {
          theme: theme === 'dark' ? 'dark' : 'light',
          viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
        },
      });
    }
  }, [theme, excalidrawAPI]);

  // 5. Handle local changes & broadcast to room participants
  const handleChange = useCallback(
    (elements, appState, files) => {
      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ elements }));
        } catch {}
      }, 400);

      if (socket && !isMockup) {
        socket.emit('canvas:update', {
          roomId,
          elements,
        });
      }

      if (channelRef.current && !isMockup) {
        channelRef.current.postMessage({
          type: 'SCENE_UPDATE',
          elements,
        });
      }
    },
    [isMockup, storageKey, socket, roomId]
  );

  // 6. Broadcast local mouse cursor pointer movements to room participants
  const handlePointerUpdate = useCallback(
    (payload) => {
      if (isMockup) return;

      if (socket) {
        socket.emit('canvas:pointer', {
          roomId,
          pointer: payload.pointer,
          button: payload.button,
          collaborator: {
            id: user.id || 'me',
            name: user.name || 'Participant',
            color: user.color || '#543FE3',
          },
        });
      }

      if (!channelRef.current) return;

      channelRef.current.postMessage({
        type: 'POINTER_UPDATE',
        collaborator: {
          id: user.id || 'me',
          name: user.name || 'Participant',
          color: user.color || '#635bdb',
          pointer: payload.pointer,
          button: payload.button,
        },
      });
    },
    [isMockup, user, socket, roomId]
  );

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none"
      data-lenis-prevent
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialData}
        onChange={handleChange}
        onPointerUpdate={handlePointerUpdate}
        theme={theme === 'dark' ? 'dark' : 'light'}
        autoFocus={autoFocus}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: { saveFileToDisk: true },
            theme: true,
          },
        }}
      />
    </div>
  );
}
