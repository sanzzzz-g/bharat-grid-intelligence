/**
 * Risk Model Service
 * Provides comprehensive energy security risk analysis
 */

const { calculateRiskScore, getRiskLevel, calculateWeatherStress } = require('../utils/riskCalculator');
const { getStateData, getNationalMetrics } = require('./gridSimulation');

/**
 * Calculate full risk report for national grid
 */
function calculateNationalRisk(scenario = 'baseline', weatherData = null) {
  const metrics = getNationalMetrics(scenario);
  const weatherStress = calculateWeatherStress(weatherData);

  const reserveMargin = metrics.reserveMargin;
  const renewableShare = metrics.renewableShare;
  const congestionIndex = metrics.congestionIndex;

  // Estimate import dependency based on scenario
  const importDependencyMap = {
    baseline: 0.18,
    gas_disruption: 0.22,
    coal_outage: 0.20,
    heatwave: 0.24,
    renewable_surge: 0.12,
    festival_demand: 0.25
  };

  const importDependency = importDependencyMap[scenario] || 0.18;

  // Risk components breakdown
  const components = {
    importDependency: {
      value: importDependency,
      score: Math.min(importDependency * 100, 100),
      weight: 0.25,
      label: 'Import Dependency'
    },
    reserveMargin: {
      value: reserveMargin,
      score: reserveMargin >= 15 ? 0
        : reserveMargin >= 10 ? 20
        : reserveMargin >= 5 ? 45
        : reserveMargin >= 0 ? 70
        : Math.min(100, 85 + Math.abs(reserveMargin) * 2),
      weight: 0.25,
      label: 'Reserve Margin Risk'
    },
    renewableIntermittency: {
      value: renewableShare,
      score: renewableShare > 60
        ? (renewableShare - 60) * 1.5
        : renewableShare < 10 ? 60 : 20 - (renewableShare - 10) * 0.4,
      weight: 0.20,
      label: 'Renewable Intermittency'
    },
    transmissionCongestion: {
      value: congestionIndex,
      score: congestionIndex * 100,
      weight: 0.15,
      label: 'Transmission Congestion'
    },
    weatherImpact: {
      value: weatherStress,
      score: weatherStress * 100,
      weight: 0.15,
      label: 'Weather Impact'
    }
  };

  const overallScore = Object.values(components).reduce((sum, c) => {
    return sum + Math.max(0, Math.min(100, c.score)) * c.weight;
  }, 0);

  const clampedScore = Math.round(Math.max(0, Math.min(100, overallScore)));
  const riskLevel = getRiskLevel(clampedScore);

  return {
    overallScore: clampedScore,
    riskLevel: riskLevel.level,
    riskColor: riskLevel.color,
    components: Object.entries(components).map(([key, c]) => ({
      key,
      label: c.label,
      value: c.value,
      score: Math.max(0, Math.min(100, c.score)),
      weight: c.weight,
      weightedScore: Math.max(0, Math.min(100, c.score)) * c.weight
    })),
    scenario,
    weatherStress,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate state-level risk scores
 */
function calculateStateRisks(year = '2025') {
  const states = getStateData(year);

  return states.map(state => {
    const riskLevel = getRiskLevel(state.riskScore);
    return {
      ...state,
      riskLevel: riskLevel.level,
      riskColor: riskLevel.color
    };
  });
}

module.exports = {
  calculateNationalRisk,
  calculateStateRisks
};
