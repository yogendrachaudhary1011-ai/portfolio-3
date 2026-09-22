import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  FileText,
  Sparkles,
  Layers,
  ArrowUp,
  Download,
  ExternalLink,
} from "lucide-react";
import { getFullWidthImageUrl, type Project } from "../data";
import { useSite } from "../siteContext";

const devicon = (i: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${i}.svg`;

interface CaseStudyProps {
  project?: Project | null;
  index: number;
  onBack: () => void;
  onSelectProject?: (nextIndex: number) => void;
}

export default function CaseStudy({
  project,
  index,
  onBack,
  onSelectProject,
}: CaseStudyProps) {
  const { projects } = useSite();

  // Retrieve current live state of this project safely
  const currentProject =
    (projects && projects[index]) ??
    projects?.find((p) => p?.title === project?.title) ??
    project ??
    projects?.[0];

  const totalProjects = projects?.length ?? 1;
  const prevIndex = (index - 1 + totalProjects) % totalProjects;
  const nextIndex = (index + 1) % totalProjects;
  const nextProject = projects?.[nextIndex];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentProject?.title, index]);

  // Track scroll progress for top reading bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation for lightbox & next/prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft" && images.length > 1) {
          setLightboxIndex((curr) => (curr !== null ? (curr - 1 + images.length) % images.length : 0));
        }
        if (e.key === "ArrowRight" && images.length > 1) {
          setLightboxIndex((curr) => (curr !== null ? (curr + 1) % images.length : 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  if (!currentProject) {
    return (
      <main
        id="case-study-page"
        className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 pt-24 text-center transition-colors duration-300"
      >
        <div className="mx-auto max-w-md px-4 py-16">
          <h2 className="font-display text-2xl font-bold">Project Not Found</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            This project may have been removed or is no longer available.
          </p>
          <button
            id="back-to-work-btn"
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--chip)] cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Portfolio</span>
          </button>
        </div>
      </main>
    );
  }

  // Resolve media array uploaded via Admin Panel (fallback to thumbnail/image if available)
  const images =
    currentProject.media && currentProject.media.length > 0
      ? currentProject.media
      : [currentProject.thumbnail ?? currentProject.image ?? ""].filter(Boolean);

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pdfDeckUrl = currentProject.pdfUrls?.[0] || null;

  return (
    <main
      id="case-study-page"
      className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-32 pt-14 md:pt-16 selection:bg-[var(--accent)] selection:text-white transition-colors duration-300"
    >
      {/* ─── Reading Progress Indicator Bar ─────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-[var(--accent)] z-[100] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ─── Top Sticky Control Bar ─────────────────────────────────────── */}
      <div className="sticky top-14 md:top-[4.25rem] z-40 border-b border-[var(--hairline)] bg-[var(--bg)]/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              id="back-to-work-btn"
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-1.5 text-xs font-semibold text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--chip)] cursor-pointer"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Projects</span>
            </button>

            <span className="hidden sm:inline-block h-4 w-px bg-[var(--hairline)]" />

            <span className="hidden sm:inline-block font-mono text-[0.68rem] text-[var(--muted)]">
              Case Study {String(index + 1).padStart(2, "0")} of {String(totalProjects).padStart(2, "0")}
            </span>
          </div>

          {/* Right Action Controls: Quick Next/Prev & Share */}
          <div className="flex items-center gap-2">
            {onSelectProject && totalProjects > 1 && (
              <div className="flex items-center rounded-full border border-[var(--hairline)] bg-[var(--card)] p-0.5">
                <button
                  type="button"
                  onClick={() => onSelectProject(prevIndex)}
                  title="Previous Case Study"
                  className="rounded-full p-1.5 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--chip)] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectProject(nextIndex)}
                  title="Next Case Study"
                  className="rounded-full p-1.5 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--chip)] transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--card)] px-3 py-1.5 text-[0.68rem] font-mono uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--accent)] transition-all cursor-pointer"
              title="Share Case Study"
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Share2 className="size-3" />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Case Study Editorial Header & Metadata ─────────────────────── */}
      <header className="relative mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16 text-center">
        {/* Discipline / Stack Badge */}
        {currentProject.stack && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--chip)] px-4 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--accent)] mb-6">
            <Sparkles className="size-3" />
            <span>{currentProject.stack}</span>
          </div>
        )}

        {/* Project Title */}
        <h1
          id="case-study-title"
          className="font-display text-[clamp(2.4rem,6.5vw,5.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-[var(--fg)] break-words"
        >
          {currentProject.title}
        </h1>

        {/* Project Description */}
        {currentProject.desc && (
          <p className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--muted)] font-body">
            {currentProject.desc}
          </p>
        )}

        {/* Metadata Meta Chips: Visuals Count + Tech Tools + Optional PDF */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[var(--hairline)] max-w-xl mx-auto">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--card)] px-3.5 py-1.5 text-xs text-[var(--muted)]">
            <Layers className="size-3.5 text-[var(--accent)]" />
            <span className="font-mono text-[0.68rem]">
              {images.length} {images.length === 1 ? "Visual Plate" : "Visual Plates"}
            </span>
          </div>

          {(currentProject.tech ?? []).map((t) => (
            <div
              key={t}
              className="flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--card)] px-3 py-1.5 text-xs"
            >
              <img
                src={devicon(t)}
                alt=""
                className={`size-3.5 ${t.includes("django") ? "dark:invert" : ""}`}
              />
              <span className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--muted)]">
                {t.split("/")[0]}
              </span>
            </div>
          ))}

          {pdfDeckUrl && (
            <a
              href={pdfDeckUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <FileText className="size-3.5" />
              <span>View PDF Presentation</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </header>

      {/* ─── Full-Width High-Resolution Visual Stream ─────────────────────── */}
      <div className="w-full">
        {images.length > 0 ? (
          <div id="case-study-images-stream" className="w-full flex flex-col gap-8 md:gap-14 items-center">
            {images.map((imgSrc, idx) => {
              const resolvedUrl = getFullWidthImageUrl(imgSrc);
              return (
                <div
                  key={`${imgSrc.slice(0, 32)}-${idx}`}
                  className="group relative w-full bg-[var(--bg)] flex flex-col items-center"
                >
                  {/* Subtle Plate Number Tag */}
                  <div className="w-full max-w-7xl px-4 sm:px-6 mb-2 flex items-center justify-between text-[var(--muted)] text-xs font-mono">
                    <span className="opacity-60">PLATE #{String(idx + 1).padStart(2, "0")}</span>
                    <span className="text-[0.65rem] opacity-40 group-hover:opacity-100 transition-opacity">
                      Click to expand in fullscreen
                    </span>
                  </div>

                  {/* Image Display Frame with Discreet Hover Lightbox Trigger */}
                  <div className="relative w-full max-w-7xl px-2 sm:px-6">
                    <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-lg">
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90 cursor-pointer shadow-lg"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="size-3.5" />
                        <span>Expand</span>
                      </button>

                      <img
                        src={resolvedUrl}
                        alt={`${currentProject.title} - Plate ${idx + 1}`}
                        loading={idx < 2 ? "eager" : "lazy"}
                        decoding="async"
                        onClick={() => setLightboxIndex(idx)}
                        className="w-full h-auto block object-cover md:object-contain cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.006]"
                        style={{
                          maxHeight: "none",
                          height: "auto",
                          width: "100%",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="rounded-3xl border border-[var(--hairline)] bg-[var(--card)]/40 p-12 text-center shadow-xs">
              <Layers className="mx-auto size-10 text-[var(--muted)]/40 mb-3" />
              <p className="font-display text-xl font-semibold text-[var(--fg)]">
                No case study visuals uploaded yet.
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Images for this project can be uploaded directly from the Studio Admin Panel.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("portfolio-open-admin", {
                      detail: { tab: "projects", projectIndex: index },
                    })
                  );
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Open Admin Panel to Upload Visuals
              </button>
            </div>
          </div>
        )}

        {/* ─── Next Case Study Up Next Banner ─────────────────────────────── */}
        {nextProject && onSelectProject && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-28">
            <div
              onClick={() => onSelectProject(nextIndex)}
              className="group relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-gradient-to-r from-[var(--card)] to-[var(--bg-2)] p-8 sm:p-12 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-2xl cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                    Next Case Study →
                  </span>
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                    {nextProject.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-lg line-clamp-2">
                    {nextProject.desc}
                  </p>
                </div>

                <div className="grid size-12 place-items-center rounded-full bg-[var(--fg)] text-[var(--bg)] transition-transform duration-300 group-hover:scale-110 flex-shrink-0 self-start sm:self-center">
                  <ArrowRight className="size-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Bottom Navigation Actions ──────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[var(--hairline)] pt-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-xs font-semibold text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--chip)] cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to all projects</span>
          </button>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            >
              <ArrowUp className="size-3.5" />
              <span>Back to top</span>
            </button>

            <span className="h-3 w-px bg-[var(--hairline)]" />

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("portfolio-open-admin", {
                    detail: { tab: "projects", projectIndex: index },
                  })
                )
              }
              className="group inline-flex size-4 items-center justify-center rounded-full text-[var(--muted)]/40 hover:text-[var(--fg)]/80 transition-colors focus:outline-none cursor-pointer"
              aria-label="Admin panel"
              title="Studio Admin"
            >
              <span className="size-1 rounded-full bg-current transition-transform duration-200 group-hover:scale-150" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Enhanced Fullscreen Lightbox Modal with Next/Prev ────────────── */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Lightbox Bar */}
          <div
            className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-xs text-white/70">
              Visual {lightboxIndex + 1} of {images.length}
            </span>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Previous Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((curr) => (curr !== null ? (curr - 1 + images.length) % images.length : 0));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors cursor-pointer"
              title="Previous visual (Left arrow)"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Next Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((curr) => (curr !== null ? (curr + 1) % images.length : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors cursor-pointer"
              title="Next visual (Right arrow)"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Fullscreen Image Element */}
          <img
            src={getFullWidthImageUrl(images[lightboxIndex])}
            alt="Fullscreen view"
            className="max-h-[92vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
