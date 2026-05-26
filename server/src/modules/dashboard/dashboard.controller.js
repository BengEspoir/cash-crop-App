const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const dashboardService = require('./dashboard.service');

const getFarmerDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getFarmerDashboard(req.user, req, req.query);
  sendSuccess(res, result, 'Farmer dashboard retrieved successfully');
});

const getBuyerDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getBuyerDashboard(req.user, req, req.query);
  sendSuccess(res, result, 'Buyer dashboard retrieved successfully');
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getAdminDashboard(req.user, req, req.query);
  sendSuccess(res, result, 'Admin dashboard retrieved successfully');
});

const exportFarmerDashboard = asyncHandler(async (req, res) => {
  const csv = await dashboardService.exportDashboard('farmer', req.user, req, req.query);
  res.header('Content-Type', 'text/csv');
  res.attachment(csv.filename);
  return res.send(csv.content);
});

const exportBuyerDashboard = asyncHandler(async (req, res) => {
  const csv = await dashboardService.exportDashboard('buyer', req.user, req, req.query);
  res.header('Content-Type', 'text/csv');
  res.attachment(csv.filename);
  return res.send(csv.content);
});

const exportAdminDashboard = asyncHandler(async (req, res) => {
  const csv = await dashboardService.exportDashboard('admin', req.user, req, req.query);
  res.header('Content-Type', 'text/csv');
  res.attachment(csv.filename);
  return res.send(csv.content);
});

module.exports = {
  getFarmerDashboard,
  getBuyerDashboard,
  getAdminDashboard,
  exportFarmerDashboard,
  exportBuyerDashboard,
  exportAdminDashboard
};
