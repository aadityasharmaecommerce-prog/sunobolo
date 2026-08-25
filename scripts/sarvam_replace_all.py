#!/usr/bin/env python3
"""
SunoBolo — COMPLETE Sarvam AI Voice Replacement
=================================================
Replaces ALL audio files (English + Hindi) with Sarvam AI premium voice.
- Voice: shubh (Male, Indian, Natural)
- Model: bulbul:v3
- Removes ALL Viraj/ElevenLabs audio
- Regenerates shared/repeat-instruction.mp3

Usage:
  python sarvam_replace_all.py              # Only generate missing
  python sarvam_replace_all.py --force      # Replace ALL existing audio
  python sarvam_replace_all.py --dry-run    # Preview what would be done
"""
import re, os, sys, json, time, base64, urllib.request, urllib.error, argparse, io
from pathlib import Path

# Fix Windows console encoding for emoji output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Tee logger — writes to both console AND log file
class TeeLogger:
    def __init__(self, log_path):
        self.log_file = open(log_path, 'w', encoding='utf-8')
        self._builtin_print = __builtins__['print'] if isinstance(__builtins__, dict) else __builtins__.print
    def __call__(self, *args, **kwargs):
        self._builtin_print(*args, **kwargs)
        sep = kwargs.get('sep', ' ')
        end = kwargs.get('end', '\n')
        msg = sep.join(str(a) for a in args) + end
        self.log_file.write(msg)
        self.log_file.flush()

LOG_PATH = Path(__file__).resolve().parent / 'sarvam_output.log'
print = TeeLogger(LOG_PATH)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
# Add your API keys here — script rotates through them automatically
# When one key's credits run out (402), it switches to the next key
API_KEYS = [
    "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U",  # Key 4 (NEW)
    "sk_aypv66s0_kyF2lcPIL7tJR4vIeU08ukcw",  # Key 1
    "sk_759jdxj6_L0zU8eUf2uAmkGCLCvks2rtW",  # Key 2
    "sk_dj45kyhu_LDYi5ATUyWVREZVBbBP4f0Ve",  # Key 3
]

# Current active key index (persists across restarts via state file)
current_key_index = 0
def get_api_key():
    global current_key_index
    if current_key_index < len(API_KEYS):
        return API_KEYS[current_key_index]
    return None

def rotate_api_key():
    global current_key_index
    current_key_index += 1
    if current_key_index < len(API_KEYS):
        print(f"\n🔄 Switching to API key #{current_key_index + 1}...")
        return True
    return False

BASE_URL = "https://api.sarvam.ai/text-to-speech"
SPEAKER = "shubh"
MODEL = "bulbul:v3"
SAMPLE_RATE = 24000
PACE = 0.95  # Natural pace, not too fast
DELAY = 0.4  # Delay between API calls (rate limiting safety)
MAX_RETRIES = 4
RETRY_DELAY = 8
SAFETY_TIMEOUT = 60

BASE = Path(__file__).resolve().parent.parent
CONTENT_DIR = BASE / "src" / "data" / "content"
AUDIO_BASE = BASE / "public" / "audio"
STATE_FILE = BASE / "scripts" / "sarvam_replace_state.json"

REPEAT_INSTRUCTION_TEXT = "मेरे साथ 3 बार रिपीट करो।"
HINDI_PREFIX = "मतलब "
# ─── END CONFIG ───────────────────────────────────────────────────────────────


def unescape(s: str) -> str:
    """Properly unescape JSON string content without corrupting Unicode."""
    return (
        s.replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\", "\\")
        .replace("\\n", "\n")
        .strip()
    )


def parse_sentences():
    """Parse all sentences from content/*.ts files."""
    pattern = (
        r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
        r'"lessonId":\s*"([^"]+)".*?"english":\s*"((?:[^"\\]|\\.)*)".*?'
        r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
    )
    seen = set()
    sentences = []
    # Scan all .ts files in content/ directory (skip index.ts, types.ts)
    skip_files = {'index.ts', 'types.ts'}
    ts_files = sorted(CONTENT_DIR.glob('*.ts'))
    for ts_file in ts_files:
        if ts_file.name in skip_files:
            continue
        with open(ts_file, 'r', encoding='utf-8') as f:
            text = f.read()
        matches = re.findall(pattern, text, re.DOTALL)
        for sid, cid, lid, eng, hin in matches:
            if sid in seen:
                continue
            seen.add(sid)
            eng = unescape(eng)
            hin = unescape(hin)
            sentences.append({"id": sid, "courseId": cid, "lessonId": lid,
                              "english": eng, "hindi": hin})
    return sentences


