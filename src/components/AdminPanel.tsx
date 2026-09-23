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
  type EnabledSections,
} from "../siteContext";
import { type Project, getFullWidthImageUrl } from "../data";
import { savePdf } from "../pdfStore";
import { compressImageFile } from "../storage";
import {
  uploadImageFileToDatabase,
  saveImageToCloud,
  type ContactMessage,
  subscribeToCloudMessages,
  deleteMessageFromCloud,
  clearAllMessagesFromCloud,
  loadMessagesFromCloud,
} from "../cloudStore";
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
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Palette,
  Loader2,
  LayoutTemplate,
  CheckCircle2,
  ArrowRight,
  Database,
  Cloud,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Layers,
  Lock,
  Key,
  ShieldCheck,
  LogOut,
} from "lucide-react";

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

const MESSAGES_KEY = "yogendra-portfolio-messages";
type Message = ContactMessage;

const readMessages = (): Message[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? "[]");
    return Array.isArray(stored)
      ? stored.map((m) => ({
          id: String(m.id ?? ""),
          name: String(m.name ?? ""),
          email: String(m.email ?? ""),
          message: String(m.message ?? ""),
          sentAt: String(m.sentAt ?? new Date().toISOString()),
        }))
      : [];
  } catch {
    return [];
  }
};

type TabKey =
  | "sections"
  | "projects"
  | "caseStudy"
  | "archive"
  | "hero"
  | "about"
  | "skills"
  | "capabilities"
  | "process"
  | "trainings"
  | "contact"
  | "appearance"
  | "database"
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

  const displaySrc = getFullWidthImageUrl(value) || (
    value?.startsWith("data:") || value?.startsWith("http")
      ? value
      : value
      ? `https://images.unsplash.com/photo-${value}?auto=format&fit=crop&w=400&q=80`
      : ""
  );

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

