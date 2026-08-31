const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const searchService = require('./search.service');

const searchWithAI = asyncHandler(async (req, res) => {
  const result = await searchService.searchWithAI(req.body.query);
  sendSuccess(res, result, 'Marketplace search completed');
});

const searchWithImage = asyncHandler(async (req, res) => {
  if (!req.file && !req.body?.productOverride) {
    throw new AppError('Select an agricultural image', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const result = await searchService.searchWithImage({
    file: req.file,
    productOverride: req.body?.productOverride
  });
  sendSuccess(res, result, 'Agricultural image search completed');
});

const transcribeSearchAudio = asyncHandler(async (req, res) => {
  if (!req.file?.buffer?.length) {
    throw new AppError('Record or select an audio clip', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const transcript = await searchService.transcribeAudio(req.file);
  sendSuccess(res, { transcript }, 'Voice search transcription completed');
});

module.exports = {
  searchWithAI,
  searchWithImage,
  transcribeSearchAudio
};
