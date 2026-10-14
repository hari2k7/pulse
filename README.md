# STRANGE — A Tech Fest Beyond Reality

> An atmospheric, high-performance web platform for **STRANGE**, the premier collegiate technology and multiverse innovation festival.

---

## 🌌 Overview & Design Rationale

**STRANGE** departs completely from conventional, flat corporate tech fest websites. Designed around a mystical, cosmic multiverse motif, the interface channels dimensional gateways, ancient runes, rotating concentric spell rings, and temporal convergence (inspired by mystic dimensions and the Eye of Agamotto).

### Core Aesthetic Pillars
- **Atmospheric Palette**: Deep dimensional space with Midnight (`#07060D`), Dark Navy (`#0D1020`), and Void Violet (`#1A1030`).
- **Mystic Accents**: Fiery Portal Orange (`#FF7A1A`) and Sanctum Gold (`#F5B642`) for CTAs, active states, and spell rings.
- **Dimensional Classification**:
  - **Electric Blue (`#3BA3FF`)**: Technical & Competitive Coding
  - **Portal Orange (`#FF7A1A`)**: Hackathons & Flagship Challenges
  - **Magic Green (`#3DDC97`)**: Workshops & Hands-on Laboratories
  - **Mystic Violet (`#A66BFF`)**: Creative, Gaming & Non-Technical Realms
  - **Cloak Crimson (`#C8102E`)**: Cloak of Levitation motif (used strictly in hero silhouette, section divider sweep, card hover sweep, and view transitions).
- **Typography**: Self-hosted **Cinzel** (Google Fonts / `@fontsource/cinzel`) for engraved display headings paired with high-contrast, modern UI sans.

---

## ⚡ Performance, Resilience & Accessibility

1. **Instant First Paint & LCP**:
   - Hero `h1`, tagline, and navigation are real HTML text rendered immediately without JS dependencies.
   - Sling Ring portal art is pure inline SVG + CSS conic/radial gradients.
   - Canvas particles start strictly after first paint via `requestIdleCallback`, automatically pausing when offscreen or when the browser tab is hidden.
2. **Zero Layout Shift (CLS = 0)**:
   - Fixed 3:2 and 16:9 aspect ratios with explicit width/height attributes on all media.
   - Defensive skeletons matching exact layout geometries.
3. **Accessibility (WCAG AA Compliance)**:
   - Accessible skip link (`#main`).
   - One `<h1>` per page with semantic heading hierarchy (`h1` → `h2` → `h3`).
   - High text contrast exceeding WCAG AA minimums (verified on dark backgrounds with text scrims).
   - Visible `:focus-visible` ring on every interactive element.
   - Full keyboard navigation and screen-reader support (`aria-live="polite"`, `aria-expanded`, `aria-modal`).
   - Full support for `prefers-reduced-motion` (instant display, disabled canvas particles, disabled GSAP animations).
4. **Code-Split Chunks**:
   - Dynamic `import()` for GSAP + ScrollTrigger (zero overhead on initial page load).
   - Lazy-loaded routes: `/events`, `/events/:id`, `/schedule`, `/styleguide`.
   - Lazy-loaded `StrangeCursor` (only active for `(hover: hover) and (pointer: fine)` without reduced motion).

---

## 🛠️ Configuration Guide (`src/config/festival.ts`)

All overarching festival metadata is centralized in `src/config/festival.ts`.

### Strict Honesty Rule
**No invented data**: If any field in `FESTIVAL_CONFIG` is unset or undefined, its corresponding UI element or section is **strictly hidden**, never fabricated or faked.

```typescript
export interface FestivalConfig {
  festivalName?: string;
  tagline?: string;
  startDate?: string;           // ISO 8601 with +05:30 offset, e.g. '2026-11-13T09:00:00+05:30'
  endDate?: string;             // ISO 8601 with +05:30 offset
  venue?: string;               // Physical venue / campus
  collegeName?: string;         // Organizing college / university
  organizers?: string[];        // Lead organizers or committees
  sponsors?: SponsorItem[];     // { name, logoUrl, href?, tier }
  socials?: SocialLink[];       // { platform, url }
  contactEmail?: string;        // Official communication conduit
  expectedParticipants?: number;// Stated participant benchmark
  participatingColleges?: number;// Stated institutional benchmark
}
```

### Fields to Fill In Before Production Launch:
- [ ] `startDate`: Set the exact ISO date/time for festival opening (e.g. `'2026-11-13T09:00:00+05:30'`).
- [ ] `endDate`: Festival closing ceremony date/time.
- [ ] `venue`: Official auditorium / campus hall address.
- [ ] `collegeName`: Host institution name.
- [ ] `organizers`: Lead faculty and student coordinators.
- [ ] `sponsors`: Multiverse partner names, logos, and links (sponsor marquee only renders if this list is populated).
- [ ] `socials`: Instagram, Twitter/X, LinkedIn, Discord conduits.
- [ ] `contactEmail`: Official support/inquiry email address.

---

## 📡 Live API Integration & Simulation Modes

Event data is dynamically fetched from the live API:
`https://render72.pages.dev/api/test/events`

### Fault Simulation Query Parameters (`?sim=`)
The application features resilient error handling, exponential backoff, and local storage fallback. You can verify resilience states using URL query parameters:
- `/?sim=timeout`: Simulates network timeouts. Falls back to cached data with an amber "Showing saved data" notice and Retry button, or displays `ErrorState` if empty.
- `/?sim=500`: Simulates server failure (retried up to 2 times).
- `/?sim=404`: Simulates endpoint not found.
- `/?sim=empty`: Simulates an empty event schedule (`events: []`). Renders `EmptyState`.
- `/?sim=badjson`: Simulates malformed HTML/502 responses.

---

## 🎨 Asset Credits & Original Vector Art

All vector graphics in `src/components/strange/` were custom-crafted specifically for STRANGE:
- **`StrangeLogo.tsx`**: Original geometric wordmark and circular mystic sigil.
- **`SpellCircleRings.tsx`**: Layered concentric runic rings with SVG transform animations.
- **`DimensionalGlyphs.tsx`**: Custom SVG glyphs for Overview, Schedule, Prizes, Rules, FAQs, and Contacts.
- **`EyeOfAgamotto.tsx`**: Multiverse relic with rotating counter-direction glyph rings and glowing time stone core.
- **`SanctumSeal.tsx`**: Window of the Sanctum Sanctorum geometric seal.
- **`CloakSilhouette.tsx`**: Sweeping collar and drapery motif for dividers and backgrounds.
- *Notice: No copyrighted Marvel logos, character likenesses, or external screenshot media are used.*

---

## 🤖 AI Usage Disclosure

This platform was architected, redesigned, and tested in pair-programming collaboration with **Antigravity (Google DeepMind)**. Antigravity assisted in:
- System audit, architectural refactoring, and code review.
- Conversion of design tokens, CSS variables, and Tailwind theme.
- Responsive component engineering, accessibility compliance, and build validation.

---

## 🚀 Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run ESLint validation
npm run lint

# TypeScript verification
npx tsc --noEmit

# Production build
npm run build

# Preview production build locally
npm run preview
```
