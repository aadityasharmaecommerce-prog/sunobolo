"""Replace all Viraj EN audio in free-trial with Sarvam AI premium voice"""
import os, sys, io, json, base64, urllib.request, re, time

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

# Parse content.ts to find free-trial sentences
with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all free-trial sentences
pattern = r'"id"\s*:\s*"(free-trial-\d+)"\s*,\s*"courseId"\s*:\s*"free-trial"[^}]*?"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
matches = re.findall(pattern, content, re.DOTALL)

print(f"Found {len(matches)} free-trial sentences in content.ts")

def tts(text, lang_code, output_path):
    payload = {
        "inputs": [text],
        "model": "bulbul:v3",
        "language_code": lang_code,
        "speaker": "shubh",
        "pace": 0.95,
        "output_audio_codec": "mp3",
        "speech_sample_rate": 22050,
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(BASE_URL, data=data, headers={
        "api-subscription-key": API_KEY, "Content-Type": "application/json",
    })
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    if "audios" in result and result["audios"]:
        audio_bytes = base64.b64decode(result["audios"][0])
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        return len(audio_bytes)
    return 0

# Check which EN files are old (Viraj)
import datetime
CUTOFF = datetime.datetime(2026, 8, 21, 0, 0, 0).timestamp()  # Aug 21 00:00 IST
replaced = 0
skipped = 0

for sid, english, hindi in matches:
    en_path = os.path.join(AUDIO_DIR, 'free-trial', f"{sid}.mp3")
    
    if not os.path.exists(en_path):
        print(f"  ❌ {sid}.mp3 does not exist — generating...")
        try:
            size = tts(english, "en-IN", en_path)
            replaced += 1
            print(f"  ✅ {sid}.mp3 ({size} bytes)")
            time.sleep(0.3)
        except Exception as e:
            print(f"  ❌ Error: {e}")
        continue
    
    mtime = os.path.getmtime(en_path)
    if mtime < CUTOFF:
        # Old file — replace with Sarvam AI
        old_size = os.path.getsize(en_path)
        try:
            size = tts(english, "en-IN", en_path)
            replaced += 1
            print(f"  ✅ {sid}.mp3 replaced ({old_size} -> {size} bytes)")
            time.sleep(0.3)
        except Exception as e:
            print(f"  ❌ {sid}.mp3 error: {e}")
            time.sleep(1)
    else:
        skipped += 1

print(f"\n{'='*50}")
print(f"Replaced: {replaced} | Already Sarvam: {skipped}")
print(f"Total: {len(matches)}")
