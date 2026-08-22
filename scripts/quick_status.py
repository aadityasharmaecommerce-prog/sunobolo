import sys, io, os, json
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'audio')
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sarvam_gen_state.json')

# Load state
state = {}
if os.path.exists(STATE_FILE):
    with open(STATE_FILE, 'r', encoding='utf-8') as f:
        state = json.load(f)

completed = state.get('completed', [])
print(f"State file completed: {len(completed)} sentences")

# Scan all audio files
courses = ['beginner', 'free-trial', 'intermediate', 'advanced', 'daily-life', 'business', 'corporate', 'interview', 'kids', 'school', 'travel']
total_en = 0
total_hi = 0
total_missing = 0

for course in courses:
    course_dir = os.path.join(AUDIO_DIR, course)
    if not os.path.exists(course_dir):
        continue
    
    en_count = 0
    hi_count = 0
    missing_en = 0
    missing_hi = 0
    
    for f in os.listdir(course_dir):
        if f.endswith('.mp3'):
            if f.endswith('-en.mp3'):
                en_count += 1
            elif f.endswith('-hi.mp3'):
                hi_count += 1
    
    # Count expected sentences from content
    expected = 0
    if course == 'beginner': expected = 726
    elif course == 'free-trial': expected = 25
    elif course == 'intermediate': expected = 351
    elif course == 'advanced': expected = 301
    elif course == 'daily-life': expected = 476
    elif course == 'business': expected = 101
    elif course == 'corporate': expected = 101
    elif course == 'interview': expected = 101
    elif course == 'kids': expected = 101
    elif course == 'school': expected = 101
    elif course == 'travel': expected = 101
    
    missing_en = expected - en_count
    missing_hi = expected - hi_count
    
    total_en += en_count
    total_hi += hi_count
    total_missing += max(0, missing_en) + max(0, missing_hi)
    
    en_status = f"{en_count}/{expected}" if en_count >= expected else f"{en_count}/{expected} MISSING({missing_en})"
    hi_status = f"{hi_count}/{expected}" if hi_count >= expected else f"{hi_count}/{expected} MISSING({missing_hi})"
    
    print(f"  {course:15s} EN: {en_status:20s} HI: {hi_status}")

print(f"\nTotal EN audio: {total_en}")
print(f"Total HI audio: {total_hi}")
print(f"Total missing: {total_missing}")

# Check test files
test_files = [f for f in os.listdir(AUDIO_DIR) if f.startswith('test_sarvam')]
print(f"\nTest files: {test_files}")

# Check instruction file
inst = os.path.join(AUDIO_DIR, 'shared', 'repeat-instruction.mp3')
if os.path.exists(inst):
    size = os.path.getsize(inst)
    print(f"\nInstruction audio: {size} bytes")
else:
    print(f"\nInstruction audio: MISSING")
