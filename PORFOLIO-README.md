# SNS-NEST Frontend — Portfolio & Cinematic Transition

## Overview

This document captures the full scope of work completed on the SNS-NEST landing page's **Portfolio section** and the **cinematic camera pull-back transition** between the horizontal testimony gallery and the portfolio grid.

---

## Architecture

### Scroll Experience Flow (App.jsx timeline)

The main landing page scrolls through a `350vh` pinned section. GSAP ScrollTrigger drives a master timeline (`scrub: 1.2`). The flow is:

| Phase | Timeline Pos | Scroll approx. | Description |
|-------|-------------|----------------|-------------|
| 0–1 | `0.00–0.35` | ~87.5vh | Initial state — text scramble morphs, slogan visible |
| 2 | `0.35–0.65` | ~87.5vh | **Horizontal scroll** — track translates on x-axis, slogan follows in lockstep |
| 3 | `0.68` | ~7.5vh | **Slogan fade out** — opacity → 0, scale → 0.92 |
| 4 | `0.68–0.85` | ~50vh | **Camera pull-back** — track scales down anchored to last slide, all 5 slides become visible |
| 5 | `0.85–0.88` | ~10vh | **Hold composition** — gallery breathes, bg transitions to `#F0E8DC` |
| 6 | `0.88–0.95` | ~20vh | **Portfolio transition** — track blurs+fades out, PortfolioIntro slides up from bottom |

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/data/projects.js` | Shared project data — 15 projects with slugs, descriptions, features, gradients, grid spans |
| `frontend/src/pages/ProjectDetail.jsx` | Full detail page for each project — hero, about, features, gallery placeholders, related projects |
| `frontend/src/components/PortfolioIntro.jsx` | 5x5 mosaic portfolio grid with image placeholders, hover effects, click-to-navigate |

### Modified Files

| File | Changes |
|------|---------|
| `frontend/src/App.jsx` | Added PortfolioIntro import/render, full cinematic transition timeline (7 phases), background color interpolation to warm cream `#F0E8DC` |
| `frontend/src/components/TestimonyTrack.jsx` | Added `testimony-slide-last` class to last image slide (Slide 4) for camera anchor |
| `frontend/src/client/Router.jsx` | Added route `/portfolio/:slug` → `<ProjectDetail />` |

---

## PortfolioIntro Component Details

**File:** `frontend/src/components/PortfolioIntro.jsx`

### Layout
- 5-column CSS grid with `auto-rows-[minmax(70px,auto)]`
- 15 cards with varying col/row spans (2×2, 1×1, 2×1, 3×1, 5×1 for CTA)
- Image placeholder areas with camera icon (ready for real images)
- Each card shows: category, year, title, location, description

### Interactions
- Hover: darken overlay + soft glow (CSS transitions, 700ms)
- Click: navigates to `/portfolio/:slug` (React Router `useNavigate`)
- CTA card ("Browse Full Collection"): scrolls to top

### Animations
- MutationObserver watches parent GSAP timeline for opacity change
- When opacity > 0.15, triggers internal GSAP timeline:
  1. Title + subtitle fade up (0.9s)
  2. Cards stagger in from below (0.05s interval, 0.7s each)

---

## Project Detail Page

**File:** `frontend/src/pages/ProjectDetail.jsx`

- Route: `/portfolio/:slug`
- Loads project data from `data/projects.js` by slug
- Sections: Hero with gradient, About, Key Features (2-col grid), Image Gallery (4 placeholders), Related Projects (3 cards)
- Animations: hero fade-in, content stagger (GSAP)
- Navigation: fixed top bar with Back button + logo

---

## Camera Pull-Back Transition Details

### How it works (App.jsx lines 96–120)

1. **Anchor slide**: The last image slide (`testimony-slide-last`) in TestimonyTrack is the camera anchor
2. **Transform origin**: `gsap.set(track, { transformOrigin: '${lastSlideCenter}px center' })` — centers the zoom on the last slide in the track's local coordinate space
3. **Scale**: Desktop → `0.15`, Mobile → `0.18`
4. **X calculation**: 
   ```js
   x = (V - W * S) / 2 - C * (1 - S)
   ```
   Where V = viewport width, W = track scrollWidth, C = last slide center, S = target scale
5. **Easing**: `power2.inOut` (heavy, cinematic)
6. **Duration**: 0.17 timeline units (≈50vh scroll)

### Background Color Transition

`testimonyBgColor` in `App.jsx` (line 248–263):
- 0–0.35: `#656D4A` (sage)
- 0.35–0.68: Cycles through 5 earthy tones
- 0.68–0.85: Interpolates from `#7B5A3C` → `#F0E8DC` (warm cream)
- 0.85+: Holds at `#F0E8DC`

---

## Portfolio Data Structure

**File:** `frontend/src/data/projects.js`

Each project object:

```js
{
  id: Number,
  slug: String,          // URL-friendly, e.g. "serenity-residence"
  title: String,         // Project name
  category: String,      // Residential, Hospitality, etc.
  location: String,      // City
  year: String,          // "2024"
  description: String,   // Short description (card)
  fullDescription: String, // Long description (detail page)
  features: String[],    // Bullet points (detail page)
  gradient: String,      // Tailwind gradient classes for placeholder
  cols: Number,          // Grid column span (1–5)
  rows: Number,          // Grid row span (1–2)
  isCTA: Boolean         // True for the CTA card
}
```

---

## Styling System

- **Background portfolio section**: `bg-[#F5EFE6]` with soft radial ambient blurs
- **Zoom-out bg end color**: `#F0E8DC`
- **Card borders**: `border-[#1A1210]/8`
- **Card backgrounds**: `bg-white/40`
- **Typography**: `font-cormorant italic` for titles, `font-neuemontreal` for metadata
- **Text on dark images**: white with varying opacities (55–80%)
- **Grid gap**: `gap-1.5 sm:gap-2 lg:gap-2.5`

---

## Next Steps / TODO

- [ ] **Replace gradient placeholders** with actual project images in PortfolioIntro (swap `bg-gradient-to-br` div with `<img>` tag)
- [ ] **Replace gallery placeholders** in ProjectDetail page with real images
- [ ] **Add real project photos** for all 14 projects
- [ ] **Add image lightbox** for gallery images on detail page
- [ ] **Add "View Project" page transition** with exit animation
- [ ] **Refine responsive behavior** for the 5x5 grid on mobile (currently 5 cols at all widths — may want fewer cols on small screens)
- [ ] **Add GSAP ScrollTrigger** for section-based animations on the detail page
- [ ] **Add page transition animations** between home and detail page
- [ ] **Add metadata/SEO** for project detail pages
- [ ] **Add loading states** for images
- [ ] **Add error boundary** for missing project slugs

---

## Key Dependencies

- React 18
- react-router-dom v6.4+
- GSAP 3.12+ (ScrollTrigger)
- TailwindCSS 3+
- Lenis smooth scroll (@studio-freight/lenis)
