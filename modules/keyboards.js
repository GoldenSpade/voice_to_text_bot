import { Markup } from 'telegraf';
import { LANGUAGES, MENU_ACTIONS } from './config.js';

/**
 * Main menu keyboard with transcription and translation buttons
 */
export const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('🎤 Transcribe Audio')],
    [Markup.button.text('🌍 Transcribe & Translate')]
  ])
    .resize()
    .persistent();
};

/**
 * Language selection keyboard
 */
export const languageSelectionKeyboard = () => {
  const languageButtons = Object.values(LANGUAGES).map(lang =>
    [Markup.button.callback(lang.name, `lang_${lang.code}`)]
  );

  languageButtons.push([Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]);

  return Markup.inlineKeyboard(languageButtons);
};

/**
 * Back to main menu inline button
 */
export const backToMainMenuButton = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]
  ]);
};
