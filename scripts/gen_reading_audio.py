"""
SunoBolo — Daily Reading Audio Generator
Generates Sarvam AI premium voice audio for reading articles.

Usage:
  python scripts/gen_reading_audio.py              # Generate all missing
  python scripts/gen_reading_audio.py --id r1      # Generate for specific article
  python scripts/gen_reading_audio.py --list        # List all articles

Voice: Sarvam AI (bulbul:v3, shubh speaker) — same as main SunoBolo audio
Output: public/audio/reading/{article_id}.mp3
"""

import json
import base64
import os
import sys
import io

# Fix Windows console encoding for emoji output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# ── CONFIG ──────────────────────────────────────────────────────────────────

BASE_URL = "https://api.sarvam.ai/text-to-speech"
SPEAKER = "shubh"
MODEL = "bulbul:v3"
SAMPLE_RATE = 24000
LANGUAGE = "en-IN"  # English with Indian accent
DELAY = 0.5  # Delay between API calls

# API keys — add your Sarvam AI keys here
API_KEYS = [
    "sk_er7nrt82_TcJuYaVzzacuLOZXMsMnnjjp",
]

current_key_index = 0

def get_api_key():
    global current_key_index
    if current_key_index < len(API_KEYS):
        return API_KEYS[current_key_index]
    return None

def rotate_key():
    global current_key_index
    current_key_index += 1
    if current_key_index < len(API_KEYS):
        print(f"  🔄 Switching to API key #{current_key_index + 1}...")
        return True
    return False

# ── ARTICLES ────────────────────────────────────────────────────────────────

