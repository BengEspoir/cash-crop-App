const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess } = require('../../middleware/auth');
const { listOrders, createOrder, updateOrderStatus } = require('./orders.controller');
const { createOrderSchema, updateOrderStatusSchema } = require('./orders.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/', listOrders);
router.post('/', validate(createOrderSchema), createOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
