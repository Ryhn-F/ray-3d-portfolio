// Content source: owner's previous site https://www.ryhnfir.dev (read 2026-10-07).
// Claims are self-reported by the owner.
export const profile = {
  name: "Muhammad Rayhan Firdaus",
  short: "Rayhan",
  role: "Software Developer",
  location: "Jakarta, Indonesia",
  email: "reyhan.firdaus227@gmail.com",
  links: {
    github: "https://github.com/Ryhn-F",
    linkedin: "https://www.linkedin.com/in/muhammad-rayhan-firdaus-958b20302/",
    instagram: "https://instagram.com/ryhnfir",
    resume:
      "https://drive.google.com/file/d/1s0UvEof2wEJj0FkiF5s_XYwF_AFwxcX-/view?usp=sharing",
  },
  words: ["I DESIGN", "I BUILD", "I LEARN", "I EXPERIMENT"],
  pillars: ["Frontend Architecture", "AI & Automation", "Product Thinking"],
  facts: [
    ["Education", "Information Systems · Binus University · 2026–2030"],
    ["Focus", "Frontend Development · AI & Automation · Web Performance"],
    ["Location", "Jakarta, Indonesia"],
    ["Status", "Open to freelance & full-time roles"],
  ] as const,
  experience: [
    {
      year: "2026",
      title: "Junior Web Developer",
      org: "PT Kandara Digita Kreatif",
      body: "Built responsive web applications and dashboard interfaces using React and TypeScript. Led migration of legacy jQuery codebase to modern React architecture, reducing bundle size by 42%.",
      tags: ["React", "TypeScript", "Tailwind CSS", "REST API", "Recharts"],
    },
    {
      year: "2025",
      title: "Frontend Developer Intern",
      org: "PT. Kandara Digita Kreatif",
      body: "Developed interactive UI components and collaborated with design team on product redesigns. Shipped 3 major feature releases and improved mobile Lighthouse score from 62 to 94.",
      tags: ["Next.js", "JavaScript", "Implement UI from Figma", "CSS Modules"],
    },
  ],
  skills: {
    Frontend: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Framer Motion", "CSS / SCSS"],
    Backend: ["Node.js", "Express", "Laravel", "PHP"],
    Database: ["PostgreSQL", "MySQL", "Firebase"],
    "Tools & Design": ["Git", "Figma", "Vercel", "Docker", "VS Code"],
  } as Record<string, string[]>,
};

export const mailto = (subject = "Hello Rayhan") =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;
