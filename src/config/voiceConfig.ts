/**
 * SunoBolo — ONE central voice configuration for the ENTIRE guided flow.
 *
 * PRIMARY: ElevenLabs (human-like quality)
 *   - Voice: Rachel (natural, friendly, clear)
 *   - Model: eleven_multilingual_v2 (supports English + Hindi)
 *   - Generated via: scripts/generate_elevenlabs.py
 *
 * FALLBACK: edge-tts (free, decent quality)
 *   - Voice: hi-IN-SwaraNeural (Microsoft Azure)
 *   - Generated via: scripts/regenerate_voice.py
 *
 * Both options use ONE voice for the entire guided flow:
 *   English → Hindi → Instruction → 3× Repetitions
 *
 * The same voice reads Devanagari AND English — ONE teacher throughout.
 */

export const PRACTICE_VOICE = {
  /** Primary: ElevenLabs voice name (for reference). */
  elevenLabsVoice: 'Rachel',
  /** Fallback: edge-tts voice ID. */
  edgeTtsVoiceId: 'hi-IN-SwaraNeural',
  /** Locale labels (used for reporting + fallback lang hints only). */
  englishLocale: 'en-IN',
  hindiLocale: 'hi-IN',
} as const;

/**
 * Centralized timing for the guided practice flow.
 * All values in milliseconds. Adjust these to change pacing globally.
 *
 * Flow: English → (pause) → Hindi → (pause) → Instruction → (pause) → Rep×3
 */
export const PRACTICE_TIMING = {
  /** Pause after English finishes, before Hindi starts. */
  englishToHindi: 1500,
  /** Pause after Hindi finishes, before instruction starts. */
  hindiToInstruction: 1500,
  /** Pause after instruction finishes, before first repetition starts. */
  instructionToRepeat: 2000,
  /** Pause between repetitions (repeat N → repeat N+1). */
  betweenRepeats: 2500,
} as const;

/**
 * Speech rate for TTS fallback.
 * 0.82 = clear, natural, patient teacher-like speed.
 * Range: 0.80–0.85 acceptable.
 */
export const SPEECH_RATE = 0.82;

/** Instruction phrase spoken after the Hindi meaning (same voice). */
export const REPEAT_INSTRUCTION_TEXT = 'मेरे साथ 3 बार रिपीट करो।';

/** Hindi meaning prefix spoken before the meaning (same voice). */
export const HINDI_MEANING_PREFIX = 'मतलब';

/**
 * Deterministic cache-busting version for all audio URLs.
 * Bump this number whenever ANY audio file is regenerated — it forces
 * browsers, proxies and CDN edge caches to fetch the new assets instead
 * of serving stale MP3s (the classic "old audio keeps playing" bug).
 *
 * Bump to '5' after regenerating with ElevenLabs.
 */
export const AUDIO_VERSION = '5';

const withVersion = (path: string): string => `${path}?v=${AUDIO_VERSION}`;

/** Static MP3 paths — all pre-generated with the same voice. */
export const AUDIO_PATHS = {
  /** English sentence MP3 (sentence→file mapping unchanged). */
  english: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.mp3`),
  /** Hindi meaning MP3 — same voice as the English MP3. */
  hindi: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.hindi.mp3`),
  /** Instruction MP3 — same voice as everything else. */
  instruction: withVersion('/audio/shared/repeat-instruction.mp3'),
} as const;

/**
 * Browser TTS fallback: pick ONE single voice and use it for EVERY language.
 * Prefers a hi-IN voice (bilingual — reads English with a natural Indian
 * accent), so even the fallback keeps English + Hindi + instruction as ONE
 * speaker. We deliberately do NOT pick a separate voice for English text.
 */
let cachedVoice: SpeechSynthesisVoice | null | undefined;

export function pickPracticeVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  cachedVoice = null;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoice =
        voices.find((v) => v.lang?.toLowerCase().startsWith('hi-in')) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith('hi')) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith('en-in')) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
        voices[0] ??
        null;
    }
  }
  return cachedVoice;
}

/** Invalidate the cached browser voice (call on `voiceschanged`). */
export function resetPracticeVoiceCache(): void {
  cachedVoice = undefined;
}
