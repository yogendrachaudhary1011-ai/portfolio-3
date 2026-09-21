import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { SiteConfig, PortfolioSettings } from "./siteContext";
import type { Project } from "./data";
import {
  compressImageFile,
  saveImageToIndexedDB,
  getImageFromIndexedDB,
  getImageMemoryCache,
} from "./storage";

const CONFIG_DOC_ID = "main_config";
const SETTINGS_DOC_ID = "main_settings";
const PROJECTS_DOC_ID = "main_projects";

export interface CloudSyncStatus {
  status: "idle" | "syncing" | "saved" | "error";
  lastSyncedAt?: Date;
  error?: string;
}

// ──────────────────────────────────────────────
// Image Cloud Persistence & Resolution
// ──────────────────────────────────────────────

/**
 * Saves a base64 image dataUrl to Firestore's uploaded_images collection.
 * Uses in-memory and IndexedDB caching for instant zero-latency retrieval.
 * Returns a stable reference: 'cloud-img://<id>'
 */
export async function saveImageToCloud(dataUrl: string, explicitId?: string): Promise<string> {
  if (!dataUrl) return "";

  // If already a cloud reference or remote URL, return as-is
  if (
    dataUrl.startsWith("cloud-img://") ||
    dataUrl.startsWith("http://") ||
    dataUrl.startsWith("https://") ||
    dataUrl.startsWith("/")
  ) {
    return dataUrl;
  }

  if (!dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }

  // Generate clean document ID for Firestore
  const id = explicitId || `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

  // Immediately cache in memory and IndexedDB
  const cache = getImageMemoryCache();
  cache.set(id, dataUrl);
  cache.set(`cloud-img://${id}`, dataUrl);
  await saveImageToIndexedDB(id, dataUrl);

  // Persist directly to Firestore database uploaded_images collection
  try {
    const imageDocRef = doc(db, "uploaded_images", id);
    await setDoc(
      imageDocRef,
      {
        id,
        dataUrl,
        size: dataUrl.length,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[cloudStore] Failed to persist image "${id}" to Firestore:`, err);
  }

  return `cloud-img://${id}`;
}

/**
 * Loads a cloud image by ID from memory cache, IndexedDB, or Firestore uploaded_images.
 */
export async function loadImageFromCloud(refOrId: string): Promise<string | null> {
  if (!refOrId) return null;
  const cleanId = refOrId.replace(/^cloud-img:\/\//, "");

  // 1. In-memory cache (instant)
  const cache = getImageMemoryCache();
  const memCached = cache.get(cleanId) || cache.get(`cloud-img://${cleanId}`);
  if (memCached) return memCached;

  // 2. IndexedDB cache (fast)
  try {
    const idbData = await getImageFromIndexedDB(cleanId);
    if (idbData) {
      cache.set(cleanId, idbData);
      cache.set(`cloud-img://${cleanId}`, idbData);
      return idbData;
    }
  } catch {
    // Continue to Firestore
  }

  // 3. Firestore uploaded_images collection
  try {
    const docRef = doc(db, "uploaded_images", cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.dataUrl) {
        cache.set(cleanId, data.dataUrl);
        cache.set(`cloud-img://${cleanId}`, data.dataUrl);
        await saveImageToIndexedDB(cleanId, data.dataUrl);
        return data.dataUrl;
      }
    }
  } catch (err) {
    console.warn(`[cloudStore] Could not load image "${cleanId}" from Firestore:`, err);
  }

  return null;
}

/**
 * Resolves a single image reference (which may be a cloud-img:// pointer)
 * into a real dataUrl or remote URL.
 */
export async function resolveImageRef(refOrUrl: string): Promise<string> {
  if (!refOrUrl || !refOrUrl.startsWith("cloud-img://")) {
    return refOrUrl;
  }
  const resolved = await loadImageFromCloud(refOrUrl);
  return resolved || refOrUrl;
}

/**
 * Resolves all cloud-img references in a list of projects into their full image data
 * before delivering them to React components or state.
 */
export async function resolveProjectImages(projects: Project[]): Promise<Project[]> {
  const result: Project[] = [];

  for (const project of projects) {
    let thumbnail = project.thumbnail || "";
    let image = project.image || "";
    const media: string[] = [];

    if (thumbnail.startsWith("cloud-img://")) {
      thumbnail = await resolveImageRef(thumbnail);
    }
    if (image.startsWith("cloud-img://")) {
      image = await resolveImageRef(image);
    }

    if (Array.isArray(project.media)) {
      for (const m of project.media) {
        if (m.startsWith("cloud-img://")) {
          const resolved = await resolveImageRef(m);
          media.push(resolved);
        } else {
          media.push(m);
        }
      }
    }

    result.push({
      ...project,
      thumbnail,
      image,
      media,
    });
  }

  return result;
}

/**
 * Iterates through projects, uploads any new base64 data URLs to Firestore uploaded_images,
 * and converts them to lightweight 'cloud-img://<id>' pointers for the projects manifest.
 */
export async function persistProjectImagesToCloud(projects: Project[]): Promise<Project[]> {
  const processedProjects: Project[] = [];

  for (const project of (projects || []).filter(Boolean)) {
    let thumbnail = project.thumbnail || "";
    let image = project.image || "";
    const media: string[] = [];

    // Persist thumbnail if it is a raw data URL
    if (thumbnail.startsWith("data:image/")) {
      thumbnail = await saveImageToCloud(thumbnail);
    }

    // Persist main image if it is a raw data URL
    if (image.startsWith("data:image/")) {
      image = await saveImageToCloud(image);
    }

    // Persist case study visual stream media
    if (Array.isArray(project.media)) {
      for (const m of project.media) {
        if (m && m.startsWith("data:image/")) {
          const ref = await saveImageToCloud(m);
          media.push(ref);
        } else if (m) {
          media.push(m);
        }
      }
    }

    processedProjects.push({
      ...project,
      thumbnail,
      image,
      media,
    });
  }

  return processedProjects;
}

/**
 * High-level helper for AdminPanel: Compresses an uploaded image file,
 * caches it locally, saves it to Firestore uploaded_images, and returns
 * both the immediate dataUrl and persistent cloudRef.
 */
export async function uploadImageFileToDatabase(
  file: File,
  maxWidth = 1800,
  quality = 0.86
): Promise<{ dataUrl: string; cloudRef: string }> {
  const dataUrl = await compressImageFile(file, maxWidth, quality);
  const cloudRef = await saveImageToCloud(dataUrl);
  return { dataUrl, cloudRef };
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
    // 1. Ensure all heavy image data is persisted to uploaded_images collection first
    const cloudProjects = await persistProjectImagesToCloud(projects);

    const projectsRef = doc(db, "projects", PROJECTS_DOC_ID);
    // 2. Sanitize any undefined values that Firestore rejects
    const sanitizedProjects = (cloudProjects || []).filter(Boolean).map((p) => ({
      title: p?.title || "",
      desc: p?.desc || "",
      stack: p?.stack || "",
      thumbnail: p?.thumbnail || "",
      image: p?.image || "",
      media: Array.isArray(p?.media) ? p.media : [],
      tech: Array.isArray(p?.tech) ? p.tech : [],
      pdfKey: p?.pdfKey || "",
      pdfUrls: Array.isArray(p?.pdfUrls) ? p.pdfUrls : [],
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
      if (Array.isArray(data.items)) {
        return await resolveProjectImages(data.items as Project[]);
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
    async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.items)) {
          const resolved = await resolveProjectImages(data.items as Project[]);
          onUpdate(resolved);
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

// ──────────────────────────────────────────────
// Contact Messages (Cloud Firestore Persistence)
// ──────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: string;
  createdAt?: unknown;
}

/**
 * Persists a new visitor message to Firestore's `messages` collection.
 * Also synchronizes local storage cache for offline resilience.
 */
export async function sendMessageToCloud(msg: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const messageData: ContactMessage = {
    id: messageId,
    name: msg.name.trim(),
    email: msg.email.trim(),
    message: msg.message.trim(),
    sentAt: now,
  };

  try {
    const messageRef = doc(db, "messages", messageId);
    await setDoc(messageRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });
  } catch (firestoreErr) {
    console.error("Failed to write message directly to Firestore collection:", firestoreErr);
    throw firestoreErr;
  }

  // Also cache locally
  try {
    const raw = localStorage.getItem("yogendra-portfolio-messages");
    const existing: ContactMessage[] = raw ? JSON.parse(raw) : [];
    const updated = [messageData, ...existing.filter((m) => m.id !== messageId)];
    localStorage.setItem("yogendra-portfolio-messages", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("portfolio-messages-updated", { detail: updated }));
  } catch (cacheErr) {
    console.warn("Could not cache message to local storage:", cacheErr);
  }

  return messageData;
}

/**
 * Loads all visitor messages from Firestore `messages` collection.
 */
export async function loadMessagesFromCloud(): Promise<ContactMessage[]> {
  try {
    const messagesCol = collection(db, "messages");
    const snap = await getDocs(messagesCol);
    const messages: ContactMessage[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        name: data.name || "",
        email: data.email || "",
        message: data.message || "",
        sentAt: data.sentAt || new Date().toISOString(),
      });
    });
    messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    try {
      localStorage.setItem("yogendra-portfolio-messages", JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent("portfolio-messages-updated", { detail: messages }));
    } catch {}

    return messages;
  } catch (err) {
    console.warn("Could not load messages from Firestore collection:", err);
    try {
      const raw = localStorage.getItem("yogendra-portfolio-messages");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Subscribes to real-time updates on visitor messages in Firestore.
 */
export function subscribeToCloudMessages(onUpdate: (messages: ContactMessage[]) => void) {
  const messagesCol = collection(db, "messages");
  return onSnapshot(
    messagesCol,
    (snap) => {
      const messages: ContactMessage[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          name: data.name || "",
          email: data.email || "",
          message: data.message || "",
          sentAt: data.sentAt || new Date().toISOString(),
        });
      });
      messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      try {
        localStorage.setItem("yogendra-portfolio-messages", JSON.stringify(messages));
      } catch {}

      onUpdate(messages);
    },
    (err) => console.warn("Messages realtime subscription warning:", err)
  );
}

/**
 * Deletes a single visitor message from Firestore.
 */
export async function deleteMessageFromCloud(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, "messages", String(messageId));
    await deleteDoc(messageRef);

    try {
      const raw = localStorage.getItem("yogendra-portfolio-messages");
      if (raw) {
        const existing: ContactMessage[] = JSON.parse(raw);
        const filtered = existing.filter((m) => m.id !== String(messageId));
        localStorage.setItem("yogendra-portfolio-messages", JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent("portfolio-messages-updated", { detail: filtered }));
      }
    } catch {}
  } catch (err) {
    console.error("Failed to delete message from cloud:", err);
    throw err;
  }
}

/**
 * Clears all visitor messages from Firestore.
 */
export async function clearAllMessagesFromCloud(): Promise<void> {
  try {
    const messagesCol = collection(db, "messages");
    const snap = await getDocs(messagesCol);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    try {
      localStorage.removeItem("yogendra-portfolio-messages");
      window.dispatchEvent(new CustomEvent("portfolio-messages-updated", { detail: [] }));
    } catch {}
  } catch (err) {
    console.error("Failed to clear messages from cloud:", err);
    throw err;
  }
}
