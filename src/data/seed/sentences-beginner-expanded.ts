/**
 * Beginner English — 300 sentences across 20 lessons.
 * Organized into 4 levels:
 *   Level 1: Start from Zero (Lessons 1-7)
 *   Level 2: Daily Conversation (Lessons 8-13)
 *   Level 3: Speaking Confidence (Lessons 14-17)
 *   Level 4: Real-Life Communication (Lessons 18-20)
 *
 * Each row: [english, hindi, difficulty, isFree?]
 */
import type { SentenceRow } from '@/types';

// ─── LEVEL 1: START FROM ZERO ───

// Lesson 1: Greetings
const greetings: SentenceRow[] = [
  ['Good morning, how are you?', 'सुप्रभात, आप कैसे हैं?', 'easy', true],
  ['I am doing well, thank you.', 'मैं ठीक हूँ, शुक्रिया।', 'easy', true],
  ['How was your day?', 'आपका दिन कैसा था?', 'easy', true],
  ['It was a good day, thank you for asking.', 'अच्छा दिन था, पूछने के लिए शुक्रिया।', 'easy', true],
  ['Good evening, nice to see you.', 'शुभ संध्या, आपको देखकर अच्छा लगा।', 'easy', true],
  ['How have you been?', 'आप कैसे हैं? (पिछले कुछ समय से)', 'easy', true],
  ['I have been busy lately.', 'मैं पिछले कुछ समय से बहुत व्यस्त हूँ।', 'easy', true],
  ['It was nice meeting you.', 'आपसे मिलकर अच्छा लगा।', 'easy', true],
  ['See you later, take care.', 'फिर मिलते हैं, अपना ख्याल रखिए।', 'easy', true],
  ['Have a great day ahead.', 'आगे का दिन बहुत अच्छा हो।', 'easy', true],
];

// Lesson 2: Introduction
const introduction: SentenceRow[] = [
  ['My name is Rahul.', 'मेरा नाम राहुल है।', 'easy', true],
  ['I am from Mumbai.', 'मैं मुंबई से हूँ।', 'easy', true],
  ['I work as a teacher.', 'मैं टीचर का काम करता हूँ।', 'easy', true],
  ['I am a student.', 'मैं एक छात्र हूँ।', 'easy', true],
  ['I am twenty-five years old.', 'मेरी उम्र पच्चीस साल है।', 'easy', true],
  ['I live in Delhi.', 'मैं दिल्ली में रहता हूँ।', 'easy', true],
  ['I am married.', 'मेरी शादी हो चुकी है।', 'easy', true],
  ['I have two children.', 'मेरे दो बच्चे हैं।', 'easy', true],
  ['I speak Hindi and English.', 'मैं हिंदी और अंग्रेज़ी बोलता हूँ।', 'easy', true],
  ['I am learning English.', 'मैं अंग्रेज़ी सीख रहा हूँ।', 'easy', true],
];

// Lesson 3: Family
const family: SentenceRow[] = [
  ['This is my family.', 'यह मेरा परिवार है।', 'easy'],
  ['My mother is a doctor.', 'मेरी माँ डॉक्टर हैं।', 'easy'],
  ['My father works in an office.', 'मेरे पिता ऑफिस में काम करते हैं।', 'easy'],
  ['I have one brother and one sister.', 'मेरा एक भाई और एक बहन है।', 'easy'],
  ['My brother is older than me.', 'मेरा भाई मुझसे बड़ा है।', 'easy'],
  ['My sister is studying in college.', 'मेरी बहन कॉलेज में पढ़ रही है।', 'easy'],
  ['We all live together.', 'हम सब साथ में रहते हैं।', 'easy'],
  ['My grandparents live in the village.', 'मेरे दादा-दादी गाँव में रहते हैं।', 'easy'],
  ['I love my family very much.', 'मैं अपने परिवार से बहुत प्यार करता हूँ।', 'easy'],
  ['We eat dinner together every evening.', 'हम हर शाम साथ में खाना खाते हैं।', 'easy'],
];

