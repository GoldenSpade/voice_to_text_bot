import { Markup } from 'telegraf';
import { LANGUAGES, VOICES, LANGUAGES_PER_PAGE } from './config.js';

/**
 * Main menu keyboard with transcription and translation buttons
 */
export const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('🎤 Transcribe Audio'), Markup.button.text('🔄 Translate Text')],
    [Markup.button.text('🌍 Transcribe Audio & Translate')],
    [Markup.button.text('🎙️ Transcribe Audio, Translate & Voice')],
    [Markup.button.text('🔊 Text to Voice'), Markup.button.text('📖 Help')]
  ])
    .resize()
    .persistent();
};

/**
 * Language selection keyboard with pagination
 */
export const languageSelectionKeyboard = (page = 0) => {
  const languagesList = Object.values(LANGUAGES);
  const totalPages = Math.ceil(languagesList.length / LANGUAGES_PER_PAGE);
  const startIndex = page * LANGUAGES_PER_PAGE;
  const endIndex = startIndex + LANGUAGES_PER_PAGE;
  const currentPageLanguages = languagesList.slice(startIndex, endIndex);

  // Create language buttons (2 per row)
  const languageButtons = [];
  for (let i = 0; i < currentPageLanguages.length; i += 2) {
    const row = [];
    row.push(Markup.button.callback(
      currentPageLanguages[i].name,
      `lang_${currentPageLanguages[i].code}`
    ));
    if (i + 1 < currentPageLanguages.length) {
      row.push(Markup.button.callback(
        currentPageLanguages[i + 1].name,
        `lang_${currentPageLanguages[i + 1].code}`
      ));
    }
    languageButtons.push(row);
  }

  // Add pagination buttons
  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(Markup.button.callback('⬅️ Previous', `page_${page - 1}`));
  }
  if (page < totalPages - 1) {
    navigationButtons.push(Markup.button.callback('Next ➡️', `page_${page + 1}`));
  }
  if (navigationButtons.length > 0) {
    languageButtons.push(navigationButtons);
  }

  // Add page indicator and back button
  languageButtons.push([
    Markup.button.callback(`📄 ${page + 1}/${totalPages}`, 'page_info'),
    Markup.button.callback('⬅️ Main Menu', 'main_menu')
  ]);

  return Markup.inlineKeyboard(languageButtons);
};

/**
 * Voice selection keyboard without pagination
 */
export const voiceSelectionKeyboard = () => {
  const voicesList = Object.values(VOICES);

  // Create voice buttons (2 per row)
  const voiceButtons = [];
  for (let i = 0; i < voicesList.length; i += 2) {
    const row = [];
    row.push(Markup.button.callback(
      `${voicesList[i].name} (${voicesList[i].description})`,
      `voice_${voicesList[i].code}`
    ));
    if (i + 1 < voicesList.length) {
      row.push(Markup.button.callback(
        `${voicesList[i + 1].name} (${voicesList[i + 1].description})`,
        `voice_${voicesList[i + 1].code}`
      ));
    }
    voiceButtons.push(row);
  }

  // Add back button
  voiceButtons.push([
    Markup.button.callback('⬅️ Main Menu', 'main_menu')
  ]);

  return Markup.inlineKeyboard(voiceButtons);
};

/**
 * Back to main menu inline button
 */
export const backToMainMenuButton = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]
  ]);
};
