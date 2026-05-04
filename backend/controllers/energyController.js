/**
 * Energy Controller
 * Handles all grid-related API requests
 */

const gridSimulation = require('../services/gridSimulation');
const riskModel = require('../services/riskModel');

/**
 * GET /api/grid/metrics
 * Returns national grid metrics
 */
async function getMetrics(req, res) {
  try {
    const scenario = req.query.scenario || 'baseline';
    const metrics = gridSimulation.getNationalMetrics(scenario);
    res.json({ success: true, data: metrics });
  } catch (err) {
    console.error('Error getting metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/grid/states
 * Returns state-level energy data
 */
async function getStates(req, res) {
  try {
    const year = req.query.year || '2025';
    const states = riskModel.calculateStateRisks(year);
    res.json({ success: true, data: states });
  } catch (err) {
    console.error('Error getting states:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/grid/demand
 * Returns hourly demand/supply curve
 */
async function getDemand(req, res) {
  try {
    const scenario = req.query.scenario || 'baseline';
    const curve = gridSimulation.generateHourlyDemandCurve(scenario);
    res.json({ success: true, data: curve });
  } catch (err) {
    console.error('Error getting demand:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/grid/generation
 * Returns energy mix and monthly peak demand
 */
async function getGeneration(req, res) {
  try {
    const scenario = req.query.scenario || 'baseline';
    const year = req.query.year || '2025';
    const energyMix = gridSimulation.getEnergyMix(scenario);
    const monthlyPeak = gridSimulation.getMonthlyPeakDemand(year);
    const heatmapData = gridSimulation.generateHeatmapData(scenario);

    res.json({
      success: true,
      data: {
        energyMix,
        monthlyPeak,
        heatmapData
      }
    });
  } catch (err) {
    console.error('Error getting generation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/grid/risk
 * Returns comprehensive risk assessment
 */
async function getRisk(req, res) {
  try {
    const scenario = req.query.scenario || 'baseline';
    const risk = riskModel.calculateNationalRisk(scenario);
    res.json({ success: true, data: risk });
  } catch (err) {
    console.error('Error getting risk:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/grid/scenario
 * Apply a scenario and return all updated data
 */
async function applyScenario(req, res) {
  try {
    const { scenario = 'baseline', year = '2025', weatherData = null } = req.body;

    const validScenarios = ['baseline', 'gas_disruption', 'heatwave', 'coal_outage', 'renewable_surge', 'festival_demand'];
    if (!validScenarios.includes(scenario)) {
      return res.status(400).json({ success: false, error: 'Invalid scenario' });
    }

    const [metrics, demandCurve, generation, risk, states] = await Promise.all([
      Promise.resolve(gridSimulation.getNationalMetrics(scenario)),
      Promise.resolve(gridSimulation.generateHourlyDemandCurve(scenario)),
      Promise.resolve({
        energyMix: gridSimulation.getEnergyMix(scenario),
        monthlyPeak: gridSimulation.getMonthlyPeakDemand(year),
        heatmapData: gridSimulation.generateHeatmapData(scenario)
      }),
      Promise.resolve(riskModel.calculateNationalRisk(scenario, weatherData)),
      Promise.resolve(riskModel.calculateStateRisks(year))
    ]);

    const demandProfiles = require('../data/demandProfiles.json');
    const scenarioInfo = demandProfiles.scenarios[scenario];

    res.json({
      success: true,
      scenario,
      description: scenarioInfo?.description || 'Baseline grid conditions',
      data: {
        metrics,
        demandCurve,
        energyMix: generation.energyMix,
        monthlyPeak: generation.monthlyPeak,
        heatmapData: generation.heatmapData,
        risk,
        states
      }
    });
  } catch (err) {
    console.error('Error applying scenario:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getMetrics,
  getStates,
  getDemand,
  getGeneration,
  getRisk,
  applyScenario
};
