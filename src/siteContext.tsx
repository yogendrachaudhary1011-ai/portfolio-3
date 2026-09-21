import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import yogendraProfileDefault from "./imports/yogendra-profile.png";
import { safeSetLocalStorage, saveToIndexedDB, getFromIndexedDB } from "./storage";
import {
  saveConfigToCloud,
  saveSettingsToCloud,
  saveProjectsToCloud,
  loadConfigFromCloud,
  loadSettingsFromCloud,
  loadProjectsFromCloud,
  subscribeToCloudProjects,
  subscribeToCloudConfig,
  subscribeToCloudSettings,
  type CloudSyncStatus,
} from "./cloudStore";
import {
  initialCaseStudies,
  digitalProjects as initialDigitalProjects,
  capabilities as initialCapabilities,
  trainings as initialTrainings,
  contacts as initialContacts,
  type Project,
} from "./data";

export interface SkillTool {
  name: string;
  number: string;
  icon: string;
  role: string;
  detail: string;
  accent: string;
}

export interface PracticeCapability {
  num: string;
  title: string;
  desc: string;
  skills: string[];
}

export interface ProcessStep {
  title: string;
  desc: string;
  tags: string[];
  principle: string;
}

export interface TrainingItem {
  title: string;
  org: string;
  date: string;
  desc: string;
  cert: string;
  image: string;
}

export interface ContactItem {
  num: string;
  label: string;
  value: string;
  href: string;
}

export interface DigitalExploration {
  title: string;
  desc: string;
  image?: string;
}

export interface SiteConfig {
  hero: {
    marqueeName: string;
    tagline: string;
    bio: string;
    portraitImage: string;
    scrollText: string;
    availableBadge: string;
  };
  work: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  about: {
    kicker: string;
    title: string;
    subtitle: string;
    name: string;
    avatarImage: string;
    stats: { k: string; v: string }[];
    bioParagraph1: string;
    bioParagraph2: string;
    ctaLabel: string;
    ctaHref: string;
  };
  capabilities: {
    kicker: string;
    title: string;
    subtitle: string;
    items: PracticeCapability[];
  };
  process: {
    kicker: string;
    title: string;
    subtitle: string;
    steps: ProcessStep[];
  };
  skills: {
    kicker: string;
    title: string;
    subtitle: string;
    tools: SkillTool[];
  };
  trainings: {
    kicker: string;
    title: string;
    subtitle: string;
    items: TrainingItem[];
  };
  contact: {
    kicker: string;
    titleLines: string[];
    subtitleHeadline: string;
    subtitleBody: string;
    formTitle: string;
    footerCopyright: string;
    footerCredit: string;
    contacts: ContactItem[];
  };
  projectsArchive: {
    archiveTitle: string;
    archiveSubtitle: string;
    explorationsTitle: string;
    explorationsSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    digitalProjects: DigitalExploration[];
  };
}

const defaultPracticeItems: PracticeCapability[] = [
  {
    num: "01",
    title: "Product Strategy",
    desc: "Clarifying the opportunity, defining the right problem, and creating a sharp path from business intent to customer value.",
    skills: ["Product vision", "Discovery", "Roadmaps", "Stakeholder workshops"],
  },
  {
    num: "02",
    title: "UX Research",
    desc: "Finding the useful signal in real behaviours, needs, and friction — then turning insight into practical design direction.",
    skills: ["User interviews", "Usability tests", "Journey mapping", "Synthesis"],
  },
  {
    num: "03",
    title: "Experience Design",
    desc: "Structuring flows, information, and interactions so every moment makes sense and earns the next one.",
    skills: ["Information architecture", "User flows", "Wireframes", "Prototypes"],
  },
  {
    num: "04",
    title: "Interface Design",
    desc: "Creating crisp, expressive interfaces with hierarchy, rhythm, and the small details that make products feel alive.",
    skills: ["Visual systems", "Responsive UI", "Interaction states", "Motion direction"],
  },
  {
    num: "05",
    title: "Design Systems",
    desc: "Building the shared language behind a product: adaptable components, tokens, and guidelines teams can rely on.",
    skills: ["Components", "Design tokens", "Documentation", "Figma libraries"],
  },
  {
    num: "06",
    title: "Accessibility",
    desc: "Designing with range in mind — inclusive patterns, readable hierarchy, and interfaces that work in the real world.",
    skills: ["WCAG", "Inclusive design", "Keyboard flows", "Content hierarchy"],
  },
  {
    num: "07",
    title: "Design Partnership",
    desc: "Working closely with product and engineering to make strong decisions, protect craft, and ship with confidence.",
    skills: ["Design critique", "Developer handoff", "QA", "Team alignment"],
  },
];

