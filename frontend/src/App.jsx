import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles/dashboard.css';

import Hero from './components/Hero';
import MetricsCards from './components/MetricsCards';
import IndiaGridMap from './components/IndiaGridMap';
import WeatherCards from './components/GridHeatmap';
import ChartsPanel from './components/ChartsPanel';
import ScenarioControls from './components/ScenarioControls';
import AlertSystem from './components/AlertSystem';
import PolicySection from './components/PolicySection';

import { gridApi } from './services/api';
import { fetchAllCityWeather } from './services/weatherService';

// Dashboard header with live clock
function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-header">
      <div className="dashboard-title">⚡ BHARAT URJA GRID INTELLIGENCE</div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div className="dashboard-status">
          <span className="status-dot" />
          ALL SYSTEMS NOMINAL
        </div>
        <div className="dashboard-time">
          {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          {' · '}
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Dashboard state
  const [metrics, setMetrics] = useState(null);
  const [states, setStates] = useState([]);
  const [demandCurve, setDemandCurve] = useState(null);
  const [energyMix, setEnergyMix] = useState(null);
  const [monthlyPeak, setMonthlyPeak] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [weatherData, setWeatherData] = useState([]);

  // UI state
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Baseline grid conditions – normal operations');

  const refreshInterval = useRef(null);

  // Load all data for a scenario
  const loadScenarioData = useCallback(async (scenario, year) => {
    try {
      setLoading(true);

      const result = await gridApi.applyScenario(scenario, year);

      if (result.success) {
        const { data } = result;
        setMetrics(data.metrics);
        setStates(data.states);
        setDemandCurve(data.demandCurve);
        setEnergyMix(data.energyMix);
        setMonthlyPeak(data.monthlyPeak);
        setRiskData(data.risk);
        setHeatmapData(data.heatmapData || []);
        setStatusMessage(result.description || 'Scenario applied');
      }
    } catch (err) {
      console.error('Failed to load scenario data:', err);
      // Use fallback data if API is unavailable
      setFallbackData(scenario);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Fallback data when backend is unavailable
  const setFallbackData = (scenario) => {
    const scenarioMap = {
      baseline: { totalGeneration: 218, totalDemand: 208, reserveMargin: 4.8, renewableShare: 29, congestionIndex: 0.52, riskScore: 42 },
      gas_disruption: { totalGeneration: 204, totalDemand: 208, reserveMargin: -1.9, renewableShare: 29, congestionIndex: 0.78, riskScore: 74 },
      heatwave: { totalGeneration: 218, totalDemand: 242, reserveMargin: -9.9, renewableShare: 26, congestionIndex: 0.88, riskScore: 88 },
      coal_outage: { totalGeneration: 195, totalDemand: 208, reserveMargin: -6.2, renewableShare: 35, congestionIndex: 0.72, riskScore: 76 },
      renewable_surge: { totalGeneration: 235, totalDemand: 208, reserveMargin: 12.9, renewableShare: 52, congestionIndex: 0.38, riskScore: 24 },
      festival_demand: { totalGeneration: 218, totalDemand: 238, reserveMargin: -8.4, renewableShare: 28, congestionIndex: 0.92, riskScore: 82 }
    };

    const data = scenarioMap[scenario] || scenarioMap.baseline;
    setMetrics(data);

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const baseDemand = [148, 142, 138, 135, 132, 136, 145, 162, 178, 192, 205, 214, 218, 220, 215, 210, 208, 218, 235, 248, 242, 228, 210, 182];
    setDemandCurve({ labels: hours, demand: baseDemand, supply: baseDemand.map(v => Math.round(v * 1.025)) });

    setEnergyMix({ coal: 48, gas: 8, nuclear: 3, hydro: 11, solar: 18, wind: 10, other: 2 });
    setMonthlyPeak({
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data: [202, 195, 210, 235, 262, 280, 295, 290, 260, 240, 220, 230]
    });
    setRiskData({
      overallScore: data.riskScore,
      components: [
        { label: 'Import Dependency', score: 45 },
        { label: 'Reserve Margin Risk', score: data.reserveMargin < 0 ? 85 : 60 },
        { label: 'Renewable Intermittency', score: 30 },
        { label: 'Transmission Congestion', score: data.congestionIndex * 100 },
        { label: 'Weather Impact', score: 35 }
      ]
    });
    setStatusMessage('Using offline data – backend may be unavailable');
  };

  // Load weather data
  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchAllCityWeather();
      if (data.length > 0) setWeatherData(data);
    };
    loadWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial data load
  useEffect(() => {
    loadScenarioData('baseline', '2025');
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshInterval.current = setInterval(() => {
      loadScenarioData(activeScenario, selectedYear);
    }, 30000);
    return () => clearInterval(refreshInterval.current);
  }, [activeScenario, selectedYear, loadScenarioData]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario) => {
    setActiveScenario(scenario);
    loadScenarioData(scenario, selectedYear);
  }, [selectedYear, loadScenarioData]);

  // Handle year change
  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
    loadScenarioData(activeScenario, year);
  }, [activeScenario, loadScenarioData]);

  const riskScore = riskData?.overallScore || metrics?.riskScore || 0;
  const riskComponents = riskData?.components;

  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        gap: '20px'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: '#3b82f6',
          letterSpacing: '0.1em'
        }}>
          ⚡ INITIALIZING GRID SYSTEMS
        </div>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          animation: 'blink 1s infinite'
        }}>
          Loading national grid data...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero landing section */}
      <Hero />

      {/* Main dashboard */}
      <div id="dashboard">
        <DashboardHeader />

        {/* Alert System (renders modals/banners) */}
        <AlertSystem riskScore={riskScore} />

        {/* Scenario Controls */}
        <ScenarioControls
          activeScenario={activeScenario}
          onScenarioChange={handleScenarioChange}
          loading={loading}
          statusMessage={statusMessage}
        />

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* India Grid Map */}
        <IndiaGridMap
          states={states}
          year={selectedYear}
          onYearChange={handleYearChange}
          heatmapEnabled={heatmapEnabled}
          onToggleHeatmap={() => setHeatmapEnabled(p => !p)}
          heatmapData={heatmapData}
        />

        {/* Power Analytics Charts */}
        <ChartsPanel
          demandCurve={demandCurve}
          energyMix={energyMix}
          monthlyPeak={monthlyPeak}
          riskComponents={riskComponents}
          scenario={activeScenario}
          scenario={activeScenario}
        />

        {/* Weather Monitor */}
        {weatherData.length > 0 && (
          <WeatherCards weatherData={weatherData} loading={false} />
        )}

        {/* Policy Section */}
        <PolicySection />
      </div>
    </>
  );
}
