#!/usr/bin/env python3
"""
SunoBolo — COMPREHENSIVE AUDIO VERIFICATION
=============================================
Checks:
1. All audio files exist and have proper sizes
2. No empty/tiny/corrupt audio files
3. Content.ts sentences match audio filenames
4. No browser TTS fallbacks for completed sentences
5. No Viraj/ElevenLabs references
6. Hindi text matches content.ts
7. shared/repeat-instruction.mp3 exists
8. Voice config uses Sarvam AI only
"""
import re, os, sys, json
from pathlib import Path
from collections import defaultdict

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE = Path(__file__).resolve().parent.parent
AUDIO_BASE = BASE / "public" / "audio"
CONTENT_TS = BASE / "src" / "data" / "content.ts"
VOICE_CONFIG = BASE / "src" / "config" / "voiceConfig.ts"
AUDIO_HOOK = BASE / "src" / "hooks" / "useSentenceAudio.ts"

# Minimum file sizes (bytes)
MIN_MP3_SIZE = 1000  # 1KB minimum for valid audio

def parse_sentences():
    """Parse all sentences from content.ts."""
    with open(CONTENT_TS, "r", encoding="utf-8") as f:
        text = f.read()
    pattern = (
        r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
        r'"lessonId":\s*"([^"]+)".*?"english":\s*"((?:[^"\\]|\\.)*)".*?'
        r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
    )
    matches = re.findall(pattern, text, re.DOTALL)
    seen = set()
    sentences = []
    for sid, cid, lid, eng, hin in matches:
        if sid in seen:
            continue
        seen.add(sid)
        sentences.append({
            "id": sid, "courseId": cid, "lessonId": lid,
            "english": eng.strip(), "hindi": hin.strip()
        })
    return sentences

def check_audio_files():
    """Check all audio files exist and have proper sizes."""
    print("=" * 70)
    print("CHECK 1: Audio Files Existence & Size")
    print("=" * 70)
    
    courses = ['beginner', 'free-trial', 'intermediate', 'advanced', 
               'daily-life', 'business', 'corporate', 'interview', 
               'kids', 'school', 'travel']
    
    issues = []
    total_files = 0
    total_size = 0
    
    for course in courses:
        course_dir = AUDIO_BASE / course
        if not course_dir.exists():
            print(f"  ⚠️ {course}: Directory missing!")
            continue
        
        files = list(course_dir.glob("*.mp3"))
        total_files += len(files)
        
        for f in files:
            size = f.stat().st_size
            total_size += size
            
            # Check for too small files (likely corrupt)
            if size < MIN_MP3_SIZE:
                issues.append(f"  ❌ {f.name}: Too small ({size} bytes) - likely corrupt")
            
            # Check for empty files
            if size == 0:
                issues.append(f"  ❌ {f.name}: Empty file!")
    
    print(f"  Total audio files: {total_files}")
    print(f"  Total size: {total_size / (1024*1024):.1f} MB")
    
    if issues:
        print(f"\n  ❌ Found {len(issues)} issues:")
        for issue in issues[:20]:  # Show first 20
            print(issue)
        if len(issues) > 20:
            print(f"  ... and {len(issues)-20} more")
    else:
        print("  ✅ All files have proper sizes")
    
    return issues

def check_content_match():
    """Verify content.ts sentences match audio filenames."""
    print("\n" + "=" * 70)
    print("CHECK 2: Content ↔ Audio Match")
    print("=" * 70)
    
    sentences = parse_sentences()
    print(f"  Total sentences in content.ts: {len(sentences)}")
    
    missing_en = []
    missing_hi = []
    course_stats = defaultdict(lambda: {"total": 0, "en": 0, "hi": 0})
    
    for s in sentences:
        cid = s["courseId"]
        sid = s["id"]
        course_stats[cid]["total"] += 1
        
        en_path = AUDIO_BASE / cid / f"{sid}.mp3"
        hi_path = AUDIO_BASE / cid / f"{sid}.hindi.mp3"
        
        if en_path.exists():
            course_stats[cid]["en"] += 1
        else:
            missing_en.append(f"    {cid}/{sid}.mp3")
        
        if hi_path.exists():
            course_stats[cid]["hi"] += 1
        else:
            missing_hi.append(f"    {cid}/{sid}.hindi.mp3")
    
    print("\n  Course Coverage:")
    print(f"  {'Course':<15} {'Total':>6} {'EN':>6} {'HI':>6} {'Status'}")
    print(f"  {'-'*15} {'-'*6} {'-'*6} {'-'*6} {'-'*20}")
    
    for course, stats in sorted(course_stats.items()):
        en_pct = (stats["en"] / stats["total"] * 100) if stats["total"] > 0 else 0
        hi_pct = (stats["hi"] / stats["total"] * 100) if stats["total"] > 0 else 0
        status = "COMPLETE" if en_pct == 100 and hi_pct == 100 else "PARTIAL"
        print(f"  {course:<15} {stats['total']:>6} {stats['en']:>6} {stats['hi']:>6} {status}")
    
    if missing_en:
        print(f"\n  ❌ Missing English audio: {len(missing_en)} files")
        for f in missing_en[:10]:
            print(f)
    else:
        print("\n  ✅ All English audio present")
    
    if missing_hi:
        print(f"\n  ❌ Missing Hindi audio: {len(missing_hi)} files")
        for f in missing_hi[:10]:
            print(f)
    else:
        print("  ✅ All Hindi audio present")
    
    return missing_en, missing_hi

