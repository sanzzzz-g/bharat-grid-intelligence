# ⚡ Urja Suraksha & Power Grid Intelligence Dashboard — Bharat

A Bloomberg-style, full-stack national power grid monitoring dashboard with real-time scenario simulation, risk modeling, and weather integration.

---

## 🗂 Project Structure

```
energy-grid-dashboard/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── App.jsx            # Root component, data orchestration
│   │   ├── components/
│   │   │   ├── Hero.jsx           # Animated landing section
│   │   │   ├── MetricsCards.jsx   # Six animated KPI cards
│   │   │   ├── IndiaGridMap.jsx   # Leaflet.js interactive map
│   │   │   ├── GridHeatmap.jsx    # Weather & stress cards
│   │   │   ├── ChartsPanel.jsx    # Five Chart.js charts
│   │   │   ├── ScenarioControls.jsx  # Scenario simulation buttons
│   │   │   ├── AlertSystem.jsx    # Emergency alerts + modal
│   │   │   └── PolicySection.jsx  # Policy glassmorphism cards
│   │   ├── services/
│   │   │   ├── api.js             # Axios API client
│   │   │   └── weatherService.js  # Weather fetch + cache
│   │   └── styles/
│   │       ├── global.css         # Root variables, resets
│   │       └── dashboard.css      # All component styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express
│   ├── server.js              # Express entry point
│   ├── routes/
│   │   ├── energyRoutes.js    # Grid API routes
│   │   └── weatherRoutes.js   # Weather API routes
│   ├── controllers/
│   │   ├── energyController.js
│   │   └── weatherController.js
│   ├── services/
│   │   ├── gridSimulation.js  # Demand/supply simulation engine
│   │   └── riskModel.js       # Risk calculation service
│   ├── utils/
│   │   └── riskCalculator.js  # Weighted risk score calculator
│   ├── data/
│   │   ├── stateEnergyData.json   # 20-state energy dataset
│   │   └── demandProfiles.json    # Hourly/monthly/scenario data
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev       # Uses nodemon for hot reload
# OR
npm start         # Production start
```

Backend runs at: **http://localhost:5001**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🌤️ Weather API Setup (Optional)

The dashboard works with **simulated weather data** out of the box.

To enable live weather:

1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Edit `backend/.env`:
   ```
   OPENWEATHER_API_KEY=your_actual_key_here
   ```
3. Restart the backend

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grid/metrics` | National grid KPIs |
| GET | `/api/grid/states?year=2025` | State-level energy data |
| GET | `/api/grid/demand?scenario=heatwave` | 24h demand/supply curve |
| GET | `/api/grid/generation` | Energy mix + monthly peaks |
| GET | `/api/grid/risk` | Full risk assessment breakdown |
| POST | `/api/grid/scenario` | Apply scenario, get all updated data |
| GET | `/api/weather/:city` | Weather data for Indian city |
| GET | `/api/health` | API health check |

---

## 🔧 Scenarios Available

| Scenario | Trigger | Risk Impact |
|----------|---------|-------------|
| `baseline` | Normal conditions | ~42/100 |
| `gas_disruption` | Gas supply cut by 85% | ~74/100 |
| `heatwave` | Extreme heat surge | ~88/100 🔴 |
| `coal_outage` | Major coal plants offline | ~76/100 |
| `renewable_surge` | Ideal weather conditions | ~24/100 🟢 |
| `festival_demand` | Festive season surge | ~82/100 🔴 |

---

## ⚠️ Alert System

- Triggers when **Risk Score > 80**
- Shows: Emergency modal + flashing banner + SMS notification toast
- Preference saved in **localStorage**
- Use **TEST ALERT** button to demo

---

## 🎨 Design System

- **Dark theme** — Bloomberg control room aesthetic
- **Orbitron** — Display headers
- **Rajdhani** — UI body text
- **Space Mono** — Data/numbers
- **Glassmorphism** cards with glow effects
- Animated metric counters + scan line animations

---

## 📊 Risk Model

```
Risk Score (0-100) = 
  Import Dependency     × 25% +
  Low Reserve Margin    × 25% +
  Renewable Intermittency × 20% +
  Transmission Congestion × 15% +
  Weather Impact        × 15%
```

Risk Levels:
- 🟢 **0-30**: Secure
- 🟡 **31-55**: Moderate  
- 🟠 **56-75**: High
- 🔴 **76-100**: Critical

---

## 📝 Notes

- Frontend auto-refreshes data every 30 seconds
- Map uses dark Carto tile layer with state circle markers
- All data is simulated for demonstration purposes
- Heatmap toggle adds a visual stress overlay on the map
- Weather data is cached for 5 minutes client-side
