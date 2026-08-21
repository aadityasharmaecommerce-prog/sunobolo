#!/usr/bin/env python3
"""
SunoBolo — Generate Viraj (ElevenLabs George) voice for ALL missing sentences.
SKIPs any sentence where BOTH English + Hindi audio already exist.
Resume-safe: checks file existence before every generate call.

Voice: JBFqnCBsd6RMkjVDRZzb (George — Warm, British, Distinguished Male)
Model: eleven_multilingual_v2
"""
import re, os, sys, json, time, urllib.request, urllib.error
from pathlib import Path

API_KEY = "sk_820f04b8b11596b49987612411d39bf6f22f6d9a7fd49e27"
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.35}

BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
STATE_FILE = BASE / "scripts" / "viraj_gen_state.json"

DELAY = 0.4
MAX_RETRIES = 3
RETRY_DELAY = 5

def unescape(s: str) -> str:
    """Properly unescape JSON string content without corrupting Unicode."""
    return (
        s.replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\\\\\", "\\\\")
        .replace("\\n", "\n")
        .strip()
    )

def parse_sentences():
    with open(CONTENT_TS, "r", encoding="utf-8") as f:
        text = f.read()
    pattern = (
        r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
        r'"lessonId":\s*"([^"]+)".*?"english":\s*"((?:[^"\\]|\\.)*)".*?'
        r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
    )
    matches = re.findall(pattern, text, re.DOTALL)
    seen = set()
    sentences = []
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
    return {"generated": [], "skipped": [], "errors": []}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def tts(text, output_path):
    data = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": VOICE_SETTINGS,
    }).encode()

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
                f"?output_format=mp3_44100_128",
                data=data,
                headers={"xi-api-key": API_KEY,
                         "Content-Type": "application/json"},
            )
            resp = urllib.request.urlopen(req, timeout=60)
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
                print(f"    ⚠️ HTTP {e.code}: {body}")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            print(f"    ⚠️ Error: {e}")
            time.sleep(RETRY_DELAY)
    raise Exception(f"Failed after {MAX_RETRIES} retries")

def main():
    print("🎙️ SunoBolo — Viraj Voice Generator (ALL missing sentences)")
    print("=" * 60)

    sentences = parse_sentences()
    print(f"Total sentences in content.ts: {len(sentences)}")

    # Filter: skip sentences where BOTH EN + HI already exist
    to_generate = []
    skipped_exist = 0
    for s in sentences:
        en_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
        hi_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
        if en_path.exists() and hi_path.exists():
            skipped_exist += 1
            continue
        to_generate.append(s)

    print(f"Already have audio (SKIP): {skipped_exist}")
    print(f"Need generation: {len(to_generate)}")
    print()

    if not to_generate:
        print("✅ Nothing to generate!")
        return

    # Calculate chars needed
    total_chars = sum(len(s["english"]) + len(s["hindi"]) + 6 for s in to_generate)
    print(f"Estimated characters: {total_chars:,}")
    print()

    state = load_state()
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

        # Double-check existence (resume-safe)
        if en_path.exists() and hi_path.exists():
            print(f"  [{i+1}/{total}] {cid}/{sid} — SKIP (exists)")
            state["skipped"].append(sid)
            continue

        print(f"  [{i+1}/{total}] {cid}/{sid}")

        try:
            # English audio
            if not en_path.exists():
                size = tts(s["english"], str(en_path))
                print(f"    EN: {size:,} bytes")
                time.sleep(DELAY)
            else:
                print(f"    EN: already exists")

            # Hindi audio with prefix
            if not hi_path.exists():
                hindi_text = f"मतलब {s['hindi']}"
                size = tts(hindi_text, str(hi_path))
                print(f"    HI: {size:,} bytes")
                time.sleep(DELAY)
            else:
                print(f"    HI: already exists")

            state["generated"].append(sid)
            success += 1

            if success % 10 == 0:
                save_state(state)
                elapsed = time.time() - start_time
                rate = success / elapsed if elapsed > 0 else 0
                remaining = (total - i - 1) / rate if rate > 0 else 0
                print(f"    ── Progress: {success}/{total} | "
                      f"ETA: {remaining/60:.1f} min ──")

        except Exception as e:
            err_msg = str(e)[:200]
            print(f"    ❌ FAILED: {err_msg}")
            state["errors"].append({"id": sid, "error": err_msg})
            errors += 1

            if "quota_exceeded" in err_msg or "unauthorized" in err_msg.lower():
                print("\n🛑 QUOTA EXCEEDED — stopping to save time")
                print(f"   Generated so far: {success}")
                print(f"   Remaining: {total - i - 1}")
                save_state(state)
                break

    save_state(state)
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"✅ GENERATED: {success}")
    print(f"❌ ERRORS: {errors}")
    print(f"⏭️ SKIPPED: {skipped_exist}")
    print(f"⏱️ Time: {elapsed/60:.1f} minutes")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
