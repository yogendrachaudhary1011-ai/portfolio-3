const DATABASE = "yogendra-portfolio-files";
const STORE = "pdfs";

// Survive Vite HMR module reloads by anchoring the map on window.
declare global { interface Window { __pdfSessionFiles?: Map<string, Blob> } }
if (!window.__pdfSessionFiles) window.__pdfSessionFiles = new Map();
const sessionFiles = window.__pdfSessionFiles;

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function savePdf(file: File) {
  const id = crypto.randomUUID?.() ?? `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionFiles.set(id, file);
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(file, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {
    // The in-memory copy keeps the newly uploaded file available for this session.
  }
  return id;
}

export async function getPdf(id: string) {
  const sessionFile = sessionFiles.get(id);
  if (sessionFile) return sessionFile;
  try {
    const database = await openDatabase();
    const file = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = database.transaction(STORE, "readonly").objectStore(STORE).get(id);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return file;
  } catch {
    return undefined;
  }
}
