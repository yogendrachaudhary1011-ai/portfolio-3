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
export const Github = (props: P) => <FolderGit2 strokeWidth={1.75} {...props} />;
export const Linkedin = (props: P) => <Share2 strokeWidth={1.75} {...props} />;
export const Dribbble = (props: P) => <Globe strokeWidth={1.75} {...props} />;
