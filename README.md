# Voice to Text Telegram Bot

A feature-rich Telegram bot that provides comprehensive audio transcription, translation, and text-to-speech capabilities powered by OpenAI API.

## Features

### Core Functionality

- **🎤 Audio Transcription** - Convert voice messages and audio files to text with high accuracy
- **🔄 Text Translation** - Translate text messages between 22 different languages
- **🌍 Transcribe & Translate** - Combine transcription with instant translation
- **🎙️ Full Voice Workflow** - Complete cycle: audio → text → translation → voice generation
- **🔊 Text-to-Speech** - Convert any text to natural-sounding speech with 9 voice options
- **📖 Interactive Help** - Built-in help system with detailed usage instructions

### Key Highlights

- Support for 22 languages including English, Russian, Spanish, French, German, Chinese, Japanese, Arabic, and more
- 9 distinct AI voices with different characteristics (neutral, male, female, warm, energetic, calm)
- Intuitive button-based interface for easy navigation
- Paginated language selection for better UX
- Session management for multi-step operations
- Automatic cleanup of temporary files
- Error handling and user-friendly error messages

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Bot Framework**: [Telegraf.js](https://telegraf.js.org/) v4.16.3
- **AI Services**: [OpenAI API](https://platform.openai.com/) v4.77.3
  - `gpt-4o-transcribe` - Audio transcription
  - `gpt-4o-mini` - Text translation
  - `tts-1` - Text-to-speech synthesis
- **Configuration**: dotenv v16.4.7

## Architecture

```
voice_to_text_bot/
├── index.js                          # Main bot entry point
├── modules/
│   ├── config.js                     # Configuration and constants
│   ├── keyboards.js                  # Telegram keyboard layouts
│   ├── utils.js                      # File handling utilities
│   ├── transcriptionHandler.js       # Audio → Text
│   ├── translationHandler.js         # Audio → Text → Translation
│   ├── voiceHandler.js               # Audio → Text → Translation → Voice
│   ├── textTranslationHandler.js     # Text → Translation
│   └── textToVoiceHandler.js         # Text → Voice
├── temp/                             # Temporary audio files storage
└── package.json
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voice_to_text_bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

4. Get your API keys:
   - **Telegram Bot Token**: Create a bot via [@BotFather](https://t.me/botfather) on Telegram
   - **OpenAI API Key**: Obtain from [OpenAI Platform](https://platform.openai.com/api-keys)

## Usage

### Starting the Bot

Production mode:
```bash
npm start
```

Development mode with auto-reload:
```bash
npm run dev
```

### Using the Bot

1. Start a conversation with your bot on Telegram
2. Send `/start` to see the main menu
3. Choose from 5 available features:
   - **Transcribe Audio** - Send voice/audio to get text
   - **Translate Text** - Send text to translate it
   - **Transcribe & Translate** - Send audio to get transcribed and translated text
   - **Full Voice Workflow** - Send audio to get transcription, translation, and new audio
   - **Text to Voice** - Send text to receive an audio file
4. Use `/menu` command anytime to return to the main menu

## Supported Languages

Arabic, Belarusian, Chinese, Dutch, English, French, Georgian, German, Hindi, Indonesian, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Swedish, Thai, Turkish, Ukrainian, Vietnamese (22 total)

## Available Voices

- **Alloy** - Neutral tone
- **Ash** - Male voice
- **Coral** - Warm female voice
- **Echo** - Male voice
- **Fable** - British accent
- **Nova** - Energetic female voice
- **Onyx** - Deep male voice
- **Sage** - Calm tone
- **Shimmer** - Soft female voice

## Supported Audio Formats

The bot accepts the following audio formats: `flac`, `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `ogg`, `wav`, `webm`

## Implementation Details

### Session Management
The bot maintains user sessions to handle multi-step interactions, allowing users to select languages and voices before processing their audio or text.

### Modular Design
Each feature is implemented in a separate module for maintainability and scalability. Handlers are responsible for specific workflows, making the codebase easy to extend.

### Temporary File Handling
Audio files are temporarily stored during processing and automatically cleaned up afterward to prevent storage bloat.

### Error Handling
Comprehensive error handling ensures users receive helpful feedback when operations fail, improving the overall user experience.

