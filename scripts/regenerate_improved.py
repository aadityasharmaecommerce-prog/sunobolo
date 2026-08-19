#!/usr/bin/env python3
"""
SunoBolo — improved audio regeneration with better quality settings.

Key improvements:
1. Slower speech rate (-18%) for clearer pronunciation
2. Higher bitrate (64kbps) for better audio quality
3. Better silence trimming
4. Expressive voice for natural, friendly tone

Voice: hi-IN-SwaraNeural (bilingual - reads both English AND Hindi)
Rate: -18% (slower, clearer, more patient teacher-like)
"""

import asyncio
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

VOICE = "hi-IN-SwaraNeural"
SPEECH_RATE = "-18%"
BASE = Path(__file__).resolve().parent.parent
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
            continue
        if eng_c:
            seen[sid] = (course, eng_c, hin_c)
    return [
        {"id": sid, "courseId": course, "english": eng, "hindi": hin}
        for sid, (course, eng, hin) in seen.items()
    ]


def has_ffmpeg() -> bool:
    return shutil.which("ffmpeg") is not None


def reencode_better(src: Path) -> bool:
    if not has_ffmpeg():
        return False
    tmp = src.with_suffix(".tmp.mp3")
    af = (
        "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-40dB"
        ",areverse"
        ",silenceremove=start_periods=1:start_duration=0.05:start_threshold=-40dB"
        ",areverse"
    )
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(src),
        "-af", af,
        "-codec:a", "libmp3lame", "-b:a", "64k",
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


async def gen_one(sem: asyncio.Semaphore, text: str, target: Path, counters: dict) -> bool:
    async with sem:
        target.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(4):
            try:
                comm = __import__("edge_tts").Communicate(
                    text, VOICE, rate=SPEECH_RATE
                )
                await comm.save(str(target))
                if target.stat().st_size > 300:
                    reencode_better(target)
                    counters["done"] += 1
                    if counters["done"] % 200 == 0:
                        print(f"  ... {counters['done']}/{counters['total']}")
                    return True
            except Exception as e:
                print(f"  retry {attempt+1}: {type(e).__name__}")
                await asyncio.sleep(1.5 * (attempt + 1))
        counters["failed"] += 1
        return False


async def generate(jobs: list[tuple[str, Path]]) -> tuple[int, int]:
    counters = {"done": 0, "failed": 0, "total": len(jobs)}
    sem = asyncio.Semaphore(16)
    print(f"Generating {len(jobs)} files with voice={VOICE}, rate={SPEECH_RATE} ...")
    results = await asyncio.gather(
        *[gen_one(sem, text, target, counters) for text, target in jobs]
    )
    failed_jobs = [job for job, ok in zip(jobs, results) if not ok]
    if failed_jobs:
        print(f"Retrying {len(failed_jobs)} failed files ...")
        for text, target in failed_jobs:
            await gen_one(sem, text, target, counters)
    return counters["done"], counters["failed"]


def main():
    args = set(sys.argv[1:])
    limit = None
    if "--limit" in args:
        i = sys.argv.index("--limit")
        limit = int(sys.argv[i + 1])
    skip_english = "--skip-english" in args
    skip_hindi = "--skip-hindi" in args
    skip_instruction = "--skip-instruction" in args

    sentences = parse_sentences()
    if limit:
        sentences = sentences[:limit]
    print(f"Sentences: {len(sentences)}")

    jobs: list[tuple[str, Path]] = []

    if not skip_english:
        for s in sentences:
            target = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
            jobs.append((s["english"], target))

    if not skip_hindi:
        for s in sentences:
            if not s["hindi"]:
                continue
            target = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
            jobs.append((f"{HINDI_PREFIX} {s['hindi']}", target))

    if not skip_instruction:
        jobs.append((INSTRUCTION_TEXT, INSTRUCTION_PATH))

    start = time.time()
    done, failed = asyncio.run(generate(jobs))
    print(f"\nDone in {time.time() - start:.0f}s: {done} generated, {failed} failed")
    if failed:
        sys.exit(1)
    print("✅ All audio regenerated with improved quality")


if __name__ == "__main__":
    main()
