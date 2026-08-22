"""Show advanced Hindi translations that are too formal."""
import sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re

with open("src/data/content.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = (
    r'"id":\s*"(advanced-[^"]+)".*?"courseId":\s*"advanced".*?'
    r'"english":\s*"((?:[^"\\]|\\.)*)".*?'
    r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
)
matches = re.findall(pattern, text, re.DOTALL)

seen = set()
results = []
for sid, eng, hin in matches:
    if sid in seen:
        continue
    seen.add(sid)
    results.append((sid, eng, hin))

print(f"Total advanced sentences: {len(results)}")
print()
print("=== ADVANCED - Current Hindi (too formal) ===")
for i, (sid, eng, hin) in enumerate(results[:20], 1):
    print(f"{i}. [{sid}]")
    print(f"   EN: {eng}")
    print(f"   HI: {hin}")
    print()
