# STRANGE: A Tech Fest Beyond Reality

> Read this file first in every session and follow the **Hard rules**. This spec is the FINAL source of truth.

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

## 3. Routes

| Route | Purpose |
|---|---|
| `/` | Landing: Sling Ring portal hero, stats, countdown (Eye of Agamotto), featured horizontal scrub track, Sanctum footer |
| `/events` | Discovery (Multiverse Index): search, multi-select filters, sort, uniform grid + timeline views |
| `/events/:id` | Detail (Composed Layout): hero facts strip, overview + sticky summary, schedule & prizes, rules & FAQs, gallery & contacts |
| `/favorites` | Curated Saved Events: cross-tab synchronized favorites with uniform EventCard grid |
| `*` | Not found |

Pages `/events`, `/events/:id`, and `/favorites` are lazy-loaded (`React.lazy` + `Suspense`).
There is NO `/schedule` page, route, or sitemap entry.

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
- Optional fields: `festivalName`, `tagline`, `startDate` (ISO with +05:30), `endDate`, `venue`, `collegeName`, `organizers[]`, `sponsors[] {name, logoUrl, href, tier}`, `socials[]`, `contactEmail`, `expectedParticipants`, `participatingColleges`.
- **Strict honesty rule**: Anything unset is HIDDEN, never faked. Clear TODO comments indicate user-configurable fields.
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
  - Single `<Link>` to `/events/:id` inside a relative wrapper.
  - Sibling heart toggle next to date row with 44px hit area and `stopPropagation`.
  - 3:2 image ratio, explicit width/height (600x400), lazy except LCP images.
  - Category pill top-left, slot status pill top-right (each max-w 45%, min-w-0 to prevent overlap).
  - Footer bar pinned with `mt-auto`.
  - Cloak peel + rotating portal on hover and focus-visible (~500ms). Reverses smoothly on leave.
  - Completely static under `prefers-reduced-motion` and touch devices.

## 6. Global Shell

- **Navbar**:
  - Floating centered bar (max-width ~1100px), near-black `#07060D` fill, no blur.
  - Double gold/orange lines along top/bottom with pointed diamond-shaped ends and fine lattice pattern.
  - Small diamond ornaments at center top/bottom lines, thin vertical dividers.
  - Items: Home (house icon), Events (mandala icon), Favorites (heart icon) with always-visible uppercase labels.
  - Active route: orange underline with small diamond, `aria-current="page"`.
  - Center: STRANGE wordmark.
  - Right: pill button "Sign In" with glowing orange outline and up-right arrow (`<button type="button">`, dummy, no onClick/navigation/modal/auth).
  - Mobile: compact version fitting 375px without horizontal scroll.
  - One shared CSS variable `--navbar-height`; pages start with `padding-top = var(--navbar-height) + 32px` mobile / `48px` desktop.
- **ScrollToTop**:
  - Enforces `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` on pathname changes (NOT search param changes) when navigation is not "POP".
  - Preserves back/forward scroll restoration. Scrolls hash element into view if present.
- **Cursor**:
  - Custom cursor active only on `(hover: hover)` and `(pointer: fine)` without reduced motion.
  - Small gold/orange diamond (10px square rotated 45deg) following within 1 frame.
  - Music-note trail from a pool of max 10 reused inline SVG notes drifting and fading in ~900ms.
  - Class `has-custom-cursor` on `<html>` hides native cursor on interactive elements while preserving native text cursor on inputs/textareas/selects.
- **Footer**:
  - Sanctum Sanctorum backdrop with slowly rotating seal (60s CSS).
  - Only real links to Events, Favorites, and config-driven items.
  - Copyright line and "SEE YOU IN ANOTHER REALITY."
  - Zero "Built with" text anywhere in the project.

## 7. Resilience & Caching

- Timeout 8 s via internal `AbortController`. Up to 2 retries with backoff. No retry on 404.
- `getEvents` does NOT forward caller signal to fetch to avoid premature cancellation by unmounting components.
- Validate responses (`events` is an array, `event` exists). Handle invalid JSON.
- Typed error kinds: `network | timeout | http | notfound | invalid`.
- **TanStack Query Layer**: retry false, staleTime 5 min, gcTime 30 min, refetchOnWindowFocus false.
- `localStorage` fallback persistence (`strange_events_cache`). If live call fails and cache exists, show "Showing astral cached data" banner with Retry button.
- States for every data view: skeleton, success, empty (not an error), error + Retry, not-found, stale banner.
- Dev-only failure simulation via `?sim=timeout|500|empty|badjson|404` (disabled in production).

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