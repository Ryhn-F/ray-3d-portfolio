import Hud from "@/components/Hud";
import Poster from "@/components/Poster";
import SceneRoot from "@/components/scene/SceneRoot";
import LabStats from "@/components/sections/LabStats";
import SkillsList from "@/components/sections/SkillsList";
import Splash from "@/components/Splash";
import Cursor from "@/components/ui/Cursor";
import Marquee from "@/components/ui/Marquee";
import Reveal from "@/components/ui/Reveal";
import RotatingWords from "@/components/ui/RotatingWords";
import SplitChars from "@/components/ui/SplitChars";
import { profile, mailto } from "@/data/profile";
import { projects } from "@/data/projects";

const nav = [
  ["About", "#about"],
  ["Work", "#work"],
  ["Experience", "#experience"],
  ["Contact", "#contact"],
] as const;

const ticker = ["Frontend", "3D Web", "AI & Automation", "Performance", "Design Systems", "Product Thinking"];

function Label({ n, children }: { n: string; children: string }) {
  return (
    <p className="mono-label mb-5 flex items-center gap-3">
      <span className="text-accent">{n}</span>
      <span className="inline-block h-px w-10 bg-line" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <Poster />
      <SceneRoot />
      <div className="scrim" aria-hidden="true" />
      <Hud />
      <Cursor />

      <header className="site-header fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-14">
        <a href="#" className="font-mono text-sm font-semibold tracking-widest legible">
          RF<span className="text-accent">.</span>
        </a>
        <nav aria-label="Primary" className="hidden gap-8 md:flex">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="mono-label ulink legible">
              {label}
            </a>
          ))}
        </nav>
        <a href={mailto("Hiring / project inquiry")} className="btn">
          Hire me
        </a>
      </header>

      <main id="main" className="relative z-10 mx-auto max-w-[88rem] px-6 md:px-20">
        {/* HERO — stop 0 */}
        <section data-stop className="legible flex min-h-svh flex-col justify-center py-28">
          <p className="mono-label mb-8">
            {profile.role} · {profile.location}
          </p>
          <p className="text-lg text-ink-dim">Hi, I&apos;m</p>
          <SplitChars as="h1" text="Rayhan." className="display hero-title text-hero" stagger={0.05} />
          <p className="mt-8 max-w-xl text-lg">
            I build digital experiences that turn ideas into products.
          </p>
          <p className="mt-3 max-w-xl text-ink-dim">
            Frontend-focused developer passionate about building interactive, scalable and
            thoughtful web experiences.
          </p>
          <div className="mt-8 h-5">
            <RotatingWords words={profile.words} />
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#work" className="btn">
              Explore my work ↓
            </a>
            <a href="#contact" className="btn-ghost">
              Let&apos;s talk →
            </a>
          </div>
          <p className="mono-label mt-16 hidden items-center gap-3 md:flex">
            <span className="inline-block h-10 w-px animate-pulse bg-accent" aria-hidden="true" />
            Scroll to fly over the city
          </p>
        </section>

        {/* ABOUT */}
        <section id="about" className="legible py-24 md:py-44">
          <Label n="01">ABOUT</Label>
          <SplitChars as="h2" text="Who I am." className="display text-xl" />
          <Reveal className="mt-6 max-w-xl">
            <p>
              I&apos;m a developer who enjoys turning complex ideas into simple, useful experiences. I
              care deeply about the craft — the spacing, the motion, the clarity.
            </p>
            <p className="mt-4 text-ink-dim">
              Studying Information Systems at Binus University while building real products. I love the
              intersection of engineering and design, where code becomes experience and detail becomes
              delight.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {profile.pillars.map((p) => (
                <li key={p} className="chip">
                  {p}
                </li>
              ))}
            </ul>
            <dl className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              {profile.facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono-label">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-10"
            >
              Download resume ↗
            </a>
          </Reveal>
        </section>

        <Marquee items={ticker} />

        {/* WORK — stops 1..4, one per district */}
        <section id="work" aria-labelledby="work-h">
          <div className="legible py-28">
            <Label n="02">SELECTED WORK</Label>
            <SplitChars as="h2" text="A city of things I've built." className="display text-xl max-w-xl" />
            <p className="mt-4 max-w-md text-ink-dim">
              Keep scrolling. The camera flies to a new district for every project.
            </p>
          </div>
          <span id="work-h" className="sr-only">
            Selected work
          </span>
          {projects.map((p) => (
            <article key={p.id} data-stop className="legible flex min-h-svh items-end py-14 md:items-center">
              <div className="max-w-lg border-l border-accent/50 pl-6 md:pl-8">
                <p className="mono-label">
                  <span className="text-accent">PROJECT {p.index}</span> / 04
                </p>
                <SplitChars
                  as="h3"
                  text={p.name}
                  className="display mt-3 text-[clamp(1.6rem,1rem+2.6vw,3.4rem)]"
                  stagger={0.02}
                />
                <p className="mt-4 text-lg text-ink-dim">{p.tagline}</p>
                {p.id === "lab" && <LabStats />}
                <div className="mt-8 flex flex-wrap gap-3">
                  {p.href && (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn">
                      {p.hrefLabel ?? "View"} ↗
                    </a>
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      GitHub →
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* EXPERIENCE — stop 5 (pull-back overview) */}
        <section id="experience" data-stop className="legible py-24 md:py-44">
          <Label n="03">EXPERIENCE</Label>
          <SplitChars as="h2" text="Where I've worked." className="display text-xl" />
          <ol className="mt-12 max-w-2xl border-l border-line">
            {profile.experience.map((e) => (
              <li key={e.year + e.title} className="relative pb-12 pl-8 last:pb-0">
                <span
                  className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]"
                  aria-hidden="true"
                />
                <Reveal>
                  <p className="mono-label text-accent">{e.year}</p>
                  <h3 className="mt-1 text-lg font-bold">{e.title}</h3>
                  <p className="text-sm text-ink-dim">@ {e.org}</p>
                  <p className="mt-3">{e.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* SKILLS */}
        <section id="skills" className="legible py-16 md:py-28">
          <Label n="04">SKILLS</Label>
          <SplitChars as="h2" text="Tools I build with." className="display text-xl" />
          <p className="mt-3 text-sm text-ink-dim">Hover a skill to light up related districts.</p>
          <SkillsList />
        </section>

        <Marquee items={["Let's build", "Something great", "Together"]} reverse />

        {/* CONNECT */}
        <section id="contact" className="legible py-24 md:py-44">
          <Label n="05">CONNECT</Label>
          <SplitChars as="h2" text="Have a project in mind?" className="display text-xl max-w-2xl" />
          <Reveal className="mt-6 max-w-xl">
            <p>
              I&apos;m open to freelance projects and full-time opportunities. I usually reply within 24
              hours (WIB, UTC+7).
            </p>
            <a
              href={mailto()}
              className="ulink mt-8 inline-block font-display text-[clamp(1rem,0.55rem+1.45vw,1.7rem)] font-extrabold [overflow-wrap:anywhere]"
            >
              {profile.email}
            </a>
            <ul className="mt-8 flex flex-wrap gap-3">
              <li><a className="btn-ghost" href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
              <li><a className="btn-ghost" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
              <li><a className="btn-ghost" href={profile.links.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a></li>
            </ul>
          </Reveal>
        </section>

        <footer className="pb-24 pt-10">
          <p className="mono-label">
            © {new Date().getFullYear()} {profile.name} — built with Next.js, three.js &amp; GSAP
          </p>
        </footer>
      </main>

      <Splash />
    </>
  );
}
