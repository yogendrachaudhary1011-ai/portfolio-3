import { Typewriter, Reveal } from "./common";
import { Verified } from "../icons";
import { useSite } from "../siteContext";

export default function About() {
  const { config } = useSite();
  const about = config.about;

  return (
    <section id="about" className="relative mx-auto max-w-6xl overflow-hidden px-5 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <p className="section-kicker mb-4 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-[var(--accent)]" />
          {about.kicker}
        </p>
      </Reveal>
      <Typewriter
        text={about.title}
        className="section-title"
      />

      <div className="mt-14 max-w-3xl">
        <Reveal dir="up">
          <div className="card-surface hover-lift flex items-start gap-4 p-4 sm:items-center sm:gap-5 sm:p-5">
            <div className="relative shrink-0">
              <span className="absolute -inset-1 rounded-full opacity-60" style={{ background: "var(--glow-1)", filter: "blur(14px)" }} />
              <img
                src={about.avatarImage}
                alt={about.name}
                className="relative size-20 rounded-full border border-[var(--card-border)] object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold tracking-wide">{about.name}</h3>
                <Verified className="size-5" />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 sm:gap-8">
                {about.stats.map((s) => (
                  <div key={s.k}>
                    <p className="label !text-[0.55rem]">{s.k}</p>
                    <p className="text-gradient font-display text-lg font-semibold">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[0.97rem] leading-relaxed text-[var(--muted)]">
            {about.bioParagraph1}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-[0.95rem] text-[var(--muted)]">
            {about.bioParagraph2}{" "}
            <a href={about.ctaHref || "#work"} className="group relative font-medium text-[var(--fg)]">
              {about.ctaLabel || "View selected work"}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-100 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-0" />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
