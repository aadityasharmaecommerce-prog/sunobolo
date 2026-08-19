#!/usr/bin/env python3
"""Bulk audio generation with concurrency - generates 100s of MP3s in parallel.
Uses edge-tts with en-IN-NeerjaNeural voice (same as SkillShakti-style premium Indian English).
"""
import asyncio
import edge_tts
import json
import os
import re
import time
from pathlib import Path

AUDIO_BASE = Path("/home/user/sunobolo/public/audio")
VOICE = "en-IN-NeerjaNeural"  # Best premium Indian English female voice

# Parse content.ts
content = Path("/home/user/sunobolo/src/data/content.ts").read_text(encoding="utf-8")

# Extract sentences - dedupe by ID
pattern = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL
)
seen = set()
sentences = []
for m in pattern.finditer(content):
    sid, course, eng = m.groups()
    if sid in seen:
        continue
    seen.add(sid)
    eng_clean = eng.replace('\\"', '"').replace("\\'", "'").replace("\\\\", "\\").strip()
    if eng_clean and len(eng_clean) >= 2:
        sentences.append({"id": sid, "courseId": course, "english": eng_clean})

print(f"Total unique sentences: {len(sentences)}")

# Existing files
existing = set()
for p in AUDIO_BASE.rglob("*.mp3"):
    existing.add(str(p.relative_to(AUDIO_BASE)))

missing = [s for s in sentences if f"{s['courseId']}/{s['id']}.mp3" not in existing]
print(f"Missing: {len(missing)}")

if not missing:
    print("All audio exists!")
    exit(0)

# Generate with concurrency
async def gen_one(sem, sentence):
    async with sem:
        target = AUDIO_BASE / sentence["courseId"] / f"{sentence['id']}.mp3"
        if target.exists():
            return None
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            comm = edge_tts.Communicate(sentence["english"], VOICE)
            await comm.save(str(target))
            return sentence["id"]
        except Exception as e:
            print(f"  ERROR {sentence['id']}: {e}")
            return None

async def main():
    sem = asyncio.Semaphore(50)  # 50 concurrent
    tasks = [gen_one(sem, s) for s in missing]
    start = time.time()
    done = 0
    errors = 0
    for coro in asyncio.as_completed(tasks):
        result = await coro
        done += 1
        if result is None and done <= len(missing):
            errors += 1
        if done % 100 == 0:
            elapsed = time.time() - start
            rate = done / elapsed if elapsed > 0 else 0
            eta = (len(missing) - done) / rate if rate > 0 else 0
            print(f"  {done}/{len(missing)} done | {rate:.1f}/sec | ETA {eta/60:.1f}min")
    total = time.time() - start
    print(f"\nDONE: {done} in {total:.0f}s ({done/total:.1f}/sec)")
    print(f"Errors: {errors}")

asyncio.run(main())
