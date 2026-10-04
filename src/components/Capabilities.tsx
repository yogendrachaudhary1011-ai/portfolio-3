import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplitText, WordReveal } from "./common";
import { useSite } from "../siteContext";
import { useTheme } from "../theme";

/* ─── High-DPI Interactive HTML5 Canvas Workbench ─────────────────────── */
function CapabilityCanvasLab({
  activeIndex,
  title,
  skills,
}: {
  activeIndex: number;
  title: string;
  skills: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = 560;
    let height = 300;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = {
      x: width * 0.5,
      y: height * 0.5,
      tx: width * 0.5,
      ty: height * 0.5,
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = 300;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    };

    canvas.addEventListener("pointermove", onMove, { passive: true });

    let t = 0;
    const render = () => {
      t += 0.02;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      const isDark = theme === "dark";
      const fgRGB = isDark ? "244, 244, 240" : "17, 17, 16";
      const accentHex = isDark ? "#f2b705" : "#d9381e";

      // Draw blueprint grid
      ctx.strokeStyle = `rgba(${fgRGB}, 0.06)`;
      ctx.lineWidth = 1;
      const gridStep = 36;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cx = width * 0.5;
      const cy = height * 0.5;
      const count = Math.max(3, skills.length);

      // Draw interactive orbital nodes for each skill in the active capability
      const nodes: { x: number; y: number; label: string }[] = [];
      for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2 + t * 0.35 + activeIndex;
        const rx = Math.min(width * 0.34, 175);
        const ry = Math.min(height * 0.32, 92);

        let nx = cx + Math.cos(baseAngle) * rx;
        let ny = cy + Math.sin(baseAngle) * ry;

        // Magnetic pull toward pointer
        const dx = pointer.x - nx;
        const dy = pointer.y - ny;
        const dist = Math.hypot(dx, dy);
        if (dist < 160) {
          const pull = (1 - dist / 160) * 0.35;
          nx += dx * pull;
          ny += dy * pull;
        }

        nodes.push({ x: nx, y: ny, label: skills[i] || `Node 0${i + 1}` });
      }

      // Connect nodes to center hub and neighbors
      ctx.strokeStyle = `rgba(${fgRGB}, 0.16)`;
      ctx.lineWidth = 1.1;
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();

        const next = nodes[(idx + 1) % nodes.length];
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      });

      // Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 22 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = accentHex;
      ctx.fill();

      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#050505";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`0${activeIndex + 1}`, cx, cy);

      // Skill Nodes + Labels
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = accentHex;
        ctx.fill();

        ctx.font = "500 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(${fgRGB}, 0.85)`;
        ctx.textAlign = n.x > cx ? "left" : "right";
        ctx.fillText(n.label, n.x + (n.x > cx ? 10 : -10), n.y);
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, [activeIndex, skills, theme, title]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--process-border)] bg-[var(--process-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--process-border)] px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--process-muted)]">
        <span>Interactive Node Topology · Move Cursor Inside</span>
        <span className="text-[var(--accent)]">60FPS Canvas</span>
      </div>
      <canvas
        ref={canvasRef}
        className="block w-full h-[300px] cursor-crosshair"
      />
    </div>
  );
}

export default function Capabilities() {
  const [active, setActive] = useState(0);
  const { config, settings } = useSite();

  const cap = config.capabilities;
  const practices = cap.items;
  const safeActive = Math.max(0, Math.min(active, practices.length - 1));
  const currentPractice = practices[safeActive] || practices[0];
  const showKicker = settings?.textVisibility?.showKickers ?? true;

  return (
    <section
      id="what-i-can-do"
      className="relative overflow-hidden border-t border-[var(--hairline)] bg-[var(--process-bg)] py-24 text-[var(--process-fg)] sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="grid items-end gap-8 border-b border-[var(--process-border)] pb-12 md:grid-cols-[1fr_auto]">
          <div>
            {showKicker && (
              <p className="section-kicker mb-5 flex items-center gap-3 text-[var(--process-muted)]">
                <span className="h-px w-8 bg-[var(--accent)]" />
                <span>{cap.kicker}</span>
              </p>
            )}
            <SplitText
              text={cap.title}
              className="section-title max-w-4xl [text-wrap:balance]"
              stagger={0.018}
            />
          </div>
          <WordReveal
            text={cap.subtitle}
            className="max-w-xs text-sm leading-relaxed text-[var(--process-muted)] md:mb-1"
            delay={0.18}
          />
        </div>

        {/* Architectural Command Matrix: Horizontal Tab Rail + Interactive Canvas Lab */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Left 5-Column Discipline Selector */}
          <div className="flex flex-col gap-2 lg:col-span-5">
            {practices.map((practice, index) => {
              const selected = safeActive === index;
              return (
                <button
                  key={practice.num}
                  type="button"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.matchMedia("(pointer: fine)").matches
                    ) {
                      setActive(index);
                    }
                  }}
                  className={`group relative flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all cursor-pointer select-none ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--process-card)] text-[var(--process-fg)] shadow-[var(--shadow-soft)]"
                      : "border-transparent bg-transparent text-[var(--process-muted)] hover:border-[var(--process-border)] hover:text-[var(--process-fg)]"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="cap-active-indicator"
                      className="pointer-events-none absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-[var(--accent)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-[var(--accent)] tabular-nums">
                      {practice.num}
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                      {practice.title}
                    </span>
                  </div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60 tabular-nums">
                    {practice.skills.length} nodes
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right 7-Column Interactive Canvas Workbench & Dossier */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-[var(--process-border)] bg-[var(--process-card)] p-6 sm:p-9 shadow-[var(--shadow-soft)]">
            <CapabilityCanvasLab
              activeIndex={safeActive}
              title={currentPractice?.title || ""}
              skills={currentPractice?.skills || []}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={safeActive}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--process-border)] pb-4">
                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--process-fg)]">
                    {currentPractice?.title}
                  </h3>
                  <span className="font-serif italic text-xl text-[var(--accent)]">
                    Specification {currentPractice?.num}
                  </span>
                </div>

                <p className="mt-5 text-base leading-[1.75] text-[var(--process-muted)]">
                  {currentPractice?.desc}
                </p>

                <div className="mt-6 pt-5 border-t border-[var(--process-border)] font-mono text-xs uppercase tracking-[0.14em] text-[var(--process-fg)]">
                  {currentPractice?.skills.join("  ·  ")}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
