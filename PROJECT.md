# STRANGE: A Tech Fest Beyond Reality

> Read this file first in every session and follow the **Hard rules**. This spec is the FINAL source of truth.
> **Polish Pass Rules (Takes precedence over earlier entries)**:
> 1. EventCard: Heart button moved to the top of the card body (same row as the type line: type text left, heart right, above the title; at least 16px above CTA row; never shares a row with CTA; 48px hit area).
> 2. Events Page: Arrival animation completely removed (instant rendering).
> 3. AI-Looking Badges: Removed everywhere ("Dimensional Gateways", "The Sanctum Philosophy", "30 Available Coordinates" and similar pills). Event counts shown as plain sentence text in sublines.
> 4. Stats Row Restored: Events and Prize Pool animated counters restored immediately AFTER Eye of Agamotto and before About, with the red cloak strip divider below.
> 5. Hero Scroll: Hero text (h1, tagline, description) and "Explore Events" button travel INTO the portal as user scrolls, scaling down and collapsing to a point.
> 6. Back-to-Top: Realistic original inline SVG Cloak of Levitation with flowing folds, shading, standing collar, gold embroidered trim, and 4 states.
> 7. Realism: Multi-layer depth, dust motes, irregular ring thickness, heat shimmer, subtle noise, offscreen pause, reduced motion / lite support.
> 8. Scroll Animations: GSAP ScrollTrigger site-wide reveals, batching on /events, panel reveals on detail, thin gold navbar scroll progress line.
>
> **Revision Pass Rules (THIS PROMPT WINS — supersedes any prior entry)**:
> R1. HERO STICKY WRAPPER: CSS sticky (position:sticky; top:0; height:100svh), tall wrapper ~260vh desktop / ~180vh mobile, NO GSAP pin, no pin-spacer. ScrollTrigger scrubs one timeline (transform/opacity only, reversible): 0-15% hold; 15-45% text+button scale into portal; 45-80% ring contracts + sparks peel + chamber recedes + iris vignette; 80-100% ring collapses to bright point, shockwave ring expands/fades, point flares and disappears. pointer-events:none + tabindex:-1 on copy when scale <50%. Reduced motion/lite/no-JS: no sticky, normal height, scrolls away normally.
> R2. PORTAL REALISM: Irregular ring (3-4 stacked paths with radius wobble), hot white-gold inner to orange/ember outer, soft bloom gradients (no big blur filters), continuous wobble. 24-40 SVG sparks (or one capped canvas, desktop non-lite only), varied size/speed/life, fading trails, gravity. Heat shimmer (feTurbulence+feDisplacementMap) ring-only, desktop non-lite; drop if Performance <90. World inside: layered chamber with slow parallax, amber light shafts, vignette, noise tile, max 20 dust motes desktop non-lite. Mobile/lite/saveData/reduced-motion: static art, ≤10 sparks, no shimmer.
> R3. SECTION ORDER: Hero (sticky) → Eye of Agamotto → Stats row + red cloak divider directly below → "EVERY REALITY HAS AN EVENT." realm portals (ChamberPreview) → Featured ("ARTIFACTS OF THIS REALITY") → About → Final Gateway → Footer. Update section ids and scroll targets. Red divider present and visible directly below stats row, sweeps in on scroll ~700ms; padding max 64px mobile / 96px desktop between sections.
> R4. FAVORITES CARDS: Create one shared EventGrid component (same container, grid columns 1/2/3/4, gap, items-stretch). Use on /events AND /favorites. Remove compact variant and favorites-specific sizing. Single saved card must not stretch wider than one grid column. Same skeleton.
> R5. CARD HOVER/CLICK: Desktop (hover:hover, pointer:fine, not reduced-motion, not lite). Hover: perspective tilt max 5deg pointer-tracking (rAF, shared one loop), moving specular gradient, contact shadow shifts. Cloak peels from entry-point corner with 2-3 fold highlights, spring-like easing (e.g. cubic-bezier(.2,.9,.3,1.2)), reveals dark gold lining, closes on leave. Image scales and shifts opposite to pointer; gold corners light up; title/tags sit forward (translateZ). Click View Transition (≤600ms): 0-150ms press+spark flare; 150-450ms ring traces image outline and grows toward detail hero; 450-600ms dissolves into destination. Never delay nav >600ms; any key/click skips; direct URLs/back/forward/unsupported: instant; reduced-motion/lite/touch: instant simple lift.
> R6. VERIFY: Hero, section order, favorites card size, card hover/click, keyboard-only, no horizontal scroll, no console errors, ?sim= intact, Lighthouse before vs after. If Performance <90: remove heat shimmer → dust motes → noise tile → mouse parallax → card tilt → simplify sparks; re-measure.
>
> **Revision Pass 2 Rules (THIS PROMPT WINS over all prior entries)**:
> P1. HERO TEXT VARIABLE TYPOGRAPHY: @fontsource-variable/cinzel wght 400-900, self-hosted latin subset, preload. After load+idle: split h1 into per-letter <span class="ch" aria-hidden="true"> with aria-label="STRANGE" on h1. On (hover:hover)+(pointer:fine)+not-reduced-motion+not-lite: per-letter distance→font-weight 400-900 (radius 220px, smooth falloff, lerped rAF). Lock each letter width to max-weight advance to prevent CLS (display:inline-block, fixed width, text-align:center). Idle eases back to 700. Remove old letters-lift-and-tilt. Static 700 fallback.
> P2. SCROLL CHOREOGRAPHY REBUILD: one master GSAP timeline scrub:0.5. 0-12% hold; 10-40% camera dolly+copy arcs into portal (parallax layers far/mid/near 1.04/1.12/1.3, h1+tagline+desc+button shrink+arc+tilt+late-fade); 35-75% ring collapses+iris+sparks peel tangentially+embers; 72-92% singularity (white-gold point, one shockwave ring); 90-100% exit+next section rises. Reversible. Pause shimmer/dust/parallax/typo during scrub. Desktop 32 sparks, mobile/lite 10.
> P3. LARGER CARDS ON DESKTOP/TABLET: EventGrid grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) from 768px, max-width 1440px, gap 24-28px. Below 640px: single-col unchanged. Card md+: title text-lg, body larger, button 48px. Update skeletons.
> P4. LOAD MORE BUG FIX + AUTO-LOAD: Fix reset (filter/search/sort VALUES, not array identity); event.id key only; EventGrid tracks revealed ids in a ref internally, never re-hides existing cards; IntersectionObserver sentinel (rootMargin 400px) auto-loads next 12; "Show 12 more" fallback; aria-live polite. Reset to 12 only on filter/search/sort change. Same /favorites.
> P5. REALM DESCRIPTORS COMPLETE: ALL distinct raw categories joined with " · ", no ellipsis, text-balance, wraps freely, min-w-0, enough height for alignment.
> P6. LIGHTHOUSE 90+ MOBILE: fetchpriority high LCP, preconnect, preload font. Post-load+idle dynamic imports. Entry chunk <150KB gzip. srcset+sizes+lazy+decoding async+explicit w/h. content-visibility:auto below fold. Pause offscreen animations.
> P7. BACKEND ERROR HANDLING: Audit all; distinct UI per failure; error boundaries; image fallback; localStorage resilient; npm run check script; README Reliability section.
> P8. SCALABILITY: Hand-written sw.js (stale-while-revalidate assets/fonts, network-first+8s API, offline index.html). README Scalability section.
> P9. VERIFY: screenshots 375/768/1280/1920, failure tests, Lighthouse before/after table, files changed report.


