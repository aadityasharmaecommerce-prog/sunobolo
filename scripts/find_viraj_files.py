"""Find Viraj/ElevenLabs audio files by date (before Aug 21 = old voice)"""
import os, sys, io, time
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

# Aug 21 00:00 = cutoff for Sarvam AI generation
CUTOFF = datetime(2026, 8, 21, 0, 0, 0)

courses_to_check = ['business', 'kids', 'travel', 'corporate', 'interview', 'school']

viraj_files = []
sarvam_files = []

for course in courses_to_check:
    course_dir = os.path.join(AUDIO_DIR, course)
    if not os.path.exists(course_dir):
        continue
    
    for f in sorted(os.listdir(course_dir)):
        if not f.endswith('.mp3'):
            continue
        filepath = os.path.join(course_dir, f)
        mtime = os.path.getmtime(filepath)
        mtime_dt = datetime.fromtimestamp(mtime)
        size = os.path.getsize(filepath)
        
        if mtime_dt < CUTOFF:
            viraj_files.append({
                'path': f'{course}/{f}',
                'size': size,
                'date': mtime_dt.strftime('%Y-%m-%d %H:%M'),
                'sid': f.replace('.mp3', '').replace('.hindi', ''),
            })
        else:
            sarvam_files.append(f'{course}/{f}')

print(f"Viraj/ElevenLabs files (before Aug 21): {len(viraj_files)}")
print(f"Sarvam AI files (after Aug 21): {len(sarvam_files)}")

if viraj_files:
    print("\n=== VIRAJ FILES TO REPLACE ===")
    # Group by sentence ID
    by_sid = {}
    for v in viraj_files:
        sid = v['sid']
        if sid not in by_sid:
            by_sid[sid] = []
        by_sid[sid].append(v)
    
    for sid, files in sorted(by_sid.items()):
        print(f"\n  {sid}:")
        for f in files:
            print(f"    {f['path']} ({f['size']} bytes, {f['date']})")