def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"generated": [], "skipped": [], "errors": [], "stats": {}}


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def tts(text, lang_code, output_path):
    """Call Sarvam AI TTS API. Auto-rotates keys on 402 quota errors."""
    global current_key_index
    payload = {
        "inputs": [text],
        "model": MODEL,
        "language_code": lang_code,
        "speaker": SPEAKER,
        "pace": PACE,
        "output_audio_codec": "mp3",
        "speech_sample_rate": SAMPLE_RATE,
    }
    data = json.dumps(payload).encode()

    for attempt in range(MAX_RETRIES):
        api_key = get_api_key()
        if not api_key:
            raise Exception("ALL_API_KEYS_EXHAUSTED")

        try:
            req = urllib.request.Request(
                BASE_URL,
                data=data,
                headers={
                    "api-subscription-key": api_key,
                    "Content-Type": "application/json",
                },
            )
            resp = urllib.request.urlopen(req, timeout=SAFETY_TIMEOUT)
            result = json.loads(resp.read())

            if "audios" in result and result["audios"]:
                audio_bytes = base64.b64decode(result["audios"][0])
                with open(output_path, "wb") as f:
                    f.write(audio_bytes)
                return os.path.getsize(output_path)
            else:
                err = json.dumps(result)[:300]
                print(f"    Warning: No audio: {err}")
                time.sleep(RETRY_DELAY)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            if e.code == 429:
                wait = RETRY_DELAY * (attempt + 1) * 2
                print(f"    Rate limited (429), waiting {wait}s...")
                time.sleep(wait)
            elif e.code == 402:
                print(f"    Key #{current_key_index+1} credits exhausted (402)")
                if rotate_api_key():
                    attempt = 0
                    time.sleep(2)
                    continue
                else:
                    raise Exception("ALL_API_KEYS_EXHAUSTED")
            elif e.code in (401, 403):
                print(f"    Auth error ({e.code}): {body}")
                if rotate_api_key():
                    attempt = 0
                    continue
                raise
            else:
                print(f"    HTTP {e.code}: {body}")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            if "ALL_API_KEYS" in str(e):
                raise
            print(f"    Error: {e}")
            time.sleep(RETRY_DELAY)

    raise Exception(f"Failed after {MAX_RETRIES} retries for: {text[:50]}...")


