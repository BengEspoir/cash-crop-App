const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const { listOrders, createOrder, updateOrderStatus, confirmOrderReceipt } = require('./orders.controller');
const { createOrderSchema, updateOrderStatusSchema } = require('./orders.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listOrders);
router.post('/', requireMarketplaceAccess, validate(createOrderSchema), createOrder);
router.patch('/:id/status', requireMarketplaceAccess, validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/confirm-receipt', requireMarketplaceAccess, confirmOrderReceipt);

module.exports = router;
