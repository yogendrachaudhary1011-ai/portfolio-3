import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { img, type TrainingItem } from "../data";
import { SectionHead, Reveal } from "./common";
import { External } from "../icons";
import { useSite } from "../siteContext";

function ParallaxTrainingRow({
  item,
  index,
}: {
  item: TrainingItem;
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const flip = index % 2 === 1;

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
  });

  const mediaY = useTransform(smooth, [0, 1], ["-12%", "12%"]);
  const textY = useTransform(smooth, [0, 1], [32, -32]);

  const imageSrc =
    item.image?.startsWith("data:") || item.image?.startsWith("http")
      ? item.image
      : img(item.image, 960, 640);

  return (
    <div
      ref={rowRef}
      className="grid items-center gap-10 border-t border-[var(--hairline)] pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-14"
    >
      {/* Parallax Image Window */}
      <div
        className={`lg:col-span-6 ${
          flip ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
          <motion.div
            style={{ y: mediaY, scale: 1.16 }}
            className="size-full will-change-transform"
          >
            <img
              src={imageSrc}
              alt={item.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </motion.div>
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute bottom-4 left-5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-white/90">
            {item.date}
          </div>
        </div>
      </div>

      {/* Editorial Experience Dossier */}
      <motion.div
        style={{ y: textY }}
        className={`lg:col-span-6 ${
          flip ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <Reveal delay={0.08} dir="up">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)] tabular-nums">
            <span className="font-semibold text-[var(--accent)]">
              Record {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true">·</span>
            <span>{item.org}</span>
          </div>

          <h3 className="mt-4 font-display text-[clamp(1.75rem,3.2vw,2.6rem)] font-bold leading-[1.06] tracking-[-0.04em] text-[var(--fg)] [text-wrap:balance]">
            {item.title}
          </h3>

          <p className="mt-4 max-w-[58ch] text-[0.96rem] leading-[1.7] text-[var(--muted)]">
            {item.desc}
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-[var(--hairline)] pt-5">
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("work");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--fg)] transition-colors hover:text-[var(--accent)] cursor-pointer whitespace-nowrap"
            >
              <span>{item.cert}</span>
              <External className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            <span className="font-serif italic text-base text-[var(--muted)]">
              Verified Practice
            </span>
          </div>
        </Reveal>
      </motion.div>
    </div>
  );
}

export default function Trainings() {
  const { config } = useSite();
  const trainConfig = config.trainings;
  const trainings = trainConfig.items;

  return (
    <section
      id="trainings"
      className="relative border-y border-[var(--hairline)] bg-[var(--bg-2)] px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          label={`05 · ${trainConfig.kicker}`}
          title={trainConfig.title}
          sub={trainConfig.subtitle}
        />

        <div className="flex flex-col gap-16 sm:gap-24">
          {trainings.map((t, i) => (
            <ParallaxTrainingRow key={`${t.title}-${i}`} item={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
