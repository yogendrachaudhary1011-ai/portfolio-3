import { useRef, useEffect } from "react";
import { useParallax } from "./common";
import { useSite } from "../siteContext";

/* Intro curtain starts lifting at 1.2s. Hero elements animate in
   starting at 1.25s so they're already seamlessly mid-reveal when fully visible. */
const BASE = 1.25;

export default function Hero() {
  const { config, settings } = useSite();
  const heroConfig = config.hero;

  const showKicker = settings?.textVisibility?.showKickers ?? true;
  const showSub = settings?.textVisibility?.showSubheadings ?? true;
  const showBio = settings?.textVisibility?.showDescriptions ?? true;
  const showBadges = settings?.textVisibility?.showBadges ?? true;

  const { ref: portraitRef } = useParallax<HTMLDivElement>(50);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.style.setProperty("--spot-x", "50%");
    el.style.setProperty("--spot-y", "50%");
    el.style.setProperty("--tilt-x", "0px");
    el.style.setProperty("--rot-x", "0deg");
    el.style.setProperty("--rot-y", "0deg");

    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onPointerMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const tiltX = (px - 0.5) * 18;
        const tiltY = (py - 0.5) * 18;

        el.style.setProperty("--spot-x", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--spot-y", `${(py * 100).toFixed(1)}%`);
        el.style.setProperty("--tilt-x", `${tiltX.toFixed(1)}px`);
        el.style.setProperty("--rot-y", `${(-tiltX * 0.25).toFixed(2)}deg`);
        el.style.setProperty("--rot-x", `${(tiltY * 0.2).toFixed(2)}deg`);
      });
    };

    el.addEventListener("mousemove", onPointerMove, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const bio = heroConfig.bio || "Creating thoughtful, intuitive, and engaging digital experiences.";
  const bioWords = bio.split(" ");
  const marqueeName = heroConfig.marqueeName || "YOGENDRA CHAUDHARY";

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[44rem] items-end overflow-hidden pt-20 sm:min-h-screen sm:pt-24"
    >
      <h1 className="sr-only">{marqueeName}, {heroConfig.tagline}</h1>
      {/* dotted grid + spotlight */}
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity"
        style={{
          background: "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--accent-soft), transparent 60%)",
        }}
      />

      {/* giant scrolling outlined text */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center"
        style={{
          transform: "translateX(var(--tilt-x, 0px))",
          transition: "transform 0.4s ease-out",
          animation: `load-fade 1.4s ease ${BASE - 0.1}s both`,
        }}
      >
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span
              key={k}
              className="outline-text font-display font-extrabold leading-none"
              style={{ fontSize: "clamp(9rem, 26vw, 22rem)", paddingInline: "0.15em" }}
            >
              {marqueeName}&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* portrait */}
      <div
        ref={portraitRef}
        className="relative z-10 mx-auto flex w-full max-w-6xl justify-center px-6"
      >
        <div
          className="relative flex justify-center"
          style={{
            transform: "perspective(1200px) rotateY(var(--rot-y, 0deg)) rotateX(var(--rot-x, 0deg))",
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* glow without expensive gaussian blur */}
          <div
            className="pointer-events-none absolute left-1/2 top-[12%] -z-10 size-[46vh] max-h-[420px] max-w-[420px] -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, var(--glow-1) 0%, transparent 70%)",
              animation: `load-fade 1.6s ease ${BASE + 0.2}s both`,
            }}
          />
          <img
            src={heroConfig.portraitImage}
            alt={marqueeName}
            fetchPriority="high"
            decoding="async"
            className="h-[66vh] max-h-[760px] w-auto object-contain object-bottom drop-shadow-2xl sm:h-[74vh]"
            style={{
              maskImage: "linear-gradient(to bottom, black 86%, transparent)",
              animation: `load-up 1.2s cubic-bezier(0.22,1,0.36,1) ${BASE}s both`,
            }}
          />
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-7 z-20 md:hidden">
        {showSub && <p className="label !text-[0.55rem] text-[var(--fg)]/65">{heroConfig.tagline}</p>}
        {showBio && (
          <p
            className="mt-2 max-w-[17rem] leading-relaxed text-[var(--fg)]/80"
            style={{ fontSize: "calc(0.875rem * var(--subheading-scale, 1))" }}
          >
            {heroConfig.bio}
          </p>
        )}
      </div>

      {/* left meta */}
      <div className="absolute bottom-20 left-6 z-10 hidden max-w-[200px] md:block lg:bottom-24 lg:max-w-[220px]">
        {/* label */}
        {showKicker && (
          <p
            className="label mb-2 !text-[0.55rem]"
            style={{ animation: `load-up 0.6s cubic-bezier(0.22,1,0.36,1) ${BASE + 0.3}s both` }}
          >
            {heroConfig.tagline.split("·")[0]?.trim() || "Junior UI/UX Designer"}
          </p>
        )}

        {/* bio — word-by-word clip reveal */}
        {showBio && (
          <p style={{ margin: 0 }}>
            {bioWords.map((word, i) => (
              <span
                key={i}
                style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.28em" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "calc(0.875rem * var(--subheading-scale, 1))",
                    lineHeight: 1.625,
                    color: "var(--muted)",
                    animation: `load-word-clip 0.5s cubic-bezier(0.22,1,0.36,1) ${BASE + 0.42 + i * 0.048}s both`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </p>
        )}
      </div>

      {/* scroll down */}
      {showBadges && (
        <div
          className="absolute bottom-24 right-6 z-10 hidden items-center gap-3 md:flex"
          style={{
            writingMode: "vertical-rl",
            animation: `load-right 0.6s cubic-bezier(0.22,1,0.36,1) ${BASE + 0.65}s both`,
          }}
        >
          <span className="label !text-[0.6rem]">{heroConfig.scrollText || "Scroll Down"}</span>
          <span className="h-10 w-px animate-pulse bg-[var(--muted)]" />
        </div>
      )}
    </section>
  );
}
