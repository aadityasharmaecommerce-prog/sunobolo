# 🎙️ SunoBolo — Audio Voice Audit Report

**Generated:** 2026-08-21

---

## 📊 Overview

| Metric | Count | % of Total |
|---|---|---|
| **Total sentences** | 1,948 | 100% |
| **Premium (Viraj/Sarvam)** | 566 | 29.1% |
| **Edge-TTS (simple AI)** | 1,016 | 52.2% |
| **Missing (no audio)** | 366 | 18.8% |

> ⚠️ **1,016 sentences** still use simple Edge-TTS voice.
> ⚠️ **366 sentences** have NO audio at all.

---

## 🔵 Premium Voice Breakdown

| Voice | Sentences |
|---|---|
| **Viraj (ElevenLabs George)** only | 179 |
| **Sarvam AI (Shubh)** only | 378 |
| **Both (overlap)** | 9 |
| **Total premium** | 566 |

### Premium by Course

| Course | Premium Sentences | Total Sentences | % Done |
|---|---|---|---|
| free-trial | 0 | 25 | 0% |
| beginner | 28 | 754 | 4% |
| intermediate | 124 | 364 | 34% |
| advanced | 289 | 312 | 93% |
| daily-life | 125 | 493 | 25% |

---

## 🟡 Edge-TTS (Needs Replacement)

| Course | Edge-TTS Count |
|---|---|
| advanced | 12 |
| beginner | 726 |
| daily-life | 15 |
| free-trial | 25 |
| intermediate | 238 |
| **Total** | **1,016** |

- With Hindi audio: 986
- English only (no Hindi): 30

---

## 🔴 Missing (No Audio At All)

| Course | Missing Count |
|---|---|
| advanced | 11 |
| daily-life | 353 |
| intermediate | 2 |
| **Total** | **366** |

---

## 📋 Action Plan

### Step 1: Recharge Sarvam AI Credits
- Sarvam API returns HTTP 402 — No credits available
- Need to add credits at https://dashboard.sarvam.ai
- Each sentence = ~60 characters (EN + HI)
- **1,382 sentences × ~60 chars = ~83,000 characters needed**

### Step 2: Generate Premium Audio for ALL Missing + Edge-TTS
- **366 missing sentences** → Generate both EN + HI
- **1,016 edge-tts sentences** → Regenerate with Sarvam to replace
- Use **Sarvam AI (Shubh voice)** for all
- API: bulbul:v3, Speaker: shubh

### Total Audio Generation Needed
- **1,382 sentences** to generate/replace
- **2,764 audio files** (EN + HI each)
- **Est. characters:** ~83,000

---

## 🎯 API Status

| API | Status | Notes |
|---|---|---|
| **ElevenLabs (Viraj)** | ❌ Expired | HTTP 401 — API key invalid |
| **Sarvam AI (Shubh)** | ❌ No credits | HTTP 402 — Insufficient quota |
| **Edge-TTS (Swara/Madhur)** | ✅ Free | Works but basic quality |

---

## 📁 File Locations

- Content: `src/data/content.ts`
- Voice config: `src/config/voiceConfig.ts`
- Audio files: `public/audio/<courseId>/<sentenceId>.mp3`
- Hindi audio: `public/audio/<courseId>/<sentenceId>.hindi.mp3`
- Viraj state: `scripts/viraj_gen_state.json`
- Sarvam state: `scripts/sarvam_gen_state.json`
- Viraj batch state: `scripts/viraj_batch_state.json`
