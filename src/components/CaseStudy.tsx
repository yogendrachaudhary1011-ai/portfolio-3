import { useEffect, useState } from "react";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import { getFullWidthImageUrl, type Project } from "../data";
import { useSite } from "../siteContext";

interface CaseStudyProps {
  project?: Project | null;
  index: number;
  onBack: () => void;
}

export default function CaseStudy({ project, index, onBack }: CaseStudyProps) {
  const { projects } = useSite();

  // Retrieve current live state of this project from siteContext safely
  const currentProject = (projects && projects[index]) ?? projects?.find((p) => p?.title === project?.title) ?? project ?? projects?.[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project?.title]);

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
  const images = currentProject.media && currentProject.media.length > 0
    ? currentProject.media
    : [currentProject.thumbnail ?? currentProject.image ?? ""].filter(Boolean);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <main
      id="case-study-page"
      className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 pt-14 md:pt-16 transition-colors duration-300"
    >
      {/* Top Bar Navigation */}
      <div className="sticky top-14 md:top-[4.25rem] z-30 border-b border-[var(--hairline)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            id="back-to-work-btn"
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--chip)]"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Work</span>
          </button>

          <span className="font-mono text-xs text-[var(--muted)]">
            {images.length} {images.length === 1 ? "Visual" : "Visuals"}
          </span>
        </div>
      </div>

      {/* Main Container: Project Name and Full-Width Image Stream */}
      <div className="w-full">
        {/* ONLY Project Name Header */}
        <header className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-center">
          <h1
            id="case-study-title"
            className="font-display text-[clamp(2.5rem,7.5vw,6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-[var(--fg)] break-words"
          >
            {currentProject.title}
          </h1>
        </header>

        {/* Full-width, no height boundary images stacked from top to bottom */}
        {images.length > 0 ? (
          <div
            id="case-study-images-stream"
            className="w-full flex flex-col gap-0 md:gap-2 items-center"
          >
            {images.map((imgSrc, idx) => {
              const resolvedUrl = getFullWidthImageUrl(imgSrc);
              return (
                <div
                  key={`${imgSrc.slice(0, 32)}-${idx}`}
                  className="group relative w-full bg-[var(--bg)]"
                >
                  {/* Discreet Full View expander button on hover */}
                  <button
                    type="button"
                    onClick={() => setLightboxImage(resolvedUrl)}
                    className="absolute right-4 top-4 z-10 hidden items-center gap-1.5 rounded-full border border-black/20 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex hover:bg-black/80 cursor-pointer shadow-md"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="size-3.5" />
                    <span>Expand</span>
                  </button>

                  {/* Full-width image with natural height, no height bounds */}
                  <img
                    src={resolvedUrl}
                    alt={`${currentProject.title} - Visual ${idx + 1}`}
                    loading={idx < 2 ? "eager" : "lazy"}
                    decoding="async"
                    onClick={() => setLightboxImage(resolvedUrl)}
                    className="w-full h-auto block object-cover md:object-contain cursor-zoom-in"
                    style={{
                      maxHeight: "none",
                      height: "auto",
                      width: "100%",
                      display: "block",
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="rounded-3xl border border-[var(--hairline)] bg-[var(--card)]/40 p-12 text-center shadow-xs">
              <p className="font-display text-xl font-semibold text-[var(--fg)]">
                No case study visuals uploaded yet.
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Images for this project can be uploaded from the Admin Panel.
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
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Open Admin Panel to Upload
              </button>
            </div>
          </div>
        )}

        {/* Return to Work Bottom Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--hairline)] pt-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--fg)] transition-all hover:border-[var(--accent)] hover:bg-[var(--chip)]"
          >
            <ArrowLeft className="size-4" />
            <span>Back to all projects</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors hover:underline"
            >
              ↑ Back to top
            </button>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("portfolio-open-admin", {
                    detail: { tab: "projects", projectIndex: index },
                  })
                )
              }
              className="group inline-flex size-3.5 items-center justify-center rounded-full text-[var(--muted)]/40 hover:text-[var(--fg)]/80 transition-colors focus:outline-none cursor-pointer"
              aria-label="Admin panel"
              title="Studio Admin"
            >
              <span className="size-1 rounded-full bg-current transition-transform duration-200 group-hover:scale-150" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen view"
            className="max-h-[95vh] max-w-[95vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
