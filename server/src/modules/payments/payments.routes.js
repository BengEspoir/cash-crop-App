const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const {
  listPayments,
  createPayment,
  releasePayment,
  requestWithdrawal
} = require('./payments.controller');
const { createPaymentSchema } = require('./payments.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listPayments);
router.post('/', validate(createPaymentSchema), createPayment);
router.post('/withdrawals', requestWithdrawal);
router.post('/:id/release', releasePayment);

module.exports = router;
