# STRANGE: A Tech Fest Beyond Reality

> Read this file first in every session and follow the **Hard rules**.

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
No backend, no database, no auth.
Deploy: Cloudflare Pages or Vercel (build `npm run build`, output `dist`, SPA rewrite).

## 3. Routes

| Route | Purpose |
|---|---|
| `/` | Landing: Sling Ring portal hero, stats, countdown, featured multiverse events, sanctum footer |
| `/events` | Discovery (Multiverse Index): search, filters, sort, grid + timeline views, dimension badges |
| `/events/:id` | Detail (Dimensional Index): cinematic banner, summary card, vertical section rail, deep hash links |
| `/schedule` | Schedule timeline: all upcoming events grouped by day (IST) with filter integration |
| `*` | Not found |

Pages `/events`, `/events/:id`, and `/schedule` are lazy-loaded (`React.lazy` + `Suspense`).

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

**Nested shapes (verified on a real event; keep every field optional because other events may differ):**

```ts
type Schedule    = { event_date?: string; start_time?: string; end_time?: string; venue?: string }  // "2026-11-13", "09:00" (IST, no offset)
type Prize       = { rank?: number; title?: string; amount?: number; description?: string }          // amount in INR
type Faq         = { question?: string; answer?: string }
type Organizer   = { id?: string; name?: string; org_type?: string }                                  // e.g. "CLUB"
type Coordinator = { id?: string; name?: string; role?: string; contact?: string }                    // contact is an email here; may be a phone elsewhere
```

Detail rules from this data:
- `schedules` items have no end date. A multi-day event is several items (one per day). Venue exists only here.
- The API gives no registration URL. Do not build a fake register form. If an event supplies a registration URL, link out (`rel="noopener"`); otherwise show registration status + deadline and anchor to event details.
- When `is_per_head` is false the seats are **team slots** (e.g. 24 teams). Say "team slots left" instead of "seats left".
  Say "Only N left" when 5 or fewer remain.
- `coordinators[].contact`: if it contains "@" render a `mailto:` link, if it is mostly digits render `tel:`, else plain text.
- `rules`, `highlights` etc. are arrays of strings and can be long. Render as lists. They may contain symbols like ×.
- `description` paragraphs are separated by `\n\n`.
- Gallery images come as Pexels URLs with `w=1400` (no height). Render with a fixed aspect ratio and `object-cover`.
- `.ics`: convert IST (UTC+5:30) times to UTC and use `Z` timestamps so every calendar app agrees.

## 4b. Festival Configuration (`src/config/festival.ts`)

Festival metadata is configured in `src/config/festival.ts`:
- Optional fields: `festivalName`, `tagline`, `startDate` (ISO with +05:30), `endDate`, `venue`, `collegeName`, `organizers[]`, `sponsors[] {name, logoUrl, href, tier}`, `socials[]`, `contactEmail`, `expectedParticipants`, `participatingColleges`.
- **Strict honesty rule**: Anything unset is HIDDEN, never faked. Clear TODO comments indicate user-configurable fields.
- Countdown targets `festival.ts` `startDate`; if unset, falls back to the earliest upcoming ACTIVE event start from the API and labels it "Next event in". If neither exists, the countdown is hidden.
- Counters: Real event list length live from API. Prize pool is summed ONLY from events whose detail data is loaded/cached in TanStack Query; if unavailable, the counter is hidden. Participants and colleges come ONLY from `festival.ts`, else hidden.

## 5. Design & Tokens

Immersive mystical tech fest aesthetic ("STRANGE — A Tech Fest Beyond Reality").
Original branding, spell-circle geometry, glowing Sling Ring portal accents, Sanctum Sanctorum motifs.

| Token | Value | Semantic Role |
|---|---|---|
| Background Midnight | `#07060D` | Deep cosmic void |
| Background Navy | `#0D1020` | Surface cards & panels |
| Background Violet-Dark | `#1A1030` | Elevated surfaces & overlays |
| Portal Orange | `#FF7A1A` | Sling ring fire, primary CTAs, Hackathons |
| Portal Gold | `#F5B642` | Magic glow, accents, secondary highlights |
| Electric Blue | `#3BA3FF` | Technical dimension |
| Magic Green | `#3DDC97` | Workshops dimension |
| Mystic Violet | `#A66BFF` | Non-technical dimension |
| Cloak Red | `#C8102E` | Cloak of Levitation motif (used sparingly) |
| Text Primary | `#F3EFE8` | High contrast body & titles (AA verified) |
| Text Muted | `#B8B3C7` | Subtle labels, secondary text (AA verified) |

