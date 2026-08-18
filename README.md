# SunoBolo English 🎙️

**Suno. Bolo. Repeat Karo. English Seekho.**

English speaking practice platform — full-stack (React frontend + Cloudflare backend).

> English Samajhna Nahi, English Bolna Seekho.

Every sentence follows one simple method:

```
🔊 SUNO 3 BAAR  →  🎤 BOLO 3 BAAR  →  ➡️ NEXT
```

---

## Status

| Phase | Status |
|---|---|
| **Phase 1 — Frontend** | ✅ Complete |
| **Phase 2 — Cloudflare (Workers + D1 + Pages)** | ✅ Complete |

## Live URLs

| Service | URL |
|---|---|
| **Frontend (Cloudflare Pages)** | https://sunobolo-english.pages.dev |
| **API (Cloudflare Worker)** | https://sunobolo-api.aadityasharmaecommerce.workers.dev |
| **Database (Cloudflare D1)** | `sunobolo-db` (account: Aadityasharmaecommerce) |

---

## Tech Stack

- **React 19** + **Vite 7** + **TypeScript** (strict)
- **react-router-dom 7** — client-side routing
- **Web Speech API** (`speechSynthesis`) — Text-to-Speech, no external API
- **Cloudflare Worker** — REST API (TypeScript, ~3kb startup)
- **Cloudflare D1** — SQLite database (15 tables, 390 sentences seeded)
- **Cloudflare Pages** — static frontend deployment

Frontend runtime deps: only `react`, `react-dom`, `react-router-dom`.

---

## Run Locally

```bash
cd "E:\Suno bolo english"
npm install
npm run dev        # http://localhost:5173 (mock/local data mode)
```

Production build + preview:

```bash
npm run build      # typecheck (tsc -b) + vite build → dist/
npm run preview    # serve dist/ locally
```

To run the frontend against the live API instead of local mock data:

```env
VITE_USE_REMOTE_API=true
VITE_API_URL=https://sunobolo-api.aadityasharmaecommerce.workers.dev
VITE_ADMIN_TOKEN=<admin token>
```

---

## Project Structure

```
src/
├── components/
│   ├── course/        CourseCard, LessonCard
│   ├── layout/        Header, Footer, BottomNav, AppLayout, AdminLayout
│   └── ui/            Button, Card, Badge, Modal, ProgressBar, Toaster,
│                      States (loading/empty/error), LockedOverlay, Section, StatCard
├── context/           AuthProvider, ProgressProvider, ToastProvider
├── data/seed/         All content (courses, lessons, sentences, packages, users)
├── hooks/             useSpeech (TTS), usePageMeta (SEO)
├── pages/             Home, Onboarding, Dashboard, Course, Lesson, Category (SEO),
│                      Pricing, Login, Signup, ForgotPassword, Profile, NotFound
│   └── admin/         Dashboard, Courses, Lessons, Sentences, Categories,
│                      Users, Packages, Analytics, Settings
├── services/          courses, lessons, sentences, progress, auth, packages,
│                      recommendation, admin CRUD, apiClient (API bridge)
├── styles/            tokens.css, base.css, components.css, layout.css,
│                      pages.css, responsive.css
├── types/             Domain types (D1-compatible shape)
└── constants/         Brand, method settings, goals, routes, SEO pages

workers/api/           Cloudflare Worker API source
migrations/            D1 SQL migrations (0001_init.sql)
scripts/               seed-d1.mts (mock → D1 SQL), e2e-*.mjs (browser tests)
```

---

## Content (seeded into D1)

| Course | Sentences | Free? |
|---|---|---|
| Kids English | 20 | ✅ Free |
| School English | 20 | ✅ Free |
| Beginner English | 100 | ✅ Free |
| Intermediate English | 50 | 🔒 Paid |
| Advanced English | 30 | 🔒 Paid |
| Daily Life English | 50 | 🔒 Paid |
| Interview English | 30 | 🔒 Paid |
| Corporate English | 30 | 🔒 Paid |
| Business English | 30 | 🔒 Paid |
| Travel English | 30 | 🔒 Paid |
| **Total** | **390** | |

