const router = require('express').Router();
const { getPublicStatus } = require('./system.controller');

router.get('/status', getPublicStatus);

module.exports = router;