## 1. Goal

An immersive, mystical tech fest website ("STRANGE — A Tech Fest Beyond Reality").
Judged on: Lighthouse (Performance, Accessibility, SEO), responsiveness (375 / 768 / 1280 px),
backend error handling, scalability readiness, design & creativity, features & UX.

- Individual participant. Up to 5 successful submissions. Latest is final by default.
- Deadline: **Friday 16 October 2026, 2:00 PM IST**.
- Deliverables: deployed URL, public GitHub repo, optional Figma link.

## 2. Stack

React 18 + TypeScript (strict) + Vite + React Router + Tailwind CSS.
TanStack Query is the application cache layer for robust query synchronization, prefetching, and state resilience.
GSAP + ScrollTrigger (dynamic import only). ESLint with `eslint-plugin-jsx-a11y`.
No other animation, 3D or carousel libraries. No backend, no database, no auth.
Deploy: Cloudflare Pages or Vercel (build `npm run build`, output `dist`, SPA rewrite).

## 3. Routes & Sling Ring Portal Architecture

| Route | Purpose |
|---|---|
| `/` | Landing: Sling Ring portal hero with skippable intro sequence, ScrollTrigger scrub contraction, Multiverse chamber preview (4 realm portals), Artifacts of this Reality (featured 6), Time is Converging (countdown scrub), Sanctum About, Final Gateway ("YOUR NEXT REALITY STARTS HERE") |
| `/events` | The Multiverse Index: Interactive realm portal selector row, archive controls (search, realm, date presets, status, mode, type, price, favorites), uniform grid with "ENTER DIMENSION" cards + timeline view, 12-card pagination |
| `/events/:id` | Detail (Composed Layout): 60vh hero with realm breadcrumb ("EVENTS / {REALM} / {EVENT}"), composed sections ("INSIDE THIS REALITY"), sticky summary & mobile action bar, "READY TO ENTER THIS REALITY?" panel, "OTHER REALITIES WORTH EXPLORING" related row |
| `/favorites` | Curated Saved Events: cross-tab synchronized favorites with uniform EventCard grid |
| `*` | Not found |

