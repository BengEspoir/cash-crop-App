const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  listPayments,
  createPayment,
  createCheckoutIntent,
  getCheckoutIntent,
  confirmCheckoutIntent,
  releasePayment,
  requestWithdrawal
} = require('./payments.controller');
const { createPaymentSchema, createCheckoutIntentSchema } = require('./payments.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listPayments);
router.post('/', validate(createPaymentSchema), createPayment);
router.post('/checkout-intents', validate(createCheckoutIntentSchema), createCheckoutIntent);
router.get('/checkout-intents/:id', getCheckoutIntent);
router.post('/checkout-intents/:id/confirm', confirmCheckoutIntent);
router.post('/withdrawals', requestWithdrawal);
router.post('/:id/release', releasePayment);

module.exports = router;
