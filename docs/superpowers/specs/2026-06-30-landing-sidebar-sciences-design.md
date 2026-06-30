# Landing page: sidebar nav + "Eight sciences", lamps removed

**Date:** 2026-06-30
**Status:** Approved (design), implementing

## Context

The public landing page (`app/page.tsx`) currently uses a top navbar (`Navbar5`) over a
full-page **animated lantern canvas backdrop** (`LanternBackdrop` → `hero-lantern.tsx`) on the
parchment + sage palette. The user wants it to feel more like the `nibras-immersive.html` mockup —
**but only partially**: keep the current palette and fonts, adopt the mockup's **left sidebar nav**
and **"Eight sciences" section**, and **remove the lamp/lantern graphics**.

This is scoped to the **public landing page only**. The signed-in app (its `NavBar`, theme, and
data layer) is untouched.

## Decisions (confirmed with user)

- Keep the existing parchment + sage palette and Montserrat/Inter fonts. **Not** the mockup's
  teal/gold or Amiri/Cormorant typography.
- Adopt: **left sidebar nav** + **"Eight sciences" section**.
- **Remove lamps** = the lantern *graphics*; the brand name "Nibras" stays as text. Drop the
  mockup's Arabic logo line and per-card Arabic glyphs.
- Sciences section is a **static showcase** (the mockup's eight, plain-ASCII blurbs). Cards link to
  `/login?mode=signup` (page is public/unauthenticated, so real courses can't be queried here).
- Omit the mockup's "Ustadha Yasmeen" persona credit — use a neutral tagline.

## Components

### New: `components/landing/landing-sidebar.tsx` (client)
The landing's primary nav, replacing `Navbar5`. Current palette (`bg-card`/`border-line`, gold
accents, sage hover), styled to match the app — not the mockup's teal.
- **Desktop** (`lg+`): fixed, sticky, full-height rail (~`w-64`). Brand "Nibras" → section anchor
  links (About `#what`, The sciences `#sciences`, How it works `#how`, Features `#features`,
  Who it's for `#who`, Pricing `#pricing`, Begin `#begin`) → bottom: **Sign in** + **Go Pro**
  buttons and the `ThemeToggle`.
- **Mobile** (`<lg`): collapses to a slim top bar (brand + menu button) opening a drawer with the
  same links. Reuse the existing `Sheet` primitive + `ThemeToggle` (same pieces `Navbar5` used).

### New: `components/landing/sciences.tsx` (server)
Static showcase section `id="sciences"`, placed right after the hero. Header "The eight sciences" +
subhead. Eight cards in the existing card style (numbered `01–08` chips like the chapter rail,
rounded `bg-card` cards, gold/sage accents), each a `Link` to `/login?mode=signup`. Plain-ASCII
titles + blurbs (no Arabic glyph, diacritics cleaned per the app's ASCII convention):

| # | Title | Blurb |
|---|-------|-------|
| 01 | Arabic Grammar | Sentence structure and case endings, from al-Ajurrumiyya to Hidayat al-Nahw. |
| 02 | Morphology | The patterns and derivation of words — the science of sarf. |
| 03 | Arabic Language | Vocabulary, reading, and expression toward living command. |
| 04 | Quran | Tafsir and the Quranic sciences, beginner to advanced. |
| 05 | Hadith | The Prophetic traditions and the sciences of their study. |
| 06 | Seerah | The life of the Prophet ﷺ and the early Islamic story. |
| 07 | Tazkiyah | Purification of the heart and the inward sciences. |
| 08 | Fiqh | Islamic jurisprudence and its guiding principles. |

## Modified

- **`app/page.tsx`** — remove `LanternBackdrop`. Becomes a `flex` shell: `<LandingSidebar />` +
  `<main className="flex-1 min-w-0">`. Section order: Hero → **Sciences (new)** → AppPreview →
  HowItWorks → Features → Audiences → Testimonials → PricingTeaser → CTA → Footer. Drop the
  lantern-referencing gradient wrapper.
- **`components/landing/hero.tsx`** — remove the embedded `Navbar5` (nav now lives in the sidebar)
  and the lantern-backdrop comments. Keep the self-contained corner glows + `hero-scrim` for a calm
  static background.
- **`components/landing/audiences.tsx`** — add `id="who"` + `scroll-mt-20`.
- **`components/landing/cta.tsx`** — add `id="begin"` + `scroll-mt-20`.

## Deleted

- `components/landing/lantern-backdrop.tsx`
- `components/landing/hero-lantern.tsx`

## Reuse

`Sheet`, `ThemeToggle`, `Button`, `Reveal`, the existing section components and their `id`s
(`#what`, `#how`, `#features`, `#pricing`), and the chapter-rail/NodeCard card/token styling.

## Verification

1. `npm run lint` + `npm run build` (incl. `tsc`) green.
2. `npm run dev`, visit `/`: sidebar rail on desktop with working section anchors; lamps gone; the
   eight-sciences section renders and cards link to sign-up; hero reads cleanly without the lantern
   glow; mobile collapses the rail into the drawer; Sign in / Go Pro work; theme toggle works.
