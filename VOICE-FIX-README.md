# 🎙️ SunoBolo — Voice Consistency Fix (ONE teacher, ONE voice)

## What changed

| Part of guided flow | Before | After |
|---|---|---|
| English sentence | MP3 — `en-IN-NeerjaNeural` (English-only voice) | MP3 — `hi-IN-SwaraNeural` (same voice as Hindi) |
| Hindi meaning ("मतलब ...") | Browser TTS — device-dependent Hindi voice | MP3 — `hi-IN-SwaraNeural` (SAME voice) |
| "मेरे साथ 3 बार रिपीट करो।" | Browser TTS — same device Hindi voice | MP3 — `hi-IN-SwaraNeural` (SAME voice) |
| 3 repetitions | Same English MP3 (Neerja) | Same English MP3 (Swara) — identical voice, zero switching |

**Result: the complete guided flow is now ONE speaker (Swara — female,
native Hindi, natural Indian English).**

Why the old voice could not stay: `en-IN-NeerjaNeural` cannot speak Hindi at
all — it produces no audio for Devanagari text (verified). Keeping it would
mean two different teachers, which was the bug. `hi-IN-SwaraNeural` is
bilingual, so every part of the flow comes from the same person.

## Files

- `src/config/voiceConfig.ts` — ONE centralized voice configuration.
  No component picks its own voice anymore.
- `src/hooks/useSentenceAudio.ts` — v8 engine: MP3-first for English +
  Hindi + instruction; browser TTS is only a fallback and also locks ONE
  bilingual voice for every language.
- `public/audio/<courseId>/<id>.mp3` — regenerated English (same paths,
  sentence→file mapping UNCHANGED).
- `public/audio/<courseId>/<id>.hindi.mp3` — NEW: Hindi meanings.
- `public/audio/shared/repeat-instruction.mp3` — NEW: instruction.
- `scripts/regenerate_voice.py` — regenerates everything with one command.
- `package.json` — `npm run audio:gen` now uses the new script.

## How to apply (deploy)

1. Download `sunobolo-voice-fix.zip` from the workspace.
2. Extract it INTO your repo root (so the `sunobolo/` folder gets the new
   files). Overwrite when asked.
3. Commit and push:

```bash
git add -A
git commit -m "fix: one consistent voice (hi-IN-SwaraNeural) for entire guided flow"
git push
```

4. Cloudflare Pages settings (already correct from the deploy fix):
   Root directory `sunobolo` | Build command `npm run build` | Output `dist`

## Regenerate audio in the future

```bash
pip install edge-tts
python3 scripts/regenerate_voice.py
```

With `ffmpeg` on PATH, leading/trailing silence is trimmed (internal sentence
pauses are preserved for learners) and files are smaller. Without ffmpeg,
audio stays 48 kbps — still correct.

## Honest technical notes

- Production (Cloudflare Pages): YES, one voice everywhere — all MP3s are
  generated with the same edge-tts voice id.
- Offline/missing-file fallback (browser TTS): the app uses ONE single
  bilingual voice (hi-IN preferred) for all text. That fallback voice is a
  different speaker than Swara (browser voices are device-dependent and
  cannot be shipped), but it is still ONE consistent voice — never an
  English/Hindi pair.
- Sentence/audio mapping was NOT changed; sentence content was NOT changed.
