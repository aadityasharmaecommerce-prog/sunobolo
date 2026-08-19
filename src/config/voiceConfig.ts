/**
 * SunoBolo — ONE central voice configuration for the ENTIRE guided flow.
 *
 * Voice: hi-IN-MadhurNeural (Indian Male, Friendly, Positive)
 * SAME voice for English + Hindi — one teacher throughout.
 * Rate: +5% (natural, not slow, not robotic)
 */

export const PRACTICE_VOICE = {
  /** Single voice for everything — English + Hindi. */
  edgeTtsVoiceId: 'hi-IN-MadhurNeural',
  edgeTtsHindiVoiceId: 'hi-IN-MadhurNeural',
  englishLocale: 'en-IN',
  hindiLocale: 'hi-IN',
} as const;

/**
 * Centralized timing — REDUCED pauses for natural flow.
 * Flow: English → (short pause) → Hindi → (short pause) → Instruction → (pause) → Rep×3
 */
export const PRACTICE_TIMING = {
  englishToHindi: 1000,
  hindiToInstruction: 1000,
  instructionToRepeat: 1500,
  betweenRepeats: 1500,
} as const;

/** Speech rate for TTS fallback. */
export const SPEECH_RATE = 0.85;

/** Instruction phrase. */
export const REPEAT_INSTRUCTION_TEXT = 'मेरे साथ 3 बार रिपीट करो।';

/** Hindi meaning prefix. */
export const HINDI_MEANING_PREFIX = 'मतलब';

/**
 * Cache-busting version for all audio URLs.
 * Bump to '11' after regenerating with same male voice.
 */
export const AUDIO_VERSION = '11';

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
