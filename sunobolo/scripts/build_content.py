#!/usr/bin/env python3
"""Build the complete SunoBolo content.ts from sentence banks."""
import json, os, sys

sys.path.insert(0, os.path.dirname(__file__))

from content.bank_common import get_common_banks
from content.bank_beginner import get_beginner_banks
from content.bank_intermediate import get_intermediate_banks
from content.bank_advanced import get_advanced_banks
from content.bank_dailylife import get_dailylife_banks
from content.bank_interview import get_interview_banks
from content.bank_corporate import get_corporate_banks
from content.bank_business import get_business_banks
from content.bank_travel import get_travel_banks
from content.bank_school import get_school_banks
from content.bank_kids import get_kids_banks

def build_course(course_id, title, desc, short, icon, color, difficulty, audience, lessons, price):
    total = sum(len(l["sentences"]) for l in lessons)
    return {
        "id": course_id, "title": title, "description": desc, "shortDescription": short,
        "icon": icon, "color": color, "difficulty": difficulty, "targetAudience": audience,
        "totalSentences": total, "totalLessons": len(lessons),
        "estimatedHours": max(1, round(total / 25)),
        "isFree": False, "price": price,
        "lessons": lessons,
        "modules": [{"id": course_id + "-mod-1", "courseId": course_id, "order": 1,
                     "title": title + " Course", "description": desc, "lessons": lessons}]
    }

