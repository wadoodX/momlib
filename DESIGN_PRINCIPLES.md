# Nibras — Design Principles

A living guide for how Nibras looks and feels. It governs the landing page today and every
page we build or migrate next. When in doubt, choose the calmer, quieter option.

## Brand & tone

Nibras is a calm, scholarly library for Alimiyyah and Islamic Studies notes. The feeling is
**warm and unhurried** — like a well-kept manuscript: parchment, deep green ink, the occasional
gold flourish. Reverent, not flashy; quiet, not loud.

## Color tokens

A warm "parchment" palette: cream background, deep slate-green ink, sage accents, gold ornaments.
Defined in `app/globals.css` under `@theme` (use as Tailwind classes: `bg-paper`, `text-ink`, etc.).

| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#F0EBDE` | Page background (parchment) |
| `paper-soft` | `#E7E0CF` | Raised panels / book surface |
| `ink` | `#28332B` | Headings, body emphasis, key marks (deep slate-green) |
| `muted` | `#5B645A` | Body text, secondary labels (green-gray) |
| `line` | `#DCD4C4` | Hairline borders and dividers (warm tan) |
| `sage` | `#7C9468` | Primary buttons / CTAs, small accents |
| `sage-deep` | `#5E7350` | Button hover |
| `gold` | `#BF9F53` | Ornaments, brand dot, sparing emphasis |

- `ink`/`muted` on `paper` exceed WCAG AA for text. Gold is decorative only — never body text.
- The whole app (landing + signed-in) uses these parchment tokens; light/dark is driven by the
  `.dark` class redefining the CSS variables, so don't hardcode hex or add `dark:` variants.

## Typography

- **Display / headings:** Montserrat (`font-display`), weights 500–700, tight tracking (`-0.02em`).
- **Body / UI:** Inter (`--font-body`, the default `font-sans`), weights 300–600.
- Type ramp (landing): hero `clamp(2.6rem,6.4vw,5rem)`; section H2 `text-4xl`→`sm:text-5xl`;
  card H3 `text-2xl`; body `text-lg leading-8`; labels `text-xs uppercase tracking-[0.3em]`.
- One dominant headline per section. Body measure stays readable (~`max-w-xl`).

## Layout & spacing

- Container: `max-w-6xl`, `px-6`. Sections use a **left-aligned** grid; the hero is centered
  (a deliberate focal moment).
- Vertical rhythm: section padding `py-28`→`sm:py-36`. Let whitespace do the work.
- Separate with **hairlines** (`border-line`), not boxes or shadows.

## Components

- **Buttons:** small radius (`rounded-md`), never pills. Primary = solid `sage` with `paper` text
  (hover `sage-deep`); secondary = `border-line` outline that darkens on hover. No neon gradients.
- **Labels / eyebrows:** plain uppercase tracked text in `muted`, often paired with a small gold
  ornament. **No bordered/`rounded-full` chips.**
- **Cards / lists:** prefer hairline dividers (`divide-line`); if a surface is needed, use
  `paper-soft`/`card`. Soft, low shadows only.
- **Ornaments:** small gold SVG sprigs above headings, used sparingly for a manuscript feel.
- **Icons:** thin line icons (stroke 1.5–1.75) in `sage` or `ink`.
- **shadcn primitives:** live in `components/ui/` and are themed via token aliases in
  `app/globals.css` (e.g. `--color-background → paper`, `--color-primary → sage`). Note:
  `--color-muted` is intentionally left as our body-text token, so use `bg-secondary` (not
  `bg-muted`) for subtle hover surfaces.

## Motion

- Purposeful and subtle: short fade + small upward translate on load and on scroll-in
  (see `components/landing/reveal.tsx`). Easing `[0.21,0.47,0.32,0.98]`, ~0.7–0.8s.
- The hero centerpiece (`book-scene.tsx`) writes بِسْمِ اللّٰه onto an illustrated parchment book
  via a right-to-left `clipPath` reveal with a pen nib following, then rests.
- **Always honor `prefers-reduced-motion`** — show the finished state, no animation.

## Core principles (and how we apply them)

- **Hierarchy** — size, weight, and space rank content; one clear focal point per screen.
- **Contrast** — deep green ink on parchment carries emphasis; sage and gold are accents, used sparingly.
- **Alignment** — everything sits on the shared left grid and container width.
- **Proximity** — related items grouped; unrelated items separated by whitespace or a hairline.
- **Repetition / consistency** — reuse the tokens, the type ramp, and the button/label patterns.
- **Restraint** — remove before adding; the calmest version that still communicates wins.

## Do / Don't (anti-"AI-slop" checklist)

**Don't**
- No pills (`rounded-full` chips or buttons).
- No em dashes in copy — use commas, periods, or restructure the sentence.
- No two-line headlines with a forced `<br>` and an italic "accent word."
- No neon glow, harsh gradients, or purple-on-white clichés (soft sage/gold washes are fine).
- No decorative text that says nothing ("The library, considered").

**Do**
- Write plain, confident sentences.
- Use hairlines and whitespace for structure.
- Keep emphasis restrained: deep green ink for hierarchy, sage for action, gold only as ornament.
- Test contrast and reduced-motion before shipping.
