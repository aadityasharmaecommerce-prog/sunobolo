"""Generate Sarvam AI premium Hindi audio for all 25 free trial sentences.
Also generates the repeat-instruction audio.
Uses auto-rotate API keys.
"""
import sys, io, json, base64, urllib.request, urllib.error, time, os

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_u5xlyvf7_jNrIDvSNsdECouLRkvVMA7bB",
    "sk_oj0rgnfu_kAGUF4P1ynTGKbxnELLWCWit",
    "sk_h4hrzfb1_Wu0kSeWzDS2Ka0G5k3xLbu4s",
    "sk_7hnxnfa8_aCZXakIRdmzzl5UvNAZmSUQq",
    "sk_6vaspuhz_r3t0NExW40dlkX606rOiUegO",
    "sk_aypv66s0_kyF2lcPIL7tJR4vIeU08ukcw",
    "sk_dj45kyhu_LDYi5ATUyWVREZVBbBP4f0Ve",
    "sk_ug71kkih_yaglF1CDt85o68KU1CyYVr7U",
]
current_key_idx = 0
AUDIO_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/free-trial"
SHARED_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/shared"
HINDI_PREFIX = "मतलब"

# All 25 free trial sentences
SENTENCES = [
    ("free-trial-001", "I can understand English, but I can't speak it confidently.", "मुझे अंग्रेज़ी समझ आती है, पर मैं आत्मविश्वास से बोल नहीं पाता।"),
    ("free-trial-002", "My name is Priya. What is your name?", "मेरा नाम प्रिया है। आपका नाम क्या है?"),
    ("free-trial-003", "I am from India. Where are you from?", "मैं भारत से हूँ। आप कहाँ से हैं?"),
    ("free-trial-004", "I wake up at 6 o'clock every day.", "मैं हर दिन 6 बजे उठता हूँ।"),
    ("free-trial-005", "Can you please call me later?", "क्या आप मुझे बाद में कॉल कर सकते हैं?"),
    ("free-trial-006", "How much does this cost?", "इसकी कीमत कितनी है?"),
    ("free-trial-007", "I'm sorry, I'm running late.", "माफ़ कीजिए, मुझे देर हो रही है।"),
    ("free-trial-008", "Could you please help me with this?", "क्या आप इसमें मेरी मदद कर सकते हैं?"),
    ("free-trial-009", "I don't understand. Can you repeat?", "मुझे समझ नहीं आया। क्या आप दोहरा सकते हैं?"),
    ("free-trial-010", "What are your plans for the weekend?", "आपके वीकेंड के क्या प्लान हैं?"),
    ("free-trial-011", "I work in an office. What do you do?", "मैं ऑफिस में काम करता हूँ। आप क्या करते हैं?"),
    ("free-trial-012", "Where is the nearest bus stop?", "सबसे नज़दीकी बस स्टॉप कहाँ है?"),
    ("free-trial-013", "My internet connection is not working.", "मेरा इंटरनेट काम नहीं कर रहा है।"),
    ("free-trial-014", "Thank you so much for your help!", "आपकी मदद के लिए बहुत धन्यवाद!"),
    ("free-trial-015", "Excuse me, can you tell me the time?", "क्षमा करें, क्या आप मुझे समय बता सकते हैं?"),
    ("free-trial-016", "I am learning English. It is very useful.", "मैं अंग्रेज़ी सीख रहा हूँ। यह बहुत उपयोगी है।"),
    ("free-trial-017", "Let's meet at the coffee shop at 4.", "चलिए 4 बजे कॉफ़ी शॉप पर मिलते हैं।"),
    ("free-trial-018", "The traffic is very heavy today.", "आज ट्रैफ़िक बहुत ज़्यादा है।"),
    ("free-trial-019", "Have a great day!", "आपका दिन शुभ हो!"),
    ("free-trial-020", "Do you have this in a smaller size?", "क्या यह छोटे साइज़ में है?"),
    ("free-trial-021", "I need to book a hotel room for two nights.", "मुझे दो रात के लिए होटल का कमरा बुक करना है।"),
    ("free-trial-022", "I ordered a product but it hasn't arrived yet.", "मैंने प्रोडक्ट ऑर्डर किया था लेकिन अभी तक नहीं आया।"),
    ("free-trial-023", "I'll call you back in five minutes.", "मैं पाँच मिनट में वापस कॉल करूँगा।"),
    ("free-trial-024", "I have a meeting at 10 AM tomorrow.", "मेरी कल सुबह 10 बजे मीटिंग है।"),
    ("free-trial-025", "Nice to meet you!", "आपसे मिलकर खुशी हुई!"),
]

