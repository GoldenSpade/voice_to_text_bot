import fs from 'fs';
import path from 'path';
import { transcribeAudio, translateText, textToSpeech } from './openai.js';
import { downloadAudioFromCtx, deleteFile, tempDir } from './utils.js';
import { LANGUAGES, VOICES } from './config.js';

/**
 * Handle full pipeline: transcription → translation → TTS voice generation.
 * Sends original text, translation, and generated audio back to user.
 */
export const handleVoiceGeneration = async (ctx, targetLanguage, voiceCode) => {
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
    const voiceName = VOICES[voiceCode]?.name || voiceCode;

    await ctx.reply('🎤 Original:');
    await ctx.reply(originalText);
    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

    await ctx.reply(`🎙️ Generating voice (${voiceName})...`);
    const audioBuffer = await textToSpeech(translatedText, voiceCode);

    const outputFilepath = path.join(tempDir, `voice_${Date.now()}.mp3`);
    fs.writeFileSync(outputFilepath, audioBuffer);
    await ctx.replyWithAudio({ source: outputFilepath });
    deleteFile(outputFilepath);

  } catch (error) {
    console.error('Error processing voice generation:', error);
    await ctx.reply('An error occurred while processing your message. Please try again.');
  }
};
