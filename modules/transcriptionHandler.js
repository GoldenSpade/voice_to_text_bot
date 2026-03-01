import { transcribeAudio } from './openai.js';
import { downloadAudioFromCtx, deleteFile } from './utils.js';

/**
 * Handle transcription of voice/audio messages
 * Sends transcribed text back to user.
 * @returns {Promise<string|null>} transcribed text or null on failure
 */
export const handleTranscription = async (ctx) => {
  try {
    await ctx.reply('Processing your voice message...');

    const filepath = await downloadAudioFromCtx(ctx);
    if (!filepath) {
      await ctx.reply('Please send a voice message or audio file.');
      return null;
    }

    const text = await transcribeAudio(filepath);
    deleteFile(filepath);

    if (!text) {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
      return null;
    }

    await ctx.reply(text);
    return text;

  } catch (error) {
    console.error('Error processing transcription:', error);
    await ctx.reply('An error occurred while processing your message. Please try again.');
    return null;
  }
};
