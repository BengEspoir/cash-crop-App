const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const authService = require('./auth.service');

const registerFarmer = asyncHandler(async (req, res) => {
  const result = await authService.registerFarmer(req.body, req);
  sendSuccess(res, result, 'Farmer registered successfully', 201);
});

const registerReseller = asyncHandler(async (req, res) => {
  const result = await authService.registerReseller(req.body, req);
  sendSuccess(res, result, 'Reseller registered successfully', 201);
});

const registerBuyer = asyncHandler(async (req, res) => {
  const result = await authService.registerBuyer(req.body, req);
  sendSuccess(res, result, 'Buyer registered successfully', 201);
});

const oauthExchange = asyncHandler(async (req, res) => {
  const result = await authService.oauthExchange(req.body, req);
  sendSuccess(res, result, 'OAuth login successful');
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password, rememberMe } = req.body;
  const result = await authService.login(identifier, password, rememberMe, req);
  sendSuccess(res, result, 'Login successful');
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(req.user.id, refreshToken, req);
  sendSuccess(res, null, 'Logout successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  sendSuccess(res, result, 'Token refreshed successfully');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verifyEmail(token, req);
  sendSuccess(res, result, 'Email verified successfully');
});

const sendPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, userId, purpose } = req.body;
  const result = await authService.sendPhoneOtp(phone, userId, purpose, req);
  sendSuccess(res, result, 'OTP sent successfully');
});

const confirmPhoneOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const result = await authService.confirmPhoneOtp(userId, otp, req);
  sendSuccess(res, result, 'Phone verified successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier, method } = req.body;
  const result = await authService.forgotPassword(identifier, method, req);
  sendSuccess(res, result, 'Password reset requested');
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body, req);
  sendSuccess(res, result, 'Password reset successfully');
});

const resendVerification = asyncHandler(async (req, res) => {
  const { userId, type } = req.body;
  const result = await authService.resendVerification(userId, type || 'phone', req);
  sendSuccess(res, result, 'Verification resent successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  sendSuccess(res, result, 'Profile retrieved successfully');
});

const updateMe = asyncHandler(async (req, res) => {
  const result = await authService.updateMe(req.user.id, req.body);
  sendSuccess(res, result, 'Profile updated successfully');
});

const deactivateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = await authService.deactivateAccount(req.user.id, password, req);
  sendSuccess(res, result, 'Account deactivated successfully');
});

const submitIdentityVerification = asyncHandler(async (req, res) => {
  const result = await authService.submitIdentityVerification(req.user.id, req.body, req);
  sendSuccess(res, result, 'Identity verification submitted successfully');
});

const adminReviewUser = asyncHandler(async (req, res) => {
  const { userId, action, reason } = req.body;
  const result = await authService.adminReviewUser(req.user.id, userId, action, reason, req);
  sendSuccess(res, result, `User ${action}ed successfully`);
});

const getPendingUsers = asyncHandler(async (req, res) => {
  const result = await authService.getPendingUsers();
  sendSuccess(res, result, 'Pending users retrieved successfully');
});

module.exports = {
  registerFarmer,
  registerReseller,
  registerBuyer,
  oauthExchange,
  login,
  logout,
  refreshToken,
  verifyEmail,
  sendPhoneOtp,
  confirmPhoneOtp,
  forgotPassword,
  resetPassword,
  resendVerification,
  getMe,
  updateMe,
  deactivateAccount,
  submitIdentityVerification,
  adminReviewUser,
  getPendingUsers
};
