import { useState } from "react";
import { Reveal, SplitText, WordReveal } from "./common";
import { useSite } from "../siteContext";
import { ArrowUpRight } from "lucide-react";

export default function Capabilities() {
  const [active, setActive] = useState(0);
  const { config } = useSite();
  const cap = config.capabilities;
  const practices = cap.items;

  return (
    <section id="what-i-can-do" className="relative overflow-hidden bg-[var(--process-bg)] py-24 text-[var(--process-fg)] sm:py-32">
      <div className="process-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute -right-28 top-28 size-[28rem] rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, var(--glow-1) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-end gap-8 border-b border-[var(--process-border)] pb-10 md:grid-cols-[1fr_auto]">
          <div>
            <Reveal>
              <p className="section-kicker mb-5 flex items-center gap-3 text-[var(--process-muted)]">
                <span className="h-px w-8 bg-[#a99dff]" />
                {cap.kicker}
              </p>
            </Reveal>
            <SplitText
              text={cap.title}
              className="section-title max-w-4xl"
              stagger={0.018}
            />
          </div>
          <WordReveal text={cap.subtitle} className="max-w-xs text-sm leading-relaxed text-[var(--process-muted)] md:mb-1" delay={0.2} />
        </div>

        <div className="mt-6">
          {practices.map((practice, index) => {
            const selected = active === index;
            const contentId = `practice-panel-${index}`;
            return (
              <Reveal key={practice.num} delay={index * 0.055} blur={false}>
                <button
                  type="button"
                  onClick={() => setActive((curr) => (curr === index ? -1 : index))}
                  onMouseEnter={() => {
                    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
                      setActive(index);
                    }
                  }}
                  aria-expanded={selected}
                  aria-controls={contentId}
                  className={`group grid w-full grid-cols-[2.25rem_1fr_auto] gap-3 border-b border-[var(--process-border)] py-5 text-left transition-all duration-300 sm:grid-cols-[5rem_1fr_auto] sm:py-8 cursor-pointer select-none active:scale-[0.99] active:translate-x-1 ${selected ? "text-[var(--process-fg)]" : "text-[var(--process-muted)] hover:text-[var(--process-fg)]"}`}
                >
                  <span className="pt-2 font-mono text-[0.62rem] tracking-[0.18em] text-[#a99dff]">{practice.num}</span>
                  <div>
                    <h3 className="font-display text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">{practice.title}</h3>
                    <div
                      id={contentId}
                      role="region"
                      aria-label={practice.title}
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ${selected ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pr-2 text-sm leading-relaxed text-[var(--process-muted)] sm:text-[0.95rem]">{practice.desc}</p>
                        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                          {practice.skills.map((skill) => <span key={skill} className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--process-muted)]">{skill}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`mt-2 grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300 group-active:scale-90 ${
                      selected
                        ? "rotate-45 border-[#a99dff] bg-[#a99dff] text-[#101011]"
                        : "border-[var(--process-border)] text-[var(--process-muted)] group-hover:border-[#a99dff] group-hover:text-[var(--process-fg)]"
                    }`}
                  >
                    <ArrowUpRight className="size-4 transition-transform" />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
