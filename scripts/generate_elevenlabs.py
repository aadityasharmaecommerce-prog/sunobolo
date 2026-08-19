#!/usr/bin/env python3
"""
SunoBolo — regenerate ALL practice audio with ElevenLabs (human-like quality).

Voice: ElevenLabs multilingual v2 (best quality, natural Indian English accent)
       Supports both English AND Hindi in the same voice.

Requirements:
  pip install requests

Usage:
  export ELEVENLABS_API_KEY="your-api-key-here"
  python3 scripts/generate_elevenlabs.py                 # full regeneration
  python3 scripts/generate_elevenlabs.py --limit 10      # quick smoke test
  python3 scripts/generate_elevenlabs.py --skip-english  # only Hindi + instruction
  python3 scripts/generate_elevenlabs.py --voice "Rachel" # use specific voice

Output:
  public/audio/<courseId>/<id>.mp3          English sentence
  public/audio/<courseId>/<id>.hindi.mp3    "मतलब <hindi meaning>"
  public/audio/shared/repeat-instruction.mp3  "मेरे साथ 3 बार रिपीट करो।"

ElevenLabs API: https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
"""

import asyncio
import os
import re
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

# ── Configuration ──
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
INSTRUCTION_PATH = AUDIO_BASE / "shared" / "repeat-instruction.mp3"
INSTRUCTION_TEXT = "मेरे साथ 3 बार रिपीट करो।"
HINDI_PREFIX = "मतलब"

# Default voice — Rachel is natural, friendly, clear
DEFAULT_VOICE = "Rachel"
# Alternative good voices: "Bella", "Elli", "Josh", "Arnold", "Adam"

API_BASE = "https://api.elevenlabs.io/v1"

SENTENCE_RE = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",'
    r'\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)"',
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


def get_voice_id(name: str) -> str:
    """Get voice ID by name from ElevenLabs API."""
    headers = {"xi-api-key": API_KEY}
    res = requests.get(f"{API_BASE}/voices", headers=headers)
    res.raise_for_status()
    voices = res.json().get("voices", [])
    for v in voices:
        if v.get("name", "").lower() == name.lower():
            return v["voice_id"]
    # Fallback to first voice
    if voices:
        print(f"  Voice '{name}' not found, using '{voices[0]['name']}'")
        return voices[0]["voice_id"]
    raise ValueError("No voices found in ElevenLabs account")


def generate_tts(text: str, voice_id: str, output_path: Path, model: str = "eleven_multilingual_v2") -> bool:
    """Generate TTS audio using ElevenLabs API."""
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.3,
            "use_speaker_boost": True,
        },
    }
    try:
        res = requests.post(
            f"{API_BASE}/text-to-speech/{voice_id}",
            headers=headers,
            json=payload,
            timeout=60,
        )
        if res.status_code == 200 and len(res.content) > 300:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(res.content)
            return True
        else:
            print(f"  API error {res.status_code}: {res.text[:100]}")
            return False
    except Exception as e:
        print(f"  Exception: {type(e).__name__}: {str(e)[:80]}")
        return False


def main():
    if not API_KEY:
        print("ERROR: Set ELEVENLABS_API_KEY environment variable")
        print("  export ELEVENLABS_API_KEY='your-key-here'")
        print("  Get key at: https://elevenlabs.io/app/settings/api-keys")
        sys.exit(1)

    args = set(sys.argv[1:])
    limit = None
    if "--limit" in args:
        i = sys.argv.index("--limit")
        limit = int(sys.argv[i + 1])
    skip_english = "--skip-english" in args
    skip_hindi = "--skip-hindi" in args
    skip_instruction = "--skip-instruction" in args
    voice_name = DEFAULT_VOICE
    if "--voice" in args:
        i = sys.argv.index("--voice")
        voice_name = sys.argv[i + 1]

    print(f"🎙️ ElevenLabs Audio Generator")
    print(f"  Voice: {voice_name}")
    print(f"  Model: eleven_multilingual_v2")

    # Get voice ID
    voice_id = get_voice_id(voice_name)
    print(f"  Voice ID: {voice_id}")

    sentences = parse_sentences()
    if limit:
        sentences = sentences[:limit]
    print(f"  Sentences: {len(sentences)}")

    # Build jobs
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

    print(f"  Total files: {len(jobs)}")
    print(f"  Estimated credits: ~{sum(len(t) for t, _ in jobs)}")
    print()

    start = time.time()
    done = 0
    failed = 0

    for i, (text, target) in enumerate(jobs):
        ok = generate_tts(text, voice_id, target)
        if ok:
            done += 1
        else:
            failed += 1
        if (i + 1) % 100 == 0:
            elapsed = time.time() - start
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            eta = (len(jobs) - i - 1) / rate if rate > 0 else 0
            print(f"  ... {i + 1}/{len(jobs)} done ({done} ok, {failed} failed) — ETA: {eta:.0f}s")

    elapsed = time.time() - start
    print(f"\n✅ Done in {elapsed:.0f}s: {done} generated, {failed} failed")
    if failed:
        sys.exit(1)
    print(f"🎙️ All audio now uses ElevenLabs voice: {voice_name}")


if __name__ == "__main__":
    main()
