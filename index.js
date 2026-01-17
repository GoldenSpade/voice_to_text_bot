import { Telegraf } from 'telegraf';
import { config } from './modules/config.js';
import { mainMenuKeyboard, languageSelectionKeyboard, voiceSelectionKeyboard } from './modules/keyboards.js';
import { handleTranscription } from './modules/transcriptionHandler.js';
import { handleTranscriptionAndTranslation } from './modules/translationHandler.js';
import { handleVoiceGeneration } from './modules/voiceHandler.js';
import { handleTextTranslation } from './modules/textTranslationHandler.js';
import { handleTextToVoice } from './modules/textToVoiceHandler.js';

// Initialize bot
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// User session storage
const userSessions = new Map();

// Start command handler
bot.start((ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.reply(
    'Hello! I am a bot for transcribing voice messages.\n\n' +
    'Choose an option:',
    mainMenuKeyboard()
  );
});

// Menu command handler - restores main menu at any time
bot.command('menu', (ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.reply(
    'Main menu:',
    mainMenuKeyboard()
  );
});

// Main menu button handler
bot.hears('🎤 Transcribe Audio', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'transcribe' });
  ctx.reply('Send me a voice message or audio file and I will transcribe it.');
});

// Translate button handler
bot.hears('🌍 Transcribe Audio & Translate', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'translate', awaitingLanguage: true });
  ctx.reply(
    'Select the language you want to translate to:',
    languageSelectionKeyboard()
  );
});

// Voice generation button handler
bot.hears('🎙️ Transcribe Audio, Translate & Voice', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'voice', step: 'language' });
  ctx.reply(
    'Select the language you want to translate to:',
    languageSelectionKeyboard()
  );
});

// Text translation button handler
bot.hears('🔄 Translate Text', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'text_translate', awaitingLanguage: true });
  ctx.reply(
    'Select the language you want to translate to:',
    languageSelectionKeyboard()
  );
});

// Text to voice button handler
bot.hears('🔊 Text to Voice', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'text_to_voice', step: 'voice' });
  ctx.reply(
    'Select a voice for text-to-speech:',
    voiceSelectionKeyboard()
  );
});

// Help button handler
bot.hears('📖 Help', (ctx) => {
  const helpMessage =
    '📖 *Bot Instructions*\n\n' +
    'This bot offers 5 main features:\n\n' +

    '🎤 *Transcribe Audio*\n' +
    'Convert voice messages or audio files to text.\n' +
    '• Click the button\n' +
    '• Send a voice message or audio file\n' +
    '• Receive the transcription\n\n' +

    '🔄 *Translate Text*\n' +
    'Translate any text message to another language.\n' +
    '• Click the button\n' +
    '• Select target language\n' +
    '• Send your text\n' +
    '• Receive translation\n\n' +

    '🌍 *Transcribe Audio & Translate*\n' +
    'Convert voice to text and translate it.\n' +
    '• Click the button\n' +
    '• Select target language\n' +
    '• Send voice message or audio file\n' +
    '• Receive original text and translation\n\n' +

    '🎙️ *Transcribe Audio, Translate & Voice*\n' +
    'Full cycle: voice to text, translate, and generate new voice.\n' +
    '• Click the button\n' +
    '• Select target language\n' +
    '• Select voice type\n' +
    '• Send voice message or audio file\n' +
    '• Receive original text, translation, and audio in selected voice\n\n' +

    '🔊 *Text to Voice*\n' +
    'Convert any text message to speech.\n' +
    '• Click the button\n' +
    '• Select voice type\n' +
    '• Send your text\n' +
    '• Receive audio file\n\n' +

    '*Supported Languages:* 22 languages including English, Russian, Spanish, French, German, Chinese, Japanese, Arabic, and more.\n\n' +
    '*Available Voices:* 9 different voices - Alloy, Ash, Coral, Echo, Fable, Nova, Onyx, Sage, Shimmer.\n\n' +
    '💡 *Tips:*\n' +
    '• Use /menu command anytime to return to main menu\n' +
    '• Supports various audio formats: mp3, ogg, wav, m4a, and more';

  ctx.reply(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Back', callback_data: 'close_help' }]
      ]
    }
  });
});

// Close help message handler
bot.action('close_help', (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
});

// Pagination handler
bot.action(/^page_(\d+)$/, (ctx) => {
  const page = parseInt(ctx.match[1]);
  ctx.answerCbQuery();
  ctx.editMessageReplyMarkup(languageSelectionKeyboard(page).reply_markup);
});

// Page info button (does nothing, just shows page number)
bot.action('page_info', (ctx) => {
  ctx.answerCbQuery();
});

