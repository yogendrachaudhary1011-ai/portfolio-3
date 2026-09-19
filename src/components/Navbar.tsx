import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme";
import { Sun, Moon } from "../icons";
import { Home } from "lucide-react";
import { NAV } from "../data";
import { Magnetic } from "./common";

/* Intro curtain fully gone at ~2.35s. We start navbar elements at 1.9s so
   they're already mid-animation when the curtain finishes rising. */
const BASE = 1.9; // seconds

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="group grid size-12 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
      style={{ animation: `load-fade 0.5s ease ${BASE + 0.5}s both` }}
    >
      <span className="transition-transform duration-500 group-hover:rotate-45">
        {theme === "dark" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
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
  variant?: "home" | "projects";
  showHomeButton?: boolean;
  active?: string;
  onNav?: (id: string) => void;
  onHome?: () => void;
  onContact?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(active ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePill, setActivePill] = useState({ left: 0, width: 0, visible: false });
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const links = NAV.map((n) => ({ label: n, id: n === "Experience" ? "trainings" : n.toLowerCase().replace(/[^a-z]+/g, "-") }));

  useEffect(() => {
    if (active !== undefined) setCurrent(active);
  }, [active]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [current, variant]);

  return (
    <>
      {/* whole header slides down from top */}
      <header
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-4"
        style={{ animation: `load-down 0.7s cubic-bezier(0.22,1,0.36,1) ${BASE - 0.05}s both` }}
      >
        <nav
          aria-label="Primary navigation"
          className="glass liquid-nav relative flex w-full items-center justify-center rounded-[1.75rem] px-2.5 backdrop-blur-xl transition-all duration-500 sm:px-3"
          style={{
            maxWidth: scrolled ? "59rem" : "69rem",
            paddingBlock: scrolled ? "0.4rem" : "0.52rem",
            boxShadow: scrolled ? "var(--shadow-soft)" : "0 12px 30px -25px var(--shadow-soft)",
          }}
        >
          {showHomeButton && (
            <button
              type="button"
              onClick={onHome}
              aria-label="Go home"
              className="control-surface mr-1 hidden size-9 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--fg)] md:grid"
            >
              <Home size={15} />
            </button>
          )}
          <div ref={desktopNavRef} className="relative hidden items-center gap-1.5 md:flex">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 rounded-full bg-[var(--fg)] shadow-[0_8px_18px_-14px_var(--fg)]"
              style={{
                left: activePill.left,
                width: activePill.width,
                opacity: activePill.visible ? 1 : 0,
                transition: "left 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease",
              }}
            />
            {links.map((l, i) => {
              const isActive = current === l.id;
              return (
                <button
                  key={l.id}
                  ref={(element) => { linkRefs.current[i] = element; }}
                  onClick={() => { setCurrent(l.id); onNav?.(l.id); }}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative z-10 rounded-full px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors duration-300 hover:text-[var(--fg)] ${
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

          <div className="flex w-full items-center justify-between px-1.5 md:hidden">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)]">Navigate</span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              className="control-surface grid size-10 place-items-center rounded-full text-[var(--fg)]"
            >
              <span className="flex w-4 flex-col gap-1.5">
                <span className={`h-px w-full bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
                <span className={`h-px w-full bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>

          <div className={`liquid-menu absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[1.5rem] border border-[var(--card-border)] p-2 transition-all duration-300 md:hidden ${menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}>
            {showHomeButton && (
              <button
                type="button"
                onClick={() => { onHome?.(); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors"
              >
                <Home size={12} /><span>Home</span>
              </button>
            )}
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => { setCurrent(link.id); onNav?.(link.id); setMenuOpen(false); }}
                aria-current={current === link.id ? "page" : undefined}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-mono text-[0.66rem] uppercase tracking-[0.16em] transition-colors ${current === link.id ? "bg-[var(--chip)] text-[var(--fg)]" : "text-[var(--muted)]"}`}
              >
                {link.label}<span aria-hidden>↗</span>
              </button>
            ))}
          </div>
        </nav>
      </header>
      <div className="glass fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full p-2 shadow-[var(--shadow-soft)]">
        <ThemeToggle />
        <Magnetic strength={0.22}>
          <a
            href="#contact"
            onClick={(event) => {
              setMenuOpen(false);
              if (onContact) {
                event.preventDefault();
                onContact();
              }
            }}
            className="btn-shine inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--fg)] px-5 text-[0.84rem] font-medium text-[var(--bg)] transition-transform hover:scale-[1.02]"
          >
            Let’s Talk
          </a>
        </Magnetic>
      </div>
    </>
  );
}
