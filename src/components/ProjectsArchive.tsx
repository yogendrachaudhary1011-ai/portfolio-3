import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { img, getFullWidthImageUrl, type Project } from "../data";
import { Typewriter, Reveal, Magnetic, Tilt } from "./common";
import { useSite } from "../siteContext";

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
  const { config, settings } = useSite();
  const archiveConfig = config.projectsArchive;
  const digitalProjects = archiveConfig?.digitalProjects || [];

  const showListing = (archiveConfig?.showArchiveListing !== false) && (settings?.sections?.archiveListing !== false);
  const showExplorations = (archiveConfig?.showExplorations !== false) && (settings?.sections?.archiveExplorations !== false) && (settings?.sections?.beyondTheBrief !== false) && digitalProjects.length > 0;
  const showCta = (archiveConfig?.showCta !== false) && (settings?.sections?.archiveCta !== false);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white transition-colors duration-300">
      {/* ─── Archive Header & Project Listing ───────────────────────────── */}
      {showListing && (
        <section id="technical" className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>{archiveConfig?.archiveBackButton || "Back to Overview"}</span>
            </button>
            <span className="text-[0.68rem] font-mono uppercase tracking-widest text-[var(--muted)]">
              {projects.length} {archiveConfig?.archiveCountSuffix || "Selected Artifacts"}
            </span>
          </div>

          <Reveal>
            <p className="section-kicker mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--accent)]" />
              {archiveConfig?.archiveKicker || "Archive"}
            </p>
          </Reveal>

          <Typewriter
            text={archiveConfig?.archiveTitle || "Case Studies"}
            className="section-title"
          />
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-[0.96rem] leading-relaxed text-[var(--muted)]">
              {archiveConfig?.archiveSubtitle ||
                "A curated archive of selected client projects, product designs, interface systems, and detailed case studies."}
            </p>
          </Reveal>

        {/* ─── Premium Redesigned Interactive List ────────────────────────── */}
        <div className="mt-14 divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
          {projects.map((p, originalIndex) => {
            const coverSrc = p.thumbnail || p.image || (p.media && p.media[0]) || "";
            const resolvedCover = coverSrc ? getFullWidthImageUrl(coverSrc) : "";

            return (
              <Reveal key={`${p?.title || "proj"}-${originalIndex}`} delay={originalIndex * 0.04} dir="up">
                <div
                  onMouseEnter={() => setHoveredIdx(originalIndex)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onProject(p, originalIndex)}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 py-6 sm:py-8 text-left transition-all duration-300 rounded-2xl px-4 sm:px-6 cursor-pointer overflow-hidden border border-transparent hover:border-[var(--card-border)]"
                >
                  {/* Origin-left expanding background wipe with subtle accent tint */}
                  <span
                    className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-[var(--chip)] via-[var(--card)] to-[var(--chip)] transition-transform duration-500 ease-out group-hover:scale-x-100"
                    style={{ borderRadius: "1rem" }}
                  />
                  {/* Subtle accent glow border on hover */}
                  <span
                    className="pointer-events-none absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-[var(--accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  {/* Left: Index number + Title + Description */}
                  <div className="relative z-10 flex items-start gap-4 sm:gap-6 min-w-0 max-w-3xl">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-[var(--muted)] pt-1 transition-colors duration-300 group-hover:text-[var(--accent)] flex-shrink-0">
                      {String(originalIndex + 1).padStart(2, "0")}
                    </span>

                    {/* Small Thumbnail Preview (smooth expand and elevation on hover) */}
                    {resolvedCover && (
                      <div className="relative size-14 sm:size-16 rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--hairline)] flex-shrink-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:border-[var(--accent)]/60 group-hover:shadow-[var(--shadow-soft)]">
                        <img
                          src={resolvedCover}
                          alt=""
                          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[var(--fg)] transition-transform duration-300 group-hover:translate-x-2 group-hover:text-[var(--accent)]">
                        {p?.title || "Untitled Project"}
                      </h3>

                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--muted)] line-clamp-2 transition-colors duration-300 group-hover:text-[var(--fg)]/80">
                        {p?.desc || ""}
                      </p>

                      {/* Stack and tech row */}
                      {p?.stack && (
                        <div className="mt-3">
                          <span className="font-mono text-[0.64rem] uppercase tracking-wider text-[var(--accent)] font-semibold transition-transform duration-300 group-hover:translate-x-0.5">
                            {p.stack}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: CTA Arrow Button */}
                  <div className="relative z-10 flex items-center self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                    <div className="grid size-9 sm:size-10 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--card)] text-[var(--muted)] transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:scale-110 group-hover:rotate-45 shadow-xs">
                      <ArrowUpRight className="size-4 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
      )}

      {/* ─── Digital Explorations ──────────────────────────────────────── */}
      {showExplorations && (
        <section id="digital" className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 sm:pb-24 border-t border-[var(--hairline)]">
          <Reveal>
            <p className="section-kicker mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--accent)]" />
              {archiveConfig?.explorationsKicker || "Craft & Explorations"}
            </p>
          </Reveal>
          <Typewriter
            text={archiveConfig?.explorationsTitle || "Beyond the Brief"}
            className="section-title"
          />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-xl text-[0.95rem] text-[var(--muted)] leading-relaxed">
              {archiveConfig?.explorationsSubtitle ||
                "Self-directed design studies, interaction prototypes, visual systems, and research experiments."}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {digitalProjects.map((d, i) => (
              <Reveal key={`${d?.title || "digital"}-${i}`} delay={i * 0.08} dir="up">
                <Tilt max={7} className="group h-full">
                  <div className="card-surface hover-lift flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
                    <div className="relative overflow-hidden">
                      <img
                        src={img(digitalImages[i % digitalImages.length], 520, 340)}
                        alt={d?.title || "Digital Exploration"}
                        className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <span
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: "linear-gradient(to top, var(--accent-soft), transparent 55%)" }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-gradient font-display text-2xl font-semibold opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 font-display font-semibold text-base text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                        {d?.title || "Exploration"}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{d?.desc || ""}</p>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ─── Footer CTA ─────────────────────────────────────────────────── */}
      {showCta && (
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 sm:pb-32">
          <Reveal>
            <p className="label mb-6">{archiveConfig?.ctaKicker || "Have a project in mind?"}</p>
          </Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">
                {archiveConfig?.ctaHeading || archiveConfig?.ctaTitle || "Interested in collaborating?"}
              </h2>
              {archiveConfig?.ctaDescription ? (
                <p className="mt-3 text-base text-[var(--muted)] max-w-xl">
                  {archiveConfig.ctaDescription}
                </p>
              ) : archiveConfig?.ctaSubtitle ? (
                <span className="text-gradient block mt-1">{archiveConfig.ctaSubtitle}</span>
              ) : null}
            </div>
            <Magnetic strength={0.3}>
              <button
                onClick={() => {
                  if (archiveConfig?.ctaButtonLink?.startsWith("mailto:") || archiveConfig?.ctaButtonLink?.startsWith("http")) {
                    window.location.href = archiveConfig.ctaButtonLink;
                  } else {
                    onContact();
                  }
                }}
                className="btn-shine inline-flex items-center gap-2 self-start rounded-full border border-[var(--card-border)] bg-[var(--card)] px-7 py-4 text-[0.82rem] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)] cursor-pointer"
              >
                <span>{archiveConfig?.ctaButtonLabel || archiveConfig?.ctaButton || "Start a conversation"}</span>
                <ArrowRight className="size-4" />
              </button>
            </Magnetic>
          </div>
        </section>
      )}
    </div>
  );
}