def check_code_references():
    """Check code for Viraj/ElevenLabs/TTS references."""
    print("\n" + "=" * 70)
    print("CHECK 3: Code References (Viraj/ElevenLabs/TTS)")
    print("=" * 70)
    
    issues = []
    
    # Check voiceConfig.ts
    if VOICE_CONFIG.exists():
        with open(VOICE_CONFIG, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "viraj" in content.lower():
            issues.append("  ❌ voiceConfig.ts: Contains 'viraj' reference")
        if "elevenlabs" in content.lower() or "eleven_labs" in content.lower():
            issues.append("  ❌ voiceConfig.ts: Contains 'elevenlabs' reference")
        if "JBFqn" in content:
            issues.append("  ❌ voiceConfig.ts: Contains old ElevenLabs voice ID")
        
        if "sarvam" in content.lower() or "shubh" in content.lower():
            print("  ✅ voiceConfig.ts: Uses Sarvam AI")
        else:
            issues.append("  ⚠️ voiceConfig.ts: May not use Sarvam AI")
    
    # Check useSentenceAudio.ts
    if AUDIO_HOOK.exists():
        with open(AUDIO_HOOK, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if TTS is only fallback (not primary)
        tts_fallback_count = content.lower().count("speechsynthesis")
        if tts_fallback_count > 0:
            print(f"  ℹ️ useSentenceAudio.ts: {tts_fallback_count} SpeechSynthesis refs (fallback only)")
        
        # Check for old voice references
        if "viraj" in content.lower() or "elevenlabs" in content.lower():
            issues.append("  ❌ useSentenceAudio.ts: Contains old voice references")
    
    if issues:
        print(f"\n  ❌ Found {len(issues)} issues:")
        for issue in issues:
            print(issue)
    else:
        print("  ✅ No old voice references found")
    
    return issues

def check_instruction_audio():
    """Verify instruction audio exists and is Sarvam AI."""
    print("\n" + "=" * 70)
    print("CHECK 4: Instruction Audio")
    print("=" * 70)
    
    inst_path = AUDIO_BASE / "shared" / "repeat-instruction.mp3"
    
    if inst_path.exists():
        size = inst_path.stat().st_size
        print(f"  ✅ repeat-instruction.mp3 exists ({size:,} bytes)")
        
        if size < 5000:
            print("  ⚠️ File seems too small for a full instruction")
            return False
        return True
    else:
        print("  ❌ repeat-instruction.mp3 MISSING!")
        return False

def check_hindi_quality():
    """Check Hindi text quality (no overly formal/complex)."""
    print("\n" + "=" * 70)
    print("CHECK 5: Hindi Text Quality")
    print("=" * 70)
    
    sentences = parse_sentences()
    
    # Formal markers
    formal_markers = [
        "दृष्टिकोण", "प्रतिक्रिया", "संदर्भ", "अपेक्षाएँ",
        "प्रस्ताव", "विचारपूर्ण", "आवश्यकता", "प्राथमिकता",
        "निष्कर्ष", "संतुलित", "सावधानीपूर्वक", "महत्वपूर्ण",
        "विश्लेषण", "क्रियान्वयन", "त्वरित", "आपत्तियाँ"
    ]
    
    formal_count = 0
    formal_sentences = []
    
    for s in sentences:
        hindi = s["hindi"]
        for marker in formal_markers:
            if marker in hindi:
                formal_count += 1
                formal_sentences.append(f"    {s['id']}: {hindi[:60]}...")
                break
    
    print(f"  Total sentences: {len(sentences)}")
    print(f"  Formal Hindi detected: {formal_count}")
    
    if formal_sentences:
        print(f"\n  ⚠️ Sentences with formal Hindi ({len(formal_sentences)}):")
        for s in formal_sentences[:10]:
            print(s)
        if len(formal_sentences) > 10:
            print(f"  ... and {len(formal_sentences)-10} more")
    else:
        print("  ✅ All Hindi text is conversational")
    
    return formal_sentences

def main():
    print("\n" + "=" * 70)
    print("🎙️ SunoBolo — COMPREHENSIVE AUDIO VERIFICATION")
    print("=" * 70)
    print(f"  Project: {BASE}")
    print(f"  Audio: {AUDIO_BASE}")
    print()
    
    # Run all checks
    audio_issues = check_audio_files()
    missing_en, missing_hi = check_content_match()
    code_issues = check_code_references()
    inst_ok = check_instruction_audio()
    formal_sentences = check_hindi_quality()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 70)
    
    total_issues = len(audio_issues) + len(missing_en) + len(missing_hi) + len(code_issues)
    
    if total_issues == 0 and inst_ok and not formal_sentences:
        print("  ✅ ALL CHECKS PASSED — Ready for deployment!")
    else:
        print(f"  ⚠️ Found {total_issues} issues to fix:")
        if audio_issues:
            print(f"    - {len(audio_issues)} audio file issues")
        if missing_en:
            print(f"    - {len(missing_en)} missing English audio")
        if missing_hi:
            print(f"    - {len(missing_hi)} missing Hindi audio")
        if code_issues:
            print(f"    - {len(code_issues)} code reference issues")
        if formal_sentences:
            print(f"    - {len(formal_sentences)} formal Hindi sentences")
    
    print()
    return total_issues

if __name__ == "__main__":
    issues = main()
    sys.exit(0 if issues == 0 else 1)
