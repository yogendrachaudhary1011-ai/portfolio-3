import { getImageMemoryCache } from "./storage";

export const img = (id: string, w: number, h: number) => {
  if (!id) return "";
  if (id.startsWith("http") || id.startsWith("data:") || id.startsWith("blob:") || id.startsWith("/")) return id;
  if (id.startsWith("cloud-img://")) {
    const cleanId = id.replace("cloud-img://", "");
    const cached = getImageMemoryCache().get(cleanId) || getImageMemoryCache().get(id);
    if (cached) return cached;
    return "";
  }
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format,compress&q=80`;
};

export const getFullWidthImageUrl = (id: string) => {
  if (!id) return "";
  if (id.startsWith("http") || id.startsWith("data:") || id.startsWith("blob:") || id.startsWith("/")) return id;
  if (id.startsWith("cloud-img://")) {
    const cleanId = id.replace("cloud-img://", "");
    const cached = getImageMemoryCache().get(cleanId) || getImageMemoryCache().get(id);
    if (cached) return cached;
    return "";
  }
  return `https://images.unsplash.com/photo-${id}?w=1440&auto=format,compress&q=80`;
};

export const PORTRAIT = "1573496359142-b8d87734a5a2";

export const NAV = ["Project Work", "What I Can Do", "Design Process", "About", "Experience", "Skills"];

export const galleryProjects = [
  {
    title: "Vedic Sewa — Spiritual Services Platform",
    desc: "A respectful, modern mobile experience for discovering pujas, booking services, consulting gurus, and managing ongoing spiritual activities.",
    image: "1551288049-bebda4e38f71",
  },
  {
    title: "Mero Route — Kathmandu Transit",
    desc: "A commuter-focused mobile concept that makes routes, transfers, and transport information easier to understand at a glance.",
    image: "1460925895917-afdab827c52f",
  },
  {
    title: "Office Management System",
    desc: "A role-based web platform for attendance, visitor management, employee records, and front-desk operations.",
    image: "1686061592689-312bbfb5c055",
  },
  {
    title: "Career Launchpad — Student Guidance",
    desc: "A web and mobile platform that helps +2 graduates explore careers, assess interests, and take practical next steps.",
    image: "1599658880436-c61792e70672",
  },
  {
    title: "Interface Explorations",
    desc: "Personal studies in visual hierarchy, responsive systems, interaction states, and clear product storytelling.",
    image: "1504868584819-f8e8b4b6d7e3",
  },
];

export type Project = { title: string; desc: string; stack?: string; image?: string; thumbnail?: string; media?: string[]; pdfUrls?: string[]; pdfKey?: string; tech?: string[] };

export const capabilities = [
  {
    num: "01",
    tag: "Product & UX Design",
    desc: "Turning ambiguous problems into clear, validated product decisions — from research and flows to prototypes tested with real users, always grounded in outcomes over output.",
    skills: [
      "UX Research",
      "User Flows",
      "Wireframing",
      "Prototyping",
      "Usability Testing",
      "Information Architecture",
      "Journey Mapping",
      "Interaction Design",
    ],
  },
  {
    num: "02",
    tag: "UI & Design Systems",
    desc: "Crafting polished, accessible interfaces backed by scalable systems — design tokens, reusable components, and motion that make products feel considered and cohesive at any scale.",
    skills: [
      "Visual Design",
      "Design Systems",
      "Component Libraries",
      "Design Tokens",
      "Motion Design",
      "Accessibility",
      "Responsive Design",
      "Prototyping in Figma",
    ],
  },
];

export const techStack = [
  { name: "Figma", icon: "figma/figma-original" },
  { name: "Photoshop", icon: "photoshop/photoshop-original" },
  { name: "Illustrator", icon: "illustrator/illustrator-original" },
  { name: "Adobe XD", icon: "xd/xd-plain" },
  { name: "After Effects", icon: "aftereffects/aftereffects-plain" },
  { name: "Premiere", icon: "premierepro/premierepro-plain" },
  { name: "Canva", icon: "canva/canva-original" },
  { name: "Blender", icon: "blender/blender-original" },
  { name: "HTML5", icon: "html5/html5-original" },
  { name: "CSS3", icon: "css3/css3-original" },
  { name: "JavaScript", icon: "javascript/javascript-original" },
  { name: "React", icon: "react/react-original" },
  { name: "Tailwind", icon: "tailwindcss/tailwindcss-original" },
  { name: "Sass", icon: "sass/sass-original" },
  { name: "Git", icon: "git/git-original" },
  { name: "GitHub", icon: "github/github-original" },
];

