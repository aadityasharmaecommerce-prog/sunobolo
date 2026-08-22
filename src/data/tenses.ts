// ============================================
// SUNOBOLO ENGLISH — TENSES SECTION
// 12 tenses × 4 base examples × 4 forms = 192 forms
// Forms: Affirmative, Negative, Interrogative, Why Question
// ============================================

export interface TenseForm {
  en: string;
  hi: string;
  originalId?: string;
  audioCourseId?: string;
}

export interface TenseExample {
  id: string;
  label: string;
  affirmative: TenseForm;
  negative: TenseForm;
  interrogative: TenseForm;
  whyQuestion: TenseForm;
}

export interface TenseCategory {
  id: string;
  title: string;
  subtitle: string;
  group: 'present' | 'past' | 'future';
  pattern: string;
  explanation: {
    when: string;
    structure: string;
    hindi: string;
  };
  examples: TenseExample[];
}

// ─────────────────────────────────────────────
// PRESENT TENSES
// ─────────────────────────────────────────────

const simplePresent: TenseCategory = {
  id: 'simple-present',
  title: 'Simple Present',
  subtitle: 'Habits, routines, facts',
  group: 'present',
  pattern: 'Subject + V1(s/es)',
  explanation: {
    when: 'Use for habits, daily routines, general truths, and facts that are always true.',
    structure: 'Subject + verb (add -s/-es for he/she/it)',
    hindi: 'आदतों, दिनचर्या, तथ्यों और हमेशा सच रहने वाली बातों के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'sp-1', label: 'Eat food',
      affirmative: { en: 'I eat food.', hi: 'मैं खाना खाता हूँ।' },
      negative: { en: 'I do not eat food.', hi: 'मैं खाना नहीं खाता।' },
      interrogative: { en: 'Do I eat food?', hi: 'क्या मैं खाना खाता हूँ?' },
      whyQuestion: { en: 'Why do I eat food?', hi: 'मैं खाना क्यों खाता हूँ?' },
    },
    {
      id: 'sp-2', label: 'Read a book',
      affirmative: { en: 'She reads a book.', hi: 'वह किताब पढ़ती है।' },
      negative: { en: 'She does not read a book.', hi: 'वह किताब नहीं पढ़ती।' },
      interrogative: { en: 'Does she read a book?', hi: 'क्या वह किताब पढ़ती है?' },
      whyQuestion: { en: 'Why does she read a book?', hi: 'वह किताब क्यों पढ़ती है?' },
    },
    {
      id: 'sp-3', label: 'Play cricket',
      affirmative: { en: 'They play cricket.', hi: 'वे क्रिकेट खेलते हैं।' },
      negative: { en: 'They do not play cricket.', hi: 'वे क्रिकेट नहीं खेलते।' },
      interrogative: { en: 'Do they play cricket?', hi: 'क्या वे क्रिकेट खेलते हैं?' },
      whyQuestion: { en: 'Why do they play cricket?', hi: 'वे क्रिकेट क्यों खेलते हैं?' },
    },
    {
      id: 'sp-4', label: 'Work here',
      affirmative: { en: 'He works here.', hi: 'वह यहाँ काम करता है।' },
      negative: { en: 'He does not work here.', hi: 'वह यहाँ काम नहीं करता।' },
      interrogative: { en: 'Does he work here?', hi: 'क्या वह यहाँ काम करता है?' },
      whyQuestion: { en: 'Why does he work here?', hi: 'वह यहाँ क्यों काम करता है?' },
    },
  ],
};

