import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Reveal, SplitText } from "./common";
import { useSite } from "../siteContext";

export default function Skills() {
  const { config, settings } = useSite();
  const sectionRef = useRef<HTMLElement | null>(null);
  const skillsConfig = config.skills;
  const tools = skillsConfig.tools;
  const showKicker = settings?.textVisibility?.showKickers ?? true;

  const [selectedToolIdx, setSelectedToolIdx] = useState(0);
  const activeTool = tools[selectedToolIdx] || tools[0];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
  });
  const inspectorY = useTransform(smoothScroll, [0, 1], [28, -28]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="grid items-end gap-8 border-b border-[var(--hairline)] pb-12 md:grid-cols-[1fr_320px]">
          <div>
            {showKicker && (
              <Reveal dir="up">
                <p className="section-kicker mb-5 flex items-center gap-3">
                  <span className="inline-block h-px w-8 bg-[var(--accent)]" />
                  <span>{skillsConfig.kicker}</span>
                </p>
              </Reveal>
            )}
            <SplitText
              text={skillsConfig.title}
              className="section-title [text-wrap:balance]"
            />
          </div>
          <Reveal dir="up" delay={0.12}>
            <p className="max-w-xs text-[0.95rem] leading-relaxed text-[var(--muted)] md:mb-1">
              {skillsConfig.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Interactive Toolkit Dock + Live Specification Inspector */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-stretch">
          {/* Left 7 Columns: Interactive Instrument Matrix */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {tools.map((tool, index) => {
              const isSelected = selectedToolIdx === index;
              return (
                <button
                  key={`${tool.name}-${index}`}
                  type="button"
                  onClick={() => setSelectedToolIdx(index)}
                  onMouseEnter={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.matchMedia("(pointer: fine)").matches
                    ) {
                      setSelectedToolIdx(index);
                    }
                  }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 text-left transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--card)] shadow-[var(--shadow-soft)]"
                      : "border-[var(--card-border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/40"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="skill-active-outline"
                      className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[var(--accent)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex w-full items-start justify-between">
                    <div className="grid size-13 place-items-center rounded-xl border border-[var(--card-border)] bg-[var(--chip)]">
                      <img
                        src={tool.icon}
                        alt={tool.name}
                        referrerPolicy="no-referrer"
                        className="size-7 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="font-mono text-xs text-[var(--accent)] tabular-nums">
                      {tool.number || String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--fg)]">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--muted)]">
                      {tool.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 5 Columns: Live Instrument Telemetry & Workflow Inspector */}
          <motion.div
            style={{ y: inspectorY }}
            className="flex flex-col justify-between rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-7 sm:p-9 shadow-[var(--shadow-soft)] lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4 font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)] tabular-nums">
              <span>Instrument Inspector</span>
              <span className="text-[var(--accent)]">
                Slot {String(selectedToolIdx + 1).padStart(2, "0")} /{" "}
                {String(tools.length).padStart(2, "0")}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedToolIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="my-8"
              >
                <div className="flex items-center gap-5">
                  <div className="grid size-20 place-items-center rounded-2xl border border-[var(--hairline)] bg-[var(--bg-2)] p-4">
                    <img
                      src={activeTool?.icon}
                      alt={activeTool?.name}
                      referrerPolicy="no-referrer"
                      className="size-11 object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-serif italic text-lg text-[var(--accent)]">
                      Production Stack
                    </span>
                    <h4 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--fg)]">
                      {activeTool?.name}
                    </h4>
                  </div>
                </div>

                <p className="mt-6 text-base leading-[1.7] text-[var(--muted)]">
                  {activeTool?.role}
                </p>

                <div className="mt-6 rounded-xl border border-[var(--hairline)] bg-[var(--bg-2)] p-4">
                  <span className="block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Core Capabilities & Output
                  </span>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--fg)]">
                    {activeTool?.detail}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="border-t border-[var(--hairline)] pt-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[var(--muted)]">
              Select or hover any instrument to inspect workflow role
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
