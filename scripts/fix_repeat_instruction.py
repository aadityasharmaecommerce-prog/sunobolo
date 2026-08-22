"""Generate HI audio for repeat-instruction"""
import os, sys, io, json, base64, urllib.request

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

out_path = os.path.join(AUDIO_DIR, "repeat-instruction.hindi.mp3")
if os.path.exists(out_path) and os.path.getsize(out_path) >= 2000:
    print(f"Already exists: {os.path.getsize(out_path)} bytes")
else:
    payload = {
        "inputs": ["मेरे साथ तीन बार दोहराओ।"],
        "model": "bulbul:v3",
        "language_code": "hi-IN",
        "speaker": "shubh",
        "pace": 0.95,
        "output_audio_codec": "mp3",
        "speech_sample_rate": 22050,
    }
    req = urllib.request.Request(BASE_URL, data=json.dumps(payload).encode(), headers={
        "api-subscription-key": API_KEY, "Content-Type": "application/json"
    })
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    if "audios" in result and result["audios"]:
        audio_bytes = base64.b64decode(result["audios"][0])
        with open(out_path, "wb") as f:
            f.write(audio_bytes)
        print(f"✅ Generated: {len(audio_bytes)} bytes")
    else:
        print(f"❌ No audio in response")
