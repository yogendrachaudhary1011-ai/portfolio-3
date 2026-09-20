import { useEffect, useState, useRef } from "react";
import {
  useSite,
  defaultSiteConfig,
  type PracticeCapability,
  type ProcessStep,
  type SkillTool,
  type TrainingItem,
  type ContactItem,
  type DigitalExploration,
} from "../siteContext";
import { type Project } from "../data";
import { savePdf } from "../pdfStore";
import { compressImageFile } from "../storage";
import {
  Sliders,
  FolderGit2,
  Sparkles,
  User,
  Zap,
  Cpu,
  Mail,
  Compass,
  GraduationCap,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  X,
  Check,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Palette,
} from "lucide-react";

const MESSAGES_KEY = "yogendra-portfolio-messages";
type Message = { id: number; name: string; email: string; message: string; sentAt: string };

const readMessages = (): Message[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

type TabKey =
  | "projects"
  | "hero"
  | "about"
  | "skills"
  | "capabilities"
  | "process"
  | "trainings"
  | "contact"
  | "archive"
  | "appearance"
  | "messages";

/* ─── Reusable Clean Form Controls ───────────────────────────────────────── */
function FormField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
        </label>
        {hint && <span className="text-[0.65rem] text-[var(--muted)]/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 transition-all ${className}`}
    />
  );
}

function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-y rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--fg)] placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 transition-all ${className}`}
    />
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
  placeholder = "Image URL or Unsplash ID",
  aspect = "video",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onUpload: (file: File) => void;
  placeholder?: string;
  aspect?: "video" | "square" | "portrait";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displaySrc = value?.startsWith("data:") || value?.startsWith("http")
    ? value
    : value
    ? `https://images.unsplash.com/photo-${value}?auto=format&fit=crop&w=400&q=80`
    : "";

  return (
    <FormField label={label}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {displaySrc ? (
          <div
            className={`relative shrink-0 overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--bg)] ${
              aspect === "portrait"
                ? "h-20 w-16"
                : aspect === "square"
                ? "size-16"
                : "h-16 w-24"
            }`}
          >
            <img src={displaySrc} alt="Preview" className="size-full object-cover" />
          </div>
        ) : (
          <div
            className={`grid place-items-center rounded-xl border border-dashed border-[var(--hairline)] bg-[var(--bg)] text-[var(--muted)]/40 ${
              aspect === "portrait"
                ? "h-20 w-16"
                : aspect === "square"
                ? "size-16"
                : "h-16 w-24"
            }`}
          >
            <ImageIcon className="size-5" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--chip)] px-3 py-1 text-[0.7rem] font-medium text-[var(--fg)] hover:bg-[var(--chip)]/80 hover:border-[var(--accent)]/50 transition-colors"
            >
              <Upload className="size-3" />
              Upload local image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </div>
        </div>
      </div>
    </FormField>
  );
}

