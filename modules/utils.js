import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tempDir = path.join(__dirname, '..', 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/**
 * Download file from URL to local filepath
 */
export const downloadFile = (url, filepath) => {
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

/**
 * Delete file safely (ignores errors)
 */
export const deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Extract fileId and extension from a voice or audio message.
 * Downloads the file to temp dir and returns the local filepath.
 * Returns null if the message contains neither voice nor audio.
 *
 * @param {import('telegraf').Context} ctx
 * @returns {Promise<string|null>} local filepath or null
 */
export const downloadAudioFromCtx = async (ctx) => {
  const message = ctx.message ?? ctx.update.message;

  let fileId, fileExtension;

  if (message.voice) {
    fileId = message.voice.file_id;
    fileExtension = 'ogg';
  } else if (message.audio) {
    fileId = message.audio.file_id;
    fileExtension = 'mp3';
  } else {
    return null;
  }

  const fileLink = await ctx.telegram.getFileLink(fileId);
  const filepath = path.join(tempDir, `${Date.now()}.${fileExtension}`);
  await downloadFile(fileLink.href, filepath);
  return filepath;
};
