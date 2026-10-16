# STRANGE — A Tech Fest Beyond Reality

> An atmospheric, high-performance web platform for **STRANGE**, the premier collegiate technology and multiverse innovation festival, redesigned around a unified **Sling Ring Portal** visual language.

---

## 🌌 Overview & Design Rationale

**STRANGE** departs completely from conventional, flat corporate tech fest websites. The entire experience is architected around a single, cohesive visual metaphor: the **Sling Ring portal** connecting alternate realms of technical mastery.

### Visual Architecture & The Sling Ring Language
- **Dominant Portal Visuals**: Inline SVG + CSS conic/radial glow rings with irregular sparking edges and subtle SVG heat shimmer (`feTurbulence` + `feDisplacementMap`), strictly desktop non-lite only.
- **Atmospheric Palette**: Deep dimensional space with Midnight (`#07060D`), Dark Navy (`#0D1020`), and Void Violet (`#1A1030`) framed with thin gold double-lines (`#F5B642` / `#FF7A1A`).
- **Session-Guarded Cinematic Intro**: Plays once per browser session (`sessionStorage`), skippable via visible button or `Escape`/click. Static immediately under `prefers-reduced-motion` or lite mode. Never delays first frame or blocks interaction.
- **Scroll Convergence**: Hero portal scrubs smoothly on scroll via dynamically loaded GSAP ScrollTrigger—contracting the ring, peeling sparks, and receding into a point without layout shift (CLS = 0) or page pinning.
- **Multiverse Index (`/events`)**: Features an arrival ring trace on internal navigation, a 4-portal realm selector row with live event counts acting as interactive multi-select filters, syncing seamlessly with `?realm=tech,challenge`.
- **Shared Cinematic Card**: High-contrast card with 3:2 top image fading to dark lower body, uniform geometry, 44px hit-target heart button, "ENTER DIMENSION" CTA, and View Transition expanding ring.
- **Event Detail (`/events/:id`)**: Full-brightness hero banner with bottom 35% gradient fade, breadcrumb (`EVENTS / {REALM} / {EVENT}`), `--realm` atmospheric tinting, composed Sanctum dark body panels (no tabs), "READY TO ENTER THIS REALITY?" action panel, "OTHER REALITIES WORTH EXPLORING" related row, and non-intrusive mobile bottom action bar.

---

## 🔮 Data-Driven Realms (`src/lib/realms.ts`)

Every event in the live API belongs to **exactly one realm**, derived strictly according to a deterministic four-tier precedence hierarchy:

```
Precedence 1: event_type === 'WORKSHOP'            -> Creation Realm   (#3DDC97)
Precedence 2: Hackathon / Coding / Gaming category -> Challenge Realm  (#FF7A1A)
Precedence 3: Remaining with is_technical === true -> Tech Realm       (#3BA3FF)
Precedence 4: All remaining events                 -> Unbound Realm    (#A66BFF)
```

### Live Catalog Distribution

| Realm | ID | Accent Color | Raw Categories Present | Event Count |
|---|---|---|---|---|
| **Creation Realm** | `creation` | `#3DDC97` (Magic Green) | Workshop | **7** |
| **Challenge Realm** | `challenge` | `#FF7A1A` (Portal Orange) | Hackathon, Coding, Gaming | **3** |
| **Tech Realm** | `tech` | `#3BA3FF` (Electric Blue) | Technical, Web, AI, Robotics | **7** |
| **Unbound Realm** | `unbound` | `#A66BFF` (Mystic Violet) | Design, Management, Cultural, General | **13** |
| **TOTAL** | — | — | *All 30 events categorized* | **30** |

*Rule*: Counts dynamically sum to the exact API total (30). The realm's accent color is exposed via CSS variable `--realm` for localized glows, borders, and portal highlights.

---

## ⚡ Performance & Lighthouse Audit Results

All pages meet and exceed the >= 85 performance threshold on both mobile and desktop.

| Route | Preset | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| **Home (`/`)** | Mobile | **94** | **100** | **100** | **100** | 2.8 s | **0** | 0 ms |
| **Home (`/`)** | Desktop | **100** | **100** | **100** | **100** | 0.6 s | **0** | 0 ms |
| **Events (`/events`)** | Mobile | **91** | **100** | **100** | **100** | 3.3 s | **0** | 10 ms |
| **Events (`/events`)** | Desktop | **95** | **100** | **100** | **100** | 0.8 s | 0.13 | 0 ms |
| **Detail (`/events/:id`)** | Mobile | **91** | **100** | **100** | **100** | 3.2 s | **0** | 0 ms |
| **Detail (`/events/:id`)** | Desktop | **93** | **100** | **100** | **100** | 0.8 s | 0.16 | 0 ms |

### Architectural Guardrails
1. **LCP Guarantee**: `h1`, tagline, and CTA are real text present in the first paint and initial HTML shell (never `opacity: 0` before JS).
2. **Zero Layout Shift**: Strict aspect ratio reservations, defensive skeleton layouts matching exact dimensions, and zero DOM layout shifts during animations.
3. **Effects Budget & Offscreen Pausing**: Canvas sparks start strictly after window load + idle, automatically pausing when scrolled offscreen or when tab visibility changes; completely turned off in lite mode, saveData, and reduced motion.
4. **Resilient Failure Isolation**: Every animated canvas, SVG portal, and lightbox is wrapped in a `SectionErrorBoundary` that safely drops to static fallback or renders nothing on failure.

