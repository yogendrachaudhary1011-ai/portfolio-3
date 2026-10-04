import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2 } from "lucide-react";

type CursorMode = "default" | "interactive" | "card" | "zoom" | "text";

const INTERACTIVE_SELECTORS = [
  "[data-cursor]",
  "a",
  "button",
  '[role="button"]',
  '[role="tab"]',
  '[role="link"]',
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  ".cursor-pointer",
  ".cursor-zoom-in",
  ".card-surface",
  ".hover-lift",
  ".card-interactive",
  ".active-press",
  ".active-press-card",
  ".btn-shine",
  ".control-surface",
  "[data-clickable='true']",
].join(",");

export default function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState<string>("");

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Check if device has fine pointer and does not prefer reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      const isOk = finePointer.matches && !reducedMotion.matches;
      setEnabled(isOk);
      if (isOk) {
        document.documentElement.classList.add("has-custom-cursor");
      } else {
        document.documentElement.classList.remove("has-custom-cursor");
      }
    };

    updateEnabled();
    finePointer.addEventListener("change", updateEnabled);
    reducedMotion.addEventListener("change", updateEnabled);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      finePointer.removeEventListener("change", updateEnabled);
      reducedMotion.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: mouse.x, y: mouse.y };
    const ringPos = { x: mouse.x, y: mouse.y };

    let rafId = 0;
    let isMoving = false;
    let hasEntered = false;
    let activeTarget: HTMLElement | null = null;
    let currentMode: CursorMode = "default";

    const classifyTarget = (el: HTMLElement | null): { mode: CursorMode; text: string; target: HTMLElement | null } => {
      if (!el) return { mode: "default", text: "", target: null };

      // Ignore elements inside the admin panel modal so form editing feels crisp and native
      if (el.closest("[data-admin-modal='true']")) {
        return { mode: "default", text: "", target: null };
      }

      const closest = el.closest<HTMLElement>(INTERACTIVE_SELECTORS);
      if (!closest) return { mode: "default", text: "", target: null };

      if (closest.hasAttribute("disabled") || closest.getAttribute("aria-disabled") === "true") {
        return { mode: "default", text: "", target: null };
      }

      // 1. Explicit data-cursor attribute override
      const explicitCursor = closest.getAttribute("data-cursor");
      const explicitLabel = closest.getAttribute("data-cursor-label") || "";
      if (explicitCursor === "card" || explicitCursor === "view") {
        return { mode: "card", text: explicitLabel || "View", target: closest };
      }
      if (explicitCursor === "zoom") {
        return { mode: "zoom", text: explicitLabel || "Expand", target: closest };
      }
      if (explicitCursor === "text") {
        return { mode: "text", text: "", target: closest };
      }
      if (explicitCursor === "interactive") {
        return { mode: "interactive", text: explicitLabel, target: closest };
      }

      // 2. Text inputs & textareas
      const tag = closest.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return { mode: "text", text: "", target: closest };
      }
      if (tag === "label" && closest.querySelector("input, textarea, select")) {
        return { mode: "text", text: "", target: closest };
      }

      // 3. Zoomable media / case study plates
      if (closest.classList.contains("cursor-zoom-in")) {
        return { mode: "zoom", text: explicitLabel || "Expand", target: closest };
      }

      // 4. Project cards, gallery items, case study cards
      if (
        closest.classList.contains("active-press-card") ||
        closest.classList.contains("card-interactive") ||
        (closest.classList.contains("card-surface") &&
          (closest.classList.contains("cursor-pointer") ||
            closest.getAttribute("role") === "button" ||
            closest.tagName.toLowerCase() === "article"))
      ) {
        // Distinguish between contact/social external cards and project/process cards
        if (closest.tagName.toLowerCase() === "a" && closest.getAttribute("target") === "_blank") {
          return { mode: "card", text: explicitLabel || "Open", target: closest };
        }
        return { mode: "card", text: explicitLabel || "View", target: closest };
      }

      // 5. Coverflow project card in WorkGallery
      if (
        closest.getAttribute("role") === "button" &&
        closest.getAttribute("aria-label")?.toLowerCase().includes("detail page")
      ) {
        return { mode: "card", text: "Explore", target: closest };
      }

      // 6. Standard buttons, links, nav items, chips
      return { mode: "interactive", text: explicitLabel, target: closest };
    };

    const tick = () => {
      // Target coordinates for the outer ring (with subtle magnetic pull toward compact buttons/links)
      let targetRingX = mouse.x;
      let targetRingY = mouse.y;

      if (activeTarget && currentMode === "interactive") {
        const rect = activeTarget.getBoundingClientRect();
        // Apply magnetic pull on compact interactive elements (buttons, pills, icons, nav links)
        if (rect.width > 0 && rect.width <= 260 && rect.height <= 90) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const pullStrength = 0.28;
          targetRingX = mouse.x + (centerX - mouse.x) * pullStrength;
          targetRingY = mouse.y + (centerY - mouse.y) * pullStrength;
        }
      }

      // High-frequency dot tracking + smooth spring-like ring interpolation
      dotPos.x += (mouse.x - dotPos.x) * 0.65;
      dotPos.y += (mouse.y - dotPos.y) * 0.65;

      ringPos.x += (targetRingX - ringPos.x) * 0.19;
      ringPos.y += (targetRingY - ringPos.y) * 0.19;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.x.toFixed(2)}px, ${dotPos.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x.toFixed(2)}px, ${ringPos.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      }

      const dx = Math.abs(targetRingX - ringPos.x) + Math.abs(mouse.x - dotPos.x);
      const dy = Math.abs(targetRingY - ringPos.y) + Math.abs(mouse.y - dotPos.y);

      if (dx > 0.08 || dy > 0.08) {
        rafId = requestAnimationFrame(tick);
      } else {
        isMoving = false;
        rafId = 0;
      }
    };

    const scheduleTick = () => {
      if (!isMoving) {
        isMoving = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!hasEntered) {
        hasEntered = true;
        dotPos.x = mouse.x;
        dotPos.y = mouse.y;
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        setVisible(true);
      }

      const targetEl = e.target as HTMLElement | null;
      const result = classifyTarget(targetEl);

      activeTarget = result.target;
      if (result.mode !== currentMode) {
        currentMode = result.mode;
        setMode(result.mode);
      }
      setLabel((prev) => (prev !== result.text ? result.text : prev));

      scheduleTick();
    };

    const onMouseDown = () => setPressed(true);
    const onMouseUp = () => setPressed(false);
    const onMouseLeaveWindow = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        setVisible(false);
        hasEntered = false;
      }
    };
    const onMouseEnterWindow = () => {
      setVisible(true);
    };

    // Reset state if scrolled so stale hover states clear smoothly
    const onScroll = () => {
      if (activeTarget && !document.body.contains(activeTarget)) {
        activeTarget = null;
        currentMode = "default";
        setMode("default");
        setLabel("");
      }
      scheduleTick();
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseout", onMouseLeaveWindow, { passive: true });
    document.addEventListener("mouseenter", onMouseEnterWindow, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseout", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  if (!enabled) return null;

  // Dynamic sizing and visual treatment for each cursor state
  const isCardOrZoom = mode === "card" || mode === "zoom";
  const isInteractive = mode === "interactive";
  const isText = mode === "text";

  const ringSize = isCardOrZoom
    ? pressed
      ? 68
      : 78
    : isInteractive
    ? pressed
      ? 44
      : 54
    : isText
    ? 28
    : pressed
    ? 26
    : 34;

  const dotScale = isCardOrZoom
    ? 0
    : isInteractive
    ? pressed
      ? 0.65
      : 0.45
    : isText
    ? 0
    : pressed
    ? 0.75
    : 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      {/* Outer Magnetic Follower Ring / Pill */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: isText ? 2 : ringSize,
            height: isText ? 24 : ringSize,
            borderRadius: isText ? "2px" : "9999px",
            backgroundColor: isCardOrZoom
              ? "color-mix(in srgb, var(--fg) 92%, var(--accent) 8%)"
              : isInteractive
              ? "var(--accent-soft)"
              : isText
              ? "var(--accent)"
              : "transparent",
            border: isCardOrZoom
              ? "1px solid color-mix(in srgb, var(--accent) 55%, transparent)"
              : isInteractive
              ? "1.5px solid color-mix(in srgb, var(--accent) 75%, transparent)"
              : isText
              ? "none"
              : "1px solid color-mix(in srgb, var(--fg) 32%, transparent)",
            boxShadow: isCardOrZoom
              ? "0 14px 34px -8px rgba(0, 0, 0, 0.45), 0 0 24px -4px var(--glow-1)"
              : isInteractive
              ? "0 0 20px -4px var(--glow-1)"
              : "none",
            backdropFilter: isCardOrZoom || isInteractive ? "blur(6px)" : "none",
            WebkitBackdropFilter: isCardOrZoom || isInteractive ? "blur(6px)" : "none",
            transition:
              "width 0.32s cubic-bezier(0.16, 1, 0.3, 1), height 0.32s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.24s ease, border-color 0.24s ease, box-shadow 0.28s ease, border-radius 0.24s ease",
          }}
        >
          {/* Inner contextual label & icon when hovering project cards or zoomable media */}
          <div
            className="flex items-center justify-center gap-1 px-2 text-center"
            style={{
              opacity: isCardOrZoom ? 1 : 0,
              transform: isCardOrZoom ? "scale(1)" : "scale(0.6)",
              transition: "opacity 0.2s ease, transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
              color: "var(--bg)",
            }}
          >
            <span className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.14em] whitespace-nowrap">
              {label || (mode === "zoom" ? "Expand" : "View")}
            </span>
            {mode === "zoom" ? (
              <Maximize2 className="size-2.5 stroke-[2.5] shrink-0" />
            ) : (
              <ArrowUpRight className="size-3 stroke-[2.5] shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Precision Center Core Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: isInteractive ? "var(--accent)" : "var(--fg)",
            transform: `scale(${dotScale})`,
            boxShadow: "0 0 10px var(--glow-1)",
            transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}
