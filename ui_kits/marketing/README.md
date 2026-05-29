# OM-Time · Marketing UI Kit

High-fidelity recreation of the OM Time homepage scroll, built from the Russian content deck in `content/om-time-texts.txt`. Use this as the reference implementation for marketing surfaces.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Mounts every component as a single scrolling homepage. Open this to see the kit. |
| `page.css` | Page-scoped helpers — `.om-btn`, `.om-tag`, `.om-section`, container, eyebrow. Reads tokens from `colors_and_type.css`. |
| `Header.jsx` | Sticky top nav with brand, menu, locale switcher, log-in + primary CTA. |
| `Hero.jsx` | Homepage hero — calm white-canvas left column, full-bleed coral signature card with the "93%" headline number on the right. |
| `TrustNumbers.jsx` | Four clinical-data stat cards on canvas-soft band. The 4th tile flips to indigo to break the rhythm. |
| `PainCards.jsx` | Four "если что-то из этого про вас" cards, each with a Lucide line icon in a colored chip. |
| `MethodologyLevels.jsx` | Three-up "Three levels" block on a cream signature band, closed by a PT-Serif pull-quote. |
| `IntensiveDays.jsx` | Four-day program breakdown on the indigo-deep signature band, footed by a gold callout for the 2-month follow-up chat. |
| `ComparisonTable.jsx` | Side-by-side comparison of hypnosis vs. the methodology — the second column header uses the gold-soft surface to flag the brand answer. |
| `Schedule.jsx` | Filterable list of upcoming programs. Each row carries date / trainer / format / price / capacity warning. Filter chips are stateful. |
| `Suitability.jsx` | "Кому подходит / кому — нет" split block — cream + canvas-white cards with sage check and coral X lists. |
| `Testimonials.jsx` | Three story cards: avatar, name, age, starting weight, PT-Serif quote, result pills. |
| `FAQ.jsx` | Accordion of six FAQs; stateful, first item open by default. |
| `CtaBand.jsx` | Light-strong CTA strip near the footer. |
| `Footer.jsx` | Indigo-deep footer with five columns, social icons, license disclosure, and legal links. |

## How it fits together

`index.html` is React 18 + Babel-standalone for inline JSX. Every component file ends with `window.<Name> = <Component>` so the components are accessible to the page-level mount without ES modules. Order of `<script type="text/babel">` tags in the HTML matters — components must be declared before the App that consumes them.

Lucide icons are rendered by `lucide.createIcons()` after every React commit (called inside a `useEffect` with no dependency array). This is intentional for the kit — it keeps the example readable. A production version should switch to per-icon React components or inline SVG.

## Editing this kit

- **Token changes** live in `colors_and_type.css` at the project root. Don't override tokens locally — bring them up to the system.
- **Reusable styles** (button, tag, container, section) live in `page.css`. Component-local styles are kept inline in JSX `style={...}` so each file is portable.
- **Copy** comes verbatim from the content deck (`content/om-time-texts.txt`). When the copy changes there, update it here. Voice rules in the deck's "Памятка по тону" section are binding.

## Known gaps

- No real photography of trainers, studio, or clients. Avatars use single-letter chips on cream/lilac surfaces; the hero uses a coral card with a large 93% figure instead of a hero image.
- Locale switcher is visual only — RU/KZ/EN strings not wired.
- "Login" button doesn't open a flow; "Запись" buttons don't open a modal. These are placeholders.
- Schedule filter chips toggle state but don't actually filter — would need a real data layer.
