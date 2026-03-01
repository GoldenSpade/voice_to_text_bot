import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './modules/config.js';
import { mainMenuKeyboard, languageSelectionKeyboard, voiceSelectionKeyboard } from './modules/keyboards.js';
import { handleTranscription } from './modules/transcriptionHandler.js';
import { handleTranscriptionAndTranslation } from './modules/translationHandler.js';
import { handleVoiceGeneration } from './modules/voiceHandler.js';
import { handleTextTranslation } from './modules/textTranslationHandler.js';
import { handleTextToVoice } from './modules/textToVoiceHandler.js';

// ─── Bot & session ────────────────────────────────────────────────────────────

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Simple in-memory session storage: userId → { mode, step, targetLanguage, selectedVoice }
const userSessions = new Map();

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.start((ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.reply(
    'Hello! I can help you with voice and text processing:\n\n' +
    '🎤 Transcribe voice messages to text\n' +
    '🌍 Transcribe audio and translate it\n' +
    '🎙️ Transcribe, translate and generate voice\n' +
    '🔄 Translate text to another language\n' +
    '🔊 Convert text to speech\n\n' +
    'Choose an option:',
    mainMenuKeyboard()
  );
});

bot.command('menu', (ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.reply('Main menu:', mainMenuKeyboard());
});

// ─── Main menu buttons ────────────────────────────────────────────────────────

bot.hears('🎤 Transcribe Audio', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'transcribe' });
  ctx.reply('Send me a voice message or audio file and I will transcribe it.');
});

bot.hears('🔄 Translate Text', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'text_translate', awaitingLanguage: true });
  ctx.reply('Select the language you want to translate to:', languageSelectionKeyboard());
});

bot.hears('🌍 Transcribe Audio & Translate', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'translate', awaitingLanguage: true });
  ctx.reply('Select the language you want to translate to:', languageSelectionKeyboard());
});

bot.hears('🎙️ Transcribe Audio, Translate & Voice', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'voice', step: 'language' });
  ctx.reply('Select the language you want to translate to:', languageSelectionKeyboard());
});

bot.hears('🔊 Text to Voice', (ctx) => {
  userSessions.set(ctx.from.id, { mode: 'text_to_voice', step: 'voice' });
  ctx.reply('Select a voice for text-to-speech:', voiceSelectionKeyboard());
});

bot.hears('📖 Help', (ctx) => {
  ctx.reply(HELP_MESSAGE, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'close_help' }]]
    }
  });
});

// ─── Inline keyboard callbacks ────────────────────────────────────────────────

bot.action('close_help', (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
});

bot.action(/^page_(\d+)$/, (ctx) => {
  const page = parseInt(ctx.match[1]);
  ctx.answerCbQuery();
  ctx.editMessageReplyMarkup(languageSelectionKeyboard(page).reply_markup);
});

// Page indicator button — no action
bot.action('page_info', (ctx) => ctx.answerCbQuery());

bot.action(/^lang_(.+)$/, (ctx) => {
  const language = ctx.match[1];
  const session = userSessions.get(ctx.from.id) ?? {};

  session.targetLanguage = language;
  ctx.answerCbQuery();

  if (session.mode === 'voice') {
    session.step = 'voice';
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(`Language selected: ${language.toUpperCase()}\n\nNow select a voice:`);
    ctx.reply('Select a voice for text-to-speech:', voiceSelectionKeyboard());

  } else if (session.mode === 'text_translate') {
    session.awaitingLanguage = false;
    session.awaitingText = true;
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(`Language selected: ${language.toUpperCase()}\n\nNow send me a text message to translate.`);

  } else {
    // translate mode
    session.awaitingLanguage = false;
    session.awaitingAudio = true;
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(`Language selected: ${language.toUpperCase()}\n\nNow send me a voice message or audio file to transcribe and translate.`);
  }
});

bot.action(/^voice_(.+)$/, (ctx) => {
  const voice = ctx.match[1];
  const session = userSessions.get(ctx.from.id) ?? {};

  session.selectedVoice = voice;
  ctx.answerCbQuery();

  if (session.mode === 'text_to_voice') {
    session.step = 'text';
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(`Voice selected: ${voice.toUpperCase()}\n\nNow send me a text message to convert to voice.`);
  } else {
    session.step = 'audio';
    userSessions.set(ctx.from.id, session);
    ctx.editMessageText(`Voice selected: ${voice.toUpperCase()}\n\nNow send me a voice message or audio file to transcribe, translate and generate voice.`);
  }
});

bot.action('main_menu', (ctx) => {
  userSessions.delete(ctx.from.id);
  ctx.answerCbQuery();
  ctx.editMessageText('Main menu:');
  ctx.reply('Choose an option:', mainMenuKeyboard());
});

// ─── Message handlers ─────────────────────────────────────────────────────────

// Voice and audio messages are handled identically
bot.on([message('voice'), message('audio')], async (ctx) => {
  const session = userSessions.get(ctx.from.id);

  if (!session) {
    ctx.reply('Please select an option from the main menu first.', mainMenuKeyboard());
    return;
  }

  const finishAndReturn = async (handler) => {
    await handler;
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  };

  if (session.mode === 'transcribe') {
    await finishAndReturn(handleTranscription(ctx));

  } else if (session.mode === 'translate' && session.targetLanguage) {
    await finishAndReturn(handleTranscriptionAndTranslation(ctx, session.targetLanguage));

  } else if (session.mode === 'voice' && session.targetLanguage && session.selectedVoice) {
    await finishAndReturn(handleVoiceGeneration(ctx, session.targetLanguage, session.selectedVoice));

  } else {
    ctx.reply('Please select language and voice first.');
  }
});

bot.on(message('text'), async (ctx) => {
  const text = ctx.message.text;

  // Skip commands and menu button presses
  if (text.startsWith('/') || /^[🎤🌍🎙️🔄🔊📖]/.test(text)) return;

  const session = userSessions.get(ctx.from.id);

  if (!session) {
    ctx.reply('Please select an option from the main menu first.', mainMenuKeyboard());
    return;
  }

  const finishAndReturn = async (handler) => {
    await handler;
    userSessions.delete(ctx.from.id);
    await ctx.reply('Choose an option:', mainMenuKeyboard());
  };

  if (session.mode === 'text_translate' && session.targetLanguage) {
    await finishAndReturn(handleTextTranslation(ctx, session.targetLanguage));

  } else if (session.mode === 'text_to_voice' && session.selectedVoice) {
    await finishAndReturn(handleTextToVoice(ctx, session.selectedVoice));

  } else {
    ctx.reply('Please use the buttons below to select an option.', mainMenuKeyboard());
  }
});

// Catch-all for other message types (stickers, photos, etc.)
bot.on('message', (ctx) => {
  ctx.reply('Please use the buttons below to select an option.', mainMenuKeyboard());
});

// ─── Help message ─────────────────────────────────────────────────────────────

const HELP_MESSAGE =
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

// ─── Launch ───────────────────────────────────────────────────────────────────

bot.launch();
console.log('Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