All main routes are code-split (`React.lazy` + `Suspense`).
There is NO `/schedule` page, route, or sitemap entry.

### 3b. Data-Driven Realms (`src/lib/realms.ts`)
Derived strictly from real API event data by precedence:
1. `event_type === 'WORKSHOP'` -> **Creation Realm** (Emerald Green `#3DDC97`)
2. Hackathon/competition categories -> **Challenge Realm** (Portal Orange `#FF7A1A`)
3. Remaining `is_technical === true` -> **Tech Realm** (Electric Blue `#3BA3FF`)
4. Remaining -> **Unbound Realm** (Amethyst Violet `#A66BFF`)

Realms expose `id`, `name`, descriptor line (derived from present categories), accent color, real event count, and `realmOf(event)`. Exposed via CSS variable `--realm` for atmospheric page tinting. Hidden if count is 0. Sum of counts strictly equals total API events.

## 4. Events API (public, no auth, JSON, CORS open)

Base URL: `https://render72.pages.dev`

- `GET /api/test/events` returns `{ "events": EventSummary[] }`. 30 items, no parameters,
  sorted by start date/time. Filter and sort client-side.
- `GET /api/test/events/{id}` returns `{ "event": Event }`, or 404 `{ "error": "not_found", "message": "Event not found." }`.

**Summary fields:** `id` (uuid), `name`, `blurb`, `cover_image_url` (1200x800), `cover_image_alt`,
`category` (free text), `tags[]`, `event_type` (`EVENT`|`WORKSHOP`), `event_mode` (`OFFLINE`|`ONLINE`),
`event_status` (`ACTIVE`|`COMPLETED`|`CLOSED`), `is_featured`, `is_technical`, `price` (INR integer, 0 = free),
`is_per_head` (true = per person, false = per team), `min_teamsize`, `max_teamsize`, `total_seats`,
`seats_filled`, `registration_status` (`OPEN`|`CLOSED`|`SOLD_OUT`), `registration_deadline`
(ISO 8601 with +05:30), `schedule_summary` `{ start_date, start_time, end_date, end_time }` (IST).

**Detail-only fields:** `description` (paragraphs separated by `\n\n`), `banner_image_url` (1920x1080),
`banner_image_alt`, `gallery_images[]`, `highlights[]`, `what_to_expect[]`, `eligibility[]`,
`prerequisites[]`, `rules[]`, `prizes[]`, `faqs[]`, `schedules[]`, `organizers[]`, `coordinators[]`.

**Nested shapes (verified on real event data; every field optional):**

```ts
type Schedule    = { event_date?: string; start_time?: string; end_time?: string; venue?: string }  // "2026-11-13", "09:00" (IST, no offset)
type Prize       = { rank?: number; title?: string; amount?: number; description?: string }          // amount in INR
type Faq         = { question?: string; answer?: string }
type Organizer   = { id?: string; name?: string; org_type?: string }                                  // e.g. "CLUB"
type Coordinator = { id?: string; name?: string; role?: string; contact?: string }                    // contact is email or phone
```

