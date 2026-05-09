const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const dashboardService = require('../dashboard/dashboard.service');
const adminService = require('./admin.service');

const getActivity = asyncHandler(async (req, res) => {
  const result = await dashboardService.fetchActivity(50);
  sendSuccess(res, result, 'Admin activity retrieved successfully');
});

const listVerificationSubmissions = asyncHandler(async (req, res) => {
  const result = await adminService.listVerificationSubmissions(req.query.status);
  sendSuccess(res, result, 'Verification submissions retrieved successfully');
});

const getVerificationSubmission = asyncHandler(async (req, res) => {
  const result = await adminService.getVerificationSubmission(req.params.userId);
  sendSuccess(res, result, 'Verification submission retrieved successfully');
});

const reviewVerificationSubmission = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const result = await adminService.reviewVerificationSubmission(req.user.id, req.params.userId, action, reason, req);
  sendSuccess(res, result, 'Verification review saved successfully');
});

module.exports = {
  getActivity,
  listVerificationSubmissions,
  getVerificationSubmission,
  reviewVerificationSubmission
};