const presentContinuous: TenseCategory = {
  id: 'present-continuous',
  title: 'Present Continuous',
  subtitle: 'Actions happening right now',
  group: 'present',
  pattern: 'Subject + am/is/are + V-ing',
  explanation: {
    when: 'Use for actions happening right now, temporary situations, or fixed future plans.',
    structure: 'Subject + am/is/are + verb-ing',
    hindi: 'अभी हो रही क्रिया, अस्थायी स्थिति या तय भविष्य की योजना के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'pc-1', label: 'Eat food',
      affirmative: { en: 'I am eating food.', hi: 'मैं खाना खा रहा हूँ।' },
      negative: { en: 'I am not eating food.', hi: 'मैं खाना नहीं खा रहा।' },
      interrogative: { en: 'Am I eating food?', hi: 'क्या मैं खाना खा रहा हूँ?' },
      whyQuestion: { en: 'Why am I eating food?', hi: 'मैं खाना क्यों खा रहा हूँ?' },
    },
    {
      id: 'pc-2', label: 'Read a book',
      affirmative: { en: 'She is reading a book.', hi: 'वह किताब पढ़ रही है।' },
      negative: { en: 'She is not reading a book.', hi: 'वह किताब नहीं पढ़ रही।' },
      interrogative: { en: 'Is she reading a book?', hi: 'क्या वह किताब पढ़ रही है?' },
      whyQuestion: { en: 'Why is she reading a book?', hi: 'वह किताब क्यों पढ़ रही है?' },
    },
    {
      id: 'pc-3', label: 'Play cricket',
      affirmative: { en: 'They are playing cricket.', hi: 'वे क्रिकेट खेल रहे हैं।' },
      negative: { en: 'They are not playing cricket.', hi: 'वे क्रिकेट नहीं खेल रहे।' },
      interrogative: { en: 'Are they playing cricket?', hi: 'क्या वे क्रिकेट खेल रहे हैं?' },
      whyQuestion: { en: 'Why are they playing cricket?', hi: 'वे क्रिकेट क्यों खेल रहे हैं?' },
    },
    {
      id: 'pc-4', label: 'Work here',
      affirmative: { en: 'He is working here.', hi: 'वह यहाँ काम कर रहा है।' },
      negative: { en: 'He is not working here.', hi: 'वह यहाँ काम नहीं कर रहा।' },
      interrogative: { en: 'Is he working here?', hi: 'क्या वह यहाँ काम कर रहा है?' },
      whyQuestion: { en: 'Why is he working here?', hi: 'वह यहाँ क्यों काम कर रहा है?' },
    },
  ],
};

const presentPerfect: TenseCategory = {
  id: 'present-perfect',
  title: 'Present Perfect',
  subtitle: 'Past action with present result',
  group: 'present',
  pattern: 'Subject + have/has + V3',
  explanation: {
    when: 'Use for actions completed at an unspecified time, with just/already/yet/ever/never, or with for/since.',
    structure: 'Subject + have/has + past participle (V3)',
    hindi: 'अनिश्चित समय में पूरी हुई क्रिया, या just/already/yet/ever/never के साथ इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'pp-1', label: 'Eat food',
      affirmative: { en: 'I have eaten food.', hi: 'मैंने खाना खा लिया है।' },
      negative: { en: 'I have not eaten food.', hi: 'मैंने खाना नहीं खाया।' },
      interrogative: { en: 'Have I eaten food?', hi: 'क्या मैंने खाना खाया?' },
      whyQuestion: { en: 'Why have I eaten food?', hi: 'मैंने खाना क्यों खाया?' },
    },
    {
      id: 'pp-2', label: 'Read the book',
      affirmative: { en: 'She has read the book.', hi: 'उसने किताब पढ़ ली है।' },
      negative: { en: 'She has not read the book.', hi: 'उसने किताब नहीं पढ़ी।' },
      interrogative: { en: 'Has she read the book?', hi: 'क्या उसने किताब पढ़ी?' },
      whyQuestion: { en: 'Why has she read the book?', hi: 'उसने किताब क्यों पढ़ी?' },
    },
    {
      id: 'pp-3', label: 'Play cricket',
      affirmative: { en: 'They have played cricket.', hi: 'उन्होंने क्रिकेट खेला है।' },
      negative: { en: 'They have not played cricket.', hi: 'उन्होंने क्रिकेट नहीं खेला।' },
      interrogative: { en: 'Have they played cricket?', hi: 'क्या उन्होंने क्रिकेट खेला?' },
      whyQuestion: { en: 'Why have they played cricket?', hi: 'उन्होंने क्रिकेट क्यों खेला?' },
    },
    {
      id: 'pp-4', label: 'Work here',
      affirmative: { en: 'He has worked here.', hi: 'उसने यहाँ काम किया है।' },
      negative: { en: 'He has not worked here.', hi: 'उसने यहाँ काम नहीं किया।' },
      interrogative: { en: 'Has he worked here?', hi: 'क्या उसने यहाँ काम किया?' },
      whyQuestion: { en: 'Why has he worked here?', hi: 'उसने यहाँ क्यों काम किया?' },
    },
  ],
};

