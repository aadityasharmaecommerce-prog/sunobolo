"""Fast Viraj replacement with multiple API keys auto-rotate"""
import os, sys, io, json, base64, urllib.request, urllib.error, time, datetime

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_oj0rgnfu_kAGUF4P1ynTGKbxnELLWCWit",
    "sk_h4hrzfb1_Wu0kSeWzDS2Ka0G5k3xLbu4s",
]
current_key_idx = 0

BASE_URL = "https://api.sarvam.ai/text-to-speech"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(PROJECT, 'public', 'audio')
DB_FILE = os.path.join(PROJECT, 'scripts', 'sentences_db.json')
LOG_FILE = os.path.join(PROJECT, 'scripts', 'replace_output.log')

log = open(LOG_FILE, 'a', encoding='utf-8')
def logprint(msg):
    print(msg, flush=True)
    log.write(msg + '\n')
    log.flush()

logprint("=" * 50)
logprint("Starting Viraj replacement with auto-rotate keys")

with open(DB_FILE, 'r', encoding='utf-8') as f:
    db = json.load(f)

CUTOFF = datetime.datetime(2026, 8, 21, 0, 0, 0).timestamp()
old_files = []
for root, dirs, files in os.walk(AUDIO_DIR):
    for f in files:
        if not f.endswith('.mp3') or '.hindi.' in f:
            continue
        fp = os.path.join(root, f)
        if os.path.getmtime(fp) < CUTOFF:
            sid = f.replace('.mp3', '')
            if sid in db:
                old_files.append({
                    'path': fp,
                    'sid': sid,
                    'text': db[sid]['en'],
                })

logprint(f"Found {len(old_files)} old files to replace")

def tts(text, lang_code, output_path):
    global current_key_idx
    for attempt in range(len(API_KEYS)):
        api_key = API_KEYS[current_key_idx]
        payload = {
            "inputs": [text],
            "model": "bulbul:v3",
            "language_code": lang_code,
            "speaker": "shubh",
            "pace": 0.95,
            "output_audio_codec": "mp3",
            "speech_sample_rate": 22050,
        }
        data = json.dumps(payload).encode()
        req = urllib.request.Request(BASE_URL, data=data, headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json",
        })
        try:
            resp = urllib.request.urlopen(req, timeout=30)
            result = json.loads(resp.read())
            if "audios" in result and result["audios"]:
                audio_bytes = base64.b64decode(result["audios"][0])
                with open(output_path, "wb") as f:
                    f.write(audio_bytes)
                return len(audio_bytes)
            return 0
        except urllib.error.HTTPError as e:
            if e.code == 402:
                logprint(f"  Key {current_key_idx+1} exhausted, switching...")
                current_key_idx += 1
                if current_key_idx >= len(API_KEYS):
                    logprint("  ALL KEYS EXHAUSTED!")
                    return -1
                time.sleep(1)
            else:
                raise
    return -1

replaced = 0
errors = 0

for i, item in enumerate(old_files):
    if current_key_idx >= len(API_KEYS):
        logprint("All keys exhausted, stopping.")
        break

    try:
        new_size = tts(item['text'], "en-IN", item['path'])
        if new_size == -1:
            logprint("All keys exhausted, stopping.")
            break
        replaced += 1
        if replaced % 10 == 0:
            remaining = len(old_files) - i - 1
            logprint(f"  Progress: {replaced}/{len(old_files)} done, {remaining} remaining, {errors} errors")
        time.sleep(0.15)
    except Exception as e:
        errors += 1
        if errors <= 5:
            logprint(f"  Error {item['sid']}: {e}")
        time.sleep(2)

logprint(f"\n{'='*50}")
logprint(f"DONE - Replaced: {replaced} | Errors: {errors}")
logprint(f"Total: {len(old_files)}")
log.close()
