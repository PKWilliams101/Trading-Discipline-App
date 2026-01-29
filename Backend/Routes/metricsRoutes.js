const express = require('express');
const router = express.Router();
const metricsController = require('../Controllers/metricsController');

// GET /api/metrics/:userId
router.get('/:userId', metricsController.getUserMetrics);

module.exports = router;