const defaultProcessSteps: ProcessStep[] = [
  {
    title: "Understand",
    desc: "Understand the product, users, business context, constraints and desired outcomes before designing.",
    tags: ["Context", "Stakeholders", "Constraints", "Goals"],
    principle: "Good solutions begin with understanding the right context.",
  },
  {
    title: "Research",
    desc: "Explore user behaviour, pain points, workflows and market patterns to replace assumptions with evidence.",
    tags: ["Research", "Data", "Insights", "Competitors"],
    principle: "Research turns assumptions into evidence.",
  },
  {
    title: "Define",
    desc: "Turn research into a clear problem, priorities and shared direction.",
    tags: ["Synthesis", "Problem statement", "User goals", "Priorities"],
    principle: "Clarity creates momentum.",
  },
  {
    title: "Explore",
    desc: "Generate multiple approaches before committing to a single direction.",
    tags: ["Ideation", "Flows", "Sketches", "Concepts"],
    principle: "Exploring broadly reveals stronger solutions.",
  },
  {
    title: "Design",
    desc: "Turn the strongest ideas into clear, useful and visually cohesive interfaces.",
    tags: ["UX", "UI", "Design system", "Interaction"],
    principle: "Every visual decision should improve understanding.",
  },
  {
    title: "Prototype",
    desc: "Create realistic interactive flows to test behaviour and assumptions before development.",
    tags: ["Prototyping", "Interactions", "Validation", "Flow"],
    principle: "Prototypes make assumptions visible.",
  },
  {
    title: "Iterate",
    desc: "Use testing, feedback and evidence to continuously refine the experience.",
    tags: ["Testing", "Feedback", "Refinement", "Learning"],
    principle: "Great products improve through continuous learning.",
  },
];

const defaultSkillsTools: SkillTool[] = [
  {
    name: "Figma",
    number: "01",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    role: "Interface design & prototyping",
    detail: "Components · Auto Layout · Design systems",
    accent: "#a99dff",
  },
  {
    name: "Photoshop",
    number: "02",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg",
    role: "Image editing & visual craft",
    detail: "Mockups · Retouching · Art direction",
    accent: "#31a8ff",
  },
  {
    name: "Illustrator",
    number: "03",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg",
    role: "Vector design & illustration",
    detail: "Icons · Brand assets · Graphics",
    accent: "#ff9a5c",
  },
  {
    name: "Canva",
    number: "04",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg",
    role: "Visual content & presentations",
    detail: "Social design · Decks · Fast concepts",
    accent: "#52d8e5",
  },
];

