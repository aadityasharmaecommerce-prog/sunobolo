import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Headphones, Share2, ChevronDown, Square, SkipForward, Lightbulb } from 'lucide-react';
// Voice config removed - using only Sarvam AI MP3 audio

// ══════════ DATA ══════════

interface KeywordItem {
  english: string;
  hindi: string;
}

interface ArticleData {
  id: string;
  title: string;
  hook: string;
  category: string;
  categoryIcon: string;
  difficulty: string;
  readTime: number;
  emoji: string;
  gradient: string;
  content: string;
  keywords: KeywordItem[];
}

const ARTICLES: Record<string, ArticleData> = {
  r1: {
    id: 'r1', title: 'The Stranger on the Train', hook: 'She sat next to me. Then she whispered something that changed my life forever.',
    category: 'Life Story', categoryIcon: '📖', difficulty: 'Beginner', readTime: 2, emoji: '🚂',
    gradient: 'from-sky-500/20 to-blue-500/5',
    content: `I was sitting in a crowded train, watching the rain hit the window. I had just lost my job and I did not know what to do next. My life felt like it was falling apart.\n\nThen a woman sat next to me. She was old, maybe 70 years old. She smiled at me and I smiled back. I did not want to talk, but she started a conversation.\n\n"You look sad," she said. "Did something happen?"\n\nI told her everything. About my job. About my fear. About how I felt like a failure.\n\nShe listened carefully. Then she said something I will never forget.\n\n"Young man, I am 72 years old. I have lost three jobs, two homes, and almost lost my family. But today I am happier than I have ever been. Do you know why?"\n\nI shook my head.\n\n"Because every time life knocked me down, I got up one more time. That is the only difference between successful people and everyone else. They get up one more time."\n\nThe train reached my station. I got up to leave. She held my hand and said, "Remember this — your best days are not behind you. They are ahead of you."\n\nI walked out of that train a different person. That was five years ago. Today I run my own small business. And I think about that old woman every single day.\n\nSometimes the smallest conversation can change your biggest problem.`,
    keywords: [
      { english: 'falling apart', hindi: 'बिखर रहा था / टूट रहा था' },
      { english: 'I did not want to talk', hindi: 'मुझे बात नहीं करनी थी' },
      { english: 'She listened carefully', hindi: 'उसने ध्यान से सुना' },
      { english: 'I will never forget', hindi: 'मैं कभी नहीं भूलूँगा' },
      { english: 'life knocked me down', hindi: 'ज़िन्दगी ने गिरा दिया' },
      { english: 'They get up one more time', hindi: 'वो एक बार और उठते हैं' },
      { english: 'your best days are not behind you', hindi: 'तुम्हारे अच्छे दिन पीछे नहीं हैं' },
      { english: 'the smallest conversation can change your biggest problem', hindi: 'सबसे छोटी बातचीत भी बड़ी मुश्किल बदल सकती है' },
    ],
  },
  r2: {
    id: 'r2', title: '₹500 Ka Phone, ₹50 Lakh Ka Dream', hook: 'Ramesh ne ₹500 ka phone se start kiya. Aaj uski company hai worth ₹50 lakh.',
    category: 'Motivation', categoryIcon: '🔥', difficulty: 'Intermediate', readTime: 3, emoji: '📱',
    gradient: 'from-amber-500/20 to-yellow-500/5',
    content: `Ramesh was a small boy from a village in Bihar. His father was a farmer and his mother worked as a helper in a school. They did not have much money.\n\nWhen Ramesh was 16 years old, he bought a used phone for ₹500. It was old and slow, but it had internet. And that phone changed everything.\n\nRamesh started watching YouTube videos about computers and technology. He did not understand everything, but he kept watching. Every night, after helping his father in the fields, he would sit under a tree and watch videos for two hours.\n\nOne day, he learned about website design. He thought, "Can I learn this?" He found free courses online and started practicing. He made his first website for a local shop. The shopkeeper paid him ₹500.\n\nThat ₹500 was the happiest moment of his life. He realized that his phone was not just a toy — it was a tool.\n\nOver the next three years, Ramesh learned graphic design, video editing, and digital marketing. He started working with small businesses. Then bigger companies found him.\n\nToday, Ramesh is 24 years old. He runs a digital marketing company in Patna with 12 employees. His company earns ₹50 lakh per year.\n\nWhen people ask him his secret, he says: "I did not wait for the perfect phone, the perfect teacher, or the perfect time. I used what I had and I never stopped learning."\n\nYour circumstances do not define your future. Your decisions do.`,
    keywords: [
      { english: 'They did not have much money', hindi: 'उनके पास ज़्यादा पैसे नहीं थे' },
      { english: 'he kept watching', hindi: 'वो देखता रहा' },
      { english: 'Can I learn this?', hindi: 'क्या मैं यह सीख सकता हूँ?' },
      { english: 'the happiest moment of his life', hindi: 'उसकी ज़िन्दगी का सबसे ख़ुशी भरा पल' },
      { english: 'his phone was not just a toy — it was a tool', hindi: 'उसका फ़ोन सिर्फ़ खिलौना नहीं था — यह एक हथियार था' },
      { english: 'I never stopped learning', hindi: 'मैंने सीखना कभी बंद नहीं किया' },
      { english: 'Your circumstances do not define your future', hindi: 'तुम्हारी परिस्थितियाँ तुम्हारा भविष्य तय नहीं करतीं' },
    ],
  },
  r3: {
    id: 'r3', title: 'The Girl Who Never Gave Up', hook: 'Reject hui 47 baar. 48th interview mein usne duniya badal di.',
    category: 'Inspiration', categoryIcon: '⭐', difficulty: 'Beginner', readTime: 2, emoji: '💪',
    gradient: 'from-pink-500/20 to-rose-500/5',
    content: `Meera was a girl from a small town in Rajasthan. She wanted to become a software engineer. But her family could not afford expensive coaching.\n\nSo she studied on her own. She borrowed books from the library. She practiced coding on a borrowed laptop. She studied for 8 hours every day.\n\nAfter completing her course, she started applying for jobs. She sent 47 applications. She got 47 rejection emails.\n\nSome companies did not even reply. Some said she was not experienced enough. Some said her English was not good enough.\n\nMeera was sad, but she did not stop. She improved her English by watching English movies with subtitles. She practiced coding every day. She built 10 small projects on her own.\n\nThen she applied to one more company — the 48th one. This time, something different happened. The interviewer was impressed by her projects and her dedication.\n\nShe got the job. Her salary was ₹6 lakh per year.\n\nToday, Meera works at a top technology company. She earns ₹25 lakh per year. She also teaches coding to 200 girls from small towns — for free.\n\nShe tells them: "The world will reject you many times. But you only need one yes. Keep going until you get it."\n\nYour 48th attempt might be the one that changes everything.`,
    keywords: [
      { english: 'could not afford expensive coaching', hindi: 'महँगी कोचिंग का खर्च नहीं उठा सकते थे' },
      { english: 'she borrowed books from the library', hindi: 'उसने किताबें लाइब्रेरी से उधार लीं' },
      { english: 'rejection emails', hindi: 'रिजेक्शन ईमेल / मना करने वाले मेल' },
      { english: 'not experienced enough', hindi: 'अनुभव काफ़ी नहीं था' },
      { english: 'she did not stop', hindi: 'वो रुकी नहीं' },
      { english: 'impressed by her projects and her dedication', hindi: 'उसके प्रोजेक्ट और मेहनत से प्रभावित हुआ' },
      { english: 'you only need one yes', hindi: 'तुम्हें बस एक हाँ चाहिए' },
    ],
  },
  r4: {
    id: 'r4', title: 'The Midnight Mystery', hook: 'Raat 2 baje phone aaya. Caller ne bola: "Peeche mat dekho."',
    category: 'Thriller', categoryIcon: '👻', difficulty: 'Intermediate', readTime: 3, emoji: '🌙',
    gradient: 'from-purple-500/20 to-violet-500/5',
    content: `It was 2 AM. I was alone in my apartment, watching a movie. The power went out. Everything became dark and silent.\n\nThen my phone rang. The screen showed "Unknown Number." I answered.\n\n"Hello?" I said.\n\nA deep voice replied: "Don't turn around."\n\nI froze. "Who is this?" I asked.\n\n"I am behind you," the voice said. "If you turn around, you will see something you cannot forget."\n\nMy heart was beating fast. I wanted to laugh — it had to be a prank. But something felt different. Something felt real.\n\nI did not turn around. Instead, I said: "If you are really behind me, then prove it. Tell me what I am wearing."\n\nThere was a long silence. Then the voice said: "You are wearing a blue t-shirt and grey shorts. You are sitting on a brown sofa. There is a cold drink on the table next to you."\n\nMy blood went cold. How did this person know exactly what I was wearing and where I was sitting?\n\nI stood up slowly. I did not turn around. Instead, I walked to the door and opened it.\n\nThere was nobody there.\n\nBut on the floor, there was a note: "I told you not to turn around. Now you know I can see you. But you still don't know who I am."\n\nI moved out of that apartment the next day. And I never answered unknown numbers again.\n\nSome mysteries are better left unsolved.`,
    keywords: [
      { english: 'The power went out', hindi: 'बिजली चली गई' },
      { english: 'I froze', hindi: 'मैं जम गया / डर गया' },
      { english: 'it had to be a prank', hindi: 'यह मज़ाक होना चाहिए' },
      { english: 'Something felt real', hindi: 'कुछ सच जैसा लगा' },
      { english: 'My blood went cold', hindi: 'मेरा खून जम गया' },
      { english: 'How did this person know exactly', hindi: 'इस आदमी को इतनी सटीक जानकारी कैसे थी' },
      { english: 'I never answered unknown numbers again', hindi: 'मैंने अनजान नंबर कभी नहीं उठाया' },
    ],
  },
  r5: {
    id: 'r5', title: 'The Love Letter', hook: 'Usne 10 saal purana letter dhoondha. Andar kuch aisa tha jo sab badal dega.',
    category: 'Love Story', categoryIcon: '❤️', difficulty: 'Beginner', readTime: 2, emoji: '💌',
    gradient: 'from-pink-500/20 to-rose-500/5',
    content: `When Anjali was cleaning her old cupboard, she found a letter. It was yellow and old. The paper was soft from age. She opened it slowly.\n\nIt was a love letter. Written by Rahul — the boy she loved in college.\n\nShe had never received this letter. Rahul had given it to her friend to deliver, but her friend forgot. That was 10 years ago.\n\nThe letter said:\n\n"Dear Anjali,\n\nI have tried to tell you many times, but I cannot find the words. So I am writing them down.\n\nI love you. Not because you are beautiful — you are. Not because you are kind — you are. I love you because when I am with you, I become a better person.\n\nI know you will go to Delhi for your studies. I know life will be different. But I want you to know that no matter where you go, a part of me will always be with you.\n\nForever yours,\nRahul"\n\nAnjali sat on the floor and cried. She cried because she loved Rahul too. She cried because she never knew. She cried because 10 years had passed.\n\nThat evening, she called Rahul. He picked up on the first ring.\n\n"Rahul," she said, "I just read your letter."\n\nThere was a long silence. Then he said, "I was waiting for you to read it."\n\nSome love stories do not end. They just pause. And when the time is right, they start again.`,
    keywords: [
      { english: 'The paper was soft from age', hindi: 'काग़ज़ पुरानेपन से मुलायम हो गया था' },
      { english: 'I cannot find the words', hindi: 'मुझे शब्द नहीं मिल रहे' },
      { english: 'I become a better person', hindi: 'मैं बेहतर इंसान बन जाता हूँ' },
      { english: 'no matter where you go', hindi: 'तुम कहीं भी जाओ' },
      { english: 'a part of me will always be with you', hindi: 'मेरा एक हिस्सा हमेशा तुम्हारे साथ रहेगा' },
      { english: 'I was waiting for you to read it', hindi: 'मैं तुम्हारा इसे पढ़ने का इंतज़ार कर रहा था' },
      { english: 'when the time is right, they start again', hindi: 'जब सही समय आता है, वो फिर से शुरू होती हैं' },
    ],
  },
  r8: {
    id: 'r8', title: 'The Missing Diamond', hook: '₹2 crore ka heera gayab. Suspect? Ghar ka sabse trusted aadmi.',
    category: 'Crime & Mystery', categoryIcon: '🔍', difficulty: 'Intermediate', readTime: 3, emoji: '💎',
    gradient: 'from-red-500/20 to-orange-500/5',
    content: `The Sharma family was hosting a grand party. Their diamond necklace worth ₹2 crore was kept in the master bedroom safe. Everyone knew about it — it was the talk of the evening.\n\nAt 11 PM, Mrs. Sharma went to check on the necklace. The safe was open. The necklace was gone.\n\nThe police arrived within 30 minutes. Inspector Verma started questioning everyone. There were 15 guests at the party. And one trusted servant — Gopal — who had worked for the family for 20 years.\n\nThe police checked the CCTV footage. Nobody entered or left the bedroom between 9 PM and 11 PM. The windows were locked. The door was not forced open.\n\nInspector Verma looked at everyone carefully. Then he noticed something.\n\nGopal was sweating. Not because of the heat — it was an air-conditioned room. He was sweating because he was nervous.\n\n"Gopal," the inspector said, "you have been working here for 20 years. You know where the safe is. You know the code."\n\nGopal said, "Sir, I would never steal from this family. They are like my own."\n\nThe inspector smiled. "I believe you. But tell me — why did you open the safe at 10:15 PM?"\n\nGopal turned pale. "How did you know that?"\n\n"There are tiny fingerprints on the safe handle," the inspector said. "And they match yours."\n\nGopal broke down. He confessed. He had borrowed money from bad people and needed to pay them back. He took the necklace and hid it in the garden.\n\nThe necklace was recovered. Gopal was arrested. The Sharma family was shocked.\n\nTrust is a beautiful thing. But it can also be the biggest weakness.`,
    keywords: [
      { english: 'the talk of the evening', hindi: 'शाम की चर्चा का विषय' },
      { english: 'The necklace was gone', hindi: 'हार ग़ायब था' },
      { english: 'questioning everyone', hindi: 'सबसे पूछताछ कर रहा था' },
      { english: 'Nobody entered or left', hindi: 'कोई अंदर नहीं आया या बाहर गया' },
      { english: 'He was sweating because he was nervous', hindi: 'वो घबराहट में पसीना बहा रहा था' },
      { english: 'I would never steal from this family', hindi: 'मैं कभी इस घर से चोरी नहीं करूँगा' },
      { english: 'Gopal turned pale', hindi: 'गोपाल का चेहरा उड़ गया / सफ़ेद पड़ गया' },
      { english: 'Trust is a beautiful thing', hindi: 'भरोसा अच्छी चीज़ है। लेकिन यह सबसे बड़ी कमज़ोरी भी हो सकता है।' },
    ],
  },
  r10: {
    id: 'r10', title: 'From Rickshaw to Rolls Royce', hook: 'Auto chalata tha. Bachon ko English nahi aati thi. Aaj unka beta IIM mein hai.',
    category: 'Motivation', categoryIcon: '🔥', difficulty: 'Beginner', readTime: 2, emoji: '🚗',
    gradient: 'from-amber-500/20 to-yellow-500/5',
    content: `Vikram drove an auto-rickshaw in Delhi. He earned ₹300 to ₹400 per day. His wife worked as a helper in a school. They had two children — a son and a daughter.\n\nVikram wanted his children to study in English medium schools. But he could not afford the fees. So he put them in a government school.\n\nEvery evening, after driving his auto, Vikram would sit with his children and help them study. He could not read English, but he would ask them to read aloud. He would listen carefully.\n\nOne day, his son said, "Papa, I want to learn English. But my teacher says we need to practice at home."\n\nVikram thought for a long time. Then he said, "I will learn English with you."\n\nEvery night, father and son would sit together. The son would teach his father English words. The father would teach his son about life. They learned together.\n\nThis continued for years. Vikram's son grew up and scored excellent marks in his 12th exam. He got admission in IIM Ahmedabad — one of the best business schools in India.\n\nToday, Vikram's son is a manager at a top company. His daughter is a doctor. And Vikram? He still drives his auto-rickshaw. But now he speaks English.\n\nPeople ask him, "How did you do it?"\n\nHe says, "I did not have money. But I had time. And I had love. That is enough."\n\nYou do not need a lot of money to change your family's future. You need dedication.`,
    keywords: [
      { english: 'He could not afford the fees', hindi: 'वो फ़ीस नहीं दे सकता था' },
      { english: 'he would ask them to read aloud', hindi: 'वो उनसे ज़ोर से पढ़ने को कहता था' },
      { english: 'I will learn English with you', hindi: 'मैं भी तुम्हारे साथ English सीखूँगा' },
      { english: 'They learned together', hindi: 'वो साथ में सीखे' },
      { english: 'scored excellent marks', hindi: 'बहुत अच्छे नंबर आए' },
      { english: 'I did not have money. But I had time. And I had love. That is enough.', hindi: 'मेरे पास पैसे नहीं थे। लेकिन वक़्त था। और प्यार था। बस काफ़ी है।' },
      { english: 'You need dedication', hindi: 'तुम्हें लगन चाहिए' },
    ],
  },
  r12: {
    id: 'r12', title: 'She Sold Chai, She Built an Empire', hook: 'Chai bechti thi. Log hasste the. Aaj uski 12 shops hain.',
    category: 'Inspiration', categoryIcon: '⭐', difficulty: 'Beginner', readTime: 2, emoji: '☕',
    gradient: 'from-orange-500/20 to-amber-500/5',
    content: `Kamla made tea. That is all she knew how to do. Her husband had left her when she was 25, and she had two small children to feed.\n\nShe started selling chai on the street corner near a bus stop. She woke up at 4 AM every day to prepare the tea. By 6 AM, she was ready.\n\nPeople walked past her every day. Some smiled. Some ignored her. A few made fun of her. "She sells chai," they would say. "What can she become?"\n\nBut Kamla did not listen to them. She focused on making the best chai in the neighborhood. She added a little extra masala. She served it in clean cups. She remembered every customer's name.\n\nSlowly, people started coming to her specifically. Office workers, students, shopkeepers — they all loved her chai.\n\nAfter two years, she saved enough money to rent a small room. She put four tables inside and called it "Kamla Chai Point."\n\nBusiness grew. She added snacks — samosas, pakoras, biscuits. She hired two women from her neighborhood.\n\nAfter five years, she had three shops. After ten years, she had twelve shops across the city.\n\nToday, Kamla earns ₹3 lakh per month. She has sent both her children to English medium schools. Her daughter is studying to become a lawyer.\n\nWhen journalists ask her for an interview, she says the same thing: "I am not special. I just made good chai and I never gave up."\n\nThe world will always have people who laugh at you. Prove them wrong with your success.`,
    keywords: [
      { english: 'That is all she knew how to do', hindi: 'वो बस यही करना जानती थी' },
      { english: 'she had two small children to feed', hindi: 'उसे दो छोटे बच्चे पालने थे' },
      { english: 'A few made fun of her', hindi: 'कुछ लोगों ने उसका मज़ाक उड़ाया' },
      { english: 'She focused on making the best chai', hindi: 'उसने सबसे अच्छी चाय बनाने पर ध्यान दिया' },
      { english: 'She remembered every customer\'s name', hindi: 'वो हर ग्राहक का नाम याद रखती थी' },
      { english: 'she saved enough money to rent a small room', hindi: 'उसने एक छोटा कमरा किराये पर लेने भर पैसे जमा कर लिए' },
      { english: 'I just made good chai and I never gave up', hindi: 'मैंने बस अच्छी चाय बनाई और कभी हार नहीं मानी' },
      { english: 'Prove them wrong with your success', hindi: 'अपनी कामयाबी से उन्हें ग़लत साबित करो' },
    ],
  },
  r13: {
    id: 'r13', title: 'My Boss Thinks I am Working', hook: 'Main meeting mein tha. Actually main neend mein tha.',
    category: 'Funny', categoryIcon: '😂', difficulty: 'Beginner', readTime: 1, emoji: '😅',
    gradient: 'from-green-500/20 to-emerald-500/5',
    content: `Today was the longest meeting in the history of meetings. My boss started talking at 10 AM. It is now 1 PM and he has not stopped.\n\nI am sitting in the meeting room, nodding my head every few minutes. I have mastered the art of looking interested while thinking about what to have for dinner.\n\nMy boss said, "Does everyone understand?" I nodded. Everyone nodded. Nobody understood anything.\n\nMy colleague sitting next to me is also sleeping. But he is better at it than me. He props his head on his hand and looks like he is thinking deeply.\n\nI tried that technique. Then I started snoring. My boss looked at me. I quickly said, "Yes, I agree with that point!" He smiled and continued talking.\n\nThe meeting finally ended at 1:30 PM. My boss said, "Same time tomorrow." I wanted to cry.\n\nOn my way out, my colleague said, "That was a good meeting." I looked at him and said, "What did we discuss?" He said, "I have no idea."\n\nWelcome to corporate life.`,
    keywords: [
      { english: 'the longest meeting in the history of meetings', hindi: 'मीटिंग्स के इतिहास की सबसे लंबी मीटिंग' },
      { english: 'I have mastered the art of looking interested', hindi: 'मैंने दिलचस्प दिखने की कला में महारत हासिल कर ली है' },
      { english: 'Does everyone understand?', hindi: 'सबको समझ आया?' },
      { english: 'Nobody understood anything', hindi: 'किसी को कुछ समझ नहीं आया' },
      { english: 'I started snoring', hindi: 'मेरी खर्राटे शुरू हो गए' },
      { english: 'I wanted to cry', hindi: 'मेरा रोने का मन किया' },
      { english: 'Welcome to corporate life', hindi: 'कॉर्पोरेट लाइफ़ में आपका स्वागत है' },
    ],
  },
  r16: {
    id: 'r16', title: 'My First Salary', hook: '₹8,000 pehli salary. Maa ki aankhon mein jo chamak aayi — wo sab kuch thi.',
    category: 'Real Life', categoryIcon: '📖', difficulty: 'Beginner', readTime: 2, emoji: '💰',
    gradient: 'from-sky-500/20 to-blue-500/5',
    content: `I still remember the day I got my first salary. It was ₹8,000. Not much for most people. But for me, it was everything.\n\nI was 20 years old, working as a junior accountant in a small firm in Jaipur. I had been working for three months. Every day I would take two buses to reach office, work for 9 hours, and come home late.\n\nWhen the salary came into my account, I checked my phone again and again. ₹8,000. I could not believe it. I had earned this money with my own hands.\n\nThe first thing I did was go home. My mother was cooking dinner. I walked in and said, "Maa, I got my salary."\n\nShe turned around. Her eyes were shining. She did not say anything. She just held my face in her hands and looked at me. I could see tears in her eyes.\n\n"Take ₹2,000 and keep it for yourself," she said. "You have earned it."\n\nI gave her ₹5,000. She tried to refuse, but I insisted. The remaining ₹1,000 I used to buy a new shirt for my father.\n\nThat night, my mother told all the neighbors about my salary. She was so proud. I realized that money is not just about buying things. It is about taking care of the people you love.\n\nI earn much more now. But that first salary — that ₹8,000 — will always be the most special money I have ever earned.`,
    keywords: [
      { english: 'It was everything', hindi: 'वो सब कुछ था' },
      { english: 'I had earned this money with my own hands', hindi: 'मैंने यह पैसा अपनी मेहनत से कमाया था' },
      { english: 'Her eyes were shining', hindi: 'उसकी आँखें चमक रही थीं' },
      { english: 'She just held my face in her hands', hindi: 'उसने बस मेरा चेहरा अपने हाथों में पकड़ लिया' },
      { english: 'I could see tears in her eyes', hindi: 'मैं उसकी आँखों में आँसू देख सकता था' },
      { english: 'She tried to refuse, but I insisted', hindi: 'उसने मना करने की कोशिश की, लेकिन मैंने ज़िद की' },
      { english: 'money is not just about buying things', hindi: 'पैसा सिर्फ़ चीज़ें ख़रीदने के बारे में नहीं है' },
      { english: 'taking care of the people you love', hindi: 'अपने प्यार के लोगों की देखभाल करना' },
    ],
  },
  r6: {
    id: 'r6', title: 'Two Strangers, One Bench', hook: 'Every morning, same bench. Today they finally spoke.',
    category: 'Love Story', categoryIcon: '❤️', difficulty: 'Beginner', readTime: 2, emoji: '🌅',
    gradient: 'from-rose-500/20 to-pink-500/5',
    content: `Every morning at 7 AM, Sunita sat on the same bench in the park. She drank her chai and watched the sun rise. She did this every day for three years.\n\nOne morning, a man sat on the other end of the bench. He was old, maybe 65. He also had a cup of chai. They sat in silence.\n\nThe next morning, he was there again. And the next. And the next. They never spoke. Just sat together, watching the sunrise.\n\nAfter two months, the man said, \"Good morning.\" Sunita smiled and said, \"Good morning.\"\n\nThat was the start of something beautiful. They started talking every morning. He told her about his wife who had passed away. She told him about her loneliness after retirement.\n\nThey became the best of friends. Every morning, same bench, same chai, same sunrise.\n\nOne day, Sunita did not come. The man waited. She did not come the next day either. He was worried.\n\nOn the third day, she came. She was crying. \"My son wants me to move to Delhi,\" she said. \"I do not want to go.\"\n\nThe man held her hand and said, \"Then do not go. Some things are worth staying for.\"\n\nShe stayed. And every morning, they still sit on that bench. Some friendships do not need words to begin. They just need time.`,
    keywords: [
      { english: 'She did this every day for three years', hindi: 'वो तीन साल से हर दिन यह करती थी' },
      { english: 'They never spoke', hindi: 'उन्होंने कभी बात नहीं की' },
      { english: 'That was the start of something beautiful', hindi: 'वो कुछ ख़ूबसूरत होने की शुरुआत थी' },
      { english: 'They became the best of friends', hindi: 'वो सबसे अच्छे दोस्त बन गए' },
      { english: 'Some things are worth staying for', hindi: 'कुछ चीज़ें रुकने लायक होती हैं' },
    ],
  },
  r7: {
    id: 'r7', title: 'The Promise', hook: '"I will come back." He left for 5 years.',
    category: 'Love Story', categoryIcon: '❤️', difficulty: 'Intermediate', readTime: 3, emoji: '🤝',
    gradient: 'from-red-500/20 to-rose-500/5',
    content: `Amit and Priya loved each other since college. But Amit got a job offer in London. He had to go.\n\n\"I will come back,\" he told her. \"Wait for me.\"\n\nPriya said, \"I will wait. But promise me you will not forget me.\"\n\nHe promised. And he left.\n\nThe first year was easy. They talked every day on video call. He sent her photos of London. She sent him photos of their favorite tea shop.\n\nThe second year, the calls became shorter. He was busy. She was busy. But they still talked.\n\nThe third year, he stopped calling. She waited. She did not call him. She wanted him to call first.\n\nThe fourth year, she heard from a friend that Amit had a girlfriend in London. She cried for three days. Then she deleted his number.\n\nThe fifth year, Amit came back. He stood outside her house with flowers. She opened the door.\n\n\"I made a mistake,\" he said. \"I should never have left.\"\n\nPriya looked at him. She was calm. \"You promised you would not forget me,\" she said. \"But you did.\"\n\nShe closed the door.\n\nAmit stood there for one hour. Then he left. Some promises are broken not by forgetting, but by taking too long to keep.\n\nPriya married someone else the next year. A man who did not need five years to choose her.`,
    keywords: [
      { english: 'Wait for me', hindi: 'मेरा इंतज़ार करना' },
      { english: 'He stopped calling', hindi: 'उसने फ़ोन करना बंद कर दिया' },
      { english: 'She deleted his number', hindi: 'उसने उसका नंबर मिटा दिया' },
      { english: 'I made a mistake', hindi: 'मैंने ग़लती की' },
      { english: 'She closed the door', hindi: 'उसने दरवाज़ा बंद कर दिया' },
      { english: 'Some promises are broken not by forgetting, but by taking too long to keep', hindi: 'कुछ वादे भूलने से नहीं, बल्कि बहुत देर से निभाने से टूटते हैं' },
    ],
  },
  r9: {
    id: 'r9', title: 'The Last Message', hook: '"If I do not wake up tomorrow..."',
    category: 'Crime & Mystery', categoryIcon: '🔍', difficulty: 'Intermediate', readTime: 3, emoji: '📱',
    gradient: 'from-orange-500/20 to-red-500/5',
    content: `Detective Roy received a text message at 11:47 PM. It said: \"If I do not wake up tomorrow, check the blue diary on my desk.\"\n\nThe message was from Arjun Mehta, a famous businessman.\n\nThe next morning, Arjun was found dead in his bedroom. The police said it was a heart attack. Case closed.\n\nBut Detective Roy was not satisfied. He went to Arjun's office and found the blue diary. Inside, Arjun had written about his business partner, Vikram, who was stealing money from the company.\n\nArjun had written: \"Vikram knows I will expose him. I am afraid of what he might do.\"\n\nThe diary also mentioned that Vikram had hired someone to follow Arjun.\n\nDetective Roy showed the diary to the police. They agreed to investigate. They found that Vikram had been giving Arjun sleeping pills in his dinner for three months. The pills weakened his heart.\n\nVikram was arrested. The diary was the key evidence.\n\nDetective Roy learned an important lesson: Sometimes the dead speak louder than the living. You just need to listen.`,
    keywords: [
      { english: 'If I do not wake up tomorrow', hindi: 'अगर मैं कल उठ नहीं पाया' },
      { english: 'Case closed', hindi: 'केस बंद' },
      { english: 'But Detective Roy was not satisfied', hindi: 'लेकिन डिटेक्टिव रॉय संतुष्ट नहीं था' },
      { english: 'I am afraid of what he might do', hindi: 'मुझे डर है वो क्या कर सकता है' },
      { english: 'The diary was the key evidence', hindi: 'डायरी मुख्य सबूत थी' },
      { english: 'Sometimes the dead speak louder than the living', hindi: 'कभी-कभी मरे हुए ज़िंदा लोगों से ज़्यादा बोलते हैं' },
    ],
  },
  r11: {
    id: 'r11', title: 'The 3 AM Rule', hook: '90% successful people wake up at 3 AM. True?',
    category: 'Motivation', categoryIcon: '🔥', difficulty: 'Beginner', readTime: 2, emoji: '⏰',
    gradient: 'from-yellow-500/20 to-amber-500/5',
    content: `Raj read an article that said 90% of successful people wake up at 3 AM. He decided to try it.\n\nThe first day, he woke up at 3 AM and sat on his bed. He did not know what to do. He made chai and drank it slowly.\n\nThe second day, he woke up at 3 AM and went for a walk. The streets were empty. It was peaceful.\n\nThe third day, he woke up at 3 AM and started working on his business plan. He had been putting it off for months.\n\nAfter one week of waking up at 3 AM, Raj had finished his business plan. He had exercised every morning. He had read 50 pages of a book.\n\nAfter one month, he had saved ₹10,000 extra because he stopped buying evening snacks and coffee. He had lost 3 kg. He had read 4 books.\n\nAfter three months, Raj launched his business. It was a small food delivery service. Within six months, he had 200 customers.\n\nPeople asked him, \"Is the 3 AM rule real?\"\n\nHe said, \"It does not matter if you wake up at 3 AM or 6 AM. What matters is what you do with that extra time. The secret is not the hour — it is the habit.\"\n\nYour mornings define your life. Use them wisely.`,
    keywords: [
      { english: 'He decided to try it', hindi: 'उसने कोशिश करने का फ़ैसला किया' },
      { english: 'The streets were empty', hindi: 'सड़कें ख़ाली थीं' },
      { english: 'He had been putting it off for months', hindi: 'वो महीनों से टाल रहा था' },
      { english: 'The secret is not the hour — it is the habit', hindi: 'राज़ वक़्त नहीं है — राज़ आदत है' },
      { english: 'Your mornings define your life', hindi: 'तुम्हारी सुबहें तुम्हारी ज़िन्दगी तय करती हैं' },
    ],
  },
  r14: {
    id: 'r14', title: 'The Autowala Philosopher', hook: 'Auto uncle taught me life\'s biggest lesson — for ₹50.',
    category: 'Funny', categoryIcon: '😂', difficulty: 'Beginner', readTime: 2, emoji: '🛺',
    gradient: 'from-emerald-500/20 to-green-500/5',
    content: `I took an auto one day. The auto uncle asked, \"Where to?\" I told him the address.\n\nOn the way, I was stressed about my job interview. I was thinking about all the questions they might ask.\n\nThe auto uncle looked at me in the mirror and said, \"You look worried.\"\n\nI was surprised. \"How do you know?\"\n\nHe said, \"I have been driving auto for 20 years. I can tell if someone is going to an interview, a wedding, or a hospital just by looking at their face.\"\n\nI laughed. \"So what do you think about my face?\"\n\nHe said, \"You are going for a job interview. You are nervous. But you will be fine.\"\n\n\"How do you know I will be fine?\"\n\nHe said, \"Because people who are nervous care about the job. People who do not care do not get nervous. That means you will prepare well. And preparation always works.\"\n\nI was shocked. This auto uncle gave me better advice than my coaching teacher.\n\nI asked, \"Uncle, have you ever failed an interview?\"\n\nHe laughed and said, \"Beta, I have never given one. I am happy driving my auto. Not everyone needs a big office to be successful.\"\n\nI reached my destination. The fare was ₹50. I gave him ₹100 and said, \"Keep the change. You are the best teacher I have ever met.\"\n\nHe smiled and said, \"Next time, take the bus. It is cheaper.\"`,
    keywords: [
      { english: 'I have been driving auto for 20 years', hindi: 'मैं 20 साल से ऑटो चला रहा हूँ' },
      { english: 'People who are nervous care about the job', hindi: 'जो लोग नर्वस होते हैं वो काम की परवाह करते हैं' },
      { english: 'Preparation always works', hindi: 'तैयारी हमेशा काम आती है' },
      { english: 'Not everyone needs a big office to be successful', hindi: 'कामयाब होने के लिए हर किसी को बड़े ऑफ़िस की ज़रूरत नहीं' },
      { english: 'Next time, take the bus', hindi: 'अगली बार बस ले लो' },
    ],
  },
  r15: {
    id: 'r15', title: 'The Room Next Door', hook: 'Someone cries every night. But nobody lives there.',
    category: 'Thriller', categoryIcon: '👻', difficulty: 'Intermediate', readTime: 3, emoji: '🚪',
    gradient: 'from-purple-500/20 to-violet-500/5',
    content: `I moved into a new apartment last month. The building was old but the rent was cheap. My neighbor, Mr. Sharma, warned me about the room next to mine.\n\n\"That room has been empty for two years,\" he said. \"Nobody stays there for long.\"\n\nI did not believe in ghost stories. So I ignored him.\n\nThe first week was fine. But on the eighth night, I heard crying. It was coming from the empty room next door.\n\nI put my ear to the wall. The crying was soft, like a woman. It stopped after ten minutes.\n\nThe next night, the same thing. Crying at exactly 2 AM.\n\nI told Mr. Sharma. He said, \"That is why the room is empty. The previous tenant left because of this.\"\n\nI decided to investigate. I went to the building owner and asked for the key to the empty room.\n\nHe gave me the key reluctantly. I opened the door. The room was dusty and dark. There was nothing inside — just an old bed and a window.\n\nThen I noticed something. The window was slightly open. And from outside, I could hear someone crying. It was not coming from inside the room. It was coming from the apartment below.\n\nThe sound was traveling up through the open window.\n\nI went downstairs and knocked on the door. A young woman opened it. She was crying because she had just broken up with her boyfriend. She cried every night at 2 AM.\n\nI felt relieved and sad at the same time. Relieved that there were no ghosts. Sad that someone was crying alone every night.\n\nI brought her some chai the next night. We became friends. Sometimes the scariest things have the simplest explanations.`,
    keywords: [
      { english: 'Nobody stays there for long', hindi: 'वहाँ कोई ज़्यादा दिन नहीं रहता' },
      { english: 'I did not believe in ghost stories', hindi: 'मुझे भूतों की कहानियों पर भरोसा नहीं था' },
      { english: 'The sound was traveling up through the open window', hindi: 'आवाज़ खुली खिड़की से ऊपर आ रही थी' },
      { english: 'I felt relieved and sad at the same time', hindi: 'मुझे एक साथ राहत और दुख दोनों हुए' },
      { english: 'Sometimes the scariest things have the simplest explanations', hindi: 'कभी-कभी सबसे डरावनी चीज़ों के सबसे साधारण जवाब होते हैं' },
    ],
  },
  r17: {
    id: 'r17', title: 'The Bus Stop Friend', hook: 'Same bus stop. Never spoke. One day...',
    category: 'Real Life', categoryIcon: '📖', difficulty: 'Beginner', readTime: 2, emoji: '🚌',
    gradient: 'from-blue-500/20 to-sky-500/5',
    content: `Every day at 8:15 AM, Rahul waited for the bus at the same stop. And every day, a girl named Sneha also waited there. They never spoke.\n\nRahul wanted to talk to her. But he was shy. He thought, \"What if she thinks I am weird?\"\n\nSo he just stood there, looking at his phone, pretending he was busy.\n\nThis went on for four months.\n\nOne rainy day, the bus was late. They both stood under the small shelter. Sneha was getting wet because the shelter was too small for two people.\n\nWithout thinking, Rahul held his umbrella over her. She looked at him and smiled.\n\n\"Thank you,\" she said. \"You are very kind.\"\n\nHe smiled back and said, \"I should have done this four months ago.\"\n\nShe laughed. \"Four months? I have been waiting for you to say something since the first day.\"\n\nRahul was shocked. \"Really?\"\n\nShe said, \"Yes. I thought you did not like me.\"\n\nHe said, \"I was just scared.\"\n\nShe said, \"Scared of what?\"\n\nHe said, \"Scared that you would say no.\"\n\nShe smiled and said, \"Well, now you know. The answer is yes.\"\n\nThe bus came. They both got on. And from that day, they always sat together. Sometimes all you need is one rainy day and one brave moment.`,
    keywords: [
      { english: 'He was shy', hindi: 'वो शर्मीला था' },
      { english: 'What if she thinks I am weird?', hindi: 'अगर उसे लगे कि मैं अजीब हूँ?' },
      { english: 'I should have done this four months ago', hindi: 'मुझे यह चार महीने पहले करना चाहिए था' },
      { english: 'I was just scared', hindi: 'मैं बस डरा हुआ था' },
      { english: 'Sometimes all you need is one rainy day and one brave moment', hindi: 'कभी-कभी बस एक बरसात का दिन और एक हिम्मत वाला पल चाहिए' },
    ],
  },
  r18: {
    id: 'r18', title: 'The Teacher Who Changed 1000 Lives', hook: 'She earned ₹5,000. She taught 1000 kids English.',
    category: 'Inspiration', categoryIcon: '⭐', difficulty: 'Beginner', readTime: 2, emoji: '👩\u200d🏫',
    gradient: 'from-orange-500/20 to-amber-500/5',
    content: `Suman was a teacher in a village school in UP. She earned ₹5,000 per month. She taught Hindi and Maths.\n\nOne day, she noticed that her students could not read English textbooks. They would copy the English words without understanding them.\n\nShe decided to teach them English. But she did not know English herself. So she bought an English dictionary and started learning.\n\nEvery night, after teaching all day, she would study English for two hours. She learned 10 words every day. She practiced speaking to herself in the mirror.\n\nAfter six months, she could speak basic English. She started teaching her students. She made English fun. She taught them through songs and stories.\n\nHer students loved it. They learned fast. Within one year, 50 of her students could speak English.\n\nOther teachers came to learn from her. She taught them too. Within three years, she had trained 20 teachers.\n\nThose 20 teachers taught 1000 students.\n\nToday, Suman earns ₹25,000 per month. She has been featured in newspapers. But she still teaches in the same village school.\n\nWhen a reporter asked her, \"Why do you stay in this village? You could earn more in the city.\"\n\nShe said, \"Because every child here deserves to learn English. Money is not everything. Changing lives is everything.\"\n\nOne teacher, one village, 1000 lives changed. That is the power of dedication.`,
    keywords: [
      { english: 'She did not know English herself', hindi: 'उसे ख़ुद English नहीं आती थी' },
      { english: 'She learned 10 words every day', hindi: 'वो हर दिन 10 शब्द सीखती थी' },
      { english: 'She taught them through songs and stories', hindi: 'उसने गानों और कहानियों से पढ़ाया' },
      { english: 'Money is not everything', hindi: 'पैसा सब कुछ नहीं होता' },
      { english: 'One teacher, one village, 1000 lives changed', hindi: 'एक टीचर, एक गाँव, 1000 ज़िंदगियाँ बदलीं' },
    ],
  },
};

