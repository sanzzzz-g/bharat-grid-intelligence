/**
 * Weather Controller
 * Handles weather data fetching from OpenWeatherMap API
 */

const axios = require('axios');

const OWM_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fallback simulated weather data for demo/offline mode
const simulatedWeather = {
  'Delhi': { temp: 38, condition: 'Haze', windSpeed: 4.2, humidity: 48, city: 'Delhi' },
  'Mumbai': { temp: 32, condition: 'Partly Cloudy', windSpeed: 7.8, humidity: 72, city: 'Mumbai' },
  'Chennai': { temp: 35, condition: 'Clear', windSpeed: 5.5, humidity: 65, city: 'Chennai' },
  'Kolkata': { temp: 34, condition: 'Cloudy', windSpeed: 3.2, humidity: 80, city: 'Kolkata' },
  'Bangalore': { temp: 28, condition: 'Clear', windSpeed: 6.1, humidity: 55, city: 'Bangalore' },
  'Hyderabad': { temp: 36, condition: 'Clear', windSpeed: 4.8, humidity: 42, city: 'Hyderabad' },
  'Jaipur': { temp: 40, condition: 'Clear', windSpeed: 3.5, humidity: 25, city: 'Jaipur' },
  'Ahmedabad': { temp: 39, condition: 'Haze', windSpeed: 5.2, humidity: 30, city: 'Ahmedabad' }
};

/**
 * GET /api/weather/:city
 * Fetch weather data for a given city
 */
async function getWeather(req, res) {
  const { city } = req.params;

  try {
    // Try live API if key is configured
    if (OWM_API_KEY && OWM_API_KEY !== 'demo_key' && OWM_API_KEY !== 'YOUR_API_KEY') {
      const response = await axios.get(`${OWM_BASE_URL}/weather`, {
        params: {
          q: `${city},IN`,
          appid: OWM_API_KEY,
          units: 'metric'
        },
        timeout: 5000
      });

      const { main, weather, wind } = response.data;
      return res.json({
        success: true,
        data: {
          city,
          temp: Math.round(main.temp),
          feelsLike: Math.round(main.feels_like),
          condition: weather[0].description,
          windSpeed: wind.speed,
          humidity: main.humidity,
          icon: weather[0].icon,
          live: true
        }
      });
    }

    // Fallback to simulated data
    const cityKey = Object.keys(simulatedWeather).find(
      k => k.toLowerCase() === city.toLowerCase()
    ) || 'Delhi';

    const data = simulatedWeather[cityKey];

    // Add slight randomness to simulated data
    res.json({
      success: true,
      data: {
        ...data,
        temp: data.temp + Math.round((Math.random() - 0.5) * 4),
        windSpeed: Math.round((data.windSpeed + (Math.random() - 0.5) * 2) * 10) / 10,
        live: false,
        note: 'Simulated data - add OPENWEATHER_API_KEY to .env for live data'
      }
    });

  } catch (err) {
    console.error(`Weather fetch error for ${city}:`, err.message);

    // Return fallback on any error
    const fallback = simulatedWeather[city] || simulatedWeather['Delhi'];
    res.json({
      success: true,
      data: {
        ...fallback,
        live: false,
        note: 'Using simulated data due to API error'
      }
    });
  }
}

module.exports = { getWeather };
