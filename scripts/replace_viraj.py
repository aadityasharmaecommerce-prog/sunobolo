"""Replace last Viraj audio file with Sarvam AI voice"""
import os, sys, io, json, base64, urllib.request

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

# Parse content.ts to find business-001 text
with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = r'"id"\s*:\s*"business-001"\s*,\s*"courseId"\s*:\s*"business"[^}]*?"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
match = re.search(pattern, content, re.DOTALL)

if not match:
    print("Could not find business-001 in content.ts")
    sys.exit(1)

english = match.group(1).replace('\\"', '"').replace('\\n', '\n')
hindi = match.group(2).replace('\\"', '"').replace('\\n', '\n')

print(f"Found: {english[:60]}...")
print(f"Hindi: {hindi[:60]}...")

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

# Replace EN
en_path = os.path.join(AUDIO_DIR, 'business', 'business-001.mp3')
old_size = os.path.getsize(en_path)
print(f"\nReplacing {en_path} (old: {old_size} bytes)...")
size = tts(english, "en-IN", en_path)
print(f"✅ EN: {size} bytes (was {old_size})")

# Also check/replace HI
hi_path = os.path.join(AUDIO_DIR, 'business', 'business-001.hindi.mp3')
if os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000:
    print(f"⏭️ HI already exists ({os.path.getsize(hi_path)} bytes)")
else:
    print(f"Generating HI...")
    size = tts(hindi, "hi-IN", hi_path)
    print(f"✅ HI: {size} bytes")

print("\n🎉 Done! All Viraj audio replaced with Sarvam AI!")
