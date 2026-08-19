#!/usr/bin/env python3
"""Regenerate 25 free trial sentences with SAME voice for English + Hindi, NO truncation."""

import asyncio
import re
import sys
from pathlib import Path

VOICE = "hi-IN-SwaraNeural"
RATE = "-15%"
BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio" / "free-trial"
INSTRUCTION_PATH = BASE / "public" / "audio" / "shared" / "repeat-instruction.mp3"

SENTENCE_RE = re.compile(
    r'"id":\s*"(free-trial-\d+)",\s*"courseId":\s*"free-trial",'
    r'\s*"lessonId":\s*"[^"]+",\s*"order":\s*\d+,'
    r'\s*"english":\s*"((?:[^"\\]|\\.)*)",'
    r'\s*"hindi":\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL,
)


def unescape(s):
    return s.replace('\\"', '"').replace("\\'", "'").replace("\\\\", "\\").strip()


def parse():
    text = CONTENT_TS.read_text(encoding="utf-8")
    seen = {}
    for m in SENTENCE_RE.finditer(text):
        sid, eng, hin = m.groups()
        if sid not in seen:
            seen[sid] = (unescape(eng), unescape(hin))
    return [(sid, eng, hin) for sid, (eng, hin) in seen.items()]


async def main():
    sentences = parse()
    print(f"Found {len(sentences)} free-trial sentences")
    for sid, eng, hin in sentences[:3]:
        print(f"  {sid}: {eng[:60]}")

    for sid, eng, hin in sentences:
        # English - SAME voice, SAME rate, NO trimming
        c = edge_tts.Communicate(eng, VOICE, rate=RATE)
        await c.save(str(AUDIO_BASE / f"{sid}.mp3"))

        # Hindi - SAME voice, SAME rate
        c2 = edge_tts.Communicate(f"matalab {hin}", VOICE, rate=RATE)
        await c2.save(str(AUDIO_BASE / f"{sid}.hindi.mp3"))

        print(f"  done: {sid}")

    # Instruction - SAME voice
    c3 = edge_tts.Communicate("mere saath teen baar repeat karo.", VOICE, rate=RATE)
    await c3.save(str(INSTRUCTION_PATH))

    print(f"\nAll {len(sentences)} sentences regenerated - SAME voice for English + Hindi")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    import edge_tts
    asyncio.run(main())