/* ─── Main Admin Panel Component ─────────────────────────────────────────── */
export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("projects");
  const [messages, setMessages] = useState<Message[]>([]);
  const [saveBanner, setSaveBanner] = useState(false);
  const [expandedProjectIndex, setExpandedProjectIndex] = useState<number | null>(0);

  const {
    config,
    updateConfig,
    resetConfig,
    settings,
    updateSettings,
    resetSettings,
    projects,
    saveProjects,
    resetProjects,
  } = useSite();

  const showSaved = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

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

  // Image upload helper with automatic optimization
  const handleFileUpload = async (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file) return;
    try {
      const optimizedUrl = await compressImageFile(file);
      onSuccess(optimizedUrl);
      showSaved();
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        onSuccess(String(reader.result));
        showSaved();
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProjectPdf = async (index: number, files: FileList | null) => {
    const file = Array.from(files ?? []).find((item) => item.type === "application/pdf");
    if (!file) return;
    const pdfKey = await savePdf(file);
    const updated = projects.map((p, i) => (i === index ? { ...p, pdfUrls: [], pdfKey } : p));
    saveProjects(updated);
    showSaved();
  };

  // Reorder projects
  const moveProject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= projects.length) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    saveProjects(reordered);
    setExpandedProjectIndex(toIndex);
    showSaved();
  };

  const navigationSections = [
    {
      group: "CONTENT",
      tabs: [
        { key: "projects" as TabKey, label: "Case Studies & Work", icon: FolderGit2, count: projects.length },
        { key: "hero" as TabKey, label: "Hero Banner", icon: Sparkles },
        { key: "about" as TabKey, label: "About Me", icon: User },
        { key: "skills" as TabKey, label: "Toolkit & Skills", icon: Cpu },
        { key: "capabilities" as TabKey, label: "Capabilities", icon: Zap },
        { key: "process" as TabKey, label: "Design Process", icon: Compass },
        { key: "trainings" as TabKey, label: "Trainings & Certs", icon: GraduationCap },
        { key: "archive" as TabKey, label: "Archive & Labs", icon: Eye },
      ],
    },
    {
      group: "COMMUNICATION",
      tabs: [
        { key: "contact" as TabKey, label: "Contact & Footer", icon: Mail },
        { key: "messages" as TabKey, label: "Visitor Inbox", icon: MessageSquare, count: messages.length },
      ],
    },
    {
      group: "PREFERENCES",
      tabs: [
        { key: "appearance" as TabKey, label: "Theme & Styling", icon: Palette },
      ],
    },
  ];

  return (
    <>
      {/* ─── INCONSPICUOUS TRIGGER: JUST A TINY INNOCUOUS DOT ──────────────── */}
      <button
        type="button"
        onClick={() => {
          setMessages(readMessages());
          setOpen(true);
        }}
        className="group inline-flex size-3.5 items-center justify-center rounded-full text-[var(--muted)]/40 hover:text-[var(--fg)]/80 transition-colors focus:outline-none"
        aria-label="."
      >
        <span className="size-1 rounded-full bg-current transition-transform duration-200 group-hover:scale-150" />
      </button>

      {/* ─── STUDIO MODAL OVERLAY ──────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-2 sm:p-5 backdrop-blur-xl animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Site Studio"
            onMouseDown={(e) => e.stopPropagation()}
            className="flex h-[90vh] max-h-[900px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--card)] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Top Accent Line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />

            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--hairline)] bg-[var(--card)] px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--chip)] text-[var(--accent)]">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-sm font-bold tracking-tight text-[var(--fg)] sm:text-base">
                      Portfolio Studio
                    </h2>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[0.62rem] text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="hidden text-[0.72rem] text-[var(--muted)] sm:block">
                    Real-time visual editor &amp; content manager
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {saveBanner && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs text-emerald-400 animate-in fade-in duration-150">
                    <Check className="size-3.5" /> Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Main Area: Sidebar + Content */}
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              {/* Sidebar Navigation */}
              <nav className="flex shrink-0 overflow-x-auto border-b border-[var(--hairline)] bg-[var(--bg)]/60 p-2 md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
                <div className="flex md:flex-col gap-4 w-full">
                  {navigationSections.map((sec) => (
                    <div key={sec.group} className="space-y-1 w-full">
                      <p className="hidden md:block px-2.5 pt-1.5 pb-1 font-mono text-[0.62rem] font-semibold tracking-wider text-[var(--muted)]/50 uppercase">
                        {sec.group}
                      </p>
                      <div className="flex md:flex-col gap-1">
                        {sec.tabs.map((tab) => {
                          const Icon = tab.icon;
                          const active = activeTab === tab.key;
                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setActiveTab(tab.key)}
                              className={`group flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                                active
                                  ? "bg-[var(--chip)] text-[var(--fg)] border border-[var(--hairline)] shadow-xs"
                                  : "text-[var(--muted)] hover:bg-[var(--chip)]/50 hover:text-[var(--fg)]"
                              }`}
                            >
                              <Icon className={`size-3.5 shrink-0 transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} />
                              <span className="flex-1 truncate">{tab.label}</span>
                              {tab.count !== undefined && (
                                <span
                                  className={`rounded-full px-1.5 py-0.2 font-mono text-[0.6rem] ${
                                    active
                                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                                      : "bg-[var(--chip)] text-[var(--muted)]"
                                  }`}
                                >
                                  {tab.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reset entire site shortcut */}
                <div className="mt-auto hidden md:block pt-4 border-t border-[var(--hairline)]">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Reset ALL site content and settings back to original defaults?")) {
                        resetConfig();
                        resetSettings();
                        resetProjects();
                        showSaved();
                      }
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.7rem] font-medium text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <RotateCcw className="size-3" />
                    Reset All Defaults
                  </button>
                </div>
              </nav>

              {/* Tab Panel Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                {/* ────────────────── PROJECTS TAB ────────────────── */}
                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Case Studies &amp; Projects</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Featured work displayed on the homepage and archive
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newProject: Project = {
                              title: "New Case Study",
                              desc: "Brief overview of problem, design solution, and outcome.",
                              stack: "Product Design · UI/UX",
                              image: "1551288049-bebda4e38f71",
                              thumbnail: "1551288049-bebda4e38f71",
                              media: ["1551288049-bebda4e38f71"],
                              pdfUrls: [],
                            };
                            saveProjects([newProject, ...projects]);
                            setExpandedProjectIndex(0);
                            showSaved();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-3.5 py-2 text-xs font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
                        >
                          <Plus className="size-3.5" /> New Project
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Reset projects to initial default case studies?")) {
                              resetProjects();
                              showSaved();
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-[var(--hairline)] px-3 py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--chip)] transition-colors"
                        >
                          <RotateCcw className="size-3" /> Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {projects.map((project, index) => {
                        const isExpanded = expandedProjectIndex === index;
                        return (
                          <div
                            key={`${project.title}-${index}`}
                            className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--bg)] transition-all"
                          >
                            {/* Project Accordion Bar */}
                            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[var(--card)] border-b border-[var(--hairline)]">
                              <button
                                type="button"
                                onClick={() => setExpandedProjectIndex(isExpanded ? null : index)}
                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                                  #{String(index + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-[var(--fg)]">
                                    {project.title || "Untitled Project"}
                                  </p>
                                  <p className="truncate text-[0.7rem] text-[var(--muted)]">
                                    {project.stack || "No role specified"}
                                  </p>
                                </div>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => moveProject(index, index - 1)}
                                  className="grid size-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] disabled:opacity-20 transition-colors"
                                  title="Move Up"
                                >
                                  <ArrowUp className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === projects.length - 1}
                                  onClick={() => moveProject(index, index + 1)}
                                  className="grid size-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] disabled:opacity-20 transition-colors"
                                  title="Move Down"
                                >
                                  <ArrowDown className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Delete project "${project.title}"?`)) {
                                      saveProjects(projects.filter((_, i) => i !== index));
                                      showSaved();
                                    }
                                  }}
                                  className="grid size-7 place-items-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete Project"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedProjectIndex(isExpanded ? null : index)}
                                  className="grid size-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors ml-1"
                                >
                                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Project Edit Form */}
                            {isExpanded && (
                              <div className="p-4 sm:p-5 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FormField label="Project Title">
                                    <TextInput
                                      value={project.title}
                                      onChange={(val) => {
                                        saveProjects(projects.map((p, i) => (i === index ? { ...p, title: val } : p)));
                                      }}
                                      placeholder="e.g. Fintech Mobile App"
                                    />
                                  </FormField>

                                  <FormField label="Role / Stack / Category">
                                    <TextInput
                                      value={project.stack ?? ""}
                                      onChange={(val) => {
                                        saveProjects(projects.map((p, i) => (i === index ? { ...p, stack: val } : p)));
                                      }}
                                      placeholder="e.g. Product Design · Design System"
                                    />
                                  </FormField>
                                </div>

                                <FormField label="Short Description">
                                  <TextAreaInput
                                    rows={2}
                                    value={project.desc}
                                    onChange={(val) => {
                                      saveProjects(projects.map((p, i) => (i === index ? { ...p, desc: val } : p)));
                                    }}
                                    placeholder="Brief overview of problem and solution..."
                                  />
                                </FormField>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <ImageUploadField
                                    label="Cover / Gallery Thumbnail"
                                    value={project.thumbnail ?? project.image ?? ""}
                                    onChange={(val) => {
                                      saveProjects(projects.map((p, i) => (i === index ? { ...p, thumbnail: val, image: val } : p)));
                                    }}
                                    onUpload={(file) => {
                                      handleFileUpload(file, (dataUrl) => {
                                        saveProjects(projects.map((p, i) => (i === index ? { ...p, thumbnail: dataUrl, image: dataUrl } : p)));
                                      });
                                    }}
                                  />

                                  <FormField label="Case Study PDF Document" hint="Optional full deck">
                                    <div className="flex flex-col gap-2">
                                      <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] bg-[var(--card)] hover:border-[var(--accent)] hover:bg-[var(--chip)] transition-colors">
                                        <Upload className="size-4 text-[var(--muted)] mb-1" />
                                        <span className="text-[0.7rem] font-medium text-[var(--fg)]">
                                          {project.pdfKey || (project.pdfUrls && project.pdfUrls.length > 0)
                                            ? "Change attached PDF"
                                            : "Upload PDF deck"}
                                        </span>
                                        <span className="text-[0.62rem] text-[var(--muted)]">Interactive reader in case study</span>
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          className="hidden"
                                          onChange={(e) => uploadProjectPdf(index, e.target.files)}
                                        />
                                      </label>
                                      {(project.pdfKey || (project.pdfUrls && project.pdfUrls.length > 0)) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            saveProjects(projects.map((p, i) => (i === index ? { ...p, pdfKey: undefined, pdfUrls: [] } : p)));
                                            showSaved();
                                          }}
                                          className="self-start text-[0.65rem] text-red-400 hover:underline"
                                        >
                                          Remove attached PDF
                                        </button>
                                      )}
                                    </div>
                                  </FormField>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ────────────────── HERO BANNER TAB ────────────────── */}
                {activeTab === "hero" && (
                  <div className="space-y-6">
                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Hero Banner</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Top entrance headline, tagline, bio, and cutout portrait</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Giant Marquee Name">
                        <TextInput
                          value={config.hero.marqueeName || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, marqueeName: val } }))}
                          placeholder="e.g. YOGENDRA CHAUDHARY"
                        />
                      </FormField>

                      <FormField label="Tagline / Discipline">
                        <TextInput
                          value={config.hero.tagline || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, tagline: val } }))}
                          placeholder="e.g. Junior UI/UX Designer"
                        />
                      </FormField>
                    </div>

                    <FormField label="Bio Summary (Word-by-word reveal)">
                      <TextAreaInput
                        rows={3}
                        value={config.hero.bio || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, bio: val } }))}
                        placeholder="Creating thoughtful, intuitive, and engaging digital experiences."
                      />
                    </FormField>

                    <FormField label="Scroll Down Indicator Text">
                      <TextInput
                        value={config.hero.scrollText || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, scrollText: val } }))}
                        placeholder="Scroll Down"
                      />
                    </FormField>

                    <ImageUploadField
                      label="Portrait Cutout Image"
                      aspect="portrait"
                      value={config.hero.portraitImage || ""}
                      onChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, portraitImage: val } }))}
                      onUpload={(file) => {
                        handleFileUpload(file, (dataUrl) => {
                          updateConfig((c) => ({ ...c, hero: { ...c.hero, portraitImage: dataUrl } }));
                        });
                      }}
                      placeholder="Image URL with transparent or dark background"
                    />
                  </div>
                )}

                {/* ────────────────── ABOUT ME TAB ────────────────── */}
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">About Me</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Biography, credentials, stats badges, and headshot</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Section Kicker">
                        <TextInput
                          value={config.about.kicker || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, kicker: val } }))}
                        />
                      </FormField>

                      <FormField label="Profile Name">
                        <TextInput
                          value={config.about.name || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, name: val } }))}
                        />
                      </FormField>
                    </div>

                    <FormField label="Typewriter Heading Title">
                      <TextInput
                        value={config.about.title || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, title: val } }))}
                      />
                    </FormField>

                    <ImageUploadField
                      label="Avatar Headshot Image"
                      aspect="square"
                      value={config.about.avatarImage || ""}
                      onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, avatarImage: val } }))}
                      onUpload={(file) => {
                        handleFileUpload(file, (dataUrl) => {
                          updateConfig((c) => ({ ...c, about: { ...c.about, avatarImage: dataUrl } }));
                        });
                      }}
                    />

                    {/* Stats */}
                    <div className="space-y-3">
                      <p className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                        Stats &amp; Metric Badges
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {config.about.stats.map((stat, i) => (
                          <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-3 space-y-2">
                            <TextInput
                              value={stat.k}
                              onChange={(val) => {
                                const stats = [...config.about.stats];
                                stats[i] = { ...stats[i], k: val };
                                updateConfig((c) => ({ ...c, about: { ...c.about, stats } }));
                              }}
                              placeholder="Label"
                            />
                            <TextInput
                              value={stat.v}
                              onChange={(val) => {
                                const stats = [...config.about.stats];
                                stats[i] = { ...stats[i], v: val };
                                updateConfig((c) => ({ ...c, about: { ...c.about, stats } }));
                              }}
                              placeholder="Value"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormField label="Biography Paragraph 1">
                      <TextAreaInput
                        rows={3}
                        value={config.about.bioParagraph1 || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, bioParagraph1: val } }))}
                      />
                    </FormField>

                    <FormField label="Biography Paragraph 2">
                      <TextAreaInput
                        rows={3}
                        value={config.about.bioParagraph2 || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, bioParagraph2: val } }))}
                      />
                    </FormField>
                  </div>
                )}

                {/* ────────────────── SKILLS TAB ────────────────── */}
                {activeTab === "skills" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Toolkit &amp; Skills</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Software apps, proficiencies, and individual accent colors</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTool: SkillTool = {
                            name: "New Tool",
                            role: "Design / Development",
                            detail: "Key competency",
                            icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
                            number: String(config.skills.tools.length + 1).padStart(2, "0"),
                            accent: "#a99dff",
                          };
                          updateConfig((c) => ({ ...c, skills: { ...c.skills, tools: [...c.skills.tools, newTool] } }));
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-3 py-1.5 text-xs font-semibold text-[var(--bg)]"
                      >
                        <Plus className="size-3.5" /> Add Tool
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {config.skills.tools.map((tool, i) => (
                        <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={tool.icon} alt="" className="size-6 object-contain" />
                              <span className="font-semibold text-xs text-[var(--fg)]">{tool.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const tools = config.skills.tools.filter((_, idx) => idx !== i);
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <TextInput
                              value={tool.name}
                              onChange={(val) => {
                                const tools = [...config.skills.tools];
                                tools[i] = { ...tools[i], name: val };
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              placeholder="Tool name"
                            />
                            <TextInput
                              value={tool.role}
                              onChange={(val) => {
                                const tools = [...config.skills.tools];
                                tools[i] = { ...tools[i], role: val };
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              placeholder="Role / Context"
                            />
                          </div>

                          <TextInput
                            value={tool.detail}
                            onChange={(val) => {
                              const tools = [...config.skills.tools];
                              tools[i] = { ...tools[i], detail: val };
                              updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                            }}
                            placeholder="Detail / Competencies"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={tool.accent}
                              onChange={(e) => {
                                const tools = [...config.skills.tools];
                                tools[i] = { ...tools[i], accent: e.target.value };
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              className="size-7 cursor-pointer rounded border-0 bg-transparent"
                            />
                            <TextInput
                              value={tool.icon}
                              onChange={(val) => {
                                const tools = [...config.skills.tools];
                                tools[i] = { ...tools[i], icon: val };
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              placeholder="Icon SVG URL"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ────────────────── CAPABILITIES TAB ────────────────── */}
                {activeTab === "capabilities" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Capabilities &amp; Disciplines</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Accordion items highlighting what you can do</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem: PracticeCapability = {
                            num: String(config.capabilities.items.length + 1).padStart(2, "0"),
                            title: "New Capability",
                            desc: "Description of your discipline and methods.",
                            skills: ["Skill 1", "Skill 2"],
                          };
                          updateConfig((c) => ({
                            ...c,
                            capabilities: { ...c.capabilities, items: [...c.capabilities.items, newItem] },
                          }));
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-3 py-1.5 text-xs font-semibold text-[var(--bg)]"
                      >
                        <Plus className="size-3.5" /> Add Capability
                      </button>
                    </div>

                    <div className="space-y-3">
                      {config.capabilities.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[var(--accent)] font-bold">{item.num}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const items = config.capabilities.items.filter((_, idx) => idx !== i);
                                updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, items } }));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <TextInput
                            value={item.title}
                            onChange={(val) => {
                              const items = [...config.capabilities.items];
                              items[i] = { ...items[i], title: val };
                              updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, items } }));
                            }}
                            placeholder="Title"
                          />

                          <TextAreaInput
                            rows={2}
                            value={item.desc}
                            onChange={(val) => {
                              const items = [...config.capabilities.items];
                              items[i] = { ...items[i], desc: val };
                              updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, items } }));
                            }}
                            placeholder="Description"
                          />

                          <TextInput
                            value={item.skills.join(", ")}
                            onChange={(val) => {
                              const skills = val.split(",").map((s) => s.trim()).filter(Boolean);
                              const items = [...config.capabilities.items];
                              items[i] = { ...items[i], skills };
                              updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, items } }));
                            }}
                            placeholder="Skills (comma-separated)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ────────────────── PROCESS TAB ────────────────── */}
                {activeTab === "process" && (
                  <div className="space-y-6">
                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Design Process</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Sticky stack cards explaining your design methodology</p>
                    </div>

                    <div className="space-y-4">
                      {config.process.steps.map((step, i) => (
                        <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[var(--accent)]">
                              Step {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-xs font-semibold text-[var(--fg)]">{step.title}</span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextInput
                              value={step.title}
                              onChange={(val) => {
                                const steps = [...config.process.steps];
                                steps[i] = { ...steps[i], title: val };
                                updateConfig((c) => ({ ...c, process: { ...c.process, steps } }));
                              }}
                              placeholder="Step title"
                            />
                            <TextInput
                              value={step.principle}
                              onChange={(val) => {
                                const steps = [...config.process.steps];
                                steps[i] = { ...steps[i], principle: val };
                                updateConfig((c) => ({ ...c, process: { ...c.process, steps } }));
                              }}
                              placeholder="Principle quote"
                            />
                          </div>

                          <TextAreaInput
                            rows={2}
                            value={step.desc}
                            onChange={(val) => {
                              const steps = [...config.process.steps];
                              steps[i] = { ...steps[i], desc: val };
                              updateConfig((c) => ({ ...c, process: { ...c.process, steps } }));
                            }}
                            placeholder="Step description"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ────────────────── TRAININGS TAB ────────────────── */}
                {activeTab === "trainings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Trainings &amp; Internships</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Experience timeline, organizations, and credentials</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem: TrainingItem = {
                            title: "UI/UX Design Internship",
                            org: "Design Studio",
                            date: "2025",
                            desc: "Worked closely with product managers and engineers.",
                            cert: "View Credential",
                            image: "1551288049-bebda4e38f71",
                          };
                          updateConfig((c) => ({
                            ...c,
                            trainings: { ...c.trainings, items: [...c.trainings.items, newItem] },
                          }));
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-3 py-1.5 text-xs font-semibold text-[var(--bg)]"
                      >
                        <Plus className="size-3.5" /> Add Experience
                      </button>
                    </div>

                    <div className="space-y-4">
                      {config.trainings.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[var(--accent)]">
                              #{String(i + 1).padStart(2, "0")} {item.org}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const items = config.trainings.items.filter((_, idx) => idx !== i);
                                updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <TextInput
                              value={item.title}
                              onChange={(val) => {
                                const items = [...config.trainings.items];
                                items[i] = { ...items[i], title: val };
                                updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                              }}
                              placeholder="Role / Program Title"
                            />
                            <TextInput
                              value={item.org}
                              onChange={(val) => {
                                const items = [...config.trainings.items];
                                items[i] = { ...items[i], org: val };
                                updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                              }}
                              placeholder="Organization / Company"
                            />
                            <TextInput
                              value={item.date}
                              onChange={(val) => {
                                const items = [...config.trainings.items];
                                items[i] = { ...items[i], date: val };
                                updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                              }}
                              placeholder="Date / Duration"
                            />
                          </div>

                          <TextAreaInput
                            rows={2}
                            value={item.desc}
                            onChange={(val) => {
                              const items = [...config.trainings.items];
                              items[i] = { ...items[i], desc: val };
                              updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                            }}
                            placeholder="Description of work and learning outcomes"
                          />

                          <ImageUploadField
                            label="Photo / Certificate Image"
                            value={item.image}
                            onChange={(val) => {
                              const items = [...config.trainings.items];
                              items[i] = { ...items[i], image: val };
                              updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                            }}
                            onUpload={(file) => {
                              handleFileUpload(file, (dataUrl) => {
                                const items = [...config.trainings.items];
                                items[i] = { ...items[i], image: dataUrl };
                                updateConfig((c) => ({ ...c, trainings: { ...c.trainings, items } }));
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ────────────────── CONTACT & FOOTER TAB ────────────────── */}
                {activeTab === "contact" && (
                  <div className="space-y-6">
                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Contact &amp; Footer</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Direct contact links, headlines, and copyright notes</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Headline (Line 1)">
                        <TextInput
                          value={config.contact.titleLines?.[0] || "LET'S"}
                          onChange={(val) => {
                            const lines = [...(config.contact.titleLines || ["LET'S", "WORK", "TOGETHER"])];
                            lines[0] = val;
                            updateConfig((c) => ({ ...c, contact: { ...c.contact, titleLines: lines } }));
                          }}
                        />
                      </FormField>

                      <FormField label="Headline (Line 2)">
                        <TextInput
                          value={config.contact.titleLines?.[1] || "WORK"}
                          onChange={(val) => {
                            const lines = [...(config.contact.titleLines || ["LET'S", "WORK", "TOGETHER"])];
                            lines[1] = val;
                            updateConfig((c) => ({ ...c, contact: { ...c.contact, titleLines: lines } }));
                          }}
                        />
                      </FormField>
                    </div>

                    <FormField label="Subhead Title">
                      <TextInput
                        value={config.contact.subtitleHeadline || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, subtitleHeadline: val } }))}
                      />
                    </FormField>

                    <FormField label="Invitation Body">
                      <TextAreaInput
                        rows={2}
                        value={config.contact.subtitleBody || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, subtitleBody: val } }))}
                      />
                    </FormField>

                    {/* Contact Links */}
                    <div className="space-y-3">
                      <p className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                        Direct Socials &amp; Channels
                      </p>
                      <div className="space-y-2">
                        {config.contact.contacts.map((item, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-3">
                            <TextInput
                              value={item.label}
                              onChange={(val) => {
                                const contacts = [...config.contact.contacts];
                                contacts[i] = { ...contacts[i], label: val };
                                updateConfig((c) => ({ ...c, contact: { ...c.contact, contacts } }));
                              }}
                              placeholder="Platform"
                            />
                            <TextInput
                              value={item.value}
                              onChange={(val) => {
                                const contacts = [...config.contact.contacts];
                                contacts[i] = { ...contacts[i], value: val };
                                updateConfig((c) => ({ ...c, contact: { ...c.contact, contacts } }));
                              }}
                              placeholder="Display Handle / Email"
                            />
                            <TextInput
                              value={item.href}
                              onChange={(val) => {
                                const contacts = [...config.contact.contacts];
                                contacts[i] = { ...contacts[i], href: val };
                                updateConfig((c) => ({ ...c, contact: { ...c.contact, contacts } }));
                              }}
                              placeholder="Destination URL"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Footer Copyright Text">
                        <TextInput
                          value={config.contact.footerCopyright || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, footerCopyright: val } }))}
                        />
                      </FormField>

                      <FormField label="Footer Design Credit Text">
                        <TextInput
                          value={config.contact.footerCredit || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, footerCredit: val } }))}
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ────────────────── ARCHIVE TAB ────────────────── */}
                {activeTab === "archive" && (
                  <div className="space-y-6">
                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Archive &amp; Explorations</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Standalone archive page titles, copy, and digital experiments</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Archive Title">
                        <TextInput
                          value={config.projectsArchive.archiveTitle || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, archiveTitle: val } }))}
                        />
                      </FormField>

                      <FormField label="Explorations Title">
                        <TextInput
                          value={config.projectsArchive.explorationsTitle || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, explorationsTitle: val } }))}
                        />
                      </FormField>
                    </div>

                    <FormField label="Explorations Subtitle">
                      <TextAreaInput
                        rows={2}
                        value={config.projectsArchive.explorationsSubtitle || ""}
                        onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, explorationsSubtitle: val } }))}
                      />
                    </FormField>

                    <div className="space-y-3">
                      <p className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                        Exploration Cards
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {config.projectsArchive.digitalProjects.map((dp, i) => (
                          <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-3 space-y-2">
                            <TextInput
                              value={dp.title}
                              onChange={(val) => {
                                const digitalProjects = [...config.projectsArchive.digitalProjects];
                                digitalProjects[i] = { ...digitalProjects[i], title: val };
                                updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, digitalProjects } }));
                              }}
                              placeholder="Title"
                            />
                            <TextAreaInput
                              rows={2}
                              value={dp.desc}
                              onChange={(val) => {
                                const digitalProjects = [...config.projectsArchive.digitalProjects];
                                digitalProjects[i] = { ...digitalProjects[i], desc: val };
                                updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, digitalProjects } }));
                              }}
                              placeholder="Description"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ────────────────── THEME & STYLING TAB ────────────────── */}
                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Theme &amp; Visual Styling</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Global accent colors, background tones, and rhythm</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          resetSettings();
                          showSaved();
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--hairline)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--chip)] transition-colors"
                      >
                        <RotateCcw className="size-3" /> Reset Theme
                      </button>
                    </div>

                    {/* Quick Preset Themes */}
                    <div className="space-y-2.5">
                      <p className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                        Curated Aesthetic Presets
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { name: "Cosmic Lavender", accent: "#a99dff", accent2: "#d0a8ff", bg: "#0b0b0e" },
                          { name: "Electric Cyan", accent: "#38bdf8", accent2: "#818cf8", bg: "#090d16" },
                          { name: "Warm Amber", accent: "#f59e0b", accent2: "#fbbf24", bg: "#0f0e0c" },
                          { name: "Emerald Studio", accent: "#34d399", accent2: "#6ee7b7", bg: "#0a0f0d" },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              updateSettings((s) => ({
                                ...s,
                                accent: preset.accent,
                                accent2: preset.accent2,
                                background: preset.bg,
                              }));
                              showSaved();
                            }}
                            className="flex items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-2.5 text-left hover:border-[var(--accent)] transition-all"
                          >
                            <span
                              className="size-4 shrink-0 rounded-full border border-white/20"
                              style={{ background: preset.accent }}
                            />
                            <span className="truncate text-xs font-medium text-[var(--fg)]">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Colors */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField label="Primary Accent">
                        <div className="flex h-11 items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3">
                          <input
                            type="color"
                            value={settings.accent}
                            onChange={(e) => updateSettings((s) => ({ ...s, accent: e.target.value }))}
                            className="size-7 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <code className="text-xs text-[var(--fg)] font-mono">{settings.accent}</code>
                        </div>
                      </FormField>

                      <FormField label="Secondary Glow">
                        <div className="flex h-11 items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3">
                          <input
                            type="color"
                            value={settings.accent2}
                            onChange={(e) => updateSettings((s) => ({ ...s, accent2: e.target.value }))}
                            className="size-7 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <code className="text-xs text-[var(--fg)] font-mono">{settings.accent2}</code>
                        </div>
                      </FormField>

                      <FormField label="Canvas Background">
                        <div className="flex h-11 items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3">
                          <input
                            type="color"
                            value={settings.background}
                            onChange={(e) => updateSettings((s) => ({ ...s, background: e.target.value }))}
                            className="size-7 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <code className="text-xs text-[var(--fg)] font-mono">{settings.background}</code>
                        </div>
                      </FormField>
                    </div>

                    {/* Slider & Select */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label={`Corner Radius · ${settings.radius}px`}>
                        <input
                          type="range"
                          min="6"
                          max="28"
                          value={settings.radius}
                          onChange={(e) => updateSettings((s) => ({ ...s, radius: Number(e.target.value) }))}
                          className="mt-3 w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </FormField>

                      <FormField label="Section Spacing Rhythm">
                        <select
                          value={settings.sectionSpace}
                          onChange={(e) => updateSettings((s) => ({ ...s, sectionSpace: e.target.value }))}
                          className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2.5 text-xs text-[var(--fg)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                        >
                          <option value="clamp(4.5rem, 8vw, 6rem)">Compact (Closer spacing)</option>
                          <option value="clamp(6rem, 10vw, 8rem)">Balanced (Default rhythm)</option>
                          <option value="clamp(7.5rem, 13vw, 11rem)">Spacious (Breathing room)</option>
                        </select>
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ────────────────── VISITOR INBOX TAB ────────────────── */}
                {activeTab === "messages" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Visitor Inquiries</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Direct submissions from the contact form stored in browser storage
                        </p>
                      </div>
                      {messages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Clear all received messages?")) {
                              localStorage.removeItem(MESSAGES_KEY);
                              setMessages([]);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="size-3.5" /> Clear Inbox
                        </button>
                      )}
                    </div>

                    {messages.length === 0 ? (
                      <div className="grid place-items-center rounded-2xl border border-dashed border-[var(--hairline)] p-12 text-center">
                        <Mail className="size-8 text-[var(--muted)]/40 mb-2" />
                        <p className="text-xs font-medium text-[var(--fg)]">No messages yet</p>
                        <p className="text-[0.7rem] text-[var(--muted)] mt-0.5">
                          Submissions from the "Send Message" form on your site will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages
                          .slice()
                          .reverse()
                          .map((msg) => (
                            <div
                              key={msg.id}
                              className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-xs text-[var(--fg)]">{msg.name}</p>
                                  <a
                                    href={`mailto:${msg.email}`}
                                    className="text-[0.7rem] text-[var(--accent)] hover:underline"
                                  >
                                    {msg.email}
                                  </a>
                                </div>
                                <time className="font-mono text-[0.62rem] text-[var(--muted)]">
                                  {new Date(msg.sentAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </time>
                              </div>
                              <p className="rounded-lg bg-[var(--card)] p-3 text-xs leading-relaxed text-[var(--fg)]/85 whitespace-pre-wrap border border-[var(--hairline)]/50">
                                {msg.message}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
