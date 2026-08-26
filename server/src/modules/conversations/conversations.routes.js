const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const {
  createConversation,
  listConversations,
  getConversation,
  sendMessage
} = require('./conversations.controller');
const { createConversationSchema, sendMessageSchema } = require('./conversations.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listConversations);
router.post('/', requireMarketplaceAccess, validate(createConversationSchema), createConversation);
router.get('/:id', getConversation);
router.post('/:id/messages', requireMarketplaceAccess, validate(sendMessageSchema), sendMessage);

module.exports = router;
