import { type Project } from "./data";

export type AppView = "home" | "projects" | "case-study";

export interface ParsedRoute {
  view: AppView;
  sectionId?: string;
  projectIndex?: number;
  projectSlug?: string;
  archiveFilter?: "all" | "archive" | "beyond";
  openAdmin?: boolean;
}

/**
 * Generates a clean, URL-safe slug from a project title or section name.
 */
export function slugify(text: string): string {
  const base = (text || "")
    .split("—")[0]
    .split("-")[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "project";
}

/**
 * Generates a unique, human-readable slug for a project at a given index.
 */
export function getProjectSlug(project: Project | undefined | null, index: number): string {
  if (!project?.title) return `project-${index + 1}`;
  return slugify(project.title);
}

/**
 * Maps internal home section IDs to clean, canonical URL path segments.
 */
export const SECTION_TO_PATH: Record<string, string> = {
  home: "/",
  work: "/work",
  "what-i-can-do": "/capabilities",
  capabilities: "/capabilities",
  process: "/process",
  about: "/about",
  trainings: "/experience",
  experience: "/experience",
  skills: "/skills",
  contact: "/contact",
};

/**
 * Maps URL path segments back to internal home section IDs.
 */
export const PATH_TO_SECTION: Record<string, string> = {
  "": "home",
  home: "home",
  work: "work",
  "project-work": "work",
  capabilities: "what-i-can-do",
  "what-i-can-do": "what-i-can-do",
  process: "process",
  "design-process": "process",
  about: "about",
  experience: "trainings",
  trainings: "trainings",
  skills: "skills",
  contact: "contact",
};

/**
 * Builds a complete, distinct URL pathname for any page, section, archive tab, or case study.
 */
export function buildPageUrl(params: {
  view: AppView;
  sectionId?: string;
  projectIndex?: number;
  projects?: Project[];
  archiveFilter?: "all" | "archive" | "beyond";
}): string {
  const { view, sectionId, projectIndex = 0, projects = [], archiveFilter } = params;

  if (view === "projects") {
    if (archiveFilter === "archive") return "/projects/archive";
    if (archiveFilter === "beyond") return "/projects/explorations";
    return "/projects";
  }

  if (view === "case-study") {
    const proj = projects[projectIndex];
    const slug = getProjectSlug(proj, projectIndex);
    return `/case-study/${slug}`;
  }

  // Home view or specific section route
  if (!sectionId || sectionId === "home") {
    return "/";
  }
  return SECTION_TO_PATH[sectionId] || `/${slugify(sectionId)}`;
}

/**
 * Parses the current browser URL (`window.location.pathname` and `window.location.hash`)
 * into a structured route state so direct visits, refreshes, and back/forward navigation work seamlessly.
 */
export function parseCurrentUrl(projects: Project[]): ParsedRoute {
  if (typeof window === "undefined") {
    return { view: "home", sectionId: "home" };
  }

  const rawPathname = window.location.pathname || "/";
  const rawHash = (window.location.hash || "").replace(/^#\/?/, "").trim();

  // Normalize segments from pathname (or fallback hash if someone used a hash link)
  const effectivePath =
    rawPathname !== "/" && rawPathname !== "/index.html"
      ? rawPathname
      : rawHash
      ? `/${rawHash}`
      : "/";

  const segments = effectivePath
    .split("/")
    .map((s) => decodeURIComponent(s.trim().toLowerCase()))
    .filter(Boolean);

  if (segments.length === 0) {
    return { view: "home", sectionId: "home" };
  }

  const first = segments[0];
  const second = segments[1] || "";

  // 1. Admin shortcut route (/admin)
  if (first === "admin") {
    return { view: "home", sectionId: "home", openAdmin: true };
  }

  // 2. Projects Archive routes (/projects, /archive, /projects/archive, /projects/explorations)
  if (first === "projects" || first === "archive") {
    if (second === "archive" || second === "case-studies") {
      return { view: "projects", archiveFilter: "archive" };
    }
    if (second === "explorations" || second === "beyond" || second === "beyond-the-brief") {
      return { view: "projects", archiveFilter: "beyond" };
    }
    // Check if /projects/<project-slug> was visited directly
    if (second) {
      const matchedIdx = findProjectIndexBySlug(projects, second);
      if (matchedIdx !== -1) {
        return {
          view: "case-study",
          projectIndex: matchedIdx,
          projectSlug: getProjectSlug(projects[matchedIdx], matchedIdx),
        };
      }
    }
    return { view: "projects", archiveFilter: "all" };
  }

  // 3. Case Study routes (/case-study/<slug>, /case-studies/<slug>, /project/<slug>)
  if (first === "case-study" || first === "case-studies" || first === "project") {
    if (!second) {
      return {
        view: "case-study",
        projectIndex: 0,
        projectSlug: getProjectSlug(projects[0], 0),
      };
    }
    const matchedIdx = findProjectIndexBySlug(projects, second);
    const resolvedIdx = matchedIdx !== -1 ? matchedIdx : 0;
    return {
      view: "case-study",
      projectIndex: resolvedIdx,
      projectSlug: second,
    };
  }

  // 4. Section routes on Home (/work, /capabilities, /process, /about, /experience, /skills, /contact)
  if (first in PATH_TO_SECTION) {
    return {
      view: "home",
      sectionId: PATH_TO_SECTION[first],
    };
  }

  // 5. Direct project slug at root level (e.g. /vedic-sewa, /mero-route)
  const directProjectIdx = findProjectIndexBySlug(projects, first);
  if (directProjectIdx !== -1) {
    return {
      view: "case-study",
      projectIndex: directProjectIdx,
      projectSlug: getProjectSlug(projects[directProjectIdx], directProjectIdx),
    };
  }

  return { view: "home", sectionId: "home" };
}

/**
 * Matches a URL slug or 1-based index to a project in the projects list.
 */
export function findProjectIndexBySlug(projects: Project[], slugOrIndex: string): number {
  if (!projects || projects.length === 0) return -1;
  const clean = slugOrIndex.trim().toLowerCase();

  // Check exact slug match first
  for (let i = 0; i < projects.length; i++) {
    if (getProjectSlug(projects[i], i) === clean) {
      return i;
    }
  }

  // Check full title slug match or partial prefix match
  for (let i = 0; i < projects.length; i++) {
    const fullSlug = (projects[i]?.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (fullSlug === clean || fullSlug.startsWith(clean) || clean.startsWith(getProjectSlug(projects[i], i))) {
      return i;
    }
  }

  // Check numeric index fallback (e.g. /case-study/1 or /case-study/01)
  const numeric = Number.parseInt(clean, 10);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= projects.length) {
    return numeric - 1;
  }

  return -1;
}

/**
 * Updates the browser URL bar and document title cleanly without triggering a page reload.
 */
export function syncBrowserUrl(
  urlPath: string,
  options: { replace?: boolean; title?: string } = {}
) {
  if (typeof window === "undefined") return;
  const { replace = false, title } = options;

  if (title && typeof document !== "undefined") {
    document.title = title;
  }

  const currentPath = window.location.pathname + window.location.hash;
  if (currentPath === urlPath) return;

  try {
    if (replace) {
      window.history.replaceState({ path: urlPath }, "", urlPath);
    } else {
      window.history.pushState({ path: urlPath }, "", urlPath);
    }
  } catch {
    // Fallback if history API is restricted in sandboxed iframe
  }
}
