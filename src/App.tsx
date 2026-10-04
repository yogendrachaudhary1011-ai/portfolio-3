import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router";
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
import MagneticCursor from "./components/MagneticCursor";
import { SiteProvider, useSite } from "./siteContext";
import { type Project } from "./data";

/* ─── Intro splash ─────────────────────────────────────────────────── */
function IntroScreen({ onDone }: { onDone: () => void }) {
  const { config } = useSite();
  const [lifting, setLifting] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const NAME = config.hero.marqueeName || "YOGENDRA CHAUDHARY";
  const TAGLINE = (config.hero.tagline || "JUNIOR · UI/UX · DESIGNER").toUpperCase();

  const dismiss = useCallback(() => {
    if (lifting) return;
    setLifting(true);
    setTimeout(onDone, 320);
  }, [lifting, onDone]);

  useEffect(() => {
    // Ultra-optimized direct DOM progress updates (0 React re-renders during countdown)
    const start = performance.now();
    const duration = 1150;
    let raf = 0;
    let lastPct = -1;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

      if (pct !== lastPct) {
        lastPct = pct;
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${pct}%`;
        }
        if (counterRef.current) {
          counterRef.current.textContent = `${pct}%`;
        }
      }

      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    // Auto-lifts at 1.25s -> completes at 1.8s
    const t1 = setTimeout(() => {
      setLifting(true);
    }, 1250);
    const t2 = setTimeout(onDone, 1800);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
    };
  }, [dismiss, onDone]);

  const words = useMemo(() => NAME.trim().split(/\s+/), [NAME]);

  return (
    <div
      role="dialog"
      aria-label="Welcome splash screen"
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "#08080a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.2rem",
        cursor: "pointer",
        touchAction: "none",
        overscrollBehavior: "none",
        contain: "strict",
        /* Hardware accelerated GPU translate instead of heavy clipPath recalculation */
        transform: lifting ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
        opacity: lifting ? 0.96 : 1,
        transition: lifting ? "transform 0.55s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.55s ease-in" : "none",
        willChange: lifting ? "transform, opacity" : undefined,
        pointerEvents: lifting ? "none" : "all",
      }}
    >

      {/* letter cascade — stacked on mobile so name fills the screen without any side clipping; inline on tablet & desktop */}
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
                      willChange: "transform, opacity",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
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
          willChange: "transform, opacity",
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
          animation: "intro-sub 0.5s cubic-bezier(0.22,1,0.36,1) 0.65s both",
          willChange: "transform, opacity",
        }}
      >
        {TAGLINE}
      </span>

      {/* Loading indicator with animated "Loading..." text and progress bar */}
      <div className="flex flex-col items-center gap-2.5 mt-2 select-none pointer-events-none">
        <div className="h-[2px] w-32 sm:w-44 bg-white/10 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[var(--accent)] via-[#d0a8ff] to-[var(--accent-2)] rounded-full"
            style={{ width: "0%" }}
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-white/75">
            Loading
            <span className="loading-dots-anim inline-flex ml-0.5 tracking-normal font-sans">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </span>
          <span ref={counterRef} className="font-mono text-[0.6rem] text-white/40 tracking-wider ml-1">
            0%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Route Components ─────────────────────────────────────────────── */
function HomePage() {
  const { projects, settings } = useSite();
  const navigate = useNavigate();

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

  return (
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
            onMore={() => navigate("/projects")}
            onProject={(index) => {
              navigate(`/project/${index}`);
            }}
          />
        )}
        {settings?.sections?.capabilities !== false && <Capabilities />}
        {settings?.sections?.process !== false && <MyProcess />}
        {settings?.sections?.about !== false && (
          <About onViewProjects={() => navigate("/projects")} />
        )}
        {settings?.sections?.trainings !== false && <Trainings />}
        {settings?.sections?.skills !== false && <Skills />}
        {settings?.sections?.contact !== false && <Contact />}
      </main>
    </>
  );
}

function ProjectsPage() {
  const { projects } = useSite();
  const navigate = useNavigate();

  return (
    <>
      <Navbar
        variant="projects"
        showHomeButton
        onNav={(id) => navigate(`/#${id}`)}
        onHome={() => navigate("/")}
        onContact={() => navigate("/#contact")}
      />
      <ProjectsArchive
        projects={projects}
        onBack={() => navigate("/#work")}
        onContact={() => navigate("/#contact")}
        onProject={(_project, index) => {
          navigate(`/project/${index}`);
        }}
      />
    </>
  );
}

function CaseStudyPage() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useSite();
  const navigate = useNavigate();

  // Support numeric indices (/project/0) or title slugs (/project/fintech-app)
  const numericIndex = id !== undefined && /^\d+$/.test(id) ? parseInt(id, 10) : -1;
  const foundIndex =
    numericIndex >= 0 && numericIndex < projects.length
      ? numericIndex
      : projects.findIndex(
          (p) =>
            p?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
        );
  const resolvedIndex = foundIndex >= 0 ? foundIndex : 0;
  const currentProject = projects[resolvedIndex] ?? projects[0];

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/#work");
    }
  };

  return (
    <>
      <Navbar
        variant="case-study"
        showHomeButton
        active="work"
        onNav={(navId) => navigate(`/#${navId}`)}
        onHome={() => navigate("/")}
        onContact={() => navigate("/#contact")}
      />
      <CaseStudy
        project={currentProject}
        index={resolvedIndex}
        onBack={handleBack}
        onSelectProject={(nextIdx) => {
          navigate(`/project/${nextIdx}`);
        }}
      />
    </>
  );
}

