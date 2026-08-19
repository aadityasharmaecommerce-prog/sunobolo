import re
from pathlib import Path

ROOT = Path("/home/user/sunobolo")
CONTENT = (ROOT / "src" / "data" / "content.ts").read_text(encoding="utf-8")
OUT = ROOT / "migrations" / "0002_seed.sql"

COURSE_META = {
    "free-trial":   ("Free Trial","Free Trial","Practice 25 free sentences with Hindi meaning and Indian English audio.", "Beginner",'["Everyone"]',"🎧","accent",1,0,"Truly free - no login, no card."),
    "beginner":     ("Beginner English","Start from zero","Start from zero and build a strong foundation in spoken English.", "Beginner",'["Absolute Beginners","School Students"]',"🟢","brand",1,1,"From greetings to travel bookings."),
    "intermediate": ("Intermediate English","Speak with confidence","Speak with confidence in conversations.", "Beginner",'["Intermediate Learners"]',"📈","accent",1,2,"Share opinions, give reasons."),
    "advanced":     ("Advanced English","Master pro communication","Master professional communication.", "Advanced",'["Advanced Learners"]',"🎯","brand",1,3,"Lead conversations and negotiate."),
    "daily-life":   ("Daily Life English","Everyday situations","Speak English in everyday situations.", "Beginner",'["Daily Life Learners"]',"🏠","brand",1,4,"Master the sentences you use every day."),
    "interview":    ("Interview English","Ace your next interview","Ace your next job interview.", "Intermediate",'["Job Seekers"]',"💼","accent",1,5,"Self-intro, HR, salary."),
    "corporate":    ("Corporate English","Office English","Excel at office English.", "Intermediate",'["Working Professionals"]',"🏢","brand",1,6,"Sound professional."),
    "business":     ("Business English","Grow your business","Grow your business with strong English.", "Intermediate",'["Business Owners"]',"💰","accent",1,7,"Negotiate, close deals, pitch."),
    "travel":       ("Travel English","Travel confidently","Travel confidently with key phrases.", "Beginner",'["Travelers"]',"✈️","accent",1,8,"Airport, hotel, taxi, emergency."),
    "school":       ("School English","School bacchon ke liye","Aapke bacchon ke liye school English.", "Beginner",'["School Students"]',"🎒","brand",1,9,"Classroom and exam English."),
    "kids":         ("Kids English","Fun English for children","Fun, simple English for children.", "Beginner",'["Children","Parents"]',"👶","accent",1,10,"Colours, animals, toys, family."),
}

pattern = re.compile(
    r'"id"\s*:\s*"(?P<id>[^"]+)",\s*'
    r'"courseId"\s*:\s*"(?P<courseId>[^"]+)",\s*'
    r'"lessonId"\s*:\s*"(?P<lessonId>[^"]+)",\s*'
    r'"order"\s*:\s*(?P<order>\d+),\s*'
    r'"english"\s*:\s*"(?P<english>(?:[^"\\]|\\.)*)",\s*'
    r'"hindi"\s*:\s*"(?P<hindi>(?:[^"\\]|\\.)*)"',
    re.DOTALL,
)

seen = set()
sentences = []
seen_lessons = set()
lesson_titles = {}

for m in pattern.finditer(CONTENT):
    sid = m.group('id')
    if sid in seen: continue
    seen.add(sid)
    lid = m.group('lessonId')
    seen_lessons.add(lid)
    eng = m.group('english').replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
    sentences.append({
        'id': sid,
        'courseId': m.group('courseId'),
        'lessonId': lid,
        'order': m.group('order'),
        'english': eng,
        'hindi': m.group('hindi').replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\'),
    })

# Extract lesson titles
title_re = re.compile(r'"id"\s*:\s*"([^"]+)",\s*"title"\s*:\s*"([^"]+)"')
for m in title_re.finditer(CONTENT):
    if m.group(1) not in lesson_titles:
        lesson_titles[m.group(1)] = m.group(2)

by_course = {}
for s in sentences:
    by_course.setdefault(s['courseId'], []).append(s)

lines = [
    "-- SunoBolo English - D1 seed (auto-generated from src/data/content.ts)",
    f"-- {len(COURSE_META)} courses + {len(seen_lessons)} lessons + {len(sentences)} sentences",
    "",
    "BEGIN TRANSACTION;",
    "",
    "-- Courses",
]
for cid, meta in COURSE_META.items():
    title, tagline, desc, level, aud, emoji, color, isfree, sort, long_desc = meta
    aud_sql = '"' + '","'.join(eval(aud)) + '"'
    sents = by_course.get(cid, [])
    lc = len(set(s['lessonId'] for s in sents))
    sc = len(sents)
    title_safe = title.replace("'", "''")
    tagline_safe = tagline.replace("'", "''")
    desc_safe = desc.replace("'", "''")
    long_safe = long_desc.replace("'", "''")
    lines.append(
        f"INSERT OR REPLACE INTO courses (id, slug, title, tagline, description, long_description, "
        f"level, audience, emoji, color, is_free, sort_order, lesson_count, sentence_count) VALUES "
        f"('{cid}', '{cid}', '{title_safe}', '{tagline_safe}', '{desc_safe}', '{long_safe}', "
        f"'{level}', '{aud_sql}', '{emoji}', '{color}', {isfree}, {sort}, {lc}, {sc});"
    )

lines.append("")
lines.append("-- Lessons")
for cid in by_course:
    seen_l = set()
    for s in by_course[cid]:
        lid = s['lessonId']
        if lid in seen_l: continue
        seen_l.add(lid)
        sc = sum(1 for x in sentences if x['lessonId'] == lid)
        title_safe = lesson_titles.get(lid, lid).replace("'", "''")
        lines.append(
            f"INSERT OR REPLACE INTO lessons (id, course_id, title, sort_order, sentence_count) VALUES "
            f"('{lid}', '{cid}', '{title_safe}', 0, {sc});"
        )

lines.append("")
lines.append("-- Sentences (audio files at /audio/{course_id}/{sentence_id}.mp3)")
for s in sentences:
    eng = s['english'].replace("'", "''")
    hin = s['hindi'].replace("'", "''")
    lines.append(
        f"INSERT OR REPLACE INTO sentences (id, course_id, lesson_id, english, hindi, sort_order, is_free) VALUES "
        f"('{s['id']}', '{s['courseId']}', '{s['lessonId']}', '{eng}', '{hin}', {s['order']}, 1);"
    )

lines.append("")
lines.append("COMMIT;")
lines.append(f"-- Total: {len(COURSE_META)} courses, {len(seen_lessons)} lessons, {len(sentences)} sentences")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"OK Seed: {OUT}")
print(f"   {len(COURSE_META)} courses, {len(seen_lessons)} lessons, {len(sentences)} sentences")
print(f"   {OUT.stat().st_size} bytes")
