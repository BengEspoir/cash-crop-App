const router = require('express').Router();
const validate = require('../../middleware/validate');
const { authenticate, authorize, optionalAuth, requireDashboardAccess } = require('../../middleware/auth');
const {
  listListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
} = require('./listings.controller');
const { listingPayloadSchema, listingUpdateSchema } = require('./listings.validators');

router.get('/', optionalAuth, listListings);
router.get('/:id', optionalAuth, getListing);
router.post('/', authenticate, requireDashboardAccess, authorize('farmer', 'reseller'), validate(listingPayloadSchema), createListing);
router.patch('/:id', authenticate, requireDashboardAccess, authorize('farmer', 'reseller'), validate(listingUpdateSchema), updateListing);
router.delete('/:id', authenticate, requireDashboardAccess, authorize('farmer', 'reseller'), deleteListing);

module.exports = router;
