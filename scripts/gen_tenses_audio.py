"""Generate Sarvam AI premium audio for Tenses section.
Generates EN + HI audio for sentences that don't have existing audio.
Auto-rotates through multiple API keys.
"""
import sys, io, json, base64, urllib.request, urllib.error, time, os, re

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_u5xlyvf7_jNrIDvSNsdECouLRkvVMA7bB",
    "sk_oj0rgnfu_kAGUF4P1ynTGKbxnELLWCWit",
    "sk_h4hrzfb1_Wu0kSeWzDS2Ka0G5k3xLbu4s",
    "sk_7hnxnfa8_aCZXakIRdmzzl5UvNAZmSUQq",
    "sk_6vaspuhz_r3t0NExW40dlkX606rOiUegO",
    "sk_aypv66s0_kyF2lcPIL7tJR4vIeU08ukcw",
    "sk_dj45kyhu_LDYi5ATUyWVREZVBbBP4f0Ve",
    "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U",
    "sk_759jdxj6_L0zU8eUf2uAmkGCLCvks2rtW",
    "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U",
]
current_key_idx = 0
AUDIO_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/tenses"
TENSES_FILE = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/src/data/tenses.ts"

def get_api_key():
    global current_key_idx
    return API_KEYS[current_key_idx % len(API_KEYS)]

def rotate_key():
    global current_key_idx
    current_key_idx += 1
    if current_key_idx >= len(API_KEYS):
        current_key_idx = 0
    print(f"  Rotating to API key index {current_key_idx}")

def generate_sarvam(text, speaker="shubh", lang="hi-IN"):
    for attempt in range(3):
        api_key = get_api_key()
        payload = json.dumps({
            'text': text,
            'target_language_code': lang,
            'speaker': speaker,
            'model': 'bulbul:v3',
            'audio_format': 'mp3',
            'sample_rate': 24000
        }).encode('utf-8')
        
        req = urllib.request.Request('https://api.sarvam.ai/text-to-speech', data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('api-subscription-key', api_key)
        
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                data = json.loads(res.read())
                if 'audios' in data and data['audios']:
                    return base64.b64decode(data['audios'][0])
                if 'audio' in data:
                    return base64.b64decode(data['audio'])
                raise Exception(f"No audio in response: {list(data.keys())}")
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            if e.code == 429 or any(w in body.lower() for w in ['rate', 'limit', 'credit', 'quota', 'exceeded']):
                print(f"    Key exhausted (HTTP {e.code}), rotating...")
                rotate_key()
                time.sleep(2)
                continue
            raise Exception(f"HTTP {e.code}: {body[:200]}")
    raise Exception("All API keys exhausted")

def parse_tenses():
    """Parse tenses.ts to extract sentences needing new audio."""
    with open(TENSES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all sentence blocks with hasExistingAudio: false
    # Pattern: id: 't-xxx-001', english: '...', hindi: '...'
    sentences = []
    
    # Split by sentence blocks
    blocks = re.split(r'\{\s*\n\s*id:\s*', content)
    
    for block in blocks[1:]:  # Skip first (before any sentence)
        # Extract id
        id_match = re.match(r"['\"]([^'\"]+)['\"]", block)
        if not id_match:
            continue
        sid = id_match.group(1)
        
        # Check hasExistingAudio
        if 'hasExistingAudio: true' in block:
            continue
        
        # Extract english
        en_match = re.search(r"english:\s*['\"]([^'\"]+)['\"]", block)
        hi_match = re.search(r"hindi:\s*['\"]([^'\"]+)['\"]", block)
        
        if en_match and hi_match:
            sentences.append({
                'id': sid,
                'english': en_match.group(1),
                'hindi': hi_match.group(1),
            })
    
    return sentences

def main():
    # Create output directory
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    # Parse sentences
    sentences = parse_tenses()
    print(f"Found {len(sentences)} sentences needing new audio")
    
    success = 0
    failed = 0
    results = []
    
    for i, s in enumerate(sentences):
        print(f"\n[{i+1}/{len(sentences)}] {s['id']}")
        
        # English audio
        print(f"  EN: {s['english'][:60]}...")
        try:
            audio = generate_sarvam(s['english'], speaker="shubh", lang="en-IN")
            path = f"{AUDIO_DIR}/{s['id']}.mp3"
            with open(path, 'wb') as f:
                f.write(audio)
            print(f"  OK EN: {len(audio)} bytes")
            success += 1
        except Exception as e:
            print(f"  FAILED EN: {e}")
            failed += 1
            results.append({"id": s['id'], "type": "en", "status": "failed", "error": str(e)})
        
        time.sleep(2)
        
        # Hindi audio with prefix
        hi_text = f"मतलब {s['hindi']}"
        print(f"  HI: {hi_text[:60]}...")
        try:
            audio = generate_sarvam(hi_text, speaker="shubh", lang="hi-IN")
            path = f"{AUDIO_DIR}/{s['id']}.hindi.mp3"
            with open(path, 'wb') as f:
                f.write(audio)
            print(f"  OK HI: {len(audio)} bytes")
            success += 1
        except Exception as e:
            print(f"  FAILED HI: {e}")
            failed += 1
            results.append({"id": s['id'], "type": "hi", "status": "failed", "error": str(e)})
        
        time.sleep(2)
    
    print(f"\n=== SUMMARY ===")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    print(f"Total: {success + failed}")
    
    # Save results
    with open(f"{AUDIO_DIR}/../tenses_audio_results.json", 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to tenses_audio_results.json")

if __name__ == '__main__':
    main()
