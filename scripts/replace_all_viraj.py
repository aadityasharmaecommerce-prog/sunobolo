"""Replace ALL old Viraj EN audio files with Sarvam AI premium voice"""
import os, sys, io, json, base64, urllib.request, re, time, datetime

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U"
BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

# Parse content.ts to get all sentence text
with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all sentences: id -> {course, en, hi}
pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"[^}]*?"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
matches = re.findall(pattern, content, re.DOTALL)

sentences = {}
for sid, course_id, english, hindi in matches:
    if sid not in sentences:
        sentences[sid] = {
            'course': course_id,
            'en': english.replace('\\"', '"').replace('\\n', '\n'),
            'hi': hindi.replace('\\"', '"').replace('\\n', '\n'),
        }

print(f"Loaded {len(sentences)} sentences from content.ts")

# Find all old EN files (before Aug 21)
CUTOFF = datetime.datetime(2026, 8, 21, 0, 0, 0).timestamp()
old_files = []
for root, dirs, files in os.walk(AUDIO_DIR):
    for f in files:
        if not f.endswith('.mp3') or '.hindi.' in f:
            continue
        fp = os.path.join(root, f)
        if os.path.getmtime(fp) < CUTOFF:
            rel = os.path.relpath(fp, AUDIO_DIR)
            course = rel.split(os.sep)[0]
            sid = f.replace('.mp3', '')
            old_files.append({
                'path': fp,
                'course': course,
                'sid': sid,
                'size': os.path.getsize(fp),
            })

print(f"Found {len(old_files)} old Viraj EN files to replace")

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

# Replace each old file
replaced = 0
errors = 0
skipped = 0

for item in old_files:
    sid = item['sid']
    if sid not in sentences:
        skipped += 1
        continue
    
    text = sentences[sid]['en']
    if not text:
        skipped += 1
        continue
    
    try:
        old_size = item['size']
        new_size = tts(text, "en-IN", item['path'])
        replaced += 1
        if replaced % 50 == 0:
            print(f"  Progress: {replaced}/{len(old_files)} replaced...")
        time.sleep(0.2)
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f"  ❌ {sid}: {e}")
        time.sleep(1)

print(f"\n{'='*50}")
print(f"Replaced: {replaced} | Errors: {errors} | Skipped: {skipped}")
print(f"Total old files: {len(old_files)}")
