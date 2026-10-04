import { useEffect, useRef, useState } from "react";
import { Reveal, SplitText, WordReveal } from "./common";
import { useSite } from "../siteContext";

/* Sticky stack geometry */
const NAV_OFFSET = 88; // px — clears the floating navbar on desktop
const MOBILE_NAV_OFFSET = 70; // px — clears floating navbar on mobile
const HEAD_GAP = 16; // px — breathing room below the pinned heading
const PEEK = 12; // px — exposed top edge of each covered card on desktop
const MOBILE_PEEK = 8; // px — exposed top edge on mobile
const stickyTop = (i: number, headH: number) => NAV_OFFSET + headH + HEAD_GAP + i * PEEK;
const getCardStickyTop = (i: number, headH: number, isMobile: boolean) =>
  isMobile ? MOBILE_NAV_OFFSET + i * MOBILE_PEEK : stickyTop(i, headH);

/* ─── Per-step lightweight visual ─────────────────────────────────────── */
const V = {
  card: "rounded-xl border border-[var(--process-border)] bg-[var(--process-bg)]",
  chip: "rounded-md bg-[var(--process-chip)]",
  mono: "font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[var(--process-muted)]",
};

function StepVisual({ index }: { index: number }) {
  switch (index % 7) {
    case 0: // Understand — four foundation cards
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {["Business goals", "User needs", "Constraints", "Success metrics"].map((l, i) => (
            <div key={l} className={`${V.card} p-3`} style={{ animation: `floaty ${5 + i * 0.4}s ease-in-out infinite` }}>
              <span className="mb-2 block size-2 rounded-full bg-[#a99dff]" />
              <span className="text-[0.62rem] font-medium leading-tight text-[var(--process-fg)]">{l}</span>
            </div>
          ))}
        </div>
      );
    case 1: // Research — interview / insight notes
      return (
        <div className="space-y-2">
          {[68, 90, 52].map((w, i) => (
            <div key={i} className={`${V.card} flex items-center gap-2.5 p-2.5`}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--process-chip)] text-[0.55rem] text-[#a99dff]">"</span>
              <span className="flex-1 space-y-1">
                <span className="block h-1.5 rounded-full bg-[var(--process-fg)] opacity-30" style={{ width: `${w}%` }} />
                <span className="block h-1.5 w-1/2 rounded-full bg-[var(--process-fg)] opacity-15" />
              </span>
            </div>
          ))}
        </div>
      );
    case 2: // Define — converge into core problem
      return (
        <div className="relative grid grid-cols-2 gap-2">
          {["User needs", "Business", "Constraints", "Opportunities"].map((l) => (
            <span key={l} className={`${V.chip} px-2 py-2 text-center text-[0.55rem] text-[var(--process-muted)]`}>{l}</span>
          ))}
          <div className="col-span-2 mt-1 grid place-items-center rounded-lg border border-[#a99dff]/50 bg-[var(--process-chip)] py-2.5 text-[0.6rem] font-semibold tracking-wide text-[#a99dff]">
            Core problem
          </div>
        </div>
      );
    case 3: // Explore — wireframe / sketch cluster
      return (
        <div className="mx-auto grid max-w-[11.5rem] grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${V.card} aspect-square p-2`}>
              <span className="mb-1.5 block h-1 w-2/3 rounded-full bg-[var(--process-fg)] opacity-25" />
              <span className={`block ${i % 2 ? "h-6" : "h-4"} rounded bg-[var(--process-chip)]`} />
            </div>
          ))}
        </div>
      );
    case 4: // Design — interface sample
      return (
        <div className={`${V.card} space-y-2.5 p-3.5`}>
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-[#a99dff]" />
            <span className="h-2 w-20 rounded-full bg-[var(--process-fg)] opacity-30" />
          </div>
          <div className="flex gap-1.5">
            {["#a99dff", "var(--process-fg)", "var(--process-chip)"].map((c, i) => (
              <span key={i} className="size-5 rounded-md" style={{ background: c, opacity: i === 1 ? 0.35 : 1 }} />
            ))}
          </div>
          <span className="block h-2 w-full rounded-full bg-[var(--process-chip)]" />
          <span className="inline-block rounded-md bg-[#a99dff] px-3 py-1 text-[0.55rem] font-semibold text-[#101011]">Button</span>
        </div>
      );
    case 5: // Prototype — connected screens
      return (
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`${V.card} h-20 w-14 p-1.5`}>
                <span className="mb-1 block h-1 w-full rounded-full bg-[var(--process-fg)] opacity-25" />
                <span className="block h-9 rounded bg-[var(--process-chip)]" />
              </div>
              {i < 2 && <span className="text-[#a99dff]">→</span>}
            </div>
          ))}
        </div>
      );
    default: // Iterate — feedback loop
      return (
        <div className={`${V.card} flex items-center justify-between p-3.5`}>
          <span className="relative grid size-16 place-items-center">
            <span className="absolute inset-0 rounded-full border border-dashed border-[#a99dff]/60" style={{ animation: "spin-slow 9s linear infinite" }} />
            <span className="text-sm text-[#a99dff]">↻</span>
          </span>
          <span className="flex items-end gap-1.5">
            {[10, 16, 13, 22, 19, 28].map((h, i) => (
              <span key={i} className="w-2 rounded-t bg-[#a99dff]" style={{ height: h, opacity: 0.4 + i * 0.1 }} />
            ))}
          </span>
        </div>
      );
  }
}

