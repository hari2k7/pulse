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

## 🛡️ Reliability & Scalability Architecture

### 1. Error-Handling Strategy & Failure Modes

Every potential failure condition is handled with graceful, typed resilience. The application never crashes to a white screen, never renders undefined/null, and preserves user context.

| Failure Condition | What the User Sees | What Recovers It |
|---|---|---|
| **Network Failure / Offline** | Sticky top `OfflineBanner` ("Dimensional Conduit Severed: You are offline") + cached content displayed. | Auto-reconnect listener triggers an immediate, single background revalidation when connectivity is restored; manual "Retry" button. |
| **Request Timeout (> 8s)** | Clean `ErrorState` card with plain explanation ("Request timed out. The server took too long to respond.") or "Showing saved data" warning banner if cached data is present. | Debounced "Retry Connection" button; automatic retry with exponential backoff on retryable operations. |
| **HTTP 500 / 502 / 503 Server Error** | Transparent background retries (up to 2 attempts with exponential backoff and jitter). If still failing, shows cached events with amber warning or `ErrorState`. | Automatic jittered backoff; circuit breaker trips after 3 consecutive failures to protect upstream server. |
| **HTTP 429 (Rate Limit)** | Backoff handler inspects `Retry-After` header (capped at 5s) and retries up to 2 times. If exhausted, displays polite rate-limit error notice. | Wait duration indicated by `Retry-After`; circuit breaker cooldown. |
| **HTTP 503 with Retry-After** | Retried automatically according to `Retry-After` response header before displaying error. | Automatic backoff; manual retry button. |
| **Bad JSON / HTML Error Page** | Validated via `Content-Type: application/json` and schema parser. Dropped gracefully without throwing raw syntax errors. Shows typed `invalid` error. | Server recovery; cache fallback. |
| **Partial Malformed Event Items** | Tolerant validation drops items missing required fields (`id`, `name`) while preserving all valid events. | Valid events render normally; no disruption to users. |
| **Non-UUID or Invalid Event ID** | Immediate 404 `NotFound` state ("Event Not Found") rendered without dispatching a doomed network call. | Breadcrumb link back to `/events`. |
| **Circuit Breaker Tripped (3 failures)** | Immediate fallback to `localStorage` stale list with "Showing saved data" banner, or immediate typed `circuit_open` error without waiting for timeouts. | 15-second cooldown window; resets automatically on first successful API response. |
| **Optional Section Crash** | Handled by `SectionErrorBoundary` (hero effects, prize pool, countdown, cursor, back-to-top). Crashed section renders `null` with 0 console spam in production. | Remaining 95% of the page continues functioning without interruption. |
| **Route / Page Crash** | Handled by `RouteErrorBoundary` inside `<Layout>`. Shows Doctor Strange themed error card with retry button and link to `/events`. | Navbar, navigation drawer, and theme shell remain fully functional. |

---

### 2. Testing Failure Modes in Chrome DevTools & URL Simulations

Every failure scenario can be verified and demonstrated on demand:

#### Chrome DevTools Testing Guide:
1. **Offline Mode**:
   - Open DevTools (`F12`) → **Network** tab → click the throttling dropdown (currently "No throttling") → select **Offline**.
   - Reload or navigate: Observe the amber `OfflineBanner` at the top, instant rendering of cached events from `localStorage`, and zero crashes.
   - Switch back to "No throttling": Observe automatic reconnect banner dismissal and single revalidation.
2. **Slow 3G**:
   - In **Network** tab, select **Slow 3G**.
   - Observe defensive skeleton placeholders preserving exact geometry (0 CLS), low-end effects budget activation, and 8s timeout controller guard.
3. **API Request Blocking**:
   - DevTools → **Network** tab → right-click any request to `render72.pages.dev` → select **Block request domain** (or **Network request blocking** panel → add `*render72.pages.dev*`).
   - Cold cache: Observe friendly `ErrorState` with retry button.
   - Warm cache: Observe instant zero-latency paint with "Showing saved data (offline mode)" banner.

#### URL Simulation Flags (`?sim=`):
Add `?sim=` to any URL (e.g. `http://localhost:5173/events?sim=500`):
- `?sim=timeout`: Simulates an 8-second internal timeout abort.
- `?sim=500`: Simulates an HTTP 500 Internal Server Error (retries twice with jitter).
- `?sim=404`: Simulates an HTTP 404 Not Found response.
- `?sim=empty`: Simulates an empty schedule (`{ events: [] }`) rendering `EmptyState`.
- `?sim=badjson`: Simulates an invalid/corrupted JSON payload.
- `?sim=429`: Simulates an HTTP 429 Too Many Requests response.
- `?sim=503-with-retry-after`: Simulates an HTTP 503 response with `Retry-After: 2`.
- `?sim=slow`: Simulates a 5-second network delay before returning valid data.
- `?sim=partial`: Simulates a payload with 2 valid events and 2 malformed entries (valid events are preserved).
- `?sim=html`: Simulates an HTML response (e.g. Cloudflare error page) with `Content-Type: text/html`.
- `?sim=offline`: Simulates navigator offline state.

