const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const {
  listPayments,
  createPayment,
  createCheckoutIntent,
  getCheckoutIntent,
  confirmCheckoutIntent,
  releasePayment,
  requestWithdrawal
} = require('./payments.controller');
const { createPaymentSchema, createCheckoutIntentSchema, releasePaymentSchema } = require('./payments.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listPayments);
router.post('/', requireMarketplaceAccess, validate(createPaymentSchema), createPayment);
router.post('/checkout-intents', requireMarketplaceAccess, validate(createCheckoutIntentSchema), createCheckoutIntent);
router.get('/checkout-intents/:id', getCheckoutIntent);
router.post('/checkout-intents/:id/confirm', requireMarketplaceAccess, confirmCheckoutIntent);
router.post('/withdrawals', requireMarketplaceAccess, requestWithdrawal);
router.post('/:id/release', requireMarketplaceAccess, validate(releasePaymentSchema), releasePayment);

module.exports = router;
