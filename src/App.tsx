import { useEffect, useState, useCallback } from "react";
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
        gap: "1.4rem",
        /* clip-path curtain rises upward when lifting */
        clipPath: lifting ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
        transition: lifting ? "clip-path 0.75s cubic-bezier(0.76,0,0.24,1)" : "none",
        pointerEvents: lifting ? "none" : "all",
      }}
    >
      {/* letter cascade */}
      <div style={{ display: "flex", overflow: "hidden", lineHeight: 1 }}>
        {NAME.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.6rem, 8vw, 6rem)",
              fontWeight: 800,
              color: "#ececec",
              letterSpacing: ch === " " ? "0.25em" : "-0.015em",
              whiteSpace: "pre",
              /* each letter slides up with stagger */
              animation: `intro-char 0.62s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* hairline that expands from center */}
      <div
        style={{
          height: "1px",
          width: "clamp(100px, 18vw, 260px)",
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
          fontSize: "clamp(0.5rem, 1.3vw, 0.68rem)",
          color: "#ececec",
          textTransform: "uppercase",
          animation: "intro-sub 0.65s cubic-bezier(0.22,1,0.36,1) 0.88s both",
        }}
      >
        {TAGLINE}
      </span>
      <button
        type="button"
        onClick={onDone}
        className="mt-4 rounded-full border border-white/20 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-white"
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

  const { projects } = useSite();
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
              <Hero />
              <WorkGallery
                projects={projects}
                onMore={() => navigate("projects")}
                onProject={(index) => {
                  setProjectIndex(index);
                  setSelectedProject(projects[index]);
                  navigate("case-study");
                }}
              />
              <Capabilities />
              <MyProcess />
              <About />
              <Trainings />
              <Skills />
              <Contact />
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
