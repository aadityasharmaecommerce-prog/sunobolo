"""Rebuild sentence DB with better regex"""
import os, sys, io, json, re

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')
OUTPUT = os.path.join(PROJECT, 'scripts', 'sentences_db.json')

with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Match: "id": "XXX-NNN", ..., "courseId": "XXX", ..., "english": "...", "hindi": "..."
pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"\s*,\s*"courseId"\s*:\s*"([\w-]+)"\s*,\s*"lessonId"\s*:\s*"[\w-]+"\s*,\s*"order"\s*:\s*\d+\s*,\s*"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
matches = re.findall(pattern, content, re.DOTALL)

db = {}
for sid, course_id, english, hindi in matches:
    if sid not in db:
        db[sid] = {
            'course': course_id,
            'en': english.replace('\\"', '"').replace('\\n', '\n'),
            'hi': hindi.replace('\\"', '"').replace('\\n', '\n'),
        }

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False)

print(f"DB rebuilt: {len(db)} sentences")
for t in ['beginner-001', 'beginner-026', 'advanced-001', 'intermediate-001']:
    print(f"  {t}: {'YES' if t in db else 'NO'}")
