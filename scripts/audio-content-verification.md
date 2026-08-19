# Spoken audio content verification

Date: 2026-08-19  
App: **deployed `sunobolo/`** (`https://sunobolo-english.pages.dev`)

## Verdict

**Spoken content is NOT fully verified.**

Automatic speech-to-text is **not available** in this environment:

- `ffmpeg` (via `imageio-ffmpeg`) works and can decode every sampled MP3
- Google Web Speech API: connection reset
- Vosk / Whisper model downloads: blocked (SSL / CDN)
- MP3s have **no ID3 tags** with source text

So this report does **not** claim that the voice inside each file says the on-screen English.

Legend used below:

| Status | Meaning |
|---|---|
| **PASS** | Spoken words were transcribed and match visible English |
| **FAIL** | Spoken words were checked and do **not** match |
| **MANUAL CHECK REQUIRED** | Cannot confirm spoken words automatically |

Zero sentences are **PASS**. Zero sentences are **FAIL**. All checked items are **MANUAL CHECK REQUIRED**.

---

## What *was* checked (proxy only — not transcription)

All **4075** unique deployed sentences (`id` like `beginner-001`):

| Check | Result |
|---|---|
| File exists at `/audio/{courseId}/{id}.mp3` | 4075 / 4075 present |
| File size | none under 1.5 KB |
| Identical audio reused for two different IDs (MD5) | **0 duplicates** |
| Duration vs text length | median **10.7 chars/sec** (typical TTS). Range 4.6–25.5 |
| Suspiciously fast (cps > 22) | 3 files — still plausible for NeerjaNeural, **not** a content fail |
| Suspiciously long (cps < 4 and dur > 8s) | 0 |

The 3 fast clips (need ears, not auto-fail):

| ID | Dur | English |
|---|---|---|
| beginner-078 | 2.26s | There is a beautiful garden in front of our house. |
| beginner-170 | 2.09s | Breakfast is the most important meal of the day. |
| beginner-256 | 1.49s | Can you please help me fill this form? |

---

## Free Trial — sequential (sentences 1–25)

Playback path: `sunobolo/public/audio/free-trial/free-trial-NNN.mp3`  
On screen + file ID are the same object (`cur.id` / `cur.english` / `cur.hindi`).

| # | ID | Visible English | Spoken? |
|---|---|---|---|
| 1 | free-trial-001 | Good morning. How are you? | MANUAL CHECK REQUIRED |
| 2 | free-trial-002 | My name is Priya. What is your name? | MANUAL CHECK REQUIRED |
| 3 | free-trial-003 | I am from India. Where are you from? | MANUAL CHECK REQUIRED |
| 4 | free-trial-004 | I wake up at 6 o'clock every day. | MANUAL CHECK REQUIRED |
| 5 | free-trial-005 | Can you please call me later? | MANUAL CHECK REQUIRED |
| 6 | free-trial-006 | How much does this cost? | MANUAL CHECK REQUIRED |
| 7 | free-trial-007 | I'm sorry, I'm running late. | MANUAL CHECK REQUIRED |
| 8 | free-trial-008 | Could you please help me with this? | MANUAL CHECK REQUIRED |
| 9 | free-trial-009 | I don't understand. Can you repeat? | MANUAL CHECK REQUIRED |
| 10 | free-trial-010 | What are your plans for the weekend? | MANUAL CHECK REQUIRED |
| 11 | free-trial-011 | I work in an office. What do you do? | MANUAL CHECK REQUIRED |
| 12 | free-trial-012 | Where is the nearest bus stop? | MANUAL CHECK REQUIRED |
| 13 | free-trial-013 | My internet connection is not working. | MANUAL CHECK REQUIRED |
| 14 | free-trial-014 | Thank you so much for your help! | MANUAL CHECK REQUIRED |
| 15 | free-trial-015 | Excuse me, can you tell me the time? | MANUAL CHECK REQUIRED |
| 16 | free-trial-016 | I am learning English. It is very useful. | MANUAL CHECK REQUIRED |
| 17 | free-trial-017 | Let's meet at the coffee shop at 4. | MANUAL CHECK REQUIRED |
| 18 | free-trial-018 | The traffic is very heavy today. | MANUAL CHECK REQUIRED |
| 19 | free-trial-019 | Have a great day! | MANUAL CHECK REQUIRED |
| 20 | free-trial-020 | Do you have this in a smaller size? | MANUAL CHECK REQUIRED |
| 21 | free-trial-021 | I need to book a hotel room for two nights. | MANUAL CHECK REQUIRED |
| 22 | free-trial-022 | I ordered a product but it hasn't arrived yet. | MANUAL CHECK REQUIRED |
| 23 | free-trial-023 | I'll call you back in five minutes. | MANUAL CHECK REQUIRED |
| 24 | free-trial-024 | I have a meeting at 10 AM tomorrow. | MANUAL CHECK REQUIRED |
| 25 | free-trial-025 | Nice to meet you! | MANUAL CHECK REQUIRED |

