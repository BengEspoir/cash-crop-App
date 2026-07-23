const router = require('express').Router();
const validate = require('../../middleware/validate');
const { aiChatLimiter } = require('../../middleware/rateLimiter');
const { createChatResponse } = require('./chat.controller');
const { chatSchema } = require('./chat.validators');

router.post('/', aiChatLimiter, validate(chatSchema), createChatResponse);

module.exports = router;
