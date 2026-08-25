/**
 * SunoBolo — 30-Day Journey Curriculum (v2 — Complete Rewrite)
 *
 * KEY CHANGES from v1:
 * - Each step uses a UNIQUE sentence — no repetition across Listen/Speak/Quiz/Test
 * - mini_test has REAL quiz questions with scoring
 * - Each day has genuinely different content even within the same tense
 * - Day 1 focuses on habits/routines; Day 2 on facts/third-person
 *
 * CONTENT SOURCE:
 * - Grammar examples: src/data/tenses.ts (12 tenses × 4 examples)
 * - Audio sentences: FT (free-trial) and BG (beginner) pools with /audio/ MP3s
 * - Quiz sentences: Day-specific pools for genuine assessment
 */

export type StepType =
  | 'learn_concept'
  | 'see_examples'
  | 'listen'
  | 'speak'
  | 'repeat_after'
  | 'recall_from_hi'
  | 'choose_correct'
  | 'fill_blank'
  | 'transform'
  | 'real_life'
  | 'quick_review'
  | 'mini_test';

export interface QuizQuestion {
  type: 'mcq' | 'fill_blank' | 'hindi_to_english' | 'transform' | 'real_life';
  question: string;
  hindi?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JourneyStep {
  type: StepType;
  sourceId: string;
  tenseId?: string;
  exampleId?: string;
  formKey?: 'affirmative' | 'negative' | 'interrogative' | 'whyQuestion';
  courseId?: string;
  sentenceId?: string;
  english?: string;
  hindi?: string;
  title: string;
  subtitle?: string;
  instruction?: string;
  options?: string[];
  correctAnswer?: string;
  transformFrom?: string;
  transformTo?: string;
  quizQuestions?: QuizQuestion[];
}

export interface DayCurriculum {
  day: number;
  tenseId: string | null;
  title: string;
  subtitle: string;
  description: string;
  phase: 'foundation' | 'confidence' | 'mastery';
  isFree: boolean;
  focusExamples: string[];
  steps: JourneyStep[];
  totalSteps: number;
}

// ════════════════════════════════════════════════
// AUDIO SENTENCES (have MP3 files for premium voice)
// ════════════════════════════════════════════════
const FT = [
  { id: 'free-trial-001', en: 'I can understand English, but I can\'t speak it confidently.', hi: 'मुझे अंग्रेज़ी समझ आती है, पर मैं आत्मविश्वास से बोल नहीं पाता।' },
  { id: 'free-trial-002', en: 'My name is Priya. What is your name?', hi: 'मेरा नाम प्रिया है। आपका नाम क्या है?' },
  { id: 'free-trial-003', en: 'I am from India. Where are you from?', hi: 'मैं भारत से हूँ। आप कहाँ से हैं?' },
  { id: 'free-trial-004', en: 'I wake up at 6 o\'clock every day.', hi: 'मैं हर दिन 6 बजे उठता हूँ।' },
  { id: 'free-trial-005', en: 'Can you please call me later?', hi: 'क्या आप मुझे बाद में कॉल कर सकते हैं?' },
  { id: 'free-trial-006', en: 'How much does this cost?', hi: 'इसकी कीमत कितनी है?' },
  { id: 'free-trial-007', en: 'I\'m sorry, I\'m running late.', hi: 'माफ़ कीजिए, मुझे देर हो रही है।' },
  { id: 'free-trial-008', en: 'Could you please help me with this?', hi: 'क्या आप इसमें मेरी मदद कर सकते हैं?' },
  { id: 'free-trial-009', en: 'I don\'t understand. Can you repeat?', hi: 'मुझे समझ नहीं आया। क्या आप दोहरा सकते हैं?' },
  { id: 'free-trial-010', en: 'What are your plans for the weekend?', hi: 'आपके वीकेंड के क्या प्लान हैं?' },
  { id: 'free-trial-011', en: 'I work in an office. What do you do?', hi: 'मैं ऑफिस में काम करता हूँ। आप क्या करते हैं?' },
  { id: 'free-trial-012', en: 'Where is the nearest bus stop?', hi: 'सबसे नज़दीकी बस स्टॉप कहाँ है?' },
  { id: 'free-trial-013', en: 'My internet connection is not working.', hi: 'मेरा इंटरनेट काम नहीं कर रहा है।' },
  { id: 'free-trial-014', en: 'Thank you so much for your help!', hi: 'आपकी मदद के लिए बहुत धन्यवाद!' },
  { id: 'free-trial-015', en: 'Excuse me, can you tell me the time?', hi: 'क्षमा करें, क्या आप मुझे समय बता सकते हैं?' },
  { id: 'free-trial-016', en: 'I am learning English. It is very useful.', hi: 'मैं अंग्रेज़ी सीख रहा हूँ। यह बहुत उपयोगी है।' },
  { id: 'free-trial-017', en: 'Let\'s meet at the coffee shop at 4.', hi: 'चलिए 4 बजे कॉफ़ी शॉप पर मिलते हैं।' },
  { id: 'free-trial-018', en: 'The traffic is very heavy today.', hi: 'आज ट्रैफ़िक बहुत ज़्यादा है।' },
  { id: 'free-trial-019', en: 'Have a great day!', hi: 'आपका दिन शुभ हो!' },
  { id: 'free-trial-020', en: 'Do you have this in a smaller size?', hi: 'क्या यह छोटे साइज़ में है?' },
  { id: 'free-trial-021', en: 'I need to book a hotel room for two nights.', hi: 'मुझे दो रात के लिए होटल का कमरा बुक करना है।' },
  { id: 'free-trial-022', en: 'I ordered a product but it hasn\'t arrived yet.', hi: 'मैंने प्रोडक्ट ऑर्डर किया था लेकिन अभी तक नहीं आया।' },
  { id: 'free-trial-023', en: 'I\'ll call you back in five minutes.', hi: 'मैं पाँच मिनट में वापस कॉल करूँगा।' },
  { id: 'free-trial-024', en: 'I have a meeting at 10 AM tomorrow.', hi: 'मेरी कल सुबह 10 बजे मीटिंग है।' },
  { id: 'free-trial-025', en: 'Nice to meet you!', hi: 'आपसे मिलकर खुशी हुई!' },
];

const BG = [
  { id: 'beginner-001', en: 'Hello! How are you?', hi: 'नमस्ते! आप कैसे हैं?' },
  { id: 'beginner-002', en: 'Good morning. I hope you are well.', hi: 'सुप्रभात। उम्मीद है आप ठीक हैं।' },
  { id: 'beginner-003', en: 'Good afternoon. Nice to meet you.', hi: 'नमस्कार। आपसे मिलकर अच्छा लगा।' },
  { id: 'beginner-004', en: 'Good evening. How was your day?', hi: 'शुभ संध्या। आपका दिन कैसा रहा?' },
  { id: 'beginner-005', en: 'How is everything going?', hi: 'आपके सब कैसे चल रहा है?' },
  { id: 'beginner-006', en: 'I am fine, thank you. And you?', hi: 'मैं ठीक हूँ, धन्यवाद। और आप?' },
  { id: 'beginner-007', en: 'Long time no see! How have you been?', hi: 'बहुत दिनों बाद मिले! आप कैसे हैं?' },
  { id: 'beginner-008', en: 'I have been busy with work these days.', hi: 'इन दिनों मैं काम में व्यस्त हूँ।' },
  { id: 'beginner-009', en: 'Nice to see you again.', hi: 'आपको फिर से देखकर अच्छा लगा।' },
  { id: 'beginner-010', en: 'I am happy to be here today.', hi: 'मुझे आज यहाँ आकर खुशी है।' },
  { id: 'beginner-011', en: 'Thank you for having me.', hi: 'मुझे बुलाने के लिए धन्यवाद।' },
  { id: 'beginner-012', en: 'Have a wonderful day ahead!', hi: 'आपका दिन शुभ हो!' },
  { id: 'beginner-013', en: 'Take care of yourself.', hi: 'अपना ख्याल रखिए।' },
  { id: 'beginner-014', en: 'See you tomorrow!', hi: 'कल मिलते हैं!' },
  { id: 'beginner-015', en: 'See you soon. Bye for now!', hi: 'जल्द मिलते हैं। अभी के लिए अलविदा!' },
  { id: 'beginner-016', en: 'It was nice talking to you.', hi: 'आपसे बात करके अच्छा लगा।' },
  { id: 'beginner-017', en: 'Please come in and sit down.', hi: 'कृपया अंदर आइए और बैठिए।' },
  { id: 'beginner-018', en: 'How is your family doing?', hi: 'आपका परिवार कैसा है?' },
  { id: 'beginner-019', en: 'Everyone is fine at home.', hi: 'घर पर सब ठीक हैं।' },
  { id: 'beginner-020', en: 'What a pleasant surprise!', hi: 'कितनी अच्छी खुशी की बात है!' },
];

// Helper: listen step with premium audio
function listenStep(courseId: string, s: { id: string; en: string; hi: string }, label: string): JourneyStep {
  return {
    type: 'listen', sourceId: `listen-${s.id}`, courseId, sentenceId: s.id,
    english: s.en, hindi: s.hi,
    title: `Suno — ${label}`, subtitle: 'Sentence suno',
    instruction: 'Sentence ko dhyan se suno. English aur Hindi dono suno.',
  };
}

function speakStep(courseId: string, s: { id: string; en: string; hi: string }, label: string): JourneyStep {
  return {
    type: 'speak', sourceId: `speak-${s.id}`, courseId, sentenceId: s.id,
    english: s.en, hindi: s.hi,
    title: `Bolo — ${label}`, subtitle: 'Sentence bolo',
    instruction: 'Ab tum bolo! Sentence ko zor se aur saaf bolo.',
  };
}

function learnStep(tenseId: string, title: string, subtitle: string, instruction: string, exampleId: string): JourneyStep {
  return {
    type: 'learn_concept', sourceId: `${tenseId}-learn`, tenseId,
    title, subtitle, instruction, exampleId,
  };
}

function examplesStep(tenseId: string, title: string, exampleId: string): JourneyStep {
  return {
    type: 'see_examples', sourceId: `${tenseId}-examples`, tenseId,
    title, instruction: 'Affirmative, Negative, Interrogative dekho.',
    exampleId,
  };
}

// ════════════════════════════════════════════════
// 30-DAY CURRICULUM
// ════════════════════════════════════════════════

export const CURRICULUM: DayCurriculum[] = [

  // ══════════════════════════════════════
  // PHASE 1: FOUNDATION (Days 1-8)
  // ══════════════════════════════════════

  // ── Day 1: Simple Present — Habits & Routines (FREE) ──
  {
    day: 1, tenseId: 'simple-present', title: 'Simple Present', subtitle: 'Habits & Routines',
    description: 'Simple Present tense seekho — daily habits, routines, aur basic forms.',
    phase: 'foundation', isFree: true, focusExamples: ['sp-1', 'sp-2'],
    steps: [
      // Step 1: Learn
      learnStep('simple-present', 'Simple Present — Seekho', 'Habits & Routines',
        'Simple Present use hota hai habits, routines, aur facts ke liye. Pattern: Subject + V1 (he/she ke liye s/es lagta hai).', 'sp-1'),
      // Step 2: Examples
      examplesStep('simple-present', 'Examples Dekho — Forms', 'sp-1'),
      // Step 3: Listen (DIFFERENT sentence — FT[3])
      listenStep('free-trial', FT[3], 'Daily Routine'),
      // Step 4: Speak (DIFFERENT sentence — FT[10])
      speakStep('free-trial', FT[10], 'Work & Routine'),
      // Step 5: Meaning Quiz
      {
        type: 'recall_from_hi', sourceId: 'd1-meaning', tenseId: 'simple-present',
        title: 'Hindi se English', instruction: 'Is Hindi ka English version choose karo.',
        exampleId: 'sp-2', formKey: 'affirmative', english: 'She reads a book.', hindi: 'वह किताब पढ़ती है।',
      },
      // Step 6: Choose Correct
      {
        type: 'choose_correct', sourceId: 'd1-choose', tenseId: 'simple-present',
        title: 'Choose Karo', instruction: 'Sahi Simple Present sentence choose karo.',
        options: ['sp-1', 'sp-2', 'sp-3'], correctAnswer: 'sp-1',
      },
      // Step 7: Fill Blank
      {
        type: 'fill_blank', sourceId: 'd1-fill', tenseId: 'simple-present',
        title: 'Complete Karo', instruction: 'Blank mein sahi word daalo.',
        exampleId: 'sp-2', english: 'She reads a book.', hindi: 'वह किताब पढ़ती है।',
      },
      // Step 8: Transform
      {
        type: 'transform', sourceId: 'd1-transform', tenseId: 'simple-present',
        title: 'Badlo — Negative', instruction: '"I eat food" ko negative mein badlo.',
        exampleId: 'sp-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I eat food.', hindi: 'मैं खाना खाता हूँ।',
      },
      // Step 9: Real Life
      {
        type: 'real_life', sourceId: 'd1-real', tenseId: 'simple-present',
        title: 'Real Life Practice', instruction: 'Koi puchta hai: "What do you usually do after work?" Simple Present mein sochho aur jawab do.',
      },
      // Step 10: Mini Test (REAL questions)
      {
        type: 'mini_test', sourceId: 'd1-test', tenseId: 'simple-present',
        title: 'Day 1 Test', instruction: '7 sawaal — Simple Present. Apna score dekho!',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['She go to office every day.', 'She goes to office every day.', 'She is go to office every day.'], correctIndex: 1, explanation: '"She" ke baad verb mein -s lagta hai: "goes".' },
          { type: 'fill_blank', question: 'Every morning, Rahul ___ tea.', hindi: 'हर सुबह, राहुल चाय ___ है।', options: ['drink', 'drinks', 'drinking'], correctIndex: 1, explanation: 'Rahul = he, toh "drinks" (V1 + s).' },
          { type: 'hindi_to_english', question: '"मैं हर दिन 6 बजे उठता हूँ।" का English:', options: ['I wake up at 6 o\'clock every day.', 'I wakes up at 6 o\'clock every day.', 'I am wake up at 6 o\'clock every day.'], correctIndex: 0, explanation: '"I" ke saath verb ka simple form: wake (no -s).' },
          { type: 'mcq', question: 'Negative form: "They play cricket."', options: ['They not play cricket.', 'They do not play cricket.', 'They does not play cricket.'], correctIndex: 1, explanation: '"They" ke saath "do not" + base verb.' },
          { type: 'transform', question: '"He works here." — Make it a question.', hindi: 'इसे question mein badlo.', options: ['Do he work here?', 'Does he work here?', 'Is he work here?'], correctIndex: 1, explanation: 'He = does + he + base form (work, not works).' },
          { type: 'real_life', question: 'Friend: "What does your mother do?" You should say:', options: ['She is cook food every day.', 'She cooks food every day.', 'She cook food every day.'], correctIndex: 1, explanation: 'She + cooks (V1 + s) for Simple Present.' },
          { type: 'mcq', question: '"Sun ___ in the east." Fill the blank:', options: ['rise', 'rises', 'rising'], correctIndex: 1, explanation: 'Sun = it, so "rises" (facts always use Simple Present).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 2: Simple Present — Facts, Third Person, Do/Does ──
  {
    day: 2, tenseId: 'simple-present', title: 'Simple Present', subtitle: 'Facts, Frequency & Third Person',
    description: 'Simple Present — facts, third person s/es, do/does questions, aur real-life conversation.',
    phase: 'foundation', isFree: false, focusExamples: ['sp-3', 'sp-4'],
    steps: [
      // Step 1: Warm-up Review
      {
        type: 'quick_review', sourceId: 'd2-warmup', tenseId: 'simple-present',
        title: 'Warm-up — Kal Kya Seekha?', instruction: 'Kal ka quick revision: habits, routines, V1+s/es.',
      },
      // Step 2: Learn Third Person
      {
        type: 'learn_concept', sourceId: 'd2-learn', tenseId: 'simple-present',
        title: 'Third Person & Facts', subtitle: 'He/She/It + s/es | Do/Does',
        instruction: 'Facts ke liye bhi Simple Present use hota hai. "The sun rises in the east." Third person mein verb mein s/es lagta hai.',
        exampleId: 'sp-4',
      },
      // Step 3: Examples
      examplesStep('simple-present', 'Facts & Questions', 'sp-3'),
      // Step 4: Listen (DIFFERENT — FT[5])
      listenStep('free-trial', FT[5], 'Asking Price'),
      // Step 5: Speak (DIFFERENT — FT[2])
      speakStep('free-trial', FT[2], 'Introduce Yourself'),
      // Step 6: Meaning Quiz
      {
        type: 'recall_from_hi', sourceId: 'd2-meaning', tenseId: 'simple-present',
        title: 'Hindi se English', instruction: 'Is Hindi sentence ka English batao.',
        exampleId: 'sp-3', formKey: 'affirmative', english: 'They play cricket.', hindi: 'वे क्रिकेट खेलते हैं।',
      },
      // Step 7: Choose Correct
      {
        type: 'choose_correct', sourceId: 'd2-choose', tenseId: 'simple-present',
        title: 'Choose Karo', instruction: 'Sahi sentence choose karo — do/does ka use.',
        options: ['sp-3', 'sp-4'], correctAnswer: 'sp-4',
      },
      // Step 8: Fill Blank
      {
        type: 'fill_blank', sourceId: 'd2-fill', tenseId: 'simple-present',
        title: 'Complete Karo', instruction: 'Sahi form bharo.',
        exampleId: 'sp-4', english: 'He works here.', hindi: 'वह यहाँ काम करता है।',
      },
      // Step 9: Transform
      {
        type: 'transform', sourceId: 'd2-transform', tenseId: 'simple-present',
        title: 'Badlo — Affirmative → Question', instruction: '"They play cricket" ko question mein badlo.',
        exampleId: 'sp-3', transformFrom: 'affirmative', transformTo: 'interrogative',
        english: 'They play cricket.', hindi: 'वे क्रिकेट खेलते हैं।',
      },
      // Step 10: Real Life
      {
        type: 'real_life', sourceId: 'd2-real', tenseId: 'simple-present',
        title: 'Real-Life Conversation', instruction: 'Tumse koi puchta hai: "What time does your office start?" Do/Does question hai — Simple Present mein jawab do.',
      },
      // Step 11: Mini Test (DIFFERENT questions from Day 1)
      {
        type: 'mini_test', sourceId: 'd2-test', tenseId: 'simple-present',
        title: 'Day 2 Test', instruction: '7 sawaal — Third Person, Do/Does, Facts. Score banao!',
        quizQuestions: [
          { type: 'mcq', question: '"Does she ___ to school?" Fill the blank:', options: ['goes', 'go', 'going'], correctIndex: 1, explanation: '"Does" ke baad always base form: go (not goes).' },
          { type: 'fill_blank', question: 'My sister ___ English very well.', hindi: 'मेरी बहुत अच्छी अंग्रेज़ी ___ है।', options: ['speak', 'speaks', 'speaking'], correctIndex: 1, explanation: 'My sister = she, so "speaks" (V1 + s).' },
          { type: 'hindi_to_english', question: '"क्या वह यहाँ काम करता है?" का English:', options: ['Does he work here?', 'Do he work here?', 'Is he work here?'], correctIndex: 0, explanation: 'He = Does + he + base verb (work).' },
          { type: 'mcq', question: '"They not ___ cricket." Fill correctly:', options: ['plays', 'play', 'playing'], correctIndex: 1, explanation: 'They + do not + base verb: play (no -s).' },
          { type: 'transform', question: '"She reads a book." — Make it negative.', hindi: 'Negative banao.', options: ['She not reads a book.', 'She does not read a book.', 'She doesn\'t reads a book.'], correctIndex: 1, explanation: 'She = does not + base form: read (not reads).' },
          { type: 'real_life', question: 'Someone asks: "Where do you live?" Best answer:', options: ['I lives in Delhi.', 'I live in Delhi.', 'I am live in Delhi.'], correctIndex: 1, explanation: 'I + base verb: live (no -s with I).' },
          { type: 'mcq', question: 'Which is a fact (Simple Present)?', options: ['The bird is flying.', 'Water boils at 100 degrees.', 'She will go tomorrow.'], correctIndex: 1, explanation: 'Facts always use Simple Present: "Water boils" (always true).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 3: Present Continuous — Actions Happening Now ──
  {
    day: 3, tenseId: 'present-continuous', title: 'Present Continuous', subtitle: 'Abhi Ho Raha Hai',
    description: 'Present Continuous seekho — jo actions abhi ho rahi hain.',
    phase: 'foundation', isFree: false, focusExamples: ['pc-1', 'pc-2'],
    steps: [
      learnStep('present-continuous', 'Present Continuous — Seekho', 'Actions Now',
        'Present Continuous use hota hai jab action abhi ho raha ho. Pattern: Subject + am/is/are + V-ing.', 'pc-1'),
      examplesStep('present-continuous', 'Forms Dekho', 'pc-1'),
      listenStep('free-trial', FT[15], 'Learning English'),
      speakStep('free-trial', FT[16], 'Meeting Plans'),
      {
        type: 'recall_from_hi', sourceId: 'd3-meaning', tenseId: 'present-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खा रहा हूँ।" → English?',
        exampleId: 'pc-1', formKey: 'affirmative', english: 'I am eating food.', hindi: 'मैं खाना खा रहा हूँ।',
      },
      {
        type: 'choose_correct', sourceId: 'd3-choose', tenseId: 'present-continuous',
        title: 'Choose Karo', instruction: 'Sahi Present Continuous sentence.',
        options: ['pc-1', 'pc-2'], correctAnswer: 'pc-1',
      },
      {
        type: 'fill_blank', sourceId: 'd3-fill', tenseId: 'present-continuous',
        title: 'Complete Karo', instruction: 'Blank bharo — V-ing form.',
        exampleId: 'pc-1', english: 'I am eating food.', hindi: 'मैं खाना खा रहा हूँ।',
      },
      {
        type: 'transform', sourceId: 'd3-transform', tenseId: 'present-continuous',
        title: 'Badlo — Affirmative → Negative', instruction: '"I am eating food" ko negative mein badlo.',
        exampleId: 'pc-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I am eating food.', hindi: 'मैं खाना खा रहा हूँ।',
      },
      {
        type: 'real_life', sourceId: 'd3-real', tenseId: 'present-continuous',
        title: 'Real Life', instruction: 'Friend puchta hai: "What are you doing right now?" Present Continuous mein jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd3-test', tenseId: 'present-continuous',
        title: 'Day 3 Test', instruction: '7 sawaal — Present Continuous. Score banao!',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I eating food.', 'I am eating food.', 'I eats food.'], correctIndex: 1, explanation: 'Pattern: Subject + am/is/are + V-ing.' },
          { type: 'fill_blank', question: 'She ___ reading a book right now.', hindi: 'वह अभी किताब ___ रही है।', options: ['is', 'are', 'am'], correctIndex: 0, explanation: 'She = is + V-ing.' },
          { type: 'hindi_to_english', question: '"वे क्रिकेट खेल रहे हैं।" का English:', options: ['They are play cricket.', 'They are playing cricket.', 'They plays cricket.'], correctIndex: 1, explanation: 'They + are + playing (V-ing).' },
          { type: 'mcq', question: 'Negative: "He is working."', options: ['He not is working.', 'He is not working.', 'He not working.'], correctIndex: 1, explanation: 'is + not + V-ing.' },
          { type: 'transform', question: '"I am eating food." — Make it a question.', hindi: 'Question banao.', options: ['Am I eating food?', 'Do I am eating food?', 'Is I eating food?'], correctIndex: 0, explanation: 'Am/I swap: "Am I eating food?"' },
          { type: 'real_life', question: 'Phone pe: "What are you doing?" Best answer:', options: ['I watch TV.', 'I am watching TV.', 'I watches TV.'], correctIndex: 1, explanation: 'Right now action = Present Continuous: am watching.' },
          { type: 'mcq', question: 'Which sentence is Present Continuous?', options: ['She reads every day.', 'She is reading now.', 'She will read tomorrow.'], correctIndex: 1, explanation: '"is reading" = am/is/are + V-ing = Present Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 4: Present Continuous — Practice & Questions ──
  {
    day: 4, tenseId: 'present-continuous', title: 'Present Continuous', subtitle: 'Practice & Questions',
    description: 'Present Continuous ko bolkar practice karo — negative aur question forms.',
    phase: 'foundation', isFree: false, focusExamples: ['pc-3', 'pc-4'],
    steps: [
      {
        type: 'quick_review', sourceId: 'd4-warmup', tenseId: 'present-continuous',
        title: 'Warm-up', instruction: 'Kal ka revision: am/is/are + V-ing.',
      },
      {
        type: 'learn_concept', sourceId: 'd4-learn', tenseId: 'present-continuous',
        title: 'Questions & Negatives', subtitle: 'Am/Is/Are + Subject + V-ing?',
        instruction: 'Question banane ke liye am/is/are ko subject ke aage rakho. Negative mein "not" lagao.',
        exampleId: 'pc-3',
      },
      examplesStep('present-continuous', 'All Forms', 'pc-3'),
      listenStep('free-trial', FT[17], 'Traffic Update'),
      speakStep('free-trial', FT[6], 'Running Late'),
      {
        type: 'recall_from_hi', sourceId: 'd4-meaning', tenseId: 'present-continuous',
        title: 'Hindi se English', instruction: '"वे क्रिकेट खेल रहे हैं।" → English?',
        exampleId: 'pc-3', formKey: 'affirmative', english: 'They are playing cricket.', hindi: 'वे क्रिकेट खेल रहे हैं।',
      },
      {
        type: 'choose_correct', sourceId: 'd4-choose', tenseId: 'present-continuous',
        title: 'Choose Karo', instruction: 'Sahi question form choose karo.',
        options: ['pc-3', 'pc-4'], correctAnswer: 'pc-4',
      },
      {
        type: 'fill_blank', sourceId: 'd4-fill', tenseId: 'present-continuous',
        title: 'Complete Karo', instruction: 'Blank bharo.',
        exampleId: 'pc-4', english: 'He is working here.', hindi: 'वह यहाँ काम कर रहा है।',
      },
      {
        type: 'transform', sourceId: 'd4-transform', tenseId: 'present-continuous',
        title: 'Badlo — Affirmative → Interrogative', instruction: '"They are playing cricket" ko question mein badlo.',
        exampleId: 'pc-3', transformFrom: 'affirmative', transformTo: 'interrogative',
        english: 'They are playing cricket.', hindi: 'वे क्रिकेट खेल रहे हैं।',
      },
      {
        type: 'real_life', sourceId: 'd4-real', tenseId: 'present-continuous',
        title: 'Real-Life', instruction: 'Office mein koi puchta hai: "Are you busy right now?" Present Continuous mein jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd4-test', tenseId: 'present-continuous',
        title: 'Day 4 Test', instruction: '7 sawaal — Questions, Negatives, V-ing.',
        quizQuestions: [
          { type: 'mcq', question: 'Question form: "She is cooking."', options: ['Is she cooking?', 'Does she cooking?', 'She is cooking?'], correctIndex: 0, explanation: 'Is + Subject + V-ing?' },
          { type: 'fill_blank', question: 'They ___ not playing football.', hindi: 'वे फुटबॉल ___ खेल रहे।', options: ['is', 'are', 'am'], correctIndex: 1, explanation: 'They = are + not + V-ing.' },
          { type: 'hindi_to_english', question: '"क्या वह काम कर रहा है?" का English:', options: ['Is he working?', 'Does he working?', 'He is work?'], correctIndex: 0, explanation: 'Is + he + V-ing? = "Is he working?"' },
          { type: 'mcq', question: '"I ___ watching a movie." Fill:', options: ['am', 'is', 'are'], correctIndex: 0, explanation: 'I = am + V-ing.' },
          { type: 'transform', question: '"He is working here." — Make it negative.', hindi: 'Negative banao.', options: ['He not is working.', 'He is not working.', 'He doesn\'t working.'], correctIndex: 1, explanation: 'is + not + V-ing.' },
          { type: 'real_life', question: 'Friend: "What are you doing this weekend?" You reply:', options: ['I am going to the market.', 'I goes to the market.', 'I going market.'], correctIndex: 0, explanation: 'Future plan with Present Continuous: "am going."' },
          { type: 'mcq', question: 'Which is correct?', options: ['She is run every day.', 'She runs every day.', 'She is running every day.'], correctIndex: 1, explanation: 'Habit = Simple Present "runs." Present Continuous is for NOW, not habits.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 5: Present Perfect — Past Action, Present Result ──
  {
    day: 5, tenseId: 'present-perfect', title: 'Present Perfect', subtitle: 'Past Action, Present Result',
    description: 'Present Perfect seekho — jo kaam ho chuka hai aur abhi result dikhta hai.',
    phase: 'foundation', isFree: false, focusExamples: ['pp-1', 'pp-2'],
    steps: [
      learnStep('present-perfect', 'Present Perfect — Seekho', 'Have/Has + V3',
        'Present Perfect use hota hai jab past action ka present result ho. Pattern: Subject + have/has + V3 (past participle).', 'pp-1'),
      examplesStep('present-perfect', 'Forms Dekho', 'pp-1'),
      listenStep('free-trial', FT[20], 'Booking Hotel'),
      speakStep('free-trial', FT[21], 'Product Order'),
      {
        type: 'recall_from_hi', sourceId: 'd5-meaning', tenseId: 'present-perfect',
        title: 'Hindi se English', instruction: '"मैंने खाना खा लिया है।" → English?',
        exampleId: 'pp-1', formKey: 'affirmative', english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'choose_correct', sourceId: 'd5-choose', tenseId: 'present-perfect',
        title: 'Choose Karo', instruction: 'Sahi Present Perfect sentence.',
        options: ['pp-1', 'pp-2'], correctAnswer: 'pp-1',
      },
      {
        type: 'fill_blank', sourceId: 'd5-fill', tenseId: 'present-perfect',
        title: 'Complete Karo', instruction: 'Blank bharo — have/has + V3.',
        exampleId: 'pp-1', english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'transform', sourceId: 'd5-transform', tenseId: 'present-perfect',
        title: 'Badlo — Affirmative → Negative', instruction: '"I have eaten food" ko negative mein badlo.',
        exampleId: 'pp-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'real_life', sourceId: 'd5-real', tenseId: 'present-perfect',
        title: 'Real Life', instruction: 'Koi puchta hai: "Have you eaten lunch?" Present Perfect mein jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd5-test', tenseId: 'present-perfect',
        title: 'Day 5 Test', instruction: '7 sawaal — Present Perfect.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I have ate food.', 'I have eaten food.', 'I has eaten food.'], correctIndex: 1, explanation: 'I + have + V3 (eaten, not ate).' },
          { type: 'fill_blank', question: 'She ___ already finished her work.', hindi: 'वह ___ पहले ही अपना काम खत्म कर चुकी है।', options: ['have', 'has', 'had'], correctIndex: 1, explanation: 'She = has + V3.' },
          { type: 'hindi_to_english', question: '"क्या आपने खाना खा लिया?" का English:', options: ['Do you eat food?', 'Have you eaten food?', 'Did you eaten food?'], correctIndex: 1, explanation: 'Have + you + V3 (eaten).' },
          { type: 'mcq', question: '"They ___ played cricket."', options: ['have', 'has', 'had'], correctIndex: 0, explanation: 'They = have + V3.' },
          { type: 'transform', question: '"He has worked here." — Make it negative.', hindi: 'Negative banao.', options: ['He has not worked here.', 'He have not worked here.', 'He not has worked here.'], correctIndex: 0, explanation: 'has + not + V3.' },
          { type: 'real_life', question: 'Friend asks: "Have you been to Delhi?" Best answer:', options: ['Yes, I went there.', 'Yes, I have been there twice.', 'Yes, I go there.'], correctIndex: 1, explanation: 'Present Perfect for life experience: "have been."' },
          { type: 'mcq', question: 'Which is Present Perfect?', options: ['I eat food daily.', 'I have eaten food.', 'I am eating food.'], correctIndex: 1, explanation: 'have/has + V3 = Present Perfect.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 6: Present Perfect — Practice ──
  {
    day: 6, tenseId: 'present-perfect', title: 'Present Perfect', subtitle: 'Practice & Speaking',
    description: 'Present Perfect ko bolkar practice karo.',
    phase: 'foundation', isFree: false, focusExamples: ['pp-3', 'pp-4'],
    steps: [
      {
        type: 'quick_review', sourceId: 'd6-warmup', tenseId: 'present-perfect',
        title: 'Warm-up', instruction: 'Kal ka revision: have/has + V3.',
      },
      {
        type: 'learn_concept', sourceId: 'd6-learn', tenseId: 'present-perfect',
        title: 'Already, Yet, Just', subtitle: 'Present Perfect ke saath',
        instruction: '"Already" = pehle se ho chuka. "Yet" = abhi tak nahi hua. "Just" = abhi abhi hua.',
        exampleId: 'pp-3',
      },
      examplesStep('present-perfect', 'Practice Examples', 'pp-3'),
      listenStep('beginner', BG[0], 'Greeting'),
      speakStep('beginner', BG[1], 'Morning Greeting'),
      {
        type: 'recall_from_hi', sourceId: 'd6-meaning', tenseId: 'present-perfect',
        title: 'Hindi se English', instruction: '"वे क्रिकेट खेल चुके हैं।" → English?',
        exampleId: 'pp-3', formKey: 'affirmative', english: 'They have played cricket.', hindi: 'वे क्रिकेट खेल चुके हैं।',
      },
      {
        type: 'choose_correct', sourceId: 'd6-choose', tenseId: 'present-perfect',
        title: 'Choose Karo', instruction: 'Already/Yet/Just ka sahi use.',
        options: ['pp-3', 'pp-4'], correctAnswer: 'pp-3',
      },
      {
        type: 'fill_blank', sourceId: 'd6-fill', tenseId: 'present-perfect',
        title: 'Complete Karo', instruction: 'Blank bharo.',
        exampleId: 'pp-4', english: 'He has worked here.', hindi: 'वह यहाँ काम कर चुका है।',
      },
      {
        type: 'transform', sourceId: 'd6-transform', tenseId: 'present-perfect',
        title: 'Badlo — Affirmative → Interrogative', instruction: '"I have eaten food" ko question mein badlo.',
        exampleId: 'pp-1', transformFrom: 'affirmative', transformTo: 'interrogative',
        english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'real_life', sourceId: 'd6-real', tenseId: 'present-perfect',
        title: 'Real Life', instruction: 'Office: "Have you finished the report yet?" Present Perfect mein jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd6-test', tenseId: 'present-perfect',
        title: 'Day 6 Test', instruction: '7 sawaal — Already, Yet, Just, Have/Has.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ already ___ my homework."', options: ['have...finished', 'has...finish', 'had...finishing'], correctIndex: 0, explanation: 'I + have + already + V3.' },
          { type: 'fill_blank', question: 'She ___ not completed the form yet.', hindi: 'उसने अभी तक फॉर्म ___ पूरा नहीं किया।', options: ['have', 'has', 'had'], correctIndex: 1, explanation: 'She = has + not + V3.' },
          { type: 'hindi_to_english', question: '"मैंने अभी-अभी खाना खाया है।" का English:', options: ['I just eat food.', 'I have just eaten food.', 'I just ate food.'], correctIndex: 1, explanation: '"just" = abhi abhi = Present Perfect: have + just + V3.' },
          { type: 'mcq', question: '"___ you been to Mumbai?" Fill:', options: ['Have', 'Has', 'Did'], correctIndex: 0, explanation: 'You = Have + been (V3).' },
          { type: 'transform', question: '"They have played cricket." — Make it negative.', hindi: 'Negative banao.', options: ['They have not played cricket.', 'They has not played cricket.', 'They not have played cricket.'], correctIndex: 0, explanation: 'have + not + V3.' },
          { type: 'real_life', question: 'Friend: "Have you eaten?" You say:', options: ['Yes, I eat.', 'Yes, I have eaten.', 'Yes, I am eating.'], correctIndex: 1, explanation: 'Present Perfect: "have eaten" for completion.' },
          { type: 'mcq', question: '"The train ___ just ___. Choose correctly:', options: ['has...arrived', 'have...arriving', 'had...arrive'], correctIndex: 0, explanation: 'The train = it = has + V3 (arrived).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 7: Present Perfect Continuous ──
  {
    day: 7, tenseId: 'present-perfect-continuous', title: 'Present Perfect Continuous', subtitle: 'Chal Raha Hai Ab Tak',
    description: 'Present Perfect Continuous — jo kaam shuru hua aur abhi tak chal raha hai.',
    phase: 'foundation', isFree: false, focusExamples: ['ppc-1', 'ppc-2'],
    steps: [
      learnStep('present-perfect-continuous', 'PP Continuous — Seekho', 'Have/Has + Been + V-ing',
        'Jab koi action past mein shuru hua aur abhi tak chal raha hai. Pattern: Subject + have/has + been + V-ing.', 'ppc-1'),
      examplesStep('present-perfect-continuous', 'Forms Dekho', 'ppc-1'),
      listenStep('beginner', BG[7], 'Busy with Work'),
      speakStep('beginner', BG[5], 'Fine & You?'),
      {
        type: 'recall_from_hi', sourceId: 'd7-meaning', tenseId: 'present-perfect-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खाता रहा हूँ।" → English?',
        exampleId: 'ppc-1', formKey: 'affirmative', english: 'I have been eating food.', hindi: 'मैं खाना खाता रहा हूँ।',
      },
      {
        type: 'choose_correct', sourceId: 'd7-choose', tenseId: 'present-perfect-continuous',
        title: 'Choose Karo', instruction: 'Sahi PP Continuous sentence.',
        options: ['ppc-1', 'ppc-2'], correctAnswer: 'ppc-1',
      },
      {
        type: 'fill_blank', sourceId: 'd7-fill', tenseId: 'present-perfect-continuous',
        title: 'Complete Karo', instruction: 'Blank bharo.',
        exampleId: 'ppc-1', english: 'I have been eating food.', hindi: 'मैं खाना खाता रहा हूँ।',
      },
      {
        type: 'transform', sourceId: 'd7-transform', tenseId: 'present-perfect-continuous',
        title: 'Badlo — Affirmative → Negative', instruction: '"I have been eating" ko negative mein badlo.',
        exampleId: 'ppc-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I have been eating food.', hindi: 'मैं खाना खाता रहा हूँ।',
      },
      {
        type: 'real_life', sourceId: 'd7-real', tenseId: 'present-perfect-continuous',
        title: 'Real Life', instruction: 'Koi puchta hai: "How long have you been studying English?" Jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd7-test', tenseId: 'present-perfect-continuous',
        title: 'Day 7 Test', instruction: '7 sawaal — PP Continuous.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I have been waiting for 2 hours.', 'I have been wait for 2 hours.', 'I has been waiting for 2 hours.'], correctIndex: 0, explanation: 'I + have + been + V-ing.' },
          { type: 'fill_blank', question: 'She ___ been working since morning.', hindi: 'वह सुबह से काम ___ रही है।', options: ['have', 'has', 'had'], correctIndex: 1, explanation: 'She = has + been + V-ing.' },
          { type: 'hindi_to_english', question: '"वे लंबे समय से खेल रहे हैं।" का English:', options: ['They have been playing for a long time.', 'They has been playing for a long time.', 'They have been play for a long time.'], correctIndex: 0, explanation: 'They + have + been + V-ing.' },
          { type: 'mcq', question: '"I ___ been ___ for an hour."', options: ['have...running', 'has...running', 'have...run'], correctIndex: 0, explanation: 'I = have + been + V-ing (running).' },
          { type: 'transform', question: '"He has been working here." — Make it negative.', hindi: 'Negative banao.', options: ['He has not been working here.', 'He have not been working here.', 'He not has been working here.'], correctIndex: 0, explanation: 'has + not + been + V-ing.' },
          { type: 'real_life', question: 'Friend: "How long have you been learning English?" You say:', options: ['I learn English for 2 months.', 'I have been learning English for 2 months.', 'I am learning English for 2 months.'], correctIndex: 1, explanation: 'Duration of ongoing activity = PP Continuous.' },
          { type: 'mcq', question: 'Which is PP Continuous?', options: ['I have eaten lunch.', 'I have been eating lunch.', 'I am eating lunch.'], correctIndex: 1, explanation: 'have/has + been + V-ing = PP Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 8: Present Perfect Continuous — Practice ──
  {
    day: 8, tenseId: 'present-perfect-continuous', title: 'Present Perfect Continuous', subtitle: 'Practice',
    description: 'PP Continuous ko bolkar practice karo.',
    phase: 'foundation', isFree: false, focusExamples: ['ppc-3', 'ppc-4'],
    steps: [
      {
        type: 'quick_review', sourceId: 'd8-warmup', tenseId: 'present-perfect-continuous',
        title: 'Warm-up', instruction: 'Kal ka revision: have/has + been + V-ing.',
      },
      {
        type: 'learn_concept', sourceId: 'd8-learn', tenseId: 'present-perfect-continuous',
        title: 'Since vs For', subtitle: 'Time Duration',
        instruction: '"Since" = specific time se. "For" = kitna time tak. "Since Monday" vs "For 3 hours".',
        exampleId: 'ppc-3',
      },
      examplesStep('present-perfect-continuous', 'Since & For', 'ppc-3'),
      listenStep('beginner', BG[9], 'Happy to be Here'),
      speakStep('beginner', BG[8], 'Nice to See You'),
      {
        type: 'recall_from_hi', sourceId: 'd8-meaning', tenseId: 'present-perfect-continuous',
        title: 'Hindi se English', instruction: '"वे खेलते रहे हैं।" → English?',
        exampleId: 'ppc-3', formKey: 'affirmative', english: 'They have been playing cricket.', hindi: 'वे क्रिकेट खेलते रहे हैं।',
      },
      {
        type: 'choose_correct', sourceId: 'd8-choose', tenseId: 'present-perfect-continuous',
        title: 'Choose Karo', instruction: 'Since/For ka sahi use.',
        options: ['ppc-3', 'ppc-4'], correctAnswer: 'ppc-3',
      },
      {
        type: 'fill_blank', sourceId: 'd8-fill', tenseId: 'present-perfect-continuous',
        title: 'Complete Karo', instruction: 'Blank bharo.',
        exampleId: 'ppc-4', english: 'He has been working here.', hindi: 'वह यहाँ काम करता रहा है।',
      },
      {
        type: 'transform', sourceId: 'd8-transform', tenseId: 'present-perfect-continuous',
        title: 'Badlo — Affirmative → Interrogative', instruction: '"I have been waiting" ko question mein badlo.',
        exampleId: 'ppc-1', transformFrom: 'affirmative', transformTo: 'interrogative',
        english: 'I have been eating food.', hindi: 'मैं खाना खाता रहा हूँ।',
      },
      {
        type: 'real_life', sourceId: 'd8-real', tenseId: 'present-perfect-continuous',
        title: 'Real Life', instruction: 'Interview mein: "How long have you been working in this field?" Jawab do.',
      },
      {
        type: 'mini_test', sourceId: 'd8-test', tenseId: 'present-perfect-continuous',
        title: 'Day 8 Test', instruction: '7 sawaal — Since, For, PP Continuous.',
        quizQuestions: [
          { type: 'mcq', question: '"I have been waiting ___ 3 o\'clock."', options: ['since', 'for', 'from'], correctIndex: 0, explanation: 'Specific time = since (3 o\'clock).' },
          { type: 'fill_blank', question: 'She has been studying ___ two hours.', hindi: 'वह ___ दो घंटे से पढ़ रही है।', options: ['since', 'for', 'at'], correctIndex: 1, explanation: 'Duration = for (two hours).' },
          { type: 'hindi_to_english', question: '"मैं दो घंटे से इंतज़ार कर रहा हूँ।" का English:', options: ['I wait for 2 hours.', 'I have been waiting for 2 hours.', 'I am waiting since 2 hours.'], correctIndex: 1, explanation: 'Duration + ongoing = PP Continuous + for.' },
          { type: 'mcq', question: '"They ___ been ___ since Monday."', options: ['have...working', 'has...working', 'have...worked'], correctIndex: 0, explanation: 'They + have + been + V-ing + since.' },
          { type: 'transform', question: '"We have been playing cricket." — Negative.', hindi: 'Negative banao.', options: ['We have not been playing cricket.', 'We has not been playing cricket.', 'We not have been playing cricket.'], correctIndex: 0, explanation: 'have + not + been + V-ing.' },
          { type: 'real_life', question: 'Koi puchta hai: "How long have you lived here?" You say:', options: ['I live here since 2020.', 'I have been living here since 2020.', 'I am living here for 2020.'], correctIndex: 1, explanation: 'Duration + since = PP Continuous.' },
          { type: 'mcq', question: 'Which uses "since" correctly?', options: ['I have been working for Monday.', 'I have been working since Monday.', 'I have been working in Monday.'], correctIndex: 1, explanation: 'Specific point in time = since.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ══════════════════════════════════════
  // PHASE 2: CONFIDENCE (Days 9-16)
  // ══════════════════════════════════════

  // ── Day 9: Simple Past — Learn ──
  {
    day: 9, tenseId: 'simple-past', title: 'Simple Past', subtitle: 'Kya Hua?',
    description: 'Simple Past seekho — jo kaam ho chuka.',
    phase: 'confidence', isFree: false, focusExamples: ['spt-1', 'spt-2'],
    steps: [
      learnStep('simple-past', 'Simple Past — Seekho', 'V2 (Past Form)',
        'Simple Past use hota hai past actions ke liye. Pattern: Subject + V2 (past form). "I ate" "She read" "They played".', 'spt-1'),
      examplesStep('simple-past', 'Forms Dekho', 'spt-1'),
      listenStep('beginner', BG[10], 'Thank You'),
      speakStep('beginner', BG[11], 'Have a Great Day'),
      {
        type: 'recall_from_hi', sourceId: 'd9-meaning', tenseId: 'simple-past',
        title: 'Hindi se English', instruction: '"मैंने खाना खाया।" → English?',
        exampleId: 'spt-1', formKey: 'affirmative', english: 'I ate food.', hindi: 'मैंने खाना खाया।',
      },
      { type: 'choose_correct', sourceId: 'd9-choose', tenseId: 'simple-past', title: 'Choose Karo', options: ['spt-1', 'spt-2'], correctAnswer: 'spt-1' },
      { type: 'fill_blank', sourceId: 'd9-fill', tenseId: 'simple-past', title: 'Complete Karo', exampleId: 'spt-1', english: 'I ate food.', hindi: 'मैंने खाना खाया।' },
      { type: 'transform', sourceId: 'd9-transform', tenseId: 'simple-past', title: 'Badlo — Negative', instruction: '"I ate food" ko negative mein badlo.', exampleId: 'spt-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I ate food.', hindi: 'मैंने खाना खाया।' },
      { type: 'real_life', sourceId: 'd9-real', tenseId: 'simple-past', title: 'Real Life', instruction: 'Koi puchta hai: "What did you do yesterday?" Simple Past mein jawab do.' },
      {
        type: 'mini_test', sourceId: 'd9-test', tenseId: 'simple-past', title: 'Day 9 Test', instruction: '7 sawaal — Simple Past.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I eat food yesterday.', 'I ate food yesterday.', 'I eating food yesterday.'], correctIndex: 1, explanation: 'Past action = V2 (ate).' },
          { type: 'fill_blank', question: 'She ___ to school yesterday.', hindi: 'वह कल स्कूल ___ गई।', options: ['go', 'went', 'goes'], correctIndex: 1, explanation: 'Past = went (V2 of go).' },
          { type: 'hindi_to_english', question: '"उसने किताब पढ़ी।" का English:', options: ['She read a book.', 'She reads a book.', 'She is reading a book.'], correctIndex: 0, explanation: 'Past = read (V2, pronounced "red").' },
          { type: 'mcq', question: 'Negative: "I ate food."', options: ['I not ate food.', 'I did not eat food.', 'I doesn\'t ate food.'], correctIndex: 1, explanation: 'Past negative: did not + base verb (eat, not ate).' },
          { type: 'transform', question: '"They played cricket." — Make it a question.', options: ['Did they played cricket?', 'Did they play cricket?', 'Do they play cricket?'], correctIndex: 1, explanation: 'Did + subject + base verb (play, not played).' },
          { type: 'real_life', question: 'Friend: "Did you go to the market?" You say:', options: ['Yes, I went.', 'Yes, I go.', 'Yes, I going.'], correctIndex: 0, explanation: 'Past answer = V2: went.' },
          { type: 'mcq', question: 'Which is Simple Past?', options: ['I eat every day.', 'I ate yesterday.', 'I am eating now.'], correctIndex: 1, explanation: 'V2 (ate) = Simple Past.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 10: Simple Past — Practice ──
  {
    day: 10, tenseId: 'simple-past', title: 'Simple Past', subtitle: 'Practice & Questions',
    description: 'Simple Past ko bolkar practice karo.',
    phase: 'confidence', isFree: false, focusExamples: ['spt-3', 'spt-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd10-warmup', tenseId: 'simple-past', title: 'Warm-up', instruction: 'Kal ka revision: V2, did + base verb.' },
      {
        type: 'learn_concept', sourceId: 'd10-learn', tenseId: 'simple-past',
        title: 'Irregular Verbs', subtitle: 'go→went, eat→ate, see→saw',
        instruction: 'Kuch verbs ka past form alag hota hai — irregular verbs. go→went, eat→ate, see→saw, read→read.',
        exampleId: 'spt-3',
      },
      examplesStep('simple-past', 'Irregular Verbs', 'spt-3'),
      listenStep('beginner', BG[12], 'Take Care'),
      speakStep('beginner', BG[13], 'See You Tomorrow'),
      {
        type: 'recall_from_hi', sourceId: 'd10-meaning', tenseId: 'simple-past',
        title: 'Hindi se English', instruction: '"वे क्रिकेट खेले।" → English?',
        exampleId: 'spt-3', formKey: 'affirmative', english: 'They played cricket.', hindi: 'वे क्रिकेट खेले।',
      },
      { type: 'choose_correct', sourceId: 'd10-choose', tenseId: 'simple-past', title: 'Choose Karo', options: ['spt-3', 'spt-4'], correctAnswer: 'spt-4' },
      { type: 'fill_blank', sourceId: 'd10-fill', tenseId: 'simple-past', title: 'Complete Karo', exampleId: 'spt-4', english: 'He worked here.', hindi: 'वह यहाँ काम करता था।' },
      { type: 'transform', sourceId: 'd10-transform', tenseId: 'simple-past', title: 'Badlo — Interrogative', instruction: '"They played cricket" ko question mein badlo.', exampleId: 'spt-3', transformFrom: 'affirmative', transformTo: 'interrogative', english: 'They played cricket.', hindi: 'वे क्रिकेट खेले।' },
      { type: 'real_life', sourceId: 'd10-real', tenseId: 'simple-past', title: 'Real Life', instruction: 'Koi puchta hai: "What did you do last weekend?" Jawab do.' },
      {
        type: 'mini_test', sourceId: 'd10-test', tenseId: 'simple-past', title: 'Day 10 Test', instruction: '7 sawaal — Irregular verbs, Questions.',
        quizQuestions: [
          { type: 'mcq', question: 'Past of "go":', options: ['goed', 'went', 'goes'], correctIndex: 1, explanation: 'Irregular: go → went.' },
          { type: 'fill_blank', question: 'We ___ to the cinema last night.', hindi: 'हम रात को सिनेमा ___ गए।', options: ['go', 'went', 'going'], correctIndex: 1, explanation: 'Past = went.' },
          { type: 'hindi_to_english', question: '"क्या उसने खाना खाया?" का English:', options: ['Did she eat food?', 'Did she ate food?', 'Does she eat food?'], correctIndex: 0, explanation: 'Did + subject + base verb (eat, not ate).' },
          { type: 'mcq', question: 'Past of "see":', options: ['seed', 'saw', 'sees'], correctIndex: 1, explanation: 'Irregular: see → saw.' },
          { type: 'transform', question: '"She read a book." — Make it negative.', options: ['She not read a book.', 'She did not read a book.', 'She doesn\'t read a book.'], correctIndex: 1, explanation: 'did not + base verb (read).' },
          { type: 'real_life', question: 'Friend: "What did you eat for lunch?" You say:', options: ['I eat rice.', 'I ate rice.', 'I eating rice.'], correctIndex: 1, explanation: 'Past = V2: ate.' },
          { type: 'mcq', question: '"I ___ my homework before dinner."', options: ['finished', 'finish', 'finishes'], correctIndex: 0, explanation: 'Past action = V2 (finished).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 11: Past Continuous ──
  {
    day: 11, tenseId: 'past-continuous', title: 'Past Continuous', subtitle: 'Ho Raha Tha',
    description: 'Past Continuous seekho — past mein chal rahi kriya.',
    phase: 'confidence', isFree: false, focusExamples: ['pcst-1', 'pcst-2'],
    steps: [
      learnStep('past-continuous', 'Past Continuous — Seekho', 'Was/Were + V-ing',
        'Past mein jo action chal raha tha. Pattern: Subject + was/were + V-ing.', 'pcst-1'),
      examplesStep('past-continuous', 'Forms Dekho', 'pcst-1'),
      listenStep('beginner', BG[14], 'See You Soon'),
      speakStep('beginner', BG[15], 'Nice Talking'),
      {
        type: 'recall_from_hi', sourceId: 'd11-meaning', tenseId: 'past-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खा रहा था।" → English?',
        exampleId: 'pcst-1', formKey: 'affirmative', english: 'I was eating food.', hindi: 'मैं खाना खा रहा था।',
      },
      { type: 'choose_correct', sourceId: 'd11-choose', tenseId: 'past-continuous', title: 'Choose Karo', options: ['pcst-1', 'pcst-2'], correctAnswer: 'pcst-1' },
      { type: 'fill_blank', sourceId: 'd11-fill', tenseId: 'past-continuous', title: 'Complete Karo', exampleId: 'pcst-1', english: 'I was eating food.', hindi: 'मैं खाना खा रहा था।' },
      { type: 'transform', sourceId: 'd11-transform', tenseId: 'past-continuous', title: 'Badlo — Negative', instruction: '"I was eating food" ko negative mein badlo.', exampleId: 'pcst-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I was eating food.', hindi: 'मैं खाना खा रहा था।' },
      { type: 'real_life', sourceId: 'd11-real', tenseId: 'past-continuous', title: 'Real Life', instruction: 'Koi puchta hai: "What were you doing at 5 PM?" Past Continuous mein jawab do.' },
      {
        type: 'mini_test', sourceId: 'd11-test', tenseId: 'past-continuous', title: 'Day 11 Test', instruction: '7 sawaal — Was/Were + V-ing.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I was eating food.', 'I were eating food.', 'I am was eating food.'], correctIndex: 0, explanation: 'I = was + V-ing.' },
          { type: 'fill_blank', question: 'They ___ playing cricket when it rained.', hindi: 'जब बारिश हुई तब वे क्रिकेट ___ रहे थे।', options: ['was', 'were', 'are'], correctIndex: 1, explanation: 'They = were + V-ing.' },
          { type: 'hindi_to_english', question: '"वह काम कर रहा था।" का English:', options: ['He was working.', 'He were working.', 'He is working.'], correctIndex: 0, explanation: 'He = was + V-ing.' },
          { type: 'mcq', question: 'Negative: "She was reading."', options: ['She was not reading.', 'She were not reading.', 'She not was reading.'], correctIndex: 0, explanation: 'was + not + V-ing.' },
          { type: 'transform', question: '"They were playing." — Make it a question.', options: ['Were they playing?', 'Was they playing?', 'Do they playing?'], correctIndex: 0, explanation: 'Were + Subject + V-ing?' },
          { type: 'real_life', question: 'Friend: "What were you doing at 8 PM?" You say:', options: ['I was watching TV.', 'I were watching TV.', 'I watched TV.'], correctIndex: 0, explanation: 'Past ongoing = was + V-ing.' },
          { type: 'mcq', question: 'Which is Past Continuous?', options: ['I ate food.', 'I was eating food.', 'I have eaten food.'], correctIndex: 1, explanation: 'was/were + V-ing = Past Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 12: Past Continuous — Practice ──
  {
    day: 12, tenseId: 'past-continuous', title: 'Past Continuous', subtitle: 'Practice',
    description: 'Past Continuous ko bolkar practice karo.',
    phase: 'confidence', isFree: false, focusExamples: ['pcst-3', 'pcst-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd12-warmup', tenseId: 'past-continuous', title: 'Warm-up', instruction: 'Kal ka revision: was/were + V-ing.' },
      {
        type: 'learn_concept', sourceId: 'd12-learn', tenseId: 'past-continuous',
        title: 'When + Past Simple', subtitle: 'Two Past Actions',
        instruction: 'Jab do past actions ek saath ho: "When I arrived, she was cooking." Long action = was/were + V-ing. Short action = V2.',
        exampleId: 'pcst-3',
      },
      examplesStep('past-continuous', 'When + V2', 'pcst-3'),
      listenStep('beginner', BG[16], 'Come In'),
      speakStep('beginner', BG[17], 'Family?'),
      {
        type: 'recall_from_hi', sourceId: 'd12-meaning', tenseId: 'past-continuous',
        title: 'Hindi se English', instruction: '"वे खेल रहे थे।" → English?',
        exampleId: 'pcst-3', formKey: 'affirmative', english: 'They were playing cricket.', hindi: 'वे क्रिकेट खेल रहे थे।',
      },
      { type: 'choose_correct', sourceId: 'd12-choose', tenseId: 'past-continuous', title: 'Choose Karo', options: ['pcst-3', 'pcst-4'], correctAnswer: 'pcst-4' },
      { type: 'fill_blank', sourceId: 'd12-fill', tenseId: 'past-continuous', title: 'Complete Karo', exampleId: 'pcst-4', english: 'He was working here.', hindi: 'वह यहाँ काम कर रहा था।' },
      { type: 'transform', sourceId: 'd12-transform', tenseId: 'past-continuous', title: 'Badlo — Negative', instruction: '"They were playing" ko negative mein badlo.', exampleId: 'pcst-3', transformFrom: 'affirmative', transformTo: 'negative', english: 'They were playing cricket.', hindi: 'वे क्रिकेट खेल रहे थे।' },
      { type: 'real_life', sourceId: 'd12-real', tenseId: 'past-continuous', title: 'Real Life', instruction: 'Tum bata rahe ho: "When I was studying, my friend called me." Past Continuous + Past Simple use karo.' },
      {
        type: 'mini_test', sourceId: 'd12-test', tenseId: 'past-continuous', title: 'Day 12 Test', instruction: '7 sawaal — When + Past Continuous.',
        quizQuestions: [
          { type: 'mcq', question: '"When I arrived, she ___ cooking."', options: ['was', 'were', 'is'], correctIndex: 0, explanation: 'She = was + V-ing (long action).' },
          { type: 'fill_blank', question: 'While I ___, the phone rang.', hindi: 'जब मैं ___ रहा था, फोन बजा।', options: ['slept', 'was sleeping', 'have slept'], correctIndex: 1, explanation: 'Ongoing past action = was sleeping.' },
          { type: 'hindi_to_english', question: '"जब मैं आया, वह पढ़ रही थी।" का English:', options: ['When I came, she was reading.', 'When I come, she was reading.', 'When I came, she reads.'], correctIndex: 0, explanation: 'Short action (came = V2) + long action (was reading).' },
          { type: 'mcq', question: 'Negative: "We were waiting."', options: ['We were not waiting.', 'We was not waiting.', 'We not were waiting.'], correctIndex: 0, explanation: 'We = were + not + V-ing.' },
          { type: 'transform', question: '"She was cooking." — Make it a question.', options: ['Was she cooking?', 'Were she cooking?', 'Did she cooking?'], correctIndex: 0, explanation: 'Was + She + V-ing?' },
          { type: 'real_life', question: 'Tell a story: "What happened?" You say:', options: ['I was walking and I see a dog.', 'I was walking and I saw a dog.', 'I walk and I saw a dog.'], correctIndex: 1, explanation: 'was walking (ongoing) + saw (V2, sudden event).' },
          { type: 'mcq', question: '"It ___ raining when we left."', options: ['was', 'were', 'is'], correctIndex: 0, explanation: 'It = was + V-ing (ongoing past).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 13: Past Perfect ──
  {
    day: 13, tenseId: 'past-perfect', title: 'Past Perfect', subtitle: 'Pehle Ho Chuka Tha',
    description: 'Past Perfect — do past actions mein se pehle wali.',
    phase: 'confidence', isFree: false, focusExamples: ['ppst-1', 'ppst-2'],
    steps: [
      learnStep('past-perfect', 'Past Perfect — Seekho', 'Had + V3',
        'Jab do past actions ho, pehle wali ke liye Past Perfect: Subject + had + V3.', 'ppst-1'),
      examplesStep('past-perfect', 'Forms Dekho', 'ppst-1'),
      listenStep('beginner', BG[18], 'Family at Home'),
      speakStep('beginner', BG[19], 'Pleasant Surprise'),
      {
        type: 'recall_from_hi', sourceId: 'd13-meaning', tenseId: 'past-perfect',
        title: 'Hindi se English', instruction: '"मैंने खाना खा लिया था।" → English?',
        exampleId: 'ppst-1', formKey: 'affirmative', english: 'I had eaten food.', hindi: 'मैंने खाना खा लिया था।',
      },
      { type: 'choose_correct', sourceId: 'd13-choose', tenseId: 'past-perfect', title: 'Choose Karo', options: ['ppst-1', 'ppst-2'], correctAnswer: 'ppst-1' },
      { type: 'fill_blank', sourceId: 'd13-fill', tenseId: 'past-perfect', title: 'Complete Karo', exampleId: 'ppst-1', english: 'I had eaten food.', hindi: 'मैंने खाना खा लिया था।' },
      { type: 'transform', sourceId: 'd13-transform', tenseId: 'past-perfect', title: 'Badlo — Negative', instruction: '"I had eaten" ko negative mein badlo.', exampleId: 'ppst-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I had eaten food.', hindi: 'मैंने खाना खा लिया था।' },
      { type: 'real_life', sourceId: 'd13-real', tenseId: 'past-perfect', title: 'Real Life', instruction: 'Koi puchta hai: "Had you finished when I called?" Past Perfect mein jawab do.' },
      {
        type: 'mini_test', sourceId: 'd13-test', tenseId: 'past-perfect', title: 'Day 13 Test', instruction: '7 sawaal — Had + V3.',
        quizQuestions: [
          { type: 'mcq', question: '"She ___ already left when I arrived."', options: ['had', 'have', 'has'], correctIndex: 0, explanation: 'Past Perfect: had + V3.' },
          { type: 'fill_blank', question: 'They ___ finished dinner before the guests came.', hindi: 'मेहमानों के आने से पहले वे ___ खाना खत्म कर चुके थे।', options: ['had', 'have', 'has'], correctIndex: 0, explanation: 'had + V3 (earlier past action).' },
          { type: 'hindi_to_english', question: '"मैंने खाना खा लिया था।" का English:', options: ['I had eaten food.', 'I have eaten food.', 'I ate food.'], correctIndex: 0, explanation: 'had + V3 = Past Perfect.' },
          { type: 'mcq', question: 'Negative: "He had worked here."', options: ['He had not worked here.', 'He have not worked here.', 'He not had worked here.'], correctIndex: 0, explanation: 'had + not + V3.' },
          { type: 'transform', question: '"I had finished." — Make it a question.', options: ['Had I finished?', 'Did I had finished?', 'Have I finished?'], correctIndex: 0, explanation: 'Had + Subject + V3?' },
          { type: 'real_life', question: 'Friend: "What had you done before you came here?" You say:', options: ['I had eaten lunch.', 'I have eaten lunch.', 'I ate lunch.'], correctIndex: 0, explanation: 'Earlier past = had + V3.' },
          { type: 'mcq', question: 'Which is Past Perfect?', options: ['I ate food.', 'I had eaten food.', 'I was eating food.'], correctIndex: 1, explanation: 'had + V3 = Past Perfect.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 14: Past Perfect — Practice ──
  {
    day: 14, tenseId: 'past-perfect', title: 'Past Perfect', subtitle: 'Practice',
    description: 'Past Perfect ko bolkar practice karo.',
    phase: 'confidence', isFree: false, focusExamples: ['ppst-3', 'ppst-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd14-warmup', tenseId: 'past-perfect', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd14-learn', tenseId: 'past-perfect',
        title: 'Before & After', subtitle: 'Two Past Actions',
        instruction: '"Before" aur "after" ke saath Past Perfect use hota hai pehle wali action ke liye.',
        exampleId: 'ppst-3',
      },
      examplesStep('past-perfect', 'Before & After', 'ppst-3'),
      listenStep('free-trial', FT[22], 'Call Back'),
      speakStep('free-trial', FT[23], 'Meeting Tomorrow'),
      {
        type: 'recall_from_hi', sourceId: 'd14-meaning', tenseId: 'past-perfect',
        title: 'Hindi se English', instruction: '"वे खेल चुके थे।" → English?',
        exampleId: 'ppst-3', formKey: 'affirmative', english: 'They had played cricket.', hindi: 'वे क्रिकेट खेल चुके थे।',
      },
      { type: 'choose_correct', sourceId: 'd14-choose', tenseId: 'past-perfect', title: 'Choose Karo', options: ['ppst-3', 'ppst-4'], correctAnswer: 'ppst-4' },
      { type: 'fill_blank', sourceId: 'd14-fill', tenseId: 'past-perfect', title: 'Complete Karo', exampleId: 'ppst-4', english: 'He had worked here.', hindi: 'वह यहाँ काम कर चुका था।' },
      { type: 'transform', sourceId: 'd14-transform', tenseId: 'past-perfect', title: 'Badlo — Interrogative', instruction: '"I had eaten" ko question mein badlo.', exampleId: 'ppst-1', transformFrom: 'affirmative', transformTo: 'interrogative', english: 'I had eaten food.', hindi: 'मैंने खाना खा लिया था।' },
      { type: 'real_life', sourceId: 'd14-real', tenseId: 'past-perfect', title: 'Real Life', instruction: 'Tum bata rahe ho: "After I had finished my work, I went to sleep." Past Perfect + Past Simple use karo.' },
      {
        type: 'mini_test', sourceId: 'd14-test', tenseId: 'past-perfect', title: 'Day 14 Test', instruction: '7 sawaal — Before, After, Had + V3.',
        quizQuestions: [
          { type: 'mcq', question: '"After she ___ dinner, she watched TV."', options: ['had eaten', 'ate', 'has eaten'], correctIndex: 0, explanation: 'First action = had + V3 (earlier past).' },
          { type: 'fill_blank', question: 'Before I arrived, they ___.', hindi: 'मेरे आने से पहले, वे ___ चुके थे।', options: ['had left', 'have left', 'left'], correctIndex: 0, explanation: 'Earlier past = had + V3.' },
          { type: 'hindi_to_english', question: '"जब मैं पहुँचा, वे जा चुके थे।" का English:', options: ['When I arrived, they had left.', 'When I arrived, they have left.', 'When I arrive, they left.'], correctIndex: 0, explanation: 'had + V3 for the earlier action.' },
          { type: 'mcq', question: 'Negative: "She had finished."', options: ['She had not finished.', 'She have not finished.', 'She not had finished.'], correctIndex: 0, explanation: 'had + not + V3.' },
          { type: 'transform', question: '"He had worked here." — Make it a question.', options: ['Had he worked here?', 'Did he had worked here?', 'Have he worked here?'], correctIndex: 0, explanation: 'Had + he + V3?' },
          { type: 'real_life', question: 'Story: "What happened?" You say:', options: ['I had arrived and she left.', 'I had arrived and she had left.', 'When I arrived, she had already left.'], correctIndex: 2, explanation: 'Past Perfect for the earlier of two past events.' },
          { type: 'mcq', question: '"By the time I got home, she ___ already ___.', options: ['had...cooked', 'has...cooked', 'had...cooking'], correctIndex: 0, explanation: 'By the time + V2, subject + had + V3.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 15: Past Perfect Continuous ──
  {
    day: 15, tenseId: 'past-perfect-continuous', title: 'Past Perfect Continuous', subtitle: 'Chal Raha Tha Usse Pehle',
    description: 'Past Perfect Continuous — kisi event se pehle tak chal rahi kriya.',
    phase: 'confidence', isFree: false, focusExamples: ['ppcst-1', 'ppcst-2'],
    steps: [
      learnStep('past-perfect-continuous', 'PP Continuous — Seekho', 'Had + Been + V-ing',
        'Kisi past event se pehle tak chal rahi action. Pattern: Subject + had + been + V-ing.', 'ppcst-1'),
      examplesStep('past-perfect-continuous', 'Forms Dekho', 'ppcst-1'),
      listenStep('free-trial', FT[24], 'Nice to Meet'),
      speakStep('free-trial', FT[3], 'Wake Up Early'),
      {
        type: 'recall_from_hi', sourceId: 'd15-meaning', tenseId: 'past-perfect-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खाता रहा था।" → English?',
        exampleId: 'ppcst-1', formKey: 'affirmative', english: 'I had been eating food.', hindi: 'मैं खाना खाता रहा था।',
      },
      { type: 'choose_correct', sourceId: 'd15-choose', tenseId: 'past-perfect-continuous', title: 'Choose Karo', options: ['ppcst-1', 'ppcst-2'], correctAnswer: 'ppcst-1' },
      { type: 'fill_blank', sourceId: 'd15-fill', tenseId: 'past-perfect-continuous', title: 'Complete Karo', exampleId: 'ppcst-1', english: 'I had been eating food.', hindi: 'मैं खाना खाता रहा था।' },
      { type: 'transform', sourceId: 'd15-transform', tenseId: 'past-perfect-continuous', title: 'Badlo — Negative', instruction: '"I had been eating" ko negative mein badlo.', exampleId: 'ppcst-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I had been eating food.', hindi: 'मैं खाना खाता रहा था।' },
      { type: 'real_life', sourceId: 'd15-real', tenseId: 'past-perfect-continuous', title: 'Real Life', instruction: 'Koi puchta hai: "How long had you been waiting?" Jawab do.' },
      {
        type: 'mini_test', sourceId: 'd15-test', tenseId: 'past-perfect-continuous', title: 'Day 15 Test', instruction: '7 sawaal — Had + Been + V-ing.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ been waiting for 2 hours."', options: ['had', 'have', 'has'], correctIndex: 0, explanation: 'had + been + V-ing.' },
          { type: 'fill_blank', question: 'She ___ been working since morning.', hindi: 'वह सुबह से काम कर रही ___।', options: ['had', 'has', 'have'], correctIndex: 0, explanation: 'had + been + V-ing (earlier ongoing).' },
          { type: 'hindi_to_english', question: '"वे लंबे समय से खेल रहे थे।" का English:', options: ['They had been playing for a long time.', 'They have been playing for a long time.', 'They were playing for a long time.'], correctIndex: 0, explanation: 'had + been + V-ing for duration before a past event.' },
          { type: 'mcq', question: 'Negative: "He had been waiting."', options: ['He had not been waiting.', 'He have not been waiting.', 'He not had been waiting.'], correctIndex: 0, explanation: 'had + not + been + V-ing.' },
          { type: 'transform', question: '"I had been studying." — Make it a question.', options: ['Had I been studying?', 'Have I been studying?', 'Did I had been studying?'], correctIndex: 0, explanation: 'Had + Subject + been + V-ing?' },
          { type: 'real_life', question: 'Friend: "How long had you been living there?" You say:', options: ['I had been living there for 5 years.', 'I have been living there for 5 years.', 'I lived there for 5 years.'], correctIndex: 0, explanation: 'Duration before past event = had + been + V-ing.' },
          { type: 'mcq', question: 'Which is Past Perfect Continuous?', options: ['I had eaten.', 'I had been eating.', 'I was eating.'], correctIndex: 1, explanation: 'had + been + V-ing = Past Perfect Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 16: Past Perfect Continuous — Practice ──
  {
    day: 16, tenseId: 'past-perfect-continuous', title: 'Past Perfect Continuous', subtitle: 'Practice',
    description: 'PP Continuous ko bolkar practice karo.',
    phase: 'confidence', isFree: false, focusExamples: ['ppcst-3', 'ppcst-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd16-warmup', tenseId: 'past-perfect-continuous', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd16-learn', tenseId: 'past-perfect-continuous',
        title: 'Result of Past Continuous', subtitle: 'Exhaustion, Wet, etc.',
        instruction: 'Past Perfect Continuous ka result dikha sakte ho: "She was tired because she had been working all day."',
        exampleId: 'ppcst-3',
      },
      examplesStep('past-perfect-continuous', 'Results', 'ppcst-3'),
      listenStep('beginner', BG[2], 'Afternoon'),
      speakStep('beginner', BG[3], 'Evening'),
      {
        type: 'recall_from_hi', sourceId: 'd16-meaning', tenseId: 'past-perfect-continuous',
        title: 'Hindi se English', instruction: '"वे खेलते रहे थे।" → English?',
        exampleId: 'ppcst-3', formKey: 'affirmative', english: 'They had been playing cricket.', hindi: 'वे क्रिकेट खेलते रहे थे।',
      },
      { type: 'choose_correct', sourceId: 'd16-choose', tenseId: 'past-perfect-continuous', title: 'Choose Karo', options: ['ppcst-3', 'ppcst-4'], correctAnswer: 'ppcst-4' },
      { type: 'fill_blank', sourceId: 'd16-fill', tenseId: 'past-perfect-continuous', title: 'Complete Karo', exampleId: 'ppcst-4', english: 'He had been working here.', hindi: 'वह यहाँ काम करता रहा था।' },
      { type: 'transform', sourceId: 'd16-transform', tenseId: 'past-perfect-continuous', title: 'Badlo — Negative', instruction: '"They had been playing" ko negative mein badlo.', exampleId: 'ppcst-3', transformFrom: 'affirmative', transformTo: 'negative', english: 'They had been playing cricket.', hindi: 'वे क्रिकेट खेलते रहे थे।' },
      { type: 'real_life', sourceId: 'd16-real', tenseId: 'past-perfect-continuous', title: 'Real Life', instruction: 'Tum bata rahe ho: "I was tired because I had been studying all night." Result + Duration batao.' },
      {
        type: 'mini_test', sourceId: 'd16-test', tenseId: 'past-perfect-continuous', title: 'Day 16 Test', instruction: '7 sawaal — Duration + Result.',
        quizQuestions: [
          { type: 'mcq', question: '"She was tired because she ___ been working all day."', options: ['had', 'have', 'has'], correctIndex: 0, explanation: 'had + been + V-ing for duration.' },
          { type: 'fill_blank', question: 'The ground was wet because it ___.', hindi: 'ज़मीन गीली थी क्योंकि बारिश ___ रही थी।', options: ['had been raining', 'has been raining', 'was rained'], correctIndex: 0, explanation: 'Duration → result: had been + V-ing.' },
          { type: 'hindi_to_english', question: '"मैं थका हुआ था क्योंकि मैं चलता रहा था।" का English:', options: ['I was tired because I had been walking.', 'I was tired because I have been walking.', 'I was tired because I walked.'], correctIndex: 0, explanation: 'Duration (had been walking) + result (was tired).' },
          { type: 'mcq', question: 'Negative: "They had been waiting."', options: ['They had not been waiting.', 'They have not been waiting.', 'They not had been waiting.'], correctIndex: 0, explanation: 'had + not + been + V-ing.' },
          { type: 'transform', question: '"We had been studying." — Make it a question.', options: ['Had we been studying?', 'Have we been studying?', 'Did we had been studying?'], correctIndex: 0, explanation: 'Had + Subject + been + V-ing?' },
          { type: 'real_life', question: 'Friend: "Why were you late?" You say:', options: ['Because traffic was heavy.', 'Because I had been waiting for the bus for 30 minutes.', 'Because I wait for the bus.'], correctIndex: 1, explanation: 'Duration before past event: had been waiting.' },
          { type: 'mcq', question: 'Which sentence shows duration before a past event?', options: ['I ate food.', 'I had been cooking for 2 hours when guests arrived.', 'I was cooking.'], correctIndex: 1, explanation: 'had + been + V-ing + duration = ongoing before past event.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ══════════════════════════════════════
  // PHASE 3: MASTERY (Days 17-30)
  // ══════════════════════════════════════

  // ── Day 17: Simple Future ──
  {
    day: 17, tenseId: 'simple-future', title: 'Simple Future', subtitle: 'Kya Hoga?',
    description: 'Simple Future — jo kaam hone wala hai.',
    phase: 'mastery', isFree: false, focusExamples: ['sf-1', 'sf-2'],
    steps: [
      learnStep('simple-future', 'Simple Future — Seekho', 'Will + V1',
        'Future plans ke liye. Pattern: Subject + will + V1.', 'sf-1'),
      examplesStep('simple-future', 'Forms Dekho', 'sf-1'),
      listenStep('beginner', BG[4], 'How Going?'),
      speakStep('beginner', BG[6], 'Long Time'),
      {
        type: 'recall_from_hi', sourceId: 'd17-meaning', tenseId: 'simple-future',
        title: 'Hindi se English', instruction: '"मैं खाना खाऊँगा।" → English?',
        exampleId: 'sf-1', formKey: 'affirmative', english: 'I will eat food.', hindi: 'मैं खाना खाऊँगा।',
      },
      { type: 'choose_correct', sourceId: 'd17-choose', tenseId: 'simple-future', title: 'Choose Karo', options: ['sf-1', 'sf-2'], correctAnswer: 'sf-1' },
      { type: 'fill_blank', sourceId: 'd17-fill', tenseId: 'simple-future', title: 'Complete Karo', exampleId: 'sf-1', english: 'I will eat food.', hindi: 'मैं खाना खाऊँगा।' },
      { type: 'transform', sourceId: 'd17-transform', tenseId: 'simple-future', title: 'Badlo — Negative', instruction: '"I will eat food" ko negative mein badlo.', exampleId: 'sf-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I will eat food.', hindi: 'मैं खाना खाऊँगा।' },
      { type: 'real_life', sourceId: 'd17-real', tenseId: 'simple-future', title: 'Real Life', instruction: 'Koi puchta hai: "What will you do tomorrow?" Simple Future mein jawab do.' },
      {
        type: 'mini_test', sourceId: 'd17-test', tenseId: 'simple-future', title: 'Day 17 Test', instruction: '7 sawaal — Will + V1.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I will going tomorrow.', 'I will go tomorrow.', 'I will goes tomorrow.'], correctIndex: 1, explanation: 'will + V1 (base form, no -ing or -s).' },
          { type: 'fill_blank', question: 'She ___ help you tomorrow.', hindi: 'वह कल तुम्हारी मदद ___ करेगी।', options: ['will', 'will be', 'will have'], correctIndex: 0, explanation: 'will + V1.' },
          { type: 'hindi_to_english', question: '"वे क्रिकेट खेलेंगे।" का English:', options: ['They will play cricket.', 'They will playing cricket.', 'They plays cricket.'], correctIndex: 0, explanation: 'Subject + will + V1.' },
          { type: 'mcq', question: 'Negative: "I will go."', options: ['I will not go.', 'I won\'t goes.', 'I not will go.'], correctIndex: 0, explanation: 'will + not + V1.' },
          { type: 'transform', question: '"He will work here." — Make it a question.', options: ['Will he work here?', 'Does he will work here?', 'Is he work here?'], correctIndex: 0, explanation: 'Will + Subject + V1?' },
          { type: 'real_life', question: 'Friend: "What will you do this weekend?" You say:', options: ['I will visit my parents.', 'I will visiting my parents.', 'I visits my parents.'], correctIndex: 0, explanation: 'Future plan = will + V1.' },
          { type: 'mcq', question: 'Which is Simple Future?', options: ['I eat food.', 'I will eat food.', 'I am eating food.'], correctIndex: 1, explanation: 'will + V1 = Simple Future.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 18: Simple Future — Practice ──
  {
    day: 18, tenseId: 'simple-future', title: 'Simple Future', subtitle: 'Practice',
    description: 'Simple Future ko bolkar practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['sf-3', 'sf-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd18-warmup', tenseId: 'simple-future', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd18-learn', tenseId: 'simple-future',
        title: 'Going To vs Will', subtitle: 'Plans & Predictions',
        instruction: '"Going to" = planned future. "Will" = promises, predictions, decisions.',
        exampleId: 'sf-3',
      },
      examplesStep('simple-future', 'Going To & Will', 'sf-3'),
      listenStep('free-trial', FT[4], 'Call Later'),
      speakStep('free-trial', FT[8], 'Don\'t Understand'),
      {
        type: 'recall_from_hi', sourceId: 'd18-meaning', tenseId: 'simple-future',
        title: 'Hindi se English', instruction: '"वे क्रिकेट खेलेंगे।" → English?',
        exampleId: 'sf-3', formKey: 'affirmative', english: 'They will play cricket.', hindi: 'वे क्रिकेट खेलेंगे।',
      },
      { type: 'choose_correct', sourceId: 'd18-choose', tenseId: 'simple-future', title: 'Choose Karo', options: ['sf-3', 'sf-4'], correctAnswer: 'sf-4' },
      { type: 'fill_blank', sourceId: 'd18-fill', tenseId: 'simple-future', title: 'Complete Karo', exampleId: 'sf-4', english: 'He will work here.', hindi: 'वह यहाँ काम करेगा।' },
      { type: 'transform', sourceId: 'd18-transform', tenseId: 'simple-future', title: 'Badlo — Negative', instruction: '"They will play" ko negative mein badlo.', exampleId: 'sf-3', transformFrom: 'affirmative', transformTo: 'negative', english: 'They will play cricket.', hindi: 'वे क्रिकेट खेलेंगे।' },
      { type: 'real_life', sourceId: 'd18-real', tenseId: 'simple-future', title: 'Real Life', instruction: 'Friend puchta hai: "Will you come to the party?" Simple Future mein jawab do.' },
      {
        type: 'mini_test', sourceId: 'd18-test', tenseId: 'simple-future', title: 'Day 18 Test', instruction: '7 sawaal — Going To, Will.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ visit my parents tomorrow."', options: ['am going to', 'will', 'Both A and B'], correctIndex: 2, explanation: 'Both "am going to" and "will" work for future plans.' },
          { type: 'fill_blank', question: 'She says she ___ help us.', hindi: 'वह कहती है कि वो हमारी मदद ___ करेगी।', options: ['will', 'would', 'was'], correctIndex: 0, explanation: 'will + V1 for future promise.' },
          { type: 'hindi_to_english', question: '"क्या तुम कल आओगे?" का English:', options: ['Will you come tomorrow?', 'Do you will come tomorrow?', 'Are you coming tomorrow?'], correctIndex: 0, explanation: 'Will + Subject + V1?' },
          { type: 'mcq', question: 'Negative: "They will play."', options: ['They will not play.', 'They won\'t plays.', 'They not will play.'], correctIndex: 0, explanation: 'will + not + V1.' },
          { type: 'transform', question: '"She will cook dinner." — Make it a question.', options: ['Will she cook dinner?', 'Does she will cook dinner?', 'Is she cook dinner?'], correctIndex: 0, explanation: 'Will + Subject + V1?' },
          { type: 'real_life', question: 'Making a promise: "I ___ always support you."', options: ['will', 'will be', 'going to'], correctIndex: 0, explanation: 'Promises use will + V1.' },
          { type: 'mcq', question: 'Prediction: "It ___ rain tomorrow."', options: ['will', 'is going to', 'Both possible'], correctIndex: 2, explanation: 'Both "will" and "is going to" work for predictions.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 19: Future Continuous ──
  {
    day: 19, tenseId: 'future-continuous', title: 'Future Continuous', subtitle: 'Ho Raha Hoga',
    description: 'Future Continuous — bhavishya mein chal rahi kriya.',
    phase: 'mastery', isFree: false, focusExamples: ['fc-1', 'fc-2'],
    steps: [
      learnStep('future-continuous', 'Future Continuous — Seekho', 'Will + Be + V-ing',
        'Bhavishya mein kisi time pe chal rahi action. Pattern: Subject + will + be + V-ing.', 'fc-1'),
      examplesStep('future-continuous', 'Forms Dekho', 'fc-1'),
      listenStep('free-trial', FT[6], 'Running Late'),
      speakStep('free-trial', FT[7], 'Need Help'),
      {
        type: 'recall_from_hi', sourceId: 'd19-meaning', tenseId: 'future-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खा रहा होऊँगा।" → English?',
        exampleId: 'fc-1', formKey: 'affirmative', english: 'I will be eating food.', hindi: 'मैं खाना खा रहा होऊँगा।',
      },
      { type: 'choose_correct', sourceId: 'd19-choose', tenseId: 'future-continuous', title: 'Choose Karo', options: ['fc-1', 'fc-2'], correctAnswer: 'fc-1' },
      { type: 'fill_blank', sourceId: 'd19-fill', tenseId: 'future-continuous', title: 'Complete Karo', exampleId: 'fc-1', english: 'I will be eating food.', hindi: 'मैं खाना खा रहा होऊँगा।' },
      { type: 'transform', sourceId: 'd19-transform', tenseId: 'future-continuous', title: 'Badlo — Negative', instruction: '"I will be eating" ko negative mein badlo.', exampleId: 'fc-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I will be eating food.', hindi: 'मैं खाना खा रहा होऊँगा।' },
      { type: 'real_life', sourceId: 'd19-real', tenseId: 'future-continuous', title: 'Real Life', instruction: 'Koi puchta hai: "What will you be doing at 3 PM?" Jawab do.' },
      {
        type: 'mini_test', sourceId: 'd19-test', tenseId: 'future-continuous', title: 'Day 19 Test', instruction: '7 sawaal — Will + Be + V-ing.',
        quizQuestions: [
          { type: 'mcq', question: 'Choose the correct sentence:', options: ['I will eating at 5 PM.', 'I will be eating at 5 PM.', 'I will eating at 5 PM.'], correctIndex: 1, explanation: 'will + be + V-ing.' },
          { type: 'fill_blank', question: 'This time tomorrow, I ___ flying to Delhi.', hindi: 'इस समय कल, मैं दिल्ली ___ उड़ रहा होऊँगा।', options: ['will be', 'will', 'am'], correctIndex: 0, explanation: 'will + be + V-ing for ongoing future action.' },
          { type: 'hindi_to_english', question: '"वह काम कर रही होगी।" का English:', options: ['She will be working.', 'She will working.', 'She is working.'], correctIndex: 0, explanation: 'will + be + V-ing.' },
          { type: 'mcq', question: 'Negative: "We will be playing."', options: ['We will not be playing.', 'We will not playing.', 'We not will be playing.'], correctIndex: 0, explanation: 'will + not + be + V-ing.' },
          { type: 'transform', question: '"He will be working." — Make it a question.', options: ['Will he be working?', 'Is he will be working?', 'Will he working?'], correctIndex: 0, explanation: 'Will + Subject + be + V-ing?' },
          { type: 'real_life', question: 'Friend: "What will you be doing at 8 PM tonight?" You say:', options: ['I will be watching a movie.', 'I will watching a movie.', 'I will watch movie.'], correctIndex: 0, explanation: 'Ongoing at specific time = will be + V-ing.' },
          { type: 'mcq', question: 'Which is Future Continuous?', options: ['I will eat.', 'I will be eating.', 'I have been eating.'], correctIndex: 1, explanation: 'will + be + V-ing = Future Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 20: Future Continuous — Practice ──
  {
    day: 20, tenseId: 'future-continuous', title: 'Future Continuous', subtitle: 'Practice',
    description: 'Future Continuous ko bolkar practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['fc-3', 'fc-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd20-warmup', tenseId: 'future-continuous', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd20-learn', tenseId: 'future-continuous',
        title: 'Polite Requests', subtitle: 'Will you be doing...?',
        instruction: 'Polite request ke liye: "Will you be using the car?" = "Kya tum gaadi istemal kar rahe hoge?"',
        exampleId: 'fc-3',
      },
      examplesStep('future-continuous', 'Polite Forms', 'fc-3'),
      listenStep('free-trial', FT[9], 'Weekend Plans'),
      speakStep('free-trial', FT[11], 'Bus Stop'),
      {
        type: 'recall_from_hi', sourceId: 'd20-meaning', tenseId: 'future-continuous',
        title: 'Hindi se English', instruction: '"वे खेल रहे होंगे।" → English?',
        exampleId: 'fc-3', formKey: 'affirmative', english: 'They will be playing cricket.', hindi: 'वे क्रिकेट खेल रहे होंगे।',
      },
      { type: 'choose_correct', sourceId: 'd20-choose', tenseId: 'future-continuous', title: 'Choose Karo', options: ['fc-3', 'fc-4'], correctAnswer: 'fc-4' },
      { type: 'fill_blank', sourceId: 'd20-fill', tenseId: 'future-continuous', title: 'Complete Karo', exampleId: 'fc-4', english: 'He will be working here.', hindi: 'वह यहाँ काम कर रहा होगा।' },
      { type: 'transform', sourceId: 'd20-transform', tenseId: 'future-continuous', title: 'Badlo — Interrogative', instruction: '"I will be eating" ko question mein badlo.', exampleId: 'fc-1', transformFrom: 'affirmative', transformTo: 'interrogative', english: 'I will be eating food.', hindi: 'मैं खाना खा रहा होऊँगा।' },
      { type: 'real_life', sourceId: 'd20-real', tenseId: 'future-continuous', title: 'Real Life', instruction: 'Polite request: "Will you be using the computer?" ya statement: "I will be studying at 9 PM."' },
      {
        type: 'mini_test', sourceId: 'd20-test', tenseId: 'future-continuous', title: 'Day 20 Test', instruction: '7 sawaal — Polite requests, Duration.',
        quizQuestions: [
          { type: 'mcq', question: 'Polite request: "___ you be using the car?"', options: ['Will', 'Are', 'Do'], correctIndex: 0, explanation: 'Will + Subject + be + V-ing for polite request.' },
          { type: 'fill_blank', question: 'At 9 PM tonight, she ___ be sleeping.', hindi: 'रात 9 बजे, वह सो ___ रही होगी।', options: ['will', 'will be', 'is'], correctIndex: 0, explanation: 'will + be + V-ing.' },
          { type: 'hindi_to_english', question: '"क्या तुम कंप्यूटर इस्तेमाल कर रहे होंगे?" का English:', options: ['Will you be using the computer?', 'Do you use the computer?', 'Are you using the computer?'], correctIndex: 0, explanation: 'Will + you + be + V-ing?' },
          { type: 'mcq', question: 'Negative: "He will be cooking."', options: ['He will not be cooking.', 'He won\'t be cooking.', 'Both A and B are correct.'], correctIndex: 2, explanation: 'Both "will not" and "won\'t" are correct.' },
          { type: 'transform', question: '"They will be playing." — Make it a question.', options: ['Will they be playing?', 'Are they will be playing?', 'Will they playing?'], correctIndex: 0, explanation: 'Will + Subject + be + V-ing?' },
          { type: 'real_life', question: 'Friend: "Will you be going to the party?" You say:', options: ['Yes, I will be there.', 'Yes, I will go.', 'Yes, I going.'], correctIndex: 0, explanation: 'Answer with same tense: will be.' },
          { type: 'mcq', question: 'Which is correct?', options: ['I will be study.', 'I will be studying.', 'I will be studies.'], correctIndex: 1, explanation: 'will + be + V-ing (studying).' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 21: Future Perfect ──
  {
    day: 21, tenseId: 'future-perfect', title: 'Future Perfect', subtitle: 'Ho Chuka Hoga',
    description: 'Future Perfect — kisi time se pehle ho chuka hoga.',
    phase: 'mastery', isFree: false, focusExamples: ['fpf-1', 'fpf-2'],
    steps: [
      learnStep('future-perfect', 'Future Perfect — Seekho', 'Will + Have + V3',
        'Kisi future time se pehle kaam ho chuka hoga. Pattern: Subject + will + have + V3.', 'fpf-1'),
      examplesStep('future-perfect', 'Forms Dekho', 'fpf-1'),
      listenStep('free-trial', FT[12], 'Internet Issue'),
      speakStep('free-trial', FT[13], 'Thank You'),
      {
        type: 'recall_from_hi', sourceId: 'd21-meaning', tenseId: 'future-perfect',
        title: 'Hindi se English', instruction: '"मैं खाना खा चुका होऊँगा।" → English?',
        exampleId: 'fpf-1', formKey: 'affirmative', english: 'I will have eaten food.', hindi: 'मैं खाना खा चुका होऊँगा।',
      },
      { type: 'choose_correct', sourceId: 'd21-choose', tenseId: 'future-perfect', title: 'Choose Karo', options: ['fpf-1', 'fpf-2'], correctAnswer: 'fpf-1' },
      { type: 'fill_blank', sourceId: 'd21-fill', tenseId: 'future-perfect', title: 'Complete Karo', exampleId: 'fpf-1', english: 'I will have eaten food.', hindi: 'मैं खाना खा चुका होऊँगा।' },
      { type: 'transform', sourceId: 'd21-transform', tenseId: 'future-perfect', title: 'Badlo — Negative', instruction: '"I will have eaten" ko negative mein badlo.', exampleId: 'fpf-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I will have eaten food.', hindi: 'मैं खाना खा चुका होऊँगा।' },
      { type: 'real_life', sourceId: 'd21-real', tenseId: 'future-perfect', title: 'Real Life', instruction: 'Koi puchta hai: "Will you have finished by tomorrow?" Jawab do.' },
      {
        type: 'mini_test', sourceId: 'd21-test', tenseId: 'future-perfect', title: 'Day 21 Test', instruction: '7 sawaal — Will + Have + V3.',
        quizQuestions: [
          { type: 'mcq', question: '"By next year, I ___ graduated."', options: ['will have', 'will', 'have'], correctIndex: 0, explanation: 'will + have + V3.' },
          { type: 'fill_blank', question: 'She ___ have finished by 5 PM.', hindi: 'वह 5 बजे तक ___ खत्म कर चुकी होगी।', options: ['will', 'will has', 'will having'], correctIndex: 0, explanation: 'will + have + V3.' },
          { type: 'hindi_to_english', question: '"वे क्रिकेट खेल चुके होंगे।" का English:', options: ['They will have played cricket.', 'They will has played cricket.', 'They will have play cricket.'], correctIndex: 0, explanation: 'will + have + V3.' },
          { type: 'mcq', question: 'Negative: "I will have eaten."', options: ['I will not have eaten.', 'I will not have eat.', 'I won\'t have ate.'], correctIndex: 0, explanation: 'will + not + have + V3.' },
          { type: 'transform', question: '"He will have worked here." — Make it a question.', options: ['Will he have worked here?', 'Have he will worked here?', 'Will he has worked here?'], correctIndex: 0, explanation: 'Will + Subject + have + V3?' },
          { type: 'real_life', question: 'Friend: "Will you have finished your homework by dinner?" You say:', options: ['Yes, I will have finished.', 'Yes, I finish.', 'Yes, I am finishing.'], correctIndex: 0, explanation: 'will + have + V3 for future completion.' },
          { type: 'mcq', question: 'Which is Future Perfect?', options: ['I will eat.', 'I will be eating.', 'I will have eaten.'], correctIndex: 2, explanation: 'will + have + V3 = Future Perfect.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 22: Future Perfect — Practice ──
  {
    day: 22, tenseId: 'future-perfect', title: 'Future Perfect', subtitle: 'Practice',
    description: 'Future Perfect ko bolkar practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['fpf-3', 'fpf-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd22-warmup', tenseId: 'future-perfect', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd22-learn', tenseId: 'future-perfect',
        title: 'By the Time', subtitle: 'Deadline ka concept',
        instruction: '"By the time" = us samay tak. "By the time you arrive, I will have cooked dinner."',
        exampleId: 'fpf-3',
      },
      examplesStep('future-perfect', 'By the Time', 'fpf-3'),
      listenStep('free-trial', FT[14], 'Excuse Me'),
      speakStep('free-trial', FT[18], 'Have a Great Day'),
      {
        type: 'recall_from_hi', sourceId: 'd22-meaning', tenseId: 'future-perfect',
        title: 'Hindi se English', instruction: '"वे खेल चुके होंगे।" → English?',
        exampleId: 'fpf-3', formKey: 'affirmative', english: 'They will have played cricket.', hindi: 'वे क्रिकेट खेल चुके होंगे।',
      },
      { type: 'choose_correct', sourceId: 'd22-choose', tenseId: 'future-perfect', title: 'Choose Karo', options: ['fpf-3', 'fpf-4'], correctAnswer: 'fpf-4' },
      { type: 'fill_blank', sourceId: 'd22-fill', tenseId: 'future-perfect', title: 'Complete Karo', exampleId: 'fpf-4', english: 'He will have worked here.', hindi: 'वह यहाँ काम कर चुका होगा।' },
      { type: 'transform', sourceId: 'd22-transform', tenseId: 'future-perfect', title: 'Badlo — Interrogative', instruction: '"I will have eaten" ko question mein badlo.', exampleId: 'fpf-1', transformFrom: 'affirmative', transformTo: 'interrogative', english: 'I will have eaten food.', hindi: 'मैं खाना खा चुका होऊँगा।' },
      { type: 'real_life', sourceId: 'd22-real', tenseId: 'future-perfect', title: 'Real Life', instruction: 'Boss se: "By next week, I will have completed the project." Deadline batao.' },
      {
        type: 'mini_test', sourceId: 'd22-test', tenseId: 'future-perfect', title: 'Day 22 Test', instruction: '7 sawaal — By the Time, Deadline.',
        quizQuestions: [
          { type: 'mcq', question: '"By the time you arrive, I ___ finished."', options: ['will have', 'will', 'have'], correctIndex: 0, explanation: 'By the time + V2, subject + will + have + V3.' },
          { type: 'fill_blank', question: 'By 2025, she ___ have written 3 books.', hindi: '2025 तक, वह 3 किताबें ___ लिख चुकी होगी।', options: ['will', 'will has', 'will having'], correctIndex: 0, explanation: 'will + have + V3.' },
          { type: 'hindi_to_english', question: '"जब तुम आओगे, मैं खाना बना चुका होऊँगा।" का English:', options: ['By the time you arrive, I will have cooked.', 'When you arrive, I will cook.', 'By the time you arrive, I cook.'], correctIndex: 0, explanation: 'Future Perfect for earlier of two future actions.' },
          { type: 'mcq', question: 'Negative: "They will have left."', options: ['They will not have left.', 'They won\'t have left.', 'Both A and B are correct.'], correctIndex: 2, explanation: 'Both are correct negations.' },
          { type: 'transform', question: '"She will have finished." — Make it a question.', options: ['Will she have finished?', 'Has she will finished?', 'Will she has finished?'], correctIndex: 0, explanation: 'Will + she + have + V3?' },
          { type: 'real_life', question: 'Planning: "By December, I ___ have saved enough money."', options: ['will', 'am going to', 'can'], correctIndex: 0, explanation: 'will + have + V3 for future deadline.' },
          { type: 'mcq', question: '"I ___ have graduated by next June."', options: ['will', 'shall', 'Both A and B'], correctIndex: 2, explanation: 'Both "will" and "shall" are acceptable.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 23: Future Perfect Continuous ──
  {
    day: 23, tenseId: 'future-perfect-continuous', title: 'Future Perfect Continuous', subtitle: 'Chalti Rahegi',
    description: 'Future Perfect Continuous — bhavishya mein kisi tak chalti rahi kriya.',
    phase: 'mastery', isFree: false, focusExamples: ['fpcf-1', 'fpcf-2'],
    steps: [
      learnStep('future-perfect-continuous', 'FP Continuous — Seekho', 'Will + Have + Been + V-ing',
        'Bhavishya mein kisi time tak chal rahi action ki duration. Pattern: Subject + will + have + been + V-ing.', 'fpcf-1'),
      examplesStep('future-perfect-continuous', 'Forms Dekho', 'fpcf-1'),
      listenStep('free-trial', FT[19], 'Smaller Size?'),
      speakStep('free-trial', FT[2], 'From India'),
      {
        type: 'recall_from_hi', sourceId: 'd23-meaning', tenseId: 'future-perfect-continuous',
        title: 'Hindi se English', instruction: '"मैं खाना खाता रहा होऊँगा।" → English?',
        exampleId: 'fpcf-1', formKey: 'affirmative', english: 'I will have been eating food.', hindi: 'मैं खाना खाता रहा होऊँगा।',
      },
      { type: 'choose_correct', sourceId: 'd23-choose', tenseId: 'future-perfect-continuous', title: 'Choose Karo', options: ['fpcf-1', 'fpcf-2'], correctAnswer: 'fpcf-1' },
      { type: 'fill_blank', sourceId: 'd23-fill', tenseId: 'future-perfect-continuous', title: 'Complete Karo', exampleId: 'fpcf-1', english: 'I will have been eating food.', hindi: 'मैं खाना खाता रहा होऊँगा।' },
      { type: 'transform', sourceId: 'd23-transform', tenseId: 'future-perfect-continuous', title: 'Badlo — Negative', instruction: '"I will have been eating" ko negative.', exampleId: 'fpcf-1', transformFrom: 'affirmative', transformTo: 'negative', english: 'I will have been eating food.', hindi: 'मैं खाना खाता रहा होऊँगा।' },
      { type: 'real_life', sourceId: 'd23-real', tenseId: 'future-perfect-continuous', title: 'Real Life', instruction: 'Koi puchta hai: "How long will you have been working here by December?" Jawab do.' },
      {
        type: 'mini_test', sourceId: 'd23-test', tenseId: 'future-perfect-continuous', title: 'Day 23 Test', instruction: '7 sawaal — Duration in Future.',
        quizQuestions: [
          { type: 'mcq', question: '"By December, I ___ been working here for 5 years."', options: ['will have', 'will', 'have'], correctIndex: 0, explanation: 'will + have + been + V-ing.' },
          { type: 'fill_blank', question: 'By next month, she ___ have been studying for 6 months.', hindi: 'अगले महीने तक, वह 6 महीने से पढ़ रही ___।', options: ['will', 'will has', 'will having'], correctIndex: 0, explanation: 'will + have + been + V-ing.' },
          { type: 'hindi_to_english', question: '"दिसंबर तक वे 3 साल से खेल रहे होंगे।" का English:', options: ['By December, they will have been playing for 3 years.', 'By December, they will play for 3 years.', 'By December, they have been playing for 3 years.'], correctIndex: 0, explanation: 'will + have + been + V-ing + duration.' },
          { type: 'mcq', question: 'Negative: "He will have been working."', options: ['He will not have been working.', 'He won\'t have been working.', 'Both are correct.'], correctIndex: 2, explanation: 'Both negations are valid.' },
          { type: 'transform', question: '"I will have been waiting." — Make it a question.', options: ['Will I have been waiting?', 'Have I will been waiting?', 'Will I have been waiting?'], correctIndex: 0, explanation: 'Will + Subject + have + been + V-ing?' },
          { type: 'real_life', question: 'Interview: "By next year, how long will you have been in this field?" You say:', options: ['I will have been in this field for 5 years.', 'I have been in this field for 5 years.', 'I am in this field for 5 years.'], correctIndex: 0, explanation: 'will + have + been + duration for future milestone.' },
          { type: 'mcq', question: 'Which is Future Perfect Continuous?', options: ['I will eat.', 'I will have eaten.', 'I will have been eating.'], correctIndex: 2, explanation: 'will + have + been + V-ing.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 24: Future Perfect Continuous — Practice ──
  {
    day: 24, tenseId: 'future-perfect-continuous', title: 'Future Perfect Continuous', subtitle: 'Practice',
    description: 'FP Continuous ko bolkar practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['fpcf-3', 'fpcf-4'],
    steps: [
      { type: 'quick_review', sourceId: 'd24-warmup', tenseId: 'future-perfect-continuous', title: 'Warm-up' },
      {
        type: 'learn_concept', sourceId: 'd24-learn', tenseId: 'future-perfect-continuous',
        title: 'Emphasis on Duration', subtitle: 'Kitna time ho chuka hoga',
        instruction: 'FP Continuous emphasize karta hai duration ko. "By 2030, I will have been living here for 20 years."',
        exampleId: 'fpcf-3',
      },
      examplesStep('future-perfect-continuous', 'Duration Emphasis', 'fpcf-3'),
      listenStep('free-trial', FT[3], 'Wake Up Daily'),
      speakStep('free-trial', FT[10], 'Work in Office'),
      {
        type: 'recall_from_hi', sourceId: 'd24-meaning', tenseId: 'future-perfect-continuous',
        title: 'Hindi se English', instruction: '"वे खेलते रहे होंगे।" → English?',
        exampleId: 'fpcf-3', formKey: 'affirmative', english: 'They will have been playing cricket.', hindi: 'वे क्रिकेट खेलते रहे होंगे।',
      },
      { type: 'choose_correct', sourceId: 'd24-choose', tenseId: 'future-perfect-continuous', title: 'Choose Karo', options: ['fpcf-3', 'fpcf-4'], correctAnswer: 'fpcf-4' },
      { type: 'fill_blank', sourceId: 'd24-fill', tenseId: 'future-perfect-continuous', title: 'Complete Karo', exampleId: 'fpcf-4', english: 'He will have been working here.', hindi: 'वह यहाँ काम करता रहा होगा।' },
      { type: 'transform', sourceId: 'd24-transform', tenseId: 'future-perfect-continuous', title: 'Badlo — Negative', instruction: '"They will have been playing" ko negative.', exampleId: 'fpcf-3', transformFrom: 'affirmative', transformTo: 'negative', english: 'They will have been playing cricket.', hindi: 'वे क्रिकेट खेलते रहे होंगे।' },
      { type: 'real_life', sourceId: 'd24-real', tenseId: 'future-perfect-continuous', title: 'Real Life', instruction: 'Birthday pe: "By next year, I will have been learning English for 2 years."' },
      {
        type: 'mini_test', sourceId: 'd24-test', tenseId: 'future-perfect-continuous', title: 'Day 24 Test', instruction: '7 sawaal — Duration, Emphasis.',
        quizQuestions: [
          { type: 'mcq', question: '"By 2030, she ___ been living here for 20 years."', options: ['will have', 'will', 'has'], correctIndex: 0, explanation: 'will + have + been + V-ing + duration.' },
          { type: 'fill_blank', question: 'By June, I ___ have been studying for 1 year.', hindi: 'जून तक, मैं 1 साल से पढ़ रहा ___।', options: ['will', 'will has', 'will having'], correctIndex: 0, explanation: 'will + have + been + V-ing.' },
          { type: 'hindi_to_english', question: '"अगले महीने तक वह 5 साल से काम कर रहा होगा।" का English:', options: ['By next month, he will have been working for 5 years.', 'By next month, he will work for 5 years.', 'By next month, he has been working for 5 years.'], correctIndex: 0, explanation: 'will + have + been + V-ing + for + duration.' },
          { type: 'mcq', question: 'Negative: "We will have been playing."', options: ['We will not have been playing.', 'We won\'t have been playing.', 'Both are correct.'], correctIndex: 2, explanation: 'Both negations work.' },
          { type: 'transform', question: '"I will have been waiting." — Make it a question.', options: ['Will I have been waiting?', 'Have I been will waiting?', 'Will I have been wait?'], correctIndex: 0, explanation: 'Will + I + have + been + V-ing?' },
          { type: 'real_life', question: 'Milestone: "By the time I turn 30, I ___ have been working for 10 years."', options: ['will', 'will have', 'am going to'], correctIndex: 1, explanation: 'will + have + been + V-ing for duration milestone.' },
          { type: 'mcq', question: 'Which shows duration emphasis?', options: ['I will work tomorrow.', 'I will have been working for 5 hours by evening.', 'I will be working at 5 PM.'], correctIndex: 1, explanation: 'will + have + been + V-ing + for + duration.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 25: Present Tenses Mixed ──
  {
    day: 25, tenseId: null, title: 'Present Tenses Mixed', subtitle: 'All 4 Present Tenses',
    description: 'Saare Present tenses ko mix karke practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['sp-1', 'pc-1', 'pp-1', 'ppc-1'],
    steps: [
      { type: 'quick_review', sourceId: 'd25-review', title: 'Quick Review — All Present Tenses' },
      {
        type: 'learn_concept', sourceId: 'd25-learn', tenseId: 'simple-present',
        title: 'Present Tenses Summary', subtitle: 'SP, PC, PP, PPC',
        instruction: 'SP = habits. PC = now. PP = completed with result. PPC = duration ongoing.',
        exampleId: 'sp-1',
      },
      listenStep('beginner', BG[1], 'Good Morning'),
      speakStep('beginner', BG[5], 'Fine & You?'),
      {
        type: 'choose_correct', sourceId: 'd25-choose', tenseId: 'simple-present',
        title: 'Choose Karo — Kaunsa Tense?', instruction: 'Sahi tense choose karo.',
        options: ['sp-1', 'pc-1', 'pp-1'], correctAnswer: 'sp-1',
      },
      {
        type: 'fill_blank', sourceId: 'd25-fill', tenseId: 'present-continuous',
        title: 'Complete Karo', instruction: 'Sahi tense ka form bharo.',
        exampleId: 'pc-1', english: 'I am eating food.', hindi: 'मैं खाना खा रहा हूँ।',
      },
      {
        type: 'transform', sourceId: 'd25-transform', tenseId: 'present-perfect',
        title: 'Badlo — Negative', instruction: '"I have eaten food" ko negative mein badlo.',
        exampleId: 'pp-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'real_life', sourceId: 'd25-real', tenseId: 'simple-present',
        title: 'Real Life', instruction: 'Apne daily routine batao — present tenses ka mix use karo.',
      },
      {
        type: 'mini_test', sourceId: 'd25-test', title: 'Day 25 Test', instruction: '7 sawaal — All Present Tenses mixed.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ food every day." Which tense?', options: ['eat (SP)', 'am eating (PC)', 'have eaten (PP)'], correctIndex: 0, explanation: 'Habit = Simple Present: eat.' },
          { type: 'fill_blank', question: 'She ___ reading a book right now.', hindi: 'वह अभी किताब ___ रही है।', options: ['is', 'has been', 'was'], correctIndex: 0, explanation: 'Right now = Present Continuous: is + V-ing.' },
          { type: 'hindi_to_english', question: '"मैंने खाना खा लिया है।" का English (kaunsa tense?):', options: ['I have eaten food. (PP)', 'I eat food. (SP)', 'I am eating food. (PC)'], correctIndex: 0, explanation: 'Past action with present result = Present Perfect.' },
          { type: 'mcq', question: 'Which is Present Continuous?', options: ['I eat daily.', 'I am eating now.', 'I have eaten.'], correctIndex: 1, explanation: 'am + V-ing = Present Continuous.' },
          { type: 'transform', question: '"She reads a book." → Present Perfect.', options: ['She has read a book.', 'She is reading a book.', 'She will read a book.'], correctIndex: 0, explanation: 'has + V3 = Present Perfect.' },
          { type: 'real_life', question: 'Friend: "What are you doing?" You say:', options: ['I study.', 'I am studying.', 'I have studied.'], correctIndex: 1, explanation: 'Right now = Present Continuous.' },
          { type: 'mcq', question: '"I ___ been learning for 2 months."', options: ['have (PPC)', 'am (PC)', 'had (Past)'], correctIndex: 0, explanation: 'Duration ongoing = Present Perfect Continuous: have been + V-ing.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 26: Past Tenses Mixed ──
  {
    day: 26, tenseId: null, title: 'Past Tenses Mixed', subtitle: 'All 4 Past Tenses',
    description: 'Saare Past tenses ko mix karke practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['spt-1', 'pcst-1', 'ppst-1', 'ppcst-1'],
    steps: [
      { type: 'quick_review', sourceId: 'd26-review', title: 'Quick Review — All Past Tenses' },
      {
        type: 'learn_concept', sourceId: 'd26-learn', tenseId: 'simple-past',
        title: 'Past Tenses Summary', subtitle: 'SP, PC, PP, PPC',
        instruction: 'SP = V2. PC = was/were + V-ing. PP = had + V3. PPC = had + been + V-ing.',
        exampleId: 'spt-1',
      },
      listenStep('beginner', BG[15], 'Nice Talking'),
      speakStep('beginner', BG[12], 'Take Care'),
      {
        type: 'choose_correct', sourceId: 'd26-choose', tenseId: 'simple-past',
        title: 'Choose Karo — Kaunsa Past Tense?', options: ['spt-1', 'pcst-1', 'ppst-1'], correctAnswer: 'pcst-1',
      },
      {
        type: 'fill_blank', sourceId: 'd26-fill', tenseId: 'past-continuous',
        title: 'Complete Karo', exampleId: 'pcst-1', english: 'I was eating food.', hindi: 'मैं खाना खा रहा था।',
      },
      {
        type: 'transform', sourceId: 'd26-transform', tenseId: 'past-perfect',
        title: 'Badlo — Negative', instruction: '"I had eaten food" ko negative mein badlo.',
        exampleId: 'ppst-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I had eaten food.', hindi: 'मैंने खाना खा लिया था।',
      },
      {
        type: 'real_life', sourceId: 'd26-real', tenseId: 'simple-past',
        title: 'Real Life', instruction: 'Kal ka din batao — past tenses ka mix use karo.',
      },
      {
        type: 'mini_test', sourceId: 'd26-test', title: 'Day 26 Test', instruction: '7 sawaal — All Past Tenses mixed.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ food yesterday." (Past Simple)', options: ['ate', 'was eating', 'had eaten'], correctIndex: 0, explanation: 'Completed past action = V2 (ate).' },
          { type: 'fill_blank', question: 'She ___ working when I arrived.', hindi: 'वह काम कर रही ___ जब मैं आया।', options: ['was', 'had been', 'has been'], correctIndex: 0, explanation: 'Ongoing past = was + V-ing.' },
          { type: 'hindi_to_english', question: '"मैंने खाना खा लिया था।" का English (kaunsa tense?):', options: ['I had eaten food. (PP)', 'I ate food. (SP)', 'I was eating food. (PC)'], correctIndex: 0, explanation: 'Earlier past = had + V3 = Past Perfect.' },
          { type: 'mcq', question: 'Which is Past Continuous?', options: ['I ate.', 'I was eating.', 'I had eaten.'], correctIndex: 1, explanation: 'was/were + V-ing = Past Continuous.' },
          { type: 'transform', question: '"She read a book." → Past Perfect.', options: ['She had read a book.', 'She was reading a book.', 'She has read a book.'], correctIndex: 0, explanation: 'had + V3 = Past Perfect.' },
          { type: 'real_life', question: 'Story: "When I arrived, she ___. (was cooking)" You say:', options: ['When I arrived, she was cooking.', 'When I arrive, she was cooking.', 'When I arrived, she cooked.'], correctIndex: 0, explanation: 'Long past action interrupted = Past Continuous.' },
          { type: 'mcq', question: '"They ___ been waiting for 2 hours before the bus came."', options: ['had (PPC)', 'have (PPC)', 'were (PC)'], correctIndex: 0, explanation: 'Duration before past event = had been + V-ing.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 27: Future Tenses Mixed ──
  {
    day: 27, tenseId: null, title: 'Future Tenses Mixed', subtitle: 'All 4 Future Tenses',
    description: 'Saare Future tenses ko mix karke practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['sf-1', 'fc-1', 'fpf-1', 'fpcf-1'],
    steps: [
      { type: 'quick_review', sourceId: 'd27-review', title: 'Quick Review — All Future Tenses' },
      {
        type: 'learn_concept', sourceId: 'd27-learn', tenseId: 'simple-future',
        title: 'Future Tenses Summary', subtitle: 'SF, FC, FPF, FPCF',
        instruction: 'SF = will + V1. FC = will + be + V-ing. FPF = will + have + V3. FPCF = will + have + been + V-ing.',
        exampleId: 'sf-1',
      },
      listenStep('free-trial', FT[0], 'English Understanding'),
      speakStep('free-trial', FT[1], 'Name Introduction'),
      {
        type: 'choose_correct', sourceId: 'd27-choose', tenseId: 'simple-future',
        title: 'Choose Karo — Kaunsa Future Tense?', options: ['sf-1', 'fc-1', 'fpf-1'], correctAnswer: 'fc-1',
      },
      {
        type: 'fill_blank', sourceId: 'd27-fill', tenseId: 'future-continuous',
        title: 'Complete Karo', exampleId: 'fc-1', english: 'I will be eating food.', hindi: 'मैं खाना खा रहा होऊँगा।',
      },
      {
        type: 'transform', sourceId: 'd27-transform', tenseId: 'future-perfect',
        title: 'Badlo — Negative', instruction: '"I will have eaten food" ko negative mein badlo.',
        exampleId: 'fpf-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I will have eaten food.', hindi: 'मैं खाना खा चुका होऊँगा।',
      },
      {
        type: 'real_life', sourceId: 'd27-real', tenseId: 'simple-future',
        title: 'Real Life', instruction: 'Apne future plans batao — future tenses ka mix use karo.',
      },
      {
        type: 'mini_test', sourceId: 'd27-test', title: 'Day 27 Test', instruction: '7 sawaal — All Future Tenses.',
        quizQuestions: [
          { type: 'mcq', question: '"I ___ go tomorrow." (Simple Future)', options: ['will', 'will be', 'will have'], correctIndex: 0, explanation: 'will + V1 = Simple Future.' },
          { type: 'fill_blank', question: 'At 5 PM, she ___ be cooking.', hindi: '5 बजे, वह पका ___ रही होगी।', options: ['will', 'will have', 'will have been'], correctIndex: 0, explanation: 'At specific time = will + be + V-ing.' },
          { type: 'hindi_to_english', question: '"वे खेल चुके होंगे।" का English (kaunsa tense?):', options: ['They will have played. (FPF)', 'They will play. (SF)', 'They will be playing. (FC)'], correctIndex: 0, explanation: 'will + have + V3 = Future Perfect.' },
          { type: 'mcq', question: 'Which is Future Continuous?', options: ['I will eat.', 'I will be eating.', 'I will have eaten.'], correctIndex: 1, explanation: 'will + be + V-ing = Future Continuous.' },
          { type: 'transform', question: '"He will work here." → Future Perfect.', options: ['He will have worked here.', 'He will be working here.', 'He has worked here.'], correctIndex: 0, explanation: 'will + have + V3 = Future Perfect.' },
          { type: 'real_life', question: 'Plan: "By 2030, I ___ have been working for 10 years."', options: ['will', 'will have', 'am going to'], correctIndex: 1, explanation: 'will + have + been + V-ing for future duration.' },
          { type: 'mcq', question: '"This time next week, I ___ on a beach."', options: ['will lie', 'will be lying', 'will have lain'], correctIndex: 1, explanation: 'Ongoing at future time = will be + V-ing.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 28: Real-Life Mixed ──
  {
    day: 28, tenseId: null, title: 'Real-Life Sentences', subtitle: 'All 12 Tenses — Real Practice',
    description: 'Har tense ke real-life sentences bolo aur practice karo.',
    phase: 'mastery', isFree: false, focusExamples: [],
    steps: [
      { type: 'quick_review', sourceId: 'd28-review', title: 'Quick Review — All 12 Tenses' },
      {
        type: 'learn_concept', sourceId: 'd28-learn', tenseId: 'simple-present',
        title: 'Tense Selection', subtitle: 'Kab kaunsa tense?',
        instruction: 'Situation dekho, tense choose karo. Habit = SP. Now = PC. Done = PP. Story = Past. Future = Will.',
        exampleId: 'sp-1',
      },
      listenStep('free-trial', FT[3], 'Daily Wake Up'),
      speakStep('free-trial', FT[5], 'Ask Price'),
      {
        type: 'choose_correct', sourceId: 'd28-choose', tenseId: 'simple-present',
        title: 'Real Situation', instruction: 'Sahi sentence choose karo — kaunsa tense sahi hai?',
        options: ['sp-1', 'pc-1', 'pp-1'], correctAnswer: 'pc-1',
      },
      {
        type: 'fill_blank', sourceId: 'd28-fill', tenseId: 'present-perfect',
        title: 'Complete Karo', exampleId: 'pp-1', english: 'I have eaten food.', hindi: 'मैंने खाना खा लिया है।',
      },
      {
        type: 'transform', sourceId: 'd28-transform', tenseId: 'simple-past',
        title: 'Badlo — Negative', instruction: '"I ate food" ko negative mein badlo.',
        exampleId: 'spt-1', transformFrom: 'affirmative', transformTo: 'negative',
        english: 'I ate food.', hindi: 'मैंने खाना खाया।',
      },
      {
        type: 'real_life', sourceId: 'd28-real', tenseId: 'simple-present',
        title: 'Real-Life Challenge', instruction: 'Interview questions: "Tell me about yourself" — saare tenses ka mix use karo.',
      },
      {
        type: 'mini_test', sourceId: 'd28-test', title: 'Day 28 Test', instruction: '7 sawaal — All 12 Tenses Grand Test.',
        quizQuestions: [
          { type: 'mcq', question: 'Which sentence uses Simple Present correctly?', options: ['She is eating.', 'She eats daily.', 'She will eat.'], correctIndex: 1, explanation: 'Habit/routine = Simple Present: eats.' },
          { type: 'fill_blank', question: 'Right now, I ___ studying English.', hindi: 'अभी, मैं अंग्रेज़ी ___ रहा हूँ।', options: ['am', 'have been', 'was'], correctIndex: 0, explanation: 'Right now = Present Continuous: am + V-ing.' },
          { type: 'hindi_to_english', question: '"मैंने अभी-अभी खाना खाया है।" का English:', options: ['I just ate.', 'I have just eaten.', 'I am just eating.'], correctIndex: 1, explanation: '"Just" = abhi abhi = Present Perfect: have + just + V3.' },
          { type: 'mcq', question: 'Story: "When I arrived, she ___. " Which is correct?', options: ['cooked', 'was cooking', 'had cooked'], correctIndex: 1, explanation: 'Long ongoing past = was + V-ing (interrupted).' },
          { type: 'transform', question: '"I will finish by tomorrow." → Future Perfect.', options: ['I will have finished by tomorrow.', 'I will be finishing by tomorrow.', 'I have finished by tomorrow.'], correctIndex: 0, explanation: 'will + have + V3 = Future Perfect.' },
          { type: 'real_life', question: 'Interview: "How long have you been learning English?" You say:', options: ['I learn English for 2 years.', 'I have been learning English for 2 years.', 'I am learning English for 2 years.'], correctIndex: 1, explanation: 'Duration = Present Perfect Continuous.' },
          { type: 'mcq', question: 'Which is correct for a fact?', options: ['The Earth is revolving.', 'The Earth revolves.', 'The Earth will revolve.'], correctIndex: 1, explanation: 'Facts always use Simple Present: revolves.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 29: Revision ──
  {
    day: 29, tenseId: null, title: 'Grammar Revision', subtitle: 'Weak Areas Practice',
    description: 'Apni weak areas identify karo aur practice karo.',
    phase: 'mastery', isFree: false, focusExamples: ['sp-1', 'spt-1', 'sf-1'],
    steps: [
      { type: 'quick_review', sourceId: 'd29-warmup', title: 'Warm-up — Quick Review' },
      {
        type: 'learn_concept', sourceId: 'd29-learn', tenseId: 'simple-present',
        title: 'Common Mistakes', subtitle: 'Sabse zyada galti kahan hoti hai?',
        instruction: '1. She go (❌) → She goes (✓). 2. I am eat (❌) → I am eating (✓). 3. I had ate (❌) → I had eaten (✓).',
        exampleId: 'sp-1',
      },
      listenStep('beginner', BG[4], 'How Going?'),
      speakStep('beginner', BG[8], 'Nice to See'),
      {
        type: 'choose_correct', sourceId: 'd29-choose', tenseId: 'simple-present',
        title: 'Mistake Finder', options: ['sp-1', 'spt-1', 'sf-1'], correctAnswer: 'sp-1',
      },
      {
        type: 'fill_blank', sourceId: 'd29-fill', tenseId: 'simple-past',
        title: 'Complete Karo', exampleId: 'spt-1', english: 'I ate food.', hindi: 'मैंने खाना खाया।',
      },
      {
        type: 'transform', sourceId: 'd29-transform', tenseId: 'simple-present',
        title: 'Badlo — Interrogative', instruction: '"I eat food" ko question mein badlo.',
        exampleId: 'sp-1', transformFrom: 'affirmative', transformTo: 'interrogative',
        english: 'Do I eat food?', hindi: 'क्या मैं खाना खाता हूँ?',
      },
      {
        type: 'real_life', sourceId: 'd29-real', tenseId: 'simple-present',
        title: 'Real-Life Revision', instruction: 'Apne dost ko explain karo: "I have been learning English for 6 months." Different tenses use karo.',
      },
      {
        type: 'mini_test', sourceId: 'd29-test', title: 'Day 29 Test', instruction: '7 sawaal — Revision Mixed.',
        quizQuestions: [
          { type: 'mcq', question: 'Find the mistake: "She go to school every day."', options: ['No mistake', 'go → goes', 'every day → yesterday'], correctIndex: 1, explanation: 'She = third person, so "goes" (V1 + s).' },
          { type: 'fill_blank', question: 'By next week, I ___ have finished.', hindi: 'अगले हफ्ते तक, मैं ___ खत्म कर चुका होऊँगा।', options: ['will', 'would', 'should'], correctIndex: 0, explanation: 'Future Perfect: will + have + V3.' },
          { type: 'hindi_to_english', question: '"मैं खाना खा रहा था जब फोन बजा।" का English:', options: ['I was eating when the phone rang.', 'I had been eating when the phone rang.', 'I ate when the phone rings.'], correctIndex: 0, explanation: 'Long action (was eating) interrupted by short action (rang).' },
          { type: 'mcq', question: 'Which is always wrong?', options: ['I have eaten.', 'I have ate.', 'I had eaten.'], correctIndex: 1, explanation: '"Have ate" is wrong — it should be "have eaten" (V3).' },
          { type: 'transform', question: '"They play cricket." → Past Perfect.', options: ['They had played cricket.', 'They have played cricket.', 'They were playing cricket.'], correctIndex: 0, explanation: 'had + V3 = Past Perfect.' },
          { type: 'real_life', question: 'Common mistake: "I am agree with you." Correct version:', options: ['I am agree.', 'I agree.', 'I agreeing.'], correctIndex: 1, explanation: '"Agree" is a verb, not adjective. "I agree" (Simple Present).' },
          { type: 'mcq', question: '"She ___ here since 2020."', options: ['has been working', 'is working', 'was working'], correctIndex: 0, explanation: 'since + point in time = Present Perfect Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },

  // ── Day 30: Final Assessment ──
  {
    day: 30, tenseId: null, title: 'Final Assessment', subtitle: 'Complete Grammar Test',
    description: 'Apne poore grammar knowledge ka final test do!',
    phase: 'mastery', isFree: false, focusExamples: [],
    steps: [
      {
        type: 'quick_review', sourceId: 'd30-warmup',
        title: 'Last Review — Sab Yaad Karo', instruction: '12 tenses, 4 forms each, real-life usage. You\'re ready!',
      },
      {
        type: 'mini_test', sourceId: 'd30-final-test',
        title: '🏆 GRAND FINALE — 8 Questions',
        instruction: 'Final test! Har tense se sawaal. Score banao!',
        quizQuestions: [
          { type: 'mcq', question: '"She ___ to the office every day."', options: ['go', 'goes', 'is going'], correctIndex: 1, explanation: 'She = third person, Simple Present: goes.' },
          { type: 'fill_blank', question: 'Right now, they ___ playing football.', hindi: 'अभी, वे फुटबॉल ___ खेल रहे हैं।', options: ['are', 'have been', 'were'], correctIndex: 0, explanation: 'Right now = Present Continuous: are + V-ing.' },
          { type: 'hindi_to_english', question: '"मैंने खाना खा लिया है।" का English:', options: ['I have eaten food.', 'I ate food.', 'I am eating food.'], correctIndex: 0, explanation: 'Past action with present result = Present Perfect.' },
          { type: 'mcq', question: '"When I arrived, she ___. " Choose:', options: ['cooked', 'was cooking', 'had been cooking'], correctIndex: 1, explanation: 'Long past action = was + V-ing (interrupted).' },
          { type: 'transform', question: '"He will work here." → Past Perfect.', options: ['He had worked here.', 'He has worked here.', 'He was working here.'], correctIndex: 0, explanation: 'had + V3 = Past Perfect.' },
          { type: 'real_life', question: 'Interview: "How long have you been learning English?" Best answer:', options: ['I learn English for 2 years.', 'I have been learning English for 2 years.', 'I am learning English.'], correctIndex: 1, explanation: 'Duration = Present Perfect Continuous.' },
          { type: 'mcq', question: '"By next year, she ___ 5 books."', options: ['will write', 'will have written', 'will be writing'], correctIndex: 1, explanation: 'Deadline = Future Perfect: will + have + V3.' },
          { type: 'fill_blank', question: 'It ___ raining for 3 hours before it stopped.', hindi: '3 घंटे से बारिश ___ रही थी जब रुकी।', options: ['had been', 'has been', 'was'], correctIndex: 0, explanation: 'Duration before past event = Past Perfect Continuous.' },
        ],
      },
    ],
    totalSteps: 0,
  },
];

// Compute totalSteps
CURRICULUM.forEach(day => { day.totalSteps = day.steps.length; });

export function getDayCurriculum(day: number): DayCurriculum | undefined {
  return CURRICULUM.find(d => d.day === day);
}

export function getDayStepCount(day: number): number {
  return getDayCurriculum(day)?.totalSteps || 0;
}