def generate_instruction_mp3(force=False):
    """Generate shared/repeat-instruction.mp3 with Sarvam Hindi voice."""
    instruction_path = AUDIO_BASE / "shared" / "repeat-instruction.mp3"

    if instruction_path.exists() and not force:
        size = instruction_path.stat().st_size
        print(f"✅ Instruction audio exists ({size:,} bytes)")
        return True

    print("🎙️ Generating shared/repeat-instruction.mp3 ...")
    try:
        size = tts(REPEAT_INSTRUCTION_TEXT, "hi-IN", str(instruction_path))
        print(f"   ✅ Created: {size:,} bytes")
        time.sleep(DELAY)
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Sarvam AI Voice Replacement")
    parser.add_argument("--force", action="store_true",
                        help="Replace ALL existing audio (not just missing)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview what would be done without generating")
    parser.add_argument("--course", type=str, default=None,
                        help="Only process a specific courseId (e.g. 'beginner')")
    args = parser.parse_args()

    print("=" * 65)
    print("🎙️ SunoBolo — COMPLETE Sarvam AI Voice Replacement")
    print(f"   Voice: {SPEAKER} | Model: {MODEL} | Pace: {PACE}")
    print(f"   Mode: {'FORCE REPLACE' if args.force else 'Generate missing only'}")
    print(f"   API Keys: {len(API_KEYS)} (auto-rotate on 402)")
    if args.course:
        print(f"   Course filter: {args.course}")
    print("=" * 65)

    if not API_KEYS:
        print("❌ No API keys! Add keys to API_KEYS list in script.")
        sys.exit(1)

    # 1) Generate instruction audio
    if not args.dry_run:
        generate_instruction_mp3(force=args.force)
    else:
        inst_path = AUDIO_BASE / "shared" / "repeat-instruction.mp3"
        if not inst_path.exists():
            print(f"  [DRY] Would create: {inst_path}")

    # 2) Parse all sentences
    sentences = parse_sentences()
    print(f"\n📖 Total sentences in content.ts: {len(sentences)}")

    # 3) Filter by course if specified
    if args.course:
        sentences = [s for s in sentences if s["courseId"] == args.course]
        print(f"   Filtered to course '{args.course}': {len(sentences)} sentences")

    # 4) Determine what needs generation
    to_generate = []
    already_ok = 0

    for s in sentences:
        en_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
        hi_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
        has_en = en_path.exists()
        has_hi = hi_path.exists()

        if has_en and has_hi and not args.force:
            already_ok += 1
            continue

        to_generate.append(s)

    print(f"   ✅ Already have audio: {already_ok}")
    print(f"   🔄 Need generation: {len(to_generate)}")
    print(f"      (EN mp3 + HI mp3 per sentence = {len(to_generate)*2} API calls)")
    print()

    if not to_generate:
        print("🎉 Everything is already generated!")
        return

    # 5) Estimate API calls
    en_calls = sum(1 for s in to_generate)
    hi_calls = sum(1 for s in to_generate if s["hindi"])
    total_calls = en_calls + hi_calls
    est_minutes = (total_calls * (DELAY + 2)) / 60  # rough estimate
    print(f"   📊 Estimated API calls: {total_calls}")
    print(f"   ⏱️ Estimated time: ~{est_minutes:.0f} minutes")
    print()

    if args.dry_run:
        print("── DRY RUN — First 10 sentences that would be generated: ──")
        for s in to_generate[:10]:
            en_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
            hi_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
            en_exists = "✓" if en_path.exists() else "✗"
            hi_exists = "✓" if hi_path.exists() else "✗"
            print(f"  {s['courseId']}/{s['id']}  EN:{en_exists} HI:{hi_exists}")
            print(f"    EN: {s['english'][:60]}...")
            if s['hindi']:
                print(f"    HI: {s['hindi'][:60]}...")
        print(f"\n  ... and {max(0, len(to_generate)-10)} more sentences")
        print("   Run without --dry-run to generate.")
        return

    # 6) Generate!
    state = load_state()
    # Reset state for fresh run
    state["generated"] = []
    state["skipped"] = []
    state["errors"] = []
    total = len(to_generate)
    success = 0
    errors = 0
    start_time = time.time()

    for i, s in enumerate(to_generate):
        cid = s["courseId"]
        sid = s["id"]

        out_dir = AUDIO_BASE / cid
        out_dir.mkdir(parents=True, exist_ok=True)

        en_path = out_dir / f"{sid}.mp3"
        hi_path = out_dir / f"{sid}.hindi.mp3"

        print(f"  [{i+1}/{total}] {cid}/{sid}")

        try:
            # ── English audio ──
            en_text = s["english"]
            if en_text:
                size = tts(en_text, "en-IN", str(en_path))
                print(f"    EN: {size:,} bytes  ✓")
                time.sleep(DELAY)
            else:
                print(f"    EN: (empty text, skipped)")

            # ── Hindi audio ──
            if s["hindi"]:
                hi_text = f"{HINDI_PREFIX}{s['hindi']}"
                size = tts(hi_text, "hi-IN", str(hi_path))
                print(f"    HI: {size:,} bytes  ✓")
                time.sleep(DELAY)
            else:
                print(f"    HI: (no Hindi text, skipped)")

            state["generated"].append(sid)
            success += 1

            # Save progress every 10 sentences
            if success % 10 == 0:
                save_state(state)
                elapsed = time.time() - start_time
                rate = success / elapsed if elapsed > 0 else 0
                remaining = (total - i - 1) / rate if rate > 0 else 0
                print(f"    ── Progress: {success}/{total} | "
                      f"ETA: {remaining/60:.1f} min ──")

        except Exception as e:
            err_msg = str(e)[:300]
            print(f"    ❌ FAILED: {err_msg}")
            state["errors"].append({"id": sid, "courseId": cid, "error": err_msg})
            errors += 1

            # Stop only if ALL keys exhausted
            if "all api keys" in err_msg.lower():
                print("\n🛑 ALL API KEYS EXHAUSTED — stopping to save progress")
                print(f"   Generated so far: {success}")
                print(f"   Remaining: {total - i - 1}")
                save_state(state)
                break

    # 7) Summary
    save_state(state)
    elapsed = time.time() - start_time
    state["stats"] = {
        "total_sentences": len(sentences),
        "generated": success,
        "errors": errors,
        "elapsed_seconds": round(elapsed),
        "speaker": SPEAKER,
        "model": MODEL,
        "pace": PACE,
        "sample_rate": SAMPLE_RATE,
    }
    save_state(state)

    print(f"\n{'='*65}")
    print(f"✅ GENERATED: {success}")
    print(f"❌ ERRORS:    {errors}")
    print(f"⏭️ SKIPPED:   {already_ok}")
    print(f"⏱️ Time:      {elapsed/60:.1f} minutes")
    print(f"🎙️ Voice:     {SPEAKER} ({MODEL})")
    print(f"{'='*65}")

    if errors > 0:
        print(f"\n⚠️ {errors} sentences failed. Run again to retry.")
        print(f"   State saved to: {STATE_FILE}")


if __name__ == "__main__":
    main()
