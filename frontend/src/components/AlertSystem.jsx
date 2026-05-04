import React, { useState, useEffect } from 'react';

export default function AlertSystem({ riskScore = 0 }) {
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    try {
      return localStorage.getItem('alertsEnabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [prevRisk, setPrevRisk] = useState(0);

  // Persist alerts preference
  useEffect(() => {
    try {
      localStorage.setItem('alertsEnabled', String(alertsEnabled));
    } catch {}
  }, [alertsEnabled]);

  // Trigger alerts when risk crosses threshold
  useEffect(() => {
    if (!alertsEnabled) {
      setShowModal(false);
      setShowBanner(false);
      setShowSms(false);
      return;
    }

    const wasAbove = prevRisk >= 80;
    const isAbove = riskScore >= 80;

    if (isAbove && !wasAbove) {
      // Trigger all alerts
      setShowModal(true);
      setShowBanner(true);

      // Show SMS toast after delay
      setTimeout(() => setShowSms(true), 1500);
      // Auto-hide SMS after 6 seconds
      setTimeout(() => setShowSms(false), 7500);
    } else if (!isAbove) {
      setShowModal(false);
      setShowBanner(false);
    }

    setPrevRisk(riskScore);
  }, [riskScore, alertsEnabled]);

  const getRiskColor = () => {
    if (riskScore <= 30) return '#22c55e';
    if (riskScore <= 55) return '#facc15';
    if (riskScore <= 75) return '#f97316';
    return '#ef4444';
  };

  return (
    <>
      {/* Alert Controls Panel */}
      <div className="alert-controls">
        <div className="alert-card">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              🚨 Emergency Alert System
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Triggers when Risk Score exceeds 80/100 · Preference saved locally
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Current risk indicator */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: getRiskColor(),
                textShadow: `0 0 12px ${getRiskColor()}80`
              }}>
                {riskScore}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                CURRENT RISK
              </div>
            </div>

            {/* Threshold indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: riskScore >= 80 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${riskScore >= 80 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '1rem' }}>{riskScore >= 80 ? '🔴' : '🟢'}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: riskScore >= 80 ? '#ef4444' : '#22c55e'
              }}>
                {riskScore >= 80 ? 'ALERT THRESHOLD EXCEEDED' : 'BELOW ALERT THRESHOLD (80)'}
              </span>
            </div>

            {/* Toggle */}
            <div
              className="toggle-switch"
              onClick={() => setAlertsEnabled(!alertsEnabled)}
            >
              <div className={`toggle-track ${alertsEnabled ? 'on' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span style={{
                fontSize: '0.82rem',
                color: alertsEnabled ? 'var(--red)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                {alertsEnabled ? 'ALERTS ENABLED' : 'ALERTS OFF'}
              </span>
            </div>

            {/* Test button */}
            <button
              style={{
                padding: '6px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onClick={() => {
                if (alertsEnabled) {
                  setShowModal(true);
                  setShowBanner(true);
                  setTimeout(() => setShowSms(true), 800);
                  setTimeout(() => setShowSms(false), 6800);
                }
              }}
            >
              TEST ALERT
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      {showBanner && alertsEnabled && (
        <div className="alert-banner">
          <span className="alert-banner-icon">⚠️</span>
          CRITICAL: ENERGY SECURITY RISK SCORE {riskScore}/100 — IMMEDIATE ACTION REQUIRED
          <span className="alert-banner-icon">⚠️</span>
          <button className="alert-close" onClick={() => setShowBanner(false)}>✕</button>
        </div>
      )}

      {/* Emergency Modal */}
      {showModal && alertsEnabled && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <span className="modal-icon">🚨</span>
            <div className="modal-title">CRITICAL GRID ALERT</div>

            <div className="modal-score" style={{ color: getRiskColor() }}>
              {riskScore}/100
            </div>

            <div className="modal-body">
              <strong style={{ color: '#ef4444' }}>Energy Security Risk is CRITICAL.</strong>
              <br /><br />
              The national grid is operating under severe stress. Immediate intervention
              may be required to prevent potential supply disruptions affecting
              millions of consumers.
            </div>

            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
                RECOMMENDED ACTIONS:
              </div>
              <div>• Activate demand response programs</div>
              <div>• Alert regional load dispatch centers</div>
              <div>• Prepare emergency generation reserves</div>
              <div>• Initiate inter-regional power transfer</div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                ACKNOWLEDGE
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Notification Toast */}
      {showSms && alertsEnabled && (
        <div className="sms-toast">
          <div className="sms-header">
            📱 SIMULATED SMS ALERT · NLDC
          </div>
          <div className="sms-body">
            URGENT: India Power Grid Risk Score = {riskScore}/100 (CRITICAL).
            Grid stress detected. All RLDCs on standby. Activate emergency protocols.
            — National Load Dispatch Centre
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {new Date().toLocaleTimeString()} · Simulated notification
          </div>
        </div>
      )}
    </>
  );
}
