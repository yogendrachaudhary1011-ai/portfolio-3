import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { SiteConfig, PortfolioSettings } from "./siteContext";
import type { Project } from "./data";

const CONFIG_DOC_ID = "main_config";
const SETTINGS_DOC_ID = "main_settings";
const PROJECTS_DOC_ID = "main_projects";

export interface CloudSyncStatus {
  status: "idle" | "syncing" | "saved" | "error";
  lastSyncedAt?: Date;
  error?: string;
}

// ──────────────────────────────────────────────
// Save Functions (Write to Cloud Firestore)
// ──────────────────────────────────────────────

export async function saveConfigToCloud(config: SiteConfig): Promise<void> {
  try {
    const configRef = doc(db, "site_configs", CONFIG_DOC_ID);
    await setDoc(
      configRef,
      {
        ...config,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save config to Firestore:", err);
    throw err;
  }
}

export async function saveSettingsToCloud(settings: PortfolioSettings): Promise<void> {
  try {
    const settingsRef = doc(db, "site_settings", SETTINGS_DOC_ID);
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save settings to Firestore:", err);
    throw err;
  }
}

export async function saveProjectsToCloud(projects: Project[]): Promise<void> {
  try {
    const projectsRef = doc(db, "projects", PROJECTS_DOC_ID);
    // Sanitize any undefined values that Firestore rejects
    const sanitizedProjects = projects.map((p) => ({
      title: p.title || "",
      desc: p.desc || "",
      stack: p.stack || "",
      thumbnail: p.thumbnail || "",
      image: p.image || "",
      media: Array.isArray(p.media) ? p.media : [],
      tech: Array.isArray(p.tech) ? p.tech : [],
      pdfKey: p.pdfKey || "",
      pdfUrls: Array.isArray(p.pdfUrls) ? p.pdfUrls : [],
    }));

    await setDoc(
      projectsRef,
      {
        items: sanitizedProjects,
        count: sanitizedProjects.length,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save projects to Firestore:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────
// Fetch Functions (Read from Cloud Firestore)
// ──────────────────────────────────────────────

export async function loadConfigFromCloud(): Promise<SiteConfig | null> {
  try {
    const configRef = doc(db, "site_configs", CONFIG_DOC_ID);
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      const { updatedAt, ...cleanConfig } = data;
      return cleanConfig as SiteConfig;
    }
  } catch (err) {
    console.warn("Could not load config from Firestore:", err);
  }
  return null;
}

export async function loadSettingsFromCloud(): Promise<PortfolioSettings | null> {
  try {
    const settingsRef = doc(db, "site_settings", SETTINGS_DOC_ID);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      const data = snap.data();
      const { updatedAt, ...cleanSettings } = data;
      return cleanSettings as PortfolioSettings;
    }
  } catch (err) {
    console.warn("Could not load settings from Firestore:", err);
  }
  return null;
}

export async function loadProjectsFromCloud(): Promise<Project[] | null> {
  try {
    const projectsRef = doc(db, "projects", PROJECTS_DOC_ID);
    const snap = await getDoc(projectsRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items as Project[];
      }
    }
  } catch (err) {
    console.warn("Could not load projects from Firestore:", err);
  }
  return null;
}

// ──────────────────────────────────────────────
// Realtime Subscriptions
// ──────────────────────────────────────────────

export function subscribeToCloudProjects(onUpdate: (projects: Project[]) => void) {
  const projectsRef = doc(db, "projects", PROJECTS_DOC_ID);
  return onSnapshot(
    projectsRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          onUpdate(data.items as Project[]);
        }
      }
    },
    (err) => console.warn("Projects realtime sync warning:", err)
  );
}

export function subscribeToCloudConfig(onUpdate: (config: Partial<SiteConfig>) => void) {
  const configRef = doc(db, "site_configs", CONFIG_DOC_ID);
  return onSnapshot(
    configRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const { updatedAt, ...cleanConfig } = data;
        onUpdate(cleanConfig as Partial<SiteConfig>);
      }
    },
    (err) => console.warn("Config realtime sync warning:", err)
  );
}

export function subscribeToCloudSettings(onUpdate: (settings: Partial<PortfolioSettings>) => void) {
  const settingsRef = doc(db, "site_settings", SETTINGS_DOC_ID);
  return onSnapshot(
    settingsRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const { updatedAt, ...cleanSettings } = data;
        onUpdate(cleanSettings as Partial<PortfolioSettings>);
      }
    },
    (err) => console.warn("Settings realtime sync warning:", err)
  );
}
