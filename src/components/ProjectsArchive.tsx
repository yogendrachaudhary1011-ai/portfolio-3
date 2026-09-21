import { useEffect } from "react";
import { img, type Project } from "./../data";
import { Typewriter, Reveal, Magnetic, Tilt } from "./common";
import { External, Arrow } from "../icons";
import { useSite } from "../siteContext";

const devicon = (i: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${i}.svg`;

const digitalImages = [
  "1686061592689-312bbfb5c055",
  "1608222351212-18fe0ec7b13b",
  "1551288049-bebda4e38f71",
  "1599658880436-c61792e70672",
  "1460925895917-afdab827c52f",
];

export default function ProjectsArchive({
  projects,
  onContact,
  onProject,
}: {
  projects: Project[];
  onContact: () => void;
  onProject: (project: Project, index: number) => void;
}) {
  const { config } = useSite();
  const archiveConfig = config.projectsArchive;
  const digitalProjects = archiveConfig.digitalProjects;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      <section id="technical" className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36">
        <Reveal>
          <p className="section-kicker mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--accent)]" />
            Archive
          </p>
        </Reveal>
        <Typewriter
          text={archiveConfig.archiveTitle || "Case Studies"}
          className="section-title"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-[0.95rem] text-[var(--muted)]">
            {archiveConfig.archiveSubtitle}
          </p>
        </Reveal>

        <div className="mt-14 border-t border-[var(--hairline)]">
          {projects.map((p, i) => (
            <Reveal key={`${p?.title || "proj"}-${i}`} delay={i * 0.05} dir="up">
              <button
                type="button"
                onClick={() => onProject(p, i)}
                className="group relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-[var(--hairline)] py-6 text-left sm:gap-6 sm:py-7 cursor-pointer"
              >
                <span
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[var(--chip)] transition-transform duration-500 group-hover:scale-x-100"
                  style={{ borderRadius: 8 }}
                />
                <span className="relative font-mono text-xs text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <h3 className="font-display font-semibold transition-transform duration-300 group-hover:translate-x-2">
                    {p?.title || "Untitled Project"}
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-[0.85rem] text-[var(--muted)]">{p?.desc || ""}</p>
                  <p className="label mt-3 !text-[0.55rem]">{p?.stack || ""}</p>
                  <div className="mt-2 flex gap-3">
                    {(p?.tech ?? []).map((t) => (
                      <img
                        key={t}
                        src={devicon(t)}
                        alt=""
                        className={`size-4 grayscale transition-all duration-300 group-hover:grayscale-0 ${
                          t.includes("django") ? "dark:invert" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <External className="relative size-4 text-[var(--muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Digital Explorations */}
      <section id="digital" className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 sm:pb-24">
        <Reveal>
          <p className="section-kicker mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--accent)]" />
            Craft &amp; Explorations
          </p>
        </Reveal>
        <Typewriter
          text={archiveConfig.explorationsTitle || "Beyond the Brief"}
          className="section-title"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-[0.95rem] text-[var(--muted)]">
            {archiveConfig.explorationsSubtitle}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {digitalProjects.map((d, i) => (
            <Reveal key={`${d?.title || "digital"}-${i}`} delay={i * 0.08} dir="up">
              <Tilt max={7} className="group h-full">
                <div className="card-surface hover-lift flex h-full flex-col overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={img(digitalImages[i % digitalImages.length], 520, 340)}
                      alt={d?.title || "Digital Exploration"}
                      className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top, var(--accent-soft), transparent 55%)" }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-gradient font-display text-3xl font-semibold opacity-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display font-semibold">{d?.title || "Exploration"}</h3>
                    <p className="mt-2 text-[0.85rem] text-[var(--muted)]">{d?.desc || ""}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 sm:pb-32">
        <Reveal>
          <p className="label mb-6">Have a project in mind?</p>
        </Reveal>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="section-title">
            {archiveConfig.ctaTitle || "Let's design"}<br />
            <span className="text-gradient">{archiveConfig.ctaSubtitle || "something great."}</span>
          </h2>
          <Magnetic strength={0.3}>
            <button
              onClick={onContact}
              className="btn-shine inline-flex items-center gap-2 self-start rounded-full border border-[var(--card-border)] px-7 py-4 text-[0.82rem] font-medium transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              {archiveConfig.ctaButton || "Start a conversation"} <Arrow className="size-4" />
            </button>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
