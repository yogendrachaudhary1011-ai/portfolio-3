import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSite } from "../siteContext";

export function useInView<T extends HTMLElement>(once = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal immediately if already within (or above) the viewport on mount.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      setInView(true);
      if (once) return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);

    // Safety net: never leave content permanently hidden if the observer
    // misbehaves inside a proxied iframe.
    const fallback = window.setTimeout(() => setInView(true), 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [once]);

  return { ref, inView };
}

/* Scroll-linked parallax: applies translateY directly to DOM element via rAF with IntersectionObserver */
export function useParallax<T extends HTMLElement>(strength = 40) {
  const ref = useRef<T>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isVisible = true;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!isVisible || !el) return;
      const rect = el.getBoundingClientRect();
      const raw = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const progress = Math.max(-1, Math.min(1, raw));
      const offset = -progress * strength;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const onScroll = () => {
      if (!raf && isVisible) raf = requestAnimationFrame(update);
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) onScroll();
      }, { rootMargin: "100px" });
      io.observe(el);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (io) io.disconnect();
    };
  }, [strength]);

  return { ref, y };
}

/* Character-by-character 3D flip reveal — use for section headings */
export function SplitText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.032,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  let characterIndex = 0;
  return (
    // @ts-expect-error polymorphic ref
    <Tag ref={ref} className={className} style={{ perspective: "700px", perspectiveOrigin: "50% 0%" }}>
      {text.split(" ").map((word, wordIndex, words) => (
        <Fragment key={`${word}-${wordIndex}`}>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((ch) => {
              const index = characterIndex++;
              return (
                <span
                  key={`${ch}-${index}`}
                  style={{
                    display: "inline-block",
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0) rotateX(0)" : "translateY(0.65em) rotateX(-75deg)",
                    transition: `opacity 0.55s ease ${delay + index * stagger}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay + index * stagger}s`,
                    willChange: "opacity, transform",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wordIndex < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}

/* Word-level clip reveal — use for body paragraphs */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView<HTMLParagraphElement>();
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.28em" }}>
          <span
            style={{
              display: "inline-block",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(100%)",
              transition: `opacity 0.5s ease ${delay + i * stagger}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </p>
  );
}

export function Typewriter({ text, className }: { text: string; className?: string }) {
  const { ref, inView } = useInView<HTMLHeadingElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || n >= text.length) return;
    const t = setTimeout(() => setN((v) => v + 1), 48);
    return () => clearTimeout(t);
  }, [inView, n, text]);
  const done = n >= text.length;
  return (
    <h2 ref={ref} className={className}>
      {text.slice(0, n)}
      <span
        className={`ml-1 inline-block w-[3px] rounded-full bg-[var(--accent)] align-middle ${done ? "caret" : ""}`}
        style={{ height: "0.82em" }}
      />
    </h2>
  );
}

type Dir = "up" | "down" | "left" | "right" | "none";
const offsets: Record<Dir, string> = {
  up: "translateY(34px)",
  down: "translateY(-34px)",
  left: "translateX(40px)",
  right: "translateX(-40px)",
  none: "translateY(0)",
};

export function Reveal({
  children,
  delay = 0,
  className,
  dir = "up",
  blur = false,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  dir?: Dir;
  blur?: boolean;
  style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0,0,0)" : offsets[dir],
        filter: blur ? (inView ? "none" : "blur(6px)") : undefined,
        transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s, filter 0.75s ease ${delay}s`,
        willChange: inView ? undefined : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Reveals children one-by-one with a stagger */
export function Stagger({
  children,
  step = 0.08,
  className,
  dir = "up",
}: {
  children: ReactNode[];
  step?: number;
  className?: string;
  dir?: Dir;
}) {
  return (
    <div className={className}>
      {children.map((c, i) => (
        <Reveal key={i} delay={i * step} dir={dir}>
          {c}
        </Reveal>
      ))}
    </div>
  );
}

export function SectionHead({
  label,
  title,
  sub,
  action,
}: {
  label: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  const { settings } = useSite();
  const showKicker = settings?.textVisibility?.showKickers ?? true;
  const showSub = settings?.textVisibility?.showSubheadings ?? true;

  return (
    <div className="mb-12 flex flex-col gap-6 border-b border-[var(--hairline)] pb-9 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {showKicker && (
          <Reveal dir="up">
            <p className="section-kicker mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--accent)]" />
              {label}
            </p>
          </Reveal>
        )}
        <SplitText
          text={title}
          className="section-title"
        />
        {sub && showSub && (
          <Reveal delay={0.15} dir="up">
            <p className="section-subheading mt-5 max-w-xl text-[var(--muted)]">{sub}</p>
          </Reveal>
        )}
      </div>
      {action && (
        <Reveal delay={0.2} dir="left">
          {action}
        </Reveal>
      )}
    </div>
  );
}

/* rAF-based value smoother — lerps current toward a target every frame */
function useSmoothed(apply: (v: number[]) => void, factor = 0.12) {
  const target = useRef<number[]>([]);
  const current = useRef<number[]>([]);
  const raf = useRef(0);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  const tick = () => {
    const t = target.current;
    const c = current.current;
    let moving = false;
    for (let i = 0; i < t.length; i++) {
      c[i] = (c[i] ?? 0) + ((t[i] ?? 0) - (c[i] ?? 0)) * factor;
      if (Math.abs((t[i] ?? 0) - c[i]) > 0.01) moving = true;
    }
    applyRef.current(c.slice());
    raf.current = moving ? requestAnimationFrame(tick) : 0;
  };

  const set = (vals: number[]) => {
    target.current = vals;
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return set;
}

/* Magnetic hover wrapper — element leans toward the cursor on desktop fine pointer devices */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const set = useSmoothed((v) => {
    if (ref.current) ref.current.style.transform = `translate3d(${v[0]}px, ${v[1]}px, 0)`;
  }, 0.18);

  const onMove = (e: React.MouseEvent) => {
    // Only execute on devices with fine pointer (mouse/trackpad), not touch screens
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    set([(e.clientX - r.left - r.width / 2) * strength, (e.clientY - r.top - r.height / 2) * strength]);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => set([0, 0])}
      className={className}
      style={{ display: "inline-block" }}
    >
      {children}
    </div>
  );
}

/* 3D tilt card responding to pointer position on desktop fine pointer devices */
export function Tilt({
  children,
  className,
  max = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const set = useSmoothed((v) => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateX(${v[0]}deg) rotateY(${v[1]}deg)`;
    el.style.setProperty("--gx", `${v[2]}%`);
    el.style.setProperty("--gy", `${v[3]}%`);
  }, 0.14);

  const onMove = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    set([(0.5 - py) * max, (px - 0.5) * max, px * 100, py * 100]);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => set([0, 0, 50, 50])}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {glare && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.18), transparent 55%)",
          }}
        />
      )}
    </div>
  );
}
