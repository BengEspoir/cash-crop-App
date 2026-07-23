const Joi = require('joi');

const assignShipmentSchema = Joi.object({
  truckId: Joi.string().uuid().allow(null, '').optional(),
  carrierName: Joi.string().max(160).allow('', null).optional(),
  driverName: Joi.string().max(160).allow('', null).optional(),
  driverPhone: Joi.string().max(30).allow('', null).optional(),
  trackingNumber: Joi.string().max(100).allow('', null).optional(),
  estimatedArrival: Joi.date().iso().allow(null).optional(),
  dispatchNow: Joi.boolean().default(false)
});

const updateShipmentPositionSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  locationLabel: Joi.string().max(200).allow('', null).optional(),
  speedKph: Joi.number().min(0).allow(null).optional(),
  heading: Joi.number().min(0).max(360).allow(null).optional(),
  capturedAt: Joi.date().iso().allow(null).optional(),
  status: Joi.string().valid('assigned', 'in_transit', 'near_destination', 'delivered').allow(null, '').optional(),
  metadata: Joi.object().default({})
});

const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid('pending_dispatch', 'assigned', 'in_transit', 'near_destination', 'delivered', 'exception').required(),
  locationLabel: Joi.string().max(200).allow('', null).optional(),
  estimatedArrival: Joi.date().iso().allow(null).optional(),
  note: Joi.string().max(500).allow('', null).optional()
});

module.exports = {
  assignShipmentSchema,
  updateShipmentPositionSchema,
  updateShipmentStatusSchema
};
