const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./farmers.service');

const listFarmers = asyncHandler(async (req, res) => {
  const result = await service.listFarmers(req.query);
  sendSuccess(res, result, 'Farmers retrieved successfully');
});

const getFarmer = asyncHandler(async (req, res) => {
  const result = await service.getFarmerById(req.params.id);
  sendSuccess(res, result, 'Farmer retrieved successfully');
});

const getFarmerListings = asyncHandler(async (req, res) => {
  const result = await service.getFarmerListings(req.params.id);
  sendSuccess(res, result, 'Farmer listings retrieved successfully');
});

module.exports = {
  listFarmers,
  getFarmer,
  getFarmerListings
};
