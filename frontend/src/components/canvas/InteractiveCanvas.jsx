import React, { useState, useRef, useEffect } from 'react';
import CanvasToolbar from './CanvasToolbar';

/**
 * InteractiveCanvas Component
 * Interactive whiteboard supporting true destination-out erasing (background stays intact),
 * draggable and deletable sticky notes, live animated collaborator cursors, and perfectly aligned diagrams.
 */
export default function InteractiveCanvas() {
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'pen' | 'highlighter' | 'eraser' | 'text'
  const [drawingColor, setDrawingColor] = useState('#252522');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Coordinated Sticky Notes matching the diagram arrows
  const [stickyNotes, setStickyNotes] = useState([
    {
      id: 'note-1',
      text: 'Concepts &\nArchitecture',
      x: 35,
      y: 40,
      color: 'blue',
      width: 105,
      height: 75,
    },
    {
      id: 'note-2',
      text: 'Weekly\nStudy',
      x: 380,
      y: 40,
      color: 'orange',
      width: 90,
      height: 75,
    },
    {
      id: 'note-3',
      text: 'Weekly\nStudy',
      x: 360,
      y: 215,
      color: 'green',
      width: 90,
      height: 75,
    },
  ]);

  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Collaborator cursor positions
  const [mayaPos, setMayaPos] = useState({ x: 175, y: 240 });
  const [rohanPos, setRohanPos] = useState({ x: 285, y: 95 });

  /**
   * Redraw all strokes using destination-out for eraser
   * This guarantees background dots and canvas textures are NEVER erased!
   */
  const redrawStrokes = (allStrokes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.width || 24;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.globalAlpha = stroke.alpha || 1;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  // Update canvas size and redraw with correct pixel ratio
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawStrokes(strokes);
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [strokes]);

  // Collaborator cursor animation
  useEffect(() => {
    let frameId;
    let time = 0;

    const animateCursors = () => {
      time += 0.02;
      const mayaX = 175 + Math.cos(time * 0.9) * 14;
      const mayaY = 240 + Math.sin(time * 1.3) * 10;
      setMayaPos({ x: mayaX, y: mayaY });

      const rohanX = 285 + Math.sin(time * 0.8) * 12;
      const rohanY = 95 + Math.cos(time * 1.1) * 8;
      setRohanPos({ x: rohanX, y: rohanY });

      frameId = requestAnimationFrame(animateCursors);
    };

    frameId = requestAnimationFrame(animateCursors);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (activeTool === 'select' || activeTool === 'text') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);

    const isHighlighter = activeTool === 'highlighter';
    const isEraser = activeTool === 'eraser';

    const newStroke = {
      tool: activeTool,
      color: isHighlighter ? '#fde047' : drawingColor,
      width: isEraser ? 24 : isHighlighter ? 16 : 2.5,
      alpha: isHighlighter ? 0.45 : 1,
      points: [{ x, y }],
    };

    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !currentStroke) return;
    const { x, y } = getCanvasCoords(e);

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, { x, y }],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      if (updatedStroke.tool === 'eraser') {
        // True alpha mask removal: only deletes drawn content, NEVER the background
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = updatedStroke.width || 24;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = updatedStroke.color;
        ctx.lineWidth = updatedStroke.width;
        ctx.globalAlpha = updatedStroke.alpha || 1;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pts = updatedStroke.points;
      if (pts.length >= 2) {
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  const handlePointerUp = (e) => {
    if (isDrawing && currentStroke) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setCurrentStroke(null);
      setIsDrawing(false);
      redrawStrokes(newStrokes);
    }
  };

  const handleContainerClick = (e) => {
    if (activeTool === 'text') {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left - 45;
      const clickY = e.clientY - rect.top - 20;

      const newNote = {
        id: `note-${Date.now()}`,
        text: 'Notes & ideas',
        x: Math.max(10, Math.min(clickX, rect.width - 110)),
        y: Math.max(10, Math.min(clickY, rect.height - 85)),
        color: 'yellow',
        width: 100,
        height: 72,
      };
      setStickyNotes((prev) => [...prev, newNote]);
      setActiveTool('select');
    }
  };

  const handleNotePointerDown = (e, note) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    setDraggedNote(note.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleNotePointerMove = (e, note) => {
    if (draggedNote !== note.id || activeTool !== 'select') return;
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const newX = Math.max(
      10,
      Math.min(e.clientX - containerRect.left - dragOffset.x, containerRect.width - note.width - 10)
    );
    const newY = Math.max(
      10,
      Math.min(e.clientY - containerRect.top - dragOffset.y, containerRect.height - note.height - 10)
    );

    setStickyNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === note.id ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleNotePointerUp = (e) => {
    if (draggedNote) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDraggedNote(null);
    }
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddNewSticky = () => {
    const colors = ['blue', 'orange', 'green', 'purple', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote = {
      id: `note-${Date.now()}`,
      text: 'New Idea ✨',
      x: 180 + Math.random() * 60,
      y: 120 + Math.random() * 50,
      color: randomColor,
      width: 100,
      height: 75,
    };
    setStickyNotes((prev) => [...prev, newNote]);
    setActiveTool('select');
  };

  const handleNoteTextChange = (id, newText) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: newText } : n))
    );
  };

  const handleClearCanvas = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const colorClasses = {
    blue: 'bg-[#dbeafe] text-blue-900 border-[#93c5fd] dark:bg-[#1e3a8a] dark:text-blue-100 dark:border-blue-700',
    orange: 'bg-[#ffedd5] text-amber-950 border-[#fed7aa] dark:bg-[#7c2d12] dark:text-amber-100 dark:border-orange-700',
    green: 'bg-[#dcfce7] text-emerald-950 border-[#bbf7d0] dark:bg-[#14532d] dark:text-emerald-100 dark:border-emerald-700',
    purple: 'bg-[#f3e8ff] text-purple-950 border-[#e9d5ff] dark:bg-[#581c87] dark:text-purple-100 dark:border-purple-700',
    yellow: 'bg-[#fef9c3] text-yellow-950 border-[#fef08a] dark:bg-[#713f12] dark:text-yellow-100 dark:border-yellow-700',
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative w-full h-full min-h-[460px] overflow-hidden select-none bg-[var(--color-surface)] transition-colors duration-200 ${
        activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
      }`}
    >
      {/* Background Dot Grid: always remains intact */}
      <div className="absolute inset-0 canvas-dots pointer-events-none" />

      {/* Centered Canvas Workspace for perfectly aligned diagrams and notes */}
      <div className="relative mx-auto w-full max-w-[540px] h-full pointer-events-none">
        {/* Sketched Mockup Diagram Elements */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none text-slate-700 dark:text-slate-300"
          viewBox="0 0 540 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Curved arrow 1: Concepts & Architecture -> Center Monitor */}
          <path d="M145 80 C 185 85, 215 105, 245 120" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M237 114 L 246 121 L 240 126" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Curved arrow 2: Center Monitor -> Orange Weekly Study */}
          <path d="M310 125 C 335 110, 355 90, 380 80" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M372 76 L 382 80 L 376 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Curved arrow 3: Center Monitor -> Green Weekly Study */}
          <path d="M290 165 C 305 185, 325 205, 355 228" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M347 222 L 357 230 L 353 218" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Curved arrow 4: Wireframe Cards -> Center Monitor */}
          <path d="M165 240 C 190 228, 215 195, 230 165" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M224 172 L 230 163 L 232 174" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Center Sketched Computer Monitor */}
          <g transform="translate(250, 110)">
            <rect x="0" y="0" width="58" height="40" rx="3" stroke="currentColor" strokeWidth="1.8" fill="var(--color-surface)" />
            <path d="M6 10 L 22 24 L 38 14 L 50 26" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M29 40 L 29 49 M18 49 L 40 49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Bottom-left Sketched Wireframe Cards */}
          <g transform="translate(50, 215)">
            <rect x="0" y="0" width="38" height="26" rx="2.5" stroke="#64748B" strokeWidth="1.4" fill="var(--color-surface)" />
            <line x1="5" y1="7" x2="25" y2="7" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="30" y2="12" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="17" x2="20" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

            <rect x="44" y="0" width="38" height="26" rx="2.5" stroke="#64748B" strokeWidth="1.4" fill="var(--color-surface)" />
            <line x1="49" y1="7" x2="69" y2="7" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="49" y1="12" x2="76" y2="12" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="49" y1="17" x2="62" y2="17" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

            <rect x="0" y="32" width="38" height="26" rx="2.5" stroke="#64748B" strokeWidth="1.4" fill="var(--color-surface)" />
            <circle cx="9" cy="45" r="3" stroke="#94A3B8" strokeWidth="1.2" />
            <line x1="16" y1="42" x2="32" y2="42" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="16" y1="47" x2="28" y2="47" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>

        {/* Interactive Draggable & Deletable Sticky Notes */}
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            className={`group absolute z-20 p-2.5 rounded shadow-sm border font-handwriting text-sm leading-tight transition-shadow active:shadow-lg cursor-grab active:cursor-grabbing pointer-events-auto ${
              colorClasses[note.color] || colorClasses.yellow
            } ${draggedNote === note.id ? 'scale-105 z-30 shadow-xl' : ''}`}
            style={{
              transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
              width: `${note.width}px`,
            }}
            onPointerDown={(e) => handleNotePointerDown(e, note)}
            onPointerMove={(e) => handleNotePointerMove(e, note)}
            onPointerUp={handleNotePointerUp}
            title="Drag to move, click to edit"
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-600/30" />
            {/* Note delete button */}
            <button
              type="button"
              onClick={(e) => handleDeleteNote(note.id, e)}
              className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity text-xs leading-none font-sans font-bold"
              title="Delete note"
            >
              ×
            </button>
            <textarea
              value={note.text}
              onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
              rows={2}
              spellCheck={false}
              className="w-full h-full bg-transparent resize-none outline-none text-inherit font-inherit leading-snug mt-1 cursor-text"
            />
          </div>
        ))}

        {/* Collaborator Cursor: Maya sketching */}
        <div
          className="absolute z-20 pointer-events-none transition-transform duration-75 ease-out flex items-start gap-1"
          style={{
            transform: `translate3d(${mayaPos.x}px, ${mayaPos.y}px, 0)`,
          }}
        >
          <svg className="w-4 h-4 text-blue-500 drop-shadow-sm -rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <div className="rounded-full bg-blue-500 text-white text-[11px] font-semibold px-2 py-0.5 shadow-sm whitespace-nowrap">
            Maya sketching
          </div>
        </div>

        {/* Collaborator Cursor: Rohan typing */}
        <div
          className="absolute z-20 pointer-events-none transition-transform duration-75 ease-out flex items-start gap-1"
          style={{
            transform: `translate3d(${rohanPos.x}px, ${rohanPos.y}px, 0)`,
          }}
        >
          <svg className="w-4 h-4 text-orange-500 drop-shadow-sm -rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <div className="flex items-center gap-1 rounded-full bg-orange-500 text-white text-[11px] font-semibold px-2 py-0.5 shadow-sm whitespace-nowrap">
            <span>Rohan typing</span>
            <span className="inline-flex gap-0.5 animate-pulse">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
      </div>

      {/* HTML5 Canvas Drawing Layer: pure transparent surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-15 touch-none bg-transparent"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Floating Bottom Toolbar */}
      <CanvasToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setDrawingColor={setDrawingColor}
        onAddNewSticky={handleAddNewSticky}
        onClearCanvas={handleClearCanvas}
      />

      {/* Bottom Left Canvas State Info */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
        <span className="text-[11px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)]/80 px-2 py-0.5 rounded border border-[var(--color-border)]">
          100%
        </span>
        <button
          type="button"
          onClick={handleClearCanvas}
          className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-red-500 text-xs transition-colors"
          title="Reset drawings"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
