"""Regenerate audio for sentences whose Hindi was changed."""
import sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import json, base64, urllib.request, urllib.error, time, re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
CHANGES_LOG = BASE / "scripts" / "hindi_changes.json"

API_KEY = "sk_6vaspuhz_r3t0NExW40dlkX606rOiUegO"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
SPEAKER = "shubh"
MODEL = "bulbul:v3"
PACE = 0.95
DELAY = 0.5
MAX_RETRIES = 4
RETRY_DELAY = 8
HINDI_PREFIX = "मतलब "


def tts(text, lang_code, output_path):
    payload = {
        "inputs": [text],
        "model": MODEL,
        "language_code": lang_code,
        "speaker": SPEAKER,
        "pace": PACE,
        "output_audio_codec": "mp3",
        "speech_sample_rate": 24000,
    }
    data = json.dumps(payload).encode()
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                BASE_URL, data=data,
                headers={"api-subscription-key": API_KEY, "Content-Type": "application/json"}
            )
            resp = urllib.request.urlopen(req, timeout=60)
            result = json.loads(resp.read())
            if "audios" in result and result["audios"]:
                audio_bytes = base64.b64decode(result["audios"][0])
                with open(output_path, "wb") as f:
                    f.write(audio_bytes)
                return os.path.getsize(output_path)
            else:
                print(f"    No audio: {json.dumps(result)[:200]}")
                time.sleep(RETRY_DELAY)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:200]
            if e.code == 429:
                wait = RETRY_DELAY * (attempt + 1) * 2
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif e.code in (401, 403, 402):
                print(f"    Auth/Quota error ({e.code}): {body}")
                raise
            else:
                print(f"    HTTP {e.code}: {body}")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            print(f"    Error: {e}")
            time.sleep(RETRY_DELAY)
    raise Exception(f"Failed after {MAX_RETRIES} retries")


def unescape(s):
    return s.replace('\\"', '"').replace("\\'", "'").replace("\\n", "\n").strip()


def get_sentence_data(sentence_id):
    """Get english and hindi text for a sentence from content.ts."""
    with open(CONTENT_TS, "r", encoding="utf-8") as f:
        text = f.read()

    # Find the sentence by id
    id_pattern = f'"id":\\s*"{re.escape(sentence_id)}"'
    id_match = re.search(id_pattern, text)
    if not id_match:
        return None

    start = id_match.start()
    block = text[start:start+2000]

    eng_match = re.search(r'"english":\s*"((?:[^"\\]|\\.)*)"', block)
    hin_match = re.search(r'"hindi":\s*"((?:[^"\\]|\\.)*)"', block)

    if eng_match and hin_match:
        return {
            "english": unescape(eng_match.group(1)),
            "hindi": unescape(hin_match.group(1))
        }
    return None


import os

def main():
    print("=" * 60)
    print("Regenerate Audio for Changed Hindi Sentences")
    print("=" * 60)

    # Load changes log
    if not CHANGES_LOG.exists():
        print("No changes log found!")
        return

    with open(CHANGES_LOG, "r", encoding="utf-8") as f:
        changes = json.load(f)

    print(f"Total changed sentences: {len(changes)}")
    print()

    success = 0
    errors = 0

    for i, change in enumerate(changes, 1):
        sid = change["id"]
        new_hindi = change["new_hindi"]

        # Get sentence data
        data = get_sentence_data(sid)
        if not data:
            print(f"  [{i}/{len(changes)}] {sid} - SKIP (not found)")
            continue

        # Determine courseId from id
        if sid.startswith("advanced"):
            cid = "advanced"
        elif sid.startswith("beginner"):
            cid = "beginner"
        elif sid.startswith("intermediate"):
            cid = "intermediate"
        elif sid.startswith("business"):
            cid = "business"
        elif sid.startswith("corporate"):
            cid = "corporate"
        elif sid.startswith("daily-life"):
            cid = "daily-life"
        elif sid.startswith("free-trial"):
            cid = "free-trial"
        elif sid.startswith("interview"):
            cid = "interview"
        else:
            cid = sid.split("-")[0]

        out_dir = AUDIO_BASE / cid
        out_dir.mkdir(parents=True, exist_ok=True)

        hi_path = out_dir / f"{sid}.hindi.mp3"

        print(f"  [{i}/{len(changes)}] {cid}/{sid}")
        print(f"    HI: {data['hindi'][:60]}...")

        try:
            # Regenerate Hindi audio with new simplified text
            hi_text = f"{HINDI_PREFIX}{data['hindi']}"
            size = tts(hi_text, "hi-IN", str(hi_path))
            print(f"    OK: {size:,} bytes")
            time.sleep(DELAY)
            success += 1
        except Exception as e:
            print(f"    FAILED: {str(e)[:200]}")
            errors += 1
            if "quota" in str(e).lower() or "credit" in str(e).lower():
                print("\nQuota exhausted! Stopping.")
                break

    print(f"\n{'='*60}")
    print(f"SUCCESS: {success}")
    print(f"ERRORS:  {errors}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
