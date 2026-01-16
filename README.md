# Voice to Text Telegram Bot

Telegram bot for transcribing voice messages using OpenAI API.

## Features

- Transcription of Telegram voice messages
- Transcription of audio files
- Uses OpenAI's `gpt-4o-transcribe` model
- Automatic deletion of temporary files

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root and add your keys:
```
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Running

Start the bot:
```bash
npm start
```

Run in development mode with auto-reload:
```bash
npm run dev
```

## Usage

1. Find your bot in Telegram
2. Send the `/start` command
3. Send a voice message or audio file
4. Receive the text transcription

## Technologies

- [Telegraf.js](https://telegraf.js.org/) - framework for Telegram bots
- [OpenAI API](https://platform.openai.com/) - API for audio transcription
- Node.js ES Modules

## Supported Audio Formats

OpenAI supports the following formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