- **Typography**:
  - Display: `Cinzel` (Google Fonts / `@fontsource/cinzel`, weights 400 & 700), self-hosted with metric-matched fallback for 0 CLS. Preload display font.
  - Body: `Inter` (weights 400 & 600), self-hosted with metric-matched fallback.
  - `font-display: swap` on all fonts.
- **Motion & Spacing**:
  - Durations: 150ms (micro), 300ms (standard), 500ms (transition), 800ms (cinematic).
  - Primary easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Radii: 6px (`rounded-sm`), 12px (`rounded-md`), 20px (`rounded-lg`), 9999px (`rounded-full`).
- **Original SVG Assets**:
  - STRANGE logo (wordmark + circular sigil), spell-circle concentric rings, glyph set (Overview, Schedule, Prizes, Rules, FAQs, Contacts), Eye of Agamotto artifact, Sanctum seal, Cloak silhouette. No Marvel logos or copyrighted images.
- **Cards**: Shared structure with category-specific portal colorways (electric blue, orange, green, violet), mixed-size layout with flagship span, red cloak sweep reveal, View Transitions API support.
- **Status Badges**: Always accompanied by explicit text labels, never color alone.

## 6. Display rules

- `price === 0` means "Free". `is_per_head` decides "per person" / "per team".
- Show `event_status` and `registration_status` as separate badges.
- Never show "registration open" unless `registration_status === "OPEN"`. Never infer it from `ACTIVE`.
- `seats_left = total_seats - seats_filled`, only when both are valid numbers. Clamp at 0.
- Format dates in IST. Tolerate missing or invalid dates (show nothing or "TBA").
- Hide any section whose data is missing or empty. Never render `undefined` or `null`.
- "Closing soon" = `registration_status === "OPEN"` and a future `registration_deadline`, nearest first.
- Event categories mapped to themes in `src/lib/themes.ts`.
- Event images are Pexels URLs with `w=1200&h=800&fit=crop` in the query string. Keep 3:2 ratio.

## 7. Resilience & Caching

- Timeout 8 s via `AbortController`. Up to 2 retries with backoff. No retry on 404. Never retry forever.
- Validate responses (`events` is an array, `event` exists). Handle invalid JSON.
- Typed error kinds: `network | timeout | http | notfound | invalid`.
- **TanStack Query Cache Layer**: In-memory query caching, stale-while-revalidate, background refetching, and synchronous placeholder data propagation.
- `localStorage` fallback persistence (`pulse_events_cache`). If live call fails and cache exists, show "Showing saved data" banner with Retry button.
- States for every data view: skeleton, success, empty (not an error), error + Retry, not-found.
- Dev-only failure simulation via `?sim=timeout|500|empty|badjson|404` (disabled in production).

## 7b. Page structure and shell

- `index.html` contains a static, styled shell (midnight background, navbar, headline) with inline critical CSS
  and default meta tags (title, description, Open Graph, theme-color), so first paint and SEO do not
  depend on JS.
- Per-route `<title>` and meta description. Pattern: `STRANGE — A Tech Fest Beyond Reality`, `Events — STRANGE`, `Schedule — STRANGE`, `{event name} — STRANGE`.
- `public/` contains `robots.txt`, `sitemap.xml` (`/`, `/events`, `/schedule`), and an SPA rewrite.

### Real data facts (checked against the live API, 30 events)

