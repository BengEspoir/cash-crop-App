const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const { getConversation, sendMessage } = require('../conversations/conversations.controller');
const { sendMessageSchema } = require('../conversations/conversations.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/:id', getConversation);
router.post('/:id', requireMarketplaceAccess, validate(sendMessageSchema), sendMessage);

module.exports = router;