export const defaultSiteConfig: SiteConfig = {
  hero: {
    marqueeName: "YOGENDRA CHAUDHARY",
    tagline: "Junior UI/UX Designer · Kathmandu",
    bio: "Creating thoughtful, intuitive, and engaging digital experiences.",
    portraitImage: yogendraProfileDefault,
    scrollText: "Scroll Down",
    availableBadge: "Available for new opportunities",
  },
  work: {
    kicker: "Selected Work",
    title: "Work Gallery",
    subtitle: "A selection of internship, academic, and personal projects exploring different users, industries, and product challenges.",
  },
  about: {
    kicker: "About Me",
    title: "Junior UI/UX Designer",
    subtitle: "Product Designer & Frontend Engineer creating human-centered digital experiences.",
    name: "YOGENDRA CHAUDHARY",
    avatarImage: yogendraProfileDefault,
    stats: [
      { k: "Experience", v: "Internship" },
      { k: "Focus", v: "UI/UX" },
      { k: "Based in", v: "Kathmandu" },
    ],
    bioParagraph1:
      "I’m a Junior UI/UX Designer passionate about turning ideas, requirements, and real-world problems into clear, meaningful digital experiences. After completing my UI/UX design internship, I gained hands-on experience in wireframing, user flows, high-fidelity interface design, prototyping, components, responsive layouts, and iterative design within real product workflows.",
    bioParagraph2:
      "I start with the problem, the user, and the friction — then refine the details that make an experience feel natural and consistent.",
    ctaLabel: "View selected work",
    ctaHref: "#work",
  },
  capabilities: {
    kicker: "02 / What I can do",
    title: "Make the complex feel inevitable.",
    subtitle: "A complete product-design practice, from the first question to the final pixel.",
    items: defaultPracticeItems,
  },
  process: {
    kicker: "My Process",
    title: "How I approach design.",
    subtitle: "A structured, human-centered process that turns complex problems into simple, meaningful experiences.",
    steps: defaultProcessSteps,
  },
  skills: {
    kicker: "Selected tools / 04",
    title: "My design toolkit.",
    subtitle: "The focused set of tools I use to take work from the first frame to the final detail.",
    tools: defaultSkillsTools,
  },
  trainings: {
    kicker: "Experience",
    title: "Learning by Doing",
    subtitle: "Hands-on experience designing real product flows, interfaces, components, and responsive digital experiences.",
    items: initialTrainings,
  },
  contact: {
    kicker: "Get In Touch",
    titleLines: ["LET'S", "WORK", "TOGETHER"],
    subtitleHeadline: "Let’s create something meaningful.",
    subtitleBody:
      "I’m looking for opportunities to contribute, learn from experienced teams, and work on real product challenges. Whether you’re building something new, improving an existing experience, or simply want to talk about design, I’d be happy to connect.",
    formTitle: "Send Me a Message",
    footerCopyright: "© 2026 Yogendra Chaudhary. All rights reserved.",
    footerCredit: "Designed & crafted by Yogendra.",
    contacts: initialContacts,
  },
  projectsArchive: {
    archiveTitle: "Case Studies",
    archiveSubtitle:
      "A growing collection of product-design work — from early concepts and user flows to refined, high-fidelity interfaces.",
    explorationsTitle: "Beyond the Brief",
    explorationsSubtitle:
      "Ongoing explorations in product thinking, responsive interfaces, prototypes, and design-to-development workflows.",
    ctaTitle: "Let's design",
    ctaSubtitle: "something great.",
    ctaButton: "Start a conversation",
    digitalProjects: initialDigitalProjects,
  },
};

export interface EnabledSections {
  hero: boolean;
  work: boolean;
  capabilities: boolean;
  process: boolean;
  about: boolean;
  trainings: boolean;
  skills: boolean;
  contact: boolean;
}

export const defaultEnabledSections: EnabledSections = {
  hero: true,
  work: true,
  capabilities: true,
  process: true,
  about: true,
  trainings: true,
  skills: true,
  contact: true,
};

export interface TextVisibility {
  showKickers: boolean;
  showSubheadings: boolean;
  showDescriptions: boolean;
  showBadges: boolean;
  showStats: boolean;
}

export const defaultTextVisibility: TextVisibility = {
  showKickers: true,
  showSubheadings: true,
  showDescriptions: true,
  showBadges: true,
  showStats: true,
};

export interface PortfolioSettings {
  accent: string;
  accent2: string;
  background: string;
  radius: number;
  sectionSpace: string;
  headingScale: number;
  subheadingScale: number;
  sections: EnabledSections;
  textVisibility: TextVisibility;
}

export const defaultSettings: PortfolioSettings = {
  accent: "#a99dff",
  accent2: "#d0a8ff",
  background: "",
  radius: 14,
  sectionSpace: "clamp(6rem, 10vw, 8rem)",
  headingScale: 1.0,
  subheadingScale: 1.0,
  sections: defaultEnabledSections,
  textVisibility: defaultTextVisibility,
};

const SITE_CONFIG_KEY = "yogendra-portfolio-site-config";
const SETTINGS_KEY = "yogendra-portfolio-settings";
const PROJECTS_KEY = "yogendra-case-studies";

interface SiteContextType {
  config: SiteConfig;
  updateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  resetConfig: () => void;
  settings: PortfolioSettings;
  updateSettings: (updater: (prev: PortfolioSettings) => PortfolioSettings) => void;
  resetSettings: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  saveProjects: (projects: Project[]) => void;
  resetProjects: () => void;
  cloudStatus: CloudSyncStatus;
  syncAllToCloud: () => Promise<void>;
  loadAllFromCloud: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>({
    status: "idle",
  });

