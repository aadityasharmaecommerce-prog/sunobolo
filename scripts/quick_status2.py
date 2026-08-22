import sys, io, os
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'audio')

courses = {
    'beginner': 726, 'free-trial': 25, 'intermediate': 351,
    'advanced': 301, 'daily-life': 476, 'business': 101,
    'corporate': 101, 'interview': 101, 'kids': 101,
    'school': 101, 'travel': 101,
}

total_en = 0
total_hi = 0

for course, expected in courses.items():
    course_dir = os.path.join(AUDIO_DIR, course)
    if not os.path.exists(course_dir):
        print(f"  {course:15s} DIR MISSING")
        continue
    
    files = os.listdir(course_dir)
    en = sum(1 for f in files if f.endswith('.mp3') and not f.endswith('.hindi.mp3'))
    hi = sum(1 for f in files if f.endswith('.hindi.mp3'))
    
    total_en += en
    total_hi += hi
    
    en_status = f"{en}/{expected}" if en >= expected else f"{en}/{expected} MISSING({expected-en})"
    hi_status = f"{hi}/{expected}" if hi >= expected else f"{hi}/{expected} MISSING({expected-hi})"
    print(f"  {course:15s} EN: {en_status:20s} HI: {hi_status}")

print(f"\n  Total EN audio: {total_en}")
print(f"  Total HI audio: {total_hi}")
print(f"  Grand total:    {total_en + total_hi} files")

# Check shared
shared_dir = os.path.join(AUDIO_DIR, 'shared')
if os.path.exists(shared_dir):
    for f in os.listdir(shared_dir):
        size = os.path.getsize(os.path.join(shared_dir, f))
        print(f"  shared/{f}: {size} bytes")

# Test files
test_files = [f for f in os.listdir(AUDIO_DIR) if f.startswith('test_sarvam')]
print(f"\n  Test files: {len(test_files)}")
for tf in test_files:
    print(f"    {tf}")