const presentPerfectContinuous: TenseCategory = {
  id: 'present-perfect-continuous',
  title: 'Present Perfect Continuous',
  subtitle: 'Ongoing action from past to now',
  group: 'present',
  pattern: 'Subject + have/has + been + V-ing',
  explanation: {
    when: 'Use for actions that started in the past and are still continuing now. Often with for/since.',
    structure: 'Subject + have/has + been + verb-ing',
    hindi: 'जो क्रिया अतीत में शुरू हुई और अभी भी चल रही है, उसके लिए for/since के साथ इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'ppc-1', label: 'Eat food',
      affirmative: { en: 'I have been eating food.', hi: 'मैं खाना खाता रहा हूँ।' },
      negative: { en: 'I have not been eating food.', hi: 'मैं खाना नहीं खाता रहा।' },
      interrogative: { en: 'Have I been eating food?', hi: 'क्या मैं खाना खाता रहा हूँ?' },
      whyQuestion: { en: 'Why have I been eating food?', hi: 'मैं खाना क्यों खाता रहा हूँ?' },
    },
    {
      id: 'ppc-2', label: 'Read a book',
      affirmative: { en: 'She has been reading a book.', hi: 'वह किताब पढ़ती रही है।' },
      negative: { en: 'She has not been reading a book.', hi: 'वह किताब नहीं पढ़ती रही।' },
      interrogative: { en: 'Has she been reading a book?', hi: 'क्या वह किताब पढ़ती रही है?' },
      whyQuestion: { en: 'Why has she been reading a book?', hi: 'वह किताब क्यों पढ़ती रही है?' },
    },
    {
      id: 'ppc-3', label: 'Play cricket',
      affirmative: { en: 'They have been playing cricket.', hi: 'वे क्रिकेट खेलते रहे हैं।' },
      negative: { en: 'They have not been playing cricket.', hi: 'वे क्रिकेट नहीं खेलते रहे।' },
      interrogative: { en: 'Have they been playing cricket?', hi: 'क्या वे क्रिकेट खेलते रहे हैं?' },
      whyQuestion: { en: 'Why have they been playing cricket?', hi: 'वे क्रिकेट क्यों खेलते रहे हैं?' },
    },
    {
      id: 'ppc-4', label: 'Work here',
      affirmative: { en: 'He has been working here.', hi: 'वह यहाँ काम करता रहा है।' },
      negative: { en: 'He has not been working here.', hi: 'वह यहाँ काम नहीं करता रहा।' },
      interrogative: { en: 'Has he been working here?', hi: 'क्या वह यहाँ काम करता रहा है?' },
      whyQuestion: { en: 'Why has he been working here?', hi: 'वह यहाँ क्यों काम करता रहा है?' },
    },
  ],
};

// ─────────────────────────────────────────────
// PAST TENSES
// ─────────────────────────────────────────────

