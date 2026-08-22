"""
Check first sentence of EVERY lesson — generate missing audio.
This ensures no lesson starts with browser TTS.
"""
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

# ── Parse lessons and their first sentences ──
# Pattern: lesson block contains "sentences": [ { first sentence } ]
# We need to find each lesson's first sentence

# Split by lesson blocks
lesson_pattern = r'"id"\s*:\s*"([\w-]+)"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"moduleId"\s*:\s*"[\w-]+"\s*,\s*"order"\s*:\s*\d+\s*,\s*"title"\s*:\s*"([^"]*)"'
lessons = re.findall(lesson_pattern, content)

# For each lesson, find its first sentence
sentence_pattern = r'"lessonId"\s*:\s*"([\w-]+-[\w-]+)"\s*,\s*"order"\s*:\s*1\s*,\s*"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'

first_sentences_raw = re.findall(sentence_pattern, content)

# Map lessonId -> first sentence
first_by_lesson = {}
for lesson_id, english, hindi in first_sentences_raw:
    if lesson_id not in first_by_lesson:
        first_by_lesson[lesson_id] = {
            'en': english.replace('\\"', '"').replace('\\n', '\n'),
            'hi': hindi.replace('\\"', '"').replace('\\n', '\n'),
        }

print(f"Lessons found: {len(lessons)}")
print(f"First sentences found: {len(first_by_lesson)}")

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

# Now check: each lesson has sentences starting from its ID pattern
# e.g., lesson "beginner-01" has sentences "beginner-001", "beginner-002", etc.
# But some lessons use "-01" format for first sentence

# Let's find ALL sentence IDs per lesson
all_sent_pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"lessonId"\s*:\s*"([\w-]+-[\w-]+)"'
all_sentences = re.findall(all_sent_pattern, content)

# Group by lessonId, keep order
lesson_sentences = {}
for sid, course_id, lesson_id in all_sentences:
    if lesson_id not in lesson_sentences:
        lesson_sentences[lesson_id] = {'course': course_id, 'sentences': []}
    lesson_sentences[lesson_id]['sentences'].append(sid)

# For each lesson, find the FIRST sentence ID (order=1)
# The first sentence is the one with "order": 1
order1_pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"lessonId"\s*:\s*"([\w-]+-[\w-]+)"\s*,\s*"order"\s*:\s*1'
order1_sentences = re.findall(order1_pattern, content)

print(f"\nSentences with order=1: {len(order1_sentences)}")

# Check each order=1 sentence
missing = []
ok_count = 0
for sid, course_id, lesson_id in order1_sentences:
    course_dir = os.path.join(AUDIO_DIR, course_id)
    en_path = os.path.join(course_dir, f"{sid}.mp3")
    hi_path = os.path.join(course_dir, f"{sid}.hindi.mp3")
    
    en_ok = os.path.exists(en_path) and os.path.getsize(en_path) >= 2000
    hi_ok = os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000
    
    if en_ok and hi_ok:
        ok_count += 1
    else:
        # Get text from first_by_lesson or find it
        text_data = first_by_lesson.get(lesson_id, None)
        if not text_data:
            # Try to find by sentence ID
            for lid, data in first_by_lesson.items():
                if lid == lesson_id:
                    text_data = data
                    break
        
        missing.append({
            'id': sid,
            'course': course_id,
            'lesson': lesson_id,
            'en': text_data['en'] if text_data else '',
            'hi': text_data['hi'] if text_data else '',
            'need_en': not en_ok,
            'need_hi': not hi_ok,
        })

print(f"OK: {ok_count}")
print(f"Missing: {len(missing)}")

if missing:
    print("\nMissing first sentences:")
    for m in missing:
        parts = []
        if m['need_en']: parts.append('EN')
        if m['need_hi']: parts.append('HI')
        print(f"  ❌ {m['course']}/{m['id']} (lesson: {m['lesson']}) [{', '.join(parts)}]")
    
    # Generate
    api_calls = sum(m['need_en'] + m['need_hi'] for m in missing if m['en'])
    print(f"\nGenerating {api_calls} audio files...")
    
    generated = 0
    errors = 0
    for m in missing:
        if not m['en']:
            print(f"  ⚠️ {m['id']}: No text found, skipping")
            continue
        
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
else:
    print("\n🎉 All lesson first sentences have premium audio!")
