"""Generate audio for missing first sentences"""
import os, sys, io, json, base64, urllib.request, urllib.error

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

# Missing first sentences with their text from content.ts
MISSING = [
    {"id": "beginner-01", "course": "beginner", 
     "en": "Good morning. How are you?",
     "hi": "सुप्रभात। आप कैसे हैं?"},
    
    {"id": "intermediate-01", "course": "intermediate",
     "en": "I would argue that the underlying issue is more systemic.",
     "hi": "मेरे हिसाब से असली प्रॉब्लम और गहरी है।"},
    
    {"id": "daily-life-01", "course": "daily-life",
     "en": "Can you help me find my keys?",
     "hi": "क्या तुम मेरी चाबी ढूंढने में मदद कर सकते हो?"},
]

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

for item in MISSING:
    sid = item["id"]
    course = item["course"]
    course_dir = os.path.join(AUDIO_DIR, course)
    os.makedirs(course_dir, exist_ok=True)
    
    # Generate EN
    en_path = os.path.join(course_dir, f"{sid}.mp3")
    if not os.path.exists(en_path) or os.path.getsize(en_path) < 2000:
        print(f"🎙️ Generating {sid}.mp3...")
        try:
            size = tts(item["en"], "en-IN", en_path)
            print(f"   ✅ EN: {size} bytes")
        except Exception as e:
            print(f"   ❌ EN Error: {e}")
    else:
        print(f"⏭️ {sid}.mp3 already exists")
    
    # Generate HI
    hi_path = os.path.join(course_dir, f"{sid}.hindi.mp3")
    if not os.path.exists(hi_path) or os.path.getsize(hi_path) < 2000:
        print(f"🎙️ Generating {sid}.hindi.mp3...")
        try:
            size = tts(item["hi"], "hi-IN", hi_path)
            print(f"   ✅ HI: {size} bytes")
        except Exception as e:
            print(f"   ❌ HI Error: {e}")
    else:
        print(f"⏭️ {sid}.hindi.mp3 already exists")

print("\n🎉 Done!")
