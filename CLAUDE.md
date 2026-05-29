# OM-Time — Animation System Guide

## Project snapshot

Single-page React 18 marketing site for OM-Time (psychotherapy weight-loss center, Almaty + online).
No build tools — everything loads via CDN (React, Babel standalone, Lucide).
Entry point: `ui_kits/marketing/index.html`
13 JSX components, mounted sequentially, exposed via `window.ComponentName`.
Design tokens live in `colors_and_type.css` (root of project).

---

## Animation mission

**Goal:** WOW-effect on scroll — bold, cinematic, yet calm enough for a therapy audience.
**Audience:** Mostly women 30–55, health-conscious, seeking trust. Kazakhstan + Russia. Large user base → performance is critical.
**Tone:** Not a nightclub, not a fintech dashboard. Think: confident wellness editorial. Smooth, deliberate, authoritative.
**Library:** GSAP 3 + ScrollTrigger plugin. No Three.js (too heavy).
**3D effects:** CSS 3D transforms only (`perspective`, `rotateX/Y`, `translateZ`). No WebGL.

---

## CDN additions — add to `index.html` `<head>` before React scripts

```html
<!-- GSAP core + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" crossorigin="anonymous"></script>
```

Add at the very end of `<body>`, after the App mount script:
```html
<script src="animations.js"></script>
```

---

## New file: `ui_kits/marketing/animations.js`

This is a plain JS file (no Babel needed). It owns ALL GSAP logic.
React components add `data-animate` and `data-anim-*` attributes to elements.
`animations.js` queries those attributes and wires up ScrollTrigger.

### Initialization pattern

React renders asynchronously. Wait for DOM to populate before initializing:

```js
(function () {
  'use strict';

  // Respect user preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 768;

  function waitForReact(cb, attempts) {
    attempts = attempts || 0;
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      cb();
    } else if (attempts < 60) {
      setTimeout(() => waitForReact(cb, attempts + 1), 100);
    }
  }

  waitForReact(function () {
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReduced) return initReducedMotion();
    initAnimations();
  });

  function initReducedMotion() {
    // Only fade — no transforms, no counters
    gsap.utils.toArray('[data-animate]').forEach(el => {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 0.4,
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });
  }

  function initAnimations() {
    initHeader();
    initHero();
    initTrustNumbers();
    initPainCards();
    initMethodologyLevels();
    initIntensiveDays();
    initComparisonTable();
    initSchedule();
    initSuitability();
    initTestimonials();
    initFAQ();
    initCtaBand();
  }
})();
```

---

## Section-by-section animation specs

### 1. Header (`Header.jsx`)

**Effect:** Glass morphism on scroll — transparent → frosted.

Add `data-animate="header"` to the root `<header>` element.

```js
function initHeader() {
  const header = document.querySelector('[data-animate="header"]');
  if (!header) return;

  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => {
      const progress = Math.min(self.progress * 10, 1);
      gsap.set(header, {
        backdropFilter: `blur(${progress * 16}px)`,
        boxShadow: `0 1px 0 rgba(27,24,64,${progress * 0.08})`,
        background: `rgba(251,248,242,${0.72 + progress * 0.23})`,
      });
    }
  });
}
```

---

### 2. Hero (`Hero.jsx`)

**Effects:**
- Text entrance: eyebrow → H1 words → sub → CTAs → trust row (stagger cascade)
- Coral card entrance: scale + rotation
- Coral card parallax: moves UP slower than scroll (depth illusion)
- Coral card float: CSS looping animation (add to `page.css`)

**Add to JSX:**
- `data-animate="hero-text"` on the left column `<div>`
- `data-animate="hero-card"` on the coral card `<div>`
- Add `id="hero-eyebrow"`, `id="hero-h1"`, `id="hero-sub"`, `id="hero-cta"`, `id="hero-trust"` to respective elements

**Float animation — add to `page.css`:**
```css
@keyframes om-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-12px) rotate(0.5deg); }
  66%       { transform: translateY(-6px) rotate(-0.3deg); }
}
.om-hero-card-float {
  animation: om-float 7s ease-in-out infinite;
}
```

Add class `om-hero-card-float` to the coral card element in `Hero.jsx`.

