# 🔍 DIAGNOSTIC REPORT — Audio/Sentence Mismatch Investigation (FINAL)

## The exact requested diagnostic

| Field | Value |
|---|---|
| VISIBLE SENTENCE | "I am hungry. Let us eat something." |
| CURRENT SENTENCE ID | `beginner-151` (course `beginner`, lesson `beginner-07`) |
| BROWSER REQUESTED AUDIO URL | `/audio/beginner/beginner-151.mp3?v=4` — single canonical builder `AUDIO_PATHS.english(courseId, id)` in `src/config/voiceConfig.ts`. Grepped whole codebase: NO other path builder exists. No index-based mapping anywhere (`sentences[idx]` only drives UI; audio always uses `sentence.id`). |
| ACTUAL AUDIO FILE HASH (served by preview) | SHA256 `495d9f71…` (identical in preview response, dist/ and ZIP) |
| ACTUAL TRANSCRIPT (vosk + whisper, of the file served by the live preview) | **"I am hungry. Let us eat something."** |
| EXPECTED TRANSCRIPT | "I am hungry. Let us eat something." |
| MATCH | **YES ✅** |

Cross-checks on the LIVE preview (HTTP level = what the browser receives):

- `beginner-151.mp3` → "I am hungry. Let us eat something." ✅
- `beginner-171.mp3` → "We ordered too much food." ✅ (A→A, B→B: files ARE different and correct)
- `beginner-151.hindi.mp3` → Hindi STT: "मतलब मुझे भूख लगी है चलो कुछ खाते हैं" ✅ exact
- `beginner-152.hindi.mp3` → "मतलब आप क्या खाना पसंद करेंगे" ✅ exact
- `repeat-instruction.mp3` → "…3 बार रिपीट करें" ✅
- beginner-07 (all 25 sentences) → whisper PASS 25/25 ✅
- Free Trial (all 25) → 24/25 whisper PASS; the 1 "FAIL" is proven FALSE by vosk (see below)

## The free-trial-001 saga (transparency note)

Whisper heard only "Good morning." and I initially flagged the file as truncated.
Double-engine check (vosk small en-in) hears the FULL "good morning how are you" in
BOTH the old file and the freshly regenerated one — the file was never truncated.
Whisper base.en simply mis-transcribes this short clip (long internal pause).
Lesson applied: audit script classifies borderline overlaps as MANUAL CHECK, and
this report never claims SPOKEN CONTENT VERIFIED from a single STT engine.

## Root cause classification

| Class | Finding |
|---|---|
| MAPPING (code) | ✅ CLEAN — single ID-based builder, no index mapping, no competing builders |
| STATE (React) | ✅ CLEAN — same sentence object drives render + playback; generation token cancels stale audio on Next/Prev |
| PREVIEW (server) | ✅ VERIFIED GOOD — every checked file transcribes to its own sentence (vosk + whisper) |
| LOCAL (workspace) | ✅ Same bytes as preview (hashes match) |
| CACHE (browser/CDN) | ⚠️ LIKELY contributor for what you heard — old MP3s from earlier preview sessions may be served from browser memory/HTTP cache. Fixed with deterministic `?v=4` cache-busting on every audio URL + hard-refresh instructions. |
| DEPLOYED (pages.dev) | ❌ **STILL OLD** — the Cloudflare deployment has the ORIGINAL buggy audio + old UI. It will keep speaking wrong sentences until the ZIP is pushed. |

### Environment table

| Environment | State |
|---|---|
| 1. Local workspace | FIXED (mapping + voice + UI + cache-busting) |
| 2. Arena preview | FIXED — verified by dual-engine STT; serves `?v=4` URLs |
| 3. Cloudflare `sunobolo-english.pages.dev` | **NOT updated — push the ZIP** |

## Fixes applied this session

1. `?v=4` deterministic cache-busting on ALL audio URLs (`AUDIO_VERSION` in voiceConfig.ts — bump on every audio regen).
2. `console.debug('[SunoBolo] playing', url)` — the exact requested URL is visible in DevTools console.
3. Regenerated `free-trial-001.mp3` (equivalent content; full sentence verified by vosk).
4. FULL STT scan of all 4,076 English files running (vosk, 6 workers, results persisted to `scripts/audit-data/stt-scan-results.jsonl`) — any true mismatch found will be regenerated + reverified.

## How YOU verify in 30 seconds (DevTools)

1. Preview → lesson `beginner-07` → "I am hungry. Let us eat something." → Suno Aur Bolo
2. F12 → Network → Media: request must show `/audio/beginner/beginner-151.mp3?v=4` → 200
3. Console: `[SunoBolo] playing /audio/beginner/beginner-151.mp3?v=4`
4. If you see a URL WITHOUT `?v=4` → your browser is serving a cached old JS bundle → hard refresh (Ctrl+Shift+R), or DevTools → Network → "Disable cache", or clear site data.

## Deploying the fix

1. Download `sunobolo-voice-fix.zip`
2. Extract into repo root (overwrite)
3. `git add -A && git commit -m "fix: audio mapping verification, cache-busting v4, UI polish" && git push`
4. Cloudflare Pages: Root `sunobolo` · Build `npm run build` · Output `dist`
5. After deploy, hard-refresh pages.dev once (the old audio URLs are cached by Cloudflare/browser until the `?v=4` URLs take over).
