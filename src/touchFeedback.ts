/**
 * Mobile and Touchscreen Tactile Click Feedback System
 * Ensures buttons, cards, and interactive elements provide immediate, satisfying
 * press/scale animations on touch devices, mobile viewports, and emulated mobile responsive modes.
 */

export function setupTouchFeedback(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Selector for all interactive targets that receive click/touch animations
  const INTERACTIVE_SELECTOR = [
    "button",
    "a",
    '[role="button"]',
    ".card-surface",
    ".hover-lift",
    ".card-interactive",
    ".active-press",
    ".active-press-card",
    ".active-press-subtle",
    ".btn-shine",
    ".liquid-nav button",
    ".liquid-menu button",
    ".control-surface",
    "summary",
  ].join(",");

  let currentPressedElement: HTMLElement | null = null;
  let pressStartTime = 0;
  let startX = 0;
  let startY = 0;
  let releaseTimer: number | null = null;

  const removePressState = (el: HTMLElement) => {
    el.removeAttribute("data-pressed");
    el.classList.remove("is-pressed");
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!currentPressedElement) return;

    // If moved more than 10px, the user is scrolling or dragging, cancel the press state
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > 10 || dy > 10) {
      removePressState(currentPressedElement);
      currentPressedElement = null;
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
    }
  };

  const handlePointerUpOrCancel = () => {
    window.removeEventListener("pointermove", handlePointerMove, { capture: true });

    if (!currentPressedElement) return;

    const el = currentPressedElement;
    currentPressedElement = null;

    const elapsed = Date.now() - pressStartTime;
    const MIN_HOLD_MS = 110; // Guarantees the user visibly perceives the click depression on quick taps

    if (elapsed < MIN_HOLD_MS) {
      releaseTimer = window.setTimeout(() => {
        removePressState(el);
        releaseTimer = null;
      }, MIN_HOLD_MS - elapsed);
    } else {
      removePressState(el);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    // Only handle primary pointer (left click or single touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
    if (!interactive || interactive.hasAttribute("disabled") || interactive.getAttribute("aria-disabled") === "true") {
      return;
    }

    // Clear any pending release timer on a previous element
    if (releaseTimer) {
      window.clearTimeout(releaseTimer);
      releaseTimer = null;
    }
    if (currentPressedElement && currentPressedElement !== interactive) {
      removePressState(currentPressedElement);
    }

    currentPressedElement = interactive;
    pressStartTime = Date.now();
    startX = e.clientX;
    startY = e.clientY;

    interactive.setAttribute("data-pressed", "true");
    interactive.classList.add("is-pressed");

    // Only attach pointermove during an active press to avoid zero-work listener overhead during regular scrolling
    window.addEventListener("pointermove", handlePointerMove, { passive: true, capture: true });
  };

  // Add passive listeners for maximum performance
  window.addEventListener("pointerdown", handlePointerDown, { passive: true, capture: true });
  window.addEventListener("pointerup", handlePointerUpOrCancel, { passive: true, capture: true });
  window.addEventListener("pointercancel", handlePointerUpOrCancel, { passive: true, capture: true });

  // Fallback for touches that might bypass pointer events in certain WebKit configurations
  const handleTouchStart = () => {
    // Keep touchstart active so WebKit treats the document as touch-interactive
  };
  window.addEventListener("touchstart", handleTouchStart, { passive: true });

  return () => {
    window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    window.removeEventListener("pointermove", handlePointerMove, { capture: true });
    window.removeEventListener("pointerup", handlePointerUpOrCancel, { capture: true });
    window.removeEventListener("pointercancel", handlePointerUpOrCancel, { capture: true });
    window.removeEventListener("touchstart", handleTouchStart);
  };
}
