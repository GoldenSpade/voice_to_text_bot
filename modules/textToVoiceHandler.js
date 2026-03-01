import fs from 'fs';
import path from 'path';
import { textToSpeech } from './openai.js';
import { deleteFile, tempDir } from './utils.js';
import { VOICES } from './config.js';

/**
 * Handle text-to-speech conversion.
 * Sends generated mp3 audio back to user.
 */
export const handleTextToVoice = async (ctx, voiceCode) => {
  try {
    const text = (ctx.message ?? ctx.update.message).text;
    if (!text) {
      await ctx.reply('Please send a text message to convert to voice.');
      return;
    }

    const voiceName = VOICES[voiceCode]?.name || voiceCode;
    await ctx.reply(`🎙️ Generating voice (${voiceName})...`);

    const audioBuffer = await textToSpeech(text, voiceCode);

    const outputFilepath = path.join(tempDir, `tts_${Date.now()}.mp3`);
    fs.writeFileSync(outputFilepath, audioBuffer);
    await ctx.replyWithAudio({ source: outputFilepath });
    deleteFile(outputFilepath);

  } catch (error) {
    console.error('Error processing text to voice:', error);
    await ctx.reply('An error occurred while generating voice. Please try again.');
  }
};
