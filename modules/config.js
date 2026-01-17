import dotenv from 'dotenv';

dotenv.config();

export const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TRANSCRIPTION_MODEL: 'gpt-4o-transcribe',
  TRANSLATION_MODEL: 'gpt-4o-mini'
};

export const LANGUAGES = {
  en: { name: 'English', code: 'en' },
  es: { name: 'Spanish', code: 'es' },
  fr: { name: 'French', code: 'fr' },
  de: { name: 'German', code: 'de' },
  it: { name: 'Italian', code: 'it' },
  pt: { name: 'Portuguese', code: 'pt' },
  ru: { name: 'Russian', code: 'ru' },
  zh: { name: 'Chinese', code: 'zh' },
  ja: { name: 'Japanese', code: 'ja' },
  ar: { name: 'Arabic', code: 'ar' }
};

export const MENU_ACTIONS = {
  TRANSCRIBE: 'transcribe',
  TRANSLATE: 'translate',
  MAIN_MENU: 'main_menu'
};
