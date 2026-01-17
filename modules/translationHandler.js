import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config, LANGUAGES } from './config.js';
import { downloadFile, deleteFile, tempDir } from './utils.js';

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
 * Handle transcription and translation of voice/audio messages
 */
export const handleTranscriptionAndTranslation = async (ctx, targetLanguage) => {
  try {
    await ctx.reply('Processing your voice message...');

    // Get file info
    const message = ctx.message || ctx.update.message;
    let fileId, fileExtension;

    if (message.voice) {
      fileId = message.voice.file_id;
      fileExtension = 'ogg';
    } else if (message.audio) {
      fileId = message.audio.file_id;
      fileExtension = 'mp3';
    } else {
      await ctx.reply('Please send a voice message or audio file.');
      return;
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Download file
    const filename = `${Date.now()}.${fileExtension}`;
    const filepath = path.join(tempDir, filename);

    await downloadFile(fileLink.href, filepath);

    // Transcribe
    await ctx.reply('Transcribing...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: config.TRANSCRIPTION_MODEL
    });

    // Clean up
    deleteFile(filepath);

    if (!transcription.text) {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
      return;
    }

    // Translate
    await ctx.reply('Translating...');
    const translatedText = await translateText(transcription.text, targetLanguage);

    const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;

    // Send as separate messages
    await ctx.reply('🎤 Original:');
    await ctx.reply(transcription.text);
    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

  } catch (error) {
    console.error('Error processing transcription and translation:', error);
    await ctx.reply(
      'An error occurred while processing your message. Please try again.'
    );
  }
};
