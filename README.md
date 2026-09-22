# KINETIC® — Design & Motion Agency (Astro + SolidJS)

Pixel-faithful build of the KINETIC - Design and Motion Agency with AstroJS, SolidJS islands,
TypeScript, Zod, GSAP ScrollTrigger, Lenis smooth scroll and raw WebGL shaders.

## Stack (latest, Sep 2026)

- **Astro 7** — static output, content collections, View Transitions (`ClientRouter`), `compressHTML: true` (pins pre-v7 whitespace behavior)
- **SolidJS 1.9** — client islands (`client:load` / `client:visible`)
- **TypeScript 7 + Zod 4** — collection schemas + contact-form validation (`z.email()`, `{ error }` params, `z.treeifyError()`)
- **GSAP 3.15 ScrollTrigger** — scrubbed scroll cinema (hero zoom, parallax, 3D stacking, horizontal track, theme fading, video scrub)
- **Motion 13** — triggered micro-interactions (`inView` reveals, tweened count-ups, spring releases, quote transitions, preloader tween)
- **Lenis 1.3** — smooth scrolling via `autoRaf` + native `anchors`, `lenis.css`, ScrollTrigger sync
- **Raw WebGL (GLSL)** — hero flow-shader + CTA grain shader, DPR-capped, pause offscreen
- **Fonts** — Anton / Space Grotesk / JetBrains Mono (Google Fonts, `display=swap`)

## Commands

```sh
npm install
npm run dev      # local dev
npm run build    # static build → dist/
npm run preview  # preview build
npx tsc --noEmit # typecheck
```

## Structure

- `src/pages/` — `/`, `/work/`, `/work/[slug]/`, `/journal/`, `/journal/[slug]/`,
  `/studio/`, `/capabilities/`, `/awards/`, `/contact/`, `/404/`
- `src/content/` — `work` (6), `journal` (3), `testimonials` (3), `awards` (5)
- `src/content.config.ts` — Zod schemas + `glob` loaders
- `src/layouts/BaseLayout.astro` — SEO head, fonts, header/footer, islands
  (footer hosts the global CTA + Contact sections above the foot bar)
- `src/components/` — Hero, Marquee, Manifesto, WorkSection, Capabilities,
  ProcessSection, AwardsSection, Quotes, DynamicMotion, NycSection,
  JournalSection, CtaSection, ContactSection
- `src/islands/` — Cursor, Preloader, SmoothScroll, HeroScene, CtaShader,
  ScrollEffects, MotionStage (pinned 100vh scroll cinema), WorkGrid, Accordion,
  QuotesSlider, VideoScrub, ContactForm, Clocks, HeaderTheme (header contrast
  inversion), MobileMenu, ShowreelModal
- `src/lib/` — `site.ts` (config + Zod), `palettes.ts` (work-grid art),
  `shaders.ts` (GLSL), `browser.ts`, `hooks.ts`
- `src/styles/global.css` — mobile-first design system, `--max: 1400px`,
  alternating section tones (`tone-*` + `data-tone` light/dark overrides)

## Scroll effects (all in `ScrollEffects` + `VideoScrub`)

1. **Sticky Zoom Hero Reveal** — hero title scales/blurs away on scroll (scrubbed)
2. **Multi-Layer Parallax Depth** — glow/grid at different rates, image + card-art parallax
3. **Layered 3D Card Entrances** — work cards tilt in with `rotateX`/scale (no positional
   overlap; grid keeps a 30px rhythm)
4. **Horizontal Scroll Sections** — process steps translate horizontally on desktop
5. **Scroll-Based Color & Theme Fading** — header chrome inverts (`on-light` mode)
  to match section contrast via `HeaderTheme`; CTA grade shift on scroll
6. **Scroll-Driven Video Scrubbing** — CC0 video `currentTime` driven by scroll + progress bar
7. **Pinned Motion Stage** — 100vh violet band, counter-scrolling display rows,
  scaling glow field, spinning badge (`MotionStage`)
8. Extras — manifesto word scrub, Motion count-ups, magnetic springs, quote transitions

## Notes

- Work-grid cards use generative gradient art (`src/lib/palettes.ts` — one palette per
  project, animated blobs + display numeral) instead of stock photos; case-study pages
  keep their photographic covers.
- Marquees are pure-CSS seamless loops (two identical halves, `width: max-content`,
  `translateX(-50%)`) — no restart jump.
- Navbar links are home-aware (`#section` on `/`, `/#section` elsewhere) so anchors work
  from every page; Lenis `anchors` smooth-scrolls them.
- Images are open-source Unsplash URLs (lazy-loaded, async-decoded); video is a
  CC0 MDN sample. No binary assets in the repo.
- Reduced-motion users get a static paint, no Lenis smoothing, no scrubbing.
- SEO: canonical, OG/Twitter, JSON-LD, sitemap, robots, semantic landmarks.

## Linting

`npm run lint` runs **oxlint** (Oxc, Rust-based). Classic `typescript-eslint` cannot run
here yet: TypeScript 7 native removed the JavaScript compiler API (`createSourceFile`,
etc. — only a `version` stub remains) and `typescript-eslint` peers cap at TS `<6.1`.
`tsc --noEmit` (native binary) remains the type authority until upstream adds TS 7 support.

## Type-safety rules for new pages/components (no implicit `any`, ever)

`tsc` ignores `.astro` files, so frontmatter must be self-typing. Every new file follows:

1. **Keep `src/env.d.ts` referencing `../.astro/types.d.ts`** — without it, editors and
   `astro check` cannot resolve content-collection types and every `getCollection`
   callback degrades to implicit `any`.
2. **Annotate collection arrays** — `const work: CollectionEntry<'work'>[] = await
   getCollection('work')` (import the type from `astro:content`). All `.sort/.map/
   .find/.filter` callbacks then infer their parameters.
3. **Type dynamic routes** — `export const getStaticPaths = (...) satisfies
   GetStaticPaths` (import type from `astro`) plus `type Props = { entry:
   CollectionEntry<'work'> }` with `Astro.props as Props`.
4. **Type component props** — `Astro.props as Props` with an explicit `Props` type.
5. Verify with `npm run lint`, `npx tsc --noEmit`, and `npm run build`
   (`npm run check` re-activates once `@astrojs/check` supports TS 7).