// ══════════ COMPONENT ══════════

export default function ReadingArticle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const article = id ? ARTICLES[id] : null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / total * 100, 0), 100);
      setReadProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, []);

  if (!article) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">📄</span>
        <p className="text-white/40 text-sm">Article not found.</p>
        <button onClick={() => navigate('/reading')} className="mt-4 text-brand-400 text-sm font-bold">← Back</button>
      </div>
    );
  }

  const stopAll = useCallback(() => {
    playingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleListen = useCallback(() => {
    if (playingRef.current) {
      stopAll();
      return;
    }
    // Start playing — Sarvam AI MP3 only
    playingRef.current = true;
    setIsPlaying(true);

    const mp3Path = `/audio/reading/${article.id}.mp3`;
    const audio = new Audio();
    audioRef.current = audio;

    audio.onended = () => { if (playingRef.current) stopAll(); };
    audio.onerror = () => { if (playingRef.current) stopAll(); };
    audio.src = mp3Path;
    audio.load();
    audio.oncanplay = () => {
      if (!playingRef.current) return;
      audio.play().then(() => {
        if (!playingRef.current) { audio.pause(); return; }
      }).catch(() => { if (playingRef.current) stopAll(); });
    };
  }, [article, stopAll]);

  const paragraphs = article.content.split('\n\n');

  return (
    <>
      {/* ══════════ PROGRESS BAR ══════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/[0.05]">
        <div
          className="h-full bg-gradient-to-r from-[#6C4DFF] to-accent-500 transition-all duration-300"
          style={{ width: `${completed ? 100 : readProgress}%` }}
        />
      </div>

      {/* ══════════ TOP BAR ══════════ */}
      <div className="flex items-center gap-3 mb-4 pt-2">
        <button onClick={() => navigate('/reading')}
          className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-white/30 font-medium">{article.categoryIcon} {article.category}</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors">
          <Share2 size={16} />
        </button>
      </div>

      {/* ══════════ ARTICLE HEADER ══════════ */}
      <div className={`relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br ${article.gradient} border border-white/[0.06]`}>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-2xl">
              {article.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[10px] font-bold rounded-full capitalize">{article.difficulty}</span>
                <span className="flex items-center gap-1 text-[11px] text-white/25"><Clock size={10} /> {article.readTime} min</span>
              </div>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{article.title}</h1>
          <p className="text-[13px] text-white/35 mt-2 italic">"{article.hook}"</p>
        </div>
      </div>

      {/* ══════════ LISTEN / STOP BUTTON ══════════ */}
      <button
        onClick={handleListen}
        className={`w-full mb-6 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
          isPlaying
            ? 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'
            : 'btn-premium btn-premium-gradient shadow-[0_8px_24px_-6px_rgba(108,77,255,0.4)]'
        }`}
      >
        {isPlaying ? (
          <><Square size={16} fill="currentColor" /> ⏹ Stop Listening</>
        ) : (
          <><Headphones size={18} /> 🔊 Listen — Premium Voice</>
        )}
      </button>

      {/* ══════════ READING CONTENT ══════════ */}
      <div ref={contentRef} className="dark-card p-6 sm:p-8 mb-6">
        <div className="max-w-prose mx-auto">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[16px] sm:text-[17px] text-white/65 leading-[1.9] mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* ══════════ KEYWORDS / HARD SENTENCES ══════════ */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-400" />
            <h3 className="text-[14px] font-extrabold text-white">🔑 Key Sentences & Hindi</h3>
          </div>
          <div className="dark-card p-4 space-y-3">
            {article.keywords.map((kw, i) => (
              <div key={i} className="flex flex-col gap-1 pb-3 border-b border-white/[0.05] last:border-b-0 last:pb-0">
                <p className="text-[14px] text-white/70 leading-relaxed">{kw.english}</p>
                <p className="text-[13px] text-amber-400/80 font-medium">→ {kw.hindi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ SCROLL INDICATOR ══════════ */}
      {readProgress < 50 && !completed && (
        <div className="text-center mb-6 text-white/20">
          <p className="text-[12px]">Scroll down to finish reading</p>
          <ChevronDown size={16} className="mx-auto mt-1 animate-bounce" />
        </div>
      )}

      {/* ══════════ READ YOURSELF ══════════ */}
      <div className="dark-card p-6 mb-6 text-center border-[#6C4DFF]/15">
        <div className="w-14 h-14 rounded-2xl bg-[#6C4DFF]/15 flex items-center justify-center mx-auto mb-3">
          <BookOpen size={24} className="text-brand-400" />
        </div>
        <h3 className="text-base font-extrabold text-white mb-1">📖 Now Read It Yourself</h3>
        <p className="text-[13px] text-white/35">Listen once, then try reading the passage yourself.</p>
      </div>

      {/* ══════════ COMPLETE READING + NEXT STORY BUTTONS ══════════ */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setCompleted(!completed)}
          className={`flex-1 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            completed
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.1]'
          }`}
        >
          {completed ? (
            <><CheckCircle2 size={18} /> Done! 🎉</>
          ) : (
            <>✅ Complete Reading</>
          )}
        </button>
        <button
          onClick={() => navigate('/reading')}
          className="flex-1 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 btn-premium btn-premium-gradient shadow-[0_8px_24px_-6px_rgba(108,77,255,0.4)]"
        >
          <SkipForward size={18} /> Next Story →
        </button>
      </div>

      {/* ══════════ COMPLETION CARD ══════════ */}
      {completed && (
        <div className="dark-card p-6 text-center border-emerald-500/15">
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="text-lg font-extrabold text-white">Great Job!</p>
          <p className="text-[13px] text-white/40 mt-1">You completed this passage. Keep reading every day!</p>
        </div>
      )}

      <div className="h-6" />
    </>
  );
}
