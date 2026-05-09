const router = require('express').Router();
const { listFarmers, getFarmer, getFarmerListings } = require('./farmers.controller');

router.get('/', listFarmers);
router.get('/:id', getFarmer);
router.get('/:id/listings', getFarmerListings);

module.exports = router;
