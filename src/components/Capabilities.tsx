import { useState } from "react";
import { Reveal, SplitText, WordReveal } from "./common";

const practices = [
  {
    num: "01",
    title: "Product Strategy",
    desc: "Clarifying the opportunity, defining the right problem, and creating a sharp path from business intent to customer value.",
    skills: ["Product vision", "Discovery", "Roadmaps", "Stakeholder workshops"],
  },
  {
    num: "02",
    title: "UX Research",
    desc: "Finding the useful signal in real behaviours, needs, and friction — then turning insight into practical design direction.",
    skills: ["User interviews", "Usability tests", "Journey mapping", "Synthesis"],
  },
  {
    num: "03",
    title: "Experience Design",
    desc: "Structuring flows, information, and interactions so every moment makes sense and earns the next one.",
    skills: ["Information architecture", "User flows", "Wireframes", "Prototypes"],
  },
  {
    num: "04",
    title: "Interface Design",
    desc: "Creating crisp, expressive interfaces with hierarchy, rhythm, and the small details that make products feel alive.",
    skills: ["Visual systems", "Responsive UI", "Interaction states", "Motion direction"],
  },
  {
    num: "05",
    title: "Design Systems",
    desc: "Building the shared language behind a product: adaptable components, tokens, and guidelines teams can rely on.",
    skills: ["Components", "Design tokens", "Documentation", "Figma libraries"],
  },
  {
    num: "06",
    title: "Accessibility",
    desc: "Designing with range in mind — inclusive patterns, readable hierarchy, and interfaces that work in the real world.",
    skills: ["WCAG", "Inclusive design", "Keyboard flows", "Content hierarchy"],
  },
  {
    num: "07",
    title: "Design Partnership",
    desc: "Working closely with product and engineering to make strong decisions, protect craft, and ship with confidence.",
    skills: ["Design critique", "Developer handoff", "QA", "Team alignment"],
  },
];

export default function Capabilities() {
  const [active, setActive] = useState(0);

  return (
    <section id="what-i-can-do" className="relative overflow-hidden bg-[var(--process-bg)] py-24 text-[var(--process-fg)] sm:py-32">
      <div className="process-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -right-28 top-28 size-[28rem] rounded-full bg-[var(--glow-1)] opacity-50 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-end gap-8 border-b border-[var(--process-border)] pb-10 md:grid-cols-[1fr_auto]">
          <div>
            <Reveal>
              <p className="section-kicker mb-5 flex items-center gap-3 text-[var(--process-muted)]">
                <span className="h-px w-8 bg-[#a99dff]" />
                02 / What I can do
              </p>
            </Reveal>
            <SplitText
              text="Make the complex feel inevitable."
              className="section-title max-w-4xl"
              stagger={0.018}
            />
          </div>
          <WordReveal text="A complete product-design practice, from the first question to the final pixel." className="max-w-xs text-sm leading-relaxed text-[var(--process-muted)] md:mb-1" delay={0.2} />
        </div>

        <div className="mt-6">
          {practices.map((practice, index) => {
            const selected = active === index;
            return (
              <Reveal key={practice.num} delay={index * 0.055} blur={false}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  aria-expanded={selected}
                  className={`group grid w-full grid-cols-[2.25rem_1fr_auto] gap-3 border-b border-[var(--process-border)] py-5 text-left transition-colors duration-500 sm:grid-cols-[5rem_1fr_auto] sm:py-8 ${selected ? "text-[var(--process-fg)]" : "text-[var(--process-muted)] hover:text-[var(--process-fg)]"}`}
                >
                  <span className="pt-2 font-mono text-[0.62rem] tracking-[0.18em] text-[#a99dff]">{practice.num}</span>
                  <div>
                    <h3 className="font-display text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">{practice.title}</h3>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${selected ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pr-2 text-sm leading-relaxed text-[var(--process-muted)] sm:text-[0.95rem]">{practice.desc}</p>
                        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                          {practice.skills.map((skill) => <span key={skill} className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--process-muted)]">{skill}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`mt-2 grid size-8 place-items-center rounded-full border text-lg transition-all duration-500 ${selected ? "rotate-45 border-[#a99dff] bg-[#a99dff] text-[#101011]" : "border-[var(--process-border)] text-[var(--process-muted)] group-hover:border-[#a99dff]"}`}>↗</span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
