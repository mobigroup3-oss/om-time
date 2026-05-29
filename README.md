# OM-Time Design System

> Центр современных психотехнологий и психотерапии
> Modern psychotechnology & psychotherapy center, Almaty, Kazakhstan

This design system supports OM-Time's marketing site, client account, and internal admin tools. It is **Russian-first** (with KZ + EN as locale variants), built around the calm, evidence-based voice the brand uses to talk about a serious topic: psychosomatic weight correction and related therapeutic work.

The brand is **not** "wellness coach Instagram." It is a licensed medical methodology with clinical data, run by named psychotherapists, gastroenterologists, and nutritionists. The visual system reflects that: editorial pacing, warm cream canvas, restrained type, brand voltage delivered through full-bleed signature surface cards (gold, indigo, coral), never through atmospheric gradients or accent walls.

---

## What's in here

| Path | What it is |
| --- | --- |
| `colors_and_type.css` | All design tokens — colors, type, spacing, radius, elevation, motion. Single source of truth, drop into any HTML file. |
| `assets/` | Logo (full mark, glyph-only crop), favicon. **Copy these into the consumer's project; do not link cross-project.** |
| `content/om-time-texts.txt` | The full Russian copy deck from the client (homepage, programs, admin tool, account, emails, microcopy). The voice guide at the bottom is canonical. |
| `preview/` | Static specimen cards for the Design System tab. One concept per card. |
| `ui_kits/marketing/` | High-fidelity recreation of the marketing site — homepage screen + reusable components (`Header`, `Hero`, `TrustNumbers`, `PainCards`, `MethodologyLevels`, `IntensiveDays`, `ProgramScheduleCard`, `Testimonial`, `Footer`, plus the full `index.html` click-through). |
| `SKILL.md` | Cross-compatible skill file — use this to invoke the system from Claude Code. |

---

## Sources

The system was built from two assets supplied by the client:

1. **`uploads/Тексты_OM_Time_сайт_v2.docx`** — a 30k-word Russian content deck covering every page of the site, the admin "Помощник по заявкам" tool, the client account, transactional emails, and a tone guide. The system's component vocabulary is reverse-engineered from this document. Saved as plain text at `content/om-time-texts.txt`.
2. **`uploads/лого обнов.png`** — the brand logo (806×835, transparent PNG). Saved at `assets/om-time-logo.png`. The glyph is two purple hands cradling a golden swirling figure with four red stones; the wordmark "OM Time" sits below in deep indigo with a curved ring of metadata text ("ЦЕНТР СОВРЕМЕННЫХ ПСИХОТЕХНОЛОГИЙ И ПСИХОТЕРАПИИ") around the top.

No codebase or Figma file was supplied. No existing site to extract from. The visual system below is **derived from the brand assets + the tone of the content** — calm, editorial, evidence-led, warm. Reviewers should treat the visual decisions as a proposal grounded in those two artifacts, not as a recreation of a live product.

---

## Content fundamentals

The voice guide at the end of the content deck is detailed and disciplined. Hold to it.

**Two parallel intonations, never mixed in the same sentence:**

1. **Evidence-base** — numbers, clinical research, medical licensing, physiological effects. Precise and concrete.
   > *По данным клинических исследований методики, 93% участников снижают ИМТ на 2–3 пункта.*
2. **Human support** — pain points, testimonials, FAQ. Warm and conversational, the way one adult talks to another.
   > *Сидели на диете, считали калории, ходили в зал. Сбросили — а через полгода всё на месте.*

**Person & address.** Always `вы` — **lowercase**, never capitalized. "Мы" for the center (never "наша команда", never "наши специалисты"). It's two adults talking.

**Casing.** Sentence case everywhere — headlines, button labels, navigation. No All Caps display, no Title Case English-style.

**Emoji.** Never. The client's source descriptions used 🔥 ✅ ⚡ 🧘 — the rewrite explicitly removed them. The system uses real iconography (Lucide line icons; see ICONOGRAPHY below).

**Exclamation marks.** Almost never. The site allows one or two per page maximum. The intensive's brand description ("ошеломляющие изменения!", "откройте для себя!") was scrubbed for the same reason.

