import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config, LANGUAGES, VOICES } from './config.js';
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
 * Convert text to speech using OpenAI TTS
 */
const textToSpeech = async (text, voice) => {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice,
    input: text
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer;
};

/**
 * Handle transcription, translation and voice generation
 */
export const handleVoiceGeneration = async (ctx, targetLanguage, voiceCode) => {
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
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: config.TRANSCRIPTION_MODEL
    });

    // Clean up original file
    deleteFile(filepath);

    if (!transcription.text) {
      await ctx.reply('Sorry, could not recognize speech in the audio message.');
      return;
    }

    // Send original transcription
    await ctx.reply('🎤 Original:');
    await ctx.reply(transcription.text);

    // Translate
    const translatedText = await translateText(transcription.text, targetLanguage);
    const languageName = LANGUAGES[targetLanguage]?.name || targetLanguage;
    const voiceName = VOICES[voiceCode]?.name || voiceCode;

    // Send translation
    await ctx.reply(`🌍 Translated to ${languageName}:`);
    await ctx.reply(translatedText);

    // Generate voice
    await ctx.reply(`🎙️ Generating voice (${voiceName})...`);
    const audioBuffer = await textToSpeech(translatedText, voiceCode);

    // Save audio file
    const outputFilename = `voice_${Date.now()}.mp3`;
    const outputFilepath = path.join(tempDir, outputFilename);
    fs.writeFileSync(outputFilepath, audioBuffer);

    // Send audio file
    await ctx.replyWithAudio({ source: outputFilepath });

    // Clean up
    deleteFile(outputFilepath);

  } catch (error) {
    console.error('Error processing voice generation:', error);
    await ctx.reply(
      'An error occurred while processing your message. Please try again.'
    );
  }
};