// Lesson 4: Home
const home: SentenceRow[] = [
  ['I live in a small apartment.', 'मैं एक छोटे अपार्टमेंट में रहता हूँ।', 'easy'],
  ['My house is near the market.', 'मेरा घर बाज़ार के पास है।', 'easy'],
  ['I have two bedrooms.', 'मेरे दो बेडरूम हैं।', 'easy'],
  ['The kitchen is very clean.', 'रसोई बहुत साफ है।', 'easy'],
  ['I need to buy some furniture.', 'मुझे कुछ फर्नीचर खरीदना है।', 'easy'],
  ['Where should I put this?', 'यह कहाँ रखूँ?', 'easy'],
  ['Please close the door.', 'कृपया दरवाज़ा बंद कर दीजिए।', 'easy'],
  ['Open the window, it is very hot.', 'खिड़की खोल दो, बहुत गर्मी है।', 'easy'],
  ['I am cleaning the house today.', 'मैं आज घर साफ कर रहा हूँ।', 'easy'],
  ['The electricity went off again.', 'बिजली फिर से चली गई।', 'easy'],
];

// Lesson 5: Basic Questions
const basicQuestions: SentenceRow[] = [
  ['What is your name?', 'आपका नाम क्या है?', 'easy'],
  ['Where are you from?', 'आप कहाँ से हैं?', 'easy'],
  ['What do you do?', 'आप क्या करते हैं?', 'easy'],
  ['How old are you?', 'आपकी उम्र कितनी है?', 'easy'],
  ['Where do you live?', 'आप कहाँ रहते हैं?', 'easy'],
  ['Do you have any children?', 'क्या आपके बच्चे हैं?', 'easy'],
  ['What time is it?', 'कितने बज रहे हैं?', 'easy'],
  ['Is there a hospital nearby?', 'क्या पास में अस्पताल है?', 'easy'],
  ['Which way is the market?', 'बाज़ार किस तरफ है?', 'easy'],
  ['Can you show me the way?', 'क्या आप मुझे रास्ता दिखा सकते हैं?', 'easy'],
];

// Lesson 6: Numbers and Time
const numbersTime: SentenceRow[] = [
  ['I have three books.', 'मेरे पास तीन किताबें हैं।', 'easy'],
  ['There are five people here.', 'यहाँ पाँच लोग हैं।', 'easy'],
  ['I need ten minutes.', 'मुझे दस मिनट चाहिए।', 'easy'],
  ['The meeting is at two o\'clock.', 'मीटिंग दो बजे है।', 'easy'],
  ['I wake up at six in the morning.', 'मैं सुबह छह बजे उठता हूँ।', 'easy'],
  ['I go to bed at eleven at night.', 'मैं रात को ग्यारह बजे सोता हूँ।', 'easy'],
  ['The bus comes every thirty minutes.', 'बस हर तीस मिनट में आती है।', 'easy'],
  ['I have been waiting for one hour.', 'मैं एक घंटे से इंतज़ार कर रहा हूँ।', 'easy'],
  ['Today is Monday.', 'आज सोमवार है।', 'easy'],
  ['I will meet you next week.', 'मैं अगले हफ्ते आपसे मिलूँगा।', 'easy'],
];

// Lesson 7: Daily Routine
const dailyRoutine: SentenceRow[] = [
  ['I wake up early every day.', 'मैं हर दिन जल्दी उठता हूँ।', 'easy'],
  ['I brush my teeth after waking up.', 'उठने के बाद मैं अपने दाँत साफ करता हूँ।', 'easy'],
  ['I have breakfast at eight.', 'मैं आठ बजे नाश्ता करता हूँ।', 'easy'],
  ['I leave for work at nine.', 'मैं नौ बजे काम पर निकलता हूँ।', 'easy'],
  ['I take the bus to office.', 'मैं बस से ऑफिस जाता हूँ।', 'easy'],
  ['I come home in the evening.', 'मैं शाम को घर आता हूँ।', 'easy'],
  ['I watch TV after dinner.', 'खाने के बाद मैं टीवी देखता हूँ।', 'easy'],
  ['I sleep at about eleven.', 'मैं करीब ग्यारह बजे सो जाता हूँ।', 'easy'],
  ['On weekends I rest.', 'वीकेंड पर मैं आराम करता हूँ।', 'easy'],
  ['I go for a walk in the morning.', 'मैं सुबह सैर पर जाता हूँ।', 'easy'],
];

