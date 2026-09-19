import { Reveal, SplitText, Tilt } from "./common";

const tools = [
  {
    name: "Figma",
    number: "01",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    role: "Interface design & prototyping",
    detail: "Components · Auto Layout · Design systems",
    accent: "#a99dff",
  },
  {
    name: "Photoshop",
    number: "02",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg",
    role: "Image editing & visual craft",
    detail: "Mockups · Retouching · Art direction",
    accent: "#7db6ff",
  },
  {
    name: "Illustrator",
    number: "03",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg",
    role: "Vector design & illustration",
    detail: "Icons · Brand assets · Graphics",
    accent: "#ff9a5c",
  },
  {
    name: "Canva",
    number: "04",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg",
    role: "Visual content & presentations",
    detail: "Social design · Decks · Fast concepts",
    accent: "#52d8e5",
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--hairline)]" />
      <div className="pointer-events-none absolute -right-32 top-16 size-80 rounded-full bg-[var(--accent)]/10 blur-[110px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-end gap-8 border-b border-[var(--hairline)] pb-10 md:grid-cols-[1fr_290px]">
          <div>
            <Reveal dir="up">
            <p className="section-kicker mb-5 flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-[var(--accent)]" />
                Selected tools / 04
              </p>
            </Reveal>
            <SplitText text="My design toolkit." className="section-title" />
          </div>
          <Reveal dir="up" delay={0.12}>
            <p className="max-w-xs text-[0.95rem] leading-relaxed text-[var(--muted)] md:mb-1">
              The focused set of tools I use to take work from the first frame to the final detail.
            </p>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool, index) => (
            <Reveal key={tool.name} dir="up" delay={0.08 + index * 0.07}>
              <Tilt className="group relative h-full overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-colors duration-500 hover:border-[var(--accent)]/40" max={4}>
                <span className="absolute right-5 top-5 font-mono text-[0.62rem] tracking-[0.18em] text-[var(--muted)]">{tool.number}</span>
                <div className="relative grid size-16 place-items-center rounded-2xl border border-white/8 bg-white/[0.035] transition-transform duration-500 group-hover:scale-110" style={{ boxShadow: `0 14px 34px -18px ${tool.accent}` }}>
                  <img src={tool.icon} alt="" className="size-9 object-contain" loading="lazy" />
                </div>
                <div className="mt-12">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.045em]">{tool.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--fg)]/75">{tool.role}</p>
                  <p className="mt-5 border-t border-[var(--hairline)] pt-4 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.11em] text-[var(--muted)]">{tool.detail}</p>
                </div>
                <span className="absolute bottom-0 left-0 h-px w-0 transition-[width] duration-500 group-hover:w-full" style={{ backgroundColor: tool.accent }} />
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
