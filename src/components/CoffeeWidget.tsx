import { useState } from "react";

export default function CoffeeWidget() {
  const [count, setCount] = useState(306);
  const [hover, setHover] = useState(false);
  const [pops, setPops] = useState<number[]>([]);

  const add = () => {
    setCount((c) => c + 1);
    const id = Date.now();
    setPops((p) => [...p, id]);
    setTimeout(() => setPops((p) => p.filter((x) => x !== id)), 900);
  };

  return (
    <button
      onClick={add}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group glass fixed bottom-6 left-4 z-50 flex items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_var(--glow-1)] active:scale-90 cursor-pointer select-none"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* floating +1 pops */}
      {pops.map((id) => (
        <span
          key={id}
          className="pointer-events-none absolute left-1/2 top-0 text-xs font-semibold text-[var(--accent)]"
          style={{ animation: "floatUp 0.9s ease forwards" }}
        >
          +1
        </span>
      ))}
      <span
        className="grid overflow-hidden transition-all duration-300"
        style={{ maxWidth: hover ? 130 : 0, opacity: hover ? 1 : 0 }}
      >
        <span className="whitespace-nowrap pl-1 text-[0.72rem] font-medium">Get me a coffee</span>
      </span>
      <span className="text-base transition-transform duration-300 group-hover:rotate-12 group-active:scale-125">☕</span>
      <span className="grid min-w-7 place-items-center rounded-full bg-[var(--chip)] px-1.5 py-0.5 font-mono text-[0.68rem] transition-transform duration-200 group-active:scale-110">
        {count}
      </span>
    </button>
  );
}
