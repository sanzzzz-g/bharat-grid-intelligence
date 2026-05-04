import React from 'react';

const SCENARIOS = [
  {
    id: 'baseline',
    name: 'Baseline',
    icon: '⚡',
    desc: 'Normal grid operations',
    color: '#3b82f6'
  },
  {
    id: 'gas_disruption',
    name: 'Gas Disruption',
    icon: '💨',
    desc: 'Gas supply cut by 85%',
    color: '#f97316'
  },
  {
    id: 'heatwave',
    name: 'Heatwave',
    icon: '🌡️',
    desc: 'Extreme heat, surge demand',
    color: '#ef4444'
  },
  {
    id: 'coal_outage',
    name: 'Coal Outage',
    icon: '⛏️',
    desc: 'Major coal plants offline',
    color: '#facc15'
  },
  {
    id: 'renewable_surge',
    name: 'Renewable Surge',
    icon: '🌞',
    desc: 'Ideal generation conditions',
    color: '#22c55e'
  },
  {
    id: 'festival_demand',
    name: 'Festival Demand',
    icon: '🎆',
    desc: 'Festive season surge',
    color: '#8b5cf6'
  }
];

export default function ScenarioControls({ activeScenario, onScenarioChange, loading, statusMessage }) {
  return (
    <div className="scenario-section">
      <div className="scenario-container">
        <div className="section-title">🔧 Scenario Simulation Engine</div>
        <div className="section-subtitle" style={{ marginBottom: 0 }}>
          Simulate grid stress events and analyze impact on energy security
        </div>

        <div className="scenario-buttons">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              className={`scenario-btn ${activeScenario === scenario.id ? 'active' : ''}`}
              style={{ '--scenario-color': scenario.color }}
              onClick={() => onScenarioChange(scenario.id)}
              disabled={loading}
            >
              <span className="scenario-icon">{scenario.icon}</span>
              <span className="scenario-name">{scenario.name}</span>
              <span className="scenario-desc">{scenario.desc}</span>
            </button>
          ))}
        </div>

        {/* Status message */}
        {loading && (
          <div className="scenario-status" style={{ borderLeftColor: '#3b82f6' }}>
            <span style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
              ⟳ Simulating scenario... recalculating grid metrics
            </span>
          </div>
        )}

        {statusMessage && !loading && (
          <div className="scenario-status">
            <span style={{ marginRight: '8px' }}>
              {SCENARIOS.find(s => s.id === activeScenario)?.icon}
            </span>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
