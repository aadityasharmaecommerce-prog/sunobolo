"""Check for tiny/corrupt audio files that might fail to play"""
import os, sys, io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')

tiny = []
empty = []
for root, dirs, files in os.walk(AUDIO_DIR):
    for f in files:
        if not f.endswith('.mp3'): continue
        path = os.path.join(root, f)
        size = os.path.getsize(path)
        rel = os.path.relpath(path, AUDIO_DIR)
        if size == 0:
            empty.append((rel, size))
        elif size < 3000:
            tiny.append((rel, size))

print(f"Empty files (0 bytes): {len(empty)}")
for f, s in empty:
    print(f"  ❌ {f}")

print(f"\nTiny files (<3KB): {len(tiny)}")
for f, s in sorted(tiny, key=lambda x: x[1])[:20]:
    print(f"  ⚠️ {f} ({s} bytes)")

if not tiny and not empty:
    print("\n✅ All audio files are valid (>3KB)")
