const router = require('express').Router();
const validate = require('../../middleware/validate');
const { listFarmers, getFarmer, getFarmerListings } = require('./farmers.controller');
const { listFarmersQuerySchema } = require('./farmers.validators');

router.get('/', validate(listFarmersQuerySchema, 'query'), listFarmers);
router.get('/:id', getFarmer);
router.get('/:id/listings', getFarmerListings);

module.exports = router;
