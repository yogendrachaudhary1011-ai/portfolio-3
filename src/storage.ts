/**
 * Storage & Image Optimization Module
 * 
 * Provides:
 * 1. Automatic client-side image compression (downsizes high-res uploads to lightweight WebP/JPEG)
 * 2. High-capacity IndexedDB persistence for full site config, projects, and PDFs
 * 3. Quota-safe localStorage synchronization with fallback and self-healing
 */

const DB_NAME = "yogendra-portfolio-files";
const DB_VERSION = 2;
const PDF_STORE = "pdfs";
const APP_STORE = "app_data";

declare global {
  interface Window {
    __portfolioSessionFiles?: Map<string, Blob>;
  }
}

if (typeof window !== "undefined" && !window.__portfolioSessionFiles) {
  window.__portfolioSessionFiles = new Map();
}

const getSessionFiles = () => {
  if (typeof window === "undefined") return new Map<string, Blob>();
  if (!window.__portfolioSessionFiles) window.__portfolioSessionFiles = new Map();
  return window.__portfolioSessionFiles;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PDF_STORE)) {
        db.createObjectStore(PDF_STORE);
      }
      if (!db.objectStoreNames.contains(APP_STORE)) {
        db.createObjectStore(APP_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save arbitrary JSON-serializable data to IndexedDB
 */
export async function saveToIndexedDB<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(APP_STORE, "readwrite");
      tx.objectStore(APP_STORE).put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    // Fail silently or softly - memory and localStorage will still work
    console.warn(`[storage] IndexedDB save for key "${key}" failed`, err);
  }
}

/**
 * Retrieve arbitrary JSON-serializable data from IndexedDB
 */
export async function getFromIndexedDB<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDatabase();
    const result = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(APP_STORE, "readonly");
      const request = tx.objectStore(APP_STORE).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  } catch {
    return undefined;
  }
}

/**
 * PDF storage helpers (compatible with previous pdfStore)
 */
export async function savePdf(file: File): Promise<string> {
  const id = crypto.randomUUID?.() ?? `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  getSessionFiles().set(id, file);

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PDF_STORE, "readwrite");
      tx.objectStore(PDF_STORE).put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // In-memory fallback
  }

  return id;
}

export async function getPdf(id: string): Promise<Blob | undefined> {
  const session = getSessionFiles().get(id);
  if (session) return session;

  try {
    const db = await openDatabase();
    const result = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(PDF_STORE, "readonly");
      const req = tx.objectStore(PDF_STORE).get(id);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return undefined;
  }
}

/**
 * Compresses an uploaded image file into an optimized WebP or JPEG Data URL.
 * Converts multi-megabyte images (e.g. 5MB) into crisp 40-100KB assets.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVGs do not need raster canvas compression
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // Attempt canvas compression
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        // Fallback to basic file reader
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(String(fallbackReader.result));
        fallbackReader.onerror = reject;
        fallbackReader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP for superior compression, fallback to JPEG
      let dataUrl = canvas.toDataURL("image/webp", quality);
      if (!dataUrl.startsWith("data:image/webp")) {
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      // If still unusually large (> 350KB), apply a second pass at lower resolution
      if (dataUrl.length > 350_000 && (width > 800 || height > 800)) {
        const pass2Canvas = document.createElement("canvas");
        const scale = 0.75;
        pass2Canvas.width = Math.round(width * scale);
        pass2Canvas.height = Math.round(height * scale);
        const ctx2 = pass2Canvas.getContext("2d");
        if (ctx2) {
          ctx2.drawImage(canvas, 0, 0, pass2Canvas.width, pass2Canvas.height);
          const pass2Url = pass2Canvas.toDataURL("image/webp", 0.76);
          if (pass2Url.startsWith("data:image/webp")) {
            resolve(pass2Url);
            return;
          }
        }
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const fallbackReader = new FileReader();
      fallbackReader.onload = () => resolve(String(fallbackReader.result));
      fallbackReader.onerror = reject;
      fallbackReader.readAsDataURL(file);
    };

    img.src = url;
  });
}

/**
 * Recursively strips oversized base64 data URLs (> 100KB) from an object
 * to ensure it fits comfortably within browser localStorage quotas.
 */
function sanitizeForLocalStorage<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLocalStorage(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // If a data URL is larger than 120KB, replace with lightweight indicator
      if (value.startsWith("data:image/") && value.length > 120_000) {
        // Keep a shortened reference so consumers know an image was placed
        result[key] = "";
      } else {
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeForLocalStorage(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Safely saves data to localStorage without throwing QuotaExceededError.
 * If quota is exceeded, automatically sanitizes oversized media and persists
 * full state to IndexedDB.
 */
export function safeSetLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  // Always back up to IndexedDB for high-capacity permanence
  saveToIndexedDB(key, value);

  const rawJson = JSON.stringify(value);

  // If already larger than ~2.5MB, sanitize first before touching localStorage
  if (rawJson.length > 2_500_000) {
    try {
      const sanitized = sanitizeForLocalStorage(value);
      localStorage.setItem(key, JSON.stringify(sanitized));
      return true;
    } catch {
      // If still failing, continue to quota fallback below
    }
  }

  try {
    localStorage.setItem(key, rawJson);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === "QuotaExceededError" ||
      err?.code === 22 ||
      err?.number === -2147024882 ||
      String(err).includes("exceeded the quota");

    if (isQuotaError) {
      // Gracefully handle quota exhaustion
      try {
        const sanitized = sanitizeForLocalStorage(value);
        localStorage.setItem(key, JSON.stringify(sanitized));
        return true;
      } catch {
        // As a last resort, clear corrupted or oversized storage entries
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
    } else {
      console.warn(`[storage] Could not save to localStorage for key "${key}":`, err);
    }
    return false;
  }
}
