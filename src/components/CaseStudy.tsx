import { useEffect, useState } from "react";
import { img, type Project } from "../data";
import { Arrow } from "../icons";
import { getPdf } from "../pdfStore";

export default function CaseStudy({ project, index, onBack }: { project: Project; index: number; onBack: () => void }) {
  const imageSet = project.media?.length ? project.media : [project.image ?? "1551288049-bebda4e38f71", "1686061592689-312bbfb5c055", "1599658880436-c61792e70672"];
  const pdfUrl = project.pdfUrls?.[0];
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    setViewerUrl(null);
    let objectUrl: string | null = null;
    let cancelled = false;
    const loadPdf = async () => {
      try {
        const storedPdf = project.pdfKey ? await getPdf(project.pdfKey) : undefined;
        if (storedPdf) {
          objectUrl = URL.createObjectURL(storedPdf);
          if (!cancelled) setViewerUrl(objectUrl);
          return;
        }
        if (!pdfUrl) return;
        if (!pdfUrl.startsWith("data:")) {
          if (!cancelled) setViewerUrl(pdfUrl);
          return;
        }
        const blob = await fetch(pdfUrl).then((response) => response.blob());
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setViewerUrl(objectUrl);
      } catch {
        if (!cancelled && pdfUrl) setViewerUrl(pdfUrl);
      }
    };
    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl, project.pdfKey]);

  if (pdfUrl || project.pdfKey) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pt-20 transition-colors duration-300">
        {viewerUrl ? (
          <iframe
            title={`${project.title} case study`}
            src={viewerUrl}
            className="h-[calc(100vh-5rem)] min-h-[42rem] w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)]"
          />
        ) : (
          <div className="grid h-[calc(100vh-5rem)] min-h-[42rem] place-items-center text-sm text-[var(--muted)]">
            Loading case study…
          </div>
        )}
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pt-28 transition-colors duration-300">
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-24">
        <button
          type="button"
          onClick={onBack}
          className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--chip)]"
        >
          <Arrow className="size-4 rotate-180" /> Back to work
        </button>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div><p className="section-kicker mb-4">Case study / {String(index + 1).padStart(2, "0")}</p><h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.065em]">{project.title}</h1></div>
          <p className="max-w-xl text-base leading-relaxed text-[var(--muted)]">{project.desc}</p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)]"><img src={img(project.thumbnail ?? imageSet[0], 1600, 980)} alt={`${project.title} cover`} className="aspect-[16/9] w-full object-cover" /></div>
      </section>
      <section className="border-y border-[var(--hairline)] bg-[var(--bg-2)]"><div className="mx-auto grid max-w-6xl gap-px px-5 sm:grid-cols-3 sm:px-6"><div className="py-6"><p className="label !text-[0.55rem]">Focus</p><p className="mt-2 text-sm font-medium">{project.stack ?? "Product design"}</p></div><div className="py-6"><p className="label !text-[0.55rem]">Deliverables</p><p className="mt-2 text-sm font-medium">Research · UX · UI</p></div><div className="py-6"><p className="label !text-[0.55rem]">Status</p><p className="mt-2 text-sm font-medium">Concept case study</p></div></div></section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:py-28"><div><p className="section-kicker">The project</p><h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em]">A clearer path from need to outcome.</h2></div><div className="space-y-7 text-[0.98rem] leading-relaxed text-[var(--muted)]"><p>This case-study template is ready for the full project story: the problem, constraints, research, key decisions, interface explorations, and the outcome.</p><p>Replace this content with project-specific evidence and decisions when the final case study is ready to publish.</p></div></section>
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6 sm:pb-28"><div className="grid gap-5 md:grid-cols-2">{imageSet.slice(1).map((image, i) => <img key={`${image}-${i}`} src={img(image, 900, 700)} alt={`${project.title} visual ${i + 1}`} className="aspect-[4/3] w-full rounded-2xl border border-[var(--card-border)] object-cover" />)}</div></section>
    </main>
  );
}