const simplePast: TenseCategory = {
  id: 'simple-past',
  title: 'Simple Past',
  subtitle: 'Completed actions in the past',
  group: 'past',
  pattern: 'Subject + V2',
  explanation: {
    when: 'Use for actions that started and finished at a specific time in the past.',
    structure: 'Subject + past form of verb (V2)',
    hindi: 'अतीत में शुरू होकर पूरी हो चुकी क्रिया के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'spt-1', label: 'Eat food',
      affirmative: { en: 'I ate food.', hi: 'मैंने खाना खाया।' },
      negative: { en: 'I did not eat food.', hi: 'मैंने खाना नहीं खाया।' },
      interrogative: { en: 'Did I eat food?', hi: 'क्या मैंने खाना खाया?' },
      whyQuestion: { en: 'Why did I eat food?', hi: 'मैंने खाना क्यों खाया?' },
    },
    {
      id: 'spt-2', label: 'Read a book',
      affirmative: { en: 'She read a book.', hi: 'उसने किताब पढ़ी।' },
      negative: { en: 'She did not read a book.', hi: 'उसने किताब नहीं पढ़ी।' },
      interrogative: { en: 'Did she read a book?', hi: 'क्या उसने किताब पढ़ी?' },
      whyQuestion: { en: 'Why did she read a book?', hi: 'उसने किताब क्यों पढ़ी?' },
    },
    {
      id: 'spt-3', label: 'Play cricket',
      affirmative: { en: 'They played cricket.', hi: 'उन्होंने क्रिकेट खेला।' },
      negative: { en: 'They did not play cricket.', hi: 'उन्होंने क्रिकेट नहीं खेला।' },
      interrogative: { en: 'Did they play cricket?', hi: 'क्या उन्होंने क्रिकेट खेला?' },
      whyQuestion: { en: 'Why did they play cricket?', hi: 'उन्होंने क्रिकेट क्यों खेला?' },
    },
    {
      id: 'spt-4', label: 'Work here',
      affirmative: { en: 'He worked here.', hi: 'उसने यहाँ काम किया।' },
      negative: { en: 'He did not work here.', hi: 'उसने यहाँ काम नहीं किया।' },
      interrogative: { en: 'Did he work here?', hi: 'क्या उसने यहाँ काम किया?' },
      whyQuestion: { en: 'Why did he work here?', hi: 'उसने यहाँ क्यों काम किया?' },
    },
  ],
};

const pastContinuous: TenseCategory = {
  id: 'past-continuous',
  title: 'Past Continuous',
  subtitle: 'Ongoing action in the past',
  group: 'past',
  pattern: 'Subject + was/were + V-ing',
  explanation: {
    when: 'Use for actions that were in progress at a specific past time, or when another action interrupted.',
    structure: 'Subject + was/were + verb-ing',
    hindi: 'अतीत में किसी विशेष समय पर चल रही क्रिया, या जब कोई दूसरी क्रिया ने बाधित किया।',
  },
  examples: [
    {
      id: 'pcst-1', label: 'Eat food',
      affirmative: { en: 'I was eating food.', hi: 'मैं खाना खा रहा था।' },
      negative: { en: 'I was not eating food.', hi: 'मैं खाना नहीं खा रहा था।' },
      interrogative: { en: 'Was I eating food?', hi: 'क्या मैं खाना खा रहा था?' },
      whyQuestion: { en: 'Why was I eating food?', hi: 'मैं खाना क्यों खा रहा था?' },
    },
    {
      id: 'pcst-2', label: 'Read a book',
      affirmative: { en: 'She was reading a book.', hi: 'वह किताब पढ़ रही थी।' },
      negative: { en: 'She was not reading a book.', hi: 'वह किताब नहीं पढ़ रही थी।' },
      interrogative: { en: 'Was she reading a book?', hi: 'क्या वह किताब पढ़ रही थी?' },
      whyQuestion: { en: 'Why was she reading a book?', hi: 'वह किताब क्यों पढ़ रही थी?' },
    },
    {
      id: 'pcst-3', label: 'Play cricket',
      affirmative: { en: 'They were playing cricket.', hi: 'वे क्रिकेट खेल रहे थे।' },
      negative: { en: 'They were not playing cricket.', hi: 'वे क्रिकेट नहीं खेल रहे थे।' },
      interrogative: { en: 'Were they playing cricket?', hi: 'क्या वे क्रिकेट खेल रहे थे?' },
      whyQuestion: { en: 'Why were they playing cricket?', hi: 'वे क्रिकेट क्यों खेल रहे थे?' },
    },
    {
      id: 'pcst-4', label: 'Work here',
      affirmative: { en: 'He was working here.', hi: 'वह यहाँ काम कर रहा था।' },
      negative: { en: 'He was not working here.', hi: 'वह यहाँ काम नहीं कर रहा था।' },
      interrogative: { en: 'Was he working here?', hi: 'क्या वह यहाँ काम कर रहा था?' },
      whyQuestion: { en: 'Why was he working here?', hi: 'वह यहाँ क्यों काम कर रहा था?' },
    },
  ],
};

