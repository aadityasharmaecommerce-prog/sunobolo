"""
SunoBolo — Audio Status Report Generator v2
Scans audio files + content.ts for accurate per-sentence report.
"""
import os
import sys
import io
import json
import re
from collections import defaultdict

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
CONTENT_FILE = os.path.join(PROJECT, 'src', 'data', 'content.ts')
OUTPUT_FILE = os.path.join(PROJECT, 'AUDIO-STATUS-REPORT.md')
JSON_OUTPUT = os.path.join(PROJECT, 'scripts', 'audio_status.json')

MIN_MP3_SIZE = 2000

def scan_audio_files():
    audio_map = {}
    if not os.path.exists(AUDIO_DIR):
        return audio_map
    
    for root, dirs, files in os.walk(AUDIO_DIR):
        for f in files:
            if not f.endswith('.mp3'):
                continue
            filepath = os.path.join(root, f)
            size = os.path.getsize(filepath)
            rel_path = os.path.relpath(filepath, AUDIO_DIR)
            valid = size >= MIN_MP3_SIZE
            
            if f.endswith('.hindi.mp3'):
                sid = f.replace('.hindi.mp3', '')
                if sid not in audio_map:
                    audio_map[sid] = {'en': None, 'hi': None}
                audio_map[sid]['hi'] = {'path': rel_path, 'size': size, 'valid': valid}
            elif f.endswith('.mp3'):
                sid = f.replace('.mp3', '')
                if sid not in audio_map:
                    audio_map[sid] = {'en': None, 'hi': None}
                audio_map[sid]['en'] = {'path': rel_path, 'size': size, 'valid': valid}
    
    return audio_map

def parse_content_ts_fast():
    """Fast parse of content.ts - extract sentence IDs"""
    sentences = []
    
    if not os.path.exists(CONTENT_FILE):
        print(f"Content file not found: {CONTENT_FILE}")
        return sentences
    
    with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all sentence blocks with id, courseId, english, hindi
    # Pattern: "id": "xxx-NNN", ... "courseId": "xxx", ... "english": "...", "hindi": "..."
    # Use a simpler approach: find all id fields that look like sentences
    
    # Extract all sentence IDs (pattern: word-number like beginner-001)
    id_pattern = r'"id"\s*:\s*"([\w-]+-(?:\d+))"'
    all_ids = re.findall(id_pattern, content)
    
    # Deduplicate while preserving order
    seen = set()
    unique_ids = []
    for sid in all_ids:
        if sid not in seen:
            seen.add(sid)
            unique_ids.append(sid)
    
    # For each sentence, try to extract courseId and english/hindi text
    # Since content.ts is large, we'll use a block-based approach
    # Split by sentence entries
    
    # Find all sentence blocks
    block_pattern = r'\{\s*"id"\s*:\s*"([\w-]+-(?:\d+))"[^}]*?"courseId"\s*:\s*"([\w-]+)"[^}]*?"english"\s*:\s*"((?:[^"\\]|\\.)*)"[^}]*?"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"'
    
    blocks = re.findall(block_pattern, content, re.DOTALL)
    
    for sid, course_id, english, hindi in blocks:
        sentences.append({
            'id': sid,
            'courseId': course_id,
            'english': english,
            'hindi': hindi,
        })
    
    # If regex didn't catch all, also extract IDs without text
    found_ids = {s['id'] for s in sentences}
    for sid in unique_ids:
        if sid not in found_ids:
            course = sid.rsplit('-', 1)[0] if '-' in sid else 'unknown'
            sentences.append({
                'id': sid,
                'courseId': course,
                'english': '',
                'hindi': '',
            })
    
    return sentences

