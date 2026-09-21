import { useEffect, useRef, useState } from "react";
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
  const galleryItems = projects.length ? projects : initialCaseStudies;
  const n = galleryItems.length;

  useEffect(() => setActive((current) => Math.min(current, n - 1)), [n]);

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

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 4600);
    return () => clearInterval(t);
  }, [n, paused]);

  const go = (d: number) => setActive((a) => (a + d + n) % n);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX };
    moved.current = false;
    setPaused(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) moved.current = true;
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    }
    drag.current = null;
    setPaused(false);
  };

  const project = galleryItems[active];
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
              className="btn-shine inline-flex items-center gap-2 self-start rounded-full bg-[var(--fg)] px-6 py-3 text-[0.8rem] font-medium text-[var(--bg)] transition-transform duration-300 hover:scale-[1.03]"
            >
              View More Projects <External className="size-4" />
            </button>
          </Magnetic>
        }
      />

      {/* coverflow stage */}
      <div
        ref={stageRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative mx-auto flex h-[255px] touch-pan-y select-none items-center justify-center overflow-hidden [perspective:1600px] sm:h-[340px] md:h-[380px]"
        style={{ cursor: "grab" }}
      >
        {galleryItems.map((p, i) => {
          // shortest signed distance around the ring → cards always take the
          // nearest path and only ever "wrap" while fully transparent.
          let offset = ((i - active) % n + n) % n;
          if (offset > n / 2) offset -= n;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          // abs 0 = focus, abs 1 = visible side, abs 2 = invisible staging slot
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.5 : 0;
          const interactive = abs <= 1;
          return (
            <div
              key={`${p.title}-${i}`}
              onClick={() => !moved.current && interactive && setActive(i)}
              className="group absolute overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]"
              style={{
                width: cardW,
                height: cardW * 0.62,
                transform: `translate3d(${offset * gap}px,0,${-abs * 130}px) rotateY(${offset * -24}deg) scale(${isActive ? 1 : 0.88})`,
                zIndex: 10 - abs,
                opacity,
                pointerEvents: interactive ? "auto" : "none",
                filter: isActive ? "brightness(1)" : "brightness(0.55)",
                boxShadow: isActive ? "var(--shadow-lift), 0 0 60px -16px var(--glow-1)" : "var(--shadow-soft)",
                transition:
                  "transform 0.8s cubic-bezier(0.33,1,0.68,1), opacity 0.6s ease, filter 0.7s ease, box-shadow 0.7s ease",
                willChange: "transform, opacity",
              }}
            >
              <img
                src={img(p.thumbnail ?? p.image ?? "1551288049-bebda4e38f71", 720, 460)}
                alt={p.title}
                draggable={false}
                className="pointer-events-none size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent 45%)" }}
              />
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="control-surface grid size-11 place-items-center rounded-full"
        >
          <Arrow className="size-4 rotate-180" />
        </button>
        <div className="flex gap-2">
          {galleryItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to project ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-[var(--muted)]/40 hover:bg-[var(--muted)]"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="control-surface grid size-11 place-items-center rounded-full"
        >
          <Arrow className="size-4" />
        </button>
      </div>

      {/* details */}
      <div className="mx-auto mt-10 max-w-3xl text-center">
        <div key={active} style={{ animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
          <span className="label mb-3 block !text-[0.55rem] text-[var(--accent)]">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <h3 className="font-display text-2xl font-bold leading-snug md:text-[1.75rem]">{project.title}</h3>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--muted)]">{project.desc}</p>
          <button
            type="button"
            onClick={() => onProject(active)}
            className="group mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-[0.8rem] font-medium"
          >
            View Project <Arrow className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
