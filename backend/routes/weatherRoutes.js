/**
 * Weather Routes
 */

const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather/:city
router.get('/:city', weatherController.getWeather);

module.exports = router;