Durations scale with text (2.1s–4.5s). No two trial files share bytes. **Still not a spoken-word match.**

---

## Every course / every lesson (sample)

157 lessons. For each lesson, first + middle + last sentence were sampled (**471** unique IDs).  
Every sample: file exists, unique hash, duration in a normal TTS band.

**Spoken status for all 471 samples: MANUAL CHECK REQUIRED.**

| Course | Lessons | Sentences | Audio files | Spoken check |
|---|---|---|---|---|
| free-trial | 1 | 25 | 25 | MANUAL CHECK REQUIRED |
| beginner | 29 | 725 | 725 | MANUAL CHECK REQUIRED |
| intermediate | 14 | 350 | 350 | MANUAL CHECK REQUIRED |
| advanced | 12 | 300 | 300 | MANUAL CHECK REQUIRED |
| daily-life | 18 | 475 | 475 | MANUAL CHECK REQUIRED |
| interview | 15 | 400 | 400 | MANUAL CHECK REQUIRED |
| corporate | 15 | 375 | 375 | MANUAL CHECK REQUIRED |
| business | 15 | 400 | 400 | MANUAL CHECK REQUIRED |
| travel | 11 | 300 | 300 | MANUAL CHECK REQUIRED |
| school | 12 | 325 | 325 | MANUAL CHECK REQUIRED |
| kids | 15 | 400 | 400 | MANUAL CHECK REQUIRED |

No audio was regenerated or replaced (nothing proven wrong).

---

## Guided TTS flow (code, not ears)

`listenThreeTimes` in `sunobolo/src/hooks/useSentenceAudio.ts` takes **one** `PracticeSentence` `{ id, courseId, english, hindi }` from the visible `cur` row.

Sequence (same object every step):

1. Play English MP3 for `cur.id` (TTS fallback = `cur.english`)
2. Speak `मतलब ${cur.hindi}`
3. Speak `मेरे साथ 3 बार रिपीट करो।`
4. Play `cur.english` three times with ~700ms pauses

The three repeats cannot switch sentence unless `stop()` bumps the generation token (Next / Prev / unmount).

**Code path: consistent. Spoken MP3 words: MANUAL CHECK REQUIRED.**

---

## Next / Previous / Replay / Refresh (code)

| Action | What happens | Spoken MP3 |
|---|---|---|
| Next | `stop()` then new `cur` (`sentences[idx+1]`) drives English, Hindi, audio URL | MANUAL CHECK REQUIRED |
| Previous | same with `idx-1` | MANUAL CHECK REQUIRED |
| Replay / Suno Dobara | `playOnce(cur.id, cur.courseId, cur.english)` | MANUAL CHECK REQUIRED |
| Refresh | lesson reloads; audio key is still `cur.id` | MANUAL CHECK REQUIRED |

Stale playback is cancelled via `genRef` + `speechSynthesis.cancel()`. That prevents *old clip continuing*; it does **not** prove the *new* clip says the new text.

---

## How to finish this for real

On a machine with Whisper (or any STT):

```bash
# example — do not run as “done” until transcripts exist
whisper sunobolo/public/audio/free-trial/free-trial-001.mp3 --language en --model small
# compare transcript to: "Good morning. How are you?"
```

Replace an MP3 **only** when the transcript disagrees with `english`.  
Generator already in repo: `sunobolo/scripts/bulk_gen_v2.py` (`en-IN-NeerjaNeural`, text from `content.ts`).

---

## Summary

| Claim | Status |
|---|---|
| Filename matches sentence ID | Yes (4075/4075) |
| No two sentences share the same file bytes | Yes |
| Durations look like normal TTS for that text length | Yes |
| **Spoken English == visible English** | **NOT verified — MANUAL CHECK REQUIRED** |
| Guided 3× repeats use the current sentence object | Yes (code) |
| Audio files replaced in this pass | **None** (no spoken FAIL) |
