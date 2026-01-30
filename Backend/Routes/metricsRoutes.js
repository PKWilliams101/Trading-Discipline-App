const express = require("express");
const router = express.Router();
const metricsController = require("../Controllers/metricsController");

router.get("/:userId", metricsController.getUserMetrics);

module.exports = router;
