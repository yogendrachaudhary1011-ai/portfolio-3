import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme";
import { Sun, Moon } from "../icons";
import { Home, Menu, X, ArrowUpRight, ArrowLeft, Mail, Sparkles } from "lucide-react";
import { NAV } from "../data";
import { Magnetic } from "./common";
import { useSite } from "../siteContext";

/* Intro curtain fully gone at ~2.35s. We start navbar elements at 1.9s so
   they're already mid-animation when the curtain finishes rising. */
const BASE = 1.9; // seconds

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="group grid size-10 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--fg)] active:scale-95 sm:size-12"
    >
      <span className="transition-transform duration-500 group-hover:rotate-45">
        {theme === "dark" ? <Moon className="size-4 sm:size-[18px]" /> : <Sun className="size-4 sm:size-[18px]" />}
      </span>
    </button>
  );
}

export default function Navbar({
  variant = "home",
  showHomeButton = false,
  active,
  onNav,
  onHome,
  onContact,
}: {
  variant?: "home" | "projects" | "case-study";
  showHomeButton?: boolean;
  active?: string;
  onNav?: (id: string) => void;
  onHome?: () => void;
  onContact?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const { settings } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(active ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePill, setActivePill] = useState({ left: 0, width: 0, visible: false });
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const links = NAV.map((n, i) => {
    let id = n.toLowerCase().replace(/[^a-z]+/g, "-");
    if (n === "Experience") id = "trainings";
    return { label: n, id, num: String(i + 1).padStart(2, "0") };
  }).filter((link) => {
    if (!settings?.sections) return true;
    const sectionKey = link.id === "what-i-can-do" ? "capabilities" : link.id;
    return settings.sections[sectionKey as keyof typeof settings.sections] !== false;
  });

  useEffect(() => {
    if (active !== undefined) setCurrent(active);
  }, [active]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setScrolled(scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const measure = () => {
      const nav = desktopNavRef.current;
      const index = links.findIndex((link) => link.id === current);
      const button = linkRefs.current[index];
      if (!nav || !button || index < 0) return;
      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setActivePill({ left: buttonRect.left - navRect.left, width: buttonRect.width, visible: true });
    };
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (desktopNavRef.current) observer.observe(desktopNavRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [current, variant]);

  const handleContact = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    if (onContact) {
      onContact();
    } else if (onNav) {
      onNav("contact");
    } else {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* ─── REDESIGNED MOBILE NAVIGATION (md:hidden) ─────────────────── */}
      {/* 1. Fixed Top Mobile App Bar */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--hairline)] bg-[var(--bg)]/90 px-4 backdrop-blur-xl transition-colors duration-300 md:hidden"
        style={{
          boxShadow: scrolled ? "var(--shadow-soft)" : "none",
        }}
      >
        {/* Left: Brand Identity / Back Button */}
        {showHomeButton ? (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onHome?.();
            }}
            aria-label="Back to home"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--chip)] px-3 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--fg)] transition-transform active:scale-95"
          >
            <ArrowLeft size={13} className="text-[var(--accent)]" />
            <span>Home</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onNav?.("home");
            }}
            className="flex flex-col text-left transition-transform active:scale-95"
          >
            <span className="font-display text-[0.88rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              Yogendra C.
            </span>
            <span className="mt-0.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[0.55rem] uppercase tracking-wider text-[var(--muted)]">
                UI/UX Designer
              </span>
            </span>
          </button>
        )}

        {/* Right: Theme Toggle + Menu Button */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="grid size-9 place-items-center rounded-full border border-[var(--card-border)] bg-[var(--chip)] text-[var(--fg)] transition-all hover:border-[var(--accent)] active:scale-90"
          >
            {theme === "dark" ? (
              <Moon className="size-4 text-[var(--accent)]" />
            ) : (
              <Sun className="size-4 text-[var(--accent)]" />
            )}
          </button>

          {/* Morphing Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3 transition-all active:scale-95 ${
              menuOpen
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)] shadow-sm font-semibold"
                : "border-[var(--card-border)] bg-[var(--chip)] text-[var(--fg)] font-medium"
            }`}
          >
            {menuOpen ? (
              <>
                <X size={14} className="stroke-[2.5]" />
                <span className="font-mono text-[0.66rem] uppercase tracking-wider">Close</span>
              </>
            ) : (
              <>
                <Menu size={14} className="stroke-[2.5]" />
                <span className="font-mono text-[0.66rem] uppercase tracking-wider">Menu</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Full-Screen Immersive Mobile Menu Overlay */}
      <div
        className={`fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col justify-between overflow-y-auto bg-[var(--bg)]/98 px-5 pb-6 pt-4 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        {/* Navigation Section */}
        <div>
          <div className="mb-2 flex items-center justify-between border-b border-[var(--hairline)] pb-2.5">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--muted)]">
              Navigation Directory
            </span>
            <span className="font-mono text-[0.62rem] font-medium text-[var(--accent)]">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </div>

          <div className="flex flex-col">
            {showHomeButton && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onHome?.();
                }}
                className="group flex w-full items-center justify-between border-b border-[var(--hairline)] py-3.5 text-left transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs text-[var(--muted)] group-hover:text-[var(--accent)]">
                    00
                  </span>
                  <span className="font-display text-lg font-semibold tracking-tight text-[var(--fg)] group-hover:translate-x-1 transition-transform">
                    Return to Home
                  </span>
                </div>
                <div className="grid size-7 place-items-center rounded-full border border-[var(--hairline)] text-[var(--muted)] transition-all group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                  <ArrowUpRight size={14} />
                </div>
              </button>
            )}

            {links.map((link) => {
              const isActive = current === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    setCurrent(link.id);
                    onNav?.(link.id);
                    setMenuOpen(false);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center justify-between border-b border-[var(--hairline)] py-3.5 text-left transition-colors ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--fg)]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`font-mono text-xs transition-colors ${
                        isActive
                          ? "font-bold text-[var(--accent)]"
                          : "text-[var(--muted)] group-hover:text-[var(--accent)]"
                      }`}
                    >
                      {link.num}
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </div>

                  <div
                    className={`grid size-7 place-items-center rounded-full transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--bg)] shadow-xs"
                        : "border border-[var(--hairline)] text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]"
                    }`}
                  >
                    <ArrowUpRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions and Contact Panel */}
        <div className="mt-6 flex flex-col gap-3 pt-3">
          {/* Main CTA */}
          <a
            href="#contact"
            onClick={handleContact}
            className="btn-shine flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] text-[0.84rem] font-medium text-[var(--bg)] shadow-md transition-transform active:scale-98"
          >
            <Sparkles size={14} />
            <span>Let’s Talk — Start a Project</span>
            <ArrowUpRight size={14} />
          </a>

          {/* Quick Contact & Info Card */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--chip)] px-3.5 py-2.5">
            <a
              href="mailto:yogendrachaudhary2004@gmail.com"
              className="flex items-center gap-2 font-mono text-[0.68rem] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              <Mail size={13} className="text-[var(--accent)]" />
              <span className="truncate">yogendrachaudhary2004@gmail.com</span>
            </a>
            <span className="font-mono text-[0.62rem] text-[var(--muted)]">
              Kathmandu (NPT)
            </span>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP FLOATING CAPSULE NAVIGATION (md:flex) ─────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 hidden justify-center px-4 transition-all duration-300 md:flex ${
          variant === "case-study"
            ? "h-16 items-center bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--hairline)] pt-0"
            : "pt-3.5"
        }`}
      >
        <nav
          aria-label="Primary navigation"
          className="glass liquid-nav relative flex items-center justify-center rounded-[1.75rem] px-3 backdrop-blur-xl transition-all duration-500"
          style={{
            maxWidth: scrolled ? "56rem" : "64rem",
            paddingBlock: scrolled ? "0.3rem" : "0.42rem",
            boxShadow: scrolled ? "var(--shadow-soft)" : "0 12px 30px -25px var(--shadow-soft)",
          }}
        >
          <div ref={desktopNavRef} className="relative flex items-center gap-1">
            {showHomeButton && (
              <button
                type="button"
                onClick={onHome}
                aria-label="Go home"
                className="relative z-10 grid size-8 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--fg)] cursor-pointer"
              >
                <Home size={14} />
              </button>
            )}

            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 rounded-full bg-[var(--fg)] shadow-[0_8px_18px_-14px_var(--fg)]"
              style={{
                left: activePill.left,
                width: activePill.width,
                opacity: activePill.visible ? 1 : 0,
                transition:
                  "left 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease",
              }}
            />

            {links.map((l, i) => {
              const isActive = current === l.id;
              return (
                <button
                  key={l.id}
                  ref={(element) => {
                    linkRefs.current[i] = element;
                  }}
                  onClick={() => {
                    setCurrent(l.id);
                    onNav?.(l.id);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative z-10 rounded-full px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-mono text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.12em] sm:tracking-[0.14em] whitespace-nowrap transition-colors duration-300 hover:text-[var(--fg)] cursor-pointer ${
                    isActive ? "text-[var(--bg)]" : "text-[var(--muted)]"
                  }`}
                  style={{
                    animation: `load-down 0.5s cubic-bezier(0.22,1,0.36,1) ${BASE + 0.1 + i * 0.07}s both`,
                  }}
                >
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Floating Action Bar (Bottom Right) - Always visible at all times */}
      <div
        id="floating-action-bar"
        className="glass fixed bottom-4 right-4 z-[90] flex items-center gap-1.5 rounded-full p-1.5 shadow-[var(--shadow-soft)] transition-all duration-300 pointer-events-auto opacity-100 translate-y-0 sm:bottom-5 sm:right-5 sm:gap-2 sm:p-2"
      >
        <ThemeToggle />
        <Magnetic strength={0.22}>
          <a
            href="#contact"
            onClick={handleContact}
            className="btn-shine inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--fg)] px-4 text-[0.78rem] font-medium text-[var(--bg)] transition-transform hover:scale-[1.02] active:scale-95 sm:min-h-12 sm:gap-2 sm:px-5 sm:text-[0.84rem]"
          >
            <span>Let’s Talk</span>
            <span aria-hidden>→</span>
          </a>
        </Magnetic>
      </div>
    </>
  );
}

