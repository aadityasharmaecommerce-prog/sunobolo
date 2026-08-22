/**
 * SunoBolo — ONE central voice configuration for the ENTIRE guided flow.
 *
 * Audio: Sarvam AI (bulbul:v3, shubh speaker) — 24kHz MP3, premium quality
 * English: Sarvam AI (en-IN) — natural Indian-friendly accent
 * Hindi: Sarvam AI (hi-IN) — native Hindi voice
 * Same Sarvam voice for both — consistent, premium quality.
 */

export const PRACTICE_VOICE = {
  edgeTtsVoiceId: 'hi-IN-MadhurNeural',
  edgeTtsHindiVoiceId: 'hi-IN-MadhurNeural',
  englishLocale: 'en-IN',
  hindiLocale: 'hi-IN',
} as const;

/**
 * REDUCED pauses for natural, engaging flow.
 */
export const PRACTICE_TIMING = {
  englishToHindi: 400,
  hindiToInstruction: 600,
  instructionToRepeat: 800,
  betweenRepeats: 1200,
} as const;

export const SPEECH_RATE = 0.85;

export const REPEAT_INSTRUCTION_TEXT = 'मेरे साथ 3 बार रिपीट करो।';
export const HINDI_MEANING_PREFIX = 'मतलब';

/**
 * Cache-busting version — bump to '18' for Sarvam AI premium voice audio.
 */
export const AUDIO_VERSION = '22';

const withVersion = (path: string): string => `${path}?v=${AUDIO_VERSION}`;

export const AUDIO_PATHS = {
  english: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.mp3`),
  hindi: (courseId: string, sentenceId: string): string =>
    withVersion(`/audio/${courseId}/${sentenceId}.hindi.mp3`),
  instruction: withVersion('/audio/shared/repeat-instruction.mp3'),
} as const;

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

export function resetPracticeVoiceCache(): void {
  cachedVoice = undefined;
}
