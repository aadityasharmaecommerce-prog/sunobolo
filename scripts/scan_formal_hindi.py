"""Scan all sentences and identify which have overly formal Hindi."""
import sys, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re
from collections import defaultdict

# Formal Hindi indicators - words that normal people don't use in daily speech
FORMAL_WORDS = [
    'त्रैमासिक', 'हितधारक', 'परिणामों', 'संरेखित', 'डिलिवरेबल', 'प्रतिक्रिया',
    'स्थापित', 'तात्कालिकता', 'प्राथमिकता', 'संकोच', 'अभिप्राय', 'उद्देश्य',
    'संदर्भ', 'संलग्न', 'त्वरित', 'अनुमोदन', 'प्रस्ताव', 'विचार', 'दृष्टिकोण',
    'निहितार्थ', 'स्थिरता', 'अल्पकालिक', 'दीर्घकालिक', 'प्रतिमान', 'आलोचनात्मक',
    'अंतर्निहित', 'प्रणालीगत', 'रणनीतिक', 'विपरीत', 'साक्ष्य', 'उल्लिखित',
    'सिफारिश', 'क्रियान्वयन', 'निहितार्थों', 'संतुलित', 'आपत्तियाँ', 'निष्कर्षों',
    'ढांचा', 'विश्लेषण', 'प्रतिमान', 'सशक्त', 'मनोबल', 'रचनात्मक', 'लचीलापन',
    'मध्यस्थता', 'सहानुभूति', 'मध्यम', 'प्रतिस्पर्धात्मक', 'रियायतें',
    'पारस्परिक', 'संतोषजनक', 'अनुनय', 'सक्रिय', 'परिभाषित',
    'अनुमान', 'अंतर्निहित', 'प्रतिमान', 'प्रतिक्रिया', 'क्रियान्वयन',
    'विचारपूर्ण', 'निष्पक्षता', 'सावधानीपूर्वक', 'स्पष्टता', 'आत्मविश्वास',
    'प्रेरित', 'संवाद', 'व्यस्त', 'यादगार', 'निर्णय', 'समझौते',
    'क्षमा', 'गलतफहमी', 'मध्यम', 'संघर्ष', 'स्वस्थ', 'समाधान',
]

with open("src/data/content.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = (
    r'"id":\s*"([^"]+)".*?"courseId":\s*"([^"]+)".*?'
    r'"english":\s*"((?:[^"\\]|\\.)*)".*?'
    r'"hindi":\s*"((?:[^"\\]|\\.)*)"'
)
matches = re.findall(pattern, text, re.DOTALL)

seen = set()
by_course = defaultdict(list)
for sid, cid, eng, hin in matches:
    if sid in seen:
        continue
    seen.add(sid)
    # Check for formal words
    formal_count = sum(1 for w in FORMAL_WORDS if w in hin)
    by_course[cid].append({
        'id': sid, 'english': eng, 'hindi': hin,
        'formal_score': formal_count
    })

print("=" * 70)
print("FORMAL HINDI SCAN RESULTS")
print("=" * 70)

for course in sorted(by_course.keys()):
    sentences = by_course[course]
    formal = [s for s in sentences if s['formal_score'] > 0]
    print(f"\n{course.upper()}: {len(sentences)} total, {len(formal)} with formal Hindi")
    
    if formal:
        # Sort by formality score (most formal first)
        formal.sort(key=lambda x: x['formal_score'], reverse=True)
        for s in formal[:5]:
            print(f"  [{s['id']}] (score: {s['formal_score']})")
            print(f"    EN: {s['english'][:70]}")
            print(f"    HI: {s['hindi'][:70]}")
        if len(formal) > 5:
            print(f"  ... and {len(formal)-5} more")

total_formal = sum(len([s for s in v if s['formal_score'] > 0]) for v in by_course.values())
print(f"\n{'='*70}")
print(f"TOTAL: {total_formal} sentences need Hindi simplification")
print(f"{'='*70}")
