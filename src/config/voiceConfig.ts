/**
 * SunoBolo — ONE central voice configuration for the ENTIRE guided flow.
 *
 * PRIMARY: edge-tts with male Indian voices
 *   - English: en-IN-PrabhatNeural (Indian English Male, Friendly, Positive)
 *   - Hindi: hi-IN-MadhurNeural (Hindi Male, Friendly, Positive)
 *   - Generated via: scripts/gen_male_25.py
 *
 * FALLBACK: browser SpeechSynthesis
 *
 * Both options use ONE voice for the entire guided flow:
 *   English → Hindi → Instruction → 3× Repetitions
 */

export const PRACTICE_VOICE = {
  /** Primary English voice (edge-tts). */
  edgeTtsVoiceId: 'en-IN-PrabhatNeural',
  /** Primary Hindi voice (edge-tts). */
  edgeTtsHindiVoiceId: 'hi-IN-MadhurNeural',
  /** Locale labels. */
  englishLocale: 'en-IN',
  hindiLocale: 'hi-IN',
} as const;

/**
 * Centralized timing for the guided practice flow.
 * All values in milliseconds.
 */
export const PRACTICE_TIMING = {
  englishToHindi: 1500,
  hindiToInstruction: 1500,
  instructionToRepeat: 2000,
  betweenRepeats: 2500,
} as const;

/**
 * Speech rate for TTS fallback.
 * 0.82 = clear, natural, patient teacher-like speed.
 */
export const SPEECH_RATE = 0.82;

/** Instruction phrase spoken after the Hindi meaning. */
export const REPEAT_INSTRUCTION_TEXT = 'मेरे साथ 3 बार रिपीट करो।';

/** Hindi meaning prefix. */
export const HINDI_MEANING_PREFIX = 'मतलब';

/**
 * Cache-busting version for all audio URLs.
 * Bump to '10' after regenerating with male Indian voices.
 */
export const AUDIO_VERSION = '10';

const withVersion = (path: string): string => `${path}?v=${AUDIO_VERSION}`;

/** Static MP3 paths. */
export const AUDIO_PATHS = {
  english: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.mp3`),
  hindi: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.hindi.mp3`),
  instruction: withVersion('/audio/shared/repeat-instruction.mp3'),
} as const;

/**
 * Browser TTS fallback: pick ONE single voice for EVERY language.
 * Prefers hi-IN voice (bilingual).
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

/** Invalidate the cached browser voice. */
export function resetPracticeVoiceCache(): void {
  cachedVoice = undefined;
}
