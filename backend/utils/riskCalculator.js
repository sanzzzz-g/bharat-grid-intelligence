/**
 * Risk Calculator Utility
 * Calculates Energy Security Risk Score using weighted components
 */

/**
 * Calculate energy security risk score (0-100)
 * Weights:
 *   Import Dependency    → 25%
 *   Low Reserve Margin   → 25%
 *   Renewable Intermittency → 20%
 *   Transmission Congestion → 15%
 *   Weather Impact       → 15%
 */
function calculateRiskScore({
  importDependency = 0,      // 0-1 fraction
  reserveMargin = 0,         // percentage, can be negative
  renewableShare = 0,        // 0-100 percentage
  congestionIndex = 0,       // 0-1 fraction
  weatherStress = 0          // 0-1 fraction (0=mild, 1=extreme)
} = {}) {

  // Import Dependency Risk (25%)
  // Higher import = higher risk
  const importRisk = Math.min(importDependency * 100, 100) * 0.25;

  // Reserve Margin Risk (25%)
  // Negative margin = critical, >15% = secure
  let reserveRisk;
  if (reserveMargin >= 15) reserveRisk = 0;
  else if (reserveMargin >= 10) reserveRisk = 20;
  else if (reserveMargin >= 5) reserveRisk = 45;
  else if (reserveMargin >= 0) reserveRisk = 70;
  else reserveRisk = Math.min(100, 85 + Math.abs(reserveMargin) * 2);
  const reserveComponent = reserveRisk * 0.25;

  // Renewable Intermittency Risk (20%)
  // Very high renewable share = higher intermittency risk
  // Very low = no intermittency but higher fossil risk
  const renewableRisk = renewableShare > 60
    ? (renewableShare - 60) * 1.5
    : renewableShare < 10
      ? 60
      : 20 - (renewableShare - 10) * 0.4;
  const renewableComponent = Math.max(0, Math.min(100, renewableRisk)) * 0.20;

  // Transmission Congestion Risk (15%)
  const congestionRisk = congestionIndex * 100;
  const congestionComponent = congestionRisk * 0.15;

  // Weather Impact Risk (15%)
  const weatherRisk = weatherStress * 100;
  const weatherComponent = weatherRisk * 0.15;

  // Total risk score
  const totalRisk = importComponent(importDependency) + reserveComponent + renewableComponent + congestionComponent + weatherComponent;

  // Clamp between 0 and 100
  return Math.round(Math.max(0, Math.min(100, totalRisk)));
}

// Helper to compute import component cleanly
function importComponent(importDependency) {
  return Math.min(importDependency * 100, 100) * 0.25;
}

/**
 * Get risk level label and color based on score
 */
function getRiskLevel(score) {
  if (score <= 30) return { level: 'Secure', color: '#22c55e', colorName: 'green' };
  if (score <= 55) return { level: 'Moderate', color: '#facc15', colorName: 'yellow' };
  if (score <= 75) return { level: 'High', color: '#f97316', colorName: 'orange' };
  return { level: 'Critical', color: '#ef4444', colorName: 'red' };
}

/**
 * Calculate weather stress factor from weather data
 */
function calculateWeatherStress(weatherData) {
  if (!weatherData) return 0.2;

  const { temp = 25, windSpeed = 5, condition = '' } = weatherData;

  let stress = 0;

  // Temperature stress (extreme heat or cold)
  if (temp > 42) stress += 0.4;
  else if (temp > 38) stress += 0.25;
  else if (temp > 35) stress += 0.15;
  else if (temp < 5) stress += 0.20;
  else if (temp < 10) stress += 0.10;

  // Wind stress (impacts renewable generation)
  if (windSpeed < 2) stress += 0.15; // Too low for wind
  else if (windSpeed > 20) stress += 0.10; // Too high, turbines shut down

  // Weather condition stress
  const condLower = condition.toLowerCase();
  if (condLower.includes('storm') || condLower.includes('thunder')) stress += 0.25;
  else if (condLower.includes('rain') || condLower.includes('drizzle')) stress += 0.10;
  else if (condLower.includes('cloud')) stress += 0.05; // Reduces solar

  return Math.min(1.0, stress);
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  calculateWeatherStress
};
