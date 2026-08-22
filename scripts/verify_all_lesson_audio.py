"""
Verify EVERY lesson's first sentence has audio at the exact path
the app would request: /audio/{courseId}/{sentenceId}.mp3
"""
import os, sys, io, re

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find ALL sentences with order=1
order1_pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"lessonId"\s*:\s*"([\w-]+-[\w-]+)"\s*,\s*"order"\s*:\s*1'
order1 = re.findall(order1_pattern, content)

print(f"Total lessons (order=1 sentences): {len(order1)}")
print()

missing_en = []
missing_hi = []
ok = 0

for sid, course_id, lesson_id in order1:
    course_dir = os.path.join(AUDIO_DIR, course_id)
    
    # Exact paths the app would request
    en_path = os.path.join(course_dir, f"{sid}.mp3")
    hi_path = os.path.join(course_dir, f"{sid}.hindi.mp3")
    
    en_exists = os.path.exists(en_path) and os.path.getsize(en_path) >= 2000
    hi_exists = os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000
    
    if en_exists and hi_exists:
        ok += 1
    else:
        if not en_exists:
            missing_en.append(f"{course_id}/{sid}.mp3")
        if not hi_exists:
            missing_hi.append(f"{course_id}/{sid}.hindi.mp3")

print(f"✅ OK: {ok}/{len(order1)}")
print(f"❌ Missing EN: {len(missing_en)}")
print(f"❌ Missing HI: {len(missing_hi)}")

if missing_en:
    print("\nMissing EN files:")
    for f in missing_en[:30]:
        print(f"  {f}")

if missing_hi:
    print("\nMissing HI files:")
    for f in missing_hi[:30]:
        print(f"  {f}")
