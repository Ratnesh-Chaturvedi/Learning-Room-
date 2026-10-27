import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SmoothScrollContext & Hook
 * Exposes the active Lenis instance for programmatic smooth scrolling:
 *   const lenis = useLenis();
 *   lenis?.scrollTo('#features', { offset: -70 });
 */
const SmoothScrollContext = createContext(null);

export const useLenis = () => useContext(SmoothScrollContext);

/**
 * Standard Lenis exponential easing function:
 * Produces the signature luxury inertia / deceleration curve.
 */
const defaultEasing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * Built-in High-Performance Lenis-Compatible Smooth Scroll Engine
 * - Smoothly scrolls the main window (e.g. Landing Page)
 * - Intelligently detects and smoothly scrolls inner scrollable containers (e.g. Dashboard)
 * - Respects [data-lenis-prevent] for containers that opt out (e.g. Whiteboard canvas, chat list)
 * - Safe boundary checks: NEVER freezes scrolling when limit is 0
 */
class BuiltinLenisEngine {
  constructor(options = {}) {
    this.options = {
      duration: options.duration ?? 1.2,
      easing: options.easing ?? defaultEasing,
      smoothWheel: options.smoothWheel ?? true,
      touchMultiplier: options.touchMultiplier ?? 1.5,
      ...options,
    };

    this.scroll = window.scrollY || window.pageYOffset || 0;
    this.targetScroll = this.scroll;
    this.velocity = 0;
    this.direction = 0;
    this.progress = 0;
    this.isStopped = false;
    this.isScrolling = false;
    this.listeners = new Map();
    this.rafId = null;
    this.lastTime = performance.now();

    // Map of active container scroll states: containerElement -> { scroll, targetScroll, maxScroll }
    this.activeContainers = new Map();

    // Bind event handlers
    this.onWheel = this.onWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onRaf = this.onRaf.bind(this);
    this.onResize = this.onResize.bind(this);

    this.init();
  }

  get limit() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  init() {
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('resize', this.onResize, { passive: true });

    this.rafId = requestAnimationFrame(this.onRaf);
  }

