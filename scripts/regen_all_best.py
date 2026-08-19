#!/usr/bin/env python3
"""Regenerate ALL sentences with best free voice settings for natural, friendly quality."""

import asyncio
import re
import sys
from pathlib import Path

VOICE = "hi-IN-SwaraNeural"
RATE = "-20%"  # Slower for natural, friendly pace
BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
INSTRUCTION_PATH = AUDIO_BASE / "shared" / "repeat-instruction.mp3"
INSTRUCTION_TEXT = "mere saath teen baar repeat karo."
HINDI_PREFIX = "matalab"

SENTENCE_RE = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",'
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
        sid, course, eng, hin = m.groups()
        if sid not in seen:
            seen[sid] = (course, unescape(eng), unescape(hin))
    return [(sid, course, eng, hin) for sid, (course, eng, hin) in seen.items()]


async def main():
    sentences = parse()
    print(f"Total sentences: {len(sentences)}")
    print(f"Voice: {VOICE}, Rate: {RATE}")
    print(f"Generating {len(sentences) * 2 + 1} files...\n")

    done = 0
    failed = 0

    for sid, course, eng, hin in sentences:
        try:
            # English - SAME voice, natural pace
            c = edge_tts.Communicate(eng, VOICE, rate=RATE)
            await c.save(str(AUDIO_BASE / course / f"{sid}.mp3"))

            # Hindi - SAME voice, natural pace
            if hin:
                c2 = edge_tts.Communicate(f"{HINDI_PREFIX} {hin}", VOICE, rate=RATE)
                await c2.save(str(AUDIO_BASE / course / f"{sid}.hindi.mp3"))

            done += 1
            if done % 500 == 0:
                print(f"  ... {done}/{len(sentences)} sentences done")

        except Exception as e:
            failed += 1
            print(f"  FAILED: {sid}: {e}")

    # Instruction - SAME voice
    try:
        c3 = edge_tts.Communicate(INSTRUCTION_TEXT, VOICE, rate=RATE)
        await c3.save(str(INSTRUCTION_PATH))
        print(f"  instruction done")
    except Exception as e:
        print(f"  FAILED instruction: {e}")

    print(f"\nDone: {done} sentences, {failed} failed")
    print(f"Total files: {done * 2 + 1}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    import edge_tts
    asyncio.run(main())