/* ─── Portfolio Content with Router Synchronization ───────────────── */
function PortfolioApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const prevPathRef = useRef(location.pathname);

  const [introVisible, setIntroVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      // If user directly visits a deep link URL (/projects, /project/0), skip intro splash
      if (window.location.pathname !== "/" && window.location.pathname !== "") {
        return false;
      }
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return !prefersReduced;
    } catch {
      return true;
    }
  });

  const doneIntro = useCallback(() => {
    setIntroVisible(false);
  }, []);

  useEffect(() => {
    if (introVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introVisible]);

  // Handle route change curtain transition
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setTransitioning(true);
      const timer = setTimeout(() => {
        setTransitioning(false);
        if (!location.hash) {
          window.scrollTo(0, 0);
        }
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  // Handle hash anchor jumps on home page (e.g. /#work, /#contact)
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        const timer = setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          const navOffset = isMobile ? 64 : 76;
          const elementTop = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
          window.scrollTo({
            top: Math.max(0, elementTop - navOffset),
            behavior: "smooth",
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
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

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: "home" | "projects" | "case-study"; destination?: string }>;
      const v = customEvent.detail?.view;
      if (v === "projects") {
        navigate("/projects");
      } else if (v === "home") {
        navigate(customEvent.detail?.destination ? `/#${customEvent.detail.destination}` : "/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("portfolio-navigate", handleNavigate);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("portfolio-navigate", handleNavigate);
    };
  }, [navigate]);

  // Handle direct navigation to /admin
  useEffect(() => {
    if (location.pathname === "/admin") {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("portfolio-open-admin"));
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      {introVisible && <IntroScreen onDone={doneIntro} />}
      <Atmosphere />
      <ScrollProgress />
      <MagneticCursor />
      <AdminPanel showTrigger={false} />

      {/* page transition curtain */}
      <div
        className="pointer-events-none fixed inset-0 z-[65] origin-bottom bg-[var(--bg)]"
        style={{
          transform: transitioning ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: transitioning ? "bottom" : "top",
          transition: "transform 0.42s cubic-bezier(0.76,0,0.24,1)",
        }}
      />

      <div style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.35s ease" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/archive" element={<Navigate to="/projects" replace />} />
          <Route path="/project/:id" element={<CaseStudyPage />} />
          <Route path="/case-study/:id" element={<CaseStudyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

/* ─── Root App ───────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
        <BrowserRouter>
          <PortfolioApp />
        </BrowserRouter>
      </SiteProvider>
    </ThemeProvider>
  );
}
