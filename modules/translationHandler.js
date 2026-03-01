import { transcribeAudio, translateText } from './openai.js';
import { downloadAudioFromCtx, deleteFile } from './utils.js';
import { LANGUAGES } from './config.js';

/**
 * Handle transcription + translation of voice/audio messages.
 * Sends original text and translation back to user.
 */
export const handleTranscriptionAndTranslation = async (ctx, targetLanguage) => {
  try {
    await ctx.reply('Processing your voice message...');

    const filepath = await downloadAudioFromCtx(ctx);
    if (!filepath) {
      await ctx.reply('Please send a voice message or audio file.');
      return;
    }

    const originalText = await transcribeAudio(filepath);
    deleteFile(filepath);

    if (!originalText) {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
      return;
    }

    const translatedText = await translateText(originalText, targetLanguage);
    const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

    await ctx.reply('🎤 Original:');
    await ctx.reply(originalText);
    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

  } catch (error) {
    console.error('Error processing transcription and translation:', error);
    await ctx.reply('An error occurred while processing your message. Please try again.');
  }
};
