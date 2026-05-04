/**
 * Weather Service
 * Manages weather data fetching and caching
 */

import { weatherApi } from './api';

const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Jaipur', 'Ahmedabad'];
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cache = new Map();

/**
 * Fetch weather for a single city with caching
 */
export async function fetchCityWeather(city) {
  const now = Date.now();
  const cached = cache.get(city);

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await weatherApi.getWeather(city);
    const data = response.data.data;

    cache.set(city, { data, timestamp: now });
    return data;
  } catch (err) {
    console.error(`Failed to fetch weather for ${city}:`, err);
    return null;
  }
}

/**
 * Fetch weather for all major Indian cities
 */
export async function fetchAllCityWeather() {
  const results = await Promise.allSettled(
    CITIES.map(city => fetchCityWeather(city))
  );

  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
}

/**
 * Calculate aggregate weather stress for grid planning
 */
export function calculateAggregateStress(weatherData) {
  if (!weatherData || weatherData.length === 0) return 0.2;

  const stresses = weatherData.map(w => {
    let stress = 0;
    if (w.temp > 42) stress += 0.4;
    else if (w.temp > 38) stress += 0.25;
    else if (w.temp > 35) stress += 0.15;
    if (w.windSpeed < 2) stress += 0.1;
    if (w.condition?.toLowerCase().includes('storm')) stress += 0.2;
    return Math.min(1, stress);
  });

  return stresses.reduce((a, b) => a + b, 0) / stresses.length;
}

export { CITIES };