**Forbidden vocabulary** (treat as never-ship):
- Marketing platitudes: «уникальный», «революционный», «непревзойдённый», «ошеломляющий», «откройте для себя»
- Magic promises: «мгновенный результат», «навсегда», «без усилий», «гарантированно»
- Bureaucratic filler: «в рамках», «осуществлять», «данный», «является», «надлежащий»
- Pseudo-empathy: «мы понимаем, как вам тяжело» (reads as condescension)

**Preferred patterns:**
- Short sentences against long ones. Avoid uniform rhythm.
- Concrete numbers over abstraction: «−11 кг за месяц», not «значительное снижение веса».
- Acknowledge difficulty: «Это страшно. Но и облегчение тоже.» beats «вы почувствуете облегчение».
- State who the method does *not* fit. The brand's "Кому не подходит" block is a trust mechanism.
- Always cite clinical data inline: «По данным клинических исследований методики, …»

**Concrete examples to study** (all from the content deck):

| Bad (struck from v1) | Good (v2 ships) |
| --- | --- |
| Откройте для себя путь к идеальной фигуре! 🔥 | Снижение веса через работу с сознанием |
| Уникальная запатентованная методика | Авторская методика — 4 дня интенсива и 2 месяца сопровождения |
| Гарантированный результат навсегда | По данным методики, 93% участников снижают ИМТ |
| Мы понимаем, как тяжело худеть | Сбросили — а через полгода всё на месте. Иногда даже больше. |

---

## Visual foundations

### Colors

The palette is **derived from the logo** — golden yellow (the swirl), deep indigo (wordmark + hands), clay-red coral (the four stones), warm cream canvas. There is no "off-brand" accent in the system; everything else is muted/neutral.

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Ink | `--om-ink` | `#1B1840` | Display headlines, primary CTA background, dark signature card |
| Body | `--om-body` | `#2E2B52` | Default body copy |
| Muted | `--om-muted` | `#6B6890` | Captions, footer, breadcrumbs |
| Canvas | `--om-canvas` | `#FBF8F2` | Default page surface — **warm cream, not pure white** |
| Canvas white | `--om-canvas-white` | `#FFFFFF` | Cards on canvas |
| Canvas soft | `--om-canvas-soft` | `#F4EFE2` | Alt band between sections |
| Gold | `--om-gold` | `#F2C12E` | Signature surface, pricing tier highlight, evidence callouts |
| Indigo | `--om-indigo` | `#2E2470` | Signature dark card mid-page |
| Indigo deep | `--om-indigo-deep` | `#1B1448` | Footer band |
| Coral | `--om-coral` | `#C03A3B` | Signature warm card — the homepage hero callout |
| Coral deep | `--om-coral-deep` | `#8C2528` | Press state on coral |
| Sage | `--om-sage` | `#B7C9A8` | "Подходит / safe" semantic |
| Lilac | `--om-lilac` | `#C8BFE0` | Soft demo-card surface |
| Cream | `--om-cream` | `#F2E3C4` | Cream callout |
| Link | `--om-link` | `#3A2EA0` | Inline links — indigo-shifted, never pure blue |

**Color discipline:**
- The canvas is `--om-canvas` (warm cream), **not** `#FFFFFF`. Pure white is reserved for cards sitting *on* the cream canvas — the contrast between canvas-cream and card-white is part of the system's warmth.
- Brand voltage lives in **signature surface cards** (gold, indigo, coral), full-bleed, never as accents on a small element.
- The link blue is `--om-link` (`#3A2EA0`, indigo-shifted), not a generic SaaS blue. It reads as "of-this-brand."
- Semantic roles (success, warning, danger) draw from earthy hues — sage, ochre, deep clay-red — not the green/yellow/red of a typical OS toast.

### Type

**Onest** is the system family — a modern variable sans with first-class Cyrillic. It carries everything from 13px legal text to 56px hero headlines.

| Role | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| `display-xl` | 56px | 500 | 1.15 | Homepage hero |
| `display-lg` | 44px | 500 | 1.15 | Page heroes |
| `display-md` | 32px | 500 | 1.3 | Block headlines |
| `title-lg` | 24px | 500 | 1.3 | Section titles |
| `title-md` | 20px | 500 | 1.3 | Sub-titles, card heads |
| `title-sm` | 18px | 500 | 1.4 | Program cards, article titles |
| `label` / `button` | 16px | 500 | 1.4 | Buttons, list labels |
| `body` | 16px | 400 | 1.55 | Body copy |
| `body-sm` | 14px | 400 | 1.55 | Captions, top nav, footer |
| `meta` | 13px | 500 + 0.04em | 1.4 | Eyebrows, tags, breadcrumbs |

