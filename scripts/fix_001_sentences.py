"""Generate audio for all missing *-001 format sentences (first in each module)"""
import os, sys, io, json, base64, urllib.request, re, time

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

# Parse content.ts to find all sentence data
with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all sentences with en and hi text
pattern = r'\{\s*"id"\s*:\s*"([\w-]+-(?:\d+))"[^}]*?"courseId"\s*:\s*"([\w-]+)"[^}]*?"english"\s*:\s*"((?:[^"\\]|\\.)*)"[^}]*?"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
blocks = re.findall(pattern, content, re.DOTALL)

sentences = {}
for sid, course_id, english, hindi in blocks:
    sentences[sid] = {'course': course_id, 'en': english, 'hi': hindi}

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

# Find all missing sentences
missing = []
for sid, data in sentences.items():
    course_dir = os.path.join(AUDIO_DIR, data['course'])
    en_path = os.path.join(course_dir, f"{sid}.mp3")
    hi_path = os.path.join(course_dir, f"{sid}.hindi.mp3")
    
    en_ok = os.path.exists(en_path) and os.path.getsize(en_path) >= 2000
    hi_ok = os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000
    
    if not en_ok or not hi_ok:
        missing.append({'id': sid, 'course': data['course'], 'en': data['en'], 'hi': data['hi'], 
                       'need_en': not en_ok, 'need_hi': not hi_ok})

print(f"Total sentences in content.ts: {len(sentences)}")
print(f"Missing audio: {len(missing)}")
print(f"API calls needed: {sum(m['need_en'] + m['need_hi'] for m in missing)}")

if not missing:
    print("\n🎉 All sentences have audio!")
else:
    print("\nMissing sentences:")
    for m in missing[:20]:
        parts = []
        if m['need_en']: parts.append('EN')
        if m['need_hi']: parts.append('HI')
        print(f"  ❌ {m['id']} ({', '.join(parts)})")
    
    print(f"\nGenerating {sum(m['need_en'] + m['need_hi'] for m in missing)} audio files...")
    
    generated = 0
    for m in missing:
        course_dir = os.path.join(AUDIO_DIR, m['course'])
        os.makedirs(course_dir, exist_ok=True)
        
        if m['need_en']:
            path = os.path.join(course_dir, f"{m['id']}.mp3")
            try:
                size = tts(m['en'], "en-IN", path)
                generated += 1
                print(f"  ✅ {m['id']}.mp3 ({size} bytes)")
                time.sleep(0.3)
            except Exception as e:
                print(f"  ❌ {m['id']}.mp3: {e}")
                time.sleep(1)
        
        if m['need_hi']:
            path = os.path.join(course_dir, f"{m['id']}.hindi.mp3")
            try:
                size = tts(m['hi'], "hi-IN", path)
                generated += 1
                print(f"  ✅ {m['id']}.hindi.mp3 ({size} bytes)")
                time.sleep(0.3)
            except Exception as e:
                print(f"  ❌ {m['id']}.hindi.mp3: {e}")
                time.sleep(1)
    
    print(f"\nGenerated {generated} audio files")