// ─── LEVEL 2: DAILY CONVERSATION ───

// Lesson 8: Shopping
const shopping: SentenceRow[] = [
  ['How much does this cost?', 'इसकी कीमत कितनी है?', 'easy'],
  ['That is too expensive.', 'यह बहुत महंगा है।', 'easy'],
  ['Can you give me a discount?', 'क्या आप मुझे छूट दे सकते हैं?', 'medium'],
  ['I want to buy this shirt.', 'मैं यह शर्ट खरीदना चाहता हूँ।', 'easy'],
  ['Do you have this in a different size?', 'क्या यह अलग साइज़ में है?', 'medium'],
  ['Can I try this on?', 'क्या मैं यह पहन कर देख सकता हूँ?', 'medium'],
  ['Where is the billing counter?', 'बिलिंग काउंटर कहाँ है?', 'easy'],
  ['I will take this one.', 'मैं यह वाला ले लूँगा।', 'easy'],
  ['Do you accept card payment?', 'क्या आप कार्ड से भुगतान लेते हैं?', 'medium'],
  ['Can I get the receipt please?', 'क्या मुझे रसीद मिल सकती है?', 'medium'],
];

// Lesson 9: Food and Restaurant
const food: SentenceRow[] = [
  ['I would like to order please.', 'मैं ऑर्डर करना चाहूँगा।', 'easy'],
  ['What do you recommend?', 'आप क्या सुझाव देंगे?', 'medium'],
  ['I am vegetarian.', 'मैं शाकाहारी हूँ।', 'easy'],
  ['Can I have the menu please?', 'क्या मुझे मेनू मिल सकता है?', 'easy'],
  ['I would like a glass of water.', 'मुझे एक गिलास पानी चाहिए।', 'easy'],
  ['The food is very good.', 'खाना बहुत अच्छा है।', 'easy'],
  ['Can you pack this for takeaway?', 'क्या आप इसे पैक कर देंगे?', 'medium'],
  ['I am allergic to nuts.', 'मुझे नट्स से एलर्जी है।', 'medium'],
  ['How long will the food take?', 'खाना बनने में कितना समय लगेगा?', 'medium'],
  ['Can I have the bill please?', 'क्या मुझे बिल दे दीजिए?', 'easy'],
];

// Lesson 10: Travel and Transport
const travel: SentenceRow[] = [
  ['Where is the nearest bus stop?', 'नज़दीकी बस स्टॉप कहाँ है?', 'easy'],
  ['How much is the fare to the airport?', 'हवाई अड्डे तक किराया कितना है?', 'medium'],
  ['Please take me to this address.', 'कृपया मुझे इस पते पर ले चलिए।', 'easy'],
  ['Can you drive a little faster?', 'क्या आप थोड़ा तेज़ चला सकते हैं?', 'medium'],
  ['Stop here please.', 'कृपया यहाँ रोक दीजिए।', 'easy'],
  ['I need a taxi.', 'मुझे एक टैक्सी चाहिए।', 'easy'],
  ['Which platform does the train leave from?', 'ट्रेन किस प्लेटफॉर्म से जाती है?', 'medium'],
  ['Is this the right bus for the station?', 'क्या यह स्टेशन जाने वाली सही बस है?', 'medium'],
  ['I have a flight tomorrow morning.', 'मेरी कल सुबह फ्लाइट है।', 'easy'],
  ['How far is it from here?', 'यहाँ से कितनी दूर है?', 'easy'],
];