**PT Serif** appears sparingly for pull-quotes and a few editorial moments where serif texture signals "this is testimony, not pitch." Never used for headlines.

**JetBrains Mono** appears only in numeric tables (prices, comparison tables, dashboard stats).

**Type principles:**
- Display weight caps at 500. Emphasis comes from size + color contrast + signature surface cards — never from boldness. 700 weight is reserved for inline `<strong>` accents and legal CTA buttons.
- All headlines use sentence case in Russian. No All-Caps display.
- Body line-height runs ~5% looser than typical Latin-only systems — Cyrillic descender + ascender ranges need more air.

### Spacing

Base unit 4px. Universal vertical rhythm constant: **96px** between editorial bands (`--om-space-section`). Card internal padding: 32–48px for signature surfaces, 24px for content cards, 16px for demo grids. Grid gutters: 24px between desktop cards, 16px inside denser layouts.

### Backgrounds

There is no atmospheric gradient anywhere in the system. **Backgrounds are color blocks.** The page reads as a column of bands: cream canvas → coral signature card → cream → gold callout → indigo signature card → cream → cream-strong CTA banner → indigo-deep footer.

No mesh. No spotlights. No animated noise. The brand trusts whitespace and color blocking the way an editorial magazine does.

### Imagery

When real photography appears, it favors warm natural light, low saturation, real people (the trainers, the actual studio space at Алмагуль 23А). Stock photography of generic "wellness women in white robes" is off-brand. Until real photography is shot, the UI kit uses neutral cream-and-indigo placeholder blocks with the asset name printed in them — better to ship a placeholder than to ship the wrong vibe.

### Animation

Calm and short. 120–320ms ease-out. No bounces, no springs, no decorative scroll-driven effects.

- Default transition: `200ms ease-standard` for state changes.
- Page-band scroll reveals: 320ms fade + 8px translate, single direction (up), no parallax.
- No looping animations anywhere on marketing surfaces. The admin tool may animate the "Анализируем заявку..." loader (rotating dotted ring).

### Hover / press / focus

- **Hover** — text links pick up a 1px underline. Buttons lift their background tone by ~5% luminance. No scale, no glow.
- **Press / active** — primary CTA darkens to `--om-ink-active`. Coral and gold surfaces darken by ~10% (deep variants exist as tokens).
- **Focus** — 3px ring in `--om-shadow-focus` (indigo-link, 22% alpha). Visible on all interactive elements.

### Borders

Hairlines are warm — `#E5DECB` (canvas-tinted, not gray). Card outlines use a single 1px hairline. There are no double borders, no top-only accent lines, no left-border accent strips.

### Shadows

Color-block first, shadow second. Two shadows in the system:
- `--om-shadow-card` — 1px + 8px offset, indigo-tinted, very subtle. Used on demo cards and program cards that float on canvas.
- `--om-shadow-lifted` — slightly stronger, used on dropdowns and modals.

Shadows are warm-indigo, never gray-black.

### Transparency & blur

Used sparingly:
- **Cookie banner & sticky CTA** sit on `rgba(251, 248, 242, 0.92)` + `backdrop-filter: blur(8px)` so the page beneath remains legible.
- **Modal scrim** is `rgba(27, 24, 64, 0.36)` (indigo-tinted, not pure black) with no blur.

No glass-card surfaces, no frosted hero panels.

### Corner radii

| Token | Value | Use |
| --- | --- | --- |
| `--om-radius-xs` | 4px | Legal / cookie / required-system surfaces |
| `--om-radius-sm` | 8px | Inputs, small inline buttons |
| `--om-radius-md` | 12px | Demo cards, list items |
| `--om-radius-lg` | 16px | Signature cards, hero callouts |
| `--om-radius-xl` | 24px | Large editorial panels |
| `--om-radius-pill` | 9999px | **Primary + secondary CTAs, chips, tags** |
| `--om-radius-full` | 9999px | Avatars, icon buttons |

**Why the CTA is a pill, not 12px.** Pills read as warm and human; 12px-radius rectangles read as SaaS / dashboard chrome. OM-Time is therapy, not infrastructure — the pill is intentional.

### Cards