Detail rules from this data:
- `schedules` items have no end date. A multi-day event is several items (one per day). Venue exists only here.
- The API gives no registration URL. Do not build a fake register form. Register routes to `/events/:id` and anchors to the summary card displaying registration status and deadline.
- When `is_per_head` is false the seats are **team slots** (e.g. 24 teams). Say "team slots left" instead of "seats left".
  Say "Only N left" when 5 or fewer remain.
- `coordinators[].contact`: if it contains "@" render a `mailto:` link, if it is mostly digits render `tel:`, else plain text.
- `rules`, `highlights` etc. are arrays of strings and can be long. Render as lists.
- `description` paragraphs are separated by `\n\n`.
- Gallery images come as Pexels URLs with `w=1400` (no height). Render with a fixed aspect ratio and `object-cover`.
- `.ics`: convert IST (UTC+5:30) times to UTC and use `Z` timestamps so every calendar app agrees.

## 4b. Festival Configuration (`src/config/festival.ts`)

Festival metadata is configured in `src/config/festival.ts`:
- Optional fields: `festivalName`, `tagline`, `startDate` (ISO with +05:30), `endDate`, `venue`, `collegeName`, `organizers[]`, `sponsors[] {name, logoUrl, href, tier}`, `socials[]`, `contactEmail`, `expectedParticipants`, `participatingColleges`, `registrationUrl`.
- **Strict honesty rule**: Anything unset is HIDDEN, never faked. Clear TODO comments indicate user-configurable fields.
- When `registrationUrl` is set in `festival.ts`, general registration CTAs (like the Final Gateway) link out to it (`rel="noopener"`). When unset, they route to `/events?registration=OPEN` and state the live open count. Event-specific registration buttons link out ONLY if the event's API payload supplies a link, otherwise scrolling to the event summary panel.
- There is NO `signInUrl` field. Sign In button is a dummy non-navigational button.
- Countdown targets `festival.ts` `startDate`; if unset, falls back to the earliest upcoming ACTIVE event start from the API and labels it "Next event in". If neither exists, the countdown is hidden.
- Counters: Real event list length live from API. Prize pool is summed ONLY from events whose detail data is loaded/cached in TanStack Query; if unavailable, the counter is hidden. Participants and colleges come ONLY from `festival.ts`, else hidden.

## 5. Design & Tokens

Immersive mystical tech fest aesthetic inspired by Doctor Strange ("STRANGE — A Tech Fest Beyond Reality").
Original branding, spell-circle geometry, glowing Sling Ring portal accents, Sanctum Sanctorum motifs.
No Marvel logos, screenshots, or copyrighted character artwork. Tone: confident, plain, non-AI.
No gradient text, no glow on everything, no glassmorphism, no identical-rounded-card sameness, no pill/eyebrow badges with pulsing dots, no emojis anywhere, no decorative unicode symbols.

| Token | Value | Semantic Role |
|---|---|---|
| Midnight | `#07060D` | Deep cosmic void (base background) |
| Navy | `#0D1020` | Surface cards & panels |
| Violet-Dark | `#1A1030` | Elevated surfaces & overlays |
| Portal Orange | `#FF7A1A` | Sling ring fire, primary CTAs, Hackathons |
| Gold | `#F5B642` | Magic glow, accents, secondary highlights |
| Electric Blue | `#3BA3FF` | Technical dimension |
| Green | `#3DDC97` | Workshops dimension |
| Violet | `#A66BFF` | Non-technical dimension |
| Cloak Red | `#C8102E` | Cloak of Levitation motif (used sparingly) |
| Text Primary | `#F3EFE8` | High contrast body & titles (AA verified) |
| Text Muted | `#B8B3C7` | Subtle labels, secondary text (AA verified) |

- **Typography**:
  - Display: `Cinzel` (Google Fonts / `@fontsource/cinzel`, weights 400 & 700), self-hosted with metric-matched fallback for 0 CLS. Preload display font.
  - Body: `Inter` (weights 400 & 600), self-hosted with metric-matched fallback.
  - `font-display: swap` on all fonts. Max 2 weights each.
- **Original Inline SVG Assets**:
  - STRANGE logo (wordmark + circular sigil), spell circles, Eye of Agamotto, Sanctum seal, Cloak silhouette.
