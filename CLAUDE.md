# CLAUDE.md — Rayhan's Portfolio

Research basis: web research done 2026-10-07. Version numbers were read from the npm registry that day; support data from caniuse/MDN/vendor docs. Anything not directly verified is marked `(unverified)`. Re-check versions with `npm view <pkg> version` before pinning.

## Project summary
- Single-page portfolio with scroll-driven 3D and layered parallax.
- Audience: developers, hiring managers, clients. They judge craft AND restraint: fast, readable, no gimmicks.
- Brand mood: **dark, futuristic, awesome** (changed 2026-10-07 from light, at the owner's request; reference = kentatoshikura.com loader/typography + bruno-simon.com start screen). Near-black UI, cyan/violet glow, big display type.
- Owner rules for the redesign: keep the project city as the signature; **sections have NO background boxes/panels** so the city stays visible (text sits directly on the canvas; legibility comes from `.legible` text-shadow + one soft fixed `.scrim` gradient only); start with a splash screen.
- Hard constraints: good Core Web Vitals on mid-range phones; **no paid libraries** (everything below is MIT or GSAP's free standard license).
- Content must be fully usable (readable, navigable, linkable) with 3D disabled. 3D is enhancement, never the only carrier of content.

Owner decisions (2026-10-07)
- **Signature 3D = a "project city"**: each project is a building/district; scroll flies the camera over/through the city, one district per project section. Fits the single-persistent-canvas + camera-path architecture below.
- **No model assets exist → build procedurally.** Buildings = `InstancedMesh` of boxes/extrusions with per-instance color/height from data (`data/projects.ts` seeds the layout); ground grid + roads as one merged geometry; light/glow via emissive + a single cheap shader (fog, height gradient, scanline accent). No external GLB for v1 (zero model download). Optionally add one small hand-made GLB per landmark later (≤ 150 kB each, Draco/Meshopt).
- **Hosting = Vercel.** Use default Next.js build; static pages (SSG); serve `/public` assets with long immutable cache headers (`next.config` `headers()`); Brotli is automatic. Use `@vercel/speed-insights` for field INP/LCP/CLS `(unverified: package/version not checked)`.
- **Include a "How this site is built" section** with real stats: build-time bundle sizes, a live in-page FPS/draw-call/triangle readout (dev-style HUD behind a toggle, from `renderer.info`), and a link to the repo. Real numbers only; never fake.

## Owner profile & content
Source: the owner's current site https://www.ryhnfir.dev, read in-browser 2026-10-07 (LinkedIn is login-walled; not used). Treat all claims below as self-reported by the owner; reuse the copy, don't invent new facts.
- **Who:** Muhammad Rayhan Firdaus ("Rayhan", handle `ryhnfir`, GitHub `Ryhn-F`), software developer, Jakarta, Indonesia (WIB, UTC+7). Studying Information Systems at Binus University (2026–2030). Open to freelance and full-time. Replies < 24 h. Prefers Web · Mobile · AI.
- **Focus:** Frontend development, AI & automation, web performance. Pillars on the old site: Frontend Architecture, AI & Automation, Product Thinking. Words he uses: "craft", "spacing, motion, clarity", "code becomes experience".
- **Voice:** first person, short, confident, warm. Hero lines used before: "Hi, I'm Rayhan." / "I build digital experiences that turn ideas into products." / rotating "I DESIGN / I BUILD / I LEARN / I EXPERIMENT". Keep this voice; section labels as `01 — ABOUT`, `02 — SELECTED WORK`, `03 — EXPERIENCE`, `04 — SKILLS`, `05 — CONNECT`.
- **Projects (→ city districts):**
  1. **Learnix** — AI-powered adaptive learning platform. Live https://learnix-seven.vercel.app · repo https://github.com/Ryhn-F/learnix
  2. **Portal Alumni SMK Telkom Jakarta** — web portal for school alumni. https://smktelkom-jkt.sch.id/alumni/
  3. **Kandara Group company profile** — revamped company site. https://kandara.group
  4. **This portfolio itself** (decided 2026-10-07): the 4th district, a "lab" building that is the "How this site is built" showcase (live stats HUD, stack, repo link). Total = 3 real projects + 1 self-showcase district.
- **Experience:**
  - 2026 Junior Web Developer, PT Kandara Digita Kreatif: React, TypeScript, Tailwind, REST API, Recharts; led jQuery → React migration, claims bundle size −42%.
  - 2025 Frontend Developer Intern, PT. Kandara Digita Kreatif: Next.js, JavaScript, Figma→UI, CSS Modules; shipped 3 major releases, mobile Lighthouse 62 → 94.
- **Skills:** Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS, Framer Motion, CSS/SCSS. Backend: Node.js, Express, Laravel, PHP. Database: PostgreSQL, MySQL, Firebase. Tools: Git, Figma, Vercel, Docker, VS Code. Old site had "hover a skill to see related projects" — keep that interaction (skill → highlights districts in the city).
- **Links:** GitHub https://github.com/Ryhn-F · LinkedIn https://www.linkedin.com/in/muhammad-rayhan-firdaus-958b20302/ · Instagram https://instagram.com/ryhnfir · email reyhan.firdaus227@gmail.com · resume (Google Drive) https://drive.google.com/file/d/1s0UvEof2wEJj0FkiF5s_XYwF_AFwxcX-/view?usp=sharing
- **Contact:** decided: **no form, no backend, no email provider.** Use plain `mailto:reyhan.firdaus227@gmail.com` links (Hire Me, Let's talk, Connect section) plus the social links. Optionally prefill `?subject=` via `encodeURIComponent`. Keeps the site fully static on Vercel.
- **Old site visuals (continuity):** page bg `rgb(247,247,245)` (#f7f7f5), ink `rgb(17,17,17)`, fonts **Plus Jakarta Sans** + **JetBrains Mono**, no canvas, ~12,000 px tall, not Next.js-detectable (`__NEXT_DATA__` absent). Brand is already light; keep it recognizable (same fonts, same off-white), add the futuristic layer (cool accent + 3D).
- Content rule: the new site must cover the same five sections; the city is the "Selected Work" centerpiece, not a replacement for About/Experience/Skills/Contact (those stay real DOM sections).

## Design direction
Principles
1. **Content first, 3D second.** One hero 3D object/scene that tells a story across the page; not 3D everywhere.
2. **Scroll = camera.** Scroll progress drives a single camera path + a few object states. Never hijack scroll speed (no wheel-jacking); native scroll stays.
3. **Depth with discipline.** Max 3 parallax depth layers per viewport (see Motion system). Small amplitude (see below).
4. **Technical honesty.** Show real work: code snippets, build stats, repo links, a "how this site is built" section. This is what reads as tech-savvy.
5. **Dark, precise, alive.** Near-black `#04050a`, hairline rules, cyan `#38f0ff` primary + violet `#8b6cff` / mint `#3dffc4` / pink `#ff5cc8` used only on 3D landmarks and tiny accents. Glow belongs to the city and CTAs, not to text blocks.
6. **Start screen, then swoop.** Splash (loading counter + name + "Enter the city") → camera spirals from a far orbit down to the hero pose.

Do
- Pair display (Unbounded 800) + grotesk (Space Grotesk) + mono (JetBrains Mono); mono for labels/metadata/section indices (`01 — ABOUT`).
- Keep text in the left column on desktop / bottom on mobile; the camera projection is shifted (`setViewOffset`) so the city sits beside the text.
- Splash progress must reflect REAL loading (fonts, tier gate, first 3D frames); keep a minimum of ~2.4 s so it is readable, and a 10 s fail-safe.
- Give every section a static (no-motion) layout that already looks finished. Static tier skips the splash entirely.

Don't
- No scroll-jacking, no forced snap on mobile; custom cursor only for `(pointer: fine)` and always alongside the native cursor.
- No section/card backgrounds. No `backdrop-filter: blur()` over the canvas.
- Don't use `-webkit-text-stroke` outlines on the variable display font without `paint-order: stroke fill` and a solid fill (overlapping contours show through); don't use `background-clip:text` gradients on per-character spans (renders black).
- No generic floating-blob/crystal 3D, no "scroll to explore" text on every section.
- No more than one full-screen WebGL canvas. No video backgrounds on top of the canvas.
- Don't animate layout properties (`top/left/width/height`); animate `transform` and `opacity` only.

Dated / overused in 2026 (avoid or subvert): dark-mode + purple neon glow, heavy glassmorphism, parallax on every element, scroll-hijack storytelling, bento grids as the only layout, generic gradient-mesh heroes. Sources: [line25](https://line25.com/articles/web-design-trends-2026/), [studiomeyer](https://studiomeyer.io/en/blog/webdesign-trends-2026) (secondary blogs; opinion-grade).

## Tech stack decision
Versions checked 2026-10-07 (npm registry `/latest`):

| Package | Version | License | Role |
|---|---|---|---|
| next | 16.4.0 (Node >=20.9) | MIT | App Router, static export/SSG |
| react / react-dom | 19.3.0 | MIT | |
| tailwindcss | 4.3.3 | MIT | CSS-first config (`@theme`) |
| three | 0.186.1 | MIT | 3D engine |
| @react-three/fiber | 9.8.1 (peer: react >=19 <19.4, three >=0.156) | MIT | React renderer for three |
| @react-three/drei | 10.7.9 (peer: r3f ^9, three >=0.159) | MIT | helpers (useGLTF, Preload, PerformanceMonitor…) |
| gsap | 3.15.0 | GSAP standard "no charge" license, incl. ScrollTrigger/SplitText etc. | scroll timelines |
| @gsap/react | 2.1.2 | | `useGSAP` hook |
| motion | 14.0.0 (import from `motion/react`) | MIT | UI micro-interactions only |
| lenis | 1.3.26 | MIT | optional smooth scroll, desktop only |
| detect-gpu | 5.0.70 | MIT | GPU tier detection |

Pin exact versions (no `^`) for three/r3f/drei: r3f peers are tight and three ships breaking changes every release.

GSAP license: all plugins free for commercial use; only restriction is building no-code animation tools that compete with Webflow ([gsap.com/standard-license](https://gsap.com/standard-license)). Fine for a portfolio.

Decision (primary path)
- **GSAP + ScrollTrigger** owns all scroll-linked timelines (camera path, object state, pinned sections). Reason: deterministic scrub, pin, `matchMedia`, wide browser support, works on every browser incl. Firefox (no dependence on CSS scroll timelines).
- **R3F + drei** for the single persistent canvas. Reason: fits Next/React, cleanup handled by React, `frameloop="demand"`.
- **Motion (`motion/react`) via `LazyMotion` + `m`** for hover/enter/exit UI only. Don't use Motion for scroll-scrubbed 3D; two scroll systems fight. Sizes per [Motion docs](https://motion.dev/docs/react-reduce-bundle-size): `motion` 34kb, `m` 4.6kb, `domAnimation` +15kb.
- **Tailwind v4** for layout/tokens (tokens live in `@theme`).
- **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) only as a *progressive enhancement* for cheap DOM-only parallax/reveals, wrapped in `@supports`. Not Baseline: Chrome/Edge 115+, Safari 26+, Firefox flag-only per search/WebKit blog; caniuse JSON for it could not be fetched, so exact % is `(unverified)`.
- **Lenis**: optional. Enable only on fine-pointer desktops, wire to GSAP ticker (below). Skip on touch.

Fallbacks / rejected
- **Spline**: fastest to author but runtime adds to bundle and is less optimizable than hand-built three (secondary sources; exact sizes `(unverified)`). Allowed only for a throwaway prototype, not production.
- **Babylon.js**: capable but heavier and off the React/R3F ecosystem; no reason to use here.
- **WebGPU**: don't target it for v1. `three/webgpu` `WebGPURenderer` exists (needs `await renderer.init()`, auto WebGL2 fallback per three docs/secondary sources), but caniuse (2026-10-07) shows Safari 26 and Firefox as partial/flagged/OS-limited and Android Chrome from 154, while a secondary blog claims ~87% support. **Conflicting → stay on `WebGLRenderer`.** Revisit later. TSL is the reason to revisit.
- **Vanilla three** (no R3F) is the fallback if R3F bundle size blows the budget (a secondary benchmark claims vanilla ≈ 460 kB vs R3F ≈ 1 MB unminified/ungzipped `(unverified)`; measure ourselves).
- **View Transitions API**: same-document support is wide (caniuse: Chrome/Edge 111, Safari 18, Firefox 144; ~91.75% usage). Only use for small same-page state changes (theme toggle, project detail open). Single page → no page transitions needed. Cross-document version support is `(unverified)`.
- **OffscreenCanvas + worker** rendering: caniuse says ~95.5% (Chrome 69, Firefox 105, Safari 17). Possible later INP optimization; not v1 (complicates R3F; `(unverified)` for r3f compatibility; R3F has an offscreen mode in its docs, not checked).

## Architecture patterns
- **One persistent, fixed, full-viewport `<Canvas>`** behind the DOM (`position: fixed; inset: 0; z-index: 0; pointer-events: none`). Page sections scroll over it. No per-section canvases (each context costs memory, and mobile browsers cap contexts).
- **Scroll → state via one shared value**, not React state:
  - A module-level store `scrollState = { progress: 0, velocity: 0 }` (plain object or tiny zustand store with `getState()` reads).
  - A single `ScrollTrigger` over `<main>` (`scrub: true`) writes `progress`; calls `invalidate()` from r3f.
  - Inside `useFrame`, read `scrollState.progress` and sample a precomputed camera path (`CatmullRomCurve3`). Never `setState` per scroll tick.
- **Alternative** if per-section choreography is needed: one master `gsap.timeline` driving camera + object refs, `scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 0.6 }`. Keep timeline labels aligned to section IDs.
- **Sections** are DOM (`<section id="work">`) with real text, links, and headings. Each exposes `data-scene-stop` (0–1) so 3D stops and copy stay in sync.
- **Canvas lazy-loaded**: `app/page.tsx` is a Server Component with the static hero/poster/text. A Client Component `<SceneRoot/>` does `dynamic(() => import('./Scene'), { ssr: false })` (ssr:false is only allowed in Client Components — [Next docs](https://nextjs.org/docs/app/guides/lazy-loading)), mounted after first paint + `requestIdleCallback` and only if capability check passes.
- **Capability gate** (`lib/capability.ts`) decides `'full' | 'lite' | 'static'` once on the client (see Accessibility & fallbacks). `<SceneRoot/>` renders nothing for `'static'`.
- **GSAP in React**: always `useGSAP()` from `@gsap/react` with `{ scope }`; wrap event-handler-created tweens in `contextSafe()`. Files using it need `'use client'` ([GSAP React docs](https://gsap.com/resources/React/)). `gsap.registerPlugin(useGSAP, ScrollTrigger)` once in `lib/gsap.ts`.
- **Lenis + ScrollTrigger sync** (only when Lenis enabled), per [Lenis README](https://github.com/darkroomengineering/lenis):
```ts
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```
  Lenis respects `prefers-reduced-motion` by default (smoothing disabled); keep that default.
- **Render loop**: `<Canvas frameloop="demand">` + a `Heartbeat` that re-invalidates every frame while the tab is visible (the scene now animates continuously: shader time, traffic, scan pulse, landmark spin). Lite tier delays the next invalidate by 33 ms (~30 fps cap). Hidden tab → rAF stops → no rendering. See [R3F scaling-performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
- **Pause off-screen**: `IntersectionObserver` on the canvas host / section wrapper → set `frameloop` to `'never'` when hidden, `'demand'` when visible; also pause on `document.visibilitychange`.
- **Models**: `useGLTF` (drei) — Draco and Meshopt decoders on by default; add KTX2 via `extendLoader`. Preload the hero model with `useGLTF.preload(url)`. Self-host decoders in `/public/draco/` (drei defaults to a CDN; self-host to avoid third-party latency).

## Motion system
Tokens (as TS constants in `lib/motion.ts` and mirrored as CSS vars)
```ts
export const ease = {
  out:    'power3.out',      // cubic-bezier(.215,.61,.355,1)  — entrances
  inOut:  'power2.inOut',    // cubic-bezier(.45,0,.55,1)       — state swaps
  expo:   'expo.out',        // hero reveals
  scrub:  'none',            // scrubbed timelines are linear; smoothing via scrub: 0.6
}
export const dur = { micro: 0.15, ui: 0.3, reveal: 0.7, hero: 1.2 }   // seconds
export const stagger = { text: 0.04, cards: 0.08 }
```
- Hover/press micro-interactions: 150–300 ms, `ease.out`. Reveals: 600–800 ms. Nothing > 1.2 s except the intro.
- Scroll scrub smoothing: `scrub: 0.6` for 3D camera, `scrub: true` for pinned DOM.
- Scroll ranges (ScrollTrigger `start`/`end`): reveals `start: 'top 85%'`, once. Parallax layers `start: 'top bottom'`, `end: 'bottom top'`. Hero pin ≤ 1.5 viewport heights. Total page ≤ ~6–7 viewport heights.

Parallax depth layers (translateY over the section's travel, as % of viewport height; use `transform: translate3d`, `will-change: transform` only while active)

| Layer | Role | Speed vs scroll | Max travel |
|---|---|---|---|
| L0 | Canvas (3D) | camera-driven | n/a |
| L1 | Background grid/hairlines/noise | -0.10 | 10vh |
| L2 | Text + cards (normal flow) | 0 | 0 |
| L3 | Foreground accents (labels, glow dots) | +0.15 | 15vh |

- Max 3 DOM layers + canvas. Amplitude is deliberately small; large parallax causes motion discomfort ([WebKit guide](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)).
- Pointer-reactive 3D: ≤ 3° camera/object tilt, lerp factor 0.08, desktop fine-pointer only.
- On `prefers-reduced-motion: reduce`: no scrub, no parallax, no autoplay; sections cross-fade (opacity only, ≤ 200 ms) — see Accessibility.
- CSS-only enhancement (guard with `@supports`; set `animation-timeline` AFTER the `animation` shorthand — WebKit caveat):
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
  }
}
```

## Visual tokens
**Current (dark theme, source of truth = `app/globals.css`)**: `--color-bg #04050a`, `--color-ink #e9eef7`, `--color-ink-dim #a9b3c7`, `--color-line rgb(255 255 255/.13)`, `--color-accent #38f0ff`, `--color-accent-2 #8b6cff`, `--color-mint #3dffc4`, `--color-pink #ff5cc8`. Fonts via `next/font/google`: Space Grotesk (`--font-grotesk`), Unbounded 800 only (`--font-unbounded`, display), JetBrains Mono (`--font-jetbrains`). 3D colors live in `components/scene/shaders.ts` (`COLORS`). The light-theme block below is the OLD spec, kept only for history; do not use it.
```css
@import "tailwindcss";
@theme {
  /* color */
  --color-bg:        #f5f7fb;   /* page */
  --color-surface:   #ffffff;
  --color-ink:       #0b1220;   /* body text, contrast >= 12:1 on bg */
  --color-ink-dim:   #4a5568;   /* secondary; verify >= 4.5:1 on bg */
  --color-line:      #d9dfea;   /* hairlines */
  --color-accent:    #2f5bff;   /* electric blue */
  --color-accent-2:  #00c2a8;   /* mint, sparing */
  --color-glow:      rgb(47 91 255 / 0.35);
  /* type */
  --font-sans: var(--font-grotesk), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
  /* fluid type scale (1.25 ratio, 360→1280px) */
  --text-xs:  clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
  --text-sm:  clamp(0.875rem, 0.84rem + 0.2vw, 0.9375rem);
  --text-base:clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg:  clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --text-xl:  clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem);
  --text-hero:clamp(2.75rem, 1.5rem + 6vw, 7rem);
  /* spacing: 4px base */
  --spacing: 0.25rem;
  /* motion mirrors lib/motion.ts */
  --ease-out: cubic-bezier(.215,.61,.355,1);
  --ease-in-out: cubic-bezier(.45,0,.55,1);
  --dur-ui: 300ms;
}
```
- Fonts via `next/font` (self-hosted, `display: swap`, subset latin): **Plus Jakarta Sans** (sans) + **JetBrains Mono** (mono), matching the owner's current site (verified in use on ryhnfir.dev). Both are on Google Fonts `(unverified: confirm in next/font/google at build time)`. Swap only if the owner asks.
- Page bg: use the owner's existing `#f7f7f5` as `--color-bg` base and `#111111` as ink instead of the cooler placeholders above if they look better against the canvas; keep `--color-accent` electric blue. Max 2 families, ≤ 4 font files, preload only the hero weight.
- Grid: 12 columns, 24px gutters desktop / 16px mobile, max content width 1280px; section vertical rhythm `py-24 md:py-40`.
- Patterns seen on reference sites: bold oversized headline + whitespace (Lusion), two-colour palettes (every Awwwards ref below uses 2–3 colours), one signature interaction per section. Copy it: restrict to 2 core colours + 1 accent.
- Accent glow only on the 3D object and primary CTA; never as a full-section gradient.

## Performance budget
Hard numbers (CI/Lighthouse mobile profile; fail the PR if exceeded). Mid-range Android is the baseline device.

| Metric | Budget |
|---|---|
| LCP (p75) | ≤ 2.5 s (target 2.0 s). LCP element = static poster `<Image priority>` or the H1, NEVER the canvas |
| INP (p75) | ≤ 200 ms |
| CLS (p75) | ≤ 0.1 (target 0): reserve canvas/poster size with CSS `aspect-ratio`/`min-height` |
| Initial JS (gzip, before canvas) | ≤ 120 kB |
| 3D chunk (three + r3f + drei + scene code, gzip, lazy) | ≤ 350 kB (measure; adjust once real) |
| Hero GLB | ≤ 1.5 MB (Draco/Meshopt + KTX2); all 3D assets total ≤ 3 MB |
| Textures | ≤ 2048 px (hero only), prefer 1024; KTX2 |
| Draw calls (mobile) | ≤ 100 (desktop ≤ 300) |
| Triangles (mobile) | ≤ 100k |
| Target FPS | 60 desktop, ≥ 45 mobile (drop quality tier below that) |
| DPR | `dpr={[1, 1.5]}` mobile, `[1, 2]` desktop; never above 2 |
| Fonts | ≤ 4 files, ≤ 100 kB total |

Core Web Vitals thresholds from [web.dev/vitals](https://web.dev/articles/vitals): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75. Draw-call/triangle/texture numbers come from a secondary source ([utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)) plus [R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance) (≤ 1,000 draw calls absolute max); the mobile numbers are our own conservative picks.

Required techniques (not optional)
1. LCP is HTML/SSR text + a static poster. Canvas mounts after LCP (idle callback). Don't lazy-load the LCP image; add `fetchpriority="high"` ([optimize-lcp](https://web.dev/articles/optimize-lcp)).
2. Canvas via `next/dynamic({ ssr:false })`, only when capability gate = full/lite.
3. `frameloop="demand"`; pause when off-screen or tab hidden.
4. DPR cap + `PerformanceMonitor` from drei: on decline lower DPR, then disable post-processing, then drop to static.
5. Reuse geometries/materials; `InstancedMesh` for repeats; merge static meshes; bake lighting/AO into textures; no real-time shadows on mobile (if unavoidable 512–1024 map).
6. Assets: `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`, then KTX2 (`etc1s` for color maps, `uastc` for normals) — commands per [glTF-Transform CLI](https://gltf-transform.dev/cli); `gltf-transform inspect` before shipping. Meshopt is acceptable alternative (drei enables both by default).
7. No post-processing on mobile; on desktop, only bloom-lite at half resolution.
8. Keep scroll handlers off the main thread's critical path: no `getBoundingClientRect` in scroll callbacks; ScrollTrigger only; `ScrollTrigger.config({ ignoreMobileResize: true })` is `(unverified)` — check docs before using.
9. `ScrollTrigger.normalizeScroll` is NOT used by default (forces JS-thread scrolling on mobile; hurts INP). Only add if a documented iOS bug requires it.
10. Third-party scripts: none at load. Analytics (if any) = lightweight, after idle.
11. Long tasks: model decode via loader workers (drei/Draco/Meshopt default), never decode on main thread inside a scroll interaction.

## Accessibility & fallbacks
Capability gate (`lib/capability.ts`), evaluated client-side before mounting the canvas:
```ts
type Tier = 'full' | 'lite' | 'static'
// static if: prefers-reduced-motion, Save-Data, no WebGL2, GPU tier 0-1 (detect-gpu), deviceMemory <= 2, or hardwareConcurrency <= 2
// lite   if: touch device or GPU tier 2  → dpr<=1.5, no post, simpler material, fewer particles, no pointer tilt, no Lenis
// full   else
```
- Use `detect-gpu` `getGPUTier()` (async; needs its benchmark data fetched — check it's self-hostable `(unverified)`). `navigator.deviceMemory`/`connection.saveData` are Chromium-only → treat as optional hints.
- **`prefers-reduced-motion: reduce`** → tier `static`: show poster/still render, no scrub, no parallax, no autoplay; simple opacity cross-fades only. Listen to `matchMedia('(prefers-reduced-motion: reduce)')` `change` events and tear down live. Baseline widely available since 2020 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)). Pattern: replace, don't just remove.
- `gsap.matchMedia()` wraps all ScrollTrigger setup with `(prefers-reduced-motion: no-preference)` and desktop/mobile conditions; it auto-reverts on change.
- **No-WebGL / context lost**: listen to `webglcontextlost` → switch to static poster; wrap `<Canvas>` in an Error Boundary that renders the poster.
- **Static fallback** = pre-rendered hero poster (AVIF/WebP, ≤ 150 kB) per scene stop, shown with CSS cross-fade or just stacked in flow. Optional short looping MP4/WebM (≤ 1 MB, `muted playsinline`) for `lite` tier `(unverified: only if poster feels flat)`.
- **Canvas semantics**: canvas is decorative → `aria-hidden="true"`, `role="presentation"`, `tabindex="-1"`, `pointer-events: none`. ALL content, nav, and links live in real DOM above it. If any 3D object is interactive, mirror it with a real `<button>`/`<a>` (visually hidden or overlaid) with `aria-label`; optionally `@react-three/a11y` (not version-checked `(unverified)`) ([docs](https://a11y.docs.pmnd.rs/introduction)).
- Keyboard: visible `:focus-visible` ring (2px accent, 2px offset), skip link to `#main`, logical heading order (one `h1`), nav reachable without pointer. Never trap focus in 3D.
- Contrast: body ≥ 4.5:1, large text ≥ 3:1 *including over the canvas* (put text on `--color-bg` panels or ensure canvas is calm behind text).
- Provide a visible "Reduce effects" toggle (persist in `localStorage`, wrapped in try/catch) that forces `static` tier.
- Test matrix: Chrome Android mid-range (or 4× CPU throttle + Slow 4G in DevTools), iOS Safari, desktop Firefox, `prefers-reduced-motion` on, JS disabled (content still renders), WebGL disabled.

## Reference sites
Checked 2026-10-07 via Awwwards pages, page fetches, and vendor docs. "Tech" comes from Awwwards tags/page text unless noted; I could not run DevTools network inspection from this environment, so tech details beyond tags are `(unverified)`. Weaknesses are inferred from category/score data and design, not measured.

| URL | Effect | Tech | Lesson |
|---|---|---|---|
| [landonorris.com](https://www.landonorris.com) (Awwwards SOTD 2025-11-17; SOTY 2025) | Bold 2-colour (#D2FF00 / #111112) identity, WebGL + gesture interactions | Webflow, GSAP, WebGL (Awwwards) | Two colours + one accent = instantly branded. Weakness: heavy WebGL on mobile `(unverified)` |
| [igloo.inc](https://igloo.inc) (SOTD 2024-07-23; SOTY 2024; abeto/Bureaux) | 3D, infinite scroll, animated transitions; Dev score 9.6 for animation | 3D/WebGL (Awwwards); fetch failed so stack `(unverified)` | Light grey/charcoal palette proves light-ish 3D can look futuristic |
| [messenger.abeto.co](https://messenger.abeto.co) (SOTD 2025-11-10; SOTY 2025) | Playable 3D planet, character nav | Three.js, WebGL, WebSockets (Awwwards) | Interaction model as the portfolio; too heavy to copy wholesale; perf score 8.8 |
| [bruno-simon.com](https://bruno-simon.com) (SOTD 2019-11-11; SOTY 2019) | Drive a 3D car to navigate projects | Three.js (Awwwards) | Memorable, but Awwwards accessibility 7/10 — don't make navigation game-only |
| [lusion.co](https://lusion.co) (v3 SOTD 2023-10-02; SOTY 2023) | Scroll-based 3D, cursor-reactive objects, huge type, "keep scrolling" cues | Three.js, GSAP, Lenis (page-text hints; `unverified`) | Dev score 10/10 animation, 9/10 web performance: proves heavy 3D can still be optimized. Palette #1a2ffb + #f0f1fa = light + electric blue (our reference for tone) |
| [Opal Tadpole](https://www.awwwards.com/sites/opal-tadpole) (SOTD 2024-01-11) | Product 3D hero, micro-interactions, single page | 3D, animation (Awwwards) | Single-page product storytelling with 2 colours; strong responsive score 8.0 |
| [Prometheus Fuels](https://www.awwwards.com/sites/prometheus-fuels) (Active Theory, SOTD 2021-05-04) | Stylized WebGL narrative scroll | WebGL (Awwwards) | Story-led scroll. Older; usability only 7.77 |
| [linear.app](https://linear.app) | Product site: minimal, mono-ish UI chrome, real product UI as the hero | Not inspected (`unverified`) | Tech-savvy = show real UI/code, no decoration; zero 3D needed |
| [Codrops "Cinematic 3D Scroll" demo](https://tympanus.net/Tutorials/Cinematic3DScroll/) + [repo](https://github.com/JosephASG/codrops-cinematic-scroll-animations) | Scroll-controlled camera + shader cylinder with particles | GSAP ScrollTrigger, Three.js, TypeScript, Vite (repo) | Closest to our architecture: scroll → camera. MIT; study but don't copy |
| [Codrops folding box tutorial](https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap) | Scroll-scrubbed object transformation | Three.js + GSAP ScrollTrigger (master timeline, `scrub`) | Canonical pattern: one timeline, `scrub: true` |

Measured in a real browser (built-in browser pane, desktop, 2026-10-07, ~5–8 s after load, cache state unknown; `transferSize` is 0 for cross-origin resources, so treat as lower bounds):

| Site | Measured |
|---|---|
| lusion.co | Astro (`/_astro/`), **1 JS file 306 kB transferred** (minified; three/GSAP bundled, no globals exposed), **3 canvases**, Lenis (`is-desktop is-ready` class on `<html>`; name inferred), fonts Aeonik + IBM Plex Mono, ~500 kB total transfer observed; Google Tag Manager script |
| igloo.inc | **App3D JS 423 kB**, **Draco geometry** (`igloo.drc` 222 kB, self-hosted `draco_decoder.wasm` 85 kB), **KTX2 textures** (1.29 MB scroll data texture, 135 kB frost), fonts converted to KTX2 data textures (MSDF-style text in WebGL) `(inferred)`, IBM Plex Mono; **~2.7 MB total**. Lesson: ~2.7 MB total is the ceiling of "acceptable"; our 3 MB total budget matches |
| landonorris.com | Webflow + custom GSAP/WebGL script hosted at `lando.itsoffbrand.io` (cross-origin, size unmeasurable), **20 `<canvas>` elements** (many contexts = risky on phones), fonts Brier + Mona Sans Variable |
| linear.app | No canvas, near-black bg `rgb(8,9,10)`, Inter Variable + Berkeley Mono, ~3 kB measured same-origin. Dark; we differ by going light |

Takeaways baked into this file: IBM Plex Mono is a common mono choice among studios (Lusion, Igloo) — consider it or Geist Mono; both 3D studio sites ship Draco + KTX2 and keep JS ≈ 300–430 kB (our 350 kB gzip 3D chunk budget is in the same range; they quote transferred size, which is compressed); avoid the Lando-style many-canvas approach.

Other award galleries: FWA and CSS Design Awards pages returned errors/redirects and searches gave no 2025/2026 winner lists; Godly redirected to an unrelated domain (`recent.design`) which I did not follow. Not covered; Awwwards + Codrops only.

## Code conventions
File layout
```
app/
  layout.tsx            # fonts, metadata, <SceneRoot/> mount
  page.tsx              # server component: sections + static poster
  globals.css           # Tailwind v4 @theme tokens
components/
  sections/             # Hero.tsx, Work.tsx, About.tsx, Stack.tsx, Contact.tsx (DOM, server where possible)
  ui/                   # Button, Tag, MonoLabel (Motion m components, 'use client')
  scene/
    SceneRoot.tsx       # 'use client'; capability gate + dynamic import
    Scene.tsx           # <Canvas/>, camera rig, lights
    CameraRig.tsx       # reads scrollState, samples path
    objects/            # one file per object (HeroObject.tsx …)
    materials/          # shared materials/shaders
lib/
  gsap.ts               # registerPlugin once
  motion.ts             # ease/dur tokens
  scroll-state.ts       # shared progress/velocity
  capability.ts         # tier detection
public/models/          # *.glb (Draco/Meshopt + KTX2)
public/draco/           # self-hosted decoders
public/posters/         # AVIF/WebP stills
scripts/optimize-models.mjs  # gltf-transform pipeline
```
Naming: components `PascalCase.tsx`; hooks `useThing.ts`; tokens `kebab-case` CSS vars; constants `camelCase`. TypeScript strict; no `any` in scene code.

Rules
- Client boundaries: only `scene/`, `ui/` interactive parts, and GSAP files are `'use client'`. Keep section copy in Server Components for SEO and LCP.
- Import GSAP via `lib/gsap.ts`; never call `gsap.registerPlugin` elsewhere.
- Never call `setState` in `useFrame` or scroll callbacks.
- **Dispose rules (3D)**: R3F auto-disposes objects it creates declaratively. You must manually `dispose()` anything created imperatively (`new THREE.*Geometry/Material/Texture/WebGLRenderTarget`, `CanvasTexture`, loaded `ImageBitmap` — call `texture.source.data.close?.()` first). Create shared geometries/materials once at module scope or `useMemo`, and dispose in a `useEffect` cleanup. Use `<primitive object={..} dispose={null}>` for cached `useGLTF` scenes so they aren't disposed on unmount. Check `renderer.info.memory` stays flat across mount/unmount in dev.
- Every `useGSAP` / ScrollTrigger lives in a scope; no global `ScrollTrigger.create` without a kill path. Call `ScrollTrigger.refresh()` after fonts/images load (use `document.fonts.ready`).
- Don't use `will-change` permanently; set on active layers only.
- Images: `next/image` with explicit width/height or `fill` + sized parent; AVIF/WebP.
- Dev tools: `stats-gl` or drei `<Stats/>` and `<PerformanceMonitor/>` in dev only; strip from prod.
- Lint/format: ESLint (next config) + Prettier; run `npm run build` and Lighthouse CI before declaring a task done.
- Comments sparingly; explain *why* for perf hacks.

## Dark redesign (2026-10-07) — what exists now
- **Splash** (`components/Splash.tsx`, `lib/intro.ts`): SSR'd full-screen overlay (so it paints first and covers hydration). Phases `loading → ready → entering → done`. Kenta-style top bar (rolling-digit `000%` counter, Jakarta clock), giant `RAYHAN` + outlined `FIRDAUS`, CSS-3D rotating cube, boot-log lines tied to real steps (`fonts`, `tier`, `scene`), Bruno-style **"Enter the city →"** button (Enter key also works). Exit = letters rise, whole screen wipes up (`clip-path`), `scrollState.intro` tweens 0→1 over 3.6 s. `<html>` gets `is-locked` (no scroll) until done; `<noscript>` hides the splash. Static tier / WebGL failure → `intro.skip()`.
- **Scene** (`components/scene/`): shader buildings (`shaders.ts`: procedural lit windows, glowing roof/corner edges, district glow, scan pulse, fog), ground shader (grid, roads, moving traffic streaks), sky dome (stars, violet haze), dust + landmark spark particles (single draw calls), 4 distinct landmark shapes (Learnix icosahedron, Alumni portal, Kandara stacked tower, Lab tesseract) with additive light beams. `CameraRig`: path sampling + intro spiral + idle drift + pointer parallax + scroll-velocity FOV kick/roll + `setViewOffset` so the city sits beside text. Shared uniforms in `uniforms.ts`.
- **DOM motion**: `SplitChars` per-character mask reveals (ScrollTrigger, start after intro), scroll-velocity `Marquee`, `Cursor` ring, `Hud` (corner brackets, stop rail, scroll %, current district, Reduce-effects toggle). Hero/section copy has no backgrounds.
- **QA**: add `?debug` to the URL to expose `window.__city` (scrollState) for visual testing. Visual regression was done with headless Edge via `playwright-core` (`channel: "msedge"`, SwiftShader flags) because the in-app browser pane stops running rAF when hidden.
- Known costs: GSAP now loads in the initial bundle (SplitChars/Marquee/Splash/Cursor). Initial JS ≈ 255 kB gz (budget 120) and lazy 3D chunk ≈ 248 kB gz (budget 350) as of this build. Draw calls ≈ 30 (full) / 19 (lite), triangles ≈ 31k / 17k measured under software rendering. FPS cannot be judged in that environment: test on a real phone.

## Implementation status (updated 2026-10-07)
Built and verified: `tsc`, `eslint`, `next build` all pass; static prerender of `/`. Run: `npm run dev` / `npm run build && npm start`. Windows note: the machine's PATH is broken for child processes; prefix shell commands with `$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;C:\Program Files\Git\cmd;C:\WINDOWS\system32;C:\WINDOWS"` or `npx`/`node` fail with `"node" is not recognized`. `.claude/launch.json` defines the `portfolio` preview (production server on :3100).

(First-iteration status below is partly superseded by "Dark redesign" above: fonts, theme, render loop and the measured numbers changed.) Done in v1: Next 16.4.0 + Tailwind 4.3.3 (tokens in `app/globals.css`), pinned deps (see `package.json`), Plus Jakarta Sans + JetBrains Mono, all five sections with owner content (`data/profile.ts`, `data/projects.ts`), mailto contact, single fixed canvas with procedural instanced city (`components/scene/City.tsx`), aerial camera path (`camera-path.ts`, 6 stops: hero, 4 districts, closing), scroll → stop mapping from `[data-stop]` elements (`ScrollDriver.tsx`, GSAP ScrollTrigger), `frameloop="demand"` with damped camera, skill-hover district highlight, live renderer stats panel in the "This site" district (`LabStats.tsx`), capability gate `full|lite|static` (`lib/capability.ts`), CSS-only static poster, "Reduce effects" toggle, error boundary + `webglcontextlost` fallback.

v1 (light-theme simple scene) measurements, now OLD, in the in-app browser (desktop 1280×760, then 375×812 mobile emulation, local prod build):
- full tier: ~72 fps, **7 draw calls, ~9k triangles, 11 geometries**, DPR 1.25–2 cap; lite tier: ~68 fps, **5 draw calls, ~8.8k triangles**, DPR 1.5 cap. Well under budget (≤ 100 calls / ≤ 100k tris on mobile). Emulated browser, not a real mid-range phone — still `(unverified)` on hardware.
- JS (gzip, `.next/static/chunks`): lazy 3D chunk (three + r3f + drei + gsap + scene) **≈ 280 kB** (budget 350: OK). **Initial JS ≈ 209 kB gz across 8 chunks — over the 120 kB budget.** Most of that is Next/React runtime; own code not yet profiled. TODO: run a bundle analyzer, confirm what dominates, trim (e.g. drop `motion` Reveal for CSS, check drei barrel imports), and either hit 120 kB or formally restate the budget as "excluding framework runtime".
- No LCP/INP/CLS lab numbers yet: run Lighthouse mobile before claiming CWV.

Deviations from the plan above (intentional):
- `detect-gpu` NOT installed (it fetches benchmark data from a CDN unless self-hosted). Tier gate uses `deviceMemory`, `hardwareConcurrency`, `saveData`, pointer type, viewport width, WebGL2 check; runtime degradation via drei `PerformanceMonitor` (DPR drop). Revisit detect-gpu only with self-hosted benchmarks.
- Lenis not installed (native scroll; the city already feels smooth thanks to camera damping). Add only if wanted.
- `next.config.ts` leaves out the scaffold's `cacheComponents`/`reactCompiler`/`partialPrefetching` (unverified effects); only the Tailwind turbopack rule and immutable cache headers for `/models`, `/posters`, `/draco`.
- Sizes of `skills` lists in `data/projects.ts` are placeholder guesses used only for the hover highlight; the owner must confirm (marked `TODO(owner)`).
- "This site" district links to the GitHub profile; replace with the repo URL once it exists.
- Console shows a three.js deprecation warning ("THREE.Clock … use THREE.Timer") coming from r3f 9.8.1; harmless, not ours.

Next up (not built yet): real poster image from a render of the scene; Lighthouse CI + bundle analysis; keyboard/screen-reader pass; district labels in 3D (or DOM-projected); about/experience scene polish; OG image/favicon; deploy to Vercel.

## Open questions
1. (Resolved) Signature 3D = project city, procedural, Vercel, with a "how it's built" section — see Project summary.
2. (Resolved) 3 projects + 1 self-showcase = 4 districts; camera path = 4 stops plus intro/outro (≈ 6 `data-scene-stop` values). Keep total city ≤ ~2,000 building instances.
3. (Resolved) Camera is **aerial** (fly-over, ~30–60° down-tilt, fog hides far geometry). No street-level; keeps visible instances and draw calls low.
4. WebGPU/TSL: revisit when caniuse shows Safari/Firefox unflagged; sources conflict now (caniuse: partial/flagged vs. a blog claiming ~87% global).
5. R3F bundle size vs vanilla three: not measured here; measure after scaffold and decide whether to drop R3F.
6. Cross-document View Transitions support and `@react-three/a11y` current version/compat with R3F 9 not verified.
7. Exact caniuse figures for scroll-driven animations not retrieved (404 on JSON path); numbers rest on Chrome docs/WebKit blog/secondary summary.
8. Real-device numbers (draw-call/FPS on target phones) are our conservative estimates; validate on actual hardware.
9. Hosting target (Vercel? static export?) affects asset caching headers and Brotli.
10. Reference-site tech: Lusion, Igloo, Lando Norris, Linear measured in-browser; others (Messenger, Bruno Simon, Opal Tadpole, Prometheus) still from Awwwards tags only.

## Sources
All checked 2026-10-07 unless noted.
- npm registry: https://registry.npmjs.org/{gsap,three,motion,@react-three/fiber,@react-three/drei,lenis,next,tailwindcss,@gsap/react,react,detect-gpu}/latest
- caniuse data (GitHub raw): https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/{view-transitions,webgpu,offscreencanvas}.json (css scroll-timeline JSON paths 404)
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll · /Web/API/View_Transition_API · /Web/API/WebGPU_API · /Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- WebKit: https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- Chrome: https://developer.chrome.com/docs/css-ui/scroll-driven-animations (surfaced in search; not fetched in full)
- GSAP: https://gsap.com/standard-license · https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://gsap.com/resources/React/
- Lenis: https://github.com/darkroomengineering/lenis
- Motion: https://motion.dev/docs/react-reduce-bundle-size
- R3F/drei: https://r3f.docs.pmnd.rs/advanced/scaling-performance · https://drei.docs.pmnd.rs/loaders/gltf-use-gltf · https://a11y.docs.pmnd.rs/introduction
- three.js: https://threejs.org/docs/ (WebGPURenderer import note) · https://www.utsubo.com/blog/threejs-best-practices-100-tips (secondary) · https://www.utsubo.com/blog/webgpu-threejs-migration-guide (secondary, search snippet)
- glTF-Transform: https://gltf-transform.dev/cli
- Next.js: https://nextjs.org/docs/app/guides/lazy-loading (docs v16.4.0, updated 2026-03-10)
- web.dev: https://web.dev/articles/vitals · https://web.dev/articles/optimize-lcp · https://web.dev/articles/inp
- Awwwards: https://www.awwwards.com/websites/sites_of_the_year/ · /sites/lando-norris · /sites/igloo-inc · /sites/lusion-v3 · /sites/messenger · /sites/bruno-simon-portfolio · /sites/opal-tadpole · /sites/prometheus-fuels
- Sites: https://lusion.co · https://linear.app · https://bruno-simon.com (fetch ok, little info) · https://igloo.inc (fetch gave no usable content)
- Codrops: https://github.com/JosephASG/codrops-cinematic-scroll-animations · https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap
- Trend/secondary blogs: https://line25.com/articles/web-design-trends-2026/ · https://studiomeyer.io/en/blog/webdesign-trends-2026 · https://studiomeyer.io/en/blog/3d-webdesign-webgl · https://cloud.needle.tools/compare/r3f-vs-spline
- Accessibility search results: https://discourse.threejs.org/t/accessibility-for-3d-websites/87092