const pastPerfect: TenseCategory = {
  id: 'past-perfect',
  title: 'Past Perfect',
  subtitle: 'Action before another past action',
  group: 'past',
  pattern: 'Subject + had + V3',
  explanation: {
    when: 'Use to show which of two past actions happened first. Often with before/after/when.',
    structure: 'Subject + had + past participle (V3)',
    hindi: 'दो अतीत की क्रियाओं में से पहले कौन सी हुई, यह दिखाने के लिए before/after/when के साथ इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'ppst-1', label: 'Eat food',
      affirmative: { en: 'I had eaten food.', hi: 'मैंने खाना खा लिया था।' },
      negative: { en: 'I had not eaten food.', hi: 'मैंने खाना नहीं खाया था।' },
      interrogative: { en: 'Had I eaten food?', hi: 'क्या मैंने खाना खा लिया था?' },
      whyQuestion: { en: 'Why had I eaten food?', hi: 'मैंने खाना क्यों खा लिया था?' },
    },
    {
      id: 'ppst-2', label: 'Read the book',
      affirmative: { en: 'She had read the book.', hi: 'उसने किताब पढ़ ली थी।' },
      negative: { en: 'She had not read the book.', hi: 'उसने किताब नहीं पढ़ी थी।' },
      interrogative: { en: 'Had she read the book?', hi: 'क्या उसने किताब पढ़ ली थी?' },
      whyQuestion: { en: 'Why had she read the book?', hi: 'उसने किताब क्यों पढ़ ली थी?' },
    },
    {
      id: 'ppst-3', label: 'Play cricket',
      affirmative: { en: 'They had played cricket.', hi: 'उन्होंने क्रिकेट खेला था।' },
      negative: { en: 'They had not played cricket.', hi: 'उन्होंने क्रिकेट नहीं खेला था।' },
      interrogative: { en: 'Had they played cricket?', hi: 'क्या उन्होंने क्रिकेट खेला था?' },
      whyQuestion: { en: 'Why had they played cricket?', hi: 'उन्होंने क्रिकेट क्यों खेला था?' },
    },
    {
      id: 'ppst-4', label: 'Work here',
      affirmative: { en: 'He had worked here.', hi: 'उसने यहाँ काम किया था।' },
      negative: { en: 'He had not worked here.', hi: 'उसने यहाँ काम नहीं किया था।' },
      interrogative: { en: 'Had he worked here?', hi: 'क्या उसने यहाँ काम किया था?' },
      whyQuestion: { en: 'Why had he worked here?', hi: 'उसने यहाँ क्यों काम किया था?' },
    },
  ],
};

const pastPerfectContinuous: TenseCategory = {
  id: 'past-perfect-continuous',
  title: 'Past Perfect Continuous',
  subtitle: 'Ongoing action before another past event',
  group: 'past',
  pattern: 'Subject + had + been + V-ing',
  explanation: {
    when: 'Use to show duration of an ongoing action before something else happened in the past.',
    structure: 'Subject + had + been + verb-ing',
    hindi: 'किसी घटना से पहले तक चली आ रही क्रिया की अवधि दिखाने के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'ppcst-1', label: 'Eat food',
      affirmative: { en: 'I had been eating food.', hi: 'मैं खाना खाता रहा था।' },
      negative: { en: 'I had not been eating food.', hi: 'मैं खाना नहीं खाता रहा था।' },
      interrogative: { en: 'Had I been eating food?', hi: 'क्या मैं खाना खाता रहा था?' },
      whyQuestion: { en: 'Why had I been eating food?', hi: 'मैं खाना क्यों खाता रहा था?' },
    },
    {
      id: 'ppcst-2', label: 'Read a book',
      affirmative: { en: 'She had been reading a book.', hi: 'वह किताब पढ़ती रही थी।' },
      negative: { en: 'She had not been reading a book.', hi: 'वह किताब नहीं पढ़ती रही थी।' },
      interrogative: { en: 'Had she been reading a book?', hi: 'क्या वह किताब पढ़ती रही थी?' },
      whyQuestion: { en: 'Why had she been reading a book?', hi: 'वह किताब क्यों पढ़ती रही थी?' },
    },
    {
      id: 'ppcst-3', label: 'Play cricket',
      affirmative: { en: 'They had been playing cricket.', hi: 'वे क्रिकेट खेलते रहे थे।' },
      negative: { en: 'They had not been playing cricket.', hi: 'वे क्रिकेट नहीं खेलते रहे थे।' },
      interrogative: { en: 'Had they been playing cricket?', hi: 'क्या वे क्रिकेट खेलते रहे थे?' },
      whyQuestion: { en: 'Why had they been playing cricket?', hi: 'वे क्रिकेट क्यों खेलते रहे थे?' },
    },
    {
      id: 'ppcst-4', label: 'Work here',
      affirmative: { en: 'He had been working here.', hi: 'वह यहाँ काम करता रहा था।' },
      negative: { en: 'He had not been working here.', hi: 'वह यहाँ काम नहीं करता रहा था।' },
      interrogative: { en: 'Had he been working here?', hi: 'क्या वह यहाँ काम करता रहा था?' },
      whyQuestion: { en: 'Why had he been working here?', hi: 'वह यहाँ क्यों काम करता रहा था?' },
    },
  ],
};

