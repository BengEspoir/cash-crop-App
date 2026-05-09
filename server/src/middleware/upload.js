const multer = require('multer');
const { sendError } = require('../utils/response');
const { ERROR_CODES } = require('../config/constants');

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const fileFilter = (req, file, cb) => {
  if (!imageMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, or WebP images are allowed'));
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 6
  }
});

const identityUploadHandler = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]);

const handleUploadErrors = (handler) => (req, res, next) => {
  handler(req, res, (err) => {
    if (!err) return next();

    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Upload failed. Each image must be 8MB or smaller.'
      : err.message || 'Upload failed';

    return sendError(res, message, 400, ERROR_CODES.VALIDATION_ERROR);
  });
};

module.exports = {
  identityUpload: handleUploadErrors(identityUploadHandler)
};
