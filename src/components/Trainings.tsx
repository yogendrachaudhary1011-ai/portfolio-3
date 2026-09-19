import { img } from "../data";
import { SectionHead, Reveal, useParallax } from "./common";
import { External } from "../icons";
import { useSite } from "../siteContext";

function TrainingImage({ src, alt }: { src: string; alt: string }) {
  const { ref, y } = useParallax<HTMLDivElement>(28);
  return (
    <Reveal className="flex-1" dir="up">
      <div className="group relative overflow-hidden rounded-2xl border border-[var(--card-border)] shadow-xl">
        <div ref={ref} style={{ transform: `translate3d(0, ${y * 0.5}px, 0)`, willChange: "transform" }}>
          <img
            src={src}
            alt={alt}
            className="aspect-[16/11] w-full scale-[1.12] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.2]"
          />
        </div>
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "linear-gradient(120deg, var(--accent-soft), transparent 60%)" }}
        />
      </div>
    </Reveal>
  );
}

export default function Trainings() {
  const { config } = useSite();
  const trainConfig = config.trainings;
  const trainings = trainConfig.items;

  return (
    <section id="trainings" className="relative border-y border-[var(--hairline)] bg-[var(--bg-2)] px-5 py-24 sm:px-6 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--accent)]/25" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          label={trainConfig.kicker}
          title={trainConfig.title}
          sub={trainConfig.subtitle}
        />

        <div className="flex flex-col gap-16 sm:gap-24">
          {trainings.map((t, i) => {
            const flip = i % 2 === 1;
            const imageSrc = t.image?.startsWith("data:") || t.image?.startsWith("http")
              ? t.image
              : img(t.image, 780, 540);
            const image = <TrainingImage src={imageSrc} alt={t.title} />;
            const text = (
              <Reveal delay={0.12} className="flex-1" dir={flip ? "right" : "left"}>
                <span className="text-gradient font-display text-6xl font-bold opacity-30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <h3 className="font-display text-xl font-bold">{t.title}</h3>
                  <span className="label whitespace-nowrap !text-[0.58rem]">{t.date}</span>
                </div>
                <p className="mt-2 text-[0.82rem] font-medium text-[var(--accent)]">{t.org}</p>
                <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--muted)]">{t.desc}</p>
                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                  <a href="#work" className="label group inline-flex items-center gap-1.5 hover:text-[var(--fg)]">
                    {t.cert} <External className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </Reveal>
            );
            return (
              <div key={`${t.title}-${i}`} className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
                {flip ? (
                  <>
                    <div className="hidden flex-1 md:block">{text}</div>
                    {image}
                    <div className="w-full md:hidden">{text}</div>
                  </>
                ) : (
                  <>
                    {image}
                    {text}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
