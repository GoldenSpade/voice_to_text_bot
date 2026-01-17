import dotenv from 'dotenv';

dotenv.config();

export const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TRANSCRIPTION_MODEL: 'gpt-4o-transcribe',
  TRANSLATION_MODEL: 'gpt-4o-mini'
};

export const LANGUAGES = {
  ar: { name: 'Arabic', code: 'ar' },
  be: { name: 'Belarusian', code: 'be' },
  zh: { name: 'Chinese', code: 'zh' },
  nl: { name: 'Dutch', code: 'nl' },
  en: { name: 'English', code: 'en' },
  fr: { name: 'French', code: 'fr' },
  ka: { name: 'Georgian', code: 'ka' },
  de: { name: 'German', code: 'de' },
  hi: { name: 'Hindi', code: 'hi' },
  id: { name: 'Indonesian', code: 'id' },
  it: { name: 'Italian', code: 'it' },
  ja: { name: 'Japanese', code: 'ja' },
  ko: { name: 'Korean', code: 'ko' },
  pl: { name: 'Polish', code: 'pl' },
  pt: { name: 'Portuguese', code: 'pt' },
  ru: { name: 'Russian', code: 'ru' },
  es: { name: 'Spanish', code: 'es' },
  sv: { name: 'Swedish', code: 'sv' },
  th: { name: 'Thai', code: 'th' },
  tr: { name: 'Turkish', code: 'tr' },
  uk: { name: 'Ukrainian', code: 'uk' },
  vi: { name: 'Vietnamese', code: 'vi' }
};

// Available TTS voices from OpenAI
export const VOICES = {
  alloy: { name: 'Alloy', code: 'alloy', description: 'Neutral' },
  echo: { name: 'Echo', code: 'echo', description: 'Male' },
  fable: { name: 'Fable', code: 'fable', description: 'British accent' },
  onyx: { name: 'Onyx', code: 'onyx', description: 'Deep male' },
  nova: { name: 'Nova', code: 'nova', description: 'Female' },
  shimmer: { name: 'Shimmer', code: 'shimmer', description: 'Soft female' }
};

// Pagination settings
export const LANGUAGES_PER_PAGE = 8;

export const MENU_ACTIONS = {
  TRANSCRIBE: 'transcribe',
  TRANSLATE: 'translate',
  VOICE: 'voice',
  MAIN_MENU: 'main_menu'
};
