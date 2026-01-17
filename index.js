import { Telegraf } from 'telegraf';
import { config } from './modules/config.js';
import { mainMenuKeyboard, languageSelectionKeyboard } from './modules/keyboards.js';
import { handleTranscription } from './modules/transcriptionHandler.js';
import { handleTranscriptionAndTranslation } from './modules/translationHandler.js';

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

// Main menu button handler
bot.hears('🎤 Transcribe Audio', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'transcribe' });
  ctx.reply('Send me a voice message or audio file and I will transcribe it.');
});

// Translate button handler
bot.hears('🌍 Transcribe & Translate', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'translate', awaitingLanguage: true });
  ctx.reply(
    'Select the language you want to translate to:',
    languageSelectionKeyboard()
  );
});

// Language selection callback handler
bot.action(/^lang_(.+)$/, (ctx) => {
  const language = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || {};

  session.targetLanguage = language;
  session.awaitingLanguage = false;
  session.awaitingAudio = true;
  userSessions.set(ctx.from.id, session);

  ctx.answerCbQuery();
  ctx.editMessageText(
    `Language selected: ${language.toUpperCase()}\n\n` +
    'Now send me a voice message or audio file to transcribe and translate.'
  );
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
  } else if (session.mode === 'translate' && session.targetLanguage) {
    await handleTranscriptionAndTranslation(ctx, session.targetLanguage);
    userSessions.delete(ctx.from.id);
  } else {
    ctx.reply('Please select a language first.');
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
  } else if (session.mode === 'translate' && session.targetLanguage) {
    await handleTranscriptionAndTranslation(ctx, session.targetLanguage);
    userSessions.delete(ctx.from.id);
  } else {
    ctx.reply('Please select a language first.');
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
