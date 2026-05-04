import React from 'react';

export default function Hero({ onLaunch }) {
  return (
    <section className="hero-section">
      {/* Animated background layers */}
      <div className="hero-bg-gradient" />
      <div className="hero-grid" />
      <div className="hero-scan-line" />

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#22c55e' : '#06b6d4',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `pulse-glow ${2 + Math.random() * 3}s infinite`,
            animationDelay: Math.random() * 2 + 's'
          }} />
        ))}
      </div>

      <div className="hero-content">
        {/* Live badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          NATIONAL POWER CONTROL CENTER · LIVE MONITORING
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Urja Suraksha &<br />Power Grid Intelligence
        </h1>
        <p className="hero-subtitle">Dashboard — Bharat</p>

        <p className="hero-description">
          Real-time monitoring of national grid stability, demand forecasting,
          renewable integration, and energy security risk across all Indian states.
        </p>

        {/* Key stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">218 GW</span>
            <span className="hero-stat-label">Peak Generation</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">28+</span>
            <span className="hero-stat-label">States Monitored</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">29%</span>
            <span className="hero-stat-label">Renewable Share</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">500 GW</span>
            <span className="hero-stat-label">2030 RE Target</span>
          </div>
        </div>

        {/* CTA */}
        <a href="#dashboard" className="hero-cta" onClick={onLaunch}>
          <span>⚡</span>
          Launch Control Panel
        </a>
      </div>
    </section>
  );
}
