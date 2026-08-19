# Spoken-audio verification results

App: deployed `sunobolo/`  
Date: 2026-08-19

## Actual spoken verification cannot be completed in this environment.

No local speech-to-text model is present. Model downloads are blocked.

Tried:

| Method | Result |
|---|---|
| Local Whisper / faster-whisper / whisper.cpp | not installed, no weights on disk |
| Vosk Python package | installed, **no model** in `MODEL_DIRS` |
| Vosk model download (`alphacephei.com`) | SSL closed — blocked |
| Hugging Face / GitHub release assets | SSL / CDN blocked |
| Google Web Speech (`recognize_google`) | connection reset |
| MP3 ID3 tags | none (no embedded source text) |

ffmpeg can **decode** MP3s. That is not transcription.

**No file was transcribed. No sentence is PASS. No sentence is FAIL.**

Audio files were **not** replaced.

---

## Totals

| | Count |
|---|---|
| Total audio files (deployed `sunobolo/public/audio`) | 4075 |
| Actually transcribed | **0** |
| PASS | **0** |
| FAIL | **0** |
| Manual check required | **4075** |

FAIL list: *(empty — nothing was transcribed)*

---

## Phase 1 — Free Trial (25)

Transcript column is empty because STT could not run.

| ID | Expected | Transcript | Status | Audio |
|----|----------|------------|--------|-------|
| free-trial-001 | Good morning. How are you? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-001.mp3` |
| free-trial-002 | My name is Priya. What is your name? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-002.mp3` |
| free-trial-003 | I am from India. Where are you from? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-003.mp3` |
| free-trial-004 | I wake up at 6 o'clock every day. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-004.mp3` |
| free-trial-005 | Can you please call me later? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-005.mp3` |
| free-trial-006 | How much does this cost? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-006.mp3` |
| free-trial-007 | I'm sorry, I'm running late. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-007.mp3` |
| free-trial-008 | Could you please help me with this? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-008.mp3` |
| free-trial-009 | I don't understand. Can you repeat? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-009.mp3` |
| free-trial-010 | What are your plans for the weekend? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-010.mp3` |
| free-trial-011 | I work in an office. What do you do? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-011.mp3` |
| free-trial-012 | Where is the nearest bus stop? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-012.mp3` |
| free-trial-013 | My internet connection is not working. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-013.mp3` |
| free-trial-014 | Thank you so much for your help! | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-014.mp3` |
| free-trial-015 | Excuse me, can you tell me the time? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-015.mp3` |
| free-trial-016 | I am learning English. It is very useful. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-016.mp3` |
| free-trial-017 | Let's meet at the coffee shop at 4. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-017.mp3` |
| free-trial-018 | The traffic is very heavy today. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-018.mp3` |
| free-trial-019 | Have a great day! | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-019.mp3` |
| free-trial-020 | Do you have this in a smaller size? | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-020.mp3` |
| free-trial-021 | I need to book a hotel room for two nights. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-021.mp3` |
| free-trial-022 | I ordered a product but it hasn't arrived yet. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-022.mp3` |
| free-trial-023 | I'll call you back in five minutes. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-023.mp3` |
| free-trial-024 | I have a meeting at 10 AM tomorrow. | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-024.mp3` |
| free-trial-025 | Nice to meet you! | — | MANUAL CHECK REQUIRED | `sunobolo/public/audio/free-trial/free-trial-025.mp3` |

Phase 2 (all courses, every sentence): **not started** — same STT blocker.

---

## Next step (outside this sandbox)

On a machine with Whisper (or Vosk model `vosk-model-small-en-us-0.15`):

```bash
whisper sunobolo/public/audio/free-trial/free-trial-001.mp3 --language en --model small
```

Compare the transcript to `english` in `sunobolo/src/data/content.ts`.  
Only then fill PASS / FAIL. Do not replace an MP3 until a FAIL transcript exists.
