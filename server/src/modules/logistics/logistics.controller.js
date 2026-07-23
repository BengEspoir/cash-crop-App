const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./logistics.service');

const estimateRate = asyncHandler(async (req, res) => {
  const result = await service.estimateLogisticsFee(req.query);
  sendSuccess(res, result, 'Logistics estimate calculated successfully');
});

const listShipments = asyncHandler(async (req, res) => {
  const result = await service.listShipments(req.user, req.query);
  sendSuccess(res, result, 'Shipment records retrieved successfully');
});

const getShipmentByOrder = asyncHandler(async (req, res) => {
  const result = await service.getShipmentByOrder(req.user, req.params.orderId);
  sendSuccess(res, result, result ? 'Shipment retrieved successfully' : 'No shipment record exists for this order yet');
});

const getShipment = asyncHandler(async (req, res) => {
  const result = await service.getShipment(req.user, req.params.id);
  sendSuccess(res, result, 'Shipment retrieved successfully');
});

const assignShipment = asyncHandler(async (req, res) => {
  const result = await service.assignShipment(req.user, req.params.id, req.body);
  sendSuccess(res, result, 'Shipment assigned successfully');
});

const updateShipmentPosition = asyncHandler(async (req, res) => {
  const result = await service.updateShipmentPosition(req.user, req.params.id, req.body);
  sendSuccess(res, result, 'Shipment position recorded successfully');
});

const updateShipmentStatus = asyncHandler(async (req, res) => {
  const result = await service.updateShipmentStatus(req.user, req.params.id, req.body);
  sendSuccess(res, result, 'Shipment status updated successfully');
});

module.exports = {
  estimateRate,
  listShipments,
  getShipmentByOrder,
  getShipment,
  assignShipment,
  updateShipmentPosition,
  updateShipmentStatus
};
