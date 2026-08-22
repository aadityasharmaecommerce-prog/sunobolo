"""Generate HI audio for last 2 missing sentences"""
import os, sys, io, json, base64, urllib.request, urllib.error

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

# Sentences that need HI audio
SENTENCES = {
    "beginner-01": {
        "hi": "नमस्ते। मेरा नाम राहुल है। मैं दिल्ली से हूँ।"
    },
    "business-001": {
        "hi": "हमें इस प्रोजेक्ट पर जल्दी शुरू करना होगा।"
    },
}

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
        "api-subscription-key": API_KEY,
        "Content-Type": "application/json",
    })
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    if "audios" in result and result["audios"]:
        audio_bytes = base64.b64decode(result["audios"][0])
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        return len(audio_bytes)
    return 0

for sid, data in SENTENCES.items():
    out_path = os.path.join(AUDIO_DIR, f"{sid}.hindi.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) >= 2000:
        print(f"⏭️ {sid}.hindi.mp3 already exists ({os.path.getsize(out_path)} bytes)")
        continue
    
    print(f"🎙️ Generating {sid}.hindi.mp3...")
    try:
        size = tts(data["hi"], "hi-IN", out_path)
        print(f"   ✅ {size} bytes")
    except Exception as e:
        print(f"   ❌ Error: {e}")

print("\n🎉 Done!")
