const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const service = require('./listings.service');

const listListings = asyncHandler(async (req, res) => {
  const result = await service.listPublicListings({
    ...req.query,
    publicOnly: req.user?.role === 'admin' || req.user?.role === 'super_admin' ? false : true
  });
  sendSuccess(res, result, 'Listings retrieved successfully');
});

const getListing = asyncHandler(async (req, res) => {
  const result = await service.getListingById(req.params.id, { requirePublic: !req.user });
  sendSuccess(res, result, 'Listing retrieved successfully');
});

const createListing = asyncHandler(async (req, res) => {
  const result = await service.createListing(req.user, req.body);
  sendSuccess(res, result, 'Listing created successfully', 201);
});

const updateListing = asyncHandler(async (req, res) => {
  const result = await service.updateListing(req.user, req.params.id, req.body);
  sendSuccess(res, result, 'Listing updated successfully');
});

const deleteListing = asyncHandler(async (req, res) => {
  const result = await service.deleteListing(req.user, req.params.id);
  sendSuccess(res, result, 'Listing archived successfully');
});

module.exports = {
  listListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
};
