const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./uploads.service');

const uploadAsset = asyncHandler(async (req, res) => {
  const result = await service.uploadAsset(req.user, req.file, req.body);
  sendSuccess(res, result, 'Asset uploaded successfully', 201);
});

module.exports = {
  uploadAsset
};
