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
 * - Real-time multiplayer synchronization via BroadcastChannel (`excalidraw_room_${roomId}`)
 * - LocalStorage room scene persistence
 * - Live collaborator cursor and user pointer sharing
 * - Reactive dark / light theme mode support
 * - Elegant fallback loading if dependency is being resolved
 */
export default function ExcalidrawCanvas({
  roomId = 'default',
  theme = 'light',
  user = { id: 'user-1', name: 'Participant', color: '#635bdb' },
  isMockup = false,
  autoFocus = true,
}) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const isRemoteUpdateRef = useRef(false);
  const channelRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const storageKey = `excalidraw_room_${roomId}`;
  const channelName = `excalidraw_sync_channel_${roomId}`;

  // 2. Load stored room elements or default scene
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setInitialData({
          elements: parsed.elements || [],
          appState: {
            viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
            theme: theme === 'dark' ? 'dark' : 'light',
          },
        });
        return;
      }
    } catch (e) {
      // Use defaults
    }

    if (isMockup) {
      setInitialData({
        elements: DEFAULT_PREVIEW_ELEMENTS,
        appState: {
          viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
          theme: theme === 'dark' ? 'dark' : 'light',
        },
      });
    } else {
      setInitialData({
        elements: [],
        appState: {
          viewBackgroundColor: theme === 'dark' ? '#171815' : '#ffffff',
          theme: theme === 'dark' ? 'dark' : 'light',
        },
      });
    }
  }, [storageKey, isMockup]);

  // 3. Multi-Tab & Real-Time Sync via BroadcastChannel
  useEffect(() => {
    if (isMockup) return; // Mockup preview doesn't need external room sync

    try {
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !excalidrawAPI) return;

        if (data.type === 'SCENE_UPDATE' && data.elements) {
          isRemoteUpdateRef.current = true;
          // Apply elements only; preserve the local user's own room theme preference
          excalidrawAPI.updateScene({
            elements: data.elements,
          });

          // Also keep local storage updated with the remote state
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ elements: data.elements })
            );
          } catch (e) {
            // storage quota
          }
        } else if (data.type === 'POINTER_UPDATE' && data.collaborator) {
          // Render remote collaborator pointer cursor
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
      // If this update was triggered by an incoming remote sync, do not re-broadcast
      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      // Persist to localStorage with a slight debounce
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ elements }));
        } catch (e) {
          // storage quota
        }
      }, 400);

      // Broadcast changes to all other peers connected to this room (elements only, no theme bleed)
      if (channelRef.current && !isMockup) {
        channelRef.current.postMessage({
          type: 'SCENE_UPDATE',
          elements,
        });
      }
    },
    [isMockup, storageKey]
  );

  // 6. Broadcast local mouse cursor pointer movements to room participants
  const handlePointerUpdate = useCallback(
    (payload) => {
      if (isMockup || !channelRef.current) return;

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
    [isMockup, user]
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
