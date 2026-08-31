const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { aiChatLimiter } = require('../../middleware/rateLimiter');
const { aiSearchSchema } = require('./search.validators');
const { searchImageUpload, searchAudioUpload } = require('./search.uploads');
const {
  searchWithAI,
  searchWithImage,
  transcribeSearchAudio
} = require('./search.controller');

router.post('/ai', authenticate, aiChatLimiter, validate(aiSearchSchema), searchWithAI);
router.post('/image', authenticate, aiChatLimiter, searchImageUpload, searchWithImage);
router.post('/transcribe', authenticate, aiChatLimiter, searchAudioUpload, transcribeSearchAudio);

module.exports = router;