  const configDebounceRef = useRef<number | null>(null);
  const settingsDebounceRef = useRef<number | null>(null);
  const [config, setConfigState] = useState<SiteConfig>(() => {
    try {
      const stored = localStorage.getItem(SITE_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge deep with defaultSiteConfig to guard against schema changes
        return {
          ...defaultSiteConfig,
          ...parsed,
          hero: { ...defaultSiteConfig.hero, ...parsed.hero },
          work: { ...defaultSiteConfig.work, ...(parsed.work || {}) },
          about: { ...defaultSiteConfig.about, ...(parsed.about || {}) },
          capabilities: { ...defaultSiteConfig.capabilities, ...parsed.capabilities },
          process: { ...defaultSiteConfig.process, ...parsed.process },
          skills: {
            ...defaultSiteConfig.skills,
            ...parsed.skills,
            tools: (parsed.skills?.tools ?? defaultSiteConfig.skills.tools).map((t: SkillTool) => ({
              ...t,
              icon: t.icon
                ?.replace("/photoshop/photoshop-plain.svg", "/photoshop/photoshop-original.svg")
                .replace("/illustrator/illustrator-plain.svg", "/illustrator/illustrator-original.svg"),
            })),
          },
          trainings: { ...defaultSiteConfig.trainings, ...parsed.trainings },
          contact: { ...defaultSiteConfig.contact, ...parsed.contact },
          projectsArchive: { ...defaultSiteConfig.projectsArchive, ...parsed.projectsArchive },
        };
      }
    } catch {
      // fallback
    }
    return defaultSiteConfig;
  });

