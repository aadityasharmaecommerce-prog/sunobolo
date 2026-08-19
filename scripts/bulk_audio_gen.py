#!/usr/bin/env python3
"""Bulk audio generation script using edge-tts.
Generates MP3 files for ALL sentences in SunoBolo English using en-IN-NeerjaNeural voice.
"""
import asyncio
import edge_tts
import json
import os
import re
import sys
import time

# Parse content.ts to extract sentences
content_path = "/home/user/sunobolo/src/data/content.ts"
with open(content_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract all sentences using regex - looking for "id": "...", "english": "...", "hindi": "..."
# Match: "id": "xxx-001", ... "english": "...", ... "hindi": "..."
pattern = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)",\s*"hindi":\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL
)

sentences = []
for m in pattern.finditer(content):
    sid, course, eng, hin = m.groups()
    # Unescape JSON strings
    eng_clean = eng.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ").replace("\\\\", "\\")
    hin_clean = hin.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ").replace("\\\\", "\\")
    # Skip if English is empty or just punctuation
    if not eng_clean.strip() or len(eng_clean.strip()) < 2:
        continue
    sentences.append({
        "id": sid,
        "courseId": course,
        "english": eng_clean,
        "hindi": hin_clean,
    })

print(f"Total sentences found: {len(sentences)}")
# Group by course
by_course = {}
for s in sentences:
    by_course.setdefault(s["courseId"], []).append(s)
for c, lst in sorted(by_course.items()):
    print(f"  {c}: {len(lst)}")

# Audio directory base
audio_base = "/home/user/sunobolo/public/audio"

# Get list of already-generated audio files
existing = set()
for root, dirs, files in os.walk(audio_base):
    for f in files:
        if f.endswith(".mp3"):
            rel = os.path.relpath(os.path.join(root, f), audio_base)
            existing.add(rel)

print(f"\nExisting audio files: {len(existing)}")

# Find missing
missing = []
for s in sentences:
    rel = f"{s['courseId']}/{s['id']}.mp3"
    if rel not in existing:
        missing.append(s)
print(f"Missing audio files: {len(missing)}")

# Show first few
print("\nFirst 5 missing sentences:")
for s in missing[:5]:
    print(f"  {s['courseId']}/{s['id']}: {s['english'][:60]}...")

# Save list to JSON for processing
with open("/home/user/sunobolo/scripts/missing_sentences.json", "w", encoding="utf-8") as f:
    json.dump(missing, f, ensure_ascii=False, indent=2)
print(f"\nMissing sentences saved to missing_sentences.json")
print(f"Total to generate: {len(missing)}")
