import { Markup } from 'telegraf';
import { LANGUAGES, VOICES, MENU_ACTIONS, LANGUAGES_PER_PAGE, VOICES_PER_PAGE } from './config.js';

/**
 * Main menu keyboard with transcription and translation buttons
 */
export const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.text('🎤 Transcribe Audio'), Markup.button.text('🌍 Transcribe & Translate')],
    [Markup.button.text('🎙️ Transcribe, Translate & Voice'), Markup.button.text('🔄 Translate Text')],
    [Markup.button.text('🔊 Text to Voice')]
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
 * Voice selection keyboard with pagination
 */
export const voiceSelectionKeyboard = (page = 0) => {
  const voicesList = Object.values(VOICES);
  const totalPages = Math.ceil(voicesList.length / VOICES_PER_PAGE);
  const startIndex = page * VOICES_PER_PAGE;
  const endIndex = startIndex + VOICES_PER_PAGE;
  const currentPageVoices = voicesList.slice(startIndex, endIndex);

  // Create voice buttons (2 per row)
  const voiceButtons = [];
  for (let i = 0; i < currentPageVoices.length; i += 2) {
    const row = [];
    row.push(Markup.button.callback(
      `${currentPageVoices[i].name} (${currentPageVoices[i].description})`,
      `voice_${currentPageVoices[i].code}`
    ));
    if (i + 1 < currentPageVoices.length) {
      row.push(Markup.button.callback(
        `${currentPageVoices[i + 1].name} (${currentPageVoices[i + 1].description})`,
        `voice_${currentPageVoices[i + 1].code}`
      ));
    }
    voiceButtons.push(row);
  }

  // Add pagination buttons
  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(Markup.button.callback('⬅️ Previous', `voice_page_${page - 1}`));
  }
  if (page < totalPages - 1) {
    navigationButtons.push(Markup.button.callback('Next ➡️', `voice_page_${page + 1}`));
  }
  if (navigationButtons.length > 0) {
    voiceButtons.push(navigationButtons);
  }

  // Add page indicator and back button
  voiceButtons.push([
    Markup.button.callback(`📄 ${page + 1}/${totalPages}`, 'voice_page_info'),
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
