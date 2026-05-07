const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const dashboardService = require('../dashboard/dashboard.service');

const getActivity = asyncHandler(async (req, res) => {
  const result = await dashboardService.fetchActivity(50);
  sendSuccess(res, result, 'Admin activity retrieved successfully');
});

module.exports = {
  getActivity
};
