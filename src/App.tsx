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
/* ─── Cinematic Loading Screen ─────────────────────────────────────────── */
function IntroScreen({ onDone }: { onDone: () => void }) {
  const { config } = useSite();
  const [lifting, setLifting] = useState(false);
  const [progress, setProgress] = useState(12);

  const NAME = config.hero.marqueeName || "YOGENDRA CHAUDHARY";
  const TAGLINE = (config.hero.tagline || "JUNIOR · UI/UX · DESIGNER").toUpperCase();

  const dismiss = useCallback(() => {
    if (lifting) return;
    setLifting(true);
    setTimeout(onDone, 380);
  }, [lifting, onDone]);

  useEffect(() => {
    // Smooth progress counter simulation during asset/font loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 18) + 12;
        return Math.min(prev + step, 100);
      });
    }, 120);

    // Auto-lift at 1.4s -> completes at 1.85s
    const t1 = setTimeout(() => {
      setProgress(100);
      setLifting(true);
    }, 1400);
    const t2 = setTimeout(onDone, 1850);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
    };
  }, [dismiss, onDone]);

  const words = useMemo(() => NAME.trim().split(/\s+/), [NAME]);

  return (
    <div
      role="dialog"
      aria-label="Portfolio Loading Screen"
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#08080a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.2rem",
        cursor: "pointer",
        transform: lifting ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
        opacity: lifting ? 0.94 : 1,
        transition: lifting ? "transform 0.55s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.55s ease-in" : "none",
        willChange: lifting ? "transform, opacity" : undefined,
        pointerEvents: lifting ? "none" : "all",
      }}
    >
      {/* subtle ambient glow in center */}
      <div
        className="pointer-events-none absolute -z-10 size-[280px] sm:size-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(169, 157, 255, 0.12) 0%, transparent 70%)",
          transform: "translate3d(0, 0, 0)",
        }}
        aria-hidden="true"
      />

      {/* letter cascade — stacked on mobile so name fills screen without clipping; inline on tablet & desktop */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-4 max-w-[94vw] px-2 text-center select-none pointer-events-none">
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
                      animation: `intro-char 0.45s cubic-bezier(0.22,1,0.36,1) ${idx * 0.035}s both`,
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
          animation: "intro-line 0.5s cubic-bezier(0.22,1,0.36,1) 0.55s both",
        }}
      />

      {/* tagline */}
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
          animation: "intro-sub 0.5s cubic-bezier(0.22,1,0.36,1) 0.65s both",
        }}
      >
        {TAGLINE}
      </span>

      {/* Loading Progress Bar & Percentage Indicator */}
      <div className="mt-3 flex flex-col items-center gap-2 select-none">
        <div className="h-[2px] w-36 sm:w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-purple-400 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.16em] text-white/50">
          <span>LOADING</span>
          <span>{progress}%</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="mt-2 rounded-full border border-white/15 px-3.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-white/50 transition-all hover:border-white/50 hover:text-white active:scale-95 cursor-pointer"
      >
        Click to skip
      </button>
    </div>
  );
}

/* ─── Portfolio Content ─────────────────────────────────────────────── */
function PortfolioApp() {
  const [view, setView] = useState<"home" | "projects" | "case-study">("home");
  const [previousView, setPreviousView] = useState<"home" | "projects">("home");
  const [projectIndex, setProjectIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  // Always display loading screen on initial page mount/reload
  const [introVisible, setIntroVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return true;
    }
  });

  const { projects, settings } = useSite();
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] ?? null);

  const currentCaseStudyProject = (projects && projects[projectIndex]) ?? selectedProject ?? projects?.[0] ?? null;

  const doneIntro = useCallback(() => {
    setIntroVisible(false);
  }, []);

  const scrollTo = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const isMobile = window.innerWidth < 768;
      const navOffset = isMobile ? 64 : 76;
      const elementTop = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo({
        top: Math.max(0, elementTop - navOffset),
        behavior: "smooth",
      });
    }
  };

  const navigate = (next: "home" | "projects" | "case-study", destination?: string) => {
    if (next === view) {
      if (destination) scrollTo(destination);
      return;
    }
    if (view === "home" || view === "projects") {
      setPreviousView(view);
    }
    setTransitioning(true);
    setTimeout(() => {
      setView(next);
      if (destination) window.setTimeout(() => scrollTo(destination), 60);
      else window.scrollTo(0, 0);
      setTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    // Track keys pressed together or in sequence for Ctrl+Shift+A+D / Cmd+Shift+A+D
    let lastAKeyTime = 0;
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.add(key);

      const hasModifier = e.ctrlKey || e.metaKey;
      if (!hasModifier || !e.shiftKey) return;

      const now = Date.now();
      if (key === "a") {
        lastAKeyTime = now;
      }

      // Check if both A and D are held down together, or pressed in rapid succession while Ctrl/Cmd+Shift is held
      const bothHeld = pressedKeys.has("a") && (pressedKeys.has("d") || key === "d");
      const quickSequence = key === "d" && now - lastAKeyTime < 1500;

      if (bothHeld || quickSequence) {
        e.preventDefault();
        lastAKeyTime = 0;
        pressedKeys.clear();
        window.dispatchEvent(new CustomEvent("portfolio-open-admin"));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      pressedKeys.clear();
      lastAKeyTime = 0;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

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
            <Navbar
              variant="home"
              showHomeButton
              onNav={scrollTo}
              onHome={() => scrollTo("home")}
              onContact={() => scrollTo("contact")}
            />
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
              variant="projects"
              showHomeButton
              onNav={(id) => navigate("home", id)}
              onHome={() => navigate("home", "home")}
              onContact={() => navigate("home", "contact")}
            />
            <ProjectsArchive
              projects={projects}
              onBack={() => navigate("home", "work")}
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
              variant="case-study"
              showHomeButton
              active="work"
              onNav={(id) => navigate("home", id)}
              onHome={() => navigate("home", "home")}
              onContact={() => navigate("home", "contact")}
            />
            <CaseStudy
              project={currentCaseStudyProject}
              index={projectIndex}
              onBack={() => {
                if (previousView === "home") {
                  navigate("home", "work");
                } else {
                  navigate("projects");
                }
              }}
              onSelectProject={(nextIdx) => {
                setProjectIndex(nextIdx);
                setSelectedProject(projects[nextIdx]);
              }}
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
