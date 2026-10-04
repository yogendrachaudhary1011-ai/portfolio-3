import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "pointer" | "view" | "drag" | "text" | "hidden";

interface MagneticTargetInfo {
  element: HTMLElement;
  rect: DOMRect;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  radius: string;
  isMagneticPull: boolean;
}

export default function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [customText, setCustomText] = useState<string>("VIEW ↗");

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Physics state tracked strictly in refs to avoid React re-renders during high-refresh motion
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const ringTarget = useRef({ x: -100, y: -100 });

  const isMouseDown = useRef(false);
  const isVisible = useRef(false);
  const currentMode = useRef<CursorMode>("default");
  const currentText = useRef<string>("VIEW ↗");
  const currentMagneticTarget = useRef<MagneticTargetInfo | null>(null);

  // Check fine pointer availability & motion preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaFine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkEnabled = () => {
      const isFine = mediaFine.matches && !prefersReducedMotion.matches;
      setEnabled(isFine);
      if (isFine) {
        document.documentElement.classList.add("has-custom-cursor");
      } else {
        document.documentElement.classList.remove("has-custom-cursor");
      }
    };

    checkEnabled();
    mediaFine.addEventListener("change", checkEnabled);
    prefersReducedMotion.addEventListener("change", checkEnabled);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      mediaFine.removeEventListener("change", checkEnabled);
      prefersReducedMotion.removeEventListener("change", checkEnabled);
    };
  }, []);

  // Main high-performance render loop & listener setup
  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let lastTime = performance.now();
    const dotEl = dotRef.current;
    const ringEl = ringRef.current;

    // Position initialization
    const handleInitialMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      dotPos.current = { x: e.clientX, y: e.clientY };
      ringPos.current = { x: e.clientX, y: e.clientY };
      ringTarget.current = { x: e.clientX, y: e.clientY };
      isVisible.current = true;
      updateVisibility();
      window.removeEventListener("mousemove", handleInitialMove);
    };
    window.addEventListener("mousemove", handleInitialMove, { once: true });

    // Handle mouse move
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        updateVisibility();
      }

      // Detect interactive context from target element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Check for text inputs
      const inputEl = target.closest("input:not([type='button']):not([type='submit']), textarea, [contenteditable='true']");
      if (inputEl) {
        setCursorState("text", "");
        resetMagneticPull();
        return;
      }

      // 2. Check for custom cursor attribute (view, drag, custom text)
      const cursorTarget = target.closest("[data-cursor], [data-cursor-text]") as HTMLElement | null;
      if (cursorTarget) {
        const cursorType = cursorTarget.getAttribute("data-cursor");
        const cursorTxt = cursorTarget.getAttribute("data-cursor-text");

        if (cursorType === "drag") {
          setCursorState("drag", cursorTxt || "DRAG");
        } else if (cursorType === "view" || (!cursorType && cursorTxt)) {
          setCursorState("view", cursorTxt || "VIEW ↗");
        } else if (cursorType === "pointer") {
          setCursorState("pointer", "");
        }

        // Check if element has magnetic pull
        inspectMagneticElement(cursorTarget, e.clientX, e.clientY);
        return;
      }

      // 3. Check for project cards or gallery items that should prompt a "VIEW" badge
      const projectCard = target.closest(".project-card, .work-card, [data-project-item], article a") as HTMLElement | null;
      if (projectCard) {
        setCursorState("view", "VIEW ↗");
        inspectMagneticElement(projectCard, e.clientX, e.clientY, true);
        return;
      }

      // 4. Check for interactive buttons, links, controls, tabs
      const interactiveEl = target.closest("button, a, [role='button'], summary, .btn-shine, .magnetic-target") as HTMLElement | null;
      if (interactiveEl) {
        setCursorState("pointer", "");
        inspectMagneticElement(interactiveEl, e.clientX, e.clientY, true);
        return;
      }

      // Default state
      resetMagneticPull();
      setCursorState("default", "");
    };

    const inspectMagneticElement = (el: HTMLElement, mx: number, my: number, allowPull = true) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Check distance to center
      const dx = mx - centerX;
      const dy = my - centerY;
      const isCompact = rect.width <= 260 && rect.height <= 90;

      currentMagneticTarget.current = {
        element: el,
        rect,
        centerX,
        centerY,
        width: rect.width,
        height: rect.height,
        radius: window.getComputedStyle(el).borderRadius,
        isMagneticPull: allowPull && isCompact,
      };

      // Apply subtle magnetic attraction to element if small enough (buttons, icon pills, social links)
      if (allowPull && isCompact) {
        const pullStrength = 0.22;
        const pullX = Math.max(-14, Math.min(14, dx * pullStrength));
        const pullY = Math.max(-14, Math.min(14, dy * pullStrength));
        el.style.transform = `translate3d(${pullX.toFixed(1)}px, ${pullY.toFixed(1)}px, 0)`;
        el.style.transition = "transform 0.12s ease-out";
      }
    };

    const resetMagneticPull = () => {
      if (currentMagneticTarget.current?.element && currentMagneticTarget.current.isMagneticPull) {
        const el = currentMagneticTarget.current.element;
        el.style.transform = "";
        el.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      }
      currentMagneticTarget.current = null;
    };

    const setCursorState = (newMode: CursorMode, text: string) => {
      if (currentMode.current !== newMode) {
        currentMode.current = newMode;
        setMode(newMode);
      }
      if (text && currentText.current !== text) {
        currentText.current = text;
        setCustomText(text);
      }
    };

    const onMouseDown = () => {
      isMouseDown.current = true;
    };

    const onMouseUp = () => {
      isMouseDown.current = false;
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      resetMagneticPull();
      updateVisibility();
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      updateVisibility();
    };

    const onTouchStart = () => {
      isVisible.current = false;
      updateVisibility();
      document.documentElement.classList.remove("has-custom-cursor");
    };

    const updateVisibility = () => {
      const opacity = isVisible.current ? "1" : "0";
      if (dotEl) dotEl.style.opacity = opacity;
      if (ringEl) ringEl.style.opacity = opacity;
    };

    // Smooth Physics Animation Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // 1. Snappy, smooth inner dot tracking
      const dotLerp = 1 - Math.exp(-52 * dt);
      dotPos.current.x += (mx - dotPos.current.x) * dotLerp;
      dotPos.current.y += (my - dotPos.current.y) * dotLerp;

      // 2. Determine target position for outer follower ring
      const target = currentMagneticTarget.current;
      if (target && target.isMagneticPull) {
        ringTarget.current.x = target.centerX + (mx - target.centerX) * 0.28;
        ringTarget.current.y = target.centerY + (my - target.centerY) * 0.28;
      } else {
        ringTarget.current.x = mx;
        ringTarget.current.y = my;
      }

      // 3. Smooth fluid follower lag for outer ring
      const ringLerp = 1 - Math.exp(-18 * dt);
      ringPos.current.x += (ringTarget.current.x - ringPos.current.x) * ringLerp;
      ringPos.current.y += (ringTarget.current.y - ringPos.current.y) * ringLerp;

      // 4. Apply transforms to DOM directly (bypassing React re-renders)
      if (dotEl) {
        let dotScale = isMouseDown.current ? 0.75 : 1;
        let dotOpacity = 1;

        if (currentMode.current === "view" || currentMode.current === "drag") {
          dotScale = 0;
          dotOpacity = 0;
        } else if (currentMode.current === "pointer") {
          dotScale = 0.55;
        } else if (currentMode.current === "text") {
          dotScale = 1;
        }

        dotEl.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
        dotEl.style.opacity = isVisible.current ? String(dotOpacity) : "0";
      }

      if (ringEl) {
        let ringScale = isMouseDown.current ? 0.82 : 1;
        let ringOpacity = 1;

        if (currentMode.current === "text") {
          ringScale = 0;
          ringOpacity = 0;
        }

        ringEl.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
        ringEl.style.opacity = isVisible.current ? String(ringOpacity) : "0";
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.documentElement.addEventListener("mouseenter", onMouseEnter, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("blur", onMouseLeave);

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("blur", onMouseLeave);
      resetMagneticPull();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[250] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Precision inner center dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none will-change-transform ${
          mode === "text"
            ? "h-4 w-[2px] rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--glow-1)]"
            : "size-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--glow-1)]"
        }`}
        style={{
          opacity: 0,
          transition: "width 0.2s ease, height 0.2s ease, background-color 0.2s ease",
        }}
      />

      {/* Reactive Magnetic Follower Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none will-change-transform flex items-center justify-center ${
          mode === "view"
            ? "size-20 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-[#0b0b0e] shadow-[0_8px_30px_rgba(169,157,255,0.4)]"
            : mode === "drag"
            ? "h-11 w-24 rounded-full border border-[var(--accent)] bg-[var(--card)]/90 backdrop-blur-md text-[var(--fg)] shadow-lg"
            : mode === "pointer"
            ? "size-14 rounded-full border border-[var(--accent)]/80 bg-[var(--accent-soft)] shadow-[0_0_24px_var(--glow-1)]"
            : "size-9 rounded-full border border-[var(--accent)]/45 bg-transparent"
        }`}
        style={{
          opacity: 0,
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease, border-radius 0.3s ease",
        }}
      >
        {/* Dynamic Label for "VIEW ↗" or "DRAG" */}
        {(mode === "view" || mode === "drag") && (
          <span
            ref={labelRef}
            className={`font-mono text-[10px] font-bold tracking-widest uppercase transition-opacity duration-200 select-none ${
              mode === "view" ? "text-[#08080a]" : "text-[var(--accent)]"
            }`}
          >
            {customText}
          </span>
        )}

        {/* Subtle inner pulse halo when hovering regular pointer buttons */}
        {mode === "pointer" && (
          <span className="size-2 rounded-full bg-[var(--accent)]/50 animate-ping" />
        )}
      </div>
    </div>
  );
}
