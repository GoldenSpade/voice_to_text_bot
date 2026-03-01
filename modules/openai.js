import OpenAI from 'openai';
import fs from 'fs';
import { config, LANGUAGES } from './config.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

/**
 * Transcribe audio file to text
 * @param {string} filepath — path to local audio file
 * @returns {Promise<string|null>} transcribed text or null if nothing recognized
 */
export const transcribeAudio = async (filepath) => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: config.TRANSCRIPTION_MODEL
  });
  return transcription.text || null;
};

/**
 * Translate text to target language
 * @param {string} text — source text
 * @param {string} targetLanguage — language code (e.g. 'ru', 'de')
 * @returns {Promise<string>} translated text
 */
export const translateText = async (text, targetLanguage) => {
  const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

  const completion = await openai.chat.completions.create({
    model: config.TRANSLATION_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${languageName}. Only return the translated text, nothing else.`
      },
      { role: 'user', content: text }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
};

/**
 * Convert text to speech and return audio buffer
 * @param {string} text — text to synthesize
 * @param {string} voice — voice code (e.g. 'alloy', 'nova')
 * @returns {Promise<Buffer>} mp3 audio buffer
 */
export const textToSpeech = async (text, voice) => {
  const mp3 = await openai.audio.speech.create({
    model: config.TTS_MODEL,
    voice,
    input: text
  });
  return Buffer.from(await mp3.arrayBuffer());
};
