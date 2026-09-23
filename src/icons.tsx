import {
  Sun as LucideSun,
  Moon as LucideMoon,
  Mail as LucideMail,
  ArrowRight,
  ExternalLink as LucideExternalLink,
  Trophy as LucideTrophy,
  GraduationCap,
  BadgeCheck,
  FolderGit2,
  Share2,
  Globe,
  type LucideProps,
} from "lucide-react";

type P = LucideProps;

export const Sun = (props: P) => <LucideSun strokeWidth={1.75} {...props} />;
export const Moon = (props: P) => <LucideMoon strokeWidth={1.75} {...props} />;
export const Mail = (props: P) => <LucideMail strokeWidth={1.75} {...props} />;
export const Arrow = (props: P) => <ArrowRight strokeWidth={1.75} {...props} />;
export const External = (props: P) => <LucideExternalLink strokeWidth={1.75} {...props} />;
export const Trophy = (props: P) => <LucideTrophy strokeWidth={1.75} {...props} />;
export const Cap = (props: P) => <GraduationCap strokeWidth={1.75} {...props} />;
export const Verified = (props: P) => <BadgeCheck strokeWidth={1.75} {...props} />;
export const Github = ({ className = "size-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Linkedin = ({ className = "size-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

export const Behance = ({ className = "size-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    {/* Clean, authentic Behance logo with balanced B, e, and macron */}
    <path d="M7.8 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h5.3c4.1 0 6.7-2.3 6.7-5.9 0-2.3-1.2-4.1-3.2-4.9 1.6-.8 2.6-2.4 2.6-4.4C14.4 4.1 11.9 2 7.8 2zm-.9 7.1H5V5.5h1.9c1.9 0 3.1.8 3.1 2.3 0 1.5-1.2 2.3-3.1 2.3zm.4 9.4H5v-4.5h2.3c2.1 0 3.5.9 3.5 2.6 0 1.8-1.4 1.9-3.5 1.9zM15 7.5h7V6h-7v1.5zm3.6 3c-3.1 0-5.3 2.1-5.3 5.4 0 3.2 2.2 5.5 5.6 5.5 2.5 0 4.3-1.3 4.9-3.2h-2.4c-.4.8-1.2 1.3-2.5 1.3-1.7 0-2.8-1.1-3-2.6h8.1c.1-.4.1-.7.1-1 0-3.1-2.1-5.4-5.5-5.4zm-2.8 4.3c.2-1.3 1.2-2.3 2.7-2.3 1.5 0 2.5 1 2.7 2.3h-5.4z" />
  </svg>
);

export const Dribbble = ({ className = "size-5", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 0 1 1.93 5.312c-.27-.05-2.71-.53-5.29-.22-.1-.23-.2-.46-.31-.7 2.4-1.63 3.48-4.04 3.67-4.392zM12 3.5a8.47 8.47 0 0 1 5.28 1.84c-.16.32-1.18 2.56-3.48 4.14-1.81-3.23-3.79-5.32-4.04-5.58.73-.26 1.48-.4 2.24-.4zm-3.83.94c.23.23 2.16 2.26 3.96 5.43-3.69 1.03-7.23 1.05-7.63 1.05a8.49 8.49 0 0 1 3.67-6.48zM3.5 12c0-.12.01-.24.02-.36.42 0 4.31-.02 8.35-1.18.15.32.29.64.42.97-3.48 1.07-6.68 3.57-7.44 4.22A8.472 8.472 0 0 1 3.5 12zm8.5 8.5c-2.02 0-3.88-.71-5.35-1.9.64-.56 3.49-2.78 6.84-3.86 1.13 2.94 1.63 5.16 1.7 5.51-.97.16-2.06.25-3.19.25zm4.84-1.39c-.08-.34-.54-2.42-1.62-5.26 2.37-.32 4.47.16 4.75.23a8.514 8.514 0 0 1-3.13 5.03z" />
  </svg>
);
