const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  createConversation,
  listConversations,
  getConversation,
  sendMessage
} = require('./conversations.controller');
const { createConversationSchema, sendMessageSchema } = require('./conversations.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listConversations);
router.post('/', validate(createConversationSchema), createConversation);
router.get('/:id', getConversation);
router.post('/:id/messages', validate(sendMessageSchema), sendMessage);

module.exports = router;