ARTICLES = [
    {
        "id": "r1",
        "title": "The Stranger on the Train",
        "content": "I was sitting in a crowded train, watching the rain hit the window. I had just lost my job and I did not know what to do next. My life felt like it was falling apart. Then a woman sat next to me. She was old, maybe 70 years old. She smiled at me and I smiled back. I did not want to talk, but she started a conversation. You look sad, she said. Did something happen? I told her everything. About my job. About my fear. About how I felt like a failure. She listened carefully. Then she said something I will never forget. Young man, I am 72 years old. I have lost three jobs, two homes, and almost lost my family. But today I am happier than I have ever been. Do you know why? I shook my head. Because every time life knocked me down, I got up one more time. That is the only difference between successful people and everyone else. They get up one more time. The train reached my station. I got up to leave. She held my hand and said, Remember this, your best days are not behind you. They are ahead of you. I walked out of that train a different person. That was five years ago. Today I run my own small business. And I think about that old woman every single day. Sometimes the smallest conversation can change your biggest problem."
    },
    {
        "id": "r2",
        "title": "500 Rupee Phone, 50 Lakh Dream",
        "content": "Ramesh was a small boy from a village in Bihar. His father was a farmer and his mother worked as a helper in a school. They did not have much money. When Ramesh was 16 years old, he bought a used phone for 500 rupees. It was old and slow, but it had internet. And that phone changed everything. Ramesh started watching YouTube videos about computers and technology. He did not understand everything, but he kept watching. Every night, after helping his father in the fields, he would sit under a tree and watch videos for two hours. One day, he learned about website design. He thought, Can I learn this? He found free courses online and started practicing. He made his first website for a local shop. The shopkeeper paid him 500 rupees. That 500 rupees was the happiest moment of his life. He realized that his phone was not just a toy. It was a tool. Over the next three years, Ramesh learned graphic design, video editing, and digital marketing. He started working with small businesses. Then bigger companies found him. Today, Ramesh is 24 years old. He runs a digital marketing company in Patna with 12 employees. His company earns 50 lakh per year. When people ask him his secret, he says, I did not wait for the perfect phone, the perfect teacher, or the perfect time. I used what I had and I never stopped learning."
    },
    {
        "id": "r3",
        "title": "The Girl Who Never Gave Up",
        "content": "Meera was a girl from a small town in Rajasthan. She wanted to become a software engineer. But her family could not afford expensive coaching. So she studied on her own. She borrowed books from the library. She practiced coding on a borrowed laptop. She studied for 8 hours every day. After completing her course, she started applying for jobs. She sent 47 applications. She got 47 rejection emails. Some companies did not even reply. Some said she was not experienced enough. Some said her English was not good enough. Meera was sad, but she did not stop. She improved her English by watching English movies with subtitles. She practiced coding every day. She built 10 small projects on her own. Then she applied to one more company, the 48th one. This time, something different happened. The interviewer was impressed by her projects and her dedication. She got the job. Her salary was 6 lakh per year. Today, Meera works at a top technology company. She earns 25 lakh per year. She also teaches coding to 200 girls from small towns, for free. She tells them, The world will reject you many times. But you only need one yes. Keep going until you get it."
    },
    {
        "id": "r4",
        "title": "The Midnight Mystery",
        "content": "It was 2 AM. I was alone in my apartment, watching a movie. The power went out. Everything became dark and silent. Then my phone rang. The screen showed Unknown Number. I answered. Hello? I said. A deep voice replied, Don't turn around. I froze. Who is this? I asked. I am behind you, the voice said. If you turn around, you will see something you cannot forget. My heart was beating fast. I wanted to laugh. It had to be a prank. But something felt different. Something felt real. I did not turn around. Instead, I said, If you are really behind me, then prove it. Tell me what I am wearing. There was a long silence. Then the voice said, You are wearing a blue t-shirt and grey shorts. You are sitting on a brown sofa. There is a cold drink on the table next to you. My blood went cold. How did this person know exactly what I was wearing and where I was sitting? I stood up slowly. I did not turn around. Instead, I walked to the door and opened it. There was nobody there. But on the floor, there was a note. It said, I told you not to turn around. Now you know I can see you. But you still don't know who I am. I moved out of that apartment the next day. And I never answered unknown numbers again."
    },
    {
        "id": "r5",
        "title": "The Love Letter",
        "content": "When Anjali was cleaning her old cupboard, she found a letter. It was yellow and old. The paper was soft from age. She opened it slowly. It was a love letter. Written by Rahul, the boy she loved in college. She had never received this letter. Rahul had given it to her friend to deliver, but her friend forgot. That was 10 years ago. The letter said, Dear Anjali, I have tried to tell you many times, but I cannot find the words. So I am writing them down. I love you. Not because you are beautiful, you are. Not because you are kind, you are. I love you because when I am with you, I become a better person. I know you will go to Delhi for your studies. I know life will be different. But I want you to know that no matter where you go, a part of me will always be with you. Forever yours, Rahul. Anjali sat on the floor and cried. She cried because she loved Rahul too. She cried because she never knew. She cried because 10 years had passed. That evening, she called Rahul. He picked up on the first ring. Rahul, she said, I just read your letter. There was a long silence. Then he said, I was waiting for you to read it. Some love stories do not end. They just pause. And when the time is right, they start again."
    },
    {
        "id": "r8",
        "title": "The Missing Diamond",
        "content": "The Sharma family was hosting a grand party. Their diamond necklace worth 2 crore was kept in the master bedroom safe. Everyone knew about it. It was the talk of the evening. At 11 PM, Mrs. Sharma went to check on the necklace. The safe was open. The necklace was gone. The police arrived within 30 minutes. Inspector Verma started questioning everyone. There were 15 guests at the party. And one trusted servant, Gopal, who had worked for the family for 20 years. The police checked the CCTV footage. Nobody entered or left the bedroom between 9 PM and 11 PM. The windows were locked. The door was not forced open. Inspector Verma looked at everyone carefully. Then he noticed something. Gopal was sweating. Not because of the heat. It was an air-conditioned room. He was sweating because he was nervous. Gopal, the inspector said, you have been working here for 20 years. You know where the safe is. You know the code. Gopal said, Sir, I would never steal from this family. They are like my own. The inspector smiled. I believe you. But tell me, why did you open the safe at 10:15 PM? Gopal turned pale. How did you know that? There are tiny fingerprints on the safe handle, the inspector said. And they match yours. Gopal broke down. He confessed. He had borrowed money from bad people and needed to pay them back. He took the necklace and hid it in the garden. The necklace was recovered. Gopal was arrested. The Sharma family was shocked."
    },
    {
        "id": "r10",
        "title": "From Rickshaw to Rolls Royce",
        "content": "Vikram drove an auto-rickshaw in Delhi. He earned 300 to 400 rupees per day. His wife worked as a helper in a school. They had two children, a son and a daughter. Vikram wanted his children to study in English medium schools. But he could not afford the fees. So he put them in a government school. Every evening, after driving his auto, Vikram would sit with his children and help them study. He could not read English, but he would ask them to read aloud. He would listen carefully. One day, his son said, Papa, I want to learn English. But my teacher says we need to practice at home. Vikram thought for a long time. Then he said, I will learn English with you. Every night, father and son would sit together. The son would teach his father English words. The father would teach his son about life. They learned together. This continued for years. Vikram's son grew up and scored excellent marks in his 12th exam. He got admission in IIM Ahmedabad, one of the best business schools in India. Today, Vikram's son is a manager at a top company. His daughter is a doctor. And Vikram? He still drives his auto-rickshaw. But now he speaks English. People ask him, How did you do it? He says, I did not have money. But I had time. And I had love. That is enough."
    },
    {
        "id": "r12",
        "title": "She Sold Chai, She Built an Empire",
        "content": "Kamla made tea. That is all she knew how to do. Her husband had left her when she was 25, and she had two small children to feed. She started selling chai on the street corner near a bus stop. She woke up at 4 AM every day to prepare the tea. By 6 AM, she was ready. People walked past her every day. Some smiled. Some ignored her. A few made fun of her. She sells chai, they would say. What can she become? But Kamla did not listen to them. She focused on making the best chai in the neighborhood. She added a little extra masala. She served it in clean cups. She remembered every customer's name. Slowly, people started coming to her specifically. Office workers, students, shopkeepers. They all loved her chai. After two years, she saved enough money to rent a small room. She put four tables inside and called it Kamla Chai Point. Business grew. She added snacks, samosas, pakoras, biscuits. She hired two women from her neighborhood. After five years, she had three shops. After ten years, she had twelve shops across the city. Today, Kamla earns 3 lakh per month. She has sent both her children to English medium schools. Her daughter is studying to become a lawyer. When journalists ask her for an interview, she says the same thing. I am not special. I just made good chai and I never gave up."
    },
    {
        "id": "r13",
        "title": "My Boss Thinks I am Working",
        "content": "Today was the longest meeting in the history of meetings. My boss started talking at 10 AM. It is now 1 PM and he has not stopped. I am sitting in the meeting room, nodding my head every few minutes. I have mastered the art of looking interested while thinking about what to have for dinner. My boss said, Does everyone understand? I nodded. Everyone nodded. Nobody understood anything. My colleague sitting next to me is also sleeping. But he is better at it than me. He props his head on his hand and looks like he is thinking deeply. I tried that technique. Then I started snoring. My boss looked at me. I quickly said, Yes, I agree with that point! He smiled and continued talking. The meeting finally ended at 1:30 PM. My boss said, Same time tomorrow. I wanted to cry. On my way out, my colleague said, That was a good meeting. I looked at him and said, What did we discuss? He said, I have no idea. Welcome to corporate life."
    },
    {
        "id": "r16",
        "title": "My First Salary",
        "content": "I still remember the day I got my first salary. It was 8,000 rupees. Not much for most people. But for me, it was everything. I was 20 years old, working as a junior accountant in a small firm in Jaipur. I had been working for three months. Every day I would take two buses to reach office, work for 9 hours, and come home late. When the salary came into my account, I checked my phone again and again. 8,000 rupees. I could not believe it. I had earned this money with my own hands. The first thing I did was go home. My mother was cooking dinner. I walked in and said, Maa, I got my salary. She turned around. Her eyes were shining. She did not say anything. She just held my face in her hands and looked at me. I could see tears in her eyes. Take 2,000 rupees and keep it for yourself, she said. You have earned it. I gave her 5,000 rupees. She tried to refuse, but I insisted. The remaining 1,000 I used to buy a new shirt for my father. That night, my mother told all the neighbors about my salary. She was so proud. I realized that money is not just about buying things. It is about taking care of the people you love. I earn much more now. But that first salary, that 8,000 rupees, will always be the most special money I have ever earned."
    },
    {
        "id": "r6",
        "title": "Two Strangers, One Bench",
        "content": "Every morning at 7 AM, Sunita sat on the same bench in the park. She drank her chai and watched the sun rise. She did this every day for three years. One morning, a man sat on the other end of the bench. He was old, maybe 65. He also had a cup of chai. They sat in silence. The next morning, he was there again. And the next. And the next. They never spoke. Just sat together, watching the sunrise. After two months, the man said, Good morning. Sunita smiled and said, Good morning. That was the start of something beautiful. They started talking every morning. He told her about his wife who had passed away. She told him about her loneliness after retirement. They became the best of friends. Every morning, same bench, same chai, same sunrise. One day, Sunita did not come. The man waited. She did not come the next day either. He was worried. On the third day, she came. She was crying. My son wants me to move to Delhi, she said. I do not want to go. The man held her hand and said, Then do not go. Some things are worth staying for. She stayed. And every morning, they still sit on that bench. Some friendships do not need words to begin. They just need time."
    },
    {
        "id": "r7",
        "title": "The Promise",
        "content": "Amit and Priya loved each other since college. But Amit got a job offer in London. He had to go. I will come back, he told her. Wait for me. Priya said, I will wait. But promise me you will not forget me. He promised. And he left. The first year was easy. They talked every day on video call. He sent her photos of London. She sent him photos of their favorite tea shop. The second year, the calls became shorter. He was busy. She was busy. But they still talked. The third year, he stopped calling. She waited. She did not call him. She wanted him to call first. The fourth year, she heard from a friend that Amit had a girlfriend in London. She cried for three days. Then she deleted his number. The fifth year, Amit came back. He stood outside her house with flowers. She opened the door. I made a mistake, he said. I should never have left. Priya looked at him. She was calm. You promised you would not forget me, she said. But you did. She closed the door. Amit stood there for one hour. Then he left. Some promises are broken not by forgetting, but by taking too long to keep."
    },
    {
        "id": "r9",
        "title": "The Last Message",
        "content": "Detective Roy received a text message at 11:47 PM. It said, If I do not wake up tomorrow, check the blue diary on my desk. The message was from Arjun Mehta, a famous businessman. The next morning, Arjun was found dead in his bedroom. The police said it was a heart attack. Case closed. But Detective Roy was not satisfied. He went to Arjun's office and found the blue diary. Inside, Arjun had written about his business partner, Vikram, who was stealing money from the company. Arjun had written, Vikram knows I will expose him. I am afraid of what he might do. The diary also mentioned that Vikram had hired someone to follow Arjun. Detective Roy showed the diary to the police. They agreed to investigate. They found that Vikram had been giving Arjun sleeping pills in his dinner for three months. The pills weakened his heart. Vikram was arrested. The diary was the key evidence. Detective Roy learned an important lesson. Sometimes the dead speak louder than the living. You just need to listen."
    },
    {
        "id": "r11",
        "title": "The 3 AM Rule",
        "content": "Raj read an article that said 90% of successful people wake up at 3 AM. He decided to try it. The first day, he woke up at 3 AM and sat on his bed. He did not know what to do. He made chai and drank it slowly. The second day, he woke up at 3 AM and went for a walk. The streets were empty. It was peaceful. The third day, he woke up at 3 AM and started working on his business plan. He had been putting it off for months. After one week of waking up at 3 AM, Raj had finished his business plan. He had exercised every morning. He had read 50 pages of a book. After one month, he had saved 10,000 rupees extra because he stopped buying evening snacks and coffee. He had lost 3 kg. He had read 4 books. After three months, Raj launched his business. It was a small food delivery service. Within six months, he had 200 customers. People asked him, Is the 3 AM rule real? He said, It does not matter if you wake up at 3 AM or 6 AM. What matters is what you do with that extra time. The secret is not the hour. It is the habit."
    },
    {
        "id": "r14",
        "title": "The Autowala Philosopher",
        "content": "I took an auto one day. The auto uncle asked, Where to? I told him the address. On the way, I was stressed about my job interview. I was thinking about all the questions they might ask. The auto uncle looked at me in the mirror and said, You look worried. I was surprised. How do you know? He said, I have been driving auto for 20 years. I can tell if someone is going to an interview, a wedding, or a hospital just by looking at their face. I laughed. So what do you think about my face? He said, You are going for a job interview. You are nervous. But you will be fine. How do you know I will be fine? He said, Because people who are nervous care about the job. People who do not care do not get nervous. That means you will prepare well. And preparation always works. I was shocked. This auto uncle gave me better advice than my coaching teacher. I asked, Uncle, have you ever failed an interview? He laughed and said, Beta, I have never given one. I am happy driving my auto. Not everyone needs a big office to be successful. I reached my destination. The fare was 50 rupees. I gave him 100 and said, Keep the change. You are the best teacher I have ever met. He smiled and said, Next time, take the bus. It is cheaper."
    },
    {
        "id": "r15",
        "title": "The Room Next Door",
        "content": "I moved into a new apartment last month. The building was old but the rent was cheap. My neighbor, Mr. Sharma, warned me about the room next to mine. That room has been empty for two years, he said. Nobody stays there for long. I did not believe in ghost stories. So I ignored him. The first week was fine. But on the eighth night, I heard crying. It was coming from the empty room next door. I put my ear to the wall. The crying was soft, like a woman. It stopped after ten minutes. The next night, the same thing. Crying at exactly 2 AM. I told Mr. Sharma. He said, That is why the room is empty. The previous tenant left because of this. I decided to investigate. I went to the building owner and asked for the key to the empty room. He gave me the key reluctantly. I opened the door. The room was dusty and dark. There was nothing inside. Just an old bed and a window. Then I noticed something. The window was slightly open. And from outside, I could hear someone crying. It was not coming from inside the room. It was coming from the apartment below. The sound was traveling up through the open window. I went downstairs and knocked on the door. A young woman opened it. She was crying because she had just broken up with her boyfriend. She cried every night at 2 AM. I felt relieved and sad at the same time. Relieved that there were no ghosts. Sad that someone was crying alone every night. I brought her some chai the next night. We became friends. Sometimes the scariest things have the simplest explanations."
    },
    {
        "id": "r17",
        "title": "The Bus Stop Friend",
        "content": "Every day at 8:15 AM, Rahul waited for the bus at the same stop. And every day, a girl named Sneha also waited there. They never spoke. Rahul wanted to talk to her. But he was shy. He thought, What if she thinks I am weird? So he just stood there, looking at his phone, pretending he was busy. This went on for four months. One rainy day, the bus was late. They both stood under the small shelter. Sneha was getting wet because the shelter was too small for two people. Without thinking, Rahul held his umbrella over her. She looked at him and smiled. Thank you, she said. You are very kind. He smiled back and said, I should have done this four months ago. She laughed. Four months? I have been waiting for you to say something since the first day. Rahul was shocked. Really? She said, Yes. I thought you did not like me. He said, I was just scared. She said, Scared of what? He said, Scared that you would say no. She smiled and said, Well, now you know. The answer is yes. The bus came. They both got on. And from that day, they always sat together. Sometimes all you need is one rainy day and one brave moment."
    },
    {
        "id": "r18",
        "title": "The Teacher Who Changed 1000 Lives",
        "content": "Suman was a teacher in a village school in UP. She earned 5,000 rupees per month. She taught Hindi and Maths. One day, she noticed that her students could not read English textbooks. They would copy the English words without understanding them. She decided to teach them English. But she did not know English herself. So she bought an English dictionary and started learning. Every night, after teaching all day, she would study English for two hours. She learned 10 words every day. She practiced speaking to herself in the mirror. After six months, she could speak basic English. She started teaching her students. She made English fun. She taught them through songs and stories. Her students loved it. They learned fast. Within one year, 50 of her students could speak English. Other teachers came to learn from her. She taught them too. Within three years, she had trained 20 teachers. Those 20 teachers taught 1000 students. Today, Suman earns 25,000 rupees per month. She has been featured in newspapers. But she still teaches in the same village school. When a reporter asked her, Why do you stay in this village? You could earn more in the city. She said, Because every child here deserves to learn English. Money is not everything. Changing lives is everything. One teacher, one village, 1000 lives changed. That is the power of dedication."
    },
]