// ─────────────────────────────────────────────
// FUTURE TENSES
// ─────────────────────────────────────────────

const simpleFuture: TenseCategory = {
  id: 'simple-future',
  title: 'Simple Future',
  subtitle: 'Actions that will happen later',
  group: 'future',
  pattern: 'Subject + will + V1',
  explanation: {
    when: 'Use for predictions, promises, spontaneous decisions, and things that will happen in the future.',
    structure: 'Subject + will + base form of verb (V1)',
    hindi: 'भविष्य में होने वाली क्रिया, भविष्यवाणी, वादे या अचानक फ़ैसले के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'sf-1', label: 'Eat food',
      affirmative: { en: 'I will eat food.', hi: 'मैं खाना खाऊँगा।' },
      negative: { en: 'I will not eat food.', hi: 'मैं खाना नहीं खाऊँगा।' },
      interrogative: { en: 'Will I eat food?', hi: 'क्या मैं खाना खाऊँगा?' },
      whyQuestion: { en: 'Why will I eat food?', hi: 'मैं खाना क्यों खाऊँगा?' },
    },
    {
      id: 'sf-2', label: 'Read a book',
      affirmative: { en: 'She will read a book.', hi: 'वह किताब पढ़ेगी।' },
      negative: { en: 'She will not read a book.', hi: 'वह किताब नहीं पढ़ेगी।' },
      interrogative: { en: 'Will she read a book?', hi: 'क्या वह किताब पढ़ेगी?' },
      whyQuestion: { en: 'Why will she read a book?', hi: 'वह किताब क्यों पढ़ेगी?' },
    },
    {
      id: 'sf-3', label: 'Play cricket',
      affirmative: { en: 'They will play cricket.', hi: 'वे क्रिकेट खेलेंगे।' },
      negative: { en: 'They will not play cricket.', hi: 'वे क्रिकेट नहीं खेलेंगे।' },
      interrogative: { en: 'Will they play cricket?', hi: 'क्या वे क्रिकेट खेलेंगे?' },
      whyQuestion: { en: 'Why will they play cricket?', hi: 'वे क्रिकेट क्यों खेलेंगे?' },
    },
    {
      id: 'sf-4', label: 'Work here',
      affirmative: { en: 'He will work here.', hi: 'वह यहाँ काम करेगा।' },
      negative: { en: 'He will not work here.', hi: 'वह यहाँ काम नहीं करेगा।' },
      interrogative: { en: 'Will he work here?', hi: 'क्या वह यहाँ काम करेगा?' },
      whyQuestion: { en: 'Why will he work here?', hi: 'वह यहाँ क्यों काम करेगा?' },
    },
  ],
};