Each sentence has: English, Hindi meaning, difficulty, order, free/paid flag,
lesson + course ids (stable ids like `beginner-l1-s3`).

---

## API Endpoints (Worker)

Public:
- `GET /api/courses`, `GET /api/courses/:id`, `GET /api/courses/slug/:slug`
- `GET /api/courses/:id/lessons`, `GET /api/courses/:id/sentences`
- `GET /api/lessons`, `GET /api/lessons/:id`, `GET /api/lessons/:id/sentences`
- `GET /api/sentences`, `GET /api/sentences/:id`
- `GET /api/packages`, `GET /api/packages/:id`
- `GET /api/me/progress?userId=...`
- `POST /api/progress/sync` (sentences, lessons, activity, streak)
- `POST /api/practice` (sentence practice event)

Admin (Bearer token, enforced server-side):
- `POST/PUT/DELETE /api/admin/courses[/:id]`
- `POST/PUT/DELETE /api/admin/lessons[/:id]`
- `POST/PUT/DELETE /api/admin/sentences[/:id]`
- `PUT /api/admin/packages/:id`

---

## Key Flows

1. **Homepage** (`/`) — hero, how-it-works, goals, audience sections, all courses
   (fetched live from the API), why-us, testimonials, pricing, FAQ, final CTA.
2. **Onboarding** (`/onboarding`) — goal → level → recommended learning path.
3. **Dashboard** (`/dashboard`) — continue learning, stats (sentences, lessons,
   streak, progress) — progress syncs with the server.
4. **Course page** (`/courses/:id`) — progress bar + lesson list with lock badges.
5. **Lesson practice** (`/courses/:id/lessons/:lessonId`) — the core experience:
   🔊 listen 3× (browser TTS) → 🎤 speak 3× (practice counter) → ✅ complete → NEXT.
   Progress is saved locally **and** synced to D1.
6. **Pricing** (`/pricing`) — 4 packages; mock purchase unlocks paid courses
   (real payments are the remaining Phase 2 follow-up).
7. **Admin** (`/admin`) — full CRUD against the live API (courses/lessons/
   sentences/packages) + users, analytics, settings. **Demo admin login:**
   `admin@sunobolo.com` (any password, 4+ chars).

---

## Backend Architecture

```
Browser (Pages site)
   │  fetch()
   ▼
Cloudflare Worker (sunobolo-api)
   │  D1 bindings
   ▼
Cloudflare D1 (sunobolo-db)
```

- `src/services/apiClient.ts` — the single bridge. `VITE_USE_REMOTE_API=true`
  switches every service from the local mock store to the Worker API. The UI
  never changed between phases.
- Mock auth & payments are still local (Phase 2 follow-up items — see below).
- `public/_redirects` provides the SPA fallback on Pages.
- `wrangler.jsonc` holds the Worker + D1 binding config.

## Remaining Work (Phase 3 follow-ups)

- [ ] Real authentication (Worker-backed login/signup; currently mock)
- [ ] Real payment gateway (currently mock purchase)
- [ ] Cloudflare Turnstile on forms (optional)
- [ ] Cloudflare R2 for audio/avatars (optional)
- [ ] Custom domain (currently `*.pages.dev`)

---

## Notes

- TTS uses the browser's Web Speech API with graceful fallback.
- The admin token is stored as a Worker secret (`ADMIN_TOKEN`) and also baked
  into the frontend build via `VITE_ADMIN_TOKEN` (needed to call admin APIs from
  the browser — for a production admin panel, gate admin access server-side
  instead).
- Seeding: `npx tsx scripts/seed-d1.mts` regenerates `seed.sql` from
  `src/data/seed/`; `npx wrangler d1 execute sunobolo-db --file=seed.sql`
  applies it (idempotent `INSERT OR IGNORE`).
- E2E browser checks: `scripts/e2e-check.mjs`, `scripts/e2e-admin*.mjs`,
  `scripts/e2e-guard.mjs`, `scripts/e2e-dashboard.mjs`.