  const [settings, setSettingsState] = useState<PortfolioSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.background === "#f5f4f8" || parsed.background === "#08080a" || parsed.background === "#0b0b0e") {
          parsed.background = "";
        }
        return {
          ...defaultSettings,
          ...parsed,
          sections: { ...defaultEnabledSections, ...parsed.sections },
          textVisibility: { ...defaultTextVisibility, ...parsed.textVisibility },
          headingScale: typeof parsed.headingScale === "number" ? parsed.headingScale : 1.0,
          subheadingScale: typeof parsed.subheadingScale === "number" ? parsed.subheadingScale : 1.0,
        };
      }
    } catch {
      // fallback
    }
    return defaultSettings;
  });

  const [projects, setProjectsState] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialCaseStudies;
  });

  const applyCSSVariables = (nextSettings: PortfolioSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--accent", nextSettings.accent);
    root.style.setProperty("--accent-2", nextSettings.accent2 || nextSettings.accent);
    if (
      nextSettings.background &&
      nextSettings.background !== "#f5f4f8" &&
      nextSettings.background !== "#08080a" &&
      nextSettings.background !== "#0b0b0e"
    ) {
      root.style.setProperty("--bg", nextSettings.background);
    } else {
      root.style.removeProperty("--bg");
    }
    root.style.setProperty("--radius", `${nextSettings.radius}px`);
    root.style.setProperty("--section-space", nextSettings.sectionSpace);
    root.style.setProperty("--heading-scale", String(nextSettings.headingScale || 1.0));
    root.style.setProperty("--subheading-scale", String(nextSettings.subheadingScale || 1.0));
  };

  useEffect(() => {
    applyCSSVariables(settings);
  }, [settings]);

  // Asynchronously hydrate from IndexedDB and sync with Cloud Firestore
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Step 1: Rapid local cache hydration
      try {
        const idbConfig = await getFromIndexedDB<SiteConfig>(SITE_CONFIG_KEY);
        if (idbConfig && mounted) {
          setConfigState((prev) => ({
            ...prev,
            ...idbConfig,
            hero: { ...prev.hero, ...idbConfig.hero },
            about: { ...prev.about, ...idbConfig.about },
            capabilities: { ...prev.capabilities, ...idbConfig.capabilities },
            process: { ...prev.process, ...idbConfig.process },
            skills: { ...prev.skills, ...idbConfig.skills },
            trainings: { ...prev.trainings, ...idbConfig.trainings },
            contact: { ...prev.contact, ...idbConfig.contact },
            projectsArchive: { ...prev.projectsArchive, ...idbConfig.projectsArchive },
          }));
        }

        const idbProjects = await getFromIndexedDB<Project[]>(PROJECTS_KEY);
        if (Array.isArray(idbProjects) && idbProjects.length > 0 && mounted) {
          setProjectsState(idbProjects);
        }
      } catch {
        // Keep in-memory and localStorage state
      }

      // Step 2: Fetch authoritative data from Cloud Firestore database
      try {
        setCloudStatus({ status: "syncing" });
        const [cloudProjects, cloudConfig, cloudSettings] = await Promise.all([
          loadProjectsFromCloud(),
          loadConfigFromCloud(),
          loadSettingsFromCloud(),
        ]);

        if (!mounted) return;

        let hasCloudData = false;

        if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
          hasCloudData = true;
          setProjectsState(cloudProjects);
          safeSetLocalStorage(PROJECTS_KEY, cloudProjects);
          saveToIndexedDB(PROJECTS_KEY, cloudProjects);
        }

        if (cloudConfig) {
          hasCloudData = true;
          setConfigState((prev) => ({
            ...prev,
            ...cloudConfig,
            hero: { ...prev.hero, ...(cloudConfig.hero || {}) },
            about: { ...prev.about, ...(cloudConfig.about || {}) },
            capabilities: { ...prev.capabilities, ...(cloudConfig.capabilities || {}) },
            process: { ...prev.process, ...(cloudConfig.process || {}) },
            skills: { ...prev.skills, ...(cloudConfig.skills || {}) },
            trainings: { ...prev.trainings, ...(cloudConfig.trainings || {}) },
            contact: { ...prev.contact, ...(cloudConfig.contact || {}) },
            projectsArchive: { ...prev.projectsArchive, ...(cloudConfig.projectsArchive || {}) },
          }));
          safeSetLocalStorage(SITE_CONFIG_KEY, cloudConfig);
          saveToIndexedDB(SITE_CONFIG_KEY, cloudConfig);
        }

        if (cloudSettings) {
          hasCloudData = true;
          setSettingsState(cloudSettings);
          safeSetLocalStorage(SETTINGS_KEY, cloudSettings);
          applyCSSVariables(cloudSettings);
        }

        // If cloud database is newly created and empty, automatically seed it with initial site data
        if (!hasCloudData) {
          await Promise.all([
            saveProjectsToCloud(projects),
            saveConfigToCloud(config),
            saveSettingsToCloud(settings),
          ]);
        }

        setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
      } catch (cloudErr) {
        console.warn("Cloud Firestore initial sync warning:", cloudErr);
        setCloudStatus({
          status: "error",
          error: cloudErr instanceof Error ? cloudErr.message : "Cloud sync failed",
        });
      }
    })();

    // Step 3: Realtime database subscriptions
    const unsubProjects = subscribeToCloudProjects((updatedProjects) => {
      if (mounted && Array.isArray(updatedProjects) && updatedProjects.length > 0) {
        setProjectsState(updatedProjects);
        safeSetLocalStorage(PROJECTS_KEY, updatedProjects);
        setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
      }
    });

    const unsubConfig = subscribeToCloudConfig((updatedConfig) => {
      if (mounted && updatedConfig) {
        setConfigState((prev) => ({ ...prev, ...updatedConfig }));
        safeSetLocalStorage(SITE_CONFIG_KEY, updatedConfig);
        setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
      }
    });

    const unsubSettings = subscribeToCloudSettings((updatedSettings) => {
      if (mounted && updatedSettings) {
        setSettingsState((prev) => {
          const merged = { ...prev, ...updatedSettings };
          applyCSSVariables(merged);
          return merged;
        });
        safeSetLocalStorage(SETTINGS_KEY, updatedSettings);
        setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
      }
    });

    return () => {
      mounted = false;
      unsubProjects();
      unsubConfig();
      unsubSettings();
    };
  }, []);

  // Manual explicit cloud actions
  const syncAllToCloud = async () => {
    setCloudStatus({ status: "syncing" });
    try {
      await Promise.all([
        saveProjectsToCloud(projects),
        saveConfigToCloud(config),
        saveSettingsToCloud(settings),
      ]);
      setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
    } catch (err) {
      setCloudStatus({
        status: "error",
        error: err instanceof Error ? err.message : "Manual sync failed",
      });
      throw err;
    }
  };

  const loadAllFromCloud = async () => {
    setCloudStatus({ status: "syncing" });
    try {
      const [cloudProjects, cloudConfig, cloudSettings] = await Promise.all([
        loadProjectsFromCloud(),
        loadConfigFromCloud(),
        loadSettingsFromCloud(),
      ]);
      if (cloudProjects) {
        setProjectsState(cloudProjects);
        safeSetLocalStorage(PROJECTS_KEY, cloudProjects);
        saveToIndexedDB(PROJECTS_KEY, cloudProjects);
      }
      if (cloudConfig) {
        setConfigState(cloudConfig);
        safeSetLocalStorage(SITE_CONFIG_KEY, cloudConfig);
        saveToIndexedDB(SITE_CONFIG_KEY, cloudConfig);
      }
      if (cloudSettings) {
        setSettingsState(cloudSettings);
        safeSetLocalStorage(SETTINGS_KEY, cloudSettings);
        applyCSSVariables(cloudSettings);
      }
      setCloudStatus({ status: "saved", lastSyncedAt: new Date() });
    } catch (err) {
      setCloudStatus({
        status: "error",
        error: err instanceof Error ? err.message : "Load failed",
      });
      throw err;
    }
  };

  const updateConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    setConfigState((prev) => {
      const next = updater(prev);
      safeSetLocalStorage(SITE_CONFIG_KEY, next);
      saveToIndexedDB(SITE_CONFIG_KEY, next);

      // Debounced Cloud Firestore write
      if (configDebounceRef.current) {
        window.clearTimeout(configDebounceRef.current);
      }
      setCloudStatus({ status: "syncing" });
      configDebounceRef.current = window.setTimeout(() => {
        saveConfigToCloud(next)
          .then(() => setCloudStatus({ status: "saved", lastSyncedAt: new Date() }))
          .catch((err) =>
            setCloudStatus({
              status: "error",
              error: err instanceof Error ? err.message : "Config cloud save error",
            })
          );
      }, 600);

      return next;
    });
  };

  const resetConfig = () => {
    try {
      localStorage.removeItem(SITE_CONFIG_KEY);
    } catch {}
    saveToIndexedDB(SITE_CONFIG_KEY, defaultSiteConfig);
    setConfigState(defaultSiteConfig);
    saveConfigToCloud(defaultSiteConfig).catch(() => {});
  };

  const updateSettings = (updater: (prev: PortfolioSettings) => PortfolioSettings) => {
    setSettingsState((prev) => {
      const next = updater(prev);
      safeSetLocalStorage(SETTINGS_KEY, next);
      applyCSSVariables(next);

      // Debounced Cloud Firestore write
      if (settingsDebounceRef.current) {
        window.clearTimeout(settingsDebounceRef.current);
      }
      setCloudStatus({ status: "syncing" });
      settingsDebounceRef.current = window.setTimeout(() => {
        saveSettingsToCloud(next)
          .then(() => setCloudStatus({ status: "saved", lastSyncedAt: new Date() }))
          .catch((err) =>
            setCloudStatus({
              status: "error",
              error: err instanceof Error ? err.message : "Settings cloud save error",
            })
          );
      }, 600);

      return next;
    });
  };

  const resetSettings = () => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
    const root = document.documentElement;
    ["--accent", "--accent-2", "--bg", "--radius", "--section-space", "--heading-scale", "--subheading-scale"].forEach((key) =>
      root.style.removeProperty(key)
    );
    setSettingsState(defaultSettings);
    applyCSSVariables(defaultSettings);
    saveSettingsToCloud(defaultSettings).catch(() => {});
  };

  const saveProjects = (next: Project[]) => {
    setProjectsState(next);
    safeSetLocalStorage(PROJECTS_KEY, next);
    saveToIndexedDB(PROJECTS_KEY, next);
    window.dispatchEvent(new CustomEvent<Project[]>("portfolio-projects-updated", { detail: next }));

    // Instant Cloud Firestore save for projects & case study media
    setCloudStatus({ status: "syncing" });
    saveProjectsToCloud(next)
      .then(() => setCloudStatus({ status: "saved", lastSyncedAt: new Date() }))
      .catch((err) => {
        console.error("Cloud projects save error:", err);
        setCloudStatus({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to save projects to cloud",
        });
      });
  };

  const resetProjects = () => {
    try {
      localStorage.removeItem(PROJECTS_KEY);
    } catch {}
    saveToIndexedDB(PROJECTS_KEY, initialCaseStudies);
    saveProjects(initialCaseStudies);
  };

  return (
    <SiteContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        settings,
        updateSettings,
        resetSettings,
        projects,
        setProjects: setProjectsState,
        saveProjects,
        resetProjects,
        cloudStatus,
        syncAllToCloud,
        loadAllFromCloud,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return ctx;
}
