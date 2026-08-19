// Content generation script - run with: npx tsx scripts/generate-content.ts
// This generates the content JSON file

const fs = require('fs');
const path = require('path');

function s(id, courseId, lessonOrder, order, english, hindi, topic, difficulty, isFree) {
  const lessonNum = String(lessonOrder).padStart(2, '0');
  return {
    id: courseId + '-' + String(id).padStart(3, '0'),
    courseId,
    lessonId: courseId + '-' + lessonNum,
    order,
    english,
    hindi,
    topic,
    difficulty: difficulty || 'Beginner',
    isFree: isFree || false,
  };
}

function lesson(id, courseId, modId, order, title, desc, topic, sentences, difficulty) {
  return {
    id: courseId + '-' + id,
    courseId,
    moduleId: courseId + '-' + modId,
    order,
    title,
    description: desc,
    difficulty: difficulty || 'Beginner',
    topic,
    sentenceCount: sentences.length,
    estimatedMinutes: Math.ceil(sentences.length / 2.5),
    sentences,
  };
}

function courseData(id, title, desc, short, icon, color, difficulty, audience, lessons, price) {
  const totalS = lessons.reduce((a, l) => a + l.sentenceCount, 0);
  return {
    id,
    title,
    description: desc,
    shortDescription: short,
    icon,
    color,
    difficulty,
    targetAudience: audience,
    totalSentences: totalS,
    totalLessons: lessons.length,
    estimatedHours: Math.max(1, Math.round(totalS / 25)),
    isFree: false,
    price: price || '₹199',
    lessons,
    modules: [{
      id: id + '-mod-1',
      courseId: id,
      order: 1,
      title: title + ' Course',
      description: desc,
      lessons,
    }],
  };
}

// ============ FREE TRIAL ============

const freeTrial = lesson('free-trial', 'free-trial', 'free-trial', 1,
  'Free Trial - 25 Practical Sentences',
  'Try SunoBolo with 25 real-life sentences. No login required.',
  'Mixed',
  [
    s(1, 'free-trial', 1, 1, "Good morning. How are you?", "सुप्रभात। आप कैसे हैं?", "Greetings", "Beginner", true),
    s(2, 'free-trial', 1, 2, "My name is Priya. What is your name?", "मेरा नाम प्रिया है। आपका नाम क्या है?", "Introduction", "Beginner", true),
    s(3, 'free-trial', 1, 3, "I am from India. Where are you from?", "मैं भारत से हूँ। आप कहाँ से हैं?", "Introduction", "Beginner", true),
    s(4, 'free-trial', 1, 4, "I wake up at 6 o'clock every day.", "मैं हर दिन 6 बजे उठता हूँ।", "Daily Routine", "Beginner", true),
    s(5, 'free-trial', 1, 5, "Can you please call me later?", "क्या आप मुझे बाद में कॉल कर सकते हैं?", "Phone", "Beginner", true),
    s(6, 'free-trial', 1, 6, "How much does this cost?", "इसकी कीमत कितनी है?", "Shopping", "Beginner", true),
    s(7, 'free-trial', 1, 7, "I'm sorry, I'm running late.", "माफ़ कीजिए, मुझे देर हो रही है।", "Being Late", "Beginner", true),
    s(8, 'free-trial', 1, 8, "Could you please help me with this?", "क्या आप इसमें मेरी मदद कर सकते हैं?", "Requests", "Beginner", true),
    s(9, 'free-trial', 1, 9, "I don't understand. Can you repeat?", "मुझे समझ नहीं आया। क्य आप दहरा सकते ह?", "Asking for Help", "Beginner", true),
    s(10, 'free-trial', 1, 10, "What are your plans for the weekend?", "आपके वीकेंड के क्या प्लान हैं?", "Plans", "Beginner", true),
    s(11, 'free-trial', 1, 11, "I work in an office. What do you do?", "मैं ऑफिस में काम करता हूँ। आप क्या करते ह?", "Work", "Beginner", true),
    s(12, 'free-trial', 1, 12, "Where is the nearest bus stop?", "सबस नजदक बस सटप कह ह?", "Travel", "Beginner", true),
    s(13, 'free-trial', 1, 13, "My internet is not working.", "मेर इटरनेट काम नह कर रह ह।", "Customer Problems", "Beginner", true),
    s(14, 'free-trial', 1, 14, "Thank you so much for your help!", "आपकी मदद के लिए बहुत धन्यवाद!", "Common Conversation", "Beginner", true),
    s(15, 'free-trial', 1, 15, "Excuse me, can you tell me the time?", "्क्षमा करें, क्या आप समय बता सकते हैं?", "Common Conversation", "Beginner", true),
    s(16, 'free-trial', 1, 16, "I am learning English. It is useful.", "मअगज सख रह ह। यह बहत उपयग ह।", "Common Conversation", "Beginner", true),
    s(17, 'free-trial', 1, 17, "Let's meet at the coffee shop at 4.", "चलए 4 बज कफ शप पर मलत ह।", "Plans"),
  ]
);