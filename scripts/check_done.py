"""Show which sentences have Sarvam AI voice so far."""
import sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re
from collections import defaultdict

# Read completed sentence IDs
completed = set()
with open("scripts/sarvam_output.log", "r", encoding="utf-8") as f:
    for line in f:
        m = re.search(r"\[(\d+)/\d+\]\s+(\S+)", line)
        if m and "EN:" not in line and "HI:" not in line and "Progress" not in line and "SKIP" not in line:
            completed.add(m.group(2))

print(f"Total Sarvam AI sentences generated so far: {len(completed)}")
print()

# Read content.ts to get sentence text
with open("src/data/content.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = (
    r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
    r'"english":\s*"((?:[^"\\]|\\.)*)".*?'
    r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
)
matches = re.findall(pattern, text, re.DOTALL)

by_course = defaultdict(list)
seen = set()
for sid, cid, eng, hin in matches:
    if sid in seen:
        continue
    seen.add(sid)
    key = f"{cid}/{sid}"
    if key in completed:
        by_course[cid].append({"id": sid, "english": eng, "hindi": hin})

for course in sorted(by_course.keys()):
    sentences = by_course[course]
    print(f"=== {course.upper()} ({len(sentences)} sentences - Sarvam AI Shubh voice) ===")
    for i, s in enumerate(sentences, 1):
        print(f"  {i}. [{s['id']}]")
        print(f"     EN: {s['english'][:80]}")
        print(f"     HI: {s['hindi'][:80]}")
    print()
