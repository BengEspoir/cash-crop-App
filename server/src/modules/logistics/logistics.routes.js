const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, requireDashboardAccess, requireMarketplaceAccess } = require('../../middleware/auth');
const {
  estimateRate,
  listShipments,
  getShipmentByOrder,
  getShipment,
  assignShipment,
  updateShipmentPosition,
  updateShipmentStatus
} = require('./logistics.controller');
const {
  assignShipmentSchema,
  updateShipmentPositionSchema,
  updateShipmentStatusSchema
} = require('./logistics.validators');

router.use(authenticate, requireDashboardAccess);

router.get('/rates/estimate', estimateRate);
router.get('/', listShipments);
router.get('/order/:orderId', getShipmentByOrder);
router.get('/:id', getShipment);
router.post('/:id/assign', requireMarketplaceAccess, validate(assignShipmentSchema), assignShipment);
router.post('/:id/positions', requireMarketplaceAccess, validate(updateShipmentPositionSchema), updateShipmentPosition);
router.patch('/:id/status', requireMarketplaceAccess, validate(updateShipmentStatusSchema), updateShipmentStatus);

module.exports = router;