// Voice selection callback handler
bot.action(/^voice_(.+)$/, (ctx) => {
  const voice = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || {};

  session.selectedVoice = voice;
  userSessions.set(ctx.from.id, session);

  ctx.answerCbQuery();

  if (session.mode === 'text_to_voice') {
    session.step = 'text';
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(
      `Voice selected: ${voice.toUpperCase()}\n\n` +
      'Now send me a text message to convert to voice.'
    );
  } else {
    session.step = 'audio';
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(
      `Voice selected: ${voice.toUpperCase()}\n\n` +
      'Now send me a voice message or audio file to transcribe, translate and generate voice.'
    );
  }
});

// Language selection callback handler
bot.action(/^lang_(.+)$/, (ctx) => {
  const language = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || {};

  session.targetLanguage = language;

  // If in voice mode, ask for voice selection
  if (session.mode === 'voice') {
    session.step = 'voice';
    userSessions.set(ctx.from.id, session);

    ctx.answerCbQuery();
    ctx.editMessageText(
      `Language selected: ${language.toUpperCase()}\n\n` +
      'Now select a voice:'
    );
    ctx.reply('Select a voice for text-to-speech:', voiceSelectionKeyboard());
  } else if (session.mode === 'text_translate') {
    // For text translation mode
    session.awaitingLanguage = false;
    session.awaitingText = true;
    userSessions.set(ctx.from.id, session);

    ctx.answerCbQuery();
    ctx.editMessageText(
      `Language selected: ${language.toUpperCase()}\n\n` +
      'Now send me a text message to translate.'
    );
  } else {
    // For translate mode
    session.awaitingLanguage = false;
    session.awaitingAudio = true;
    userSessions.set(ctx.from.id, session);

    ctx.answerCbQuery();
    ctx.editMessageText(
      `Language selected: ${language.toUpperCase()}\n\n` +
      'Now send me a voice message or audio file to transcribe and translate.'
    );
  }
});

// Back to main menu callback handler
bot.action('main_menu', (ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.answerCbQuery();
  ctx.editMessageText('Main menu:');
  ctx.reply(
    'Choose an option:',
    mainMenuKeyboard()
  );
});

// Voice message handler
bot.on('voice', async (ctx) => {
  const session = userSessions.get(ctx.from.id);

  if (!session) {
    ctx.reply(
      'Please select an option from the main menu first.',
      mainMenuKeyboard()
    );
    return;
  }

  if (session.mode === 'transcribe') {
    await handleTranscription(ctx);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else if (session.mode === 'translate' && session.targetLanguage) {
    await handleTranscriptionAndTranslation(ctx, session.targetLanguage);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else if (session.mode === 'voice' && session.targetLanguage && session.selectedVoice) {
    await handleVoiceGeneration(ctx, session.targetLanguage, session.selectedVoice);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else {
    ctx.reply('Please select language and voice first.');
  }
});

// Audio file handler
bot.on('audio', async (ctx) => {
  const session = userSessions.get(ctx.from.id);

  if (!session) {
    ctx.reply(
      'Please select an option from the main menu first.',
      mainMenuKeyboard()
    );
    return;
  }

  if (session.mode === 'transcribe') {
    await handleTranscription(ctx);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else if (session.mode === 'translate' && session.targetLanguage) {
    await handleTranscriptionAndTranslation(ctx, session.targetLanguage);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else if (session.mode === 'voice' && session.targetLanguage && session.selectedVoice) {
    await handleVoiceGeneration(ctx, session.targetLanguage, session.selectedVoice);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else {
    ctx.reply('Please select language and voice first.');
  }
});

// Text message handler
bot.on('text', async (ctx) => {
  const session = userSessions.get(ctx.from.id);

  // Skip if it's a command or button press
  if (ctx.message.text.startsWith('/') || ctx.message.text.startsWith('🎤') ||
      ctx.message.text.startsWith('🌍') || ctx.message.text.startsWith('🎙️') ||
      ctx.message.text.startsWith('🔄') || ctx.message.text.startsWith('🔊')) {
    return;
  }

  if (!session) {
    ctx.reply(
      'Please select an option from the main menu first.',
      mainMenuKeyboard()
    );
    return;
  }

  if (session.mode === 'text_translate' && session.targetLanguage) {
    await handleTextTranslation(ctx, session.targetLanguage);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else if (session.mode === 'text_to_voice' && session.selectedVoice) {
    await handleTextToVoice(ctx, session.selectedVoice);
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  } else {
    ctx.reply(
      'Please use the buttons below to select an option.',
      mainMenuKeyboard()
    );
  }
});

// Handler for all other messages
bot.on('message', (ctx) => {
  ctx.reply(
    'Please use the buttons below to select an option.',
    mainMenuKeyboard()
  );
});

// Launch the bot
bot.launch();

console.log('Bot is running...');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
