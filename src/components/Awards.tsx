import { awards, awardPhotos, img } from "../data";
import { SectionHead, Reveal, Tilt } from "./common";
import { Trophy, External } from "../icons";

const rot = ["-6deg", "3deg", "-3deg", "5deg", "-4deg", "2deg"];

export default function Awards() {
  return (
    <section id="awards" className="relative mx-auto max-w-6xl px-6 py-32">
      <SectionHead
        label="Recognition"
        title="Awards and Achievements"
        sub="A collection of academic and professional recognitions that reflect my dedication to excellence."
      />

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
        {/* collage */}
        <div className="grid grid-cols-3 gap-3">
          {awardPhotos.map((p, i) => (
            <Reveal key={p} delay={i * 0.08} dir="up" className={i % 2 ? "mt-6" : ""}>
              <div
                className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] shadow-lg transition-all duration-500 hover:z-10 hover:!rotate-0 hover:scale-[1.07] hover:shadow-[0_20px_50px_-16px_var(--glow-1)]"
                style={{ rotate: rot[i] }}
              >
                <img
                  src={img(p, 440, 520)}
                  alt="Award moment"
                  className="aspect-[4/5] w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "linear-gradient(to top, var(--accent-soft), transparent 60%)" }}
                />
              </div>
            </Reveal>
          ))}
        </div>

        {/* list */}
        <div className="flex flex-col gap-4">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.1} dir="left">
              <Tilt max={5} className="group relative rounded-2xl [transform-style:preserve-3d]">
                <a
                  href="#"
                  className="card-surface hover-lift flex items-center justify-between rounded-2xl px-5 py-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-[var(--chip)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                      <Trophy className="size-5" />
                    </span>
                    <span className="font-medium">{a.title}</span>
                  </div>
                  <External className="size-4 text-[var(--muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </a>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