def generate_report():
    print("🔍 Scanning audio files...")
    audio_map = scan_audio_files()
    print(f"   Found {len(audio_map)} unique sentence IDs with audio")
    
    print("📄 Parsing content.ts...")
    sentences = parse_content_ts_fast()
    print(f"   Found {len(sentences)} sentences in content.ts")
    
    # Organize by course
    courses = defaultdict(lambda: {
        'total': 0,
        'en_valid': 0, 'en_invalid': 0, 'en_missing': 0,
        'hi_valid': 0, 'hi_invalid': 0, 'hi_missing': 0,
        'both_valid': 0,
        'missing_detail': []
    })
    
    content_map = {s['id']: s for s in sentences}
    all_ids = sorted(set(audio_map.keys()) | set(content_map.keys()))
    
    for sid in all_ids:
        if sid in content_map:
            course = content_map[sid]['courseId']
        else:
            course = sid.rsplit('-', 1)[0] if '-' in sid else 'unknown'
        
        courses[course]['total'] += 1
        audio = audio_map.get(sid, {'en': None, 'hi': None})
        
        en_ok = audio.get('en') and audio['en']['valid']
        hi_ok = audio.get('hi') and audio['hi']['valid']
        
        if en_ok:
            courses[course]['en_valid'] += 1
        elif audio.get('en') and not audio['en']['valid']:
            courses[course]['en_invalid'] += 1
        else:
            courses[course]['en_missing'] += 1
        
        if hi_ok:
            courses[course]['hi_valid'] += 1
        elif audio.get('hi') and not audio['hi']['valid']:
            courses[course]['hi_invalid'] += 1
        else:
            courses[course]['hi_missing'] += 1
        
        if en_ok and hi_ok:
            courses[course]['both_valid'] += 1
        
        if not en_ok or not hi_ok:
            courses[course]['missing_detail'].append({
                'id': sid,
                'en': '✅' if en_ok else ('⚠️' if audio.get('en') else '❌'),
                'hi': '✅' if hi_ok else ('⚠️' if audio.get('hi') else '❌'),
            })
    
    # Totals
    total = sum(c['total'] for c in courses.values())
    en_valid = sum(c['en_valid'] for c in courses.values())
    hi_valid = sum(c['hi_valid'] for c in courses.values())
    both_valid = sum(c['both_valid'] for c in courses.values())
    en_miss = sum(c['en_missing'] + c['en_invalid'] for c in courses.values())
    hi_miss = sum(c['hi_missing'] + c['hi_invalid'] for c in courses.values())
    
    # Audio file stats
    total_files = 0
    total_size = 0
    for root, dirs, files in os.walk(AUDIO_DIR):
        for f in files:
            if f.endswith('.mp3'):
                total_files += 1
                total_size += os.path.getsize(os.path.join(root, f))
    
    # ── Generate MD ──
    md = []
    md.append("# 🎙️ SunoBolo — Audio Status Report")
    md.append(f"**Updated:** August 21, 2026 | **Voice:** Sarvam AI (shubh, bulbul:v3)")
    md.append("")
    md.append("> **IMPORTANT:** Ye report batata hai kaun se sentences mein Sarvam AI premium audio hai aur kaun se mein nahi. Free tier accounts se generate ho raha hai — har account se ~50 sentences ban sakte hain.")
    md.append("")
    md.append("---")
    md.append("")
    
    md.append("## 📊 Overall Status")
    md.append("")
    md.append("| Metric | Count | Percentage |")
    md.append("|--------|-------|------------|")
    md.append(f"| Total Sentences (content.ts) | **{total}** | — |")
    md.append(f"| Total Audio Files | **{total_files}** | — |")
    md.append(f"| Total Audio Size | **{total_size / (1024*1024):.1f} MB** | — |")
    md.append(f"| ✅ EN Premium Audio | **{en_valid}** | {en_valid/total*100:.1f}% |" if total else "")
    md.append(f"| ✅ HI Premium Audio | **{hi_valid}** | {hi_valid/total*100:.1f}% |" if total else "")
    md.append(f"| ✅ Both EN+HI Ready | **{both_valid}** | {both_valid/total*100:.1f}% |" if total else "")
    md.append(f"| ❌ Still Need Audio | **{en_miss + hi_miss}** | — |")
    md.append(f"| 🔢 API Calls Still Needed | **~{en_miss + hi_miss}** | — |")
    md.append(f"| 💳 Free Accounts Needed | **~{(en_miss + hi_miss) // 50 + 1}** | 100 credits each |")
    md.append("")
    
    # Progress bars
    if total > 0:
        en_pct = en_valid / total * 100
        hi_pct = hi_valid / total * 100
        both_pct = both_valid / total * 100
        md.append("```")
        md.append(f"EN:  [{'█' * int(en_pct / 5)}{'░' * (20 - int(en_pct / 5))}] {en_pct:.1f}%")
        md.append(f"HI:  [{'█' * int(hi_pct / 5)}{'░' * (20 - int(hi_pct / 5))}] {hi_pct:.1f}%")
        md.append(f"Both:[{'█' * int(both_pct / 5)}{'░' * (20 - int(both_pct / 5))}] {both_pct:.1f}%")
        md.append("```")
        md.append("")
    
    md.append("---")
    md.append("")
    md.append("## 📚 Course-wise Status")
    md.append("")
    md.append("| Course | Total | EN ✅ | HI ✅ | Both ✅ | Missing | Status |")
    md.append("|--------|-------|-------|-------|---------|---------|--------|")
    
    course_order = ['free-trial', 'beginner', 'intermediate', 'advanced', 'daily-life',
                    'business', 'corporate', 'interview', 'kids', 'school', 'travel']
    
    for cname in course_order:
        if cname not in courses:
            continue
        c = courses[cname]
        miss = c['en_missing'] + c['en_invalid'] + c['hi_missing'] + c['hi_invalid']
        if miss == 0:
            status = "✅ DONE"
        elif c['both_valid'] > 0:
            status = f"⏳ {c['both_valid']}/{c['total']}"
        else:
            status = "❌ NOT STARTED"
        md.append(f"| **{cname}** | {c['total']} | {c['en_valid']} | {c['hi_valid']} | {c['both_valid']} | {miss} | {status} |")
    
    # Extra courses
    for cname in sorted(courses.keys()):
        if cname not in course_order:
            c = courses[cname]
            miss = c['en_missing'] + c['en_invalid'] + c['hi_missing'] + c['hi_invalid']
            md.append(f"| **{cname}** | {c['total']} | {c['en_valid']} | {c['hi_valid']} | {c['both_valid']} | {miss} | — |")
    
    md.append("")
    
    # ── Missing Detail ──
    md.append("---")
    md.append("")
    md.append("## ❌ Missing Audio — Kaun Kaun Se Sentences Baaki Hain")
    md.append("")
    
    any_missing = False
    for cname in course_order:
        if cname not in courses:
            continue
        c = courses[cname]
        if not c['missing_detail']:
            continue
        any_missing = True
        md.append(f"### {cname.upper()} ({len(c['missing_detail'])} sentences missing)")
        md.append("")
        md.append("| Sentence ID | EN | HI |")
        md.append("|-------------|-----|-----|")
        for s in c['missing_detail']:
            md.append(f"| `{s['id']}` | {s['en']} | {s['hi']} |")
        md.append("")
    
    if not any_missing:
        md.append("🎉 **Sab sentences ka audio ready hai!**")
        md.append("")
    
    # ── API Credits ──
    md.append("---")
    md.append("")
    md.append("## 🔑 API Keys & Credit Usage")
    md.append("")
    md.append("| # | Key (prefix) | Credits Used | Status |")
    md.append("|---|-------------|-------------|--------|")
    md.append("| 1 | `sk_7hnxnfa8_...` | ~100 | ⚠️ Exhausted |")
    md.append("| 2 | `sk_6vaspuhz_...` | ~100 | ⚠️ Exhausted |")
    md.append("| 3 | `sk_aypv66s0_...` | ~100 | ⚠️ Exhausted |")
    md.append("| 4 | `sk_759jdxj6_...` | ~100 | ⚠️ Exhausted |")
    md.append("| 5 | `sk_dj45kyhu_...` | ~100 | ⚠️ Exhausted |")
    md.append("")
    md.append("**Total credits used:** ~500 (5 accounts × 100 free)")
    md.append(f"**Total audio generated:** {en_valid + hi_valid} files")
    md.append(f"**Remaining to generate:** ~{en_miss + hi_miss} API calls")
    md.append(f"**New accounts needed:** ~{(en_miss + hi_miss) // 50 + 1} (100 credits each)")
    md.append("")
    
    # ── How to Resume ──
    md.append("---")
    md.append("")
    md.append("## 📋 Dubara Generate Kaise Karein")
    md.append("")
    md.append("```bash")
    md.append("# 1. Naya Sarvam AI account banao (free tier — 100 credits)")
    md.append("# 2. API key lo: Dashboard > Settings > API Keys")
    md.append("")
    md.append("# 3. Script mein key daalo:")
    md.append('cd "E:\\suno bolo english 2\\sunobolo-voice-fix (1)\\sunobolo\\sunobolo"')
    md.append("")
    md.append("# 4. sarvam_replace_all.py mein API_KEY update karo")
    md.append("python scripts/sarvam_replace_all.py")
    md.append("```")
    md.append("")
    md.append("*Script automatically skip karega jo already ban gaya hai.*")
    md.append("*Sirf missing/corrupt audio dubara banega.*")
    md.append("")
    
    # ── Other Status ──
    md.append("---")
    md.append("")
    md.append("## ✅ Other Things Ready")
    md.append("")
    md.append("| Item | Status | Notes |")
    md.append("|------|--------|-------|")
    md.append("| Content.ts | ✅ Done | Simple Hindi (not formal) |")
    md.append("| voiceConfig.ts | ✅ Done | All Sarvam AI |")
    md.append("| Hindi Simplification | ✅ Done | 74 sentences simplified |")
    md.append("| Razorpay Integration | ✅ Done | Test: localhost:3456 |")
    md.append("| Razorpay Backend | ✅ Done | create-order + verify + webhook |")
    md.append("| Repeat Instruction Audio | ✅ Done | Sarvam AI Shubh voice |")
    md.append("")
    
    md.append("---")
    md.append(f"*Report generated by audio_report.py — Run anytime for updated status*")
    
    report = '\n'.join(md)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # JSON
    json_data = {
        'generated_at': '2026-08-21',
        'totals': {
            'sentences': total,
            'audio_files': total_files,
            'audio_size_mb': round(total_size / (1024*1024), 1),
            'en_valid': en_valid,
            'hi_valid': hi_valid,
            'both_valid': both_valid,
            'en_missing': en_miss,
            'hi_missing': hi_miss,
        },
        'courses': {},
        'missing_sentences': [],
    }
    for cname, c in courses.items():
        json_data['courses'][cname] = {
            'total': c['total'],
            'en_valid': c['en_valid'],
            'hi_valid': c['hi_valid'],
            'both_valid': c['both_valid'],
            'missing': len(c['missing_detail']),
        }
        for s in c['missing_detail']:
            json_data['missing_sentences'].append(s)
    
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*50}")
    print(f"✅ REPORT: {OUTPUT_FILE}")
    print(f"{'='*50}")
    print(f"   Total Sentences: {total}")
    print(f"   EN Premium Audio: {en_valid}/{total} ({en_valid/total*100:.1f}%)")
    print(f"   HI Premium Audio: {hi_valid}/{total} ({hi_valid/total*100:.1f}%)")
    print(f"   Both Ready: {both_valid}/{total} ({both_valid/total*100:.1f}%)")
    print(f"   Still Need: {en_miss + hi_miss} API calls")
    print(f"   Accounts Needed: ~{(en_miss + hi_miss) // 50 + 1}")
    print(f"{'='*50}")

if __name__ == '__main__':
    generate_report()
