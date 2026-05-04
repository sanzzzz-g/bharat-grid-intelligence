require('dotenv').config();
const express = require('express');
const cors = require('cors');
const energyRoutes = require('./routes/energyRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://bharat-grid-intelligence.netlify.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/grid', energyRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Energy Grid Dashboard API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`\n⚡ Energy Grid Dashboard API running on http://localhost:${PORT}`);
});

module.exports = app;
