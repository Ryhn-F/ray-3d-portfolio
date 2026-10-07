export type Project = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  href?: string;
  repo?: string;
  hrefLabel?: string;
  /** Skill names (see data/profile.ts) used to light up this district on skill hover. */
  // TODO(owner): confirm which skills each project really used. Only used for
  // the hover highlight, never rendered as claims.
  skills: string[];
  /** District center in city space [x, z]. */
  center: [number, number];
};

export const projects: Project[] = [
  {
    id: "learnix",
    index: "01",
    name: "Learnix",
    tagline: "AI-powered adaptive learning platform.",
    href: "https://learnix-seven.vercel.app/",
    repo: "https://github.com/Ryhn-F/learnix",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel", "Firebase"],
    center: [-26, -4],
  },
  {
    id: "alumni",
    index: "02",
    name: "Portal Alumni SMK Telkom Jakarta",
    tagline: "Web portal for SMK Telkom Jakarta alumni.",
    href: "https://smktelkom-jkt.sch.id/alumni/",
    skills: ["Laravel", "PHP", "MySQL"],
    center: [-9, 6],
  },
  {
    id: "kandara",
    index: "03",
    name: "Kandara Group",
    tagline: "Revamped company profile website.",
    href: "https://kandara.group",
    skills: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
    center: [9, -4],
  },
  {
    id: "lab",
    index: "04",
    name: "This site",
    tagline: "A scroll-driven 3D city. Live stats below are real.",
    href: "https://github.com/Ryhn-F",
    hrefLabel: "GitHub profile",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    center: [26, 6],
  },
];
