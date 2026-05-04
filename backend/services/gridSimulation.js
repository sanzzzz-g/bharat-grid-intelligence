/**
 * Grid Simulation Service
 * Simulates energy demand curves, generation mix, renewable variability,
 * congestion, and weather stress for the Indian power grid
 */

const demandProfiles = require('../data/demandProfiles.json');
const stateEnergyData = require('../data/stateEnergyData.json');

/**
 * Generate hourly demand curve with realistic variability
 */
function generateHourlyDemandCurve(scenario = 'baseline', date = new Date()) {
  const base = demandProfiles.hourlyDemand;
  const baseSupply = demandProfiles.hourlySupply;

  let demandMultiplier = 1.0;
  let supplyMultiplier = 1.0;

  switch (scenario) {
    case 'heatwave':
      demandMultiplier = 1.16;
      supplyMultiplier = 0.95; // Heat reduces thermal efficiency
      break;
    case 'gas_disruption':
      demandMultiplier = 1.0;
      supplyMultiplier = 0.935; // Gas plants offline
      break;
    case 'coal_outage':
      demandMultiplier = 1.0;
      supplyMultiplier = 0.895; // Coal plants offline
      break;
    case 'renewable_surge':
      demandMultiplier = 1.0;
      supplyMultiplier = 1.078; // Extra renewable output
      break;
    case 'festival_demand':
      demandMultiplier = 1.144;
      supplyMultiplier = 1.0;
      break;
  }

  // Add realistic noise (±3%)
  const addNoise = (val) => val * (1 + (Math.random() - 0.5) * 0.06);

  return {
    demand: base.map(v => Math.round(addNoise(v * demandMultiplier) * 10) / 10),
    supply: baseSupply.map(v => Math.round(addNoise(v * supplyMultiplier) * 10) / 10),
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  };
}

/**
 * Get current energy mix based on scenario
 */
function getEnergyMix(scenario = 'baseline') {
  const base = { ...demandProfiles.energyMix };

  switch (scenario) {
    case 'gas_disruption':
      return { ...base, gas: 1, coal: 56, solar: 19, wind: 11, hydro: 11 };
    case 'coal_outage':
      return { ...base, coal: 30, gas: 10, solar: 25, wind: 16, hydro: 15, nuclear: 4 };
    case 'renewable_surge':
      return { ...base, solar: 28, wind: 18, coal: 35, gas: 8, hydro: 9, nuclear: 2 };
    case 'heatwave':
      return { ...base, coal: 52, gas: 9, solar: 16, wind: 9, hydro: 10, nuclear: 4 };
    case 'festival_demand':
      return { ...base, coal: 55, gas: 10, solar: 17, wind: 9, hydro: 7, nuclear: 2 };
    default:
      return base;
  }
}

/**
 * Get monthly peak demand trend for a given year
 */
function getMonthlyPeakDemand(year = '2025') {
  const data = demandProfiles.monthlyPeakDemand[year] || demandProfiles.monthlyPeakDemand['2025'];
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data
  };
}

/**
 * Get all state data with optional year modifier
 */
function getStateData(year = '2025') {
  const yearModifiers = {
    '2023': { demandMod: 0.92, renewableMod: 0.85, riskMod: 1.08 },
    '2024': { demandMod: 0.96, renewableMod: 0.92, riskMod: 1.04 },
    '2025': { demandMod: 1.0, renewableMod: 1.0, riskMod: 1.0 }
  };

  const mod = yearModifiers[year] || yearModifiers['2025'];

  return stateEnergyData.states.map(state => ({
    ...state,
    demand: Math.round(state.demand * mod.demandMod),
    renewableShare: Math.round(state.renewableShare * mod.renewableMod),
    riskScore: Math.min(100, Math.round(state.riskScore * mod.riskMod))
  }));
}

/**
 * Generate heatmap data points based on grid stress
 */
function generateHeatmapData(scenario = 'baseline') {
  const states = getStateData('2025');
  const scenarioData = demandProfiles.scenarios[scenario] || demandProfiles.scenarios.baseline;

  return states.map(state => {
    // Calculate intensity based on multiple factors
    const demandSupplyGap = Math.max(0, (state.demand - state.installedCapacity) / state.installedCapacity + 0.1);
    const congestion = state.transmissionCongestion;
    const riskNorm = state.riskScore / 100;

    // Scenario multiplier
    const scenMult = scenarioData.riskScore / demandProfiles.scenarios.baseline.riskScore;

    const intensity = Math.min(1.0, (demandSupplyGap * 0.3 + congestion * 0.4 + riskNorm * 0.3) * scenMult);

    return {
      lat: state.lat,
      lng: state.lng,
      intensity: Math.round(intensity * 1000) / 1000,
      state: state.name
    };
  });
}

/**
 * Calculate national grid metrics
 */
function getNationalMetrics(scenario = 'baseline', weatherStress = 0.2) {
  const scenData = demandProfiles.scenarios[scenario] || demandProfiles.scenarios.baseline;
  const energyMix = getEnergyMix(scenario);

  const renewableShare = (energyMix.solar + energyMix.wind + energyMix.hydro) || 0;

  return {
    totalGeneration: scenData.totalGeneration,
    totalDemand: scenData.totalDemand,
    reserveMargin: scenData.reserveMargin,
    renewableShare,
    congestionIndex: scenData.congestionIndex,
    riskScore: scenData.riskScore,
    energyMix,
    scenario,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateHourlyDemandCurve,
  getEnergyMix,
  getMonthlyPeakDemand,
  getStateData,
  generateHeatmapData,
  getNationalMetrics
};
