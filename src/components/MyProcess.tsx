import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplitText, WordReveal, Reveal } from "./common";
import { useSite } from "../siteContext";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function MyProcess() {
  const { config, settings } = useSite();
  const processConfig = config.process;
  const STEPS = processConfig.steps;
  const showKicker = settings?.textVisibility?.showKickers ?? true;

  const [active, setActive] = useState(0);
  const safeActive = Math.max(0, Math.min(active, STEPS.length - 1));
  const currentStep = STEPS[safeActive] || STEPS[0];

  const prev = () =>
    setActive((curr) => (curr - 1 + STEPS.length) % STEPS.length);
  const next = () => setActive((curr) => (curr + 1) % STEPS.length);

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-[var(--hairline)] bg-[var(--bg)] py-24 text-[var(--fg)] sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="grid items-end gap-8 border-b border-[var(--hairline)] pb-12 md:grid-cols-[1fr_340px]">
          <div>
            {showKicker && (
              <Reveal>
                <p className="section-kicker mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-[var(--accent)]" />
                  <span>03 · {processConfig.kicker}</span>
                </p>
              </Reveal>
            )}
            <SplitText
              text={processConfig.title}
              className="section-title max-w-2xl [text-wrap:balance]"
              stagger={0.02}
            />
          </div>
          <WordReveal
            text={processConfig.subtitle}
            className="max-w-xs text-sm leading-relaxed text-[var(--muted)] md:mb-1 md:justify-self-end"
            delay={0.15}
          />
        </div>

        {/* Horizontal Interactive Phase Sequencer Rail */}
        <div className="mt-12 overflow-x-auto pb-3">
          <div className="relative inline-flex min-w-full items-center justify-between gap-2 rounded-2xl border border-[var(--hairline)] bg-[var(--card)] p-2">
            {STEPS.map((step, idx) => {
              const isSelected = safeActive === idx;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={`relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "text-[#050505]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="process-sequencer-pill"
                      className="absolute inset-0 rounded-xl bg-[var(--accent)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 font-mono text-[0.65rem] opacity-75 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative z-10 font-display tracking-tight">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Phase Architectural Stage */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-7 sm:p-12 shadow-[var(--shadow-soft)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeActive}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-10 lg:grid-cols-12 lg:items-center"
            >
              {/* Left 7 Columns: Giant Phase Number + Narrative */}
              <div className="lg:col-span-7">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-6xl sm:text-8xl font-extrabold leading-none tracking-tighter text-[var(--accent)] tabular-nums">
                    {String(safeActive + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Phase {safeActive + 1} of {STEPS.length}
                    </span>
                    <h3 className="mt-1 font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-[var(--fg)]">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-6 max-w-2xl text-base sm:text-lg leading-[1.75] text-[var(--muted)]">
                  {currentStep.desc}
                </p>

                <div className="mt-8 border-t border-[var(--hairline)] pt-5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--fg)]">
                  {currentStep.tags.join("  ·  ")}
                </div>
              </div>

              {/* Right 5 Columns: Editorial Axiom Plate & Phase Controls */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--hairline)] bg-[var(--bg-2)] p-7 sm:p-9 lg:col-span-5">
                <div>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                    Governing Axiom
                  </span>
                  <blockquote className="mt-4 font-serif italic text-2xl sm:text-3xl leading-[1.3] text-[var(--fg)]">
                    “{currentStep.principle}”
                  </blockquote>
                </div>

                {/* Progress Bar & Next/Prev Triggers */}
                <div className="mt-10 border-t border-[var(--hairline)] pt-6">
                  <div className="mb-4 flex items-center justify-between font-mono text-xs text-[var(--muted)] tabular-nums">
                    <span>Pipeline Completion</span>
                    <span>
                      {Math.round(((safeActive + 1) / STEPS.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((safeActive + 1) / STEPS.length) * 100}%`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                      className="h-full bg-[var(--accent)]"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prev}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--fg)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[#050505] hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <span>Next Phase</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
