import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { downloadFile, deleteFile, tempDir } from './utils.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

/**
 * Handle transcription of voice/audio messages
 */
export const handleTranscription = async (ctx) => {
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
      return null;
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Download file
    const filename = `${Date.now()}.${fileExtension}`;
    const filepath = path.join(tempDir, filename);

    await downloadFile(fileLink.href, filepath);

    // Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: config.TRANSCRIPTION_MODEL
    });

    // Clean up
    deleteFile(filepath);

    if (transcription.text) {
      await ctx.reply(transcription.text);
      return transcription.text;
    } else {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
      return null;
    }

  } catch (error) {
    console.error('Error processing transcription:', error);
    await ctx.reply(
      'An error occurred while processing your message. Please try again.'
    );
    return null;
  }
};