**GSAP init:**
```js
function initHero() {
  // Entrance: split H1 by words
  const h1 = document.getElementById('hero-h1');
  if (!h1) return;
  const words = h1.textContent.split(' ');
  h1.innerHTML = words.map(w => `<span class="om-word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${w}</span></span>`).join(' ');
  const wordEls = h1.querySelectorAll('.om-word > span');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('#hero-eyebrow', { y: 16, opacity: 0, duration: 0.5 })
    .from(wordEls, { y: '110%', opacity: 0, duration: 0.6, stagger: 0.06 }, '-=0.2')
    .from('#hero-sub', { y: 24, opacity: 0, duration: 0.5 }, '-=0.3')
    .from('#hero-cta > *', { y: 20, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.2')
    .from('#hero-trust > *', { y: 12, opacity: 0, duration: 0.35, stagger: 0.08 }, '-=0.2');

  // Card entrance (plays with text)
  tl.from('[data-animate="hero-card"]', {
    scale: 0.88,
    rotation: 4,
    opacity: 0,
    duration: 0.9,
    ease: 'power2.out',
  }, 0.15);

  // Parallax on scroll (disable on mobile)
  if (!isMobile()) {
    gsap.to('[data-animate="hero-card"]', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-animate="hero-text"]',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }
}
```

---

### 3. TrustNumbers (`TrustNumbers.jsx`)

**Effects:**
- Section title: slide from left
- Cards: cascade in bottom→up with stagger
- Numbers: count from 0 to final value on enter

**Data structure for counters:**
```
Card 1: 93 (suffix %)
Card 2: 15 (prefix "до ", suffix " см")   — animate the "до 15"
Card 3: 40 (prefix "до ", suffix " %")
Card 4: 100 (suffix %)
```

**Add to JSX:** `data-animate="trust-card"` on each card div, `data-counter-target="93"` (etc.) on the number `<div>`.

```js
function initTrustNumbers() {
  // Title
  gsap.from('[data-screen-label="Marketing site / Trust numbers"] h2', {
    x: -40, opacity: 0, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '[data-screen-label="Marketing site / Trust numbers"]', start: 'top 80%' }
  });

  // Cards stagger
  ScrollTrigger.batch('[data-animate="trust-card"]', {
    start: 'top 82%',
    onEnter: batch => gsap.from(batch, {
      y: 60, scale: 0.94, opacity: 0, duration: 0.7,
      stagger: 0.12, ease: 'power3.out', clearProps: 'all'
    })
  });

  // Counters
  document.querySelectorAll('[data-counter-target]').forEach(el => {
    const target = parseFloat(el.dataset.counterTarget);
    const suffix = el.dataset.counterSuffix || '';
    const prefix = el.dataset.counterPrefix || '';
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.querySelector('.om-counter-num').textContent =
              prefix + Math.round(obj.val) + suffix;
          }
        });
      }
    });
  });
}
```

**Required JSX change in `TrustNumbers.jsx`:** Wrap the numeric text in a `<span class="om-counter-num">` and add `data-counter-target`, `data-counter-suffix`, `data-animate="trust-card"` attributes. Leave the `<span style={trustNumStyles.unit}>` as-is (outside the counter span).

---

### 4. PainCards (`PainCards.jsx`)

**Effects:**
- Cards arrive from bottom in a wave, each slightly delayed
- On hover: card lifts + shadow deepens (pure CSS — no GSAP needed, better for performance)

**Add to JSX:** `data-animate="pain-card"` on each card, `data-anim-index="0"` through `"3"`.

**CSS hover (add to `page.css`):**
```css
[data-animate="pain-card"] {
  transition: transform 0.28s cubic-bezier(0, 0, 0.2, 1),
              box-shadow 0.28s cubic-bezier(0, 0, 0.2, 1);
}
[data-animate="pain-card"]:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 48px rgba(27, 24, 64, 0.13);
}
```

```js
function initPainCards() {
  ScrollTrigger.batch('[data-animate="pain-card"]', {
    start: 'top 84%',
    onEnter: batch => gsap.from(batch, {
      y: 80, scale: 0.93, opacity: 0, duration: 0.75,
      stagger: 0.13, ease: 'power3.out', clearProps: 'transform,opacity'
    })
  });
}
```

---

### 5. MethodologyLevels (`MethodologyLevels.jsx`)

**Effects:**
- Section eyebrow/title: fade + scale from 0.96 → 1
- Each level row: alternating entrance (even from left, odd from right)
- Level number badge: scale bounce (elastic ease)

**Add to JSX:** `data-animate="method-row"` on each level row, `data-anim-index="0/1/2"` on each.

```js
function initMethodologyLevels() {
  gsap.from('[data-animate="method-heading"]', {
    y: 30, opacity: 0, scale: 0.97, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '[data-animate="method-heading"]', start: 'top 82%' }
  });

  document.querySelectorAll('[data-animate="method-row"]').forEach((row, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    gsap.from(row, {
      x: dir * 60, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 82%' }
    });
    const badge = row.querySelector('[data-animate="method-badge"]');
    if (badge) {
      gsap.from(badge, {
        scale: 0, duration: 0.6, ease: 'back.out(1.8)', delay: 0.2,
        scrollTrigger: { trigger: row, start: 'top 82%' }
      });
    }
  });
}
```

---

### 6. IntensiveDays (`IntensiveDays.jsx`)

**Effects:**
- Dark indigo-deep band — cards glow in from black
- Cards stagger with upward entrance + subtle inner glow on arrival
- Day number: scale elastic bounce
- Gold callout footer: scale + glow flash

**Add to JSX:** `data-animate="day-card"` on each day card.

```js
function initIntensiveDays() {
  ScrollTrigger.batch('[data-animate="day-card"]', {
    start: 'top 84%',
    onEnter: batch => {
      gsap.from(batch, {
        y: 70, opacity: 0, scale: 0.92, duration: 0.8,
        stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity'
      });
      // Glow flash on each card
      batch.forEach((card, i) => {
        gsap.fromTo(card, {
          boxShadow: '0 0 0px rgba(242,193,46,0)'
        }, {
          boxShadow: '0 0 40px rgba(242,193,46,0.25)',
          duration: 0.5,
          delay: i * 0.14 + 0.4,
          yoyo: true, repeat: 1,
          ease: 'power2.inOut',
          clearProps: 'boxShadow'
        });
      });
    }
  });

  gsap.from('[data-animate="intensive-footer"]', {
    scale: 0.95, opacity: 0, duration: 0.6, ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '[data-animate="intensive-footer"]', start: 'top 85%' }
  });
}
```

---

### 7. ComparisonTable (`ComparisonTable.jsx`)

**Effects:**
- Column headers: slide in from top
- Table rows: stagger from top, one by one (creates reading rhythm)
- Checkmarks / X marks: scale from 0 with spring

**Add to JSX:** `data-animate="compare-row"` on each `<tr>` or row div, `data-animate="compare-check"` on check/X icons.

```js
function initComparisonTable() {
  gsap.from('[data-animate="compare-header"]', {
    y: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '[data-animate="compare-header"]', start: 'top 82%' }
  });

  ScrollTrigger.batch('[data-animate="compare-row"]', {
    start: 'top 88%',
    onEnter: batch => gsap.from(batch, {
      y: 24, opacity: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', clearProps: 'all'
    })
  });

  ScrollTrigger.batch('[data-animate="compare-check"]', {
    start: 'top 88%',
    onEnter: batch => gsap.from(batch, {
      scale: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(2)', clearProps: 'transform'
    })
  });
}
```

---

### 8. Schedule (`Schedule.jsx`)

**Effects:**
- Filter chips: fade + scale in from top
- Schedule items: slide in from right, stagger

**Add to JSX:** `data-animate="schedule-chip"` on filter chips, `data-animate="schedule-item"` on each item.

```js
function initSchedule() {
  gsap.from('[data-animate="schedule-chip"]', {
    y: -16, opacity: 0, scale: 0.9, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '[data-animate="schedule-chip"]', start: 'top 84%' }
  });

  ScrollTrigger.batch('[data-animate="schedule-item"]', {
    start: 'top 88%',
    onEnter: batch => gsap.from(batch, {
      x: 40, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power2.out', clearProps: 'all'
    })
  });
}
```

---

### 9. Suitability (`Suitability.jsx`)

**Effects:**
- Left column ("для кого"): slides in from left
- Right column ("не для кого"): slides in from right
- List items within each column: stagger in after column arrives

**Add to JSX:** `data-animate="suit-left"` and `data-animate="suit-right"` on columns, `data-animate="suit-item"` on each list item.

```js
function initSuitability() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '[data-animate="suit-left"]', start: 'top 78%' }
  });
  tl.from('[data-animate="suit-left"]', { x: -60, opacity: 0, duration: 0.7, ease: 'power2.out' })
    .from('[data-animate="suit-right"]', { x: 60, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0)
    .from('[data-animate="suit-item"]', {
      x: 20, opacity: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', clearProps: 'all'
    }, '-=0.3');
}
```

---

### 10. Testimonials (`Testimonials.jsx`)

**Effects:**
- Cards: tilt-and-land entrance (each card arrives at a slight angle, then settles to 0°)
- Stagger 0.15s between cards
- On hover: lift + quote mark scales (CSS)

**Add to JSX:** `data-animate="testimonial-card"` on each card, `data-anim-index="0/1/2"`.

```js
function initTestimonials() {
  const cards = gsap.utils.toArray('[data-animate="testimonial-card"]');
  const tilts = [3, -2, 2.5]; // degrees per card

  cards.forEach((card, i) => {
    gsap.from(card, {
      y: 60,
      rotation: tilts[i],
      scale: 0.93,
      opacity: 0,
      duration: 0.85,
      delay: i * 0.15,
      ease: 'power3.out',
      clearProps: 'rotation,scale',
      scrollTrigger: { trigger: card, start: 'top 84%' }
    });
  });
}
```

**CSS hover (add to `page.css`):**
```css
[data-animate="testimonial-card"] {
  transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0, 0, 0.2, 1);
}
[data-animate="testimonial-card"]:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 56px rgba(27, 24, 64, 0.12);
}
```

---

### 11. FAQ (`FAQ.jsx`)

**Effects:**
- Items stagger in on enter
- Accordion open/close: GSAP height animation (replaces React CSS toggle)

**Add to JSX:** `data-animate="faq-item"` on each item, `data-animate="faq-content"` on the collapsible content div.

For accordion, replace the React height toggle with a `gsap.to(content, {height: 'auto'})` pattern:
```js
// Call from FAQ click handler exposed via window
window.omAnimateFaqOpen = function (contentEl, isOpen) {
  if (isOpen) {
    gsap.set(contentEl, { height: 'auto', opacity: 1 });
    gsap.from(contentEl, { height: 0, opacity: 0, duration: 0.38, ease: 'power2.out' });
  } else {
    gsap.to(contentEl, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
  }
};
```

Items entrance:
```js
function initFAQ() {
  ScrollTrigger.batch('[data-animate="faq-item"]', {
    start: 'top 86%',
    onEnter: batch => gsap.from(batch, {
      y: 32, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power2.out', clearProps: 'all'
    })
  });
}
```

---

### 12. CtaBand (`CtaBand.jsx`)

**Effects:**
- Subtle CSS gradient pulse on the background (add keyframe to `page.css`)
- Text + button: fade + scale in

**Add to JSX:** `data-animate="cta-band"` on root element, `data-animate="cta-content"` on inner content.

**CSS (add to `page.css`):**
```css
@keyframes om-cta-pulse {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
[data-animate="cta-band"] {
  background-size: 200% 200%;
  animation: om-cta-pulse 8s ease-in-out infinite;
}
```

```js
function initCtaBand() {
  gsap.from('[data-animate="cta-content"] > *', {
    y: 28, opacity: 0, scale: 0.97, duration: 0.6, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '[data-animate="cta-band"]', start: 'top 80%' }
  });
}
```

---

## Performance rules

These are non-negotiable given the large user base:

1. **Only animate `transform` and `opacity`** — GPU-accelerated, no layout recalculations. Never animate `width`, `height`, `margin`, `padding`, `top`, `left` directly in GSAP (exception: FAQ accordion height via GSAP's height animation is acceptable).

2. **Use `ScrollTrigger.batch()`** for card grids (PainCards, TrustNumbers, Testimonials). Never create one ScrollTrigger per card — this creates O(n) scroll listeners.

3. **`clearProps`** — always pass `clearProps: 'transform,opacity'` after entrance animations so inline styles don't interfere with CSS hover effects.

4. **`once: true`** on counters and one-shot entrance effects — don't re-animate on scroll-back.

5. **`force3D: true`** is GSAP default — keep it. Do NOT set it to false.

6. **No parallax on mobile** (`window.innerWidth < 768`). Scroll events + layout cost too much on low-end Android.

7. **`prefers-reduced-motion`** — always check at init and fall back to simple opacity fade only.

8. **Load GSAP from `cdnjs.cloudflare.com`** (not unpkg) — it has better global CDN coverage in Central Asia.

9. **Don't animate all 60 elements at page load** — use ScrollTrigger `start: 'top 85%'` so animations only init when near viewport.

10. **`ScrollTrigger.refresh()`** — call once after all animations are registered, and again if the page height changes (e.g., after FAQ open).

---

## Mobile behavior (`width < 768px`)

| Feature | Desktop | Mobile |
|---|---|---|
| Hero card parallax | ✓ | ✗ |
| Hero text word-split | ✓ | Simple fade |
| Card stagger cascade | ✓ | ✓ (reduced stagger 0.06s) |
| Tilt entrance (Testimonials) | ✓ | ✗ (y-only) |
| Counter animation | ✓ | ✓ |
| Hover lifts | CSS | CSS (touch devices: no :hover) |
| Alternating row entrance | ✓ | ✗ (y-only fade) |
| Float animation on Hero card | ✓ | ✗ (paused via CSS media query) |

**Disable float on mobile in `page.css`:**
```css
@media (max-width: 767px) {
  .om-hero-card-float { animation: none; }
}
```

---

## Brand motion principles

These override any "cool" animation impulse:

- **Ease**: Always `power2.out` or `power3.out` for entrances. Never `elastic` or `bounce` on text or large layout elements (only OK on small badges/icons).
- **Duration**: Entrances 0.5–0.85s. Micro-interactions (hover, accordion) 0.28–0.4s. Counters 1.6–2s.
- **Stagger max**: 0.15s between sibling items. More than 0.2s feels slow and cheap.
- **Overshoot**: `back.out(1.4–1.8)` only on small interactive elements (chips, badges, checkmarks). Never on cards or text.
- **No looping animations** except: Hero card float (7s, very subtle), CtaBand gradient pulse (8s). Everything else is one-shot.
- **Color changes**: Never animate brand colors (coral, gold, indigo) as part of scroll entrances — they define brand identity, not state.

---

## Implementation order (priority)

1. **Add CDN scripts to `index.html`** and create stub `animations.js` with `waitForReact()` + `gsap.registerPlugin(ScrollTrigger)` — verify GSAP loads without errors.
2. **Hero** — biggest visual impact, first thing users see.
3. **TrustNumbers** — counters are the second biggest WOW moment.
4. **PainCards + Testimonials** — card cascades, quick wins.
5. **Header glass effect** — subtle but persistent across the whole session.
6. **MethodologyLevels + IntensiveDays** — alternating entrances + glow.
7. **FAQ accordion** — replaces React toggle with GSAP spring.
8. **ComparisonTable + Schedule + Suitability** — utilitarian sections, stagger only.
9. **CtaBand + Footer** — finishing touches.

---

## How to add `data-animate` attributes in JSX

Since components use inline `style={{}}` objects, add `data-*` props alongside them:

```jsx
// Before
<div style={heroStyles.card}>

// After
<div style={heroStyles.card} data-animate="hero-card">
```

For counters in `TrustNumbers.jsx`, the number div needs a wrapper structure:
```jsx
// Before
<div style={trustNumStyles.num}>93%</div>

// After
<div style={trustNumStyles.num} data-animate="trust-card" data-counter-target="93" data-counter-suffix="%">
  <span className="om-counter-num">93%</span>
</div>
```

---

## Attribute convention

| Attribute | Value examples | Used for |
|---|---|---|
| `data-animate` | `hero-card`, `trust-card`, `pain-card` | ScrollTrigger targeting |
| `data-counter-target` | `"93"`, `"100"`, `"40"` | Number to count to |
| `data-counter-suffix` | `"%"`, `" см"` | Appended after number |
| `data-counter-prefix` | `"до "` | Prepended before number |
| `data-anim-index` | `"0"`, `"1"`, `"2"` | Per-item tilt/offset values |

---

## File map

```
project/
├── CLAUDE.md                          ← this file
├── colors_and_type.css                ← design tokens (DO NOT edit motion tokens)
└── ui_kits/marketing/
    ├── index.html                     ← add GSAP CDN scripts here
    ├── page.css                       ← add hover CSS + @keyframes here
    ├── animations.js                  ← CREATE THIS FILE (all GSAP logic)
    ├── Header.jsx                     ← add data-animate="header"
    ├── Hero.jsx                       ← add data-animate attrs + class om-hero-card-float
    ├── TrustNumbers.jsx               ← add data-counter-* attrs + om-counter-num spans
    ├── PainCards.jsx                  ← add data-animate="pain-card"
    ├── MethodologyLevels.jsx          ← add data-animate="method-row/badge/heading"
    ├── IntensiveDays.jsx              ← add data-animate="day-card/intensive-footer"
    ├── ComparisonTable.jsx            ← add data-animate="compare-row/check/header"
    ├── Schedule.jsx                   ← add data-animate="schedule-chip/item"
    ├── Suitability.jsx                ← add data-animate="suit-left/right/item"
    ├── Testimonials.jsx               ← add data-animate="testimonial-card" + data-anim-index
    ├── FAQ.jsx                        ← add data-animate="faq-item/content" + call window.omAnimateFaqOpen
    └── CtaBand.jsx                    ← add data-animate="cta-band/content"
```