// Lesson 11: Phone Calls
const phoneCalls: SentenceRow[] = [
  ['Hello, may I speak to Rahul?', 'नमस्ते, क्या मैं राहुल से बात कर सकता हूँ?', 'medium'],
  ['Sorry, he is not available right now.', 'माफ़ कीजिए, वह अभी उपलब्ध नहीं हैं।', 'medium'],
  ['Can you ask him to call me back?', 'क्या आप उनसे मुझे वापस कॉल करने को कह सकते हैं?', 'medium'],
  ['I will call you again later.', 'मैं बाद में फिर से कॉल करूँगा।', 'easy'],
  ['Please give me your phone number.', 'कृपया अपना फ़ोन नंबर दे दीजिए।', 'easy'],
  ['My phone is not working properly.', 'मेरा फ़ोन ठीक से काम नहीं कर रहा।', 'medium'],
  ['Can you hear me clearly?', 'क्या आप मुझे साफ सुन रहे हैं?', 'medium'],
  ['I will send you a message.', 'मैं आपको मैसेज भेजूँगा।', 'easy'],
  ['Sorry, the network is bad here.', 'माफ़ कीजिए, यहाँ नेटवर्क ख़राब है।', 'medium'],
  ['Let me call you from another number.', 'मुझे दूसरे नंबर से कॉल करने दीजिए।', 'medium'],
];

// Lesson 12: Friends and Social
const friendsSocial: SentenceRow[] = [
  ['What are you doing this weekend?', 'आप इस वीकेंड क्या कर रहे हैं?', 'medium'],
  ['Let us go out for dinner tonight.', 'आज रात खाने के लिए बाहर चलते हैं।', 'medium'],
  ['I will be free after six.', 'मैं छह बजे के बाद फ्री हूँ।', 'easy'],
  ['Where should we meet?', 'हम कहाँ मिलें?', 'easy'],
  ['That sounds like a great idea.', 'यह बहुत अच्छा विचार लगता है।', 'medium'],
  ['I had a great time today.', 'आज बहुत अच्छा समय बीता।', 'medium'],
  ['Thank you for inviting me.', 'मुझे बुलाने के लिए शुक्रिया।', 'medium'],
  ['We should do this more often.', 'हमें ऐसा और करना चाहिए।', 'medium'],
  ['It was nice spending time with you.', 'आपके साथ समय बिताकर अच्छा लगा।', 'medium'],
  ['See you next time!', 'फिर मिलते हैं!', 'easy'],
];

// Lesson 13: Requests and Problems
const requestsProblems: SentenceRow[] = [
  ['Could you please help me?', 'क्या आप कृपया मेरी मदद कर सकते हैं?', 'medium'],
  ['I have a problem with my order.', 'मेरे ऑर्डर में एक समस्या है।', 'medium'],
  ['This is not what I ordered.', 'यह वह नहीं है जो मैंने ऑर्डर किया था।', 'medium'],
  ['Can you fix this for me?', 'क्या आप यह मेरे लिए ठीक कर सकते हैं?', 'medium'],
  ['I need to return this item.', 'मुझे यह वापस करना है।', 'medium'],
  ['When will this be ready?', 'यह कब तक तैयार हो जाएगा?', 'medium'],
  ['I am not satisfied with this.', 'मैं इससे संतुष्ट नहीं हूँ।', 'medium'],
  ['Can you please speak slowly?', 'क्या आप धीरे-धीरे बोल सकते हैं?', 'medium'],
  ['I need to complain about something.', 'मुझे किसी चीज़ की शिकायत करनी है।', 'medium'],
  ['Please give me a moment.', 'कृपया मुझे एक पल दीजिए।', 'easy'],
];

// ─── LEVEL 3: SPEAKING CONFIDENCE ───

// Lesson 14: Opinions and Feelings
const opinions: SentenceRow[] = [
  ['I think this is a good idea.', 'मुझे लगता है यह एक अच्छा विचार है।', 'medium'],
  ['I agree with you.', 'मैं आपसे सहमत हूँ।', 'medium'],
  ['I am not sure about this.', 'मुझे इसके बारे में यकीन नहीं है।', 'medium'],
  ['In my opinion, we should wait.', 'मेरे विचार में, हमें इंतज़ार करना चाहिए।', 'medium'],
  ['I feel very happy today.', 'आज मैं बहुत खुश हूँ।', 'easy'],
  ['I am worried about the exam.', 'मैं परीक्षा को लेकर चिंतित हूँ।', 'medium'],
  ['That makes sense to me.', 'मुझे यह समझ आ रहा है।', 'medium'],
  ['I do not think that is right.', 'मुझे नहीं लगता कि यह सही है।', 'medium'],
  ['I am looking forward to it.', 'मैं इसका इंतज़ार कर रहा हूँ।', 'medium'],
  ['I really enjoyed the movie.', 'मुझे फिल्म बहुत पसंद आई।', 'medium'],
];

