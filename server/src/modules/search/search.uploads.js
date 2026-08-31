const multer = require('multer');
const { sendError } = require('../../utils/response');
const { ERROR_CODES } = require('../../config/constants');

const IMAGE_MAX_BYTES = 6 * 1024 * 1024;
const AUDIO_MAX_BYTES = 12 * 1024 * 1024;

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const audioMimeTypes = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a'
]);

const uploader = ({ field, mimeTypes, maxBytes, kind }) => {
  const handler = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: maxBytes },
    fileFilter: (_req, file, callback) => {
      if (!mimeTypes.has(String(file.mimetype || '').toLowerCase())) {
        callback(new Error('Unsupported ' + kind + ' format'));
        return;
      }
      callback(null, true);
    }
  }).single(field);

  return (req, res, next) => {
    handler(req, res, (error) => {
      if (!error) return next();

      const label = kind === 'image' ? 'Image' : 'Audio';
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? label + ' is too large'
        : error.message || kind + ' upload failed';

      return sendError(res, message, 400, ERROR_CODES.VALIDATION_ERROR);
    });
  };
};

const searchImageUpload = uploader({
  field: 'image',
  mimeTypes: imageMimeTypes,
  maxBytes: IMAGE_MAX_BYTES,
  kind: 'image'
});

const searchAudioUpload = uploader({
  field: 'audio',
  mimeTypes: audioMimeTypes,
  maxBytes: AUDIO_MAX_BYTES,
  kind: 'audio'
});

module.exports = {
  searchImageUpload,
  searchAudioUpload,
  IMAGE_MAX_BYTES,
  AUDIO_MAX_BYTES,
  imageMimeTypes,
  audioMimeTypes
};