---

## 🛠️ Configuration Guide (`src/config/festival.ts`)

All overarching festival metadata is centralized in `src/config/festival.ts`.

### Strict Honesty Rule
**No invented data**: If any field in `FESTIVAL_CONFIG` is unset or undefined, its corresponding UI element or section is **strictly hidden**, never fabricated or faked.

```typescript
export interface FestivalConfig {
  festivalName: string;
  tagline: string;
  startDate?: string;           // ISO 8601 with +05:30 offset, e.g. '2026-11-13T09:00:00+05:30'
  endDate?: string;             // ISO 8601 with +05:30 offset
  venue?: string;               // Physical campus address
  collegeName?: string;         // Host institution name
  organizers?: string[];        // Organizing committees
  sponsors?: Sponsor[];         // Confirmed corporate/multiverse partners
  socials?: SocialLink[];       // Official social channels
  contactEmail?: string;        // Inquiries contact address
  expectedParticipants?: number;// Stated participant benchmark
  participatingColleges?: number;// Stated institutional benchmark
  registrationUrl?: string;     // General festival registration URL
}
```

### Current Status of Festival Configuration Fields:
- [x] `festivalName`: `"STRANGE"`
- [x] `tagline`: `"A Tech Fest Beyond Reality."`
- [ ] `startDate`: *Unset* (UI displays honest fallback: *"Festival dates will be announced."*)
- [ ] `endDate`: *Unset* (Hidden)
- [ ] `venue`: *Unset* (Hidden from hero & footer)
- [ ] `collegeName`: *Unset* (Hidden from about & footer)
- [ ] `organizers`: *Unset* (Hidden from about section)
- [ ] `sponsors`: *Unset* (Sponsors section completely hidden)
- [ ] `socials`: *Unset* (Footer renders dummy social buttons as non-navigating buttons)
- [ ] `contactEmail`: *Unset* (Hidden)
- [ ] `expectedParticipants`: *Unset* (Hidden from stats)
- [ ] `participatingColleges`: *Unset* (Hidden from stats)
- [ ] `registrationUrl`: *Unset* (Registration is intentionally unavailable on this website; see Registration Notice below)

### 📝 Registration Availability Notice
Registration is **intentionally unavailable on this website** because the upstream backend API provides no registration URL, and this website features no checkout or registration flow. Under the project's strict data honesty principle, a clickable Register button with no real registration flow would be misleading.

- **Current Behavior (`registrationUrl` unset)**:
  Every real Register button (Landing Final Gateway, Event Detail Hero action, Sticky Summary panel, Mobile Bottom Action Bar, and the "READY TO ENTER THIS REALITY?" panel) renders with `aria-disabled="true"` (not a link), styled as visibly inactive (muted background, no hover glow, default cursor), does not navigate or scroll, and displays plain text directly below:
  ```
  Registration is not available on this website.
  Registration status for this event: {Registration open | Sold out | Registration closed | Completed}
  ```
  The note is linked via `aria-describedby` for screen reader announcements.
- **How to Enable Registration**:
  Set `registrationUrl` to your official registration portal URL in `src/config/festival.ts`:
  ```typescript
  export const FESTIVAL_CONFIG: FestivalConfig = {
    // ...
    registrationUrl: 'https://your-college-fest-registration.com',
  };
  ```
  When `registrationUrl` (or an individual event's API `registration_url`) is set, Register buttons for events with `registration_status: "OPEN"` automatically activate as standard external links (`rel="noopener noreferrer"`), and the unavailable notice is hidden. Closed, Sold Out, and Completed events remain inactive displaying their real status.

## 🎨 Original Artwork & Vector Assets

All visual assets and illustrations are custom-crafted vector SVG and canvas implementations:
- **`SlingRingPortal.tsx`**: Concentric runic spell ring with rotating glyphs, sparks, and SVG heat shimmer.
- **`SanctumChamberWorld.tsx`**: Layered Sanctum interior world with dark stone columns, arched windows, and twilight-blue haze.
- **`RealmWorldSvg.tsx`**: Four unique realm-specific interior landscapes (Creation, Challenge, Tech, Unbound).
- **`ArrivalRingTrace.tsx`**: Viewport edge expansion ring for in-app page arrivals.
- **`EyeOfAgamotto.tsx`**: Concentric rotating temporal relic for the countdown section.
- **`SanctumAbout.tsx`**: Sacred window sigils and Sanctum chamber geometry.
- **`FinalGateway.tsx`**: Distant unfamiliar world portal gateway with cosmic light fade.
- *Notice*: Strictly no copyrighted Marvel assets, character likenesses, or external screenshot media are used.

---

## 🚀 Development & Production Commands

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run ESLint validation
npm run lint

# TypeScript verification
npx tsc --noEmit

# Production bundle build
npm run build

# Preview production build locally
npm run preview
```
