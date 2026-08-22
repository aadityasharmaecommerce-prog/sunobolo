"""Check if content.ts IDs match actual audio filenames"""
import os, sys, io, re
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')

with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Get all sentence IDs from content.ts
all_ids = re.findall(r'"id"\s*:\s*"([\w-]+-(?:\d+))"', content)
seen = set()
unique_ids = []
for sid in all_ids:
    if sid not in seen:
        seen.add(sid)
        unique_ids.append(sid)

print(f"Total unique sentence IDs in content.ts: {len(unique_ids)}")

# Check first 3 sentences per course
courses = {}
for sid in unique_ids:
    parts = sid.rsplit('-', 1)
    if len(parts) == 2:
        course = parts[0]
        if course not in courses:
            courses[course] = []
        courses[course].append(sid)

print("\nFirst 3 sentence IDs per course vs audio files:")
print("=" * 70)
for course in sorted(courses.keys()):
    if course in ('shared', 'test'): continue
    course_ids = courses[course][:3]
    course_dir = os.path.join(AUDIO_DIR, course)
    audio_files = set()
    if os.path.exists(course_dir):
        audio_files = {f.replace('.mp3', '').replace('.hindi', '') for f in os.listdir(course_dir) if f.endswith('.mp3')}
    
    print(f"\n{course}:")
    for sid in course_ids:
        en_exists = os.path.exists(os.path.join(course_dir, f"{sid}.mp3"))
        hi_exists = os.path.exists(os.path.join(course_dir, f"{sid}.hindi.mp3"))
        in_audio = sid in audio_files
        status = "✅" if (en_exists and hi_exists) else "❌"
        print(f"  {status} {sid} | EN:{'✅' if en_exists else '❌'} HI:{'✅' if hi_exists else '❌'}")
