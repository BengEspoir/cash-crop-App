const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  createQuote,
  listQuotes,
  getQuote,
  acceptQuote,
  rejectQuote,
  cancelQuote,
  completeQuote
} = require('./quotes.controller');
const { createQuoteSchema, quoteReasonSchema } = require('./quotes.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listQuotes);
router.post('/', validate(createQuoteSchema), createQuote);
router.get('/:id', getQuote);
router.post('/:id/accept', acceptQuote);
router.post('/:id/reject', validate(quoteReasonSchema), rejectQuote);
router.post('/:id/cancel', validate(quoteReasonSchema), cancelQuote);
router.post('/:id/complete', completeQuote);

module.exports = router;
