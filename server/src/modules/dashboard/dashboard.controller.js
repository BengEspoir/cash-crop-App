const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const dashboardService = require('./dashboard.service');

const getFarmerDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getFarmerDashboard(req.user, req);
  sendSuccess(res, result, 'Farmer dashboard retrieved successfully');
});

const getBuyerDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getBuyerDashboard(req.user, req);
  sendSuccess(res, result, 'Buyer dashboard retrieved successfully');
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getAdminDashboard(req.user, req);
  sendSuccess(res, result, 'Admin dashboard retrieved successfully');
});

module.exports = {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard
};