Cards on canvas use `--om-canvas-white` background, `--om-radius-md` (12px) or `--om-radius-lg` (16px) corners, 1px `--om-hairline` border, and the `--om-shadow-card` shadow. Signature surface cards (gold/coral/indigo/cream) drop the border (the color does the framing) and use `--om-radius-lg` (16px).

---

## Iconography

OM-Time has no proprietary icon set. The system uses **Lucide** (open-source, MIT, ~1500 icons, 1.5px stroke weight) loaded from CDN.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

**Style rules:**
- Stroke weight 1.5px (Lucide default). Do not switch to a heavier or lighter stroke mid-page.
- Icons render in the surrounding text color, never colored independently. Exception: status icons (check = `--om-sage-deep`, warn = `--om-warning`, error = `--om-danger`).
- Sizes: 16px inline with body, 20px inline with labels, 24px in buttons/list items, 32px as feature-card glyphs.
- **No emoji.** Anywhere. The content guide is explicit about this — "На сайте используем нормальные иконки в дизайн-системе, а не эмодзи в тексте."
- **No filled / duotone icons.** Lucide line-only.

**Icon-to-concept lexicon for OM-Time:**

| Concept | Lucide icon |
| --- | --- |
| Weight / scale | `scale`, `gauge` |
| Sleep / night eating | `moon` |
| Sweet cravings | `candy` |
| Mirror / self-image | `square-user` |
| Breath / meditation | `wind`, `circle-dot` |
| Stomach / physiology | `activity`, `pulse` |
| License / certification | `badge-check`, `shield-check` |
| Schedule / dates | `calendar-days` |
| Trainer / coach | `user-round` |
| Online format | `monitor` / Offline = `map-pin` |
| Crisis / urgent (admin tool) | `triangle-alert` |

**Logos & marks** ship at `assets/om-time-logo.png` (full mark, transparent) and `assets/om-time-mark.png` (glyph crop, no wordmark, for square / favicon contexts).

---

## Substitutions flagged for the client

- **Fonts.** No proprietary type was supplied. The system uses **Onest** (Google Fonts, OFL) as the primary face. If the client commissions a custom display face later, swap the family at `--om-font-sans` in `colors_and_type.css` — no other file needs to change. **Action requested:** confirm Onest is acceptable, or supply a preferred Cyrillic family.
- **Photography.** No real photography of the studio, trainers, or clients was supplied. The UI kit uses cream-and-indigo placeholder blocks labeled with the asset they represent. **Action requested:** trainer headshots (8 portraits, listed in the content deck), studio photography, optional 1–2 hero-scale lifestyle images.
- **Icons.** No proprietary icon set. Using **Lucide** from CDN. This is industry-standard and fits the line-only aesthetic, but if the client prefers a different family say so before component build-out scales.
- **Trainer videos.** The content deck references a video-testimonial playlist. Not built; the UI kit shows the slot with a placeholder cover.

---

## How to use this system

1. Drop `colors_and_type.css` into the consumer's HTML `<head>`.
2. Copy `assets/om-time-logo.png` (or the cropped `om-time-mark.png`) into the consumer's project — do **not** link cross-project.
3. Reference tokens directly in CSS (e.g. `background: var(--om-canvas);`, `color: var(--om-ink);`, `border-radius: var(--om-radius-lg);`).
4. For component scaffolds, lift from `ui_kits/marketing/` — the JSX files there are small, decorative-only React components designed to be copy-pasted and re-styled.
5. For voice and copy decisions, the canonical source is `content/om-time-texts.txt` — including the "Памятка по тону" section at the bottom, which is the client's own tone guide.

---

## Open questions for the client

- Are the **eight trainer names** in the content deck spelled exactly as they should appear on the site? (`Татьяна Васильевна Педас`, `Инна Рустамовна Натх`, `Илья Владиславович Брежнев`, `Наталья Генхвановна Дян`, `Наталья Филипповна Лоскутникова`, `Марина Александровна Енгерова`, `Василина Логачева`, `Даниель Константинович` — last name missing.)
- Should price displays use **₸** glyph or the literal "тенге"?
- For the **KZ + EN locale switcher** — is there budgeted translation work, or is it dormant for v1?
- For the **schedule block**, the deck says "подгружается из админки." Do we have the admin API spec, or is the schedule hardcoded for the launch?