const futureContinuous: TenseCategory = {
  id: 'future-continuous',
  title: 'Future Continuous',
  subtitle: 'Actions in progress at a future time',
  group: 'future',
  pattern: 'Subject + will + be + V-ing',
  explanation: {
    when: 'Use for actions that will be in progress at a specific future time.',
    structure: 'Subject + will + be + verb-ing',
    hindi: 'भविष्य में किसी विशेष समय पर चल रही क्रिया के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'fc-1', label: 'Eat food',
      affirmative: { en: 'I will be eating food.', hi: 'मैं खाना खा रहा होऊँगा।' },
      negative: { en: 'I will not be eating food.', hi: 'मैं खाना नहीं खा रहा होऊँगा।' },
      interrogative: { en: 'Will I be eating food?', hi: 'क्या मैं खाना खा रहा होऊँगा?' },
      whyQuestion: { en: 'Why will I be eating food?', hi: 'मैं खाना क्यों खा रहा होऊँगा?' },
    },
    {
      id: 'fc-2', label: 'Read a book',
      affirmative: { en: 'She will be reading a book.', hi: 'वह किताब पढ़ रही होगी।' },
      negative: { en: 'She will not be reading a book.', hi: 'वह किताब नहीं पढ़ रही होगी।' },
      interrogative: { en: 'Will she be reading a book?', hi: 'क्या वह किताब पढ़ रही होगी?' },
      whyQuestion: { en: 'Why will she be reading a book?', hi: 'वह किताब क्यों पढ़ रही होगी?' },
    },
    {
      id: 'fc-3', label: 'Play cricket',
      affirmative: { en: 'They will be playing cricket.', hi: 'वे क्रिकेट खेल रहे होंगे।' },
      negative: { en: 'They will not be playing cricket.', hi: 'वे क्रिकेट नहीं खेल रहे होंगे।' },
      interrogative: { en: 'Will they be playing cricket?', hi: 'क्या वे क्रिकेट खेल रहे होंगे?' },
      whyQuestion: { en: 'Why will they be playing cricket?', hi: 'वे क्रिकेट क्यों खेल रहे होंगे?' },
    },
    {
      id: 'fc-4', label: 'Work here',
      affirmative: { en: 'He will be working here.', hi: 'वह यहाँ काम कर रहा होगा।' },
      negative: { en: 'He will not be working here.', hi: 'वह यहाँ काम नहीं कर रहा होगा।' },
      interrogative: { en: 'Will he be working here?', hi: 'क्या वह यहाँ काम कर रहा होगा?' },
      whyQuestion: { en: 'Why will he be working here?', hi: 'वह यहाँ क्यों काम कर रहा होगा?' },
    },
  ],
};

const futurePerfect: TenseCategory = {
  id: 'future-perfect',
  title: 'Future Perfect',
  subtitle: 'Action completed before a future time',
  group: 'future',
  pattern: 'Subject + will + have + V3',
  explanation: {
    when: 'Use for actions that will be completed BEFORE a specific future time. Often with by/before.',
    structure: 'Subject + will + have + past participle (V3)',
    hindi: 'भविष्य में किसी विशेष समय से पहले पूरी हो जाने वाली क्रिया के लिए by/before के साथ इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'fpf-1', label: 'Eat food',
      affirmative: { en: 'I will have eaten food.', hi: 'मैं खाना खा चुका होऊँगा।' },
      negative: { en: 'I will not have eaten food.', hi: 'मैं खाना नहीं खाया होऊँगा।' },
      interrogative: { en: 'Will I have eaten food?', hi: 'क्या मैं खाना खा चुका होऊँगा?' },
      whyQuestion: { en: 'Why will I have eaten food?', hi: 'मैं खाना क्यों खा चुका होऊँगा?' },
    },
    {
      id: 'fpf-2', label: 'Read the book',
      affirmative: { en: 'She will have read the book.', hi: 'वह किताब पढ़ चुकी होगी।' },
      negative: { en: 'She will not have read the book.', hi: 'वह किताब नहीं पढ़ी होगी।' },
      interrogative: { en: 'Will she have read the book?', hi: 'क्या वह किताब पढ़ चुकी होगी?' },
      whyQuestion: { en: 'Why will she have read the book?', hi: 'वह किताब क्यों पढ़ चुकी होगी?' },
    },
    {
      id: 'fpf-3', label: 'Play cricket',
      affirmative: { en: 'They will have played cricket.', hi: 'वे क्रिकेट खेल चुके होंगे।' },
      negative: { en: 'They will not have played cricket.', hi: 'वे क्रिकेट नहीं खेले होंगे।' },
      interrogative: { en: 'Will they have played cricket?', hi: 'क्या वे क्रिकेट खेल चुके होंगे?' },
      whyQuestion: { en: 'Why will they have played cricket?', hi: 'वे क्रिकेट क्यों खेल चुके होंगे?' },
    },
    {
      id: 'fpf-4', label: 'Work here',
      affirmative: { en: 'He will have worked here.', hi: 'वह यहाँ काम कर चुका होगा।' },
      negative: { en: 'He will not have worked here.', hi: 'वह यहाँ काम नहीं किया होगा।' },
      interrogative: { en: 'Will he have worked here?', hi: 'क्या वह यहाँ काम कर चुका होगा?' },
      whyQuestion: { en: 'Why will he have worked here?', hi: 'वह यहाँ क्यों काम कर चुका होगा?' },
    },
  ],
};