// Lesson 15: Plans and Future
const plans: SentenceRow[] = [
  ['I am planning to travel next month.', 'मैं अगले महीने यात्रा की योजना बना रहा हूँ।', 'medium'],
  ['I will start my new job on Monday.', 'मैं सोमवार से नई नौकरी शुरू करूँगा।', 'medium'],
  ['We are thinking of buying a car.', 'हम कार खरीदने के बारे में सोच रहे हैं।', 'medium'],
  ['I want to learn driving.', 'मैं ड्राइविंग सीखना चाहता हूँ।', 'medium'],
  ['I hope everything goes well.', 'मुझे उम्मीद है सब अच्छा होगा।', 'medium'],
  ['Let me think about it.', 'मुझे इसके बारे में सोचने दीजिए।', 'medium'],
  ['I will let you know by tomorrow.', 'मैं कल तक आपको बता दूँगा।', 'medium'],
  ['We should meet again soon.', 'हमें जल्दी फिर मिलना चाहिए।', 'medium'],
  ['I need to make a plan for this.', 'मुझे इसके लिए एक योजना बनानी है।', 'medium'],
  ['I will try my best.', 'मैं अपनी पूरी कोशिश करूँगा।', 'medium'],
];

// Lesson 16: Explaining Problems
const explainingProblems: SentenceRow[] = [
  ['I am not feeling well today.', 'मैं आज ठीक महसूस नहीं कर रहा।', 'easy'],
  ['I have a headache.', 'मेरे सिर में दर्द है।', 'easy'],
  ['I need to see a doctor.', 'मुझे डॉक्टर से मिलना है।', 'easy'],
  ['There is a problem with my account.', 'मेरे खाते में एक समस्या है।', 'medium'],
  ['I cannot access my email.', 'मैं अपना ईमेल खोल नहीं पा रहा।', 'medium'],
  ['The water is not coming.', 'पानी नहीं आ रहा है।', 'easy'],
  ['My bike is not starting.', 'मेरी बाइक स्टार्ट नहीं हो रही।', 'easy'],
  ['I am having trouble sleeping.', 'मुझे सोने में परेशानी हो रही है।', 'medium'],
  ['The light is not working.', 'लाइट काम नहीं कर रही।', 'easy'],
  ['I need to take a day off.', 'मुझे एक दिन की छुट्टी लेनी है।', 'medium'],
];

// Lesson 17: Asking and Giving Information
const askingInfo: SentenceRow[] = [
  ['Could you tell me where the hospital is?', 'क्या आप बता सकते हैं अस्पताल कहाँ है?', 'medium'],
  ['What is the best way to get there?', 'वहाँ जाने का सबसे अच्छा तरीका क्या है?', 'medium'],
  ['How long does it take to reach there?', 'वहाँ पहुँचने में कितना समय लगता है?', 'medium'],
  ['Is there a pharmacy near here?', 'क्या यहाँ पास में कोई फार्मेसी है?', 'medium'],
  ['Can you recommend a good restaurant?', 'क्या आप एक अच्छा रेस्तरां सुझा सकते हैं?', 'medium'],
  ['What documents do I need?', 'मुझे कौन से दस्तावेज़ चाहिए?', 'medium'],
  ['Where can I find a ATM?', 'मैं एटीएम कहाँ पा सकता हूँ?', 'medium'],
  ['What is the rent for this room?', 'इस कमरे का किराया कितना है?', 'medium'],
  ['When does the shop open?', 'दुकान कब खुलती है?', 'easy'],
  ['How do I apply for this?', 'मैं इसके लिए आवेदन कैसे करूँ?', 'medium'],
];

// ─── LEVEL 4: REAL-LIFE COMMUNICATION ───