- **Cards**:
  - ALL CARDS THE SAME SIZE across Home, `/events`, and `/favorites`.
  - Single `<Link>` to `/events/:id` inside a relative wrapper, with `title` and `aria-label`.
  - Sibling heart toggle next to date row with 48px visual & hit area, 24px icon, and `stopPropagation`.
  - 3:2 image ratio, explicit width/height (600x400), lazy except LCP images.
  - Image has ONLY the slots-left pill top-right ("6 SLOTS LEFT", "TEAM SLOTS LEFT" when is_per_head is false, "ONLY 3 LEFT" at 5 or fewer, "SOLD OUT" when sold out, hidden when seat data is missing or event is completed).
  - Body order: 1) Type line (raw category or theme name) above title with Status tag; 2) Title with line-clamp-3 and reserved 3-line min-height; 3) Date row with 48px heart slot; 4) Action button; 5) Entry fee footer.
  - Footer bar pinned with `mt-auto`.
  - Cloak peel + rotating portal on hover and focus-visible (~500ms). Reverses smoothly on leave.
  - Completely static under `prefers-reduced-motion` and touch devices.
- **Status Badges**:
  - Plain, small squared tag (radius 4px, 1px border, no blur), compact padding, sentence case text, semibold 12px body font.
  - Natural muted tones with AA contrast on dark: open (soft green), sold out (muted brick red), closed/completed (grey).
  - No blinking dots, pulse, ping, glow, gradient, or animations on any status badge.

## 6. Global Shell

- **Navbar**:
  - 3-column grid layout: `grid-template-columns: 1fr auto 1fr`, left group justify-self start, logo in the exact center column, dummy Sign In pill justify-self end. Logo is mathematically centered within 1px at every width (768, 1024, 1280, 1920).
  - Mobile (below lg and at 375px): simplified floating bar showing only the STRANGE logo and a 44px hamburger `<button>` with aria-expanded/aria-controls.
  - Mobile Menu Panel: full-width drawer under bar with Home, Events, Favorites, and dummy Sign In pill. Trap focus while open, body scroll lock, morphing icon, close on Escape, route change, outside click, or resize to desktop.
  - One shared CSS variable `--navbar-height`; pages start with `padding-top = var(--navbar-height) + 32px` mobile / `48px` desktop.
- **ScrollToTop**:
  - Enforces `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` on pathname changes (NOT search param changes) when navigation is not "POP".
  - Preserves back/forward scroll restoration. Scrolls hash element into view if present.
- **Back to Top Cloak Button** (Home and `/events` only):
  - Fixed bottom-right (20px, bottom: calc(20px + env(safe-area-inset-bottom))), 56px visual size, 48px min hit area.
  - Original inline SVG floating red Cloak of Levitation with upward glowing arrow.
  - Tooltip "Back to Top" on hover/focus (hidden on touch).
  - Visibility: Home appears when hero is 100% out of view (IntersectionObserver); Events appears after scrolling 600px; hidden at top.
  - States: idle gentle float, unfurl on hover, 600ms upward sweep + 12 pooled gold particles on click, smooth scroll to top.
  - Instant scroll and no animations under reduced motion / touch.
- **Cursor**:
  - Custom cursor active only on `(hover: hover)` and `(pointer: fine)` without reduced motion.
  - Small gold/orange diamond (10px square rotated 45deg) following within 1 frame.
  - Music-note trail from a pool of max 10 reused inline SVG notes drifting and fading in ~900ms.
  - Exactly one cursor visible at all times, decided solely by pointer position, NEVER by focus.
  - Native zone (`input, textarea, select, [contenteditable="true"], [data-native-cursor]`): hides diamond, shows native cursor via high-specificity rules (including wrapper elements and labels). Outside native zone: diamond shows and native cursor is hidden, even if an input or select is focused. Recomputed on `pointermove`, `focusout`, `change`, and `window focus`.
  - Native `<select>` (such as Sort) treated as native zone; state recomputes after popup closes on next `pointermove`, `focusout`, `change`, and `window focus`.
- **Search & Controls**:
  - Native browser clear/cancel/search decorations hidden on `input[type="search"]` via CSS (`::-webkit-search-cancel-button`, `::-webkit-search-decoration`, `::-webkit-search-results-button`, `::-webkit-search-results-decoration`, `::-ms-clear`, `::-ms-reveal`).
  - Exactly ONE custom clear button: visible only when field has text, 44px hit area, `aria-label="Clear search"`, clears field & URL param, returns focus to input. Input has `pr-12` right padding so text never runs under button.
