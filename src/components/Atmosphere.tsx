import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div
        className="h-full origin-left"
        style={{
          width: `${p}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          boxShadow: "0 0 12px var(--glow-1)",
        }}
      />
    </div>
  );
}

export function Atmosphere() {
  return (
    <>
      {/* fixed ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="ambient-orb drift"
          style={{ top: "-10%", left: "-5%", width: "45vw", height: "45vw", background: "var(--glow-1)" }}
        />
        <div
          className="ambient-orb drift"
          style={{ bottom: "-15%", right: "-8%", width: "50vw", height: "50vw", background: "var(--glow-2)", animationDelay: "-7s" }}
        />
        <div
          className="ambient-orb drift"
          style={{ top: "40%", left: "55%", width: "30vw", height: "30vw", background: "var(--accent-soft)", animationDelay: "-14s" }}
        />
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}