function SectionHeaderBar({
  sectionName,
  enabled,
  onToggleEnabled,
  title,
  onTitleChange,
  titleLabel = "Section Title",
  subtitle,
  onSubtitleChange,
  subtitleLabel = "Section Subheading",
  kicker,
  onKickerChange,
  kickerLabel = "Section Kicker",
  statusHint,
}: {
  sectionName: string;
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
  title: string;
  onTitleChange: (val: string) => void;
  titleLabel?: string;
  subtitle?: string;
  onSubtitleChange?: (val: string) => void;
  subtitleLabel?: string;
  kicker?: string;
  onKickerChange?: (val: string) => void;
  kickerLabel?: string;
  statusHint?: { enabled: string; disabled: string };
}) {
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4 mb-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`size-2.5 rounded-full transition-all ${
              enabled
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-105"
                : "bg-neutral-400 opacity-60"
            }`}
          />
          <div>
            <h4 className="text-xs font-bold text-[var(--fg)] tracking-tight">
              {sectionName} · Status &amp; Header
            </h4>
            <p className="text-[0.68rem] text-[var(--muted)]">
              {enabled
                ? statusHint?.enabled || "Visible to all visitors"
                : statusHint?.disabled || "Disabled & hidden"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleEnabled(!enabled)}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            enabled
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)] hover:text-[var(--fg)]"
          }`}
        >
          <span
            className={`size-2 rounded-full transition-transform ${
              enabled ? "bg-emerald-500" : "bg-neutral-400"
            }`}
          />
          <span>{enabled ? "Section Enabled" : "Section Disabled"}</span>
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {onKickerChange && (
          <div className="sm:col-span-2">
            <FormField label={kickerLabel} hint="Category pill or kicker above the heading">
              <TextInput
                value={kicker || ""}
                onChange={onKickerChange}
                placeholder="e.g. Selected Work, 02 / Capabilities"
              />
            </FormField>
          </div>
        )}

        <div className={onSubtitleChange ? "sm:col-span-1" : "sm:col-span-2"}>
          <FormField label={titleLabel} hint="Main display heading">
            <TextInput
              value={title}
              onChange={onTitleChange}
              placeholder="e.g. Work Gallery"
            />
          </FormField>
        </div>

        {onSubtitleChange && (
          <div className="sm:col-span-1">
            <FormField label={subtitleLabel} hint="Supporting description / sub-heading">
              <TextInput
                value={subtitle || ""}
                onChange={onSubtitleChange}
                placeholder="e.g. A selection of projects..."
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolIconUploader({
  icon,
  accent,
  toolName,
  onChangeIcon,
  onChangeAccent,
}: {
  icon: string;
  accent: string;
  toolName: string;
  onChangeIcon: (url: string) => void;
  onChangeAccent: (hex: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const POPULAR_PRESETS = [
    { name: "Figma", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg", accent: "#a259ff" },
    { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", accent: "#61dafb" },
    { name: "TypeScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", accent: "#3178c6" },
    { name: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg", accent: "#38bdf8" },
    { name: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", accent: "#ffffff" },
    { name: "Framer", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg", accent: "#0055ff" },
    { name: "Photoshop", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg", accent: "#31a8ff" },
    { name: "Illustrator", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg", accent: "#ff9a00" },
    { name: "Blender", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg", accent: "#ea7600" },
    { name: "Canva", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg", accent: "#52d8e5" },
    { name: "GitHub", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg", accent: "#f0f6fc" },
    { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", accent: "#339933" },
    { name: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", accent: "#3776ab" },
    { name: "Swift", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg", accent: "#f05138" },
  ];

  const handleFile = (file: File) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) onChangeIcon(String(reader.result));
      };
      reader.readAsDataURL(file);
      return;
    }
    compressImageFile(file, 256, 0.95)
      .then((url) => onChangeIcon(url))
      .catch(() => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) onChangeIcon(String(reader.result));
        };
        reader.readAsDataURL(file);
      });
  };

  return (
    <div className="space-y-2 pt-2 border-t border-[var(--hairline)]">
      <div className="flex items-center justify-between">
        <label className="text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
          Tool Icon &amp; Accent
        </label>
        <div className="flex items-center gap-1.5 text-[0.68rem]">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[var(--accent)] hover:underline cursor-pointer"
          >
            {showPresets ? "Hide presets" : "Quick presets"}
          </button>
          <span className="text-[var(--hairline)]">·</span>
          <button
            type="button"
            onClick={() => setShowUrlField(!showUrlField)}
            className="text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            {showUrlField ? "Hide URL" : "Paste URL"}
          </button>
        </div>
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--chip)]/60 border border-[var(--hairline)]">
          {POPULAR_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                onChangeIcon(p.url);
                onChangeAccent(p.accent);
                setShowPresets(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg)] border border-[var(--hairline)] text-[0.65rem] hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <img src={p.url} alt="" className="size-3.5 object-contain" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {/* Dropzone / Icon box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          title="Click to choose icon image file or drag & drop here"
          className={`relative size-12 shrink-0 cursor-pointer rounded-xl border flex items-center justify-center transition-all group overflow-hidden ${
            dragActive
              ? "border-[var(--accent)] bg-[var(--accent)]/15 scale-105"
              : "border-[var(--hairline)] bg-[var(--chip)] hover:border-[var(--accent)]/60"
          }`}
          style={{
            boxShadow: icon ? `0 0 14px ${accent}25` : undefined,
          }}
        >
          {icon ? (
            <img src={icon} alt={toolName} className="size-6 object-contain" />
          ) : (
            <ImageIcon className="size-5 text-[var(--muted)]/50" />
          )}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="size-3.5 text-white" />
          </div>
        </div>

        {/* Action buttons and Accent color */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--bg)] px-2.5 py-1.5 text-[0.72rem] font-medium text-[var(--fg)] hover:border-[var(--accent)] transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="size-3 text-[var(--accent)]" />
              Upload Icon Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />

            {/* Accent Color picker */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[0.65rem] text-[var(--muted)]">Glow:</span>
              <input
                type="color"
                value={accent}
                onChange={(e) => onChangeAccent(e.target.value)}
                title="Accent Glow Color"
                className="size-7 cursor-pointer rounded-lg border border-[var(--hairline)] bg-transparent p-0.5"
              />
            </div>
          </div>

          {showUrlField && (
            <TextInput
              value={icon}
              onChange={onChangeIcon}
              placeholder="Or paste direct icon image/SVG URL"
              className="text-[0.72rem] py-1.5"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Panel Component ─────────────────────────────────────────── */
export default function AdminPanel({ showTrigger = false }: { showTrigger?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("projects");
  const [messages, setMessages] = useState<Message[]>([]);
  const [saveBanner, setSaveBanner] = useState(false);
  const [expandedProjectIndex, setExpandedProjectIndex] = useState<number | null>(0);

  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("portfolio_admin_auth") === "true";
    } catch {
      return false;
    }
  });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);
  const [pendingProjectIdx, setPendingProjectIdx] = useState<number | null>(null);

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
    cloudStatus,
    syncAllToCloud,
    loadAllFromCloud,
  } = useSite();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [cloudToast, setCloudToast] = useState<string | null>(null);
  const [sectionsViewFilter, setSectionsViewFilter] = useState<"all" | "home" | "casestudy" | "archive">("all");

  const triggerCloudToast = (msg: string) => {
    setCloudToast(msg);
    setTimeout(() => setCloudToast(null), 3500);
  };

  const requestOpenAdmin = (tab?: TabKey, projectIndex?: number) => {
    if (tab) setActiveTab(tab);
    if (typeof projectIndex === "number") setExpandedProjectIndex(projectIndex);
    loadMessagesFromCloud().then((msgs) => setMessages(msgs)).catch(() => {});

    let authed = false;
    try {
      authed = sessionStorage.getItem("portfolio_admin_auth") === "true";
    } catch {
      authed = false;
    }

    if (authed) {
      setIsAuthenticated(true);
      setOpen(true);
    } else {
      if (tab) setPendingTab(tab);
      if (typeof projectIndex === "number") setPendingProjectIdx(projectIndex);
      setAuthError(null);
      setLoginPassword("");
      setAuthDialogOpen(true);
    }
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    // Security requirement: Username "zanewick" and Password "Zane@123"
    if (loginUsername === "zanewick" && loginPassword === "Zane@123") {
      try {
        sessionStorage.setItem("portfolio_admin_auth", "true");
      } catch {}
      setIsAuthenticated(true);
      setAuthDialogOpen(false);
      setAuthError(null);
      setLoginPassword("");

      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
      if (typeof pendingProjectIdx === "number") {
        setExpandedProjectIndex(pendingProjectIdx);
        setPendingProjectIdx(null);
      }
      setOpen(true);
    } else {
      setAuthError("Invalid username or password. Access denied.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("portfolio_admin_auth");
    } catch {}
    setIsAuthenticated(false);
    setOpen(false);
    setAuthDialogOpen(false);
    setLoginPassword("");
    setAuthError(null);
    triggerCloudToast("Admin session locked.");
  };

  const handleManualPushToCloud = async () => {
    setIsManualSyncing(true);
    try {
      await syncAllToCloud();
      triggerCloudToast("All projects & settings successfully saved to Cloud Database!");
    } catch {
      triggerCloudToast("Cloud sync failed. Changes remain safely cached in local storage.");
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleManualPullFromCloud = async () => {
    setIsManualSyncing(true);
    try {
      await loadAllFromCloud();
      triggerCloudToast("Successfully reloaded latest data from Cloud Database!");
    } catch {
      triggerCloudToast("Could not load from Cloud Database.");
    } finally {
      setIsManualSyncing(false);
    }
  };

  const showSaved = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const [uploadingProjectIdx, setUploadingProjectIdx] = useState<number | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const handleDeleteProject = (indexToDelete: number) => {
    const p = projects[indexToDelete];
    setConfirmDialog({
      title: `Delete "${p?.title || "Project"}"?`,
      message: `Are you sure you want to delete "${p?.title || "this project"}"? It will be removed from your live portfolio and database.`,
      confirmLabel: "Delete Project",
      isDestructive: true,
      onConfirm: () => {
        const remaining = projects.filter((_, i) => i !== indexToDelete);
        saveProjects(remaining);
        if (expandedProjectIndex === indexToDelete) {
          setExpandedProjectIndex(null);
        } else if (expandedProjectIndex !== null && expandedProjectIndex > indexToDelete) {
          setExpandedProjectIndex(expandedProjectIndex - 1);
        }
        showSaved();
        triggerCloudToast(`Deleted "${p?.title || "Project"}"`);
      },
    });
  };

  useEffect(() => {
    // Initial read from local cache
    setMessages(readMessages());

    // Subscribe to live Firestore collection
    const unsub = subscribeToCloudMessages((cloudMessages) => {
      setMessages(cloudMessages);
    });

    // Also listen to local events
    const updateMessages = () => setMessages(readMessages());
    window.addEventListener("portfolio-messages-updated", updateMessages);

    return () => {
      unsub();
      window.removeEventListener("portfolio-messages-updated", updateMessages);
    };
  }, []);

  useEffect(() => {
    const handleOpen = (e?: Event) => {
      const customEvent = e as CustomEvent<{ tab?: TabKey; projectIndex?: number }>;
      requestOpenAdmin(customEvent?.detail?.tab, customEvent?.detail?.projectIndex);
    };

    window.addEventListener("portfolio-open-admin", handleOpen);

    let lastAKeyTime = 0;
    const pressedKeys = new Set<string>();

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isInput) return;

      const key = e.key.toLowerCase();
      pressedKeys.add(key);

      const hasModifier = e.ctrlKey || e.metaKey;
      if (!hasModifier || !e.shiftKey) return;

      const now = Date.now();
      if (key === "a") {
        lastAKeyTime = now;
      }

      // Check if both A and D are held down together, or pressed in rapid succession while Ctrl/Cmd+Shift is held
      const bothHeld = pressedKeys.has("a") && (pressedKeys.has("d") || key === "d");
      const quickSequence = key === "d" && now - lastAKeyTime < 1500;

      if (bothHeld || quickSequence) {
        e.preventDefault();
        lastAKeyTime = 0;
        pressedKeys.clear();
        if (open) {
          setOpen(false);
        } else {
          requestOpenAdmin();
        }
      }
    };

    const onGlobalKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key.toLowerCase());
    };

    const onGlobalBlur = () => {
      pressedKeys.clear();
      lastAKeyTime = 0;
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    window.addEventListener("keyup", onGlobalKeyUp);
    window.addEventListener("blur", onGlobalBlur);

    // Also expose a convenient console helper for the administrator
    (window as unknown as { openAdmin?: () => void }).openAdmin = () => {
      requestOpenAdmin();
    };

    return () => {
      window.removeEventListener("portfolio-open-admin", handleOpen);
      window.removeEventListener("keydown", onGlobalKeyDown);
      window.removeEventListener("keyup", onGlobalKeyUp);
      window.removeEventListener("blur", onGlobalBlur);
    };
  }, [open, isAuthenticated]);

  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const activeBtn = document.getElementById(`mobile-tab-${activeTab}`);
    if (activeBtn && mobileNavRef.current) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab, open]);

  useEffect(() => {
    if (!open && !authDialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (authDialogOpen) {
          setAuthDialogOpen(false);
          setAuthError(null);
          setLoginPassword("");
        } else if (open) {
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, authDialogOpen]);

  // Image upload helper with automatic optimization and direct cloud database persistence
  const handleFileUpload = async (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file) return;
    try {
      setUploadProgressText("Saving to database…");
      const { dataUrl } = await uploadImageFileToDatabase(file);
      onSuccess(dataUrl);
      showSaved();
    } catch {
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = String(reader.result);
        await saveImageToCloud(raw);
        onSuccess(raw);
        showSaved();
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadProgressText("");
    }
  };

  const handleBatchFilesUpload = async (
    files: FileList | null,
    projectIndex: number,
    onSuccess: (dataUrls: string[]) => void
  ) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!fileArray.length) return;

    setUploadingProjectIdx(projectIndex);
    const urls: string[] = [];
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgressText(`Uploading ${i + 1}/${fileArray.length} to database…`);
      try {
        const { dataUrl } = await uploadImageFileToDatabase(file, 2200, 0.88);
        urls.push(dataUrl);
      } catch {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });
        await saveImageToCloud(dataUrl);
        urls.push(dataUrl);
      }
    }
    onSuccess(urls);
    setUploadingProjectIdx(null);
    setUploadProgressText("");
    showSaved();
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
      group: "CONTENT & STRUCTURE",
      tabs: [
        { key: "sections" as TabKey, label: "Sections & Visibility", icon: LayoutTemplate },
        { key: "projects" as TabKey, label: "Projects & Work", icon: FolderGit2, count: projects.length },
        { key: "caseStudy" as TabKey, label: "Case Study Detail", icon: FileText },
        { key: "archive" as TabKey, label: "Archive & Listing", icon: Eye },
        { key: "hero" as TabKey, label: "Hero Banner", icon: Sparkles },
        { key: "about" as TabKey, label: "About Me", icon: User },
        { key: "skills" as TabKey, label: "Toolkit & Skills", icon: Cpu },
        { key: "capabilities" as TabKey, label: "Capabilities", icon: Zap },
        { key: "process" as TabKey, label: "Design Process", icon: Compass },
        { key: "trainings" as TabKey, label: "Trainings & Certs", icon: GraduationCap },
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
      group: "PREFERENCES & STORAGE",
      tabs: [
        { key: "appearance" as TabKey, label: "Theme & Styling", icon: Palette },
        { key: "database" as TabKey, label: "Cloud Database", icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* ─── INCONSPICUOUS TRIGGER: JUST A TINY INNOCUOUS DOT ──────────────── */}
      {showTrigger && (
        <button
          type="button"
          onClick={() => {
            requestOpenAdmin();
          }}
          className="group inline-flex size-3.5 items-center justify-center rounded-full text-[var(--muted)]/40 hover:text-[var(--fg)]/80 transition-colors focus:outline-none"
          aria-label="."
        >
          <span className="size-1 rounded-full bg-current transition-transform duration-200 group-hover:scale-150" />
        </button>
      )}

      {/* ─── SECURITY AUTHENTICATION MODAL ──────────────────────────────────── */}
      {authDialogOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={() => {
            setAuthDialogOpen(false);
            setAuthError(null);
            setLoginPassword("");
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Studio Security Authentication"
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--card)] shadow-[0_24px_80px_rgba(0,0,0,0.7)] text-[var(--fg)] animate-in zoom-in-95 duration-150"
          >
            {/* Top Accent Gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />

            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--chip)] text-[var(--accent)] border border-[var(--hairline)] shadow-inner">
                  <Lock className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold tracking-tight text-[var(--fg)] sm:text-base">
                      Studio Security
                    </h3>
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 font-mono text-[0.62rem] text-amber-500 font-semibold">
                      Protected
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--muted)] mt-0.5">
                    Enter credentials to open Portfolio Studio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthDialogOpen(false);
                  setAuthError(null);
                  setLoginPassword("");
                }}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="p-5 pt-2 space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--fg)]">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter username"
                    className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--fg)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3.5 py-2.5 pr-10 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500 animate-in fade-in duration-150">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthDialogOpen(false);
                    setAuthError(null);
                    setLoginPassword("");
                  }}
                  className="rounded-xl border border-[var(--hairline)] px-3.5 py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  <Key className="size-3.5" />
                  <span>Unlock Studio</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ─── STUDIO MODAL OVERLAY ──────────────────────────────────────────── */}
      {open && isAuthenticated && (
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
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--hairline)] bg-[var(--card)] px-5 py-3 sm:px-6">
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
                    Real-time visual editor &amp; Cloud Firestore synced
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Cloud Database Status Badge */}
                <button
                  type="button"
                  onClick={() => setActiveTab("database")}
                  title="Click to view Cloud Database details"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--chip)]/60 px-2.5 py-1 font-mono text-[0.68rem] text-[var(--fg)] hover:bg-[var(--chip)] transition-colors"
                >
                  {cloudStatus.status === "syncing" ? (
                    <>
                      <Loader2 className="size-3 animate-spin text-[var(--accent)]" />
                      <span className="text-[var(--accent)]">Syncing DB…</span>
                    </>
                  ) : cloudStatus.status === "error" ? (
                    <>
                      <AlertCircle className="size-3 text-amber-400" />
                      <span className="text-amber-400">DB Offline</span>
                    </>
                  ) : (
                    <>
                      <Database className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Cloud DB Active</span>
                    </>
                  )}
                </button>

                {/* Quick Cloud Save Button */}
                <button
                  type="button"
                  onClick={handleManualPushToCloud}
                  disabled={isManualSyncing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--chip)] px-2.5 py-1 text-xs font-medium text-[var(--fg)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-50 transition-colors"
                  title="Force push all content and projects to Cloud Firestore database"
                >
                  {isManualSyncing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Cloud className="size-3.5" />
                  )}
                  <span className="hidden md:inline">Sync Cloud</span>
                </button>

                {saveBanner && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs text-emerald-400 animate-in fade-in duration-150">
                    <Check className="size-3.5" /> Saved
                  </span>
                )}

                {/* Lock / Log Out Session Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--chip)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                  title="Lock admin session and log out"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Cloud Toast Notification */}
            {cloudToast && (
              <div className="bg-[var(--accent)]/15 border-b border-[var(--accent)]/30 px-4 py-2 text-center text-xs font-medium text-[var(--accent)] flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{cloudToast}</span>
              </div>
            )}

            {/* Main Area: Sidebar + Content */}
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              {/* ─── Mobile Navigation Header (< md) ─────────────────────────── */}
              <div className="flex shrink-0 flex-col border-b border-[var(--hairline)] bg-[var(--bg)]/80 p-2.5 md:hidden gap-2">
                {/* 1. Quick Dropdown Selector for 1-Tap Tab Switching */}
                <div className="relative w-full">
                  <select
                    id="mobile-admin-tab-select"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as TabKey)}
                    className="w-full appearance-none rounded-xl border border-[var(--hairline)] bg-[var(--chip)] py-2 pl-3.5 pr-9 text-xs font-semibold text-[var(--fg)] shadow-xs focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                    aria-label="Select studio section"
                  >
                    {navigationSections.map((sec) => (
                      <optgroup key={sec.group} label={sec.group} className="bg-[var(--card)] text-[var(--fg)] font-semibold">
                        {sec.tabs.map((t) => (
                          <option key={t.key} value={t.key} className="bg-[var(--card)] text-[var(--fg)]">
                            {t.label} {t.count !== undefined ? `(${t.count})` : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted)]" />
                </div>

                {/* 2. Horizontally Scrollable Pills (No overlapping, shrink-0, smooth scroll) */}
                <div
                  ref={mobileNavRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5"
                >
                  {navigationSections.flatMap((sec) => sec.tabs).map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <button
                        id={`mobile-tab-${tab.key}`}
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                          active
                            ? "bg-[var(--chip)] text-[var(--fg)] border-[var(--accent)]/60 shadow-xs font-semibold"
                            : "bg-[var(--chip)]/30 text-[var(--muted)] border-[var(--hairline)]/60 hover:bg-[var(--chip)] hover:text-[var(--fg)]"
                        }`}
                      >
                        <Icon className={`size-3.5 shrink-0 transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 font-mono text-[0.6rem] ${
                              active
                                ? "bg-[var(--accent)]/20 text-[var(--accent)] font-semibold"
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

              {/* ─── Desktop Sidebar Navigation (>= md) ───────────────────────── */}
              <nav className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:border-[var(--hairline)] md:bg-[var(--bg)]/60 md:p-3">
                <div className="flex flex-col gap-4 w-full">
                  {navigationSections.map((sec) => (
                    <div key={sec.group} className="space-y-1 w-full">
                      <p className="px-2.5 pt-1.5 pb-1 font-mono text-[0.62rem] font-semibold tracking-wider text-[var(--muted)]/50 uppercase">
                        {sec.group}
                      </p>
                      <div className="flex flex-col gap-1">
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
                <div className="mt-auto pt-4 border-t border-[var(--hairline)]">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        title: "Reset All Site Defaults?",
                        message: "This will reset all site text, styling, and case studies back to original defaults. Any customizations will be replaced.",
                        confirmLabel: "Reset Everything",
                        isDestructive: true,
                        onConfirm: () => {
                          resetConfig();
                          resetSettings();
                          resetProjects();
                          showSaved();
                          triggerCloudToast("Reset all site defaults successfully!");
                        },
                      });
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.7rem] font-medium text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    Reset All Defaults
                  </button>
                </div>
              </nav>

              {/* Tab Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-7">
                {/* ────────────────── SECTIONS & VISIBILITY TAB ────────────────── */}
                {activeTab === "sections" && (() => {
                  const homeSectionsActive = [
                    settings?.sections?.hero !== false,
                    settings?.sections?.work !== false,
                    settings?.sections?.capabilities !== false,
                    settings?.sections?.process !== false,
                    settings?.sections?.about !== false,
                    settings?.sections?.trainings !== false,
                    settings?.sections?.skills !== false,
                    settings?.sections?.contact !== false,
                  ].filter(Boolean).length;

                  const caseStudySectionsActive = [
                    settings?.sections?.caseStudyTopBar !== false,
                    settings?.sections?.caseStudyBadge !== false,
                    settings?.sections?.caseStudyDescription !== false,
                    settings?.sections?.caseStudyMetaChips !== false,
                    settings?.sections?.caseStudyPdfButton !== false,
                    settings?.sections?.caseStudyPlates !== false,
                    settings?.sections?.caseStudyNextProject !== false,
                    settings?.sections?.caseStudyBottomNav !== false,
                  ].filter(Boolean).length;

                  const archiveSectionsActive = [
                    settings?.sections?.archiveListing !== false,
                    settings?.sections?.archiveExplorations !== false && settings?.sections?.beyondTheBrief !== false,
                    settings?.sections?.archiveCta !== false,
                  ].filter(Boolean).length;

                  const totalActive = homeSectionsActive + caseStudySectionsActive + archiveSectionsActive;

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--hairline)] pb-4">
                        <div>
                          <h3 className="font-display text-base font-bold text-[var(--fg)]">Sections &amp; Page Visibility</h3>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            Enable or disable sections across your entire portfolio, case studies, and listing archive, and customize all headings and subheadings.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateSettings((s) => ({
                                ...s,
                                sections: {
                                  hero: true,
                                  work: true,
                                  capabilities: true,
                                  process: true,
                                  about: true,
                                  trainings: true,
                                  skills: true,
                                  contact: true,
                                  archiveListing: true,
                                  archiveExplorations: true,
                                  archiveCta: true,
                                  caseStudyTopBar: true,
                                  caseStudyBadge: true,
                                  caseStudyDescription: true,
                                  caseStudyMetaChips: true,
                                  caseStudyPdfButton: true,
                                  caseStudyPlates: true,
                                  caseStudyNextProject: true,
                                  caseStudyBottomNav: true,
                                },
                              }));
                              showSaved();
                              triggerCloudToast("All sections across the site enabled!");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-500" /> Enable All Everywhere
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                title: "Reset All Section Visibility?",
                                message: "This will re-enable all sections across the Homepage, Case Studies, and Archive to their default visible states.",
                                confirmLabel: "Enable All",
                                isDestructive: false,
                                onConfirm: () => {
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      hero: true,
                                      work: true,
                                      capabilities: true,
                                      process: true,
                                      about: true,
                                      trainings: true,
                                      skills: true,
                                      contact: true,
                                      archiveListing: true,
                                      archiveExplorations: true,
                                      archiveCta: true,
                                      caseStudyTopBar: true,
                                      caseStudyBadge: true,
                                      caseStudyDescription: true,
                                      caseStudyMetaChips: true,
                                      caseStudyPdfButton: true,
                                      caseStudyPlates: true,
                                      caseStudyNextProject: true,
                                      caseStudyBottomNav: true,
                                    },
                                  }));
                                  showSaved();
                                  triggerCloudToast("All sections restored!");
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-3.5" /> Reset
                          </button>
                        </div>
                      </div>

                      {/* Summary & View Filter Pills */}
                      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/30 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-sm">
                              {totalActive} / 19
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-[var(--fg)]">
                                {totalActive} Total Sections Currently Active
                              </span>
                              <p className="text-[0.68rem] text-[var(--muted)]">
                                Homepage ({homeSectionsActive}/8) · Case Study ({caseStudySectionsActive}/8) · Archive ({archiveSectionsActive}/3)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--hairline)]">
                          <button
                            type="button"
                            onClick={() => setSectionsViewFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              sectionsViewFilter === "all"
                                ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                                : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--hairline)]"
                            }`}
                          >
                            All Sections ({totalActive}/19)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSectionsViewFilter("home")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              sectionsViewFilter === "home"
                                ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                                : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--hairline)]"
                            }`}
                          >
                            Homepage ({homeSectionsActive}/8)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSectionsViewFilter("casestudy")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              sectionsViewFilter === "casestudy"
                                ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                                : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--hairline)]"
                            }`}
                          >
                            Case Study Detail ({caseStudySectionsActive}/8)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSectionsViewFilter("archive")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              sectionsViewFilter === "archive"
                                ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                                : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--hairline)]"
                            }`}
                          >
                            Project Listing &amp; Archive ({archiveSectionsActive}/3)
                          </button>
                        </div>
                      </div>

                      {/* ────────────────── 1. HOMEPAGE SECTIONS ────────────────── */}
                      {(sectionsViewFilter === "all" || sectionsViewFilter === "home") && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-[var(--accent)]" />
                              <h4 className="font-display text-sm font-bold text-[var(--fg)] uppercase tracking-wider">
                                Homepage Sections ({homeSectionsActive}/8 Active)
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    hero: true,
                                    work: true,
                                    capabilities: true,
                                    process: true,
                                    about: true,
                                    trainings: true,
                                    skills: true,
                                    contact: true,
                                  },
                                }));
                                showSaved();
                              }}
                              className="text-xs text-[var(--accent)] hover:underline cursor-pointer"
                            >
                              Enable All Home
                            </button>
                          </div>

                          <SectionHeaderBar
                            sectionName="1. Hero Banner"
                            enabled={settings?.sections?.hero !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, hero: next } }))}
                            title={config.hero.marqueeName}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, marqueeName: val } }))}
                            titleLabel="Marquee Headline / Name"
                            subtitle={config.hero.tagline}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, tagline: val } }))}
                            subtitleLabel="Tagline / Subheading"
                            kicker={config.hero.availableBadge}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, availableBadge: val } }))}
                            kickerLabel="Availability Badge / Kicker"
                          />

                          <SectionHeaderBar
                            sectionName="2. Selected Work Gallery"
                            enabled={settings?.sections?.work !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, work: next } }))}
                            title={config.work?.title || "Work Gallery"}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), title: val } }))}
                            titleLabel="Section Title"
                            subtitle={config.work?.subtitle || ""}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), subtitle: val } }))}
                            subtitleLabel="Section Subheading"
                            kicker={config.work?.kicker || "Selected Work"}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), kicker: val } }))}
                            kickerLabel="Category Tag / Kicker"
                          />

                          <SectionHeaderBar
                            sectionName="3. Capabilities & Disciplines"
                            enabled={settings?.sections?.capabilities !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, capabilities: next } }))}
                            title={config.capabilities.title}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, title: val } }))}
                            subtitle={config.capabilities.subtitle}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, subtitle: val } }))}
                            kicker={config.capabilities.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, kicker: val } }))}
                          />

                          <SectionHeaderBar
                            sectionName="4. Design Process"
                            enabled={settings?.sections?.process !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, process: next } }))}
                            title={config.process.title}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, title: val } }))}
                            subtitle={config.process.subtitle}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, subtitle: val } }))}
                            kicker={config.process.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, kicker: val } }))}
                          />

                          <SectionHeaderBar
                            sectionName="5. About Me"
                            enabled={settings?.sections?.about !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, about: next } }))}
                            title={config.about.title}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, title: val } }))}
                            titleLabel="Headline / Title"
                            subtitle={config.about.subtitle || ""}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, subtitle: val } }))}
                            subtitleLabel="Subheading"
                            kicker={config.about.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, kicker: val } }))}
                          />

                          <SectionHeaderBar
                            sectionName="6. Trainings & Experience"
                            enabled={settings?.sections?.trainings !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, trainings: next } }))}
                            title={config.trainings.title}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, title: val } }))}
                            subtitle={config.trainings.subtitle}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, subtitle: val } }))}
                            kicker={config.trainings.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, kicker: val } }))}
                          />

                          <SectionHeaderBar
                            sectionName="7. Toolkit & Skills"
                            enabled={settings?.sections?.skills !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, skills: next } }))}
                            title={config.skills.title}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, title: val } }))}
                            subtitle={config.skills.subtitle}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, subtitle: val } }))}
                            kicker={config.skills.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, kicker: val } }))}
                          />

                          <SectionHeaderBar
                            sectionName="8. Contact & Footer"
                            enabled={settings?.sections?.contact !== false}
                            onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, contact: next } }))}
                            title={config.contact.titleLines.join(" ")}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, titleLines: val.split(/\s+/) } }))}
                            titleLabel="Call to Action Title"
                            subtitle={config.contact.subtitleHeadline}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, subtitleHeadline: val } }))}
                            subtitleLabel="Subheading Headline"
                            kicker={config.contact.kicker}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, kicker: val } }))}
                          />
                        </div>
                      )}

                      {/* ────────────────── 2. CASE STUDY DETAIL SECTIONS ────────────────── */}
                      {(sectionsViewFilter === "all" || sectionsViewFilter === "casestudy") && (
                        <div className="space-y-4 pt-4 border-t border-[var(--hairline)]">
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-blue-500" />
                              <div>
                                <h4 className="font-display text-sm font-bold text-[var(--fg)] uppercase tracking-wider">
                                  Case Study Detail Page Sections ({caseStudySectionsActive}/8 Active)
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Controls visibility and customize microcopy across individual project presentations
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    caseStudyTopBar: true,
                                    caseStudyBadge: true,
                                    caseStudyDescription: true,
                                    caseStudyMetaChips: true,
                                    caseStudyPdfButton: true,
                                    caseStudyPlates: true,
                                    caseStudyNextProject: true,
                                    caseStudyBottomNav: true,
                                  },
                                }));
                                showSaved();
                              }}
                              className="text-xs text-[var(--accent)] hover:underline cursor-pointer"
                            >
                              Enable All Case Study
                            </button>
                          </div>

                          {/* CS 1. Top Bar */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--fg)]">
                                  1. Sticky Top Reading &amp; Controls Bar
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Sticky navigation bar showing back link, reading progress, and quick share action
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      ...s.sections,
                                      caseStudyTopBar: s.sections?.caseStudyTopBar === false,
                                    },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                  settings?.sections?.caseStudyTopBar !== false
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                                }`}
                              >
                                <span>{settings?.sections?.caseStudyTopBar !== false ? "Visible on Case Studies" : "Disabled & Hidden"}</span>
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <FormField label="Back Button Label" hint="Top left return link">
                                <TextInput
                                  value={config.caseStudy?.backButtonLabel || "Back to Projects"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), backButtonLabel: val } }))}
                                  placeholder="Back to Projects"
                                />
                              </FormField>
                              <FormField label="Share Button Label" hint="Top right button">
                                <TextInput
                                  value={config.caseStudy?.shareLabel || "Share"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), shareLabel: val } }))}
                                  placeholder="Share"
                                />
                              </FormField>
                              <FormField label="Copied Notification Label" hint="Shown on link copy">
                                <TextInput
                                  value={config.caseStudy?.copiedLabel || "Copied"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), copiedLabel: val } }))}
                                  placeholder="Copied"
                                />
                              </FormField>
                            </div>
                          </div>

                          {/* CS 2. Discipline Badge */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-[var(--fg)]">
                                2. Discipline &amp; Category Badge
                              </h4>
                              <p className="text-[0.68rem] text-[var(--muted)]">
                                Displays the discipline pill above project title (e.g. &quot;Product Design · UI/UX&quot;)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    caseStudyBadge: s.sections?.caseStudyBadge === false,
                                  },
                                }))
                              }
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                settings?.sections?.caseStudyBadge !== false
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                              }`}
                            >
                              <span>{settings?.sections?.caseStudyBadge !== false ? "Visible" : "Hidden"}</span>
                            </button>
                          </div>

                          {/* CS 3. Project Description */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-[var(--fg)]">
                                3. Project Executive Summary / Overview
                              </h4>
                              <p className="text-[0.68rem] text-[var(--muted)]">
                                Primary descriptive paragraph outlining problem, solution, and outcomes below title
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    caseStudyDescription: s.sections?.caseStudyDescription === false,
                                  },
                                }))
                              }
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                settings?.sections?.caseStudyDescription !== false
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                              }`}
                            >
                              <span>{settings?.sections?.caseStudyDescription !== false ? "Visible" : "Hidden"}</span>
                            </button>
                          </div>

                          {/* CS 4. Metadata Chips */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-[var(--fg)]">
                                4. Metadata Chips &amp; Tools Stack
                              </h4>
                              <p className="text-[0.68rem] text-[var(--muted)]">
                                Visual asset count indicator and technology tool icons (Figma, React, Tailwind, etc.)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    caseStudyMetaChips: s.sections?.caseStudyMetaChips === false,
                                  },
                                }))
                              }
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                settings?.sections?.caseStudyMetaChips !== false
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                              }`}
                            >
                              <span>{settings?.sections?.caseStudyMetaChips !== false ? "Visible" : "Hidden"}</span>
                            </button>
                          </div>

                          {/* CS 5. PDF Presentation Button */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--fg)]">
                                  5. PDF Presentation Button
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Direct link button to view external deck or pitch document when PDF URL is provided
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      ...s.sections,
                                      caseStudyPdfButton: s.sections?.caseStudyPdfButton === false,
                                    },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                  settings?.sections?.caseStudyPdfButton !== false
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                                }`}
                              >
                                <span>{settings?.sections?.caseStudyPdfButton !== false ? "Visible when PDF exists" : "Disabled"}</span>
                              </button>
                            </div>

                            <FormField label="PDF Action Button Label" hint="Text on presentation button">
                              <TextInput
                                value={config.caseStudy?.pdfButtonLabel || "View PDF Presentation"}
                                onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), pdfButtonLabel: val } }))}
                                placeholder="View PDF Presentation"
                              />
                            </FormField>
                          </div>

                          {/* CS 6. High-Res Visual Plates */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--fg)]">
                                  6. High-Res Visual Plates Stream
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Full-bleed sequential visual gallery displaying mockups, screens, and design artifacts
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      ...s.sections,
                                      caseStudyPlates: s.sections?.caseStudyPlates === false,
                                    },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                  settings?.sections?.caseStudyPlates !== false
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                                }`}
                              >
                                <span>{settings?.sections?.caseStudyPlates !== false ? "Visible" : "Hidden"}</span>
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <FormField label="Plate Label Prefix" hint="e.g. PLATE #">
                                <TextInput
                                  value={config.caseStudy?.plateLabelPrefix || "PLATE #"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), plateLabelPrefix: val } }))}
                                  placeholder="PLATE #"
                                />
                              </FormField>
                              <FormField label="Fullscreen Hint Text" hint="Under plate number">
                                <TextInput
                                  value={config.caseStudy?.plateExpandHint || "Click to expand in fullscreen"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), plateExpandHint: val } }))}
                                  placeholder="Click to expand in fullscreen"
                                />
                              </FormField>
                              <FormField label="Expand Button Label" hint="Interactive pill button">
                                <TextInput
                                  value={config.caseStudy?.expandButtonLabel || "Expand"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), expandButtonLabel: val } }))}
                                  placeholder="Expand"
                                />
                              </FormField>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-[var(--hairline)]">
                              <FormField label="Empty State Heading" hint="Shown when no images uploaded">
                                <TextInput
                                  value={config.caseStudy?.emptyTitle || "No case study visuals uploaded yet."}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), emptyTitle: val } }))}
                                  placeholder="No case study visuals uploaded yet."
                                />
                              </FormField>
                              <FormField label="Empty State Action Button">
                                <TextInput
                                  value={config.caseStudy?.emptyButtonLabel || "Open Admin Panel to Upload Visuals"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), emptyButtonLabel: val } }))}
                                  placeholder="Open Admin Panel to Upload Visuals"
                                />
                              </FormField>
                            </div>
                          </div>

                          {/* CS 7. Next Project Banner */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--fg)]">
                                  7. Next Project &quot;Up Next&quot; Banner
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Footer card inviting viewers to effortlessly continue reading the next case study
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      ...s.sections,
                                      caseStudyNextProject: s.sections?.caseStudyNextProject === false,
                                    },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                  settings?.sections?.caseStudyNextProject !== false
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                                }`}
                              >
                                <span>{settings?.sections?.caseStudyNextProject !== false ? "Visible" : "Hidden"}</span>
                              </button>
                            </div>

                            <FormField label="Next Project Kicker / Eyebrow">
                              <TextInput
                                value={config.caseStudy?.nextProjectKicker || "Next Case Study →"}
                                onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), nextProjectKicker: val } }))}
                                placeholder="Next Case Study →"
                              />
                            </FormField>
                          </div>

                          {/* CS 8. Bottom Navigation */}
                          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/35 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--fg)]">
                                  8. Bottom Navigation Actions
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Return to archive directory and smooth scroll back to top buttons
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    sections: {
                                      ...s.sections,
                                      caseStudyBottomNav: s.sections?.caseStudyBottomNav === false,
                                    },
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                  settings?.sections?.caseStudyBottomNav !== false
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--hairline)]"
                                }`}
                              >
                                <span>{settings?.sections?.caseStudyBottomNav !== false ? "Visible" : "Hidden"}</span>
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <FormField label="Back to Projects Label">
                                <TextInput
                                  value={config.caseStudy?.bottomReturnLabel || "Back to all projects"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), bottomReturnLabel: val } }))}
                                  placeholder="Back to all projects"
                                />
                              </FormField>
                              <FormField label="Back to Top Label">
                                <TextInput
                                  value={config.caseStudy?.backToTopLabel || "Back to top"}
                                  onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), backToTopLabel: val } }))}
                                  placeholder="Back to top"
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ────────────────── 3. PROJECT LISTING & ARCHIVE SECTIONS ────────────────── */}
                      {(sectionsViewFilter === "all" || sectionsViewFilter === "archive") && (
                        <div className="space-y-4 pt-4 border-t border-[var(--hairline)]">
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-purple-500" />
                              <div>
                                <h4 className="font-display text-sm font-bold text-[var(--fg)] uppercase tracking-wider">
                                  Project Listing &amp; Archive Page Sections ({archiveSectionsActive}/3 Active)
                                </h4>
                                <p className="text-[0.68rem] text-[var(--muted)]">
                                  Controls visibility and customize headings/subheadings on the standalone Archive page
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateSettings((s) => ({
                                  ...s,
                                  sections: {
                                    ...s.sections,
                                    archiveListing: true,
                                    archiveExplorations: true,
                                    beyondTheBrief: true,
                                    archiveCta: true,
                                  },
                                }));
                                updateConfig((c) => ({
                                  ...c,
                                  projectsArchive: {
                                    ...(c.projectsArchive || {}),
                                    showArchiveListing: true,
                                    showExplorations: true,
                                    showCta: true,
                                  },
                                }));
                                showSaved();
                              }}
                              className="text-xs text-[var(--accent)] hover:underline cursor-pointer"
                            >
                              Enable All Archive
                            </button>
                          </div>

                          {/* Archive 1: Main Listing Grid */}
                          <SectionHeaderBar
                            sectionName="1. Archive / Case Studies Directory"
                            enabled={settings?.sections?.archiveListing !== false}
                            onToggleEnabled={(next) => {
                              updateSettings((s) => ({ ...s, sections: { ...s.sections, archiveListing: next } }));
                              updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), showArchiveListing: next } }));
                            }}
                            title={config.projectsArchive?.archiveTitle || "ARCHIVE / 01"}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveTitle: val } }))}
                            titleLabel="Archive Main Heading"
                            subtitle={config.projectsArchive?.archiveSubtitle || "A comprehensive catalogue of commercial UI/UX designs, web platforms, and design engineering artifacts."}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveSubtitle: val } }))}
                            subtitleLabel="Archive Subheading"
                            kicker={config.projectsArchive?.archiveKicker || "Index & Directory"}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveKicker: val } }))}
                            kickerLabel="Kicker / Eyebrow Badge"
                            statusHint={{ enabled: "Visible on Archive page", disabled: "Hidden from Archive page" }}
                          />

                          <div className="grid gap-3 sm:grid-cols-2 -mt-2 mb-4 px-1">
                            <FormField label="Archive Back Button Label">
                              <TextInput
                                value={config.projectsArchive?.archiveBackButton || "Back to Overview"}
                                onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveBackButton: val } }))}
                                placeholder="Back to Overview"
                              />
                            </FormField>
                            <FormField label="Count Suffix Label">
                              <TextInput
                                value={config.projectsArchive?.archiveCountSuffix || "Selected Artifacts"}
                                onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveCountSuffix: val } }))}
                                placeholder="Selected Artifacts"
                              />
                            </FormField>
                          </div>

                          {/* Archive 2: Digital Explorations Grid */}
                          <SectionHeaderBar
                            sectionName="2. Beyond the Brief / Digital Explorations"
                            enabled={settings?.sections?.beyondTheBrief !== false && settings?.sections?.archiveExplorations !== false}
                            onToggleEnabled={(next) => {
                              updateSettings((s) => ({
                                ...s,
                                sections: {
                                  ...s.sections,
                                  archiveExplorations: next,
                                  beyondTheBrief: next,
                                },
                              }));
                              updateConfig((c) => ({
                                ...c,
                                projectsArchive: {
                                  ...(c.projectsArchive || {}),
                                  showExplorations: next,
                                },
                              }));
                            }}
                            title={config.projectsArchive?.explorationsTitle || "Digital Explorations & Visual Studies"}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsTitle: val } }))}
                            titleLabel="Explorations Heading"
                            subtitle={config.projectsArchive?.explorationsSubtitle || "Unpublished prototypes, interaction loops, and spatial user interface experiments created during R&D explorations."}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsSubtitle: val } }))}
                            subtitleLabel="Explorations Subheading"
                            kicker={config.projectsArchive?.explorationsKicker || "Experimental · 02"}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsKicker: val } }))}
                            kickerLabel="Explorations Kicker"
                            statusHint={{ enabled: "Visible on Archive page", disabled: "Hidden from Archive page" }}
                          />

                          {/* Archive 3: Bottom Collaboration CTA */}
                          <SectionHeaderBar
                            sectionName="3. Collaboration Call to Action"
                            enabled={settings?.sections?.archiveCta !== false}
                            onToggleEnabled={(next) => {
                              updateSettings((s) => ({ ...s, sections: { ...s.sections, archiveCta: next } }));
                              updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), showCta: next } }));
                            }}
                            title={config.projectsArchive?.ctaHeading || "Interested in collaborating?"}
                            onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaHeading: val } }))}
                            titleLabel="CTA Display Heading"
                            subtitle={config.projectsArchive?.ctaDescription || "Let's talk about product design, systems, or new opportunities."}
                            onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaDescription: val } }))}
                            subtitleLabel="CTA Description / Subtitle"
                            kicker={config.projectsArchive?.ctaKicker || "Get in touch"}
                            onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaKicker: val } }))}
                            kickerLabel="CTA Kicker / Eyebrow"
                            statusHint={{ enabled: "Visible at bottom of Archive", disabled: "Hidden from Archive page" }}
                          />

                          <div className="grid gap-3 sm:grid-cols-2 -mt-2 mb-4 px-1">
                            <FormField label="CTA Action Button Label">
                              <TextInput
                                value={config.projectsArchive?.ctaButtonLabel || "Start a Conversation"}
                                onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaButtonLabel: val } }))}
                                placeholder="Start a Conversation"
                              />
                            </FormField>
                            <FormField label="CTA Action Button Link / URL">
                              <TextInput
                                value={config.projectsArchive?.ctaButtonLink || "mailto:yogendrachaudhary1011@gmail.com"}
                                onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaButtonLink: val } }))}
                                placeholder="mailto:... or https://..."
                              />
                            </FormField>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ────────────────── PROJECTS TAB ────────────────── */}
                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <SectionHeaderBar
                      sectionName="Selected Work Gallery"
                      enabled={settings?.sections?.work !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, work: next } }))}
                      title={config.work?.title || "Work Gallery"}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), title: val } }))}
                      titleLabel="Section Title"
                      subtitle={config.work?.subtitle || ""}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), subtitle: val } }))}
                      subtitleLabel="Section Subheading"
                      kicker={config.work?.kicker || "Selected Work"}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, work: { ...(c.work || {}), kicker: val } }))}
                      kickerLabel="Category Tag / Kicker"
                    />

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
                            setConfirmDialog({
                              title: "Reset Projects to Defaults?",
                              message: "This will restore the original default case studies. Any newly added or customized projects will be replaced.",
                              confirmLabel: "Reset Projects",
                              isDestructive: true,
                              onConfirm: () => {
                                resetProjects();
                                setExpandedProjectIndex(null);
                                showSaved();
                                triggerCloudToast("Projects restored to default case studies!");
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-[var(--hairline)] px-3 py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--chip)] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="size-3" /> Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {projects.map((project, index) => {
                        if (!project) return null;
                        const isExpanded = expandedProjectIndex === index;
                        return (
                          <div
                            key={`${project.title || "project"}-${index}`}
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
                                  onClick={() => handleDeleteProject(index)}
                                  className="grid size-7 place-items-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                                      value={project.title ?? ""}
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
                                    value={project.desc ?? ""}
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

                                {/* Case Study Full-Width Images (Infinite Top-to-Bottom) */}
                                <div className="mt-4 rounded-xl border border-[var(--hairline)] bg-[var(--bg-2)] p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="text-xs font-semibold text-[var(--fg)] flex items-center gap-1.5">
                                        <ImageIcon className="size-3.5 text-[var(--accent)]" />
                                        Case Study Full-Width Images
                                      </h4>
                                      <p className="text-[0.65rem] text-[var(--muted)]">
                                        Images display top-to-bottom with full width and no height boundaries
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-[var(--chip)] px-2.5 py-0.5 text-[0.65rem] font-medium text-[var(--fg)]">
                                      {(project.media?.length ?? (project.thumbnail || project.image ? 1 : 0))} images
                                    </span>
                                  </div>

                                  {/* Multi-upload & Add URL controls */}
                                  <div className="grid gap-2 sm:grid-cols-2 mb-3">
                                    <label
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                          void handleBatchFilesUpload(e.dataTransfer.files, index, (newUrls) => {
                                            const currentMedia = project.media && project.media.length > 0
                                              ? project.media
                                              : [project.thumbnail ?? project.image ?? ""].filter(Boolean);
                                            const updatedMedia = [...currentMedia, ...newUrls];
                                            saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updatedMedia, thumbnail: updatedMedia[0], image: updatedMedia[0] } : p)));
                                          });
                                        }
                                      }}
                                      className={`flex min-h-[4.75rem] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--hairline)] bg-[var(--card)] p-3 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--chip)] ${
                                        uploadingProjectIdx === index ? "pointer-events-none opacity-60" : ""
                                      }`}
                                    >
                                      {uploadingProjectIdx === index ? (
                                        <div className="flex flex-col items-center gap-1.5 text-[var(--accent)]">
                                          <Loader2 className="size-4 animate-spin" />
                                          <span className="text-[0.7rem] font-semibold">{uploadProgressText || "Uploading…"}</span>
                                        </div>
                                      ) : (
                                        <>
                                          <Upload className="size-4 text-[var(--accent)] mb-1" />
                                          <span className="text-[0.72rem] font-semibold text-[var(--fg)]">Upload Multiple Images</span>
                                          <span className="text-[0.62rem] text-[var(--muted)]">Drop files or click to batch upload infinite images</span>
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingProjectIdx !== null}
                                        onChange={(e) => {
                                          void handleBatchFilesUpload(e.target.files, index, (newUrls) => {
                                            const currentMedia = project.media && project.media.length > 0
                                              ? project.media
                                              : [project.thumbnail ?? project.image ?? ""].filter(Boolean);
                                            const updatedMedia = [...currentMedia, ...newUrls];
                                            saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updatedMedia, thumbnail: updatedMedia[0], image: updatedMedia[0] } : p)));
                                          });
                                          e.target.value = "";
                                        }}
                                      />
                                    </label>

                                    <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-3">
                                      <span className="text-[0.65rem] font-medium text-[var(--muted)]">Add Image(s) via URL</span>
                                      <div className="flex gap-1.5">
                                        <input
                                          id={`add-img-url-${index}`}
                                          type="text"
                                          placeholder="URL or photo ID (comma separated)"
                                          className="flex-1 rounded-md border border-[var(--hairline)] bg-[var(--bg)] px-2.5 py-1.5 text-[0.7rem] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              const input = e.currentTarget;
                                              const raw = input.value.trim();
                                              if (raw) {
                                                const urls = raw.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
                                                if (urls.length > 0) {
                                                  const currentMedia = project.media && project.media.length > 0
                                                    ? project.media
                                                    : [project.thumbnail ?? project.image ?? ""].filter(Boolean);
                                                  const updatedMedia = [...currentMedia, ...urls];
                                                  saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updatedMedia, thumbnail: updatedMedia[0], image: updatedMedia[0] } : p)));
                                                  input.value = "";
                                                  showSaved();
                                                }
                                              }
                                            }
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const input = document.getElementById(`add-img-url-${index}`) as HTMLInputElement | null;
                                            if (input && input.value.trim()) {
                                              const urls = input.value.trim().split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
                                              if (urls.length > 0) {
                                                const currentMedia = project.media && project.media.length > 0
                                                  ? project.media
                                                  : [project.thumbnail ?? project.image ?? ""].filter(Boolean);
                                                const updatedMedia = [...currentMedia, ...urls];
                                                saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updatedMedia, thumbnail: updatedMedia[0], image: updatedMedia[0] } : p)));
                                                input.value = "";
                                                showSaved();
                                              }
                                            }
                                          }}
                                          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-[0.7rem] font-medium text-white hover:opacity-90 transition-opacity"
                                        >
                                          Add
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Image List Preview & Reordering */}
                                  {((project.media && project.media.length > 0) || project.thumbnail || project.image) && (
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                      {(project.media && project.media.length > 0
                                        ? project.media
                                        : [project.thumbnail ?? project.image ?? ""].filter(Boolean)
                                      ).map((imgSrc, imgIdx, allMedia) => (
                                        <div
                                          key={`${imgSrc.slice(0, 24)}-${imgIdx}`}
                                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-1.5 text-xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[0.65rem] font-bold text-[var(--muted)] w-5 text-center">
                                              #{imgIdx + 1}
                                            </span>
                                            <img
                                              src={getFullWidthImageUrl(imgSrc)}
                                              alt={`Screen ${imgIdx + 1}`}
                                              className="size-8 rounded object-cover border border-[var(--hairline)] bg-[var(--bg)] flex-shrink-0"
                                            />
                                            <span className="truncate text-[0.65rem] text-[var(--muted)] max-w-[12rem]">
                                              {imgSrc.startsWith("data:") ? "Uploaded asset" : imgSrc}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              type="button"
                                              disabled={imgIdx === 0}
                                              onClick={() => {
                                                const updated = [...allMedia];
                                                const [moved] = updated.splice(imgIdx, 1);
                                                updated.splice(imgIdx - 1, 0, moved);
                                                saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updated, thumbnail: updated[0], image: updated[0] } : p)));
                                                showSaved();
                                              }}
                                              className="rounded p-1 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--chip)] disabled:opacity-20"
                                              title="Move Up"
                                            >
                                              <ArrowUp className="size-3" />
                                            </button>
                                            <button
                                              type="button"
                                              disabled={imgIdx === allMedia.length - 1}
                                              onClick={() => {
                                                const updated = [...allMedia];
                                                const [moved] = updated.splice(imgIdx, 1);
                                                updated.splice(imgIdx + 1, 0, moved);
                                                saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updated, thumbnail: updated[0], image: updated[0] } : p)));
                                                showSaved();
                                              }}
                                              className="rounded p-1 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--chip)] disabled:opacity-20"
                                              title="Move Down"
                                            >
                                              <ArrowDown className="size-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = allMedia.filter((_, i) => i !== imgIdx);
                                                saveProjects(projects.map((p, i) => (i === index ? { ...p, media: updated, thumbnail: updated[0] ?? p.thumbnail, image: updated[0] ?? p.image } : p)));
                                                showSaved();
                                              }}
                                              className="rounded p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                              title="Delete Image"
                                            >
                                              <Trash2 className="size-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Bottom Danger Zone: Delete project button */}
                                <div className="flex items-center justify-between pt-4 border-t border-[var(--hairline)]">
                                  <span className="text-[0.7rem] text-[var(--muted)]">
                                    Project #{index + 1} of {projects.length}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProject(index)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/15 hover:border-red-500/50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                    Delete This Project
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ────────────────── CASE STUDY DETAIL TAB ────────────────── */}
                {activeTab === "caseStudy" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          <h3 className="font-display text-base font-bold text-[var(--fg)]">
                            Case Study Detail Template Customizer
                          </h3>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Control visibility of sections and customize all buttons, microcopy, and plate labels on individual project presentation pages.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyTopBar: true,
                                caseStudyBadge: true,
                                caseStudyDescription: true,
                                caseStudyMetaChips: true,
                                caseStudyPdfButton: true,
                                caseStudyPlates: true,
                                caseStudyNextProject: true,
                                caseStudyBottomNav: true,
                              },
                            }));
                            showSaved();
                            triggerCloudToast("All Case Study sections enabled!");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-500" /> Enable All Sections
                        </button>
                      </div>
                    </div>

                    {/* Quick overview of projects using this template */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--chip)]/30 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                          {projects.length}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[var(--fg)]">
                            Template active across {projects.length} Projects
                          </span>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            Changes here instantly update every case study presentation view across your portfolio.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("projects")}
                        className="text-xs text-[var(--accent)] font-medium hover:underline cursor-pointer"
                      >
                        Manage Project Visuals &amp; Content →
                      </button>
                    </div>

                    {/* Section 1: Sticky Top Reading & Navigation Bar */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--fg)]">
                            1. Sticky Top Reading Bar &amp; Header Controls
                          </h4>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            Sticky top navigation with back button, reading progress bar, and share button
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyTopBar: s.sections?.caseStudyTopBar === false,
                              },
                            }))
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            settings?.sections?.caseStudyTopBar !== false
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                          }`}
                        >
                          <span>{settings?.sections?.caseStudyTopBar !== false ? "Visible & Active" : "Disabled & Hidden"}</span>
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormField label="Back Button Label" hint="Top left navigation return link">
                          <TextInput
                            value={config.caseStudy?.backButtonLabel || "Back to Projects"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), backButtonLabel: val } }))}
                            placeholder="Back to Projects"
                          />
                        </FormField>
                        <FormField label="Share Button Label" hint="Top right action button">
                          <TextInput
                            value={config.caseStudy?.shareLabel || "Share"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), shareLabel: val } }))}
                            placeholder="Share"
                          />
                        </FormField>
                        <FormField label="Copied Notification Text" hint="Toast alert on copy">
                          <TextInput
                            value={config.caseStudy?.copiedLabel || "Copied"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), copiedLabel: val } }))}
                            placeholder="Copied"
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* Section 2: Discipline & Category Badge */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--fg)]">
                          2. Discipline &amp; Focus Eyebrow Pill
                        </h4>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Pill badge above project title (e.g., &quot;Product Design · UI/UX&quot;)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSettings((s) => ({
                            ...s,
                            sections: {
                              ...s.sections,
                              caseStudyBadge: s.sections?.caseStudyBadge === false,
                            },
                          }))
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          settings?.sections?.caseStudyBadge !== false
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                        }`}
                      >
                        <span>{settings?.sections?.caseStudyBadge !== false ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Section 3: Project Executive Summary */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--fg)]">
                          3. Project Executive Summary / Overview
                        </h4>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Primary project description paragraph below the main title
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSettings((s) => ({
                            ...s,
                            sections: {
                              ...s.sections,
                              caseStudyDescription: s.sections?.caseStudyDescription === false,
                            },
                          }))
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          settings?.sections?.caseStudyDescription !== false
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                        }`}
                      >
                        <span>{settings?.sections?.caseStudyDescription !== false ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Section 4: Metadata Chips & Tech Stack */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--fg)]">
                          4. Metadata Badges &amp; Tech Stack Chips
                        </h4>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Plate count indicator and software/tool icons (Figma, React, Tailwind, etc.)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSettings((s) => ({
                            ...s,
                            sections: {
                              ...s.sections,
                              caseStudyMetaChips: s.sections?.caseStudyMetaChips === false,
                            },
                          }))
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          settings?.sections?.caseStudyMetaChips !== false
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                        }`}
                      >
                        <span>{settings?.sections?.caseStudyMetaChips !== false ? "Visible" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Section 5: PDF Presentation Button */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--fg)]">
                            5. PDF Presentation Button
                          </h4>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            External link button shown when a project has a PDF presentation link configured
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyPdfButton: s.sections?.caseStudyPdfButton === false,
                              },
                            }))
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            settings?.sections?.caseStudyPdfButton !== false
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                          }`}
                        >
                          <span>{settings?.sections?.caseStudyPdfButton !== false ? "Visible when PDF link exists" : "Disabled"}</span>
                        </button>
                      </div>

                      <FormField label="PDF Button Label Text">
                        <TextInput
                          value={config.caseStudy?.pdfButtonLabel || "View PDF Presentation"}
                          onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), pdfButtonLabel: val } }))}
                          placeholder="View PDF Presentation"
                        />
                      </FormField>
                    </div>

                    {/* Section 6: High-Res Visual Plates Stream */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--fg)]">
                            6. High-Res Visual Plates Stream &amp; Fullscreen Viewer
                          </h4>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            The core sequential visual gallery displaying mockups, screens, and design artifacts
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyPlates: s.sections?.caseStudyPlates === false,
                              },
                            }))
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            settings?.sections?.caseStudyPlates !== false
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                          }`}
                        >
                          <span>{settings?.sections?.caseStudyPlates !== false ? "Visible & Streaming" : "Disabled"}</span>
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormField label="Plate Label Prefix" hint="e.g. PLATE #">
                          <TextInput
                            value={config.caseStudy?.plateLabelPrefix || "PLATE #"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), plateLabelPrefix: val } }))}
                            placeholder="PLATE #"
                          />
                        </FormField>
                        <FormField label="Fullscreen Hint" hint="Helper microcopy">
                          <TextInput
                            value={config.caseStudy?.plateExpandHint || "Click to expand in fullscreen"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), plateExpandHint: val } }))}
                            placeholder="Click to expand in fullscreen"
                          />
                        </FormField>
                        <FormField label="Expand Button Label" hint="Interactive pill label">
                          <TextInput
                            value={config.caseStudy?.expandButtonLabel || "Expand"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), expandButtonLabel: val } }))}
                            placeholder="Expand"
                          />
                        </FormField>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-[var(--hairline)]">
                        <FormField label="Empty State Heading" hint="When no visuals exist">
                          <TextInput
                            value={config.caseStudy?.emptyTitle || "No case study visuals uploaded yet."}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), emptyTitle: val } }))}
                            placeholder="No case study visuals uploaded yet."
                          />
                        </FormField>
                        <FormField label="Empty State Description">
                          <TextInput
                            value={config.caseStudy?.emptyDesc || "Images for this project can be uploaded directly from the Studio Admin Panel."}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), emptyDesc: val } }))}
                            placeholder="Images for this project can be uploaded directly..."
                          />
                        </FormField>
                        <FormField label="Empty State Button Label">
                          <TextInput
                            value={config.caseStudy?.emptyButtonLabel || "Open Admin Panel to Upload Visuals"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), emptyButtonLabel: val } }))}
                            placeholder="Open Admin Panel to Upload Visuals"
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* Section 7: Next Project Banner */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--fg)]">
                            7. Next Project &quot;Up Next&quot; Banner
                          </h4>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            Shows a preview link card at the bottom leading to the next sequential case study
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyNextProject: s.sections?.caseStudyNextProject === false,
                              },
                            }))
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            settings?.sections?.caseStudyNextProject !== false
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                          }`}
                        >
                          <span>{settings?.sections?.caseStudyNextProject !== false ? "Visible" : "Hidden"}</span>
                        </button>
                      </div>

                      <FormField label="Next Project Kicker / Eyebrow">
                        <TextInput
                          value={config.caseStudy?.nextProjectKicker || "Next Case Study →"}
                          onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), nextProjectKicker: val } }))}
                          placeholder="Next Case Study →"
                        />
                      </FormField>
                    </div>

                    {/* Section 8: Bottom Navigation Actions */}
                    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3.5">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--fg)]">
                            8. Bottom Navigation Actions
                          </h4>
                          <p className="text-[0.68rem] text-[var(--muted)]">
                            Footer buttons for returning to project directory and scrolling back to top
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                caseStudyBottomNav: s.sections?.caseStudyBottomNav === false,
                              },
                            }))
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            settings?.sections?.caseStudyBottomNav !== false
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--chip)] text-[var(--muted)] border border-[var(--hairline)]"
                          }`}
                        >
                          <span>{settings?.sections?.caseStudyBottomNav !== false ? "Visible" : "Hidden"}</span>
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField label="Back to Projects Button Label">
                          <TextInput
                            value={config.caseStudy?.bottomReturnLabel || "Back to all projects"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), bottomReturnLabel: val } }))}
                            placeholder="Back to all projects"
                          />
                        </FormField>
                        <FormField label="Back to Top Button Label">
                          <TextInput
                            value={config.caseStudy?.backToTopLabel || "Back to top"}
                            onChange={(val) => updateConfig((c) => ({ ...c, caseStudy: { ...(c.caseStudy || {}), backToTopLabel: val } }))}
                            placeholder="Back to top"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "hero" && (
                  <div className="space-y-6">
                    <SectionHeaderBar
                      sectionName="Hero Banner"
                      enabled={settings?.sections?.hero !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, hero: next } }))}
                      title={config.hero.marqueeName}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, marqueeName: val } }))}
                      titleLabel="Marquee Headline / Name"
                      subtitle={config.hero.tagline}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, tagline: val } }))}
                      subtitleLabel="Tagline / Subheading"
                      kicker={config.hero.availableBadge}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, hero: { ...c.hero, availableBadge: val } }))}
                      kickerLabel="Availability Badge / Kicker"
                    />

                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Hero Details</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Entrance headline, tagline, bio reveal, and portrait</p>
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
                    <SectionHeaderBar
                      sectionName="About Me"
                      enabled={settings?.sections?.about !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, about: next } }))}
                      title={config.about.title}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, title: val } }))}
                      titleLabel="Headline / Title"
                      subtitle={config.about.subtitle || ""}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, subtitle: val } }))}
                      subtitleLabel="Subheading"
                      kicker={config.about.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, kicker: val } }))}
                    />

                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">About Details</h3>
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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Typewriter Heading Title">
                        <TextInput
                          value={config.about.title || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, title: val } }))}
                        />
                      </FormField>

                      <FormField label="Subheading / Lead">
                        <TextInput
                          value={config.about.subtitle || ""}
                          onChange={(val) => updateConfig((c) => ({ ...c, about: { ...c.about, subtitle: val } }))}
                          placeholder="e.g. Blending aesthetics and engineering..."
                        />
                      </FormField>
                    </div>

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
                    <SectionHeaderBar
                      sectionName="Toolkit & Skills"
                      enabled={settings?.sections?.skills !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, skills: next } }))}
                      title={config.skills.title}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, title: val } }))}
                      subtitle={config.skills.subtitle}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, subtitle: val } }))}
                      kicker={config.skills.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, skills: { ...c.skills, kicker: val } }))}
                    />

                    <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--fg)]">Software &amp; Tools</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Upload custom icon images (PNG, SVG, WebP) directly, pick presets, or paste links</p>
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
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-3 py-1.5 text-xs font-semibold text-[var(--bg)] cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Tool
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {config.skills.tools.map((tool, i) => (
                        <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {tool.icon ? (
                                <img src={tool.icon} alt="" className="size-6 object-contain" />
                              ) : (
                                <div className="size-6 rounded bg-[var(--chip)]" />
                              )}
                              <span className="font-semibold text-xs text-[var(--fg)]">{tool.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const tools = config.skills.tools.filter((_, idx) => idx !== i);
                                updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                              }}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
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

                          <ToolIconUploader
                            icon={tool.icon}
                            accent={tool.accent}
                            toolName={tool.name}
                            onChangeIcon={(url) => {
                              const tools = [...config.skills.tools];
                              tools[i] = { ...tools[i], icon: url };
                              updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                            }}
                            onChangeAccent={(hex) => {
                              const tools = [...config.skills.tools];
                              tools[i] = { ...tools[i], accent: hex };
                              updateConfig((c) => ({ ...c, skills: { ...c.skills, tools } }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ────────────────── CAPABILITIES TAB ────────────────── */}
                {activeTab === "capabilities" && (
                  <div className="space-y-6">
                    <SectionHeaderBar
                      sectionName="Capabilities & Disciplines"
                      enabled={settings?.sections?.capabilities !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, capabilities: next } }))}
                      title={config.capabilities.title}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, title: val } }))}
                      subtitle={config.capabilities.subtitle}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, subtitle: val } }))}
                      kicker={config.capabilities.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, capabilities: { ...c.capabilities, kicker: val } }))}
                    />

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
                    <SectionHeaderBar
                      sectionName="Design Process"
                      enabled={settings?.sections?.process !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, process: next } }))}
                      title={config.process.title}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, title: val } }))}
                      subtitle={config.process.subtitle}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, subtitle: val } }))}
                      kicker={config.process.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, process: { ...c.process, kicker: val } }))}
                    />

                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Design Process Steps</h3>
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
                    <SectionHeaderBar
                      sectionName="Trainings & Experience"
                      enabled={settings?.sections?.trainings !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, trainings: next } }))}
                      title={config.trainings.title}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, title: val } }))}
                      subtitle={config.trainings.subtitle}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, subtitle: val } }))}
                      kicker={config.trainings.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, trainings: { ...c.trainings, kicker: val } }))}
                    />

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
                    <SectionHeaderBar
                      sectionName="Contact & Footer"
                      enabled={settings?.sections?.contact !== false}
                      onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, contact: next } }))}
                      title={config.contact.titleLines.join(" ")}
                      onTitleChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, titleLines: val.split(/\s+/) } }))}
                      titleLabel="Call to Action Title"
                      subtitle={config.contact.subtitleHeadline}
                      onSubtitleChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, subtitleHeadline: val } }))}
                      subtitleLabel="Subheading Headline"
                      kicker={config.contact.kicker}
                      onKickerChange={(val) => updateConfig((c) => ({ ...c, contact: { ...c.contact, kicker: val } }))}
                    />

                    <div className="border-b border-[var(--hairline)] pb-4">
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">Contact Details</h3>
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--hairline)] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-purple-500" />
                          <h3 className="font-display text-base font-bold text-[var(--fg)]">
                            Project Listing &amp; Archive Page Customizer
                          </h3>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Manage section visibility, directory headings, digital explorations, and collaboration CTA on the dedicated Archive page.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings((s) => ({
                              ...s,
                              sections: {
                                ...s.sections,
                                archiveListing: true,
                                archiveExplorations: true,
                                beyondTheBrief: true,
                                archiveCta: true,
                              },
                            }));
                            updateConfig((c) => ({
                              ...c,
                              projectsArchive: {
                                ...(c.projectsArchive || {}),
                                showArchiveListing: true,
                                showExplorations: true,
                                showCta: true,
                              },
                            }));
                            showSaved();
                            triggerCloudToast("All Archive sections enabled!");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-500" /> Enable All Archive Sections
                        </button>
                      </div>
                    </div>

                    {/* Section 1: Selected Projects Directory Grid */}
                    <div className="space-y-4">
                      <SectionHeaderBar
                        sectionName="1. Archive / Case Studies Directory"
                        enabled={settings?.sections?.archiveListing !== false}
                        onToggleEnabled={(next) => {
                          updateSettings((s) => ({ ...s, sections: { ...s.sections, archiveListing: next } }));
                          updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), showArchiveListing: next } }));
                        }}
                        title={config.projectsArchive?.archiveTitle || "ARCHIVE / 01"}
                        onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveTitle: val } }))}
                        titleLabel="Main Archive Heading"
                        subtitle={config.projectsArchive?.archiveSubtitle || "A comprehensive catalogue of commercial UI/UX designs, web platforms, and design engineering artifacts."}
                        onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveSubtitle: val } }))}
                        subtitleLabel="Archive Subheading"
                        kicker={config.projectsArchive?.archiveKicker || "Index & Directory"}
                        onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveKicker: val } }))}
                        kickerLabel="Kicker Eyebrow Badge"
                        statusHint={{ enabled: "Visible on Archive page", disabled: "Hidden from Archive page" }}
                      />

                      <div className="grid gap-3 sm:grid-cols-2 -mt-2 mb-2 px-1">
                        <FormField label="Back Button Label" hint="Navigates back to homepage">
                          <TextInput
                            value={config.projectsArchive?.archiveBackButton || "Back to Overview"}
                            onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveBackButton: val } }))}
                            placeholder="Back to Overview"
                          />
                        </FormField>
                        <FormField label="Artifacts Count Suffix" hint="e.g. Selected Artifacts">
                          <TextInput
                            value={config.projectsArchive?.archiveCountSuffix || "Selected Artifacts"}
                            onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), archiveCountSuffix: val } }))}
                            placeholder="Selected Artifacts"
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* Section 2: Digital Explorations & Labs Grid */}
                    <div className="space-y-4 pt-4 border-t border-[var(--hairline)]">
                      <SectionHeaderBar
                        sectionName="2. Beyond the Brief / Digital Explorations"
                        enabled={settings?.sections?.beyondTheBrief !== false && settings?.sections?.archiveExplorations !== false}
                        onToggleEnabled={(next) => {
                          updateSettings((s) => ({
                            ...s,
                            sections: {
                              ...s.sections,
                              archiveExplorations: next,
                              beyondTheBrief: next,
                            },
                          }));
                          updateConfig((c) => ({
                            ...c,
                            projectsArchive: {
                              ...(c.projectsArchive || {}),
                              showExplorations: next,
                            },
                          }));
                        }}
                        title={config.projectsArchive?.explorationsTitle || "Digital Explorations & Visual Studies"}
                        onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsTitle: val } }))}
                        titleLabel="Explorations Section Heading"
                        subtitle={config.projectsArchive?.explorationsSubtitle || "Unpublished prototypes, interaction loops, and spatial user interface experiments created during R&D explorations."}
                        onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsSubtitle: val } }))}
                        subtitleLabel="Explorations Subheading"
                        kicker={config.projectsArchive?.explorationsKicker || "Experimental · 02"}
                        onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), explorationsKicker: val } }))}
                        kickerLabel="Explorations Kicker"
                        statusHint={{ enabled: "Visible on Archive page", disabled: "Hidden from Archive page" }}
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[0.68rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                            Exploration Cards ({config.projectsArchive.digitalProjects.length})
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const newCard = {
                                title: "New Exploration",
                                desc: "Interactive prototype exploring fluid micro-interactions and visual states.",
                              };
                              updateConfig((c) => ({
                                ...c,
                                projectsArchive: {
                                  ...c.projectsArchive,
                                  digitalProjects: [...c.projectsArchive.digitalProjects, newCard],
                                },
                              }));
                            }}
                            className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-semibold hover:underline cursor-pointer"
                          >
                            + Add Exploration Card
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {config.projectsArchive.digitalProjects.map((dp, i) => (
                            <div key={i} className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[0.65rem] text-[var(--muted)]">Card #{i + 1}</span>
                                {config.projectsArchive.digitalProjects.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = config.projectsArchive.digitalProjects.filter((_, idx) => idx !== i);
                                      updateConfig((c) => ({
                                        ...c,
                                        projectsArchive: { ...c.projectsArchive, digitalProjects: updated },
                                      }));
                                    }}
                                    className="text-[0.68rem] text-red-400 hover:text-red-500 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <TextInput
                                value={dp.title}
                                onChange={(val) => {
                                  const digitalProjects = [...config.projectsArchive.digitalProjects];
                                  digitalProjects[i] = { ...digitalProjects[i], title: val };
                                  updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, digitalProjects } }));
                                }}
                                placeholder="Exploration Title"
                              />
                              <TextAreaInput
                                rows={2}
                                value={dp.desc}
                                onChange={(val) => {
                                  const digitalProjects = [...config.projectsArchive.digitalProjects];
                                  digitalProjects[i] = { ...digitalProjects[i], desc: val };
                                  updateConfig((c) => ({ ...c, projectsArchive: { ...c.projectsArchive, digitalProjects } }));
                                }}
                                placeholder="Exploration Description"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bottom Collaboration CTA */}
                    <div className="space-y-4 pt-4 border-t border-[var(--hairline)]">
                      <SectionHeaderBar
                        sectionName="3. Bottom Collaboration Call to Action"
                        enabled={settings?.sections?.archiveCta !== false}
                        onToggleEnabled={(next) => updateSettings((s) => ({ ...s, sections: { ...s.sections, archiveCta: next } }))}
                        title={config.projectsArchive?.ctaHeading || "Interested in collaborating?"}
                        onTitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaHeading: val } }))}
                        titleLabel="CTA Display Heading"
                        subtitle={config.projectsArchive?.ctaDescription || "Let's talk about product design, systems, or new opportunities."}
                        onSubtitleChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaDescription: val } }))}
                        subtitleLabel="CTA Description / Subtitle"
                        kicker={config.projectsArchive?.ctaKicker || "Get in touch"}
                        onKickerChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaKicker: val } }))}
                        kickerLabel="CTA Kicker / Eyebrow"
                        statusHint={{ enabled: "Visible at bottom of Archive", disabled: "Hidden from Archive page" }}
                      />

                      <div className="grid gap-3 sm:grid-cols-2 -mt-2 mb-2 px-1">
                        <FormField label="CTA Action Button Label">
                          <TextInput
                            value={config.projectsArchive?.ctaButtonLabel || "Start a Conversation"}
                            onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaButtonLabel: val } }))}
                            placeholder="Start a Conversation"
                          />
                        </FormField>
                        <FormField label="CTA Action Button Link / URL">
                          <TextInput
                            value={config.projectsArchive?.ctaButtonLink || "mailto:yogendrachaudhary1011@gmail.com"}
                            onChange={(val) => updateConfig((c) => ({ ...c, projectsArchive: { ...(c.projectsArchive || {}), ctaButtonLink: val } }))}
                            placeholder="mailto:... or https://..."
                          />
                        </FormField>
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

                {/* ────────────────── CLOUD DATABASE TAB ────────────────── */}
                {activeTab === "database" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-[var(--fg)]">
                            Cloud Database (Firestore)
                          </h3>
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[0.68rem] text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Persistent cloud storage for all case studies, full-width image streams, content, and settings.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleManualPullFromCloud}
                          disabled={isManualSyncing}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] disabled:opacity-50 transition-colors"
                        >
                          <RefreshCw className={`size-3.5 ${isManualSyncing ? "animate-spin" : ""}`} />
                          Pull from Cloud
                        </button>
                        <button
                          type="button"
                          onClick={handleManualPushToCloud}
                          disabled={isManualSyncing}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-1.5 text-xs font-medium text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {isManualSyncing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Cloud className="size-3.5" />
                          )}
                          Save All to Cloud
                        </button>
                      </div>
                    </div>

                    {/* Database Health and Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-1">
                        <span className="font-mono text-[0.65rem] text-[var(--muted)] uppercase tracking-wider">
                          Projects In Database
                        </span>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xl font-bold text-[var(--fg)]">{projects.length}</p>
                          <span className="text-[0.7rem] text-emerald-400">Live Synced</span>
                        </div>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Includes descriptions, stack, and image streams
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-1">
                        <span className="font-mono text-[0.65rem] text-[var(--muted)] uppercase tracking-wider">
                          Site Sections Synced
                        </span>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xl font-bold text-[var(--fg)]">8 / 8</p>
                          <span className="text-[0.7rem] text-emerald-400">Up to date</span>
                        </div>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Hero, About, Capabilities, Process, Skills, etc.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-1">
                        <span className="font-mono text-[0.65rem] text-[var(--muted)] uppercase tracking-wider">
                          Sync Frequency
                        </span>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xl font-bold text-[var(--fg)]">Realtime</p>
                          <span className="text-[0.7rem] text-emerald-400">Active</span>
                        </div>
                        <p className="text-[0.68rem] text-[var(--muted)]">
                          Auto-saved on every change across all tabs
                        </p>
                      </div>
                    </div>

                    {/* Infrastructure Configuration */}
                    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Database className="size-4 text-[var(--accent)]" />
                        <h4 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                          Database Connection Parameters
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="rounded-lg bg-[var(--card)] p-3 border border-[var(--hairline)] space-y-1">
                          <span className="font-mono text-[0.65rem] text-[var(--muted)] block">
                            FIREBASE PROJECT ID
                          </span>
                          <span className="font-mono text-xs font-semibold text-[var(--fg)] select-all">
                            expanded-verbena-zmn89
                          </span>
                        </div>

                        <div className="rounded-lg bg-[var(--card)] p-3 border border-[var(--hairline)] space-y-1">
                          <span className="font-mono text-[0.65rem] text-[var(--muted)] block">
                            FIRESTORE DATABASE ID
                          </span>
                          <span className="font-mono text-[0.7rem] font-semibold text-[var(--fg)] select-all truncate block">
                            ai-studio-portfolio3-796f99c9-4af8-4de3-b370-41fe409fbcb7
                          </span>
                        </div>

                        <div className="rounded-lg bg-[var(--card)] p-3 border border-[var(--hairline)] space-y-1">
                          <span className="font-mono text-[0.65rem] text-[var(--muted)] block">
                            SECURITY STATUS
                          </span>
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5" /> Deployed Firestore Rules (Zero-Trust)
                          </span>
                        </div>

                        <div className="rounded-lg bg-[var(--card)] p-3 border border-[var(--hairline)] space-y-1">
                          <span className="font-mono text-[0.65rem] text-[var(--muted)] block">
                            OFFLINE RESILIENCY
                          </span>
                          <span className="text-xs font-semibold text-[var(--fg)] flex items-center gap-1.5">
                            <Check className="size-3.5 text-emerald-400" /> Multi-tiered (Cloud + IndexedDB + LocalStorage)
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-start gap-3">
                        <CheckCircle2 className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-emerald-400">
                            Everything is permanently stored and synchronized
                          </p>
                          <p className="text-[var(--fg)]/80 text-[0.74rem] leading-relaxed">
                            When you add new case study projects, upload infinite full-width high-resolution images, edit sections, or toggle visibility in this studio, your modifications automatically persist to Google Cloud Firestore and are instantly available to any visitor or browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ────────────────── VISITOR INBOX TAB ────────────────── */}
                {activeTab === "messages" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-[var(--fg)]">Visitor Inquiries</h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Database Connected
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Submissions from the contact form saved directly to Google Cloud Firestore database.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const list = await loadMessagesFromCloud();
                              setMessages(list);
                              triggerCloudToast(`Loaded ${list.length} messages from Cloud Database`);
                            } catch {
                              triggerCloudToast("Could not fetch messages from Cloud Database");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--fg)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                          title="Refresh from Firestore"
                        >
                          <RefreshCw className="size-3.5" />
                          <span>Refresh</span>
                        </button>

                        {messages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                title: "Clear All Messages from Database?",
                                message: "Are you sure you want to permanently delete all received visitor messages from Google Cloud Firestore? This cannot be undone.",
                                confirmLabel: "Clear Inbox",
                                isDestructive: true,
                                onConfirm: async () => {
                                  try {
                                    await clearAllMessagesFromCloud();
                                    setMessages([]);
                                    showSaved();
                                    triggerCloudToast("All messages deleted from Cloud Database.");
                                  } catch {
                                    triggerCloudToast("Failed to clear messages from Cloud Database.");
                                  }
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Clear Inbox
                          </button>
                        )}
                      </div>
                    </div>

                    {messages.length === 0 ? (
                      <div className="grid place-items-center rounded-2xl border border-dashed border-[var(--hairline)] p-12 text-center">
                        <Mail className="size-8 text-[var(--muted)]/40 mb-2" />
                        <p className="text-xs font-medium text-[var(--fg)]">No messages yet</p>
                        <p className="text-[0.7rem] text-[var(--muted)] mt-0.5 max-w-sm">
                          Submissions from the "Send Message" form on your site will be safely stored in Firestore and stream here in real time.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className="rounded-xl border border-[var(--hairline)] bg-[var(--bg)] p-4 space-y-2.5 transition-all hover:border-[var(--hairline)]/80"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-xs text-[var(--fg)]">{msg.name}</p>
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="text-[0.7rem] text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                                >
                                  {msg.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <time className="font-mono text-[0.62rem] text-[var(--muted)]">
                                  {new Date(msg.sentAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </time>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmDialog({
                                      title: `Delete Message from ${msg.name}?`,
                                      message: "Are you sure you want to permanently delete this message from the cloud database?",
                                      confirmLabel: "Delete",
                                      isDestructive: true,
                                      onConfirm: async () => {
                                        try {
                                          await deleteMessageFromCloud(msg.id);
                                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                                          triggerCloudToast("Message deleted from database.");
                                        } catch {
                                          triggerCloudToast("Could not delete message from database.");
                                        }
                                      },
                                    });
                                  }}
                                  title="Delete message"
                                  className="p-1 rounded-lg text-[var(--muted)]/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="rounded-lg bg-[var(--card)] p-3 text-xs leading-relaxed text-[var(--fg)]/85 whitespace-pre-wrap border border-[var(--hairline)]/50">
                              {msg.message}
                            </p>
                            <div className="flex items-center justify-end">
                              <a
                                href={`mailto:${msg.email}?subject=${encodeURIComponent(
                                  `Re: Inquiry from ${msg.name}`
                                )}`}
                                className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-[var(--accent)] hover:underline"
                              >
                                <Mail className="size-3" />
                                <span>Reply via Email</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reusable In-App Confirmation Modal (works reliably in all iframes without window.confirm) */}
            {confirmDialog && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                <div
                  role="dialog"
                  aria-modal="true"
                  className="w-full max-w-md rounded-2xl border border-[var(--hairline)] bg-[var(--card)] p-5 sm:p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        confirmDialog.isDestructive
                          ? "bg-red-500/15 text-red-400"
                          : "bg-[var(--chip)] text-[var(--fg)]"
                      }`}
                    >
                      {confirmDialog.isDestructive ? (
                        <AlertTriangle className="size-5" />
                      ) : (
                        <RotateCcw className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--fg)]">
                        {confirmDialog.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                        {confirmDialog.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--hairline)]">
                    <button
                      type="button"
                      onClick={() => setConfirmDialog(null)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--chip)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                    >
                      {confirmDialog.cancelLabel || "Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cb = confirmDialog.onConfirm;
                        setConfirmDialog(null);
                        cb();
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        confirmDialog.isDestructive
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20"
                          : "bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
                      }`}
                    >
                      {confirmDialog.confirmLabel || "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
