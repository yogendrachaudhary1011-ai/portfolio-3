import { useEffect, useState, useCallback, useMemo } from "react";
import { ThemeProvider } from "./theme";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkGallery from "./components/WorkGallery";
import Capabilities from "./components/Capabilities";
import MyProcess from "./components/MyProcess";
import About from "./components/About";
import Trainings from "./components/Trainings";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import ProjectsArchive from "./components/ProjectsArchive";
import CaseStudy from "./components/CaseStudy";
import AdminPanel from "./components/AdminPanel";
import { Atmosphere, ScrollProgress } from "./components/Atmosphere";
import { SiteProvider, useSite } from "./siteContext";
import { type Project } from "./data";

/* ─── Intro splash ─────────────────────────────────────────────────── */
function IntroScreen({ onDone }: { onDone: () => void }) {
  const { config } = useSite();
  const [lifting, setLifting] = useState(false);

  const NAME = config.hero.marqueeName || "YOGENDRA CHAUDHARY";
  const TAGLINE = (config.hero.tagline || "JUNIOR · UI/UX · DESIGNER").toUpperCase();

  useEffect(() => {
    // letters finish ~0.9s → hold → curtain lifts at 1.6s → fully gone at 2.35s
    const t1 = setTimeout(() => setLifting(true), 1600);
    const t2 = setTimeout(onDone, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  const words = useMemo(() => NAME.trim().split(/\s+/), [NAME]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.2rem",
        /* clip-path curtain rises upward when lifting */
        clipPath: lifting ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
        transition: lifting ? "clip-path 0.75s cubic-bezier(0.76,0,0.24,1)" : "none",
        pointerEvents: lifting ? "none" : "all",
      }}
    >
      {/* subtle ambient glow in center */}
      <div
        className="pointer-events-none absolute -z-10 size-[280px] sm:size-[480px] rounded-full bg-white/[0.035] blur-3xl"
        style={{ transform: "translateZ(0)" }}
      />

      {/* letter cascade — stacked on mobile so name fills the screen without any side clipping; inline on tablet & desktop */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-4 max-w-[94vw] px-2 text-center select-none">
        {words.map((word, wIdx) => {
          const startIndex = words.slice(0, wIdx).reduce((acc, w) => acc + w.length, 0);
          return (
            <div
              key={wIdx}
              className="flex items-center justify-center overflow-hidden py-0.5 leading-none"
            >
              {word.split("").map((ch, cIdx) => {
                const idx = startIndex + cIdx;
                return (
                  <span
                    key={cIdx}
                    className="inline-block font-display font-extrabold text-[#ececec] tracking-[-0.025em] leading-none text-[clamp(2.5rem,10vw,3.8rem)] sm:text-[clamp(2.4rem,4.8vw,5.5rem)]"
                    style={{
                      animation: `intro-char 0.62s cubic-bezier(0.22,1,0.36,1) ${idx * 0.045}s both`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* hairline that expands from center */}
      <div
        style={{
          height: "1px",
          width: "clamp(90px, 20vw, 240px)",
          background: "#ececec",
          opacity: 0.25,
          transformOrigin: "center",
          animation: "intro-line 0.6s cubic-bezier(0.22,1,0.36,1) 0.72s both",
        }}
      />

      {/* tagline expands letter-spacing */}
      <span
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.52rem, 1.4vw, 0.7rem)",
          color: "#ececec",
          textTransform: "uppercase",
          maxWidth: "90vw",
          textAlign: "center",
          padding: "0 0.5rem",
          letterSpacing: "0.22em",
          animation: "intro-sub 0.65s cubic-bezier(0.22,1,0.36,1) 0.88s both",
        }}
      >
        {TAGLINE}
      </span>
      <button
        type="button"
        onClick={onDone}
        className="mt-2 sm:mt-4 rounded-full border border-white/20 px-4 py-1.5 sm:py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/70 transition-all hover:border-white/50 hover:text-white active:scale-95 focus-visible:outline-white"
      >
        Skip intro
      </button>
    </div>
  );
}

/* ─── Portfolio Content ─────────────────────────────────────────────── */
function PortfolioApp() {
  const [view, setView] = useState<"home" | "projects" | "case-study">("home");
  const [projectIndex, setProjectIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);

  const { projects, settings } = useSite();
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0] ?? null);

  const doneIntro = useCallback(() => setIntroVisible(false), []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const navigate = (next: "home" | "projects" | "case-study", destination?: string) => {
    if (next === view) {
      if (destination) scrollTo(destination);
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setView(next);
      if (destination) window.setTimeout(() => scrollTo(destination), 0);
      else window.scrollTo(0, 0);
      setTransitioning(false);
    }, 480);
  };

  return (
    <>
      {introVisible && <IntroScreen onDone={doneIntro} />}
      <Atmosphere />
      <ScrollProgress />
      <AdminPanel showTrigger={false} />

      {/* page transition curtain */}
      <div
        className="pointer-events-none fixed inset-0 z-[65] origin-bottom bg-[var(--bg)]"
        style={{
          transform: transitioning ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: transitioning ? "bottom" : "top",
          transition: "transform 0.48s cubic-bezier(0.76,0,0.24,1)",
        }}
      />

      <div style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease" }}>
        {view === "home" ? (
          <>
            <Navbar variant="home" onNav={scrollTo} onHome={() => scrollTo("home")} />
            <main>
              {settings?.sections?.hero !== false && <Hero />}
              {settings?.sections?.work !== false && (
                <WorkGallery
                  projects={projects}
                  onMore={() => navigate("projects")}
                  onProject={(index) => {
                    setProjectIndex(index);
                    setSelectedProject(projects[index]);
                    navigate("case-study");
                  }}
                />
              )}
              {settings?.sections?.capabilities !== false && <Capabilities />}
              {settings?.sections?.process !== false && <MyProcess />}
              {settings?.sections?.about !== false && <About />}
              {settings?.sections?.trainings !== false && <Trainings />}
              {settings?.sections?.skills !== false && <Skills />}
              {settings?.sections?.contact !== false && <Contact />}
            </main>
          </>
        ) : view === "projects" ? (
          <>
            <Navbar
              showHomeButton
              onNav={(id) => navigate("home", id)}
              onHome={() => navigate("home", "home")}
              onContact={() => navigate("home", "contact")}
            />
            <ProjectsArchive
              projects={projects}
              onContact={() => navigate("home", "contact")}
              onProject={(project, index) => {
                setProjectIndex(index);
                setSelectedProject(project);
                navigate("case-study");
              }}
            />
          </>
        ) : (
          <>
            <Navbar
              showHomeButton
              active="work"
              onNav={(id) => navigate("home", id)}
              onHome={() => navigate("home", "home")}
              onContact={() => navigate("home", "contact")}
            />
            <CaseStudy
              project={projects[projectIndex] ?? selectedProject}
              index={projectIndex}
              onBack={() => navigate("projects")}
            />
          </>
        )}
      </div>
    </>
  );
}

/* ─── Root App ───────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
        <PortfolioApp />
      </SiteProvider>
    </ThemeProvider>
  );
}
