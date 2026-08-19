#!/usr/bin/env python3
"""
SunoBolo — regenerate ALL practice audio with ONE consistent voice.

Voice: hi-IN-SwaraNeural (Microsoft Azure neural via edge-tts)
       Female, native Hindi, natural Indian English (bilingual).

WHY: The old architecture used en-IN-NeerjaNeural MP3s for English and the
     browser's Hindi voice for meanings/instruction → two different teachers.
     Neerja cannot speak Hindi at all (no audio for Devanagari text).
     Swara speaks BOTH Hindi and English, so every part of the guided flow
     now comes from the SAME speaker.

Outputs (sentence→file mapping for English is UNCHANGED):
  public/audio/<courseId>/<id>.mp3          English sentence (overwritten)
  public/audio/<courseId>/<id>.hindi.mp3    "मतलब <hindi meaning>" (new)
  public/audio/shared/repeat-instruction.mp3  "मेरे साथ 3 बार रिपीट करो।" (new)

Usage:
  pip install edge-tts
  python3 scripts/regenerate_voice.py                 # full regeneration
  python3 scripts/regenerate_voice.py --skip-english  # only Hindi + instruction
  python3 scripts/regenerate_voice.py --limit 10      # quick smoke test

If `ffmpeg` is on PATH: leading/trailing silence is trimmed (internal sentence
pauses are preserved for learners) and files are re-encoded smaller —
English 40 kbps, Hindi + instruction 24 kbps. Without ffmpeg, audio stays at
48 kbps (still correct, just larger).
"""

import asyncio
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

VOICE = "hi-IN-SwaraNeural"  # ONE voice for the entire guided flow
BASE = Path(__file__).resolve().parent.parent          # sunobolo/ app root
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
INSTRUCTION_PATH = AUDIO_BASE / "shared" / "repeat-instruction.mp3"
INSTRUCTION_TEXT = "मेरे साथ 3 बार रिपीट करो।"
HINDI_PREFIX = "मतलब"

SENTENCE_RE = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",'
    r'\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)",'
    r'\s*"hindi":\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL,
)


def unescape(s: str) -> str:
    return (
        s.replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\", "\\")
        .replace("\\n", "\n")
        .strip()
    )


def parse_sentences() -> list[dict]:
    text = CONTENT_TS.read_text(encoding="utf-8")
    seen: dict[str, tuple] = {}
    for m in SENTENCE_RE.finditer(text):
        sid, course, eng, hin = m.groups()
        eng_c, hin_c = unescape(eng), unescape(hin)
        if sid in seen:
            continue  # content.ts duplicates lessons inside modules; dedupe by id
        if eng_c:
            seen[sid] = (course, eng_c, hin_c)
    return [
        {"id": sid, "courseId": course, "english": eng, "hindi": hin}
        for sid, (course, eng, hin) in seen.items()
    ]


def has_ffmpeg() -> bool:
    return shutil.which("ffmpeg") is not None


def reencode_smaller(src: Path, bitrate: str) -> bool:
    """Trim leading/trailing silence only (internal sentence pauses are
    PRESERVED for learners) and re-encode to a smaller bitrate.

    The double-areverse trick trims silence from both ends without touching
    pauses in the middle. `stop_periods=-1` must NOT be used: it collapses
    internal sentence pauses (verified: 1.05s pause -> 0.15s).
    """
    if not has_ffmpeg():
        return False
    tmp = src.with_suffix(".tmp.mp3")
    af = (
        "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB"
        ",areverse"
        ",silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB"
        ",areverse"
    )
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(src),
        "-af", af,
        "-codec:a", "libmp3lame", "-b:a", bitrate,
        "-ar", "24000", "-ac", "1",
        str(tmp),
    ]
    try:
        subprocess.run(cmd, check=True, timeout=60)
        if tmp.exists() and tmp.stat().st_size > 300:
            tmp.replace(src)
            return True
    except Exception:
        pass
    finally:
        if tmp.exists():
            tmp.unlink(missing_ok=True)
    return False


async def gen_one(
    sem: asyncio.Semaphore,
    text: str,
    target: Path,
    bitrate: str,
    counters: dict,
) -> bool:
    async with sem:
        target.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(4):
            try:
                comm = __import__("edge_tts").Communicate(text, VOICE)
                await comm.save(str(target))
                if target.stat().st_size > 300:
                    reencode_smaller(target, bitrate)
                    counters["done"] += 1
                    if counters["done"] % 500 == 0:
                        print(f"  ... {counters['done']}/{counters['total']} files done")
                    return True
            except Exception as e:
                print(f"  retry {attempt+1} for {target.name}: {type(e).__name__} {str(e)[:80]}")
                await asyncio.sleep(1.5 * (attempt + 1))
        counters["failed"] += 1
        print(f"  FAILED: {target.relative_to(AUDIO_BASE)}")
        return False


async def generate(jobs: list[tuple[str, Path, str]]) -> tuple[int, int]:
    counters = {"done": 0, "failed": 0, "total": len(jobs)}
    sem = asyncio.Semaphore(32)
    print(f"Generating {len(jobs)} files with voice={VOICE} ...")
    results = await asyncio.gather(
        *[gen_one(sem, text, target, bitrate, counters) for text, target, bitrate in jobs]
    )
    # One retry pass for failures (helps with transient rate limits)
    failed_jobs = [job for job, ok in zip(jobs, results) if not ok]
    if failed_jobs:
        print(f"Retrying {len(failed_jobs)} failed files sequentially ...")
        for text, target, bitrate in failed_jobs:
            await gen_one(sem, text, target, bitrate, counters)
    return counters["done"], counters["failed"]


def main() -> None:
    args = set(sys.argv[1:])
    limit = None
    if "--limit" in args:
        i = sys.argv.index("--limit")
        limit = int(sys.argv[i + 1])
        args.discard("--limit")
    skip_english = "--skip-english" in args
    skip_hindi = "--skip-hindi" in args
    skip_instruction = "--skip-instruction" in args

    sentences = parse_sentences()
    if limit:
        sentences = sentences[:limit]
    print(f"Sentences: {len(sentences)}")

    jobs: list[tuple[str, Path, str]] = []

    if not skip_english:
        for s in sentences:
            target = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
            jobs.append((s["english"], target, "40k"))

    if not skip_hindi:
        for s in sentences:
            if not s["hindi"]:
                continue
            target = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
            jobs.append((f"{HINDI_PREFIX} {s['hindi']}", target, "24k"))

    if not skip_instruction:
        jobs.append((INSTRUCTION_TEXT, INSTRUCTION_PATH, "24k"))

    start = time.time()
    done, failed = asyncio.run(generate(jobs))
    print(f"\nDone in {time.time() - start:.0f}s: {done} generated, {failed} failed")
    if failed:
        sys.exit(1)
    print("✅ All audio is now ONE voice:", VOICE)


if __name__ == "__main__":
    main()
