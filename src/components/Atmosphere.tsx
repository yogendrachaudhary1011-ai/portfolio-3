import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "../theme";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] pointer-events-none">
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
        }}
      />
    </div>
  );
}

/* ─── High-DPI Topographic Flow-Field & Coordinate Canvas ─────────────── */
function TopographicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = {
      x: width * 0.5,
      y: height * 0.4,
      tx: width * 0.5,
      ty: height * 0.4,
    };

    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;
    let phase = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
    };

    const onScroll = () => {
      targetScrollY =
        window.scrollY || document.documentElement.scrollTop || 0;
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      scrollY += (targetScrollY - scrollY) * 0.1;
      phase += 0.004;

      const isDark = theme === "dark";
      const gridRGB = isDark ? "244, 244, 240" : "17, 17, 16";
      const accentRGB = isDark ? "242, 183, 5" : "217, 56, 30";

      const step = width < 768 ? 72 : 84;
      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 2;
      const shiftY = (scrollY * 0.22) % step;

      for (let r = -1; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step;
          const y = r * step - shiftY;

          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const dist = Math.hypot(dx, dy);
          const radius = 260;

          // Flow field angle modulated by scroll depth, coordinates, and pointer proximity
          let angle =
            Math.sin(c * 0.35 + phase + scrollY * 0.0012) *
            Math.cos(r * 0.35 + phase);
          let alpha = isDark ? 0.065 : 0.055;
          let len = 5;
          let isAccent = false;

          if (dist < radius && !prefersReduced) {
            const influence = (1 - dist / radius) ** 2;
            angle = Math.atan2(dy, dx);
            alpha = (isDark ? 0.08 : 0.07) + influence * 0.38;
            len = 5 + influence * 7;
            isAccent = influence > 0.22;
          }

          const cos = Math.cos(angle) * len;
          const sin = Math.sin(angle) * len;

          ctx.beginPath();
          ctx.moveTo(x - cos, y - sin);
          ctx.lineTo(x + cos, y + sin);
          ctx.strokeStyle = isAccent
            ? `rgba(${accentRGB}, ${alpha.toFixed(3)})`
            : `rgba(${gridRGB}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = isAccent ? 1.25 : 1;
          ctx.stroke();
        }
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}

export function Atmosphere() {
  return (
    <>
      <TopographicCanvas />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
