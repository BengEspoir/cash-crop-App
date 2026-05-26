const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./preferences.service');

const getDashboardPreferences = asyncHandler(async (req, res) => {
  const result = await service.getDashboardPreferences(req.user);
  sendSuccess(res, result, 'Dashboard preferences retrieved successfully');
});

const updateDashboardPreferences = asyncHandler(async (req, res) => {
  const result = await service.updateDashboardPreferences(req.user, req.body, req);
  sendSuccess(res, result, 'Dashboard preferences saved successfully');
});

module.exports = {
  getDashboardPreferences,
  updateDashboardPreferences
};
