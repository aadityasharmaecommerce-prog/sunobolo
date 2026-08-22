"""Find what's actually missing"""
import os, re, sys, io
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

# Scan audio
audio_map = {}
for root, dirs, files in os.walk(AUDIO_DIR):
    for f in files:
        if not f.endswith('.mp3'): continue
        size = os.path.getsize(os.path.join(root, f))
        if f.endswith('.hindi.mp3'):
            sid = f.replace('.hindi.mp3', '')
            if sid not in audio_map: audio_map[sid] = {'en': False, 'hi': False}
            audio_map[sid]['hi'] = size >= 2000
        elif f.endswith('.mp3'):
            sid = f.replace('.mp3', '')
            if sid not in audio_map: audio_map[sid] = {'en': False, 'hi': False}
            audio_map[sid]['en'] = size >= 2000

# Find missing
missing_en = [s for s, a in audio_map.items() if not a['en']]
missing_hi = [s for s, a in audio_map.items() if not a['hi']]

print(f"Total unique sentences with audio files: {len(audio_map)}")
print(f"Missing EN: {len(missing_en)}")
print(f"Missing HI: {len(missing_hi)}")
if missing_en:
    print("\nMissing EN:")
    for s in missing_en[:20]:
        print(f"  - {s}")
if missing_hi:
    print("\nMissing HI:")
    for s in missing_hi[:20]:
        print(f"  - {s}")
