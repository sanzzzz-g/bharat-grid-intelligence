import React, { useEffect, useRef } from 'react';

// Animated number hook
function useAnimatedNumber(value, duration = 800) {
  const ref = useRef(null);
  const prev = useRef(0);

  useEffect(() => {
    if (ref.current === null) return;
    const start = prev.current;
    const end = parseFloat(value) || 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (ref.current) {
        const decimals = String(value).includes('.') ? String(value).split('.')[1].length : 0;
        ref.current.textContent = current.toFixed(decimals);
      }

      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    }

    requestAnimationFrame(step);
  }, [value, duration]);

  return ref;
}

// Individual card
function MetricCard({ icon, label, value, unit, badge, badgeColor, accentColor = '#3b82f6', trend }) {
  const numRef = useAnimatedNumber(parseFloat(value) || 0);

  const colorMap = {
    green: '#22c55e',
    yellow: '#facc15',
    orange: '#f97316',
    red: '#ef4444',
    blue: '#3b82f6',
    cyan: '#06b6d4'
  };

  const color = colorMap[badgeColor] || colorMap.blue;

  return (
    <div
      className="metric-card"
      style={{ '--card-accent': accentColor }}
    >
      <div className="metric-card-header">
        <div
          className="metric-icon"
          style={{ background: `rgba(${hexToRgb(accentColor)}, 0.12)` }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="metric-badge"
            style={{
              background: `rgba(${hexToRgb(color)}, 0.15)`,
              color: color,
              border: `1px solid rgba(${hexToRgb(color)}, 0.3)`
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="metric-label">{label}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
        <span className="metric-value" ref={numRef}>
          {parseFloat(value) || 0}
        </span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>

      {trend && (
        <div style={{
          fontSize: '0.72rem',
          color: trend.positive ? '#22c55e' : '#ef4444',
          fontFamily: 'var(--font-mono)',
          marginTop: '4px'
        }}>
          {trend.positive ? '▲' : '▼'} {trend.text}
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function getRiskBadge(score) {
  if (score <= 30) return { label: 'SECURE', color: 'green' };
  if (score <= 55) return { label: 'MODERATE', color: 'yellow' };
  if (score <= 75) return { label: 'HIGH RISK', color: 'orange' };
  return { label: 'CRITICAL', color: 'red' };
}

function getReserveColor(margin) {
  if (margin >= 10) return 'green';
  if (margin >= 5) return 'yellow';
  if (margin >= 0) return 'orange';
  return 'red';
}

export default function MetricsCards({ metrics }) {
  if (!metrics) {
    return (
      <div className="metrics-section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const {
    totalGeneration = 218,
    totalDemand = 208,
    reserveMargin = 4.8,
    renewableShare = 29,
    congestionIndex = 0.52,
    riskScore = 42
  } = metrics;

  const riskBadge = getRiskBadge(riskScore);
  const reserveColor = getReserveColor(reserveMargin);
  const congestionPct = Math.round(congestionIndex * 100);

  return (
    <div className="metrics-section">
      <div className="section-header">
        <div>
          <div className="section-title">⚡ Grid Operations Center</div>
          <div className="section-subtitle">Real-time national grid metrics · Updated every 30s</div>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          icon="⚡"
          label="Total Power Generation"
          value={totalGeneration}
          unit="GW"
          badge="ONLINE"
          badgeColor="green"
          accentColor="#22c55e"
          trend={{ positive: true, text: '+2.4 GW from yesterday' }}
        />

        <MetricCard
          icon="🔌"
          label="Total Demand"
          value={totalDemand}
          unit="GW"
          badge={totalDemand > totalGeneration ? 'DEFICIT' : 'BALANCED'}
          badgeColor={totalDemand > totalGeneration ? 'red' : 'blue'}
          accentColor="#3b82f6"
        />

        <MetricCard
          icon="📊"
          label="Reserve Margin"
          value={reserveMargin}
          unit="%"
          badge={reserveMargin < 0 ? 'CRITICAL' : reserveMargin < 5 ? 'LOW' : 'ADEQUATE'}
          badgeColor={reserveColor}
          accentColor={reserveColor === 'green' ? '#22c55e' : reserveColor === 'yellow' ? '#facc15' : reserveColor === 'orange' ? '#f97316' : '#ef4444'}
        />

        <MetricCard
          icon="🌱"
          label="Renewable Share"
          value={renewableShare}
          unit="%"
          badge={renewableShare >= 30 ? 'GREEN GRID' : 'BELOW TARGET'}
          badgeColor={renewableShare >= 30 ? 'green' : 'yellow'}
          accentColor="#22c55e"
          trend={{ positive: renewableShare >= 30, text: 'Target: 50% by 2030' }}
        />

        <MetricCard
          icon="🔗"
          label="Transmission Congestion"
          value={congestionPct}
          unit="%"
          badge={congestionPct > 80 ? 'OVERLOADED' : congestionPct > 60 ? 'HIGH' : 'NORMAL'}
          badgeColor={congestionPct > 80 ? 'red' : congestionPct > 60 ? 'orange' : 'green'}
          accentColor={congestionPct > 70 ? '#f97316' : '#3b82f6'}
        />

        <MetricCard
          icon="🛡️"
          label="Energy Security Risk"
          value={riskScore}
          unit="/100"
          badge={riskBadge.label}
          badgeColor={riskBadge.color}
          accentColor={riskBadge.color === 'green' ? '#22c55e' : riskBadge.color === 'yellow' ? '#facc15' : riskBadge.color === 'orange' ? '#f97316' : '#ef4444'}
        />
      </div>
    </div>
  );
}
