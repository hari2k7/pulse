# PULSE: Render72 Hackathon

> Read this file first in every session and follow the **Hard rules**.

## 1. Goal

A dark, streaming-style events website ("PULSE", tagline: *Feel what's happening.*).
Judged on: Lighthouse (Performance, Accessibility, SEO), responsiveness (375 / 768 / 1280 px),
backend error handling, scalability readiness, design & creativity, features & UX.

- Individual participant. Up to 5 successful submissions. Latest is final by default.
- Deadline: **Friday 16 October 2026, 2:00 PM IST**.
- Deliverables: deployed URL, public GitHub repo, optional Figma link.

## 2. Stack

React 18 + TypeScript (strict) + Vite + React Router + Tailwind CSS.
GSAP + ScrollTrigger (dynamic import only). ESLint with `eslint-plugin-jsx-a11y`.
No backend, no database, no auth, no state library, no data-fetching library.
Deploy: Cloudflare Pages or Vercel (build `npm run build`, output `dist`, SPA rewrite).

## 3. Routes

| Route | Purpose |
|---|---|
| `/` | Landing: billboard hero + horizontal rows |
| `/events` | Discovery: search, filters, sort, grid + timeline views |
| `/events/:id` | Detail: banner, sticky summary, tabbed content |
| `*` | Not found |

Pages `/events` and `/events/:id` are lazy-loaded (`React.lazy` + `Suspense`).

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

**Unknown:** the inner shapes of `prizes`, `faqs`, `schedules`, `organizers`, `coordinators`
are not documented. Inspect the live response before rendering them. Treat every field as optional.

## 5. Design

Netflix-*style* layout (billboard + horizontal rows), **original branding**.
Never use the Netflix name, logo, "N" mark or their font.

| Token | Value |
|---|---|
| Background | `#141414` (nav gradient / footer may use `#000`) |
| Surface | `#181818`, hover `#2F2F2F` |
| Accent | `#E50914` (CTAs, active state, seats bar) |
| Text | `#FFFFFF`, muted `#B3B3B3` |
| Radius | 4px |

- Wordmark: text "PULSE" in heavy condensed caps, the "P" in accent red. Real text, not an image.
- Fonts: one display + one body, self-hosted (e.g. `@fontsource`), max 2 weights each, `font-display: swap`,
  preload only the display font.
- Cards: 3:2 image, name, category, date (IST), price/Free, status badge, thin red seats bar.
  Hover **and** focus-visible lift using `transform` only.
- Status is always shown with text labels, never color alone.

## 6. Display rules

- `price === 0` means "Free". `is_per_head` decides "per person" / "per team".
- Show `event_status` and `registration_status` as separate badges.
- Never show "registration open" unless `registration_status === "OPEN"`. Never infer it from `ACTIVE`.
- `seats_left = total_seats - seats_filled`, only when both are valid numbers. Clamp at 0.
- Format dates in IST. Tolerate missing or invalid dates (show nothing or "TBA").
- Hide any section whose data is missing or empty. Never render `undefined` or `null`.
- "Closing soon" = `registration_status === "OPEN"` and a future `registration_deadline`, nearest first.
- Rows come from real data only. Categories are derived from the API, never invented.

## 7. Resilience

- Timeout 8 s via `AbortController`. Up to 2 retries with backoff. No retry on 404. Never retry forever.
- Validate responses (`events` is an array, `event` exists). Handle invalid JSON.
- Typed error kinds: `network | timeout | http | notfound | invalid`.
- Cache last good list in `localStorage` (try/catch, with timestamp). If the live call fails and a cache
  exists, show it with a "Showing saved data" banner and a Retry button.
- Fetch the list once per session and share it across pages. Filter/sort client-side.
- States for every data view: skeleton, success, empty (not an error), error + Retry, not-found.
- One broken image must never break a card. Use a designed fallback with the same aspect ratio.
- Dev-only failure simulation via `?sim=timeout|500|empty|badjson|404` (disabled in production builds).

## 7b. Page structure and shell

- `index.html` contains a static, styled shell (dark background, navbar, headline) with inline critical CSS
  and good default meta tags (title, description, Open Graph, theme-color), so first paint and SEO do not
  depend on JS.
- Per-route `<title>` and meta description. Pattern: `PULSE — Discover events`, `Events — PULSE`,
  `{event name} — PULSE`.
- `public/` contains `robots.txt`, `sitemap.xml` (`/`, `/events`), and an SPA rewrite
  (`_redirects`: `/* /index.html 200` for Cloudflare, or `vercel.json` rewrites).

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