# ── TTS FUNCTION ────────────────────────────────────────────────────────────

def tts(text, output_path):
    """Call Sarvam AI TTS API. Auto-rotates keys on 402 quota errors."""
    global current_key_index
    
    # Split long text into chunks (Sarvam has a character limit)
    max_chunk = 480
    chunks = []
    sentences = text.split('. ')
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 2 > max_chunk:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "
        else:
            current_chunk += sentence + ". "
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    if not chunks:
        chunks = [text[:max_chunk]]
    
    # Generate audio for each chunk and concatenate
    chunk_files = []
    for i, chunk in enumerate(chunks):
        chunk_path = f"{output_path}.chunk{i}.mp3"
        
        for attempt in range(4):
            api_key = get_api_key()
            if not api_key:
                print("  ❌ All API keys exhausted!")
                return 0
            
            payload = json.dumps({
                "inputs": [chunk],
                "model": MODEL,
                "language_code": LANGUAGE,
                "speaker": SPEAKER,
                "pace": 0.95,
                "output_audio_codec": "mp3",
                "speech_sample_rate": SAMPLE_RATE,
            }).encode()
            
            try:
                req = urllib.request.Request(
                    BASE_URL,
                    data=payload,
                    headers={
                        "api-subscription-key": api_key,
                        "Content-Type": "application/json",
                    },
                )
                with urllib.request.urlopen(req, timeout=60) as resp:
                    result = json.loads(resp.read())
                    if 'audios' in result and result['audios']:
                        audio_data = base64.b64decode(result['audios'][0])
                    elif 'audio' in result:
                        audio_data = base64.b64decode(result['audio'])
                    else:
                        print(f"  ❌ No audio in response")
                        continue
                    with open(chunk_path, "wb") as f:
                        f.write(audio_data)
                    chunk_files.append(chunk_path)
                    time.sleep(DELAY)
                    break
            except urllib.error.HTTPError as e:
                if e.code == 402:
                    print(f"  ⚠️ Quota exhausted on key #{current_key_index + 1}")
                    if not rotate_key():
                        return 0
                else:
                    print(f"  ❌ API error {e.code}: {e.reason}")
                    if attempt < 3:
                        time.sleep(5)
                    else:
                        return 0
            except Exception as e:
                print(f"  ❌ Error: {e}")
                if attempt < 3:
                    time.sleep(5)
                else:
                    return 0
    
    # Concatenate chunks using ffmpeg or just use the first chunk for simplicity
    if len(chunk_files) == 1:
        os.rename(chunk_files[0], output_path)
    else:
        # Simple concatenation: write all audio data to one file
        with open(output_path, "wb") as outf:
            for cf in chunk_files:
                with open(cf, "rb") as inf:
                    outf.write(inf.read())
                os.remove(cf)
    
    return os.path.getsize(output_path) if os.path.exists(output_path) else 0

