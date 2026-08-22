"""Generate comprehensive audio status report."""
import sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import os, re, json
from pathlib import Path
from collections import defaultdict

AUDIO_BASE = Path("public/audio")
CONTENT_TS = Path("src/data/content.ts")
LOG_FILE = Path("scripts/sarvam_output.log")
REPORT_FILE = Path("AUDIO-STATUS-REPORT.md")

# Parse content.ts
with open(CONTENT_TS, "r", encoding="utf-8") as f:
    text = f.read()

pattern = (
    r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
    r'"english":\s*"((?:[^"\\]|\\.)*)".*?'
    r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
)
matches = re.findall(pattern, text, re.DOTALL)

seen = set()
all_sentences = []
for sid, cid, eng, hin in matches:
    if sid in seen:
        continue
    seen.add(sid)
    all_sentences.append({"id": sid, "courseId": cid, "english": eng, "hindi": hin})

# Check audio files
by_course = defaultdict(lambda: {
    "total": 0, "en_ok": 0, "hi_ok": 0, "both": 0,
    "missing_en": [], "missing_hi": []
})

for s in all_sentences:
    cid = s["courseId"]
    sid = s["id"]
    by_course[cid]["total"] += 1

    en_path = AUDIO_BASE / cid / f"{sid}.mp3"
    hi_path = AUDIO_BASE / cid / f"{sid}.hindi.mp3"

    en_ok = en_path.exists()
    hi_ok = hi_path.exists()

    if en_ok:
        by_course[cid]["en_ok"] += 1
    else:
        by_course[cid]["missing_en"].append(sid)

    if hi_ok:
        by_course[cid]["hi_ok"] += 1
    else:
        by_course[cid]["missing_hi"].append(sid)

    if en_ok and hi_ok:
        by_course[cid]["both"] += 1

# Sarvam AI generated from log
sarvam_done = set()
if LOG_FILE.exists():
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            m = re.search(r"\[(\d+)/\d+\]\s+(\S+)", line)
            if m and "EN:" not in line and "HI:" not in line and "Progress" not in line and "SKIP" not in line:
                sarvam_done.add(m.group(2))

# Also check regen_changed log
regen_file = Path("scripts/hindi_changes.json")
regen_ids = set()
if regen_file.exists():
    with open(regen_file, "r", encoding="utf-8") as f:
        changes = json.load(f)
        for c in changes:
            regen_ids.add(c["id"])

# Totals
total = len(all_sentences)
total_en = sum(v["en_ok"] for v in by_course.values())
total_hi = sum(v["hi_ok"] for v in by_course.values())
total_both = sum(v["both"] for v in by_course.values())
total_miss_en = sum(len(v["missing_en"]) for v in by_course.values())
total_miss_hi = sum(len(v["missing_hi"]) for v in by_course.values())

# Generate MD report
lines = []
lines.append("# 🎙️ SunoBolo Audio Status Report")
lines.append(f"**Generated:** August 21, 2026")
lines.append(f"**Voice Engine:** Sarvam AI (shubh, bulbul:v3)")
lines.append(f"**Total Sentences:** {total}")
lines.append("")

lines.append("## 📊 Overall Status")
lines.append("")
lines.append("| Metric | Count |")
lines.append("|--------|-------|")
lines.append(f"| Total Sentences | {total} |")
lines.append(f"| English Audio Ready | {total_en} |")
lines.append(f"| Hindi Audio Ready | {total_hi} |")
lines.append(f"| Both EN + HI Ready | {total_both} |")
lines.append(f"| Missing English Audio | {total_miss_en} |")
lines.append(f"| Missing Hindi Audio | {total_miss_hi} |")
lines.append(f"| Sarvam AI Generated (from log) | {len(sarvam_done)} |")
lines.append(f"| Hindi Simplified & Regenerated | {len(regen_ids)} |")
lines.append("")

lines.append("## 📚 Course-wise Breakdown")
lines.append("")
lines.append("| Course | Total | EN Ready | HI Ready | Both Ready | Missing EN | Missing HI |")
lines.append("|--------|-------|----------|----------|------------|------------|------------|")

for course in sorted(by_course.keys()):
    v = by_course[course]
    lines.append(f"| {course} | {v['total']} | {v['en_ok']} | {v['hi_ok']} | {v['both']} | {len(v['missing_en'])} | {len(v['missing_hi'])} |")

lines.append("")

lines.append("## ✅ Sarvam AI Generated Sentences")
lines.append("")
lines.append(f"**Total: {len(sarvam_done)} sentences** (EN + HI audio via Sarvam AI Shubh voice)")
lines.append("")