// Lesson 18: Work and Office
const work: SentenceRow[] = [
  ['I will finish this work by today.', 'मैं आज ही यह काम पूरा कर दूँगा।', 'medium'],
  ['Can we discuss this in the meeting?', 'क्या हम इस पर मीटिंग में चर्चा कर सकते हैं?', 'medium'],
  ['I need more time for this project.', 'मुझे इस प्रोजेक्ट के लिए और समय चाहिए।', 'medium'],
  ['The deadline is tomorrow.', 'अंतिम तिथि कल है।', 'medium'],
  ['I will send the report by evening.', 'मैं शाम तक रिपोर्ट भेज दूँगा।', 'medium'],
  ['Can you review this document?', 'क्या आप इस दस्तावेज़ की समीक्षा कर सकते हैं?', 'medium'],
  ['I have a presentation at three.', 'मेरी तीन बजे प्रेज़ेंटेशन है।', 'medium'],
  ['We need to discuss the budget.', 'हमें बजट पर चर्चा करनी है।', 'medium'],
  ['I am working from home today.', 'मैं आज घर से काम कर रहा हूँ।', 'medium'],
  ['Let me check with my manager.', 'मुझे अपने मैनेजर से पूछने दीजिए।', 'medium'],
];

// Lesson 19: Customer Service
const customerService: SentenceRow[] = [
  ['I would like to make a complaint.', 'मैं शिकायत दर्ज कराना चाहूँगा।', 'medium'],
  ['When will my order be delivered?', 'मेरा ऑर्डर कब डिलीवर होगा?', 'medium'],
  ['I have not received my package yet.', 'मुझे अभी तक मेरा पैकेज नहीं मिला।', 'medium'],
  ['Can I exchange this for another size?', 'क्या मैं इसे दूसरे साइज़ में बदल सकता हूँ?', 'medium'],
  ['My payment has failed.', 'मेरा भुगतान असफल हो गया है।', 'medium'],
  ['I need a refund.', 'मुझे रिफंड चाहिए।', 'medium'],
  ['The product is damaged.', 'प्रोडक्ट खराब है।', 'medium'],
  ['Can you check the status of my order?', 'क्या आप मेरे ऑर्डर की स्थिति जांच सकते हैं?', 'medium'],
  ['I need to change my delivery address.', 'मुझे अपना डिलीवरी पता बदलना है।', 'medium'],
  ['How do I cancel this order?', 'मैं यह ऑर्डर कैंसल कैसे करूँ?', 'medium'],
];

// Lesson 20: Social Conversation
const socialConversation: SentenceRow[] = [
  ['It was really nice talking to you.', 'आपसे बात करके बहुत अच्छा लगा।', 'medium'],
  ['How is your family doing?', 'आपका परिवार कैसा है?', 'medium'],
  ['What do you do in your free time?', 'आप अपने खाली समय में क्या करते हैं?', 'medium'],
  ['I enjoy reading books.', 'मुझे किताबें पढ़ना पसंद है।', 'medium'],
  ['The weather is really nice today.', 'आज मौसम बहुत अच्छा है।', 'easy'],
  ['I heard you got promoted, congratulations!', 'मैंने सुना आपकी प्रमोशन हो गई, बधाई हो!', 'medium'],
  ['We should plan a trip together.', 'हमें मिलकर यात्रा की योजना बनानी चाहिए।', 'medium'],
  ['Do you have any suggestions?', 'क्या आपके पास कोई सुझाव है?', 'medium'],
  ['I will keep that in mind.', 'मैं इसे ध्यान में रखूँगा।', 'medium'],
  ['Let me know if you need anything.', 'अगर कुछ चाहिए तो मुझे बताइए।', 'medium'],
];

export const beginnerSentencesExpanded: SentenceRow[] = [
  ...greetings,
  ...introduction,
  ...family,
  ...home,
  ...basicQuestions,
  ...numbersTime,
  ...dailyRoutine,
  ...shopping,
  ...food,
  ...travel,
  ...phoneCalls,
  ...friendsSocial,
  ...requestsProblems,
  ...opinions,
  ...plans,
  ...explainingProblems,
  ...askingInfo,
  ...work,
  ...customerService,
  ...socialConversation,
];