# ── MAIN ────────────────────────────────────────────────────────────────────

def main():
    base_dir = Path(__file__).resolve().parent.parent
    audio_dir = base_dir / "public" / "audio" / "reading"
    audio_dir.mkdir(parents=True, exist_ok=True)
    
    if not API_KEYS or API_KEYS == [""]:
        print("❌ No API keys configured!")
        print("Edit scripts/gen_reading_audio.py and add your Sarvam AI API keys to API_KEYS list.")
        print("Get keys from: https://sarvam.ai")
        return
    
    # Parse args
    args = sys.argv[1:]
    target_id = None
    list_mode = False
    
    if "--list" in args:
        list_mode = True
    elif "--id" in args:
        idx = args.index("--id")
        if idx + 1 < len(args):
            target_id = args[idx + 1]
    
    if list_mode:
        print("\n📖 Reading Articles:")
        for a in ARTICLES:
            mp3_path = audio_dir / f"{a['id']}.mp3"
            status = "✅" if mp3_path.exists() else "❌"
            size = f" ({mp3_path.stat().st_size // 1024}KB)" if mp3_path.exists() else ""
            print(f"  {status} {a['id']}: {a['title']}{size}")
        return
    
    # Filter articles
    articles = ARTICLES
    if target_id:
        articles = [a for a in ARTICLES if a["id"] == target_id]
        if not articles:
            print(f"❌ Article '{target_id}' not found")
            return
    
    print(f"\n🎙️ SunoBolo — Reading Audio Generator")
    print(f"   Voice: Sarvam AI ({SPEAKER}, {MODEL})")
    print(f"   Language: {LANGUAGE}")
    print(f"   Output: {audio_dir}")
    print(f"   Articles: {len(articles)}")
    print()
    
    generated = 0
    skipped = 0
    errors = 0
    
    for article in articles:
        output_path = str(audio_dir / f"{article['id']}.mp3")
        
        # Skip if already exists
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            print(f"  ⏭️ {article['id']}: {article['title']} (already exists)")
            skipped += 1
            continue
        
        print(f"  🎧 {article['id']}: {article['title']}...")
        size = tts(article["content"], output_path)
        
        if size > 0:
            print(f"     ✅ Generated ({size // 1024}KB)")
            generated += 1
        else:
            print(f"     ❌ Failed")
            errors += 1
    
    print(f"\n📊 Results: {generated} generated, {skipped} skipped, {errors} errors")
    print(f"📁 Audio files: {audio_dir}")

if __name__ == "__main__":
    main()
