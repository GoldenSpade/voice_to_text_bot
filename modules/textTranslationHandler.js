import OpenAI from 'openai';
import { config, LANGUAGES } from './config.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

/**
 * Translate text to target language using OpenAI
 */
const translateText = async (text, targetLanguage) => {
  const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

  const completion = await openai.chat.completions.create({
    model: config.TRANSLATION_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${languageName}. Only return the translated text, nothing else.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
};

/**
 * Handle text translation
 */
export const handleTextTranslation = async (ctx, targetLanguage) => {
  try {
    const message = ctx.message || ctx.update.message;
    const text = message.text;

    if (!text) {
      await ctx.reply('Please send a text message to translate.');
      return;
    }

    await ctx.reply('Translating...');

    // Translate
    const translatedText = await translateText(text, targetLanguage);
    const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

    // Send translation
    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

  } catch (error) {
    console.error('Error processing text translation:', error);
    await ctx.reply(
      'An error occurred while translating your message. Please try again.'
    );
  }
};
