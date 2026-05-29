---
name: om-time-design
description: Use this skill to generate well-branded interfaces and assets for OM-Time (Центр современных психотехнологий и психотерапии) — a licensed psychosomatic therapy and weight-coaching center in Almaty, Kazakhstan. Russian-first design system with calm editorial layout, warm cream canvas, golden / indigo / coral signature surfaces, Onest typeface, and a strict two-tone voice (clinical-evidence + human-warmth). Suitable for production code, marketing surfaces, slides, and throwaway prototypes.
user-invocable: true
---

# OM-Time Design Skill

Read the **README.md** in this skill folder first. It is the canonical reference for everything below — content fundamentals, visual foundations, iconography, and the open questions still pending with the client.

## What this skill knows

- **Brand** — OM-Time, a Russian-language psychotherapy + psychosomatic weight-coaching center. Logo: yellow swirl with red stones cradled by purple hands; deep-indigo "OM Time" wordmark. Stored at `assets/om-time-logo.png` and `assets/om-time-mark.png`.
- **Voice** — two parallel intonations, never mixed in one sentence: *evidence-base* (clinical numbers, source-cited) and *human-support* (conversational, acknowledges difficulty). Always `вы` lowercase. No emoji. No marketing platitudes. The full tone guide lives at the bottom of `content/om-time-texts.txt`.
- **Color** — palette derived from the logo: warm cream canvas (`#FBF8F2`), ink indigo (`#1B1840`), three signature pigments (gold `#F2C12E`, indigo `#2E2470`, coral `#C03A3B`). Defined in `colors_and_type.css` as CSS custom properties.
- **Type** — Onest variable sans for everything; PT Serif sparingly for editorial pull-quotes; JetBrains Mono for numeric tables. Display weight caps at 500 — emphasis comes from size + color, never bold.
- **Shape** — pill CTAs (`9999px`), 12–16px card radii, 4px spacing base, 96px section rhythm constant.
- **Components** — a working marketing kit at `ui_kits/marketing/` (Hero, TrustNumbers, PainCards, MethodologyLevels, IntensiveDays, ComparisonTable, Schedule, Suitability, Testimonials, FAQ, CtaBand, Footer).

## How to use this skill

1. **Always import `colors_and_type.css`** in any HTML you generate — every token (color, type, spacing, radius, shadow, motion) is defined there. Never hard-code hex values; reference tokens by name.
2. **Copy logo assets** from `assets/` into the consumer's project — do not link cross-project. The full mark is `om-time-logo.png`; the cropped glyph (no wordmark) is `om-time-mark.png`.
3. **Lift components from `ui_kits/marketing/`** rather than rewriting. The JSX files there are small and decorative-only — they're designed to be copy-pasted and re-styled in the consumer's project.
4. **Stay in Russian for all UI copy** unless the user explicitly requests KZ or EN. The content deck `content/om-time-texts.txt` is the source of truth for every page, modal, email, microcopy, and error string. Use it verbatim where possible — the copywriter already did the work.
5. **Respect the no-hover policy + no-emoji policy + no-gradient-hero policy** documented in `README.md`. These are not preferences; they were explicitly scoped out by the client during content production.
6. **Iconography is Lucide**, line-only, 1.5px stroke, monochrome. Load from CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`. The full concept-to-icon lexicon for OM-Time lives in the README's ICONOGRAPHY section.

## When invoked with no specific brief

Ask the user what they want to build or design. Useful clarifying questions for OM-Time work:

- Is this for the **marketing site**, the **client account** (личный кабинет), the **admin tool** (помощник по заявкам), or a **slide deck** for a talk?
- Is the audience **Russian, Kazakh, or English**? (Russian is default; the other two locales are documented in the content deck but not all UI strings are translated yet.)
- Is this a **brand surface** (where signature voltage cards are appropriate) or a **utility surface** (where calmer canvas-on-canvas should dominate)?
- Does the user want to follow the existing visual system strictly, or **explore variations** off the documented foundations?

Then act as an expert designer who outputs HTML artifacts or production code, depending on the need.

## Files in this skill

```
README.md                       — canonical reference (read this first)
colors_and_type.css             — all design tokens
SKILL.md                        — this file
assets/
  om-time-logo.png              — full mark + wordmark
  om-time-mark.png              — glyph only (no wordmark)
  om-time-favicon.png           — square 256×256 icon
content/
  om-time-texts.txt             — full Russian content deck + voice guide
preview/                        — specimen cards (logo, palettes, type, components)
ui_kits/marketing/              — homepage React kit
  README.md                     — component-by-component map
  index.html                    — entry point
  page.css                      — page-scope helpers
  *.jsx                         — one component per file
```

## Open items the user should know about

- **No proprietary fonts** were supplied — the system uses Onest from Google Fonts. If the client wants a custom face, swap at `--om-font-sans` in `colors_and_type.css`.
- **No real photography** was supplied — placeholder blocks stand in for trainer headshots and studio shots.
- **Locale switcher** is visual only — KZ and EN strings are not yet wired.