  onResize() {
    this.scroll = window.scrollY || window.pageYOffset || 0;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, this.limit));
  }

  /**
   * Find the nearest scrollable ancestor element for a given DOM node.
   * Walks up to document.body.
   */
  findScrollContainer(element) {
    let el = element;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.hasAttribute('data-lenis-prevent')) {
        return { element: el, prevent: true };
      }

      const style = window.getComputedStyle(el);
      const isOverflowY =
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll';

      if (isOverflowY && el.scrollHeight > el.clientHeight + 2) {
        return { element: el, prevent: false };
      }

      el = el.parentElement;
    }

    return { element: null, prevent: false };
  }

  onWheel(e) {
    if (this.isStopped) return;

    const { element: container, prevent } = this.findScrollContainer(e.target);

    // 1. If explicit opt-out via [data-lenis-prevent], allow native scrolling
    if (prevent) {
      return;
    }

    // Normalize wheel delta across mice and trackpads
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 40;
    else if (e.deltaMode === 2) delta *= window.innerHeight;

    const isTouchpad = Math.abs(delta) < 50 && !Number.isInteger(delta);
    const multiplier = isTouchpad ? 1.0 : 1.15;
    const effectiveDelta = delta * multiplier;

    // 2. CASE A: Inner scrollable container (e.g. Dashboard content area)
    if (container) {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 0) return;

      const currentScroll = container.scrollTop;
      const canScrollDown = effectiveDelta > 0 && currentScroll < maxScroll - 1;
      const canScrollUp = effectiveDelta < 0 && currentScroll > 1;

      // If at boundary, don't trap the wheel
      if (!canScrollDown && !canScrollUp) {
        return;
      }

      e.preventDefault();
      this.scrollContainer(container, effectiveDelta, maxScroll);
      return;
    }

    // 3. CASE B: Window scrolling (e.g. Landing Page)
    // If the window cannot scroll (limit <= 2), NEVER call preventDefault!
    if (this.limit <= 2) {
      return;
    }

    e.preventDefault();

    this.targetScroll = Math.max(
      0,
      Math.min(this.limit, this.targetScroll + effectiveDelta)
    );
  }

  scrollContainer(container, delta, maxScroll) {
    let entry = this.activeContainers.get(container);

    if (!entry) {
      entry = {
        scroll: container.scrollTop,
        targetScroll: container.scrollTop,
        maxScroll,
      };

      // Keep in sync if user manually drags native scrollbar thumb
      const onNativeScroll = () => {
        if (!this.activeContainers.has(container)) {
          entry.scroll = container.scrollTop;
          entry.targetScroll = container.scrollTop;
        }
      };
      container.addEventListener('scroll', onNativeScroll, { passive: true, once: false });

      this.activeContainers.set(container, entry);
    }

    entry.maxScroll = maxScroll;
    entry.targetScroll = Math.max(
      0,
      Math.min(maxScroll, entry.targetScroll + delta)
    );
  }

  onKeyDown(e) {
    if (this.isStopped) return;

    const active = document.activeElement;
    if (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable)
    ) {
      return;
    }

    const { element: container, prevent } = this.findScrollContainer(active || e.target);
    if (prevent) return;

    let delta = 0;
    const viewH = container ? container.clientHeight : window.innerHeight;

    switch (e.key) {
      case 'ArrowDown':
        delta = 90;
        break;
      case 'ArrowUp':
        delta = -90;
        break;
      case 'PageDown':
      case ' ':
        delta = viewH * 0.85 * (e.shiftKey ? -1 : 1);
        break;
      case 'PageUp':
        delta = -viewH * 0.85;
        break;
      case 'Home':
        e.preventDefault();
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.scrollTo(0, { duration: 1.0 });
        }
        return;
      case 'End':
        e.preventDefault();
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
          this.scrollTo(this.limit, { duration: 1.0 });
        }
        return;
      default:
        return;
    }

    if (delta !== 0) {
      if (container) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll > 0) {
          e.preventDefault();
          this.scrollContainer(container, delta, maxScroll);
        }
      } else if (this.limit > 2) {
        e.preventDefault();
        this.targetScroll = Math.max(
          0,
          Math.min(this.limit, this.targetScroll + delta)
        );
      }
    }
  }

  onRaf(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isStopped) {
      // 1. Process Window Smooth Scroll
      if (this.limit > 2) {
        const diff = this.targetScroll - this.scroll;

        if (Math.abs(diff) > 0.5) {
          const lerpFactor = 1 - Math.exp(-9 * deltaTime);
          const step = diff * lerpFactor;

          this.scroll += step;
          this.velocity = step / deltaTime;
          this.direction = diff > 0 ? 1 : -1;
          this.progress = this.limit > 0 ? this.scroll / this.limit : 0;

          window.scrollTo(0, Math.round(this.scroll));

          if (!this.isScrolling) {
            this.isScrolling = true;
            document.documentElement.classList.add('lenis-scrolling');
          }

          this.emit('scroll', {
            scroll: this.scroll,
            limit: this.limit,
            velocity: this.velocity,
            direction: this.direction,
            progress: this.progress,
          });
        } else if (this.isScrolling) {
          this.scroll = this.targetScroll;
          window.scrollTo(0, Math.round(this.scroll));
          this.isScrolling = false;
          this.velocity = 0;
          this.direction = 0;
          document.documentElement.classList.remove('lenis-scrolling');

          this.emit('scroll', {
            scroll: this.scroll,
            limit: this.limit,
            velocity: 0,
            direction: 0,
            progress: this.progress,
          });
        }
      }

      // 2. Process Inner Container Smooth Scrolls (e.g. Dashboard)
      if (this.activeContainers.size > 0) {
        for (const [container, entry] of this.activeContainers.entries()) {
          if (!document.contains(container)) {
            this.activeContainers.delete(container);
            continue;
          }

          const diff = entry.targetScroll - entry.scroll;

          if (Math.abs(diff) > 0.5) {
            const lerpFactor = 1 - Math.exp(-9 * deltaTime);
            const step = diff * lerpFactor;

            entry.scroll += step;
            container.scrollTop = Math.round(entry.scroll);
          } else {
            entry.scroll = entry.targetScroll;
            container.scrollTop = Math.round(entry.scroll);
            this.activeContainers.delete(container);
          }
        }
      }
    }

    this.rafId = requestAnimationFrame(this.onRaf);
  }

  scrollTo(target, options = {}) {
    const { offset = 0, immediate = false } = options;

    // Check if we are inside dashboard or another view with a main scroll container
    const dashboardContainer = document.getElementById('dashboard-main-scroll');

    if (dashboardContainer && document.contains(dashboardContainer)) {
      let targetY = 0;
      if (typeof target === 'number') {
        targetY = target;
      } else if (typeof target === 'string') {
        const el = dashboardContainer.querySelector(target);
        if (el) {
          targetY = el.offsetTop + offset;
        }
      } else if (target instanceof HTMLElement) {
        targetY = target.offsetTop + offset;
      }

      const maxScroll = dashboardContainer.scrollHeight - dashboardContainer.clientHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      if (immediate) {
        dashboardContainer.scrollTop = targetY;
      } else {
        dashboardContainer.scrollTo({ top: targetY, behavior: 'smooth' });
      }
      return;
    }

    // Default: Window scroll
    let targetY = 0;

    if (typeof target === 'number') {
      targetY = target;
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        targetY = rect.top + window.scrollY;
      }
    } else if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      targetY = rect.top + window.scrollY;
    }

    targetY = Math.max(0, Math.min(this.limit, targetY + offset));

    if (immediate) {
      this.scroll = targetY;
      this.targetScroll = targetY;
      window.scrollTo(0, targetY);
    } else {
      this.targetScroll = targetY;
    }
  }

  stop() {
    this.isStopped = true;
    this.activeContainers.clear();
    document.documentElement.classList.add('lenis-stopped');
  }

  start() {
    this.isStopped = false;
    this.scroll = window.scrollY || window.pageYOffset || 0;
    this.targetScroll = this.scroll;
    document.documentElement.classList.remove('lenis-stopped');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
    document.documentElement.classList.remove(
      'lenis',
      'lenis-smooth',
      'lenis-scrolling',
      'lenis-stopped'
    );
    this.activeContainers.clear();
    this.listeners.clear();
  }
}

