"""Regenerate free-trial-001 audio with Sarvam AI premium voice."""
import os, sys, io, json, base64, urllib.request, urllib.error, time

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_dj45kyhu_LDYi5ATUyWVREZVBbBP4f0Ve",
    "sk_oj0rgnfu_kAGUF4P1ynTGKbxnELLWCWit",
    "sk_h4hrzfb1_Wu0kSeWzDS2Ka0G5k3xLbu4s",
    "sk_759jdxj6_L0zU8eUf2uAmkGCLCvks2rtW",
    "sk_7hnxnfa8_aCZXakIRdmzzl5UvNAZmSUQq",
    "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U",
]

AUDIO_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/free-trial"

def generate_sarvam(text, speaker="shubh", lang="hi-IN", api_key=None):
    """Generate audio using Sarvam AI."""
    payload = json.dumps({
        "input": {"text": text, "target_language_code": lang},
        "config": {
            "model": "bulbul:v3",
            "speaker": speaker,
            "audio_format": "mp3",
            "sample_rate": 24000
        }
    }).encode('utf-8')
    
    url = "https://api.sarvam.ai/text-to-speech"
    for key in (API_KEYS if not api_key else [api_key]):
        try:
            req = urllib.request.Request(url, data=payload, method='POST')
            req.add_header('Content-Type', 'application/json')
            req.add_header('api-subscription-key', key)
            
            with urllib.request.urlopen(req, timeout=30) as res:
                data = json.loads(res.read())
                if 'audio' in data:
                    return base64.b64decode(data['audio'])
        except urllib.error.HTTPError as e:
            if e.code == 402:
                print(f"  Key {key[:12]}... exhausted, trying next...")
                continue
            print(f"  HTTP {e.code} with key {key[:12]}...")
            continue
        except Exception as e:
            print(f"  Error: {e}")
            continue
    return None

# First sentence
sentences = [
    {"id": "free-trial-001", "en": "Good morning. How are you?", "hi": "सुप्रभात। आप कैसे हैं?"},
]

print("=== Generating free-trial-001 audio ===")
for s in sentences:
    # EN audio
    print(f"\n{s['id']} EN: {s['en']}")
    audio = generate_sarvam(s['en'], speaker="shubh", lang="hi-IN")
    if audio:
        path = os.path.join(AUDIO_DIR, f"{s['id']}.mp3")
        with open(path, 'wb') as f:
            f.write(audio)
        print(f"  ✅ Saved: {len(audio)} bytes")
    else:
        print(f"  ❌ Failed")
    
    time.sleep(1)
    
    # HI audio
    print(f"{s['id']} HI: {s['hi']}")
    audio = generate_sarvam(s['hi'], speaker="shubh", lang="hi-IN")
    if audio:
        path = os.path.join(AUDIO_DIR, f"{s['id']}.hindi.mp3")
        with open(path, 'wb') as f:
            f.write(audio)
        print(f"  ✅ Saved: {len(audio)} bytes")
    else:
        print(f"  ❌ Failed")
    
    time.sleep(1)

print("\n=== Done! ===")
