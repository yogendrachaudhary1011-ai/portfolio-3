import { useCallback, useEffect, useRef, useState } from "react";
import { img, initialCaseStudies, type Project } from "../data";
import { SectionHead, Magnetic } from "./common";
import { External, Arrow } from "../icons";
import { useSite } from "../siteContext";

export default function WorkGallery({
  projects = initialCaseStudies,
  onMore,
  onProject,
}: {
  projects?: Project[];
  onMore: () => void;
  onProject: (index: number) => void;
}) {
  const { config } = useSite();
  const workConfig = config.work || {
    kicker: "Selected Work",
    title: "Work Gallery",
    subtitle:
      "A selection of internship, academic, and personal projects exploring different users, industries, and product challenges.",
  };

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardW, setCardW] = useState(460);
  const [stageW, setStageW] = useState(1100);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);
  const scrollSettleTimer = useRef<number | null>(null);
  const wheelAccum = useRef(0);
  const wheelCooldown = useRef(0);

  const galleryItems = projects && projects.length > 0 ? projects : initialCaseStudies;
  const n = galleryItems.length;

  // Derive safe index synchronously so render never indexes out of bounds
  const safeActive = n > 0 ? Math.max(0, Math.min(active, n - 1)) : 0;
  const project = galleryItems[safeActive] ?? galleryItems[0];

  useEffect(() => {
    setActive((current) => {
      const next = n > 0 ? Math.max(0, Math.min(current, n - 1)) : 0;
      return next !== current ? next : current;
    });
  }, [n]);

  // Responsive stage & card width measurement
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setStageW(w);
      setCardW(Math.min(460, Math.max(260, w * 0.78)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Only auto-advance when carousel is in user's viewport
  const [isInViewport, setIsInViewport] = useState(true);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gap between snap points
  const gap = Math.round(cardW * 0.66);
  const sideSpacer = Math.max(24, (stageW - cardW) / 2);

  // Align a specific project card to the exact horizontal center of the scroll-snap viewport
  const scrollToCard = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = stageRef.current;
      const cardEl = cardRefs.current[index];
      if (!container || !cardEl) return;

      isProgrammaticScroll.current = true;
      if (scrollSettleTimer.current) {
        window.clearTimeout(scrollSettleTimer.current);
      }

      const targetLeft =
        cardEl.offsetLeft - (container.clientWidth - cardEl.offsetWidth) / 2;

      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior,
      });

      scrollSettleTimer.current = window.setTimeout(
        () => {
          isProgrammaticScroll.current = false;
        },
        behavior === "smooth" ? 560 : 80
      );
    },
    []
  );

  // Navigate to a specific card index and snap-align it to center
  const selectCard = useCallback(
    (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
      if (n <= 0) return;
      const normalized = ((nextIndex % n) + n) % n;
      setActive(normalized);
      scrollToCard(normalized, behavior);
    },
    [n, scrollToCard]
  );

  const go = useCallback(
    (delta: number) => {
      if (n <= 0) return;
      const next = (safeActive + delta + n) % n;
      selectCard(next, "smooth");
    },
    [n, safeActive, selectCard]
  );

  // Keep active card centered on initial mount and when layout dimensions resize
  useEffect(() => {
    scrollToCard(safeActive, "auto");
  }, [cardW, stageW, n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance interval when idle & visible
  useEffect(() => {
    if (paused || !isInViewport || n <= 1 || isDraggingState) return;
    const t = setInterval(() => {
      const next = (safeActive + 1) % n;
      selectCard(next, "smooth");
    }, 4800);
    return () => clearInterval(t);
  }, [n, paused, isInViewport, isDraggingState, safeActive, selectCard]);

  // Native scroll listener: computes real-time center alignment & snaps active state to closest card
  const handleScroll = useCallback(() => {
    const container = stageRef.current;
    if (!container || n <= 0) return;

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIdx = safeActive;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    if (!isProgrammaticScroll.current && closestIdx !== safeActive) {
      setActive(closestIdx);
    }

    // After native scroll inertia settles, ensure the closest card is locked dead-center
    if (scrollSettleTimer.current) {
      window.clearTimeout(scrollSettleTimer.current);
    }
    scrollSettleTimer.current = window.setTimeout(() => {
      if (!isProgrammaticScroll.current && !isDragging.current) {
        setActive(closestIdx);
        scrollToCard(closestIdx, "smooth");
      }
      isProgrammaticScroll.current = false;
    }, 140);
  }, [n, safeActive, scrollToCard]);

  // Precision wheel / trackpad horizontal & vertical-to-horizontal snap handler
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Respond to horizontal trackpad swipes or shift+wheel
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4;
      if (!isHorizontalSwipe) return;

      e.preventDefault();
      const now = Date.now();
      if (now < wheelCooldown.current) return;

      wheelAccum.current += e.deltaX;
      if (Math.abs(wheelAccum.current) > 36) {
        const direction = wheelAccum.current > 0 ? 1 : -1;
        wheelAccum.current = 0;
        wheelCooldown.current = now + 420;
        go(direction);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  // Pointer drag + magnetic snap-to-center physics
  const pointerStart = useRef<{ x: number; y: number; scrollLeft: number; time: number } | null>(
    null
  );
  const isDragging = useRef(false);
  const suppressClickUntil = useRef(0);

  const onDown = (e: React.PointerEvent) => {
    const container = stageRef.current;
    if (!container) return;
    pointerStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      time: Date.now(),
    };
    isDragging.current = false;
    setIsDraggingState(false);
    setDragProgress(0);
    setPaused(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;

    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      if (!isDragging.current) {
        isDragging.current = true;
        setIsDraggingState(true);
      }
      // Continuous normalized drag offset (-1 to 1) so cards interpolate smoothly toward center
      const normalized = Math.max(-1.15, Math.min(1.15, dx / Math.max(180, gap)));
      setDragProgress(normalized);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    if (pointerStart.current) {
      const dx = e.clientX - pointerStart.current.x;
      const elapsed = Math.max(1, Date.now() - pointerStart.current.time);
      const velocity = dx / elapsed; // px per ms

      if (isDragging.current) {
        suppressClickUntil.current = Date.now() + 260;
        // Snap to next/previous card if dragged past threshold or flicked with velocity, otherwise snap back to center
        if (dx < -45 || velocity < -0.35) {
          go(1);
        } else if (dx > 45 || velocity > 0.35) {
          go(-1);
        } else {
          scrollToCard(safeActive, "smooth");
        }
      }
    }
    pointerStart.current = null;
    isDragging.current = false;
    setIsDraggingState(false);
    setDragProgress(0);
    setPaused(false);
  };

  const handleCardActivation = (index: number) => {
    if (Date.now() < suppressClickUntil.current || isDragging.current) {
      return;
    }
    // Clicking an off-center card smoothly snaps it to the center of the viewport first;
    // clicking the already-centered active card opens its case study detail page.
    if (index !== safeActive) {
      selectCard(index, "smooth");
      return;
    }
    onProject(index);
  };

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
      <SectionHead
        label={workConfig.kicker || "Selected Work"}
        title={workConfig.title || "Work Gallery"}
        sub={
          workConfig.subtitle ||
          "A selection of internship, academic, and personal projects exploring different users, industries, and product challenges."
        }
        action={
          <Magnetic strength={0.3}>
            <button
              onClick={onMore}
              className="btn-shine inline-flex items-center gap-2 self-start rounded-full bg-[var(--fg)] px-6 py-3 text-[0.8rem] font-medium text-[var(--bg)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              View More Projects <External className="size-4" />
            </button>
          </Magnetic>
        }
      />

      {/* Scroll-Snap + 3D Coverflow Viewport */}
      <div className="relative">
        {/* Subtle center-alignment optical guide ticks (top & bottom) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 flex flex-col items-center gap-1 opacity-55"
        >
          <span className="h-2 w-[1.5px] rounded-full bg-[var(--accent)]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 opacity-55"
        >
          <span className="h-2 w-[1.5px] rounded-full bg-[var(--accent)]" />
        </div>

        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Interactive projects scroll-snap carousel"
          onScroll={handleScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              go(-1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              go(1);
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onProject(safeActive);
            }
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative mx-auto flex h-[265px] touch-pan-x select-none items-center overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [perspective:1600px] sm:h-[345px] md:h-[390px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-2xl"
          style={{
            cursor: isDraggingState ? "grabbing" : "grab",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Left centering spacer so card 0 snaps to exact viewport center */}
          <div
            aria-hidden="true"
            className="shrink-0 pointer-events-none"
            style={{ width: sideSpacer }}
          />

          {/* Invisible scroll-snap anchor track for native browser scroll-snap alignment */}
          <div
            className="relative flex items-center shrink-0"
            style={{
              width: n > 0 ? cardW + (n - 1) * gap : cardW,
              height: "100%",
            }}
          >
            {galleryItems.map((p, i) => (
              <div
                key={`snap-anchor-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 snap-center snap-always"
                style={{
                  left: i * gap,
                  width: cardW,
                  height: cardW * 0.62,
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                }}
              />
            ))}
          </div>

          {/* Right centering spacer so final card snaps to exact viewport center */}
          <div
            aria-hidden="true"
            className="shrink-0 pointer-events-none"
            style={{ width: sideSpacer }}
          />

          {/* 3D Coverflow visual cards synchronized to the centered snap state */}
          <div className="pointer-events-none sticky left-0 right-0 inset-y-0 -ml-[100%] flex w-full shrink-0 items-center justify-center [perspective:1600px]">
            {galleryItems.map((p, i) => {
              // Shortest signed distance around the ring + live drag interpolation
              let rawOffset = (((i - safeActive) % n) + n) % n;
              if (rawOffset > n / 2) rawOffset -= n;

              const effectiveOffset = rawOffset + dragProgress;
              const abs = Math.abs(effectiveOffset);
              const isActive = rawOffset === 0;
              const opacity = abs < 0.35 ? 1 : abs <= 1.35 ? Math.max(0.25, 0.72 - (abs - 0.35) * 0.28) : 0;
              const interactive = Math.abs(rawOffset) <= 1;

              return (
                <div
                  key={`${p?.title || "project"}-${i}`}
                  onClick={() => handleCardActivation(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCardActivation(i);
                    }
                  }}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={
                    isActive
                      ? `Open ${p?.title || "Project"} detail page`
                      : `Center ${p?.title || "Project"} in carousel`
                  }
                  data-cursor="card"
                  data-cursor-label={isActive ? "Explore" : "Center"}
                  title={
                    isActive
                      ? `Click to open ${p?.title || "project"} detail page`
                      : `Click to snap ${p?.title || "project"} to center`
                  }
                  className={`group absolute overflow-hidden rounded-2xl border bg-[var(--card)] cursor-pointer select-none transition-shadow active:shadow-sm ${
                    isActive
                      ? "border-[var(--accent)]/45 ring-1 ring-[var(--accent)]/20"
                      : "border-[var(--card-border)]"
                  }`}
                  style={{
                    width: cardW,
                    height: cardW * 0.62,
                    transform: `translate3d(${effectiveOffset * gap}px, 0, ${-abs * 130}px) rotateY(${
                      effectiveOffset * -24
                    }deg) scale(${Math.max(0.84, 1 - abs * 0.12)})`,
                    zIndex: Math.round(20 - abs * 10),
                    opacity,
                    pointerEvents: interactive ? "auto" : "none",
                    filter: `brightness(${Math.max(0.52, 1 - abs * 0.42)})`,
                    boxShadow: isActive
                      ? "var(--shadow-lift), 0 0 60px -16px var(--glow-1)"
                      : "var(--shadow-soft)",
                    transition: isDraggingState
                      ? "opacity 0.15s ease, box-shadow 0.25s ease"
                      : "transform 0.68s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, filter 0.55s ease, box-shadow 0.55s ease, border-color 0.35s ease",
                    willChange: interactive ? "transform, opacity" : undefined,
                  }}
                >
                  <div
                    className="relative size-full overflow-hidden transition-all duration-150 ease-out group-active:scale-[0.96] group-active:brightness-95 group-[.is-pressed]:scale-[0.96] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardActivation(i);
                    }}
                  >
                    <img
                      src={img(p?.thumbnail ?? p?.image ?? "1551288049-bebda4e38f71", 720, 460)}
                      alt={p?.title || "Project Preview"}
                      draggable={false}
                      loading={isActive ? "eager" : "lazy"}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105 cursor-pointer"
                    />
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 52%)",
                      }}
                    />
                    {/* Subtle external link / snap affordance icon on hover */}
                    <div
                      className={`pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-end text-white transition-opacity duration-300 ${
                        isActive
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-0 group-hover:opacity-80"
                      }`}
                    >
                      <span className="size-8 grid place-items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md transition-transform duration-200 group-hover:scale-110">
                        <External className="size-3.5 text-white" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
        <Magnetic strength={0.28}>
          <button
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="control-surface grid size-11 place-items-center rounded-full active:scale-90 cursor-pointer"
          >
            <Arrow className="size-4 rotate-180" />
          </button>
        </Magnetic>
        <div className="flex items-center gap-2" role="tablist" aria-label="Project slides">
          {galleryItems.map((item, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === safeActive}
              onClick={() => selectCard(i, "smooth")}
              aria-label={`Snap to project ${i + 1}: ${item?.title || ""}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-75 ${
                i === safeActive
                  ? "w-8 bg-[var(--accent)]"
                  : "w-1.5 bg-[var(--muted)]/40 hover:bg-[var(--muted)]"
              }`}
            />
          ))}
        </div>
        <Magnetic strength={0.28}>
          <button
            onClick={() => go(1)}
            aria-label="Next project"
            className="control-surface grid size-11 place-items-center rounded-full active:scale-90 cursor-pointer"
          >
            <Arrow className="size-4" />
          </button>
        </Magnetic>
      </div>

      {/* details */}
      <div className="mx-auto mt-10 max-w-3xl text-center">
        <div key={safeActive} style={{ animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
          <span className="label mb-3 block !text-[0.55rem] text-[var(--accent)] tabular-nums">
            {String(safeActive + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <h3
            onClick={() => onProject(safeActive)}
            data-cursor="card"
            data-cursor-label="Explore"
            className="font-display text-2xl font-bold leading-snug md:text-[1.75rem] cursor-pointer hover:text-[var(--accent)] transition-colors inline-block"
            title="Click to view project details"
          >
            {project?.title || "Untitled Project"}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--muted)]">
            {project?.desc || ""}
          </p>
          <Magnetic strength={0.25}>
            <button
              type="button"
              onClick={() => onProject(safeActive)}
              className="group mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-[0.8rem] font-medium cursor-pointer transition-transform duration-150 hover:text-[var(--accent)] active:scale-95 active:translate-x-1"
            >
              View Project <Arrow className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
