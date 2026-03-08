/**
 * Energy Routes
 * Defines all grid-related API endpoints
 */

const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energyController');

// GET /api/grid/metrics - National grid metrics
router.get('/metrics', energyController.getMetrics);

// GET /api/grid/states - State-level energy data
router.get('/states', energyController.getStates);

// GET /api/grid/demand - Hourly demand/supply curve
router.get('/demand', energyController.getDemand);

// GET /api/grid/generation - Energy mix & monthly peak
router.get('/generation', energyController.getGeneration);

// GET /api/grid/risk - Comprehensive risk assessment
router.get('/risk', energyController.getRisk);

// POST /api/grid/scenario - Apply scenario and get all updated data
router.post('/scenario', energyController.applyScenario);

module.exports = router;
