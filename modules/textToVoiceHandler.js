import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config, VOICES } from './config.js';
import { deleteFile, tempDir } from './utils.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

/**
 * Convert text to speech using OpenAI TTS
 */
const textToSpeech = async (text, voice) => {
  const mp3 = await openai.audio.speech.create({
    model: config.TTS_MODEL,
    voice: voice,
    input: text
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer;
};

/**
 * Handle text to voice conversion
 */
export const handleTextToVoice = async (ctx, voiceCode) => {
  try {
    const message = ctx.message || ctx.update.message;
    const text = message.text;

    if (!text) {
      await ctx.reply('Please send a text message to convert to voice.');
      return;
    }

    const voiceName = VOICES[voiceCode]?.name || voiceCode;
    await ctx.reply(`🎙️ Generating voice (${voiceName})...`);

    // Generate voice
    const audioBuffer = await textToSpeech(text, voiceCode);

    // Save audio file
    const outputFilename = `tts_${Date.now()}.mp3`;
    const outputFilepath = path.join(tempDir, outputFilename);
    fs.writeFileSync(outputFilepath, audioBuffer);

    // Send audio file
    await ctx.replyWithAudio({ source: outputFilepath });

    // Clean up
    deleteFile(outputFilepath);

  } catch (error) {
    console.error('Error processing text to voice:', error);
    await ctx.reply(
      'An error occurred while generating voice. Please try again.'
    );
  }
};