/**
 * SmoothScrollProvider Component
 * Initializes and manages Lenis smooth scrolling across the entire app.
 * - Handles route changes (pauses in /room to give Excalidraw 100% native canvas control)
 * - Automatically provides seamless smooth navigation for anchor links (#features, #explore, #about)
 * - Exposes window.lenis and useLenis() context
 */
export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let instance = null;
    let isMounted = true;

    async function initLenis() {
      // 1. Attempt to load official 'lenis' package if installed
      try {
        const moduleName = 'lenis';
        const lenisModule = await import(/* @vite-ignore */ moduleName);
        const OfficialLenis = lenisModule.default || lenisModule;
        if (OfficialLenis && isMounted) {
          instance = new OfficialLenis({
            duration: 1.2,
            easing: defaultEasing,
            smoothWheel: true,
            touchMultiplier: 1.5,
          });

          let rafId = null;
          const raf = (time) => {
            if (!isMounted) return;
            instance.raf(time);
            rafId = requestAnimationFrame(raf);
          };
          rafId = requestAnimationFrame(raf);

          const originalDestroy = instance.destroy?.bind(instance);
          instance.destroy = () => {
            if (rafId) cancelAnimationFrame(rafId);
            originalDestroy?.();
          };
        }
      } catch (err) {
        // Fall back seamlessly to built-in high-performance Lenis engine
        if (isMounted) {
          instance = new BuiltinLenisEngine({
            duration: 1.2,
            easing: defaultEasing,
          });
        }
      }

      if (isMounted && instance) {
        lenisRef.current = instance;
        setLenisInstance(instance);
        window.lenis = instance;
      }
    }

    initLenis();

    return () => {
      isMounted = false;
      if (lenisRef.current) {
        lenisRef.current.destroy?.();
        lenisRef.current = null;
        window.lenis = null;
      }
    };
  }, []);

  // Control behavior per route:
  // When inside an application screen (/room/:roomId or /dashboard/*),
  // stop Lenis and remove global Lenis document classes so the app has 100%
  // native, uninhibited browser scrolling and canvas responsiveness in all production builds.
  useEffect(() => {
    const isRoomPage = location.pathname.startsWith('/room');
    const isDashboardPage = location.pathname.startsWith('/dashboard');
    const isAppPage = isRoomPage || isDashboardPage;

    if (isAppPage) {
      document.documentElement.classList.add('app-page');
      document.documentElement.classList.remove(
        'lenis',
        'lenis-smooth',
        'lenis-scrolling',
        'lenis-stopped'
      );
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
    } else {
      document.documentElement.classList.remove('app-page');
      document.documentElement.classList.add('lenis', 'lenis-smooth');
      if (lenisRef.current) {
        lenisRef.current.start();
        if (!location.hash) {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
      }
    }
  }, [location.pathname, location.hash]);

  // Intercept anchor clicks on the page (e.g. href="#features", href="/#about")
  // and smoothly glide using Lenis easing
  const handleAnchorClick = useCallback((e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    const isHashOnSamePage =
      href.startsWith('#') ||
      (href.startsWith('/#') && window.location.pathname === '/');

    if (isHashOnSamePage && lenisRef.current) {
      const hash = href.startsWith('/#') ? href.replace('/', '') : href;
      if (hash === '#' || hash === '#home') {
        e.preventDefault();
        lenisRef.current.scrollTo(0, { duration: 1.2 });
      } else {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          lenisRef.current.scrollTo(targetElement, { offset: -70, duration: 1.2 });
          window.history.pushState(null, '', hash);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, [handleAnchorClick]);

  return (
    <SmoothScrollContext.Provider value={lenisInstance}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