const futurePerfectContinuous: TenseCategory = {
  id: 'future-perfect-continuous',
  title: 'Future Perfect Continuous',
  subtitle: 'Duration before a future time',
  group: 'future',
  pattern: 'Subject + will + have + been + V-ing',
  explanation: {
    when: 'Use to emphasise the duration of an ongoing action up to a point in the future.',
    structure: 'Subject + will + have + been + verb-ing',
    hindi: 'भविष्य में किसी बिंदु तक क्रिया की अवधि पर ज़ोर देने के लिए इस्तेमाल होता है।',
  },
  examples: [
    {
      id: 'fpcf-1', label: 'Eat food',
      affirmative: { en: 'I will have been eating food.', hi: 'मैं खाना खाता रहा होऊँगा।' },
      negative: { en: 'I will not have been eating food.', hi: 'मैं खाना नहीं खाता रहा होऊँगा।' },
      interrogative: { en: 'Will I have been eating food?', hi: 'क्या मैं खाना खाता रहा होऊँगा?' },
      whyQuestion: { en: 'Why will I have been eating food?', hi: 'मैं खाना क्यों खाता रहा होऊँगा?' },
    },
    {
      id: 'fpcf-2', label: 'Read a book',
      affirmative: { en: 'She will have been reading a book.', hi: 'वह किताब पढ़ती रही होगी।' },
      negative: { en: 'She will not have been reading a book.', hi: 'वह किताब नहीं पढ़ती रही होगी।' },
      interrogative: { en: 'Will she have been reading a book?', hi: 'क्या वह किताब पढ़ती रही होगी?' },
      whyQuestion: { en: 'Why will she have been reading a book?', hi: 'वह किताब क्यों पढ़ती रही होगी?' },
    },
    {
      id: 'fpcf-3', label: 'Play cricket',
      affirmative: { en: 'They will have been playing cricket.', hi: 'वे क्रिकेट खेलते रहे होंगे।' },
      negative: { en: 'They will not have been playing cricket.', hi: 'वे क्रिकेट नहीं खेलते रहे होंगे।' },
      interrogative: { en: 'Will they have been playing cricket?', hi: 'क्या वे क्रिकेट खेलते रहे होंगे?' },
      whyQuestion: { en: 'Why will they have been playing cricket?', hi: 'वे क्रिकेट क्यों खेलते रहे होंगे?' },
    },
    {
      id: 'fpcf-4', label: 'Work here',
      affirmative: { en: 'He will have been working here.', hi: 'वह यहाँ काम करता रहा होगा।' },
      negative: { en: 'He will not have been working here.', hi: 'वह यहाँ काम नहीं करता रहा होगा।' },
      interrogative: { en: 'Will he have been working here?', hi: 'क्या वह यहाँ काम करता रहा होगा?' },
      whyQuestion: { en: 'Why will he have been working here?', hi: 'वह यहाँ क्यों काम करता रहा होगा?' },
    },
  ],
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export const allTenses: TenseCategory[] = [
  simplePresent,
  presentContinuous,
  presentPerfect,
  presentPerfectContinuous,
  simplePast,
  pastContinuous,
  pastPerfect,
  pastPerfectContinuous,
  simpleFuture,
  futureContinuous,
  futurePerfect,
  futurePerfectContinuous,
];

export const tensesMeta = {
  title: 'Tenses',
  description: 'Master all 12 English tenses with structured examples. Learn affirmative, negative, interrogative and why question forms.',
  totalLessons: 12,
  totalExamples: 48,
  totalForms: 192,
};