- **Home Stats & Featured Row**:
  - Prize pool calculated via `usePrizePool()` hook: fetches details of all ACTIVE events in idle queue (`requestIdleCallback`, max 3 concurrent, `staleTime: 30m`, skips on saveData/2G). Persisted in `localStorage["strange:prize-pool"]`. Slot always reserved with skeleton (0 CLS). Partial sum shows `+` suffix and retries once; complete sum shows exact total. GSAP count-up runs once when stat enters view.
  - Featured Events row has a visible "Skip featured events" button beside heading, first focusable element in section, scrolls to next section (`#about` with `scroll-mt-20`) and focuses `h2#about-heading` (`tabindex="-1"`). Smooth scroll when motion allowed, instant under reduced motion.
- **Event Detail Gallery & More in Theme**:
  - Gallery images wrapped in `<button type="button">` with `aria-label="Open image N of M"` opening lazy-loaded `GalleryLightbox` (accessible modal dialog, `role="dialog"`, `aria-modal="true"`, focus trap, Escape, ArrowLeft/Right, touch swipe, neighbor preload only, spinner-free scaled thumbnail preview, error fallback card, body scroll lock, z-index above navbar/back-to-top, diamond cursor visible, back-to-top hidden).
  - Final section after Contacts titled "More in {theme}" (from `src/lib/themes.ts` for current category): lists other events of same theme from cached list, excluding current event (upcoming/ACTIVE first, sorted by start date). Single horizontal CSS scroll-snap track of uniform `EventCard`s with 44px Previous/Next buttons (`aria-label="Scroll more events left/right"`, disabled at ends), keyboard scrollable (`tabIndex={0}`), swipe on touch, reset scroll to top on card click. Skeleton row in `EventDetailSkeleton`.
- **Footer**:
  - Sanctum Sanctorum backdrop with slowly rotating seal (60s CSS).
  - Under multiverse coordinates: 5 round dummy icon buttons (Instagram, LinkedIn, X, YouTube, GitHub), 44px targets, thin gold border, subtle hover scale, `<button type="button">`, no navigation.
  - Only real links to Events, Favorites, and config-driven items.
  - Copyright line and "SEE YOU IN ANOTHER REALITY."
  - Zero "Built with" text anywhere in the project.

## 7. Resilience, Scalability & Caching

### Request Budget Audit (Step 0)

| Route | Cold Cache (Initial + Background) | Warm Cache (Repeat View) | Background Requests Description |
|---|---|---|---|
| `/` | 1 initial + 27 background = **28 requests** | **0 requests** (or 1 if stale > 5m) | 1 `GET /api/test/events` for list; `usePrizePool` background idle fetches 27 `ACTIVE` event details (concurrency 3). Warm cache uses 12h persisted pool in `localStorage`. |
| `/events` | 1 initial + 0 background = **1 request** | **0 requests** | 1 `GET /api/test/events` for list. Hover prefetch: 1 per hovered card (max 1 in-flight, skipped on saveData/coarse pointer). |
| `/events/:id` | 1 detail + 1 related = **2 requests** | **0 requests** | 1 `GET /api/test/events/:id`; 1 `GET /api/test/events` for "More in {theme}" (idle deferred). Warm cache served from memory/TanStack cache. |
| `/favorites` | 1 initial + 0 background = **1 request** | **0 requests** | 1 `GET /api/test/events` to resolve bookmarked IDs. Hover prefetch: 1 per hovered card. |

