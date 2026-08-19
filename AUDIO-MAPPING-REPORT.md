# 🔍 SunoBolo — Audio ↔ Sentence Mapping Bug — Root Cause & Fix Report

**Bug reported:** On `/lesson/beginner/beginner-07`, visible sentence
"I am hungry. Let us eat something." but audio says "We order too much food."
Reproducible in multiple places.

**Status: ROOT CAUSE FOUND, FIXED, AND VERIFIED (speech-to-text).**

---

## 1. Root cause

The **beginner course audio files were generated from an OLDER version of
the beginner sentence bank** and were never regenerated after `content.ts`
was updated.

Evidence chain (all verified):

1. The app resolves audio by **sentence ID**, not by array index:
   `/audio/<courseId>/<sentenceId>.mp3` (`useSentenceAudio.ts` →
   `AUDIO_PATHS.english`). The app code is correct — the DATA was wrong.
2. `beginner-151` in `content.ts` = "I am hungry. Let us eat something."
   Speech-to-text (whisper) of the shipped `beginner-151.mp3`:
   **"we ordered too much food"** → AUDIO CONTENT MISMATCH confirmed.
3. "We order(ed) too much food" exists NOWHERE in `content.ts`, in
   `scripts/content/*`, or anywhere in git history — the audio was generated
   outside the repo from an older local bank.
4. Bulk transcription of beginner-001..400 shows a **consistent position
   shift of +20**: e.g. audio[120] says what content.ts has at [140],
   audio[160] = content[180], audio[200] = content[220].
   In the old bank, "We ordered too much food" was at position 151;
   in the current bank it moved to **beginner-171** (whisper-verified:
   beginner-171.mp3 now correctly says "We ordered too much food").
   → ~20 sentences were inserted early in the new bank, shifting all
   later positions, and the old audio was never regenerated.

### Affected scope (committed/deployed dataset)

| Range | Count | Status |
|---|---|---|
| beginner-005 – beginner-178 | 174 files | FAIL — content mismatch (audio shifted) |
| beginner-180 – beginner-250 | 71 files | FAIL — content mismatch |
| beginner-252 – beginner-262 | 11 files | FAIL — content mismatch |
| beginner-264 – beginner-357 | 94 files | FAIL — content mismatch |
| beginner-179, 251, 263 | 3 files | PASS (same sentence in both banks) |
| beginner-001..004, 358..725 | 372 files | PASS |
| All other 10 courses | spot-checked 5/course + more | PASS |

**Total: 350 of 4,075 files had wrong spoken content** — all in the
beginner course (positions ~5..357).

## 2. Fix

The audio was regenerated **from the current `content.ts`** (the single
canonical source) with `scripts/regenerate_voice.py` — every file is
synthesized from its own sentence ID's English text, so position shifts
cannot happen again. Mapping: `id → /audio/<courseId>/<id>.mp3` (unchanged).

All 8,151 files (4,075 English + 4,075 Hindi + 1 instruction) were rebuilt
with the single voice (hi-IN-SwaraNeural) — this also completes the voice
consistency fix from before.

### Verification on the FIXED dataset

- **beginner-07 (the reported lesson): all 25 sentences PASS** —
  whisper transcription matches the visible English, including
  beginner-151 → "I am hungry. Let us eat something." ✅
  beginner-171 → "We ordered too much food." ✅
- 350 previously-failing IDs: regenerated from current content.ts
  (sampled 12 + full beginner-07 lesson via whisper → all PASS).
- All other courses: structural checks + STT samples → PASS.
- Structural validation (see below): all checks PASS, 0 missing,
  0 stale files.

## 3. Files changed

| File | Change |
|---|---|
| `public/audio/**` (8,151 files) | Regenerated from current content.ts — one voice, correct mapping |
| `src/config/voiceConfig.ts` | (from previous fix) single voice + ID-based paths |
| `src/hooks/useSentenceAudio.ts` | (from previous fix) ID-based playback, MP3-first |
| `scripts/regenerate_voice.py` | Canonical regenerator (id → english → mp3) |
| `scripts/validate-audio-sentence-mapping.mjs` | NEW — structural mapping validation |
| `scripts/audit-audio-stt.py` | NEW — speech-to-text content auditor |
| `scripts/audit-data/` | NEW — audit run results (beginner fails list etc.) |

Sentence texts, IDs and the sentence→file mapping were NOT changed —
only the audio content was corrected to match the canonical data.

## 4. Why this cannot happen again

- Audio is generated from `content.ts` by sentence ID — never by array
  position or a separate sentence list.
- `validate-audio-sentence-mapping.mjs` proves the mapping is
  deterministic (unique IDs, ID-derived paths, no missing/stale files).
- `audit-audio-stt.py` transcribes actual audio and compares it to the
  visible sentence — it caught the original bug instantly
  (`beginner-091/181/271 → FAIL — AUDIO CONTENT MISMATCH` on the old data)
  and reports `12/12 PASS` on the fixed data.
- NOTE: structural checks alone CANNOT catch content-level mismatches
  (the old dataset passed all structural checks!). Always run the STT
  auditor on a sample after any content change.

Run after any future content/audio change:
```bash
node scripts/validate-audio-sentence-mapping.mjs
python3 scripts/audit-audio-stt.py --sample 10 --model models/vosk-model-small-en-in-0.4
```

## 5. Next/Previous behavior (code-verified)

`listenThreeTimes` bumps a generation token and cancels the active audio
element + `speechSynthesis` before each new sentence; every async step
re-checks the token. So: Next → Sentence B plays B only; Previous → A
plays A only; Next → immediately press Suno Aur Bolo → the old audio is
cancelled before the new flow starts. (Manual click-through on the live
preview is recommended as a final sanity check.)

## 6. Honest verification limits

- Full STT transcription of all 4,075 files was not run end-to-end;
  coverage was: beginner-001..400 (full), beginner-401..725 (full),
  beginner-07 lesson (all 25, whisper), all other courses sampled.
  The 350 failing files are exactly within the fully-audited ranges.
- STT can mishear rare words (e.g. vosk hears "souvenir" poorly);
  borderline overlaps are reported as MANUAL CHECK REQUIRED, and the
  two tools together distinguish FILE MAPPING VERIFIED from
  SPOKEN CONTENT VERIFIED.

## 7. Build result

`npm run build` → ✅ success (vite 8, tsc clean).
