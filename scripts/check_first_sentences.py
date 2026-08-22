"""Check first sentence of each section for missing audio"""
import os, sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

# First sentence IDs from content.ts (the ones that have "-01" suffix)
FIRST_SENTENCES = {
    'beginner': 'beginner-01',
    'intermediate': 'intermediate-01', 
    'advanced': 'advanced-01',
    'daily-life': 'daily-life-01',
    'business': 'business-01',
    'corporate': 'corporate-01',
    'interview': 'interview-01',
    'kids': 'kids-01',
    'school': 'school-01',
    'travel': 'travel-01',
}

print("First sentence audio check:")
print("=" * 60)
for course, sid in FIRST_SENTENCES.items():
    en_path = os.path.join(AUDIO_DIR, course, f"{sid}.mp3")
    hi_path = os.path.join(AUDIO_DIR, course, f"{sid}.hindi.mp3")
    
    en_exists = os.path.exists(en_path) and os.path.getsize(en_path) >= 2000
    hi_exists = os.path.exists(hi_path) and os.path.getsize(hi_path) >= 2000
    
    en_size = os.path.getsize(en_path) if os.path.exists(en_path) else 0
    hi_size = os.path.getsize(hi_path) if os.path.exists(hi_path) else 0
    
    status = "✅" if (en_exists and hi_exists) else "❌"
    print(f"{status} {course}/{sid}")
    print(f"   EN: {'✅' if en_exists else '❌'} ({en_size} bytes)")
    print(f"   HI: {'✅' if hi_exists else '❌'} ({hi_size} bytes)")
