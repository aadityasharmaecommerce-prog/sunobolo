#!/usr/bin/env python3
"""
Batch generate Viraj (ElevenLabs) voice audio for ALL missing sentences.
Resume-safe: skips files that already exist on disk.
"""
import re, os, sys, json, time, urllib.request, urllib.error
from pathlib import Path

API_KEY = "sk_ff3ca84cb201e217a3c93a87ae1c3cd06310ed24b966bc76"
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
MODEL = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.35}

BASE = Path(__file__).resolve().parent.parent
CONTENT_TS = BASE / "src" / "data" / "content.ts"
AUDIO_BASE = BASE / "public" / "audio"
STATE_FILE = BASE / "scripts" / "viraj_batch_state.json"

DELAY = 0.35
MAX_RETRIES = 3
RETRY_DELAY = 5

def parse_sentences():
    with open(CONTENT_TS, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    sentences = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Look for "id": "something",
        id_match = re.match(r'"id":\s*"([^"]+)"', line)
        if id_match:
            sid = id_match.group(1)
            # Collect next few lines for courseId, english, hindi
            block = ""
            for j in range(i, min(i + 10, len(lines))):
                block += lines[j]
            
            cid_m = re.search(r'"courseId":\s*"([^"]+)"', block)
            en_m = re.search(r'"english":\s*"((?:[^"\\]|\\.)*)"', block)
            hi_m = re.search(r'"hindi":\s*"((?:[^"\\]|\\.)*)"', block)
            
            if cid_m and en_m and hi_m:
                cid = cid_m.group(1)
                english = en_m.group(1).encode().decode("unicode_escape")
                hindi = hi_m.group(1).encode().decode("unicode_escape")
                sentences.append({"id": sid, "courseId": cid, "english": english, "hindi": hindi})
        i += 1
    return sentences

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"generated": [], "errors": [], "skipped": 0}

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
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
                data=data,
                headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
            )
            resp = urllib.request.urlopen(req, timeout=30)
            with open(output_path, "wb") as f:
                f.write(resp.read())
            return os.path.getsize(output_path)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = RETRY_DELAY * (attempt + 1)
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif e.code == 401:
                body = e.read().decode()[:200]
                print(f"    API key error: {body}")
                raise
            else:
                body = e.read().decode()[:200]
                print(f"    HTTP {e.code}: {body}")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            print(f"    Error: {e}")
            time.sleep(RETRY_DELAY)
    raise Exception(f"Failed after {MAX_RETRIES} retries")

def main():
    print("Parsing content.ts...")
    sentences = parse_sentences()
    
    # Filter out free-trial and shared (already done)
    sentences = [s for s in sentences if not s["id"].startswith("free-trial-") and not s["id"].startswith("shared-")]
    
    print(f"Total course sentences: {len(sentences)}")
    
    state = load_state()
    done_set = set(state["generated"])
    
    # Find missing: either no audio file OR not in done_set
    missing = []
    already_ok = 0
    for s in sentences:
        en_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.mp3"
        hi_path = AUDIO_BASE / s["courseId"] / f"{s['id']}.hindi.mp3"
        if en_path.exists() and hi_path.exists():
            already_ok += 1
            continue
        missing.append(s)
    
    print(f"Already have audio: {already_ok}")
    print(f"Missing (to generate): {len(missing)}")
    
    if not missing:
        print("All audio files exist! Nothing to generate.")
        return
    
    total = len(missing)
    success = 0
    errors = 0
    
    for i, s in enumerate(missing):
        cid = s["courseId"]
        sid = s["id"]
        
        out_dir = AUDIO_BASE / cid
        out_dir.mkdir(parents=True, exist_ok=True)
        
        en_path = out_dir / f"{sid}.mp3"
        hi_path = out_dir / f"{sid}.hindi.mp3"
        
        print(f"[{i+1}/{total}] {cid}/{sid}")
        
        try:
            # English audio
            if not en_path.exists():
                size = tts(s["english"], str(en_path))
                print(f"  EN: {size} bytes")
                time.sleep(DELAY)
            
            # Hindi audio with prefix
            hindi_text = f"मतलब {s['hindi']}"
            if not hi_path.exists():
                size = tts(hindi_text, str(hi_path))
                print(f"  HI: {size} bytes")
                time.sleep(DELAY)
            
            state["generated"].append(sid)
            success += 1
            
            if success % 20 == 0:
                save_state(state)
                print(f"  --- Progress: {success}/{total} done, {errors} errors ---")
                
        except Exception as e:
            print(f"  FAILED: {e}")
            state["errors"].append({"id": sid, "error": str(e)[:200]})
            errors += 1
    
    save_state(state)
    print(f"\n=== COMPLETE ===")
    print(f"Generated: {success}")
    print(f"Errors: {errors}")
    print(f"Total audio files now: {already_ok + success}")

if __name__ == "__main__":
    main()
