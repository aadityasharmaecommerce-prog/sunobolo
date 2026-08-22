import sys, io, json, base64, urllib.request, urllib.error
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"

# Test English
payload = {
    "inputs": ["Hello, this is a test."],
    "model": "bulbul:v3",
    "language_code": "en-IN",
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

try:
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    if "audios" in result and result["audios"]:
        audio_bytes = base64.b64decode(result["audios"][0])
        print(f"✅ EN Test OK — {len(audio_bytes)} bytes")
    else:
        print(f"⚠️ No audio in response: {json.dumps(result)[:200]}")
except urllib.error.HTTPError as e:
    body = e.read().decode()[:300]
    print(f"❌ Error {e.code}: {body}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test Hindi
payload["inputs"] = ["नमस्ते, यह एक परीक्षण है।"]
payload["language_code"] = "hi-IN"

data = json.dumps(payload).encode()
req = urllib.request.Request(BASE_URL, data=data, headers={
    "api-subscription-key": API_KEY,
    "Content-Type": "application/json",
})

try:
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    if "audios" in result and result["audios"]:
        audio_bytes = base64.b64decode(result["audios"][0])
        print(f"✅ HI Test OK — {len(audio_bytes)} bytes")
    else:
        print(f"⚠️ No audio in response: {json.dumps(result)[:200]}")
except urllib.error.HTTPError as e:
    body = e.read().decode()[:300]
    print(f"❌ Error {e.code}: {body}")
except Exception as e:
    print(f"❌ Error: {e}")
