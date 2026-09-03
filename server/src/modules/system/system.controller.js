const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const systemService = require('./system.service');
const operationsService = require('./systemOperations.service');

const getPublicStatus = asyncHandler(async (_req, res) => {
  sendSuccess(res, await systemService.getStatus(), 'System status retrieved successfully');
});

const getMaintenance = asyncHandler(async (_req, res) => {
  sendSuccess(res, await systemService.getStatus(), 'Maintenance status retrieved successfully');
});

const enableMaintenance = asyncHandler(async (req, res) => {
  const result = await systemService.setMaintenance(req.user, req, true, req.body.message);
  sendSuccess(res, result, 'Maintenance mode enabled');
});

const disableMaintenance = asyncHandler(async (req, res) => {
  const result = await systemService.setMaintenance(req.user, req, false, req.body.message);
  sendSuccess(res, result, 'Maintenance mode disabled');
});

const getDatabaseCapability = asyncHandler(async (_req, res) => {
  sendSuccess(res, operationsService.getCapability(), 'Database operation capability retrieved');
});

const listDatabaseJobs = asyncHandler(async (req, res) => {
  sendSuccess(res, await operationsService.listJobs(req.query.limit), 'Database operation jobs retrieved');
});

const getDatabaseJob = asyncHandler(async (req, res) => {
  sendSuccess(res, await operationsService.getJob(req.params.id), 'Database operation job retrieved');
});

const requestBackup = asyncHandler(async (req, res) => {
  const result = await operationsService.requestBackup(req.user, req);
  sendSuccess(res, result, 'Database backup queued', 202);
});

const requestRestore = asyncHandler(async (req, res) => {
  const result = await operationsService.requestRestore(req.user, req, req.body.backupId);
  sendSuccess(res, result, 'Database restore queued', 202);
});

module.exports = {
  getPublicStatus,
  getMaintenance,
  enableMaintenance,
  disableMaintenance,
  getDatabaseCapability,
  listDatabaseJobs,
  getDatabaseJob,
  requestBackup,
  requestRestore
};