- 27 distinct `category` values across 30 events (almost all have exactly 1 event). **Never make one row or
  one filter chip per raw category.** Group them into themes with a client-side map in `src/lib/themes.ts`
  (unknown categories fall into "More"). Show the raw category as a small label on each card.
  - Tech & Code: Coding, Hackathon, Artificial Intelligence, Web Development, Cybersecurity, Gaming
  - Robotics & Engineering: Robotics, Engineering, Aerial Robotics, Robotics & Electronics
  - Design & Visual Arts: Design & Product, Visual Arts, Art & Design, Arts & Craft, Design, Photography, Film & Media
  - Performing & Music: Dance, Music, Theatre
  - Words & Culture: Debate & Literary, Literary Arts, Quiz & Culture, Food & Culture
  - Science & Startups: Sustainability, Astronomy, Entrepreneurship
- `event_status`: ACTIVE 27, COMPLETED 2, CLOSED 1. `registration_status`: OPEN 24, CLOSED 3, SOLD_OUT 3.
  `event_mode`: OFFLINE 26, ONLINE 4. `event_type`: EVENT 23, WORKSHOP 7. Featured 6. Free 7.
- The list is sorted by start date, so the first items are in the past (COMPLETED/CLOSED, deadlines already gone).
  - Billboard = a featured event that is ACTIVE with registration OPEN (fallback: any ACTIVE OPEN event).
  - Default `/events` view hides past events; a "Show past events" toggle reveals them (they are labelled).
  - Completed events show "Completed", never a seats-left bar or open-registration wording.
  - SOLD_OUT events stay visible with a "Sold out" badge.
- Row plan for the landing page (hide any row with fewer than 3 events):
  Featured, Closing soon, Free to join, Workshops, then one row per **theme** that has 3 or more events.
  "Online" has only 4 events, so use it as a filter chip rather than a row.
- Event images are Pexels URLs with `w=1200&h=800&fit=crop` in the query string. Cards request a smaller size
- Event images are Pexels URLs with `w=1200&h=800&fit=crop` in the query string. Cards request a smaller size
  (e.g. `w=600&h=400`), the billboard a larger one, with `srcset`/`sizes`. Keep the 3:2 ratio.

## 8. Hard rules

1. Runtime fetching only. Never fetch event data at build time.
2. Never hide the LCP element (billboard image / h1) with JS. It must be visible without waiting for scripts.
3. Animate only `transform` and `opacity`. No layout-shifting animation. CLS should be 0.
4. Respect `prefers-reduced-motion`. Content must be fully usable without animation.
5. GSAP is loaded via dynamic `import()` after first paint. No pinning, no scroll-jacking.
6. Images: fixed aspect ratio, explicit `width`/`height`, `loading="lazy"` except the LCP image
   (`fetchpriority="high"`, eager).
7. Carousels use CSS scroll-snap with focusable prev/next buttons and `aria-label`s. No carousel library.
8. Accessibility: landmarks, skip link, one `h1` per page, logical heading order, labelled inputs,
   visible `:focus-visible`, AA contrast, alt text from `*_image_alt`, modal/drawer focus trap + Escape.
9. Keep dependencies minimal. After every step, review `package.json` and the build output size.
10. No fake registration, payment or auth. Only link out if the API supplies a URL.
11. No console errors, no leftover `console.log`, no secrets committed.
12. Work in small steps. Do only what the current prompt asks. Do not refactor unrelated code.
13. `npm run lint`, `npx tsc --noEmit` and `npm run build` must pass before you finish a step.

## 9. Folder structure (suggested)

```
src/
  app/        App.tsx, routes.tsx
  components/ layout/ events/ states/ ui/
  pages/      HomePage.tsx, EventsPage.tsx, EventDetailPage.tsx, NotFoundPage.tsx
  lib/        api.ts, types.ts, format.ts, filters.ts, calendar.ts, sim.ts
  hooks/      useEvents.ts, useReveal.ts, useDocumentMeta.ts
  styles/     index.css
```

## 10. Definition of done

- [ ] Landing, events list and event detail work from the live API
- [ ] No horizontal scroll at 375, 768, 1280 px
- [ ] Every `?sim=` failure renders a clean state; Retry works; no blank screen or endless spinner
- [ ] Lighthouse (PageSpeed Insights) reviewed on the deployed URL for mobile and desktop
- [ ] Keyboard-only navigation works everywhere
- [ ] Deep links (`/events/:id`) work on refresh in production
- [ ] README complete (setup, architecture, design rationale, AI + third-party assets disclosure)
- [ ] Repo public, URL opens in a private window