# Group by course
sarvam_by_course = defaultdict(list)
for sid in sorted(sarvam_done):
    cid = sid.split("-")[0] if "-" in sid else "other"
    if cid == "free":
        cid = "free-trial"
    if cid == "daily":
        cid = "daily-life"
    sarvam_by_course[cid].append(sid)

for course in sorted(sarvam_by_course.keys()):
    sids = sarvam_by_course[course]
    lines.append(f"### {course.upper()} ({len(sids)} sentences)")
    for sid in sids[:10]:
        lines.append(f"- `{sid}`")
    if len(sids) > 10:
        lines.append(f"- ... and {len(sids)-10} more")
    lines.append("")

lines.append("## 🔄 Hindi Simplified & Regenerated")
lines.append("")
lines.append(f"**Total: {len(regen_ids)} sentences** (formal Hindi replaced with simple conversational Hindi)")
lines.append("")

if regen_file.exists():
    with open(regen_file, "r", encoding="utf-8") as f:
        changes = json.load(f)
    for c in changes:
        lines.append(f"- `{c['id']}`: \"{c['old_hindi'][:50]}...\" → \"{c['new_hindi'][:50]}...\"")

lines.append("")

lines.append("## ❌ Missing Audio (Needs Generation)")
lines.append("")

for course in sorted(by_course.keys()):
    v = by_course[course]
    if v["missing_en"] or v["missing_hi"]:
        lines.append(f"### {course.upper()}")
        if v["missing_en"]:
            lines.append(f"**Missing English ({len(v['missing_en'])} sentences):**")
            for sid in v["missing_en"][:5]:
                lines.append(f"- `{sid}`")
            if len(v["missing_en"]) > 5:
                lines.append(f"- ... and {len(v['missing_en'])-5} more")
        if v["missing_hi"]:
            lines.append(f"**Missing Hindi ({len(v['missing_hi'])} sentences):**")
            for sid in v["missing_hi"][:5]:
                lines.append(f"- `{sid}`")
            if len(v["missing_hi"]) > 5:
                lines.append(f"- ... and {len(v['missing_hi'])-5} more")
        lines.append("")

lines.append("## 🎯 Voice Architecture")
lines.append("")
lines.append("| Component | Voice | Engine |")
lines.append("|-----------|-------|--------|")
lines.append("| English sentence | shubh (Male, Indian) | Sarvam AI bulbul:v3 |")
lines.append("| Hindi meaning | shubh (Male, Indian) | Sarvam AI bulbul:v3 |")
lines.append("| Instruction | shubh (Male, Indian) | Sarvam AI bulbul:v3 |")
lines.append("| Browser TTS fallback | hi-IN bilingual | Device TTS |")
lines.append("")
lines.append("**⚠️ CRITICAL: All pre-generated MP3s MUST be Sarvam AI. Never mix with Viraj/ElevenLabs/Edge-TTS.**")
lines.append("")

lines.append("## 🔧 How to Generate Missing Audio")
lines.append("")
lines.append("```bash")
lines.append("# Generate only missing (safe, resume-ready):")
lines.append("cd sunobolo/sunobolo")
lines.append("python scripts/sarvam_replace_all.py")
lines.append("")
lines.append("# Force replace ALL (not recommended):")
lines.append("python scripts/sarvam_replace_all.py --force")
lines.append("")
lines.append("# Generate specific course:")
lines.append("python scripts/sarvam_replace_all.py --course beginner")
lines.append("```")
lines.append("")

lines.append("## 📁 Key Files")
lines.append("")
lines.append("| File | Purpose |")
lines.append("|------|---------|")
lines.append("| `src/config/voiceConfig.ts` | Voice config, AUDIO_VERSION=18 |")
lines.append("| `src/hooks/useSentenceAudio.ts` | Audio playback engine |")
lines.append("| `scripts/sarvam_replace_all.py` | Main audio generation script |")
lines.append("| `scripts/regen_changed.py` | Regenerate only changed Hindi |")
lines.append("| `scripts/simplify_hindi.py` | Simplify formal Hindi |")
lines.append("| `scripts/hindi_changes.json` | Log of all Hindi changes |")
lines.append("| `scripts/sarvam_output.log` | Generation progress log |")
lines.append("| `public/audio/` | All audio MP3 files |")

report = "\n".join(lines)

with open(REPORT_FILE, "w", encoding="utf-8") as f:
    f.write(report)

print(f"Report saved to: {REPORT_FILE}")
print()
print(f"SUMMARY:")
print(f"  Total sentences: {total}")
print(f"  EN ready: {total_en} | HI ready: {total_hi} | Both: {total_both}")
print(f"  Missing EN: {total_miss_en} | Missing HI: {total_miss_hi}")
print(f"  Sarvam AI generated: {len(sarvam_done)}")
print(f"  Hindi simplified: {len(regen_ids)}")