export const awards = [
  { title: "Awwwards — Honorable Mention", icon: "🏆" },
  { title: "CSS Design Awards — Best UI/UX", icon: "🏆" },
  { title: "Behance — Featured Designer", icon: "🏆" },
];

export const awardPhotos = [
  "1633734973050-d6499a977c17",
  "1496469888073-80de7e952517",
  "1758270703639-5f6f600baffa",
  "1717508996601-2860737361b1",
  "1742630834461-cc6b59a9e3d3",
  "1706402716204-494c637ab257",
];

export const trainings = [{
  title: "UI/UX Design Intern",
  org: "Product Design Team · Kathmandu",
  date: "Recent internship",
  desc: "Worked across wireframes, user flows, high-fidelity interfaces, prototypes, reusable components, responsive layouts, and design iteration within real product workflows.",
  cert: "View selected work",
  image: "1522071820081-009f0129c71c",
}];

export const contacts = [
  {
    num: "01",
    label: "Email",
    value: "Get in touch",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=yogendrachaudhary1011%40gmail.com&su=Portfolio%20inquiry&body=Hi%20Yogendra%2C%0A%0AI%20found%20your%20portfolio%20and%20would%20like%20to%20connect%20about...%0A%0ABest%2C",
  },
  { num: "02", label: "LinkedIn", value: "Connect on LinkedIn", href: "https://www.linkedin.com/in/yogendrach/" },
  { num: "03", label: "Behance", value: "View work on Behance", href: "https://www.behance.net/yogendrachaudhary1" },
];

export const technicalProjects = [
  {
    title: "Vedic Sewa — Spiritual Services Platform",
    desc: "A mobile booking experience for discovering services, consulting gurus, managing pujas, and keeping users informed at every step.",
    stack: "Mobile · UX · UI",
    tech: ["figma/figma-original", "photoshop/photoshop-original", "aftereffects/aftereffects-plain"],
  },
  {
    title: "Mero Route — Kathmandu Transit",
    desc: "A clearer way to discover routes, compare transport options, save frequent destinations, and navigate Kathmandu with confidence.",
    stack: "Mobile · Information Design",
    tech: ["figma/figma-original", "illustrator/illustrator-original", "aftereffects/aftereffects-plain"],
  },
  {
    title: "Office Management System",
    desc: "A central workplace platform for employee management, attendance, visitor registration, reporting, and role-based administration.",
    stack: "Web · Dashboard UX",
    tech: ["figma/figma-original", "xd/xd-plain", "photoshop/photoshop-original"],
  },
  {
    title: "Career Launchpad",
    desc: "A guided career-development platform for +2 graduates exploring pathways, assessments, learning, and internship opportunities.",
    stack: "Web & Mobile · Product UX",
    tech: ["figma/figma-original", "react/react-original", "tailwindcss/tailwindcss-original"],
  },
  {
    title: "Design Process Explorations",
    desc: "A collection of flows, wireframes, interface states, and prototypes that show how ideas become clear digital journeys.",
    stack: "UX · UI · Prototyping",
    tech: ["figma/figma-original", "xd/xd-plain", "aftereffects/aftereffects-plain"],
  },
  {
    title: "Responsive Interface Studies",
    desc: "Ongoing practice in mobile, web, dashboard, and component design — focused on clarity, consistency, and adaptable layouts.",
    stack: "UI · Responsive Design",
    tech: ["figma/figma-original", "photoshop/photoshop-original", "illustrator/illustrator-original"],
  },
];

export const initialCaseStudies: Project[] = technicalProjects.map((project, index) => {
  const image = galleryProjects[index % galleryProjects.length].image;
  return { ...project, image, thumbnail: image, media: [image], pdfUrls: [] };
});

export const digitalProjects = [
  { title: "Wireframes & User Flows", desc: "Early-stage explorations that test structure, navigation, and the clearest path through a task." },
  { title: "Interface Systems", desc: "Reusable components, variants, and Auto Layout patterns designed for consistent product experiences." },
  { title: "Responsive Design", desc: "Web and mobile layouts that preserve hierarchy and usability across screen sizes." },
  { title: "Prototype Studies", desc: "Connected screens and interactions that help evaluate a journey before development." },
  { title: "Design-to-Development", desc: "Practical explorations in HTML, CSS, React, and handoff to design with feasibility in mind." },
];