/* ─── Section ─────────────────────────────────────────────────────────── */
export default function MyProcess() {
  const { config } = useSite();
  const processConfig = config.process;
  const STEPS = processConfig.steps;

  const [active, setActive] = useState(0);
  const [headH, setHeadH] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    let isIntersecting = false;

    const updateHeadingH = () => {
      const h = headingRef.current?.offsetHeight ?? 0;
      setHeadH((prev) => (prev !== h ? h : prev));
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    updateHeadingH();

    const measure = () => {
      raf = 0;
      if (!isIntersecting) return;

      const mobile = typeof window !== "undefined" && window.innerWidth < 768;
      const h = headingRef.current?.offsetHeight ?? headH;
      let idx = 0;
      const cards = cardRefs.current;
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i];
        const targetTop = getCardStickyTop(i, h, mobile);
        if (el && el.getBoundingClientRect().top <= targetTop + 8) {
          idx = i;
        }
      }
      setActive((prev) => (prev !== idx ? idx : prev));

      const lastCard = cards[STEPS.length - 1];
      if (!mobile && lastCard && headingRef.current) {
        const finalCardTop = lastCard.getBoundingClientRect().top;
        const finalCardStickyTop = stickyTop(STEPS.length - 1, h);
        const exitRange = Math.max(h + 48, 1);
        const progress = Math.max(0, Math.min(1, (finalCardStickyTop + exitRange - finalCardTop) / exitRange));
        headingRef.current.style.transform = `translateY(calc(${-progress * 100}% - ${progress * 12}px))`;
      }
    };

    const onScroll = () => {
      if (!raf && isIntersecting) raf = requestAnimationFrame(measure);
    };

    const onResize = () => {
      updateHeadingH();
      if (!raf) raf = requestAnimationFrame(measure);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && sectionRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) onScroll();
      }, { rootMargin: "200px" });
      observer.observe(sectionRef.current);
    } else {
      isIntersecting = true;
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
    };
  }, [STEPS.length, headH]);

  const goTo = (i: number) => cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative bg-[var(--process-bg)] py-24 text-[var(--process-fg)] sm:py-32"
    >
      <div className="process-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute -left-28 top-40 size-[26rem] rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, var(--glow-2) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        {/* Pinned heading on desktop, natural flow on mobile */}
        <div
          ref={headingRef}
          className="relative md:sticky z-30 grid max-w-6xl gap-6 pb-5 md:grid-cols-[1fr_290px] md:items-end"
          style={{
            top: isMobile ? undefined : NAV_OFFSET,
            willChange: isMobile ? undefined : "transform",
          }}
        >
          <div>
            <Reveal>
              <p className="section-kicker mb-4 flex items-center gap-3 text-[var(--process-muted)]">
                <span className="h-px w-8 bg-[#a99dff]" />
                {processConfig.kicker}
              </p>
            </Reveal>
            <SplitText
              text={processConfig.title}
              className="section-title max-w-xl"
              stagger={0.02}
            />
          </div>
          <WordReveal
            text={processConfig.subtitle}
            className="max-w-xs text-sm leading-relaxed text-[var(--process-muted)] md:mb-1 md:justify-self-end"
            delay={0.15}
          />
        </div>

        {/* Mobile current step indicator */}
        <div className="mt-4 flex items-center justify-between md:hidden px-1">
          <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--process-fg)]">
            Step {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: idx === active ? 16 : 5,
                  background: idx === active ? "#a99dff" : "var(--process-border)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Stack + progress rail */}
        <div className="mt-10 flex gap-6 sm:mt-14">
          <div className="min-w-0 flex-1">
            {STEPS.map((step, i) => {
              const depth = active - i; // >0 == covered/behind
              const scale = depth > 0 ? 1 - Math.min(depth, 4) * (isMobile ? 0.016 : 0.014) : 1;
              const brightness = depth > 0 ? 1 - Math.min(depth, 4) * (isMobile ? 0.06 : 0.05) : 1;
              const topVal = getCardStickyTop(i, headH, isMobile);

              return (
                <div
                  key={`${step.title}-${i}`}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="sticky mb-5"
                  style={{
                    top: topVal,
                    scrollMarginTop: topVal - 8,
                    zIndex: i + 1,
                  }}
                >
                  <Reveal delay={i === 0 ? 0 : 0.04} dir="up">
                    <article
                      onClick={() => goTo(i)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Step ${i + 1}: ${step.title}`}
                      className="grid gap-5 overflow-hidden rounded-2xl border border-[var(--process-border)] bg-[var(--process-card)] p-5 sm:gap-7 sm:p-6 md:grid-cols-[1.25fr_0.75fr] md:items-center cursor-pointer select-none active:scale-[0.985] active:brightness-95"
                      style={{
                        minHeight: "clamp(220px, 29vh, 288px)",
                        transform: `scale(${scale})`,
                        transformOrigin: "center top",
                        filter: `brightness(${brightness})`,
                        boxShadow: "var(--shadow-soft)",
                        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), filter 0.45s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {/* Left — text */}
                      <div className="flex flex-col">
                        <h3 className="font-display text-[1.7rem] font-semibold leading-[1] tracking-[-0.045em] sm:text-[2.1rem]">
                          {step.title}
                        </h3>
                        <p className="mt-3 max-w-md text-[0.82rem] leading-relaxed text-[var(--process-muted)]">
                          {step.desc}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-3.5 gap-y-1.5">
                          {step.tags.map((tag) => (
                            <span key={tag} className="font-mono text-[0.54rem] uppercase tracking-[0.1em] text-[var(--process-muted)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mt-auto pt-5 text-[0.76rem] italic leading-snug text-[var(--process-fg)]">
                          <span className="mr-2 text-[#a99dff]">—</span>
                          {step.principle}
                        </p>
                      </div>

                      {/* Right — visual */}
                      <div className="rounded-xl border border-[var(--process-border)] bg-[var(--process-chip)]/40 p-4">
                        <StepVisual index={i} />
                      </div>
                    </article>
                  </Reveal>
                </div>
              );
            })}
          </div>

          {/* Progress rail — desktop & tablet */}
          <div className="hidden w-12 shrink-0 md:block">
            <div className="sticky flex flex-col items-center gap-4" style={{ top: "42vh" }}>
              <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--process-fg)]">
                {String(active + 1).padStart(2, "0")}
                <span className="text-[var(--process-muted)]"> / {String(STEPS.length).padStart(2, "0")}</span>
              </span>
              <div className="flex flex-col items-center gap-2.5">
                {STEPS.map((step, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to step ${String(i + 1).padStart(2, "0")} — ${step.title}`}
                      aria-current={on ? "step" : undefined}
                      className="group grid size-9 place-items-center rounded-full cursor-pointer transition-transform active:scale-75"
                    >
                      <span
                        className="rounded-full transition-all duration-500"
                        style={{
                          width: on ? 8 : 6,
                          height: on ? 8 : 6,
                          background: on ? "#a99dff" : "var(--process-border)",
                          boxShadow: on ? "0 0 0 4px var(--process-chip)" : "none",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
