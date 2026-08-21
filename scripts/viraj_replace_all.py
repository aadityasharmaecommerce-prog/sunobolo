#!/usr/bin/env python3
"""
SunoBolo — Replace ALL audio with ElevenLabs Viraj voice.

This script:
1. Parses ALL sentences from content.ts
2. Generates English + Hindi MP3 for EVERY sentence using ElevenLabs Viraj
3. Overwrites existing files (replaces normal AI voice with Viraj)
4. Tracks progress in state file for resume capability
5. No duplicates — each sentence processed exactly once

Voice: ElevenLabs Viraj (JBFqnCBsd6RMkjVDRZzb)
Model: eleven_multilingual_v2 (supports both English and Hindi)

Usage:
  python3 scripts/viraj_replace_all.py                    # full regeneration
  python3 scripts/viraj_replace_all.py --limit 10         # quick test
  python3 scripts/viraj_replace_all.py --course beginner  # specific course only
  python3 scripts/viraj_replace_all.py --reset            # reset state, start fresh
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# ── Configuration ──
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "sk_97f8f6beb41ec989934d9664ae16e860ebed5d62f506e259")
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # Viraj voice
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.35}

BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
STATE_FILE = BASE / "scripts" / "viraj_replace_state.json"
LOG_FILE = BASE / "scripts" / "viraj_replace_log.txt"

# Rate limiting
DELAY_BETWEEN_CALLS = 0.4  # seconds
MAX_RETRIES = 3
RETRY_DELAY = 5
SAVE_EVERY = 20  # save state every N sentences

# ── Parse content.ts ──
SENTENCE_RE = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",'
    r'\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)"',
    r',\s*"hindi":\s*"((?:[^"\\]|\\.)*)"',
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
    """Parse all sentences from content.ts."""
    text = CONTENT_TS.read_text(encoding="utf-8")
    seen: dict[str, tuple] = {}
    for m in SENTENCE_RE.finditer(text):
        sid, course, eng, hin = m.groups()
        eng_c, hin_c = unescape(eng), unescape(hin)
        if sid in seen:
            continue  # dedupe by id
        if eng_c:
            seen[sid] = (course, eng_c, hin_c)
    return [
        {"id": sid, "courseId": course, "english": eng, "hindi": hin}
        for sid, (course, eng, hin) in seen.items()
    ]


# ── State management ──
def load_state() -> dict:
    if STATE_FILE.exists():
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"completed": [], "errors": [], "skipped": 0, "total_api_calls": 0}


def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# ── ElevenLabs TTS ──
def tts(text: str, output_path: str) -> int:
    """Generate speech from text using ElevenLabs API. Returns file size."""
    payload = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": VOICE_SETTINGS,
    }).encode()

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
                data=payload,
                headers={
                    "xi-api-key": API_KEY,
                    "Content-Type": "application/json",
                },
            )
            resp = urllib.request.urlopen(req, timeout=30)
            with open(output_path, "wb") as f:
                f.write(resp.read())
            return os.path.getsize(output_path)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = RETRY_DELAY * (attempt + 1)
                print(f"    ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif e.code == 401:
                body = e.read().decode()[:200]
                print(f"    ❌ API key error: {body}")
                raise
            else:
                body = e.read().decode()[:200]
                print(f"    ⚠️  HTTP {e.code}: {body}")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            print(f"    ⚠️  Error: {e}")
            time.sleep(RETRY_DELAY)
    raise Exception(f"Failed after {MAX_RETRIES} retries")


def log(msg: str):
    """Print and append to log file."""
    print(msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")


# ── Main ──
def main():
    import argparse
    parser = argparse.ArgumentParser(description="Replace all audio with ElevenLabs Viraj voice")
    parser.add_argument("--limit", type=int, default=0, help="Max sentences to process (0=all)")
    parser.add_argument("--course", type=str, default="", help="Process only this course")
    parser.add_argument("--reset", action="store_true", help="Reset state and start fresh")
    parser.add_argument("--skip-existing", action="store_true", help="Skip sentences that already have both EN+HI audio")
    args = parser.parse_args()

    if args.reset:
        if STATE_FILE.exists():
            STATE_FILE.unlink()
        print("🔄 State reset. Starting fresh.")
        return

    # Clear log
    LOG_FILE.write_text("")

    log("=" * 60)
    log("🎙️ SunoBolo — Viraj Voice Replacement")
    log(f"Voice: {VOICE_ID} (ElevenLabs Viraj)")
    log(f"Model: {MODEL}")
    log("=" * 60)

    # Parse sentences
    log("\n📖 Parsing content.ts...")
    sentences = parse_sentences()
    log(f"   Total sentences: {len(sentences)}")

    # Filter by course if specified
    if args.course:
        sentences = [s for s in sentences if s["courseId"] == args.course]
        log(f"   Filtered to course '{args.course}': {len(sentences)} sentences")

    # Skip free-trial (already done)
    # sentences = [s for s in sentences if not s["id"].startswith("free-trial-")]

    # Load state
    state = load_state()
    done_set = set(state["completed"])

    # Find what needs to be done
    todo = []
    skipped = 0
    for s in sentences:
        if s["id"] in done_set:
            skipped += 1
            continue
        if args.skip_existing:
            en_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
            hi_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
            if en_path.exists() and hi_path.exists():
                skipped += 1
                continue
        todo.append(s)

    log(f"   Already completed: {skipped}")
    log(f"   To generate: {len(todo)}")

    if args.limit > 0:
        todo = todo[:args.limit]
        log(f"   Limited to: {len(todo)} (test mode)")

    if not todo:
        log("\n✅ All sentences already processed! Nothing to do.")
        return

    # Generate audio
    log(f"\n🚀 Starting generation...")
    log(f"   Estimated time: ~{len(todo) * (DELAY_BETWEEN_CALLS + 1) / 60:.0f} minutes")
    log("")

    success = 0
    errors = 0
    start_time = time.time()

    for i, s in enumerate(todo):
        cid = s["courseId"]
        sid = s["id"]

        out_dir = AUDIO_BASE / cid
        out_dir.mkdir(parents=True, exist_ok=True)

        en_path = out_dir / f"{sid}.mp3"
        hi_path = out_dir / f"{sid}.hindi.mp3"

        elapsed = time.time() - start_time
        rate = success / (elapsed / 60) if elapsed > 0 and success > 0 else 0
        eta = (len(todo) - i) / rate if rate > 0 else 0

        log(f"[{i+1}/{len(todo)}] {cid}/{sid} (✓{success} ✗{errors} ETA:{eta:.0f}min)")

        try:
            # Generate English audio
            size_en = tts(s["english"], str(en_path))
            log(f"  EN: {size_en:,} bytes — \"{s['english'][:60]}...\"")
            time.sleep(DELAY_BETWEEN_CALLS)

            # Generate Hindi audio (with मतलब prefix)
            hindi_text = f"मतलब {s['hindi']}"
            size_hi = tts(hindi_text, str(hi_path))
            log(f"  HI: {size_hi:,} bytes — \"{hindi_text[:60]}...\"")
            time.sleep(DELAY_BETWEEN_CALLS)

            # Mark complete
            state["completed"].append(sid)
            state["total_api_calls"] = state.get("total_api_calls", 0) + 2
            success += 1

            # Save progress periodically
            if success % SAVE_EVERY == 0:
                save_state(state)
                elapsed = time.time() - start_time
                log(f"  💾 Saved progress: {success}/{len(todo)} done ({elapsed/60:.1f} min)")

        except Exception as e:
            log(f"  ❌ FAILED: {e}")
            state["errors"].append({"id": sid, "error": str(e)[:200]})
            errors += 1

    # Final save
    save_state(state)

    elapsed = time.time() - start_time
    log("\n" + "=" * 60)
    log("📊 GENERATION COMPLETE")
    log(f"   ✅ Success: {success}")
    log(f"   ❌ Errors: {errors}")
    log(f"   ⏱️  Time: {elapsed/60:.1f} minutes")
    log(f"   📞 API calls: {state.get('total_api_calls', 0)}")
    log(f"   📁 Audio files in: {AUDIO_BASE}")
    log("=" * 60)

    if errors > 0:
        log(f"\n⚠️  {errors} sentences failed. Run again to retry them.")


if __name__ == "__main__":
    main()
