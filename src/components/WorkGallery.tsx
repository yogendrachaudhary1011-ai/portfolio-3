import { useEffect, useRef, useState, useCallback } from "react";
import { img, initialCaseStudies, type Project } from "../data";
import { SectionHead, Magnetic } from "./common";
import { External, Arrow } from "../icons";
import { useSite } from "../siteContext";

export default function WorkGallery({ projects = initialCaseStudies, onMore, onProject }: { projects?: Project[]; onMore: () => void; onProject: (index: number) => void }) {
  const { config } = useSite();
  const workConfig = config.work || {
    kicker: "Selected Work",
    title: "Work Gallery",
    subtitle: "A selection of internship, academic, and personal projects exploring different users, industries, and product challenges.",
  };
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardW, setCardW] = useState(460);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number } | null>(null);
  const moved = useRef(false);
  const galleryItems = (projects && projects.length > 0) ? projects : initialCaseStudies;
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

  // responsive card width
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setCardW(Math.min(460, el.clientWidth * 0.8));
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
    const io = new IntersectionObserver(([entry]) => {
      setIsInViewport(entry.isIntersecting);
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pointerStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const suppressClickUntil = useRef(0);
  const wheelAccumulator = useRef(0);
  const lastWheelSnapTime = useRef(0);

  // Smoothly center the active carousel card in the viewport
  const alignToCenterViewport = useCallback(() => {
    const el = stageRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const stageCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const delta = stageCenter - viewportCenter;

    // Smoothly snap to center if within natural reading threshold
    if (Math.abs(delta) > 20 && Math.abs(delta) < window.innerHeight * 0.42) {
      window.scrollBy({
        top: delta,
        behavior: "smooth",
      });
    }
  }, []);

  // Automatic scroll-snap to center when user scrolls near the carousel
  useEffect(() => {
    let scrollTimer: number;
    let snapping = false;

    const onScrollSnap = () => {
      if (snapping) return;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const el = stageRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const stageCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const delta = stageCenter - viewportCenter;

        // When scrolling settles within snap threshold of center, snap card to center
        if (Math.abs(delta) > 18 && Math.abs(delta) < 130) {
          snapping = true;
          window.scrollBy({
            top: delta,
            behavior: "smooth",
          });
          setTimeout(() => {
            snapping = false;
          }, 500);
        }
      }, 160);
    };

    window.addEventListener("scroll", onScrollSnap, { passive: true });
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", onScrollSnap);
    };
  }, []);

  useEffect(() => {
    if (paused || !isInViewport || n <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 4600);
    return () => clearInterval(t);
  }, [n, paused, isInViewport]);

  const go = (d: number) => {
    if (n <= 0) return;
    setActive((a) => (a + d + n) % n);
  };

  const onDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isDragging.current = false;
    setPaused(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    // Real-time drag follow with elastic resistance
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isDragging.current = true;
      setDragOffset(dx);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    if (pointerStart.current && isDragging.current) {
      const dx = e.clientX - pointerStart.current.x;
      if (Math.abs(dx) > 35) {
        go(dx < 0 ? 1 : -1);
        alignToCenterViewport();
        suppressClickUntil.current = Date.now() + 250;
      }
    }
    pointerStart.current = null;
    isDragging.current = false;
    setDragOffset(0);
    setPaused(false);
  };

  const onWheel = (e: React.WheelEvent) => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const isHorizontal = absX > absY;
    const delta = isHorizontal ? e.deltaX : e.deltaY;

    if (isHorizontal || absY > 12) {
      wheelAccumulator.current += delta;
    }

    const now = Date.now();
    if (now - lastWheelSnapTime.current < 260) return;

    if (Math.abs(wheelAccumulator.current) >= 32) {
      const dir = wheelAccumulator.current > 0 ? 1 : -1;
      go(dir);
      alignToCenterViewport();
      lastWheelSnapTime.current = now;
      wheelAccumulator.current = 0;
    }
  };

  const handleCardClick = (index: number, offset: number) => {
    if (Date.now() < suppressClickUntil.current || isDragging.current) {
      return;
    }
    // Clicking a side card snaps it cleanly to center
    if (offset !== 0) {
      go(offset > 0 ? 1 : -1);
      alignToCenterViewport();
      return;
    }
    // Clicking the centered active card opens the case study
    onProject(index);
  };

  const gap = cardW * 0.56;

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
      <SectionHead
        label={workConfig.kicker || "Selected Work"}
        title={workConfig.title || "Work Gallery"}
        sub={workConfig.subtitle || "A selection of internship, academic, and personal projects exploring different users, industries, and product challenges."}
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

      {/* coverflow stage */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-label="Interactive projects coverflow with scroll snap"
        onWheel={onWheel}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
            alignToCenterViewport();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
            alignToCenterViewport();
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
        className="relative mx-auto flex h-[255px] touch-pan-y select-none items-center justify-center overflow-hidden [perspective:1600px] sm:h-[340px] md:h-[380px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded-2xl scroll-snap-stage"
        data-cursor="drag"
        data-cursor-text="DRAG"
        style={{ cursor: isDragging.current ? "grabbing" : "default" }}
      >
        {galleryItems.map((p, i) => {
          // shortest signed distance around the ring → cards always take the
          // nearest path and only ever "wrap" while fully transparent.
          let offset = ((i - safeActive) % n + n) % n;
          if (offset > n / 2) offset -= n;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          // abs 0 = focus, abs 1 = visible side, abs 2 = invisible staging slot
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.5 : 0;
          const interactive = abs <= 1;
          const dragShift = isDragging.current ? dragOffset * 0.75 : 0;
          const displayOffset = offset * gap + dragShift;

          return (
            <div
              key={`${p?.title || "project"}-${i}`}
              onClick={() => handleCardClick(i, offset)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCardClick(i, offset);
                }
              }}
              role="button"
              tabIndex={isActive ? 0 : -1}
              data-cursor="view"
              data-cursor-text={isActive ? "VIEW ↗" : "CENTER"}
              aria-label={isActive ? `Open ${p?.title || "Project"} detail page` : `Align ${p?.title || "Project"} to center`}
              title={isActive ? `Click to open ${p?.title || "project"} detail page` : `Click to center ${p?.title || "project"}`}
              className={`group absolute overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] cursor-pointer select-none transition-shadow active:shadow-sm`}
              style={{
                width: cardW,
                height: cardW * 0.62,
                transform: `translate3d(${displayOffset}px,0,${-abs * 130}px) rotateY(${offset * -24 + (dragShift / gap) * -12}deg) scale(${isActive ? 1 : 0.88})`,
                zIndex: 10 - abs,
                opacity,
                pointerEvents: interactive ? "auto" : "none",
                filter: isActive ? "brightness(1)" : "brightness(0.55)",
                boxShadow: isActive ? "var(--shadow-lift), 0 0 60px -16px var(--glow-1)" : "var(--shadow-soft)",
                transition: isDragging.current
                  ? "none"
                  : "transform 0.65s cubic-bezier(0.25,1,0.5,1), opacity 0.5s ease, filter 0.5s ease, box-shadow 0.5s ease",
                willChange: interactive ? "transform, opacity" : undefined,
              }}
            >
              <div
                className="relative size-full overflow-hidden transition-all duration-150 ease-out group-active:scale-[0.96] group-active:brightness-95 group-[.is-pressed]:scale-[0.96] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(i, offset);
                }}
              >
                <img
                  src={img(p?.thumbnail ?? p?.image ?? "1551288049-bebda4e38f71", 720, 460)}
                  alt={p?.title || "Project Preview"}
                  draggable={false}
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105 cursor-pointer"
                />
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }}
                />
                {/* Subtle external link icon on hover without any distracting text */}
                <div
                  className={`pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-end text-white transition-opacity duration-300 ${
                    isActive ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-80"
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

      {/* controls */}
      <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
        <button
          onClick={() => {
            go(-1);
            alignToCenterViewport();
          }}
          aria-label="Previous project"
          className="control-surface grid size-11 place-items-center rounded-full active:scale-90 cursor-pointer"
        >
          <Arrow className="size-4 rotate-180" />
        </button>
        <div className="flex gap-2">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                alignToCenterViewport();
              }}
              aria-label={`Go to project ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-75 ${
                i === safeActive ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-[var(--muted)]/40 hover:bg-[var(--muted)]"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            go(1);
            alignToCenterViewport();
          }}
          aria-label="Next project"
          className="control-surface grid size-11 place-items-center rounded-full active:scale-90 cursor-pointer"
        >
          <Arrow className="size-4" />
        </button>
      </div>

      {/* details */}
      <div className="mx-auto mt-10 max-w-3xl text-center">
        <div key={safeActive} style={{ animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
          <span className="label mb-3 block !text-[0.55rem] text-[var(--accent)]">
            {String(safeActive + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <h3
            onClick={() => onProject(safeActive)}
            className="font-display text-2xl font-bold leading-snug md:text-[1.75rem] cursor-pointer hover:text-[var(--accent)] transition-colors inline-block"
            title="Click to view project details"
          >
            {project?.title || "Untitled Project"}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--muted)]">{project?.desc || ""}</p>
          <button
            type="button"
            onClick={() => onProject(safeActive)}
            className="group mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-[0.8rem] font-medium cursor-pointer transition-transform duration-150 hover:text-[var(--accent)] active:scale-95 active:translate-x-1"
          >
            View Project <Arrow className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
