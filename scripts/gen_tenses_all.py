"""Generate ALL Tenses audio files using Sarvam AI.
192 English forms + 192 Hindi forms = 384 MP3 files.
Auto-rotates through multiple API keys when credits exhaust.
"""
import sys, io, json, base64, urllib.request, urllib.error, time, os, re

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
    "sk_759jdxj6_L0zU8eUf2uAmkGCLCvks2rtW",
]
current_key_idx = 0
AUDIO_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/tenses"
TENSES_FILE = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/src/data/tenses.ts"
HINDI_PREFIX = "मतलब"
STATE_FILE = os.path.join(AUDIO_DIR, "_gen_state.json")

def get_api_key():
    global current_key_idx
    return API_KEYS[current_key_idx % len(API_KEYS)]

def rotate_key():
    global current_key_idx
    current_key_idx += 1
    if current_key_idx >= len(API_KEYS):
        current_key_idx = 0
    print(f"  >> Rotating to key index {current_key_idx}")

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
                raise Exception(f"No audio: {list(data.keys())}")
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='replace')
            if e.code == 429 or any(w in body.lower() for w in ['rate', 'limit', 'credit', 'quota', 'exceeded']):
                print(f"    Key exhausted (HTTP {e.code}), rotating...")
                rotate_key()
                time.sleep(2)
                continue
            raise Exception(f"HTTP {e.code}: {body[:200]}")
    raise Exception("All keys exhausted")

def parse_tenses():
    """Parse tenses.ts to extract all 192 forms."""
    with open(TENSES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    forms = []
    form_short = {'affirmative': 'aff', 'negative': 'neg', 'interrogative': 'int', 'whyQuestion': 'wq'}
    
    # Actual format per example block:
    #   id: 'sp-1', label: 'Eat food',
    #   affirmative: { en: 'I eat food.', hi: 'मैं खाना खाता हूँ।' },
    #   negative: { en: 'I do not eat food.', hi: 'मैं खाना नहीं खाता।' },
    #   interrogative: { en: 'Do I eat food?', hi: 'क्या मैं खाना खाता हूँ?' },
    #   whyQuestion: { en: 'Why do I eat food?', hi: 'मैं खाना क्यों खाता हूँ?' },
    
    # Find each example by its id
    example_ids = re.findall(r"id:\s*'([^']+)',\s*label:", content)
    
    for ex_id in example_ids:
        # Extract the block for this example (until next id: or end of examples array)
        pattern = rf"id:\s*'{re.escape(ex_id)}'.*?affirmative:\s*\{{\s*en:\s*'([^']+)',\s*hi:\s*'([^']+)'\s*\}}.*?negative:\s*\{{\s*en:\s*'([^']+)',\s*hi:\s*'([^']+)'\s*\}}.*?interrogative:\s*\{{\s*en:\s*'([^']+)',\s*hi:\s*'([^']+)'\s*\}}.*?whyQuestion:\s*\{{\s*en:\s*'([^']+)',\s*hi:\s*'([^']+)'\s*\}}"
        m = re.search(pattern, content, re.DOTALL)
        if not m:
            print(f"  WARNING: Could not parse {ex_id}")
            continue
        
        pairs = [
            ('affirmative', m.group(1), m.group(2)),
            ('negative', m.group(3), m.group(4)),
            ('interrogative', m.group(5), m.group(6)),
            ('whyQuestion', m.group(7), m.group(8)),
        ]
        
        for ftype, en_text, hi_text in pairs:
            forms.append({
                'id': f"{ex_id}-{form_short[ftype]}",
                'filename': f"{ex_id}-{form_short[ftype]}.mp3",
                'text': en_text,
                'lang': 'en-IN',
                'type': 'en',
            })
            forms.append({
                'id': f"{ex_id}-{form_short[ftype]}-hi",
                'filename': f"{ex_id}-{form_short[ftype]}.hindi.mp3",
                'text': f"{HINDI_PREFIX} {hi_text}",
                'lang': 'hi-IN',
                'type': 'hi',
            })
    
    return forms

def load_state():
    try:
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    except:
        return {'completed': [], 'failed': []}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    forms = parse_tenses()
    print(f"Total audio files to generate: {len(forms)}")
    
    state = load_state()
    completed = set(state.get('completed', []))
    
    remaining = [f for f in forms if f['id'] not in completed]
    print(f"Already completed: {len(completed)}")
    print(f"Remaining: {len(remaining)}")
    
    if not remaining:
        print("All done!")
        return
    
    success = 0
    failed = 0
    
    for i, form in enumerate(remaining):
        print(f"\n[{i+1}/{len(remaining)}] {form['id']} ({form['type']})")
        print(f"  Text: {form['text'][:70]}...")
        
        try:
            audio = generate_sarvam(form['text'], speaker="shubh", lang=form['lang'])
            path = os.path.join(AUDIO_DIR, form['filename'])
            with open(path, 'wb') as f:
                f.write(audio)
            print(f"  OK: {len(audio)} bytes -> {form['filename']}")
            success += 1
            completed.add(form['id'])
        except Exception as e:
            print(f"  FAILED: {e}")
            failed += 1
            state['failed'].append({'id': form['id'], 'error': str(e)})
        
        if (i + 1) % 10 == 0:
            state['completed'] = list(completed)
            save_state(state)
            print(f"  [State saved: {len(completed)} completed]")
        
        time.sleep(2)
    
    state['completed'] = list(completed)
    save_state(state)
    
    print(f"\n=== SUMMARY ===")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    print(f"Total completed: {len(completed)}/{len(forms)}")

if __name__ == '__main__':
    main()
