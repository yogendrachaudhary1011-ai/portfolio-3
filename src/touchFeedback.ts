/**
 * Mobile and Touchscreen Tactile Click Feedback Engine
 * Ensures all cards, buttons, links, pills, tabs, and clickable elements
 * provide instant, satisfying, tactile physical depression animations
 * across mobile viewports, touchscreens, and responsive modes.
 */

export function setupTouchFeedback(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Expanded selector for all interactive targets that receive click/touch animations
  const INTERACTIVE_SELECTOR = [
    "button",
    "a",
    '[role="button"]',
    '[role="tab"]',
    '[role="link"]',
    ".cursor-pointer",
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
    "article[role='button']",
    "[data-clickable='true']",
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

  /**
   * Finds the closest interactive ancestor for a given target.
   * Traverses up to 5 parent levels to find buttons, cards, links,
   * or elements with pointer cursor or click handlers.
   */
  const findClickableTarget = (target: HTMLElement | null): HTMLElement | null => {
    if (!target) return null;

    // Direct match with known interactive selector
    const directMatch = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
    if (
      directMatch &&
      !directMatch.hasAttribute("disabled") &&
      directMatch.getAttribute("aria-disabled") !== "true"
    ) {
      return directMatch;
    }

    // Traverse up to find elements marked cursor-pointer or with click intent
    let curr: HTMLElement | null = target;
    let depth = 0;
    while (curr && curr !== document.body && depth < 5) {
      if (
        curr.onclick !== null ||
        curr.hasAttribute("onclick") ||
        curr.classList.contains("cursor-pointer") ||
        curr.getAttribute("role") === "button"
      ) {
        if (!curr.hasAttribute("disabled") && curr.getAttribute("aria-disabled") !== "true") {
          return curr;
        }
      }
      try {
        if (window.getComputedStyle(curr).cursor === "pointer") {
          if (!curr.hasAttribute("disabled") && curr.getAttribute("aria-disabled") !== "true") {
            return curr;
          }
        }
      } catch {
        // Ignore style access errors in restricted contexts
      }
      curr = curr.parentElement;
      depth++;
    }

    return null;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!currentPressedElement) return;

    // Mobile touch slop: 20px threshold allows natural finger contact expansion without cancelling,
    // while cleanly canceling if the user actually begins scrolling.
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > 20 || dy > 20) {
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
    // 160ms minimum hold allows the eye to clearly perceive the tactile physical depression
    // even on lightning-fast 30ms-50ms mobile taps
    const MIN_HOLD_MS = 160;

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
    // Only handle primary pointer (left click or touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = findClickableTarget(target);
    if (!interactive) return;

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

    // Only attach pointermove during active press to avoid unnecessary work during idle scrolls
    window.addEventListener("pointermove", handlePointerMove, { passive: true, capture: true });
  };

  // Add passive listeners for maximum performance
  window.addEventListener("pointerdown", handlePointerDown, { passive: true, capture: true });
  window.addEventListener("pointerup", handlePointerUpOrCancel, { passive: true, capture: true });
  window.addEventListener("pointercancel", handlePointerUpOrCancel, { passive: true, capture: true });

  // Fallback for touches in WebKit
  const handleTouchStart = () => {};
  window.addEventListener("touchstart", handleTouchStart, { passive: true });

  return () => {
    window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    window.removeEventListener("pointermove", handlePointerMove, { capture: true });
    window.removeEventListener("pointerup", handlePointerUpOrCancel, { capture: true });
    window.removeEventListener("pointercancel", handlePointerUpOrCancel, { capture: true });
    window.removeEventListener("touchstart", handleTouchStart);
  };
}
