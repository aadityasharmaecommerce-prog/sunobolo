"""Generate free-trial-001 audio with Sarvam AI."""
import sys, io, json, base64, urllib.request, urllib.error, time

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

API_KEY = "sk_u5xlyvf7_jNrIDvSNsdECouLRkvVMA7bB"
AUDIO_DIR = "E:/suno bolo english 2/sunobolo-voice-fix (1)/sunobolo/sunobolo/public/audio/free-trial"

def generate_sarvam(text, speaker="shubh"):
    payload = json.dumps({
        'text': text,
        'target_language_code': 'hi-IN',
        'speaker': speaker,
        'model': 'bulbul:v3',
        'audio_format': 'mp3',
        'sample_rate': 24000
    }).encode('utf-8')
    
    req = urllib.request.Request('https://api.sarvam.ai/text-to-speech', data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('api-subscription-key', API_KEY)
    
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read())
        # New API returns 'audios' (list), old returns 'audio' (string)
        if 'audios' in data and data['audios']:
            return base64.b64decode(data['audios'][0])
        if 'audio' in data:
            return base64.b64decode(data['audio'])
        raise Exception(f"No audio in response: {list(data.keys())}")

# Generate EN audio
print("Generating EN: I can understand English, but I can't speak it confidently.")
en_audio = generate_sarvam("I can understand English, but I can't speak it confidently.")
with open(f"{AUDIO_DIR}/free-trial-001.mp3", 'wb') as f:
    f.write(en_audio)
print(f"  OK EN saved: {len(en_audio)} bytes")

time.sleep(2)

# Generate HI audio
print("Generating HI: muZhe angRejI samajh AawI hE, par maiM AawmavishvAs se bol nahIM pAwA.")
hi_audio = generate_sarvam("मुजे अंग्रेजी समझ आती है, पर मैं आत्मविश्वास से बोल नहीं पाता।")
with open(f"{AUDIO_DIR}/free-trial-001.hindi.mp3", 'wb') as f:
    f.write(hi_audio)
print(f"  OK HI saved: {len(hi_audio)} bytes")

print("\nDone!")
