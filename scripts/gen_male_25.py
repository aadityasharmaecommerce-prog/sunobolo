#!/usr/bin/env python3
"""
Generate 25 free trial sentences with natural male voices.
English: en-IN-PrabhatNeural (Indian English Male, Friendly)
Hindi:   hi-IN-MadhurNeural  (Hindi Male, Friendly)

Uses edge-tts (Microsoft Azure) — free, high quality.
"""

import os
import sys
import asyncio
import time
from pathlib import Path

try:
    import edge_tts
except ImportError:
    os.system("pip install edge-tts")
    import edge_tts

# ─── Voice Config ──────────────────────────────────────────────────────
EN_VOICE = "en-IN-PrabhatNeural"   # Indian English Male
HI_VOICE = "hi-IN-MadhurNeural"    # Hindi Male
EN_RATE = "-12%"   # Slightly slower for clarity
HI_RATE = "-8%"    # Slightly slower for Hindi

# ─── 25 Free Trial Sentences ───────────────────────────────────────────
SENTENCES = [
    {"id": "free-trial-001", "english": "Good morning. How are you?", "hindi": "सुप्रभात। आप कैसे हैं?"},
    {"id": "free-trial-002", "english": "My name is Priya. What is your name?", "hindi": "मेरा नाम प्रिया है। आपका नाम क्या है?"},
    {"id": "free-trial-003", "english": "I am from India. Where are you from?", "hindi": "मैं भारत से हूँ। आप कहाँ से हैं?"},
    {"id": "free-trial-004", "english": "I wake up at 6 o'clock every day.", "hindi": "मैं हर दिन 6 बजे उठता हूँ।"},
    {"id": "free-trial-005", "english": "Can you please call me later?", "hindi": "क्या आप मुझे बाद में कॉल कर सकते हैं?"},
    {"id": "free-trial-006", "english": "How much does this cost?", "hindi": "इसकी कीमत कितनी है?"},
    {"id": "free-trial-007", "english": "I'm sorry, I'm running late.", "hindi": "माफ़ कीजिए, मुझे देर हो रही है।"},
    {"id": "free-trial-008", "english": "Could you please help me with this?", "hindi": "क्या आप इसमें मेरी मदद कर सकते हैं?"},
    {"id": "free-trial-009", "english": "I don't understand. Can you repeat?", "hindi": "मुझे समझ नहीं आया। क्या आप दोहरा सकते हैं?"},
    {"id": "free-trial-010", "english": "What are your plans for the weekend?", "hindi": "आपके वीकेंड के क्या प्लान हैं?"},
    {"id": "free-trial-011", "english": "I work in an office. What do you do?", "hindi": "मैं ऑफिस में काम करता हूँ। आप क्या करते हैं?"},
    {"id": "free-trial-012", "english": "Where is the nearest bus stop?", "hindi": "सबसे नज़दीकी बस स्टॉप कहाँ है?"},
    {"id": "free-trial-013", "english": "My internet connection is not working.", "hindi": "मेरा इंटरनेट काम नहीं कर रहा है।"},
    {"id": "free-trial-014", "english": "Thank you so much for your help!", "hindi": "आपकी मदद के लिए बहुत धन्यवाद!"},
    {"id": "free-trial-015", "english": "Excuse me, can you tell me the time?", "hindi": "क्षमा करें, क्या आप मुझे समय बता सकते हैं?"},
    {"id": "free-trial-016", "english": "I am learning English. It is very useful.", "hindi": "मैं अंग्रेज़ी सीख रहा हूँ। यह बहुत उपयोगी है।"},
    {"id": "free-trial-017", "english": "Let's meet at the coffee shop at 4.", "hindi": "चलिए 4 बजे कॉफ़ी शॉप पर मिलते हैं।"},
    {"id": "free-trial-018", "english": "The traffic is very heavy today.", "hindi": "आज ट्रैफ़िक बहुत ज़्यादा है।"},
    {"id": "free-trial-019", "english": "Have a great day!", "hindi": "आपका दिन शुभ हो!"},
    {"id": "free-trial-020", "english": "Do you have this in a smaller size?", "hindi": "क्या यह छोटे साइज़ में है?"},
    {"id": "free-trial-021", "english": "I need to book a hotel room for two nights.", "hindi": "मुझे दो रात के लिए होटल का कमरा बुक करना है।"},
    {"id": "free-trial-022", "english": "I ordered a product but it hasn't arrived yet.", "hindi": "मैंने प्रोडक्ट ऑर्डर किया था लेकिन अभी तक नहीं आया।"},
    {"id": "free-trial-023", "english": "I'll call you back in five minutes.", "hindi": "मैं पाँच मिनट में वापस कॉल करूँगा।"},
    {"id": "free-trial-024", "english": "I have a meeting at 10 AM tomorrow.", "hindi": "मेरी कल सुबह 10 बजे मीटिंग है।"},
    {"id": "free-trial-025", "english": "Nice to meet you!", "hindi": "आपसे मिलकर खुशी हुई!"},
]

async def generate_audio(text, voice, rate, output_path):
    """Generate a single audio file using edge-tts."""
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(output_path))

def main():
    audio_dir = Path(__file__).parent.parent / "public" / "audio" / "free-trial"
    audio_dir.mkdir(parents=True, exist_ok=True)

    total = len(SENTENCES)
    success = 0

    for i, sentence in enumerate(SENTENCES):
        sid = sentence["id"]

        # English audio
        en_path = audio_dir / f"{sid}.mp3"
        try:
            asyncio.run(generate_audio(sentence["english"], EN_VOICE, EN_RATE, en_path))
            en_size = en_path.stat().st_size
            print(f"  [{i+1}/{total}] EN  {sid}  ({en_size} bytes)  \"{sentence['english'][:50]}\"")
            success += 1
        except Exception as e:
            print(f"  [{i+1}/{total}] EN  {sid}  FAILED: {e}")

        # Hindi audio
        hi_path = audio_dir / f"{sid}.hindi.mp3"
        try:
            asyncio.run(generate_audio(sentence["hindi"], HI_VOICE, HI_RATE, hi_path))
            hi_size = hi_path.stat().st_size
            print(f"  [{i+1}/{total}] HI  {sid}  ({hi_size} bytes)  \"{sentence['hindi'][:50]}\"")
        except Exception as e:
            print(f"  [{i+1}/{total}] HI  {sid}  FAILED: {e}")

        time.sleep(0.2)

    print(f"\nDone! {success}/{total} English + {total} Hindi files generated.")
    print(f"Output: {audio_dir}")

if __name__ == "__main__":
    main()
