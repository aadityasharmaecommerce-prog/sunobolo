/**
 * Free Trial — 25 original real-life sentences.
 * These are the first sentences a new user practices.
 * They must feel immediately useful — NOT textbook or alphabet-style.
 *
 * Difficulty progression:
 *   1–5:   Very easy, short sentences
 *   6–10:  Simple real-life situations
 *   11–15: Questions and requests
 *   16–20: Longer practical sentences
 *   21–25: Natural conversational sentences
 */

export interface FreeTrialSentence {
  english: string;
  hindi: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export const freeTrialSentences: FreeTrialSentence[] = [
  // ─── Sentences 1–5: Very easy, short ───
  {
    english: 'My name is Rahul.',
    hindi: 'मेरा नाम राहुल है।',
    difficulty: 'easy',
    topic: 'Introduction',
  },
  {
    english: 'Nice to meet you.',
    hindi: 'आपसे मिलकर अच्छा लगा।',
    difficulty: 'easy',
    topic: 'Greetings',
  },
  {
    english: 'I am fine, thank you.',
    hindi: 'मैं ठीक हूँ, शुक्रिया।',
    difficulty: 'easy',
    topic: 'Greetings',
  },
  {
    english: 'Thank you very much.',
    hindi: 'बहुत-बहुत शुक्रिया।',
    difficulty: 'easy',
    topic: 'Polite Expressions',
  },
  {
    english: 'Good morning.',
    hindi: 'सुप्रभात।',
    difficulty: 'easy',
    topic: 'Greetings',
  },

  // ─── Sentences 6–10: Simple real-life situations ───
  {
    english: 'I am running late.',
    hindi: 'मुझे देर हो रही है।',
    difficulty: 'easy',
    topic: 'Being Late',
  },
  {
    english: 'I will be there in five minutes.',
    hindi: 'मैं पाँच मिनट में पहुँच जाऊँगा।',
    difficulty: 'easy',
    topic: 'Time',
  },
  {
    english: 'I am hungry.',
    hindi: 'मुझे भूख लग रही है।',
    difficulty: 'easy',
    topic: 'Food',
  },
  {
    english: 'I would like a cup of tea.',
    hindi: 'मुझे एक कप चाय चाहिए।',
    difficulty: 'easy',
    topic: 'Food',
  },
  {
    english: 'Where is the nearest station?',
    hindi: 'नज़दीकी स्टेशन कहाँ है?',
    difficulty: 'easy',
    topic: 'Directions',
  },

  // ─── Sentences 11–15: Questions and requests ───
  {
    english: 'How much does this cost?',
    hindi: 'इसकी कीमत कितनी है?',
    difficulty: 'medium',
    topic: 'Shopping',
  },
  {
    english: 'Can you help me please?',
    hindi: 'क्या आप मेरी मदद कर सकते हैं?',
    difficulty: 'medium',
    topic: 'Asking for Help',
  },
  {
    english: 'What time should I come?',
    hindi: 'मुझे कितने बजे आना चाहिए?',
    difficulty: 'medium',
    topic: 'Time',
  },
  {
    english: 'Can you call me back later?',
    hindi: 'क्या आप बाद में फिर से कॉल कर सकते हैं?',
    difficulty: 'medium',
    topic: 'Phone Calls',
  },
  {
    english: 'I do not understand this.',
    hindi: 'मुझे यह समझ नहीं आ रहा।',
    difficulty: 'medium',
    topic: 'Understanding',
  },

  // ─── Sentences 16–20: Longer practical sentences ───
  {
    english: 'Could you please say that again?',
    hindi: 'क्या आप फिर से कह सकते हैं?',
    difficulty: 'medium',
    topic: 'Repeating',
  },
  {
    english: 'I am sorry, I made a mistake.',
    hindi: 'माफ़ कीजिए, मुझसे गलती हो गई।',
    difficulty: 'medium',
    topic: 'Apology',
  },
  {
    english: 'I will finish this work by today.',
    hindi: 'मैं आज ही यह काम पूरा कर दूँगा।',
    difficulty: 'medium',
    topic: 'Work',
  },
  {
    english: 'What are you doing this evening?',
    hindi: 'आप शाम को क्या कर रहे हैं?',
    difficulty: 'medium',
    topic: 'Plans',
  },
  {
    english: 'Please give me one minute.',
    hindi: 'कृपया एक मिनट दीजिए।',
    difficulty: 'medium',
    topic: 'Requests',
  },

  // ─── Sentences 21–25: Natural conversational sentences ───
  {
    english: 'I need to talk to you about something important.',
    hindi: 'मुझे आपसे कुछ ज़रूरी बात करनी है।',
    difficulty: 'hard',
    topic: 'Communication',
  },
  {
    english: 'Let me try again, I think I can do it.',
    hindi: 'मुझे फिर से कोशिश करने दीजिए, मुझे लगता है मैं कर सकता हूँ।',
    difficulty: 'hard',
    topic: 'Confidence',
  },
  {
    english: 'It was really nice talking to you today.',
    hindi: 'आज आपसे बात करके बहुत अच्छा लगा।',
    difficulty: 'hard',
    topic: 'Social Conversation',
  },
  {
    english: 'I will let you know about it tomorrow.',
    hindi: 'मैं कल आपको इसके बारे में बता दूँगा।',
    difficulty: 'hard',
    topic: 'Future Plans',
  },
  {
    english: 'Do not worry about it, I will take care of everything.',
    hindi: 'इसकी चिंता मत करो, मैं सब सँभाल लूँगा।',
    difficulty: 'hard',
    topic: 'Common Conversation',
  },
];
