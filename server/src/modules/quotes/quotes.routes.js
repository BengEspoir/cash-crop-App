const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const {
  createQuote,
  listQuotes,
  getQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote
} = require('./quotes.controller');
const { createQuoteSchema, quoteReasonSchema } = require('./quotes.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listQuotes);
router.post('/', requireMarketplaceAccess, validate(createQuoteSchema), createQuote);
router.get('/:id', getQuote);
router.post('/:id/accept', requireMarketplaceAccess, acceptQuote);
router.post('/:id/reject', requireMarketplaceAccess, validate(quoteReasonSchema), rejectQuote);
router.post('/:id/cancel', requireMarketplaceAccess, validate(quoteReasonSchema), cancelQuote);

module.exports = router;
