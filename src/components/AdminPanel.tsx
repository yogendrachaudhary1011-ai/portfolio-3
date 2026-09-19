import { useEffect, useState } from "react";
import { initialCaseStudies, type Project } from "../data";
import { savePdf } from "../pdfStore";

const SETTINGS_KEY = "yogendra-portfolio-settings";
const MESSAGES_KEY = "yogendra-portfolio-messages";
const PROJECTS_KEY = "yogendra-case-studies";

type Settings = {
  accent: string;
  background: string;
  radius: number;
  sectionSpace: string;
};

type Message = { id: number; name: string; email: string; message: string; sentAt: string };

const defaults: Settings = {
  accent: "#a99dff",
  background: "#f5f4f8",
  radius: 14,
  sectionSpace: "clamp(6rem, 10vw, 8rem)",
};

const readMessages = (): Message[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"appearance" | "projects" | "messages">("appearance");
  const [settings, setSettings] = useState<Settings>(defaults);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const saveProjects = (next: Project[]) => {
    setProjects(next);
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
    } catch {
      // The PDF itself is stored in IndexedDB; keep the current edit available even if old local data fills storage.
    }
    window.dispatchEvent(new CustomEvent<Project[]>("portfolio-projects-updated", { detail: next }));
  };

  const uploadPdfs = async (index: number, files: FileList | null) => {
    const file = Array.from(files ?? []).find((item) => item.type === "application/pdf");
    if (!file) return;
    const pdfKey = await savePdf(file);
    saveProjects(projects.map((project, projectIndex) => projectIndex === index ? { ...project, pdfUrls: [], pdfKey } : project));
  };

  const uploadThumbnail = (index: number, file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => saveProjects(projects.map((project, projectIndex) => projectIndex === index ? { ...project, thumbnail: String(reader.result) } : project));
    reader.readAsDataURL(file);
  };

  const apply = (next: Settings) => {
    const root = document.documentElement;
    root.style.setProperty("--accent", next.accent);
    root.style.setProperty("--accent-2", next.accent);
    root.style.setProperty("--bg", next.background);
    root.style.setProperty("--radius", `${next.radius}px`);
    root.style.setProperty("--section-space", next.sectionSpace);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Settings | null;
      if (saved) {
        setSettings(saved);
        apply(saved);
      }
    } catch { /* use defaults */ }
    try { setProjects(JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? "null") ?? initialCaseStudies); } catch { setProjects(initialCaseStudies); }
  }, []);

  useEffect(() => {
    const updateMessages = () => setMessages(readMessages());
    updateMessages();
    window.addEventListener("portfolio-messages-updated", updateMessages);
    return () => window.removeEventListener("portfolio-messages-updated", updateMessages);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    apply(next);
  };

  const reset = () => {
    const root = document.documentElement;
    ["--accent", "--accent-2", "--bg", "--radius", "--section-space"].forEach((key) => root.style.removeProperty(key));
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(defaults);
  };

  return (
    <>
      <button type="button" onClick={() => { setMessages(readMessages()); setOpen(true); }} className="rounded-full px-2 py-1 font-mono text-[0.58rem] tracking-[0.12em] text-[var(--muted)] transition-colors hover:bg-[var(--chip)] hover:text-[var(--fg)]" aria-label="Open site controls" title="Site controls">
        ◌
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#0b0b0e]/35 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-label="Portfolio controls" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--shadow-lift)]">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
              <div><p className="section-kicker">Private controls</p><h2 className="mt-1 font-display text-xl font-semibold">Portfolio studio</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="control-surface grid size-10 place-items-center rounded-full text-sm" aria-label="Close controls">×</button>
            </div>
            <div className="flex gap-1 border-b border-[var(--hairline)] px-5 pt-3">
              {(["appearance", "projects", "messages"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-t-lg px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] ${tab === item ? "bg-[var(--chip)] text-[var(--fg)]" : "text-[var(--muted)]"}`}>{item}{item === "messages" ? ` (${messages.length})` : ""}</button>)}
            </div>
            {tab === "appearance" ? (
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <label className="block"><span className="label !text-[0.56rem]">Accent</span><span className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--chip)] px-3"><input type="color" value={settings.accent} onChange={(event) => updateSetting("accent", event.target.value)} className="size-6 cursor-pointer rounded border-0 bg-transparent" /><code className="text-sm">{settings.accent}</code></span></label>
                <label className="block"><span className="label !text-[0.56rem]">Canvas</span><span className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--chip)] px-3"><input type="color" value={settings.background} onChange={(event) => updateSetting("background", event.target.value)} className="size-6 cursor-pointer rounded border-0 bg-transparent" /><code className="text-sm">{settings.background}</code></span></label>
                <label className="block"><span className="label !text-[0.56rem]">Corner radius · {settings.radius}px</span><input className="mt-4 w-full accent-[var(--accent)]" type="range" min="8" max="24" value={settings.radius} onChange={(event) => updateSetting("radius", Number(event.target.value))} /></label>
                <label className="block"><span className="label !text-[0.56rem]">Section spacing</span><select value={settings.sectionSpace} onChange={(event) => updateSetting("sectionSpace", event.target.value)} className="message-field mt-2 h-11 w-full rounded-xl px-3 text-sm outline-none"><option value="clamp(4.5rem, 8vw, 6rem)">Compact</option><option value="clamp(6rem, 10vw, 8rem)">Balanced</option><option value="clamp(7rem, 12vw, 10rem)">Spacious</option></select></label>
                <div className="sm:col-span-2 flex justify-end"><button type="button" onClick={reset} className="rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-medium hover:bg-[var(--chip)]">Reset appearance</button></div>
              </div>
            ) : tab === "projects" ? (
              <div className="max-h-[55vh] space-y-4 overflow-y-auto p-5">
                <button type="button" onClick={() => saveProjects([...projects, { title: "New case study", desc: "Add a concise project overview.", stack: "Product design", image: "1551288049-bebda4e38f71", thumbnail: "1551288049-bebda4e38f71", media: [], pdfUrls: [] }])} className="rounded-full bg-[var(--fg)] px-4 py-2 text-xs font-medium text-[var(--bg)]">Add case study</button>
                {projects.map((project, index) => <article key={`${project.title}-${index}`} className="space-y-3 rounded-2xl border border-[var(--card-border)] p-4"><div className="flex items-center justify-between"><span className="label !text-[0.55rem]">Case study {String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => saveProjects(projects.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-500 hover:underline">Delete</button></div><input value={project.title} onChange={(event) => saveProjects(projects.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} className="message-field h-10 w-full rounded-lg px-3 text-sm outline-none" aria-label="Project title" /><textarea value={project.desc} onChange={(event) => saveProjects(projects.map((item, itemIndex) => itemIndex === index ? { ...item, desc: event.target.value } : item))} className="message-field min-h-20 w-full rounded-lg px-3 py-2 text-sm outline-none" aria-label="Project description" /><label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--chip)]"><span>Upload gallery thumbnail</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => { uploadThumbnail(index, event.target.files?.[0]); event.currentTarget.value = ""; }} /></label><input value={project.thumbnail?.startsWith("data:") ? "Local thumbnail uploaded" : project.thumbnail ?? ""} onChange={(event) => saveProjects(projects.map((item, itemIndex) => itemIndex === index ? { ...item, thumbnail: event.target.value } : item))} placeholder="Or paste thumbnail URL / Unsplash ID" className="message-field h-10 w-full rounded-lg px-3 text-sm outline-none" aria-label="Gallery thumbnail" /><input value={(project.media ?? []).join(", ")} onChange={(event) => saveProjects(projects.map((item, itemIndex) => itemIndex === index ? { ...item, media: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) } : item))} placeholder="Case-study images, comma-separated" className="message-field h-10 w-full rounded-lg px-3 text-sm outline-none" aria-label="Case-study images" /><label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--chip)]"><span>Upload PDFs directly</span><input type="file" accept="application/pdf" multiple className="sr-only" onChange={(event) => { void uploadPdfs(index, event.target.files); event.currentTarget.value = ""; }} /></label><p className="text-xs text-[var(--muted)]">Stored only in this browser.</p><input value={(project.pdfUrls ?? []).filter((url) => !url.startsWith("data:")).join(", ")} onChange={(event) => saveProjects(projects.map((item, itemIndex) => itemIndex === index ? { ...item, pdfUrls: [...(item.pdfUrls ?? []).filter((url) => url.startsWith("data:")), ...event.target.value.split(",").map((value) => value.trim()).filter(Boolean)] } : item))} placeholder="Or add PDF URLs, comma-separated" className="message-field h-10 w-full rounded-lg px-3 text-sm outline-none" aria-label="Case-study PDF links" /></article>)}
              </div>
            ) : (
              <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">
                {messages.length === 0 ? <p className="rounded-xl border border-dashed border-[var(--card-border)] p-6 text-sm text-[var(--muted)]">No messages stored in this browser yet.</p> : messages.slice().reverse().map((message) => <article key={message.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--chip)] p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{message.name}</p><a href={`mailto:${message.email}`} className="text-sm text-[var(--accent)]">{message.email}</a></div><time className="font-mono text-[0.58rem] text-[var(--muted)]">{new Date(message.sentAt).toLocaleString()}</time></div><p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{message.message}</p></article>)}
                {messages.length > 0 && <button type="button" onClick={() => { localStorage.removeItem(MESSAGES_KEY); setMessages([]); }} className="rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-medium hover:bg-[var(--chip)]">Clear local inbox</button>}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
