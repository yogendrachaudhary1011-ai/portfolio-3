import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import MagneticCursor from "./components/MagneticCursor";
import { Atmosphere, ScrollProgress } from "./components/Atmosphere";
import { SiteProvider, useSite } from "./siteContext";
import { type Project } from "./data";
import { buildPageUrl, parseCurrentUrl, syncBrowserUrl } from "./router";

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
      {/* subtle ambient glow in center using hardware-native radial gradient instead of expensive blur filter */}
      <div
        className="pointer-events-none absolute -z-10 size-[280px] sm:size-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
          transform: "translate3d(0, 0, 0)",
        }}
        aria-hidden="true"
      />

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

/* ─── Portfolio Content ─────────────────────────────────────────────── */
function PortfolioApp() {
  const { projects, settings, config } = useSite();

  // Parse initial route from browser URL on first render
  const initialRoute = useMemo(() => parseCurrentUrl(projects), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [view, setView] = useState<"home" | "projects" | "case-study">(initialRoute.view);
  const [previousView, setPreviousView] = useState<"home" | "projects">(
    initialRoute.view === "projects" ? "projects" : "home"
  );
  const [projectIndex, setProjectIndex] = useState(initialRoute.projectIndex ?? 0);
  const [archiveFilter, setArchiveFilter] = useState<"all" | "archive" | "beyond">(
    initialRoute.archiveFilter ?? "all"
  );
  const [activeHomeSection, setActiveHomeSection] = useState<string>(
    initialRoute.sectionId ?? "home"
  );
  const [transitioning, setTransitioning] = useState(false);

  const [introVisible, setIntroVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    // Skip intro splash if user navigated directly to a deep page URL (e.g. /projects or /case-study/...)
    if (window.location.pathname && window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
      return false;
    }
    try {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return !prefersReduced;
    } catch {
      return true;
    }
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projects[initialRoute.projectIndex ?? 0] ?? projects[0] ?? null
  );

  // Re-resolve case study index if projects load asynchronously from Firestore and URL had a project slug
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    const parsed = parseCurrentUrl(projects);
    if (parsed.view === "case-study" && parsed.projectIndex !== undefined) {
      setProjectIndex(parsed.projectIndex);
      setSelectedProject(projects[parsed.projectIndex] ?? projects[0] ?? null);
    }
  }, [projects]);

  const currentCaseStudyProject =
    (projects && projects[projectIndex]) ?? selectedProject ?? projects?.[0] ?? null;

  // Keep document title and URL bar synchronized with the active page / section / project
  const getPageTitle = useCallback(
    (
      targetView: "home" | "projects" | "case-study",
      sectionId?: string,
      projIdx?: number,
      filter?: "all" | "archive" | "beyond"
    ) => {
      const baseName = config.hero?.marqueeName
        ? config.hero.marqueeName
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "Yogendra Chaudhary";

      if (targetView === "projects") {
        if (filter === "archive") return `Case Studies Archive · ${baseName}`;
        if (filter === "beyond") return `Beyond the Brief · ${baseName}`;
        return `Projects Archive · ${baseName}`;
      }
      if (targetView === "case-study") {
        const proj = projects[projIdx ?? projectIndex];
        return proj?.title ? `${proj.title} · ${baseName}` : `Case Study · ${baseName}`;
      }
      if (sectionId && sectionId !== "home") {
        const sectionTitles: Record<string, string> = {
          work: "Selected Work",
          "what-i-can-do": "Capabilities",
          capabilities: "Capabilities",
          process: "Design Process",
          about: "About",
          trainings: "Experience",
          skills: "Skills & Stack",
          contact: "Contact",
        };
        const label = sectionTitles[sectionId] || "Portfolio";
        return `${label} · ${baseName}`;
      }
      return `${baseName} — UI/UX Designer`;
    },
    [config.hero?.marqueeName, projects, projectIndex]
  );

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

  const scrollTo = useCallback(
    (id: string, updateUrl = true) => {
      const targetId = id || "home";
      setActiveHomeSection(targetId);

      if (updateUrl) {
        const nextUrl = buildPageUrl({ view: "home", sectionId: targetId, projects });
        const nextTitle = getPageUrlTitle("home", targetId);
        syncBrowserUrl(nextUrl, { replace: false, title: nextTitle });
      }

      if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        const isMobile = window.innerWidth < 768;
        const navOffset = isMobile ? 64 : 76;
        const elementTop =
          el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
        window.scrollTo({
          top: Math.max(0, elementTop - navOffset),
          behavior: "smooth",
        });
      }
    },
    [projects, getPageTitle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function getPageUrlTitle(
    targetView: "home" | "projects" | "case-study",
    sectionId?: string,
    projIdx?: number,
    filter?: "all" | "archive" | "beyond"
  ) {
    return getPageTitle(targetView, sectionId, projIdx, filter);
  }

  // Scroll to initial section if user loaded a direct section URL like /about or /contact
  useEffect(() => {
    if (initialRoute.openAdmin) {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("portfolio-open-admin"));
      }, 300);
    }
    if (initialRoute.view === "home" && initialRoute.sectionId && initialRoute.sectionId !== "home") {
      const timer = window.setTimeout(() => {
        scrollTo(initialRoute.sectionId!, false);
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback(
    (
      next: "home" | "projects" | "case-study",
      destination?: string,
      options?: {
        projectIdx?: number;
        archiveTab?: "all" | "archive" | "beyond";
        skipHistoryPush?: boolean;
      }
    ) => {
      const resolvedProjIdx = options?.projectIdx ?? projectIndex;
      const resolvedArchiveTab = options?.archiveTab ?? archiveFilter;
      const targetSection = next === "home" ? destination || "home" : undefined;

      if (!options?.skipHistoryPush) {
        const nextUrl = buildPageUrl({
          view: next,
          sectionId: targetSection,
          projectIndex: resolvedProjIdx,
          projects,
          archiveFilter: resolvedArchiveTab,
        });
        const nextTitle = getPageTitle(next, targetSection, resolvedProjIdx, resolvedArchiveTab);
        syncBrowserUrl(nextUrl, { replace: false, title: nextTitle });
      }

      if (next === view) {
        if (next === "home" && destination) {
          scrollTo(destination, false);
        }
        return;
      }

      if (view === "home" || view === "projects") {
        setPreviousView(view);
      }

      setTransitioning(true);
      setTimeout(() => {
        setView(next);
        if (next === "home" && destination) {
          setActiveHomeSection(destination);
          window.setTimeout(() => scrollTo(destination, false), 60);
        } else {
          window.scrollTo(0, 0);
        }
        setTransitioning(false);
      }, 400);
    },
    [view, projectIndex, archiveFilter, projects, getPageTitle, scrollTo]
  );

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const onPopState = () => {
      const route = parseCurrentUrl(projects);
      if (route.view === "case-study") {
        const idx = route.projectIndex ?? 0;
        setProjectIndex(idx);
        setSelectedProject(projects[idx] ?? projects[0] ?? null);
        navigate("case-study", undefined, { projectIdx: idx, skipHistoryPush: true });
      } else if (route.view === "projects") {
        const tab = route.archiveFilter ?? "all";
        setArchiveFilter(tab);
        navigate("projects", undefined, { archiveTab: tab, skipHistoryPush: true });
      } else {
        const section = route.sectionId || "home";
        setActiveHomeSection(section);
        navigate("home", section, { skipHistoryPush: true });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [projects, navigate]);

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

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        view: "home" | "projects" | "case-study";
        destination?: string;
        projectIndex?: number;
      }>;
      if (customEvent.detail?.view) {
        if (customEvent.detail.projectIndex !== undefined) {
          setProjectIndex(customEvent.detail.projectIndex);
          setSelectedProject(projects[customEvent.detail.projectIndex] ?? null);
        }
        navigate(customEvent.detail.view, customEvent.detail.destination, {
          projectIdx: customEvent.detail.projectIndex,
        });
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
  }, [navigate, projects]);

  // Synchronize URL bar (replaceState) as user scrolls through Home sections
  const handleActiveSectionChange = useCallback(
    (sectionId: string) => {
      setActiveHomeSection(sectionId);
      if (view === "home" && !transitioning) {
        const nextUrl = buildPageUrl({ view: "home", sectionId, projects });
        const nextTitle = getPageTitle("home", sectionId);
        syncBrowserUrl(nextUrl, { replace: true, title: nextTitle });
      }
    },
    [view, transitioning, projects, getPageTitle]
  );

  return (
    <>
      <MagneticCursor />
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
              active={activeHomeSection}
              onActiveSectionChange={handleActiveSectionChange}
              onNav={(id) => scrollTo(id, true)}
              onHome={() => scrollTo("home", true)}
              onContact={() => scrollTo("contact", true)}
            />
            <main>
              {settings?.sections?.hero !== false && <Hero />}
              {settings?.sections?.work !== false && (
                <WorkGallery
                  projects={projects}
                  onMore={() => {
                    setArchiveFilter("all");
                    navigate("projects", undefined, { archiveTab: "all" });
                  }}
                  onProject={(index) => {
                    setProjectIndex(index);
                    setSelectedProject(projects[index]);
                    navigate("case-study", undefined, { projectIdx: index });
                  }}
                />
              )}
              {settings?.sections?.capabilities !== false && <Capabilities />}
              {settings?.sections?.process !== false && <MyProcess />}
              {settings?.sections?.about !== false && (
                <About
                  onViewProjects={() => {
                    setArchiveFilter("all");
                    navigate("projects", undefined, { archiveTab: "all" });
                  }}
                />
              )}
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
              activeFilter={archiveFilter}
              onFilterChange={(nextFilter) => {
                setArchiveFilter(nextFilter);
                const nextUrl = buildPageUrl({
                  view: "projects",
                  archiveFilter: nextFilter,
                  projects,
                });
                const nextTitle = getPageTitle("projects", undefined, undefined, nextFilter);
                syncBrowserUrl(nextUrl, { replace: false, title: nextTitle });
              }}
              onBack={() => navigate("home", "work")}
              onContact={() => navigate("home", "contact")}
              onProject={(project, index) => {
                setProjectIndex(index);
                setSelectedProject(project);
                navigate("case-study", undefined, { projectIdx: index });
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
                  navigate("projects", undefined, { archiveTab: archiveFilter });
                }
              }}
              onSelectProject={(nextIdx) => {
                setProjectIndex(nextIdx);
                setSelectedProject(projects[nextIdx]);
                const nextUrl = buildPageUrl({
                  view: "case-study",
                  projectIndex: nextIdx,
                  projects,
                });
                const nextTitle = getPageTitle("case-study", undefined, nextIdx);
                syncBrowserUrl(nextUrl, { replace: false, title: nextTitle });
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
