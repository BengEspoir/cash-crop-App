const router = require('express').Router();
const multer = require('multer');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const { uploadAsset } = require('./uploads.controller');
const { sendError } = require('../../utils/response');
const { ERROR_CODES } = require('../../config/constants');

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WebP images are allowed'));
    }
    return cb(null, true);
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Upload failed. Each image must be 8MB or smaller.'
      : err.message || 'Upload failed';
    return sendError(res, message, 400, ERROR_CODES.VALIDATION_ERROR);
  });
};

router.use(authenticate, requireDashboardAccess);
router.post('/assets', handleUpload, uploadAsset);

module.exports = router;