### API Layer & Error Handling
- **Retry policy**: Retry only `network`, `timeout`, `5xx`, `408`, `429`. Max 2 retries, exponential backoff with jitter (`backoff = Math.min(cap, base * 2^attempt + jitter)`). Honor `Retry-After` header (capped at 5s). Never retry other 4xx (`400`, `401`, `403`, `404`, etc.). Keep the 8s internal-timeout controller; `getEvents` never forwards caller abort signal.
- **Circuit breaker**: After 3 consecutive failures stop calling the API for 15s; during that window serve the `localStorage` stale list (`stale: true`) or throw typed error immediately (`circuit_open`). Reset to closed state on first successful response.
- **Tolerant validation**: Drop malformed event items (missing valid string `id`, missing `name`, wrong field types) and keep all valid ones. Throw `invalid` only if 0 valid events remain or root JSON shape is wrong. Check response `Content-Type` header (HTML/non-JSON throws `invalid`). Never render undefined/null.
- **UUID Validation**: `getEvent(id)` validates that `id` matches standard UUID format (`^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`i). If non-UUID, immediately return `notfound` without dispatching a network call.
- **Online / Offline resilience**: Hook `useNetworkStatus` listens to `online`/`offline` window events. When offline, renders plain banner and serves cached data. On `online` event, revalidates/refetches once.
- **Error Boundaries & Isolation**:
  - Route-level `ErrorBoundary` with themed fallback (clear plain message, Retry button, link to `/events`; navbar stays usable).
  - Isolated section boundaries around optional sections (`hero effects`, `featured row`, `countdown`, `prize pool`, `lightbox`, `related row`, `cursor`, `back-to-top`). Fallback renders `null` (logs nothing in production) so section crashes never take down the page.
  - Plain error copy per kind (`timeout`, `network/offline`, `http 5xx`, `429`, `invalid`, `notfound`), `role="alert"`, focus not stolen, Retry debounced and disabled while fetching.
- **Extended `?sim=` dev simulation flags**:
  - `?sim=timeout`: simulated 8s abort.
  - `?sim=500`: 500 internal server error.
  - `?sim=404`: 404 not found.
  - `?sim=empty`: valid payload with empty events array.
  - `?sim=badjson`: invalid non-JSON payload.
  - `?sim=429`: HTTP 429 Too Many Requests.
  - `?sim=503-with-retry-after`: HTTP 503 Service Unavailable with `Retry-After: 2`.
  - `?sim=slow`: 5s delayed response.
  - `?sim=partial`: payload containing valid and malformed items (valid preserved).
  - `?sim=html`: Content-Type `text/html` response.
  - `?sim=offline`: simulated navigator offline mode.
- **Caching**:
  - Events list persisted in `localStorage["strange_events_cache"]` (`{events, timestamp}`, try/catch) with 24h max age; used as `initialData`/placeholder for instant repeat rendering, revalidating in background (stale-while-revalidate). "Showing saved data" banner shown ONLY when live call failed.
  - TanStack Query: no polling, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`. Detail queries `staleTime: 30m`, `gcTime: 60m`.
  - `usePrizePool`: triggers only when stats section is in view (`IntersectionObserver`) and after `load + idle`; max 3 concurrent requests; persists result for 12h in `localStorage["strange:prize-pool"]`; skipped on `saveData`/`2g`; respects circuit breaker.
  - Hover prefetch: max 1 in flight, skipped on `saveData` or coarse pointer.
- **Pagination & Batches**:
  - `/events` and `/favorites` render initial 12 cards; "Show 12 more" accessible button (`aria-live="polite"`, maintains focus) reveals 12 more. Resets to 12 when filters/sort/search change. Full total still shown in result counter. Timeline view also batches by 12.
- **Low-End Mode (`useEffectsBudget`)**:
  - `"lite"` mode triggered when: `saveData` is active, `2g` connection, `navigator.deviceMemory <= 2`, `hardwareConcurrency <= 4`, or `prefers-reduced-motion`.
  - In lite mode: disable particle canvas, music-note trail, parallax, Ken Burns, and sparks (diamond cursor stays).

## 8. Hard rules

1. Runtime fetching only. Never fetch event data at build time.
2. Never hide the LCP element (h1/tagline) with JS. It must be visible without waiting for scripts.
3. Animate only `transform` and `opacity`. No layout-shifting animation. CLS should be 0.
4. Respect `prefers-reduced-motion`. Content must be fully usable without animation.
5. GSAP is loaded via dynamic `import()` after first paint. No pinning, no scroll-jacking that traps scrolling.
6. Images: fixed 3:2 aspect ratio, explicit `width`/`height`, `loading="lazy"` except LCP image (`fetchpriority="high"`, eager).
7. Accessibility: landmarks, skip link, one `h1` per page, logical heading order, labelled inputs, visible `:focus-visible`, AA contrast, alt text from `*_image_alt`, modal/drawer focus trap + Escape.
8. No fake registration, payment or auth. Only link out if the API supplies a URL.
9. No console errors, no leftover debug logs, no secrets committed.
10. `npm run lint`, `npx tsc --noEmit` and `npm run build` must pass before completing.
11. NEVER run `git push`.