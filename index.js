import { Telegraf } from 'telegraf';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Loading environment variables
dotenv.config();

// Getting __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initializing clients
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create a folder for temporary files
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Function for downloading a file
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

// /start command handler
bot.start((ctx) => {
  ctx.reply(
    'Hello! I am a bot for transcribing voice messages.\n\n' +
    'Send me a voice message and I will convert it to text.'
  );
});

// Voice message handler
bot.on('voice', async (ctx) => {
  try {
    // Sending a message about the start of processing
    await ctx.reply('Processing your voice message...');

    // Getting information about a file
    const fileId = ctx.message.voice.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Create a unique file name
    const filename = `voice_${Date.now()}.ogg`;
    const filepath = path.join(tempDir, filename);

    // Downloading an audio file
    await downloadFile(fileLink.href, filepath);

    // Sending a file for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: 'gpt-4o-transcribe'
    });

    // Delete temporary file
    fs.unlinkSync(filepath);

    // Sending the result
    if (transcription.text) {
      await ctx.reply(transcription.text);
    } else {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
    }

  } catch (error) {
    console.error('Error processing voice message:', error);
    await ctx.reply(
      'An error occurred while processing your message. ' +
      'Please try again.'
    );

    // Attempt to delete file in case of error
    const filename = `voice_${Date.now()}.ogg`;
    const filepath = path.join(tempDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
});

// Handler for regular audio files
bot.on('audio', async (ctx) => {
  try {
    await ctx.reply('Processing your audio file...');

    const fileId = ctx.message.audio.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(tempDir, filename);

    await downloadFile(fileLink.href, filepath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: 'gpt-4o-transcribe'
    });

    fs.unlinkSync(filepath);

    if (transcription.text) {
      await ctx.reply(transcription.text);
    } else {
      await ctx.reply('Sorry, could not recognize speech in the audio file.');
    }

  } catch (error) {
    console.error('Error processing audio file:', error);
    await ctx.reply(
      'An error occurred while processing your file. ' +
      'Please try again.'
    );
  }
});

// Handler for all other messages
bot.on('message', (ctx) => {
  ctx.reply('Please send a voice message or audio file for transcription.');
});

// Launch the bot
bot.launch();

console.log('Bot is running...');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
