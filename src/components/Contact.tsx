import { useState } from "react";
import { Mail, Linkedin, External, Arrow, Github, Dribbble } from "../icons";
import { Reveal, Tilt } from "./common";
import { useSite } from "../siteContext";
import { sendMessageToCloud } from "../cloudStore";
import { Loader2, CheckCircle2 } from "lucide-react";

const iconFor = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("email") || l.includes("mail")) return Mail;
  if (l.includes("linkedin")) return Linkedin;
  if (l.includes("github")) return Github;
  if (l.includes("dribbble")) return Dribbble;
  return External;
};

export default function Contact() {
  const { config } = useSite();
  const contactConfig = config.contact;
  const contacts = contactConfig.contacts;

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const submitMessage = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await sendMessageToCloud({
        name: form.name,
        email: form.email,
        message: form.message,
      });

      setForm({ name: "", email: "", message: "" });
      setStatus("success");
    } catch (err) {
      console.error("Error saving message to database:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect to the database");
    }
  };

  return (
    <section id="contact" data-section="contact" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <p className="section-kicker mb-5 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-[var(--accent)]" />
          {contactConfig.kicker || "Get In Touch"}
        </p>
      </Reveal>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        {/* left */}
        <div>
          <h2 className="max-w-[9ch] font-display text-[clamp(3.25rem,7vw,6.1rem)] font-bold leading-[0.88] tracking-[-0.065em]">
            {(contactConfig.titleLines || ["LET'S", "WORK", "TOGETHER"]).map((w, i) => (
              <Reveal key={`${w}-${i}`} delay={i * 0.12} dir="up">
                <span className={i === 2 ? "text-gradient block" : "block"}>{w}</span>
              </Reveal>
            ))}
          </h2>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-sm text-lg font-semibold">{contactConfig.subtitleHeadline}</p>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[var(--muted)]">
              {contactConfig.subtitleBody}
            </p>
          </Reveal>
        </div>

        {/* right */}
        <div className="flex flex-col gap-4">
          {contacts.map((c, i) => {
            const Icon = iconFor(c.label);
            return (
              <Reveal key={`${c.num}-${i}`} delay={i * 0.1} dir="left">
                <Tilt max={6} className="group relative rounded-2xl [transform-style:preserve-3d]">
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="card-surface hover-lift relative flex items-center gap-4 rounded-2xl px-5 py-5"
                  >
                    <span className="absolute right-4 top-3 font-mono text-[0.6rem] text-[var(--muted)]">{c.num}</span>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--chip)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="label !text-[0.55rem]">{c.label}</p>
                      <p className="truncate text-[0.92rem] font-medium">{c.value}</p>
                    </div>
                    <External className="ml-auto size-4 shrink-0 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </Tilt>
              </Reveal>
            );
          })}

          <Reveal delay={0.2}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMessage();
              }}
              className="card-surface gradient-border mt-2 p-5 sm:p-6"
            >
              <p className="mb-5 flex items-center gap-2 font-display font-semibold">
                <span className="size-2 animate-pulse rounded-full bg-[var(--accent)]" />
                {contactConfig.formTitle || "Send Me a Message"}
              </p>
              {["Full Name", "Email Address"].map((f) => (
                <label key={f} className="mb-4 block">
                  <span className="label !text-[0.58rem]">{f}</span>
                  <input
                    required
                    type={f.includes("Email") ? "email" : "text"}
                    placeholder={f === "Full Name" ? "Your full name" : "your.email@example.com"}
                    value={f === "Full Name" ? form.name : form.email}
                    onChange={(event) => updateField(f === "Full Name" ? "name" : "email", event.target.value)}
                    className="message-field mt-1.5 h-11 w-full rounded-lg px-3 text-sm outline-none"
                  />
                </label>
              ))}
              <label className="mb-5 block">
                <span className="label !text-[0.58rem]">Message</span>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  className="message-field mt-1.5 min-h-28 w-full resize-y rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={status === "submitting"}
                className={`btn-shine inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] px-6 py-3 text-[0.78rem] font-medium transition-colors cursor-pointer ${
                  status === "submitting"
                    ? "opacity-60 cursor-not-allowed bg-[var(--chip)] text-[var(--muted)]"
                    : status === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                }`}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-[var(--accent)]" />
                    <span>Saving to Database...</span>
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Message Sent ✓</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Arrow className="size-4" />
                  </>
                )}
              </button>
              <div aria-live="polite" className="mt-3 min-h-5 text-xs">
                {status === "success" ? (
                  <p className="text-emerald-400 font-medium">
                    Your message has been safely saved to the database. I will get back to you soon!
                  </p>
                ) : status === "error" ? (
                  <p className="text-red-400">
                    {errorMessage || "Unable to save this message to the database. Please try again."}
                  </p>
                ) : (
                  <p className="text-[var(--muted)]">
                    Messages are delivered directly to the database inbox.
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>

      <footer className="mt-28 flex flex-col items-center justify-between gap-4 border-t border-[var(--hairline)] pt-8 text-[0.75rem] text-[var(--muted)] sm:flex-row">
        <span>{contactConfig.footerCopyright || "© 2026 Yogendra Chaudhary. All rights reserved."}</span>
        <span className="inline-flex items-center font-mono">
          <span>{(contactConfig.footerCredit || "Designed & crafted by Yogendra").replace(/\.+$/, "")}</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("portfolio-open-admin"))}
            className="group inline-flex size-4 items-center justify-center rounded-full text-[var(--muted)]/40 hover:text-[var(--fg)]/80 transition-colors focus:outline-none cursor-pointer ml-0.5"
            aria-label="Admin panel"
            title="Studio Admin"
          >
            <span className="size-1 rounded-full bg-current transition-transform duration-200 group-hover:scale-150" />
          </button>
        </span>
      </footer>
    </section>
  );
}