def get_api_key():
    global current_key_idx
    return API_KEYS[current_key_idx % len(API_KEYS)]

def rotate_key():
    global current_key_idx
    current_key_idx += 1
    if current_key_idx >= len(API_KEYS):
        current_key_idx = 0
    print(f"  Rotating to API key index {current_key_idx}")

def generate_sarvam(text, speaker="shubh", lang="hi-IN"):
    for attempt in range(3):
        api_key = get_api_key()
        payload = json.dumps({
            'text': text,
            'target_language_code': lang,
            'speaker': speaker,
            'model': 'bulbul:v3',
            'audio_format': 'mp3',
            'sample_rate': 24000
        }).encode('utf-8')
        
        req = urllib.request.Request('https://api.sarvam.ai/text-to-speech', data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('api-subscription-key', api_key)
        
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                data = json.loads(res.read())
                if 'audios' in data and data['audios']:
                    return base64.b64decode(data['audios'][0])
                if 'audio' in data:
                    return base64.b64decode(data['audio'])
                raise Exception(f"No audio in response: {list(data.keys())}")
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            if e.code == 429 or 'rate' in body.lower() or 'limit' in body.lower() or 'credit' in body.lower() or 'quota' in body.lower():
                print(f"    Key exhausted (HTTP {e.code}), rotating...")
                rotate_key()
                time.sleep(2)
                continue
            raise
    raise Exception("All API keys exhausted or failed")

def main():
    total = len(SENTENCES)
    success = 0
    skipped = 0
    failed = 0
    results = []
    
    print(f"=== Generating {total} Hindi audio files + instruction ===")
    print(f"API Keys available: {len(API_KEYS)}")
    print()
    
    # Generate instruction audio first
    print("[INSTRUCTION] मेरे साथ 3 बार रिपीट करो।")
    try:
        audio = generate_sarvam("मेरे साथ 3 बार रिपीट करो।", speaker="shubh")
        path = f"{SHARED_DIR}/repeat-instruction.mp3"
        with open(path, 'wb') as f:
            f.write(audio)
        print(f"  OK: {len(audio)} bytes -> {path}")
        success += 1
    except Exception as e:
        print(f"  FAILED: {e}")
        failed += 1
    time.sleep(2)
    
    for i, (sid, en, hi) in enumerate(SENTENCES):
        print(f"[{i+1}/{total}] {sid}")
        
        # Hindi audio with "मतलब" prefix
        hi_text = f"{HINDI_PREFIX} {hi}"
        print(f"  HI: {hi_text[:60]}...")
        try:
            audio = generate_sarvam(hi_text, speaker="shubh")
            path = f"{AUDIO_DIR}/{sid}.hindi.mp3"
            with open(path, 'wb') as f:
                f.write(audio)
            print(f"  OK HI: {len(audio)} bytes -> {path}")
            success += 1
            results.append({"id": sid, "type": "hindi", "status": "ok", "size": len(audio)})
        except Exception as e:
            print(f"  FAILED HI: {e}")
            failed += 1
            results.append({"id": sid, "type": "hindi", "status": "failed", "error": str(e)})
        
        time.sleep(2)  # Rate limit
    
    print(f"\n=== SUMMARY ===")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    print(f"Total: {success + failed}")
    
    # Save results
    with open(f"{AUDIO_DIR}/../trial_hindi_results.json", 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to trial_hindi_results.json")

if __name__ == '__main__':
    main()
