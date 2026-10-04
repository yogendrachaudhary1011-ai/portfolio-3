import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let cachedMax = 0;

    const measureMax = () => {
      const h = document.documentElement;
      const docH = Math.max(h.scrollHeight, document.body ? document.body.scrollHeight : 0);
      const winH = window.innerHeight || h.clientHeight || 1;
      cachedMax = Math.max(0, docH - winH);
    };

    const update = () => {
      raf = 0;
      if (!barRef.current) return;
      if (cachedMax <= 0) measureMax();
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const progress = cachedMax > 0 ? Math.min(1, Math.max(0, scrollY / cachedMax)) : 0;
      barRef.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      measureMax();
      if (!raf) raf = requestAnimationFrame(update);
    };

    measureMax();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[3px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full origin-left will-change-transform"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          boxShadow: "0 0 10px var(--glow-1)",
        }}
      />
    </div>
  );
}

export function Atmosphere() {
  return (
    <>
      <div className="grain pointer-events-none fixed inset-0 -z-10 opacity-30" aria-hidden="true" />
    </>
  );
}