---

### 3. Request Budget Audit

| Route | Cold Cache (Initial + Background) | Warm Cache (Repeat View) | Background Requests Description |
|---|---|---|---|
| `/` (Home) | 1 initial + 27 background = **28 requests** | **0 requests** (or 1 if stale > 5m) | 1 `GET /api/test/events` for event list; `usePrizePool` background idle fetches 27 `ACTIVE` event details (concurrency 3). Warm cache uses 12h persisted pool in `localStorage`. |
| `/events` | 1 initial + 0 background = **1 request** | **0 requests** | 1 `GET /api/test/events` for list. Hover prefetch: 1 per hovered card (max 1 in-flight, skipped on saveData/coarse pointer). |
| `/events/:id` | 1 detail + 1 related = **2 requests** | **0 requests** | 1 `GET /api/test/events/:id`; 1 `GET /api/test/events` for "More in {theme}" (idle deferred). Warm cache served from memory/TanStack cache. |
| `/favorites` | 1 initial + 0 background = **1 request** | **0 requests** | 1 `GET /api/test/events` to resolve bookmarked IDs. Hover prefetch: 1 per hovered card. |

---

### 4. Multi-Tier Caching Architecture

1. **Browser Memory & TanStack Query**:
   - Query client configured with `refetchOnWindowFocus: false`, `refetchOnReconnect: true`.
   - Event detail queries have `staleTime: 30 * 60 * 1000` (30 minutes) and `gcTime: 60 * 60 * 1000` (60 minutes).
   - Zero polling loops or unprompted background refetches.
2. **LocalStorage Stale-While-Revalidate (SWR)**:
   - `strange_events_cache`: Stores `{ events, timestamp }` with 24-hour max age. Loaded as `initialData` for instant zero-latency repeat visits.
   - `strange:prize-pool`: Stores aggregate prize total with 12-hour max age, eliminating detail fetches for festival stats.
   - `strange_favorites`: Synchronizes bookmarked event IDs across browser tabs via `storage` event listeners.
3. **Edge CDN & HTTP Cache Headers (`public/_headers`)**:
   - `/assets/*`: `Cache-Control: public, max-age=31536000, immutable` (fingerprinted JS/CSS chunks cached at edge and browser for 1 year).
   - `/fonts/*`: `Cache-Control: public, max-age=31536000, immutable` (self-hosted WOFF2 fonts cached 1 year).
   - `/index.html`: `Cache-Control: public, max-age=0, must-revalidate, no-cache` (ensures users always receive latest app hashes).

---

### 5. High-Scale Concurrency Rationale (5,000 – 10,000 Users/Day)

How STRANGE easily handles 10k daily users without exceeding rate limits or exhausting backend resources:
1. **Edge-Rendered Static Hosting**: All application code (HTML, JS, CSS, fonts, SVG) is served directly from edge CDNs (Cloudflare Pages / Vercel Edge). The origin server handles 0 document renders.
2. **Single API Query per User Session**: Because the API returns all 30 events in one `GET /api/test/events` call (~25KB gzipped), the entire festival discovery experience (searching, filtering, sorting, category switching, timeline view, favorites) executes entirely on the client with **zero additional network roundtrips**.
3. **Aggressive Cache Offloading**: Repeat visits from return visitors make **0 API calls** on launch, serving instantly from localStorage SWR.
4. **Governed Background Requests**:
   - Prize pool calculation queues requests with a maximum concurrency of 3, only after window load + idle, only when `#festival-stats` is in view, and is cached for 12 hours.
   - Hover prefetching is constrained to at most 1 in-flight request, and is completely disabled on mobile devices, touch pointers, and `saveData` modes.
5. **Traffic Math**:
   - 10,000 daily users × ~1.5 list fetches = ~15,000 requests/day.
   - Even distributed over an 8-hour peak period, this equates to **~0.5 requests/second** upstream—well within free-tier and low-tier API quotas.

---

### 6. Known Boundaries & Limitations

1. **First-Time Cold Offline**: A user opening the website for the very first time with no internet connection cannot load the event list without network access (no pre-installed Service Worker database). Once visited, the site works offline seamlessly.
2. **Unvisited Event Details Offline**: Event detail pages that have not yet been viewed or hovered cannot display extended fields (e.g. detailed schedule tables, rules, coordinator emails) while offline.
3. **No Upstream Booking Engine**: The public API provides event data but does not include direct payment gateway or registration URLs. The UI directs attendees to on-campus festival registration desks.

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
