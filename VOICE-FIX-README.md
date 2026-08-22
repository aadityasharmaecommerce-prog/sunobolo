# 🎙️ SunoBolo — Voice System: Sarvam AI Premium Voice

## Voice Architecture

| Part of guided flow | Voice | Engine |
|---|---|---|
| English sentence | shubh (Male, Indian) | Sarvam AI bulbul:v3 |
| Hindi meaning ("मतलब ...") | shubh (Male, Indian) | Sarvam AI bulbul:v3 |
| "मेरे साथ 3 बार रिपीट करो।" | shubh (Male, Indian) | Sarvam AI bulbul:v3 |
| 3 repetitions | Same English MP3 | Sarvam AI bulbul:v3 |

**Result: the complete guided flow is ONE speaker (Shubh — premium Indian male voice).**

## What changed (v18)

- **Removed**: All Viraj/ElevenLabs George voice audio
- **Added**: All sentences regenerated with Sarvam AI (shubh, bulbul:v3)
- **English**: `en-IN` language code — natural Indian-friendly accent
- **Hindi**: `hi-IN` language code — native Hindi voice
- **Instruction**: Also regenerated with Sarvam Hindi voice
- **Audio version**: Bumped to `18` for cache busting

## Files

- `src/config/voiceConfig.ts` — ONE centralized voice configuration.
  `AUDIO_VERSION = '18'` forces fresh audio downloads.
- `src/hooks/useSentenceAudio.ts` — Audio engine: MP3-first with
  browser TTS fallback (ONE bilingual voice).
- `public/audio/<courseId>/<id>.mp3` — English sentences (Sarvam)
- `public/audio/<courseId>/<id>.hindi.mp3` — Hindi meanings (Sarvam)
- `public/audio/shared/repeat-instruction.mp3` — Instruction (Sarvam)
- `scripts/sarvam_replace_all.py` — **REGENERATE ALL** audio with Sarvam AI

## How to regenerate audio

### Generate missing only (safe, resume-ready):
```bash
python3 scripts/sarvam_replace_all.py
```

### Force replace ALL existing audio:
```bash
python3 scripts/sarvam_replace_all.py --force
```

### Preview without generating:
```bash
python3 scripts/sarvam_replace_all.py --dry-run
```

### Generate specific course only:
```bash
python3 scripts/sarvam_replace_all.py --course beginner
python3 scripts/sarvam_replace_all.py --course free-trial
```

### With custom API key:
```bash
SARVAM_API_KEY=your_key python3 scripts/sarvam_replace_all.py --force
```

## API Details

- **Provider**: Sarvam AI (api.sarvam.ai)
- **Model**: bulbul:v3
- **Speaker**: shubh (Male, Indian, Natural)
- **Sample Rate**: 24000 Hz
- **Pace**: 0.95 (natural speed)
- **Format**: MP3 (iOS-compatible)

## Deploy

1. Regenerate audio with the script above
2. Commit and push:
```bash
git add -A
git commit -m "feat: replace all voice with Sarvam AI premium (shubh) voice"
git push
```
3. Cloudflare Pages auto-deploys

## Technical Notes

- Sarvam AI API key: stored in `scripts/sarvam_replace_all.py` or env `SARVAM_API_KEY`
- Rate limiting: script includes automatic retry with exponential backoff
- Progress saved every 10 sentences for resume capability
- Browser TTS fallback uses ONE bilingual voice (hi-IN preferred) — never English/Hindi pair
- Old Viraj scripts remain in `scripts/` for historical reference only
