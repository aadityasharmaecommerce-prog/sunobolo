# SunoBolo English

Live preview app for practicing 5000+ real-life English sentences with Hindi meaning + consistent Indian English audio (`en-IN-NeerjaNeural` via edge-tts). All audio is pre-generated MP3s - no live TTS in production.

## Features
- **4,075 sentences** across 10 courses + 25-sentence free trial
- **Listen 3x -> Speak 3x** practice loop
- **Single consistent voice** (`en-IN-NeerjaNeural`) on every sentence
- **Same voice everywhere** fallback path for any missing files
- Lesson-level progress tracking (localStorage)
- Mobile-first responsive UI (360 / 390 / 412 / 430 px tested)
- Cloudflare Pages + D1 backend ready

## Project structure

```
sunobolo/
+-- dist/                      # built static assets (deployed to Cloudflare Pages)
+-- public/                    # static source (copied into dist by Vite)
|   +-- audio/                 # 4,075 pre-generated MP3s
+-- src/                       # React frontend (Vite + TypeScript)
|   +-- components/            # layout + UI components
|   +-- pages/                 # route pages (Home, Lesson, Progress...)
|   +-- hooks/                 # reusable logic (audio engine)
|   +-- data/                  # bundled content (canonical local source)
+-- functions/api/             # Cloudflare Pages Functions (D1-backed API)
+-- migrations/                # D1 schema + seed SQL
|   +-- 0001_init.sql          # tables
|   +-- 0002_seed.sql          # 4,075 sentences + courses + lessons
+-- wrangler.toml              # Cloudflare config
+-- _redirects, _headers      # SPA + cache headers (in public/ for Vite)
+-- scripts/                   # bulk audio generator (edge-tts)
+-- package.json
+-- vite.config.ts
```

## Generate all audio files (one-time)

```bash
pip install edge-tts
python3 scripts/bulk_gen_v2.py
```

This generates 4,075 MP3s using `en-IN-NeerjaNeural` (Indian English female, same voice on every sentence) at ~32 files/sec. Total time: ~2 minutes.

## Local dev

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages + D1

### 1. Login & create D1

```bash
npx wrangler login
npx wrangler d1 create sunobolo-db
# copy the returned database_id into wrangler.toml
```

### 2. Run migrations

```bash
# Local (with --local)
npx wrangler d1 migrations apply sunobolo-db --local

# Remote
npx wrangler d1 migrations apply sunobolo-db --remote
```

### 3. (Optional) Seed D1 from `migrations/0002_seed.sql`

The seed file is 1.19 MB and contains 4,075 sentences + 11 courses + 157 lessons. Apply it once:

```bash
npx wrangler d1 execute sunobolo-db --remote --file=./migrations/0002_seed.sql
```

> The frontend ships its own bundled `src/data/content.ts`, so seeding D1 is optional. The Worker API (`functions/api/`) serves content from D1 if you want server-side content management.

### 4. Deploy to Pages

```bash
npm run build
npx wrangler pages deploy ./dist --project-name sunobolo-english
```

After first deploy, link the D1 database:

```bash
# In Cloudflare dashboard: Pages -> sunobolo-english -> Settings -> Functions -> D1 bindings
# Bind "DB" to sunobolo-db
```

### 5. Custom domain

In the Pages dashboard: Custom domains -> Add `yourdomain.com`.

## Why this architecture

- **Audio = static asset (`/audio/*.mp3`)**: Stays close to the origin, never needs DB or TTS. Generated once with `edge-tts`.
- **Content = bundled (src/data/content.ts)**: Always works offline-first, no DB calls for sentence lookup.
- **Worker API = optional**: For server-side progress, users, analytics. The frontend works without it.
- **D1 = optional**: Only needed if you want multi-user progress synced server-side.

## Audio engine (`useSentenceAudio` v4)

- HEAD pre-check decides file existence
- If file exists (200) -> ONLY play MP3, no TTS
- If file missing (404) -> ONLY use cached best voice TTS
- Generation token invalidates stale callbacks -> "STOP" always wins
- No 3.5s timeout race -> zero double voice

## Scripts (npm)

```bash
npm run dev               # vite dev server
npm run build             # vite build (with tsc)
npm run deploy            # build + wrangler pages deploy
npm run db:migrate:remote # apply migrations to remote D1
npm run db:seed:remote    # seed D1 with 4,075 sentences + courses + lessons
npm run db:create         # create D1 database
npm run audio:gen         # regenerate all MP3s (uses scripts/bulk_gen_v2.py)
```

## Reliability

- 4,075 MP3 files cached for 1 year (`Cache-Control: public, max-age=31536000, immutable`) via `_headers`
- Frontend assets cached for 1 year
- All audio uses one voice (`en-IN-NeerjaNeural`, female, Indian English)
- Audio fallback (browser TTS) uses cached best voice; consistent rate (`0.85`)

## License

Internal project. Indian English voice generated with edge-tts under Microsoft's terms.
