"""Find ALL missing audio by using big-regex on content.ts"""
import os, sys, io, json, base64, urllib.request, re, time

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Big regex to extract sentence blocks
pattern = r'\{\s*"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"lessonId"\s*:\s*"[\w-]+-[\w-]+"\s*,\s*"order"\s*:\s*\d+\s*,\s*"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
matches = re.findall(pattern, content)

# Deduplicate by ID
seen = set()
sentences = []
for sid, course_id, english, hindi in matches:
    if sid not in seen:
        seen.add(sid)
        sentences.append({
            'id': sid,
            'course': course_id,
            'en': english.replace('\\"', '"').replace('\\n', '\n'),
            'hi': hindi.replace('\\"', '"').replace('\\n', '\n'),
        })

print(f"Total unique sentences: {len(sentences)}")

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

# Find missing
missing = []
for s in sentences:
    course_dir = os.path.join(AUDIO_DIR, s['course'])
    en_path = os.path.join(course_dir, f"{s['id']}.mp3")
    hi_path = os.path.join(course_dir, f"{s['id']}.hindi.mp3")
    
    en_ok = os.path.exists(en_path) and os.path.getsize(en_path) >= 2000
    hi_ok = os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000
    
    if not en_ok or not hi_ok:
        missing.append({**s, 'need_en': not en_ok, 'need_hi': not hi_ok})

api_calls = sum(m['need_en'] + m['need_hi'] for m in missing)
print(f"Missing: {len(missing)} sentences | API calls: {api_calls}")

if not missing:
    print("\n🎉 ALL sentences have premium audio!")
else:
    by_course = {}
    for m in missing:
        by_course.setdefault(m['course'], []).append(m)
    
    print("\nMissing by course:")
    for course, items in sorted(by_course.items()):
        print(f"  {course}: {len(items)} sentences")
    
    print(f"\nGenerating {api_calls} audio files...")
    generated = 0
    errors = 0
    
    for m in missing:
        course_dir = os.path.join(AUDIO_DIR, m['course'])
        os.makedirs(course_dir, exist_ok=True)
        
        if m['need_en']:
            path = os.path.join(course_dir, f"{m['id']}.mp3")
            try:
                size = tts(m['en'], "en-IN", path)
                generated += 1
                print(f"  ✅ {m['id']}.mp3 ({size}b)")
                time.sleep(0.3)
            except Exception as e:
                errors += 1
                print(f"  ❌ {m['id']}.mp3: {e}")
                time.sleep(2)
        
        if m['need_hi']:
            path = os.path.join(course_dir, f"{m['id']}.hindi.mp3")
            try:
                size = tts(m['hi'], "hi-IN", path)
                generated += 1
                print(f"  ✅ {m['id']}.hindi.mp3 ({size}b)")
                time.sleep(0.3)
            except Exception as e:
                errors += 1
                print(f"  ❌ {m['id']}.hindi.mp3: {e}")
                time.sleep(2)
    
    print(f"\n{'='*50}")
    print(f"Generated: {generated} | Errors: {errors}")