def build_lesson(lesson_id, course_id, mod_id, order, title, desc, topic, sentences, difficulty):
    return {
        "id": course_id + "-" + lesson_id, "courseId": course_id,
        "moduleId": course_id + "-" + mod_id, "order": order,
        "title": title, "description": desc, "difficulty": difficulty, "topic": topic,
        "sentenceCount": len(sentences), "estimatedMinutes": max(5, len(sentences) // 3),
        "sentences": sentences
    }

def make_sentence(idx, course_id, lesson_order, order, eng, hin, topic, difficulty, free=False):
    lid = course_id + "-" + str(lesson_order).zfill(2)
    return {
        "id": course_id + "-" + str(idx).zfill(3),
        "courseId": course_id, "lessonId": lid, "order": order,
        "english": eng, "hindi": hin, "topic": topic,
        "difficulty": difficulty, "isFree": free
    }

def build_sentences(course_id, lesson_order, start_idx, pairs, topic, difficulty, free=False):
    out = []
    for i, (eng, hin) in enumerate(pairs):
        out.append(make_sentence(start_idx + i, course_id, lesson_order, start_idx + i, eng, hin, topic, difficulty, free))
    return out

# Load all banks
banks = {}
for name, fn in [
    ("common", get_common_banks), ("beginner", get_beginner_banks), ("intermediate", get_intermediate_banks),
    ("advanced", get_advanced_banks), ("dailylife", get_dailylife_banks), ("interview", get_interview_banks),
    ("corporate", get_corporate_banks), ("business", get_business_banks), ("travel", get_travel_banks),
    ("school", get_school_banks), ("kids", get_kids_banks)
]:
    banks[name] = fn()

# ============ FREE TRIAL (25 sentences, premium audio) ============
free_trial_pairs = [
    ("Good morning. How are you?", "सुप्रभात। आप कैसे हैं?"),
    ("My name is Priya. What is your name?", "मेरा नाम प्रिया है। आपका नाम क्या है?"),
    ("I am from India. Where are you from?", "मैं भारत से हूँ। आप कहाँ से हैं?"),
    ("I wake up at 6 o'clock every day.", "मैं हर दिन 6 बजे उठता हूँ।"),
    ("Can you please call me later?", "क्या आप मुझे बाद में कॉल कर सकते हैं?"),
    ("How much does this cost?", "इसकी कीमत कितनी है?"),
    ("I'm sorry, I'm running late.", "माफ़ कीजिए, मुझे देर हो रही है।"),
    ("Could you please help me with this?", "क्या आप इसमें मेरी मदद कर सकते हैं?"),
    ("I don't understand. Can you repeat?", "मुझे समझ नहीं आया। क्या आप दोहरा सकते हैं?"),
    ("What are your plans for the weekend?", "आपके वीकेंड के क्या प्लान हैं?"),
    ("I work in an office. What do you do?", "मैं ऑफिस में काम करता हूँ। आप क्या करते हैं?"),
    ("Where is the nearest bus stop?", "सबसे नज़दीकी बस स्टॉप कहाँ है?"),
    ("My internet connection is not working.", "मेरा इंटरनेट काम नहीं कर रहा है।"),
    ("Thank you so much for your help!", "आपकी मदद के लिए बहुत धन्यवाद!"),
    ("Excuse me, can you tell me the time?", "क्षमा करें, क्या आप मुझे समय बता सकते हैं?"),
    ("I am learning English. It is very useful.", "मैं अंग्रेज़ी सीख रहा हूँ। यह बहुत उपयोगी है।"),
    ("Let's meet at the coffee shop at 4.", "चलिए 4 बजे कॉफ़ी शॉप पर मिलते हैं।"),
    ("The traffic is very heavy today.", "आज ट्रैफ़िक बहुत ज़्यादा है।"),
    ("Have a great day!", "आपका दिन शुभ हो!"),
    ("Do you have this in a smaller size?", "क्या यह छोटे साइज़ में है?"),
    ("I need to book a hotel room for two nights.", "मुझे दो रात के लिए होटल का कमरा बुक करना है।"),
    ("I ordered a product but it hasn't arrived yet.", "मैंने प्रोडक्ट ऑर्डर किया था लेकिन अभी तक नहीं आया।"),
    ("I'll call you back in five minutes.", "मैं पाँच मिनट में वापस कॉल करूँगा।"),
    ("I have a meeting at 10 AM tomorrow.", "मेरी कल सुबह 10 बजे मीटिंग है।"),
    ("Nice to meet you!", "आपसे मिलकर खुशी हुई!"),
]
free_trial_sentences = [make_sentence(i+1, "free-trial", 1, i+1, e, h, "Mixed", "Beginner", True) for i, (e, h) in enumerate(free_trial_pairs)]
free_trial_lesson = build_lesson("free-trial", "free-trial", "free-trial", 1,
    "Free Trial — 25 Practical Sentences", "Try SunoBolo with 25 real-life sentences. No login required.",
    "Mixed", free_trial_sentences, "Beginner")

# ============ Build all courses ============
courses = []
for bank in [banks["beginner"], banks["intermediate"], banks["advanced"], banks["dailylife"],
             banks["interview"], banks["corporate"], banks["business"], banks["travel"],
             banks["school"], banks["kids"]]:
    lessons = []
    idx = 1
    for li, lesson_def in enumerate(bank["lessons"]):
        topic = lesson_def["topic"]
        pairs = lesson_def["sentences"]
        sents = build_sentences(bank["course_id"], li+1, idx, pairs, topic, bank["difficulty"])
        idx += len(pairs)
        lessons.append(build_lesson(str(li+1).zfill(2), bank["course_id"], "mod-1", li+1,
                                    lesson_def["title"], lesson_def["desc"], topic, sents, bank["difficulty"]))
    courses.append(build_course(bank["course_id"], bank["title"], bank["desc"], bank["short"],
                                bank["icon"], bank["color"], bank["difficulty"], bank["audience"],
                                lessons, bank["price"]))

# ============ Generate TypeScript ============
def ts_repr(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)

lines = []
lines.append("// ============================================")
lines.append("// SUNOBOLO ENGLISH - CONTENT DATABASE (AUTO-GENERATED)")
lines.append("// 3000+ practical English sentences with Hindi meanings")
lines.append("// ============================================")
lines.append("")
lines.append("export interface SentenceData {")
for field in ["id","courseId","lessonId","english","hindi","topic","difficulty"]:
    lines.append(f"  {field}: string;")
lines.append("  order: number;")
lines.append("  isFree: boolean;")
lines.append("}")
lines.append("")
lines.append("export interface LessonData {")
lines.append("  id: string; courseId: string; moduleId: string; order: number;")
lines.append("  title: string; description: string; difficulty: string; topic: string;")
lines.append("  sentenceCount: number; estimatedMinutes: number; sentences: SentenceData[];")
lines.append("}")
lines.append("")
lines.append("export interface CourseData {")
lines.append("  id: string; title: string; description: string; shortDescription: string;")
lines.append("  icon: string; color: string; difficulty: string; targetAudience: string[];")
lines.append("  totalSentences: number; totalLessons: number; estimatedHours: number;")
lines.append("  isFree: boolean; price?: string; lessons: LessonData[];")
lines.append("  modules: { id: string; courseId: string; order: number; title: string; description: string; lessons: LessonData[] }[];")
lines.append("}")
lines.append("")
lines.append(f"export const freeTrialLesson: LessonData = {ts_repr(free_trial_lesson)};")
lines.append("")
for c in courses:
    lines.append(f"export const {c['id'].replace('-','_')}Course: CourseData = {ts_repr(c)};")
    lines.append("")
lines.append("export const allCourses: CourseData[] = [")
for c in courses:
    lines.append(f"  {c['id'].replace('-','_')}Course,")
lines.append("];")
lines.append("")

output = "\n".join(lines)
out_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "content.ts")
with open(out_path, "w") as f:
    f.write(output)

# Print stats
total = 25 + sum(c["totalSentences"] for c in courses)
print(f"✅ content.ts generated!")
print(f"   Free trial: 25 sentences")
for c in courses:
    print(f"   {c['title']:<25} {c['totalSentences']:>5} sentences / {c['totalLessons']:>3} lessons")
print(f"   TOTAL: {total} sentences")
