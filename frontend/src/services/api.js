import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err.message);
    throw err;
  }
);

export const gridApi = {
  getMetrics: (scenario = 'baseline') => api.get(`/grid/metrics?scenario=${scenario}`),
  getStates: (year = '2025') => api.get(`/grid/states?year=${year}`),
  getDemand: (scenario = 'baseline') => api.get(`/grid/demand?scenario=${scenario}`),
  getGeneration: (scenario = 'baseline', year = '2025') => api.get(`/grid/generation?scenario=${scenario}&year=${year}`),
  getRisk: (scenario = 'baseline') => api.get(`/grid/risk?scenario=${scenario}`),
  applyScenario: (scenario, year = '2025', weatherData = null) => api.post('/grid/scenario', { scenario, year, weatherData })
};

export const weatherApi = {
  getWeather: (city) => api.get(`/weather/${encodeURIComponent(city)}`)
};

export default api;
