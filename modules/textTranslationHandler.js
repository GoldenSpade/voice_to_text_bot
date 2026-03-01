import { translateText } from './openai.js';
import { LANGUAGES } from './config.js';

/**
 * Handle translation of a plain text message.
 * Sends translated text back to user.
 */
export const handleTextTranslation = async (ctx, targetLanguage) => {
  try {
    const text = (ctx.message ?? ctx.update.message).text;
    if (!text) {
      await ctx.reply('Please send a text message to translate.');
      return;
    }

    await ctx.reply('Translating...');

    const translatedText = await translateText(text, targetLanguage);
    const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

  } catch (error) {
    console.error('Error processing text translation:', error);
    await ctx.reply('An error occurred while translating your message. Please try again.');
  }
};
