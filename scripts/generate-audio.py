#!/usr/bin/env python3
"""Generate the SunoBolo voice pack: one MP3 per sentence (en-IN-NeerjaNeural).

Usage:
  npx tsx scripts/export-sentences.mts > /tmp/sb-sentences.json
  python scripts/generate-audio.py /tmp/sb-sentences.json audio/
"""
import asyncio
import json
import os
import sys
import edge_tts

VOICE = "en-IN-NeerjaNeural"
RATE = "-8%"  # slightly slower = clearer for learners
OUT_DIR = sys.argv[2] if len(sys.argv) > 2 else "audio"
RATE_LIMIT_GAP = 0.15  # seconds between requests to avoid throttling


async def generate_one(sentence_id: str, text: str, sem: asyncio.Semaphore):
    path = os.path.join(OUT_DIR, f"{sentence_id}.mp3")
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return "skip", sentence_id
    async with sem:
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
        await communicate.save(path)
        await asyncio.sleep(RATE_LIMIT_GAP)
    return "gen", sentence_id


async def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        sentences = json.load(f)
    os.makedirs(OUT_DIR, exist_ok=True)
    sem = asyncio.Semaphore(3)
    ok = fail = skipped = 0
    for i in range(0, len(sentences), 20):
        batch = sentences[i : i + 20]
        results = await asyncio.gather(
            *[generate_one(s["id"], s["english"], sem) for s in batch],
            return_exceptions=True,
        )
        for r in results:
            if isinstance(r, Exception):
                fail += 1
                print(f"FAIL {r}", flush=True)
            elif r[0] == "gen":
                ok += 1
            else:
                skipped += 1
        print(f"progress {min(i + 20, len(sentences))}/{len(sentences)} (ok={ok} skip={skipped} fail={fail})", flush=True)
    print(f"DONE ok={ok} skipped={skipped} fail={fail}")


if __name__ == "__main__":
    asyncio.run(main())
