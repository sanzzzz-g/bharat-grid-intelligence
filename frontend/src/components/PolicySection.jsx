import React from 'react';

const POLICIES = [
  {
    icon: '⚡',
    title: 'National Electricity Policy 2023',
    desc: 'Framework for affordable, reliable, and sustainable electricity access for all. Targets 24×7 power supply, universal access, and cost-reflective tariffs while ensuring grid security.',
    tag: 'REGULATORY',
    tagColor: '#3b82f6',
    progress: 72,
    progressLabel: '72% Implementation',
    stats: [
      { label: 'States Compliant', value: '24/28' },
      { label: 'Coverage', value: '99.8%' }
    ]
  },
  {
    icon: '🌱',
    title: 'Renewable Energy Targets',
    desc: 'India\'s ambitious target of 500 GW renewable energy capacity by 2030. Includes 300 GW solar, 100 GW wind, and 60 GW hydro under the National RE Mission.',
    tag: 'IN PROGRESS',
    tagColor: '#22c55e',
    progress: 58,
    progressLabel: '58% of 500 GW target',
    stats: [
      { label: 'Installed RE', value: '290 GW' },
      { label: 'New Additions', value: '+42 GW/yr' }
    ]
  },
  {
    icon: '🔮',
    title: 'Grid Modernization Initiative',
    desc: 'Smart grid deployment across 100 smart cities with advanced metering infrastructure (AMI), SCADA upgrades, and AI-driven predictive maintenance for distribution networks.',
    tag: 'PHASE 2',
    tagColor: '#06b6d4',
    progress: 44,
    progressLabel: '44% deployment complete',
    stats: [
      { label: 'Smart Meters', value: '28M' },
      { label: 'Cities Covered', value: '68/100' }
    ]
  },
  {
    icon: '🔋',
    title: 'National Energy Storage Mission',
    desc: 'Scale-up of energy storage systems to 50 GWh by 2027. Battery Energy Storage Systems (BESS), pumped hydro, and green hydrogen initiatives to address renewable intermittency.',
    tag: 'CRITICAL',
    tagColor: '#f97316',
    progress: 28,
    progressLabel: '28% of storage target',
    stats: [
      { label: 'Installed Storage', value: '14 GWh' },
      { label: 'Target', value: '50 GWh' }
    ]
  },
  {
    icon: '🌍',
    title: 'SDG 7: Affordable Clean Energy',
    desc: 'India\'s progress toward UN Sustainable Development Goal 7 — ensuring access to affordable, reliable, sustainable, and modern energy. Key metrics across electrification, efficiency, and clean cooking.',
    tag: 'ON TRACK',
    tagColor: '#22c55e',
    progress: 81,
    progressLabel: '81% SDG 7 score',
    stats: [
      { label: 'Electrification', value: '99.8%' },
      { label: 'Clean Cooking', value: '68%' }
    ]
  }
];

export default function PolicySection() {
  return (
    <div className="policy-section">
      <div className="section-header">
        <div>
          <div className="section-title">📋 Policy & Regulatory Framework</div>
          <div className="section-subtitle">
            National energy policies, targets, and implementation status
          </div>
        </div>
      </div>

      <div className="policy-grid">
        {POLICIES.map((policy, index) => (
          <div
            key={index}
            className="policy-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="policy-icon">{policy.icon}</span>
            <div className="policy-title">{policy.title}</div>
            <div className="policy-desc">{policy.desc}</div>

            {/* Stats */}
            {policy.stats && (
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '8px'
              }}>
                {policy.stats.map((stat, i) => (
                  <div key={i}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-bright)'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress bar */}
            {policy.progress !== undefined && (
              <div className="policy-progress">
                <div className="policy-progress-label">
                  <span>{policy.progressLabel}</span>
                  <span>{policy.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${policy.progress}%`,
                      background: `linear-gradient(90deg, ${policy.tagColor}88, ${policy.tagColor})`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tag */}
            <span
              className="policy-tag"
              style={{
                background: `${policy.tagColor}18`,
                color: policy.tagColor,
                border: `1px solid ${policy.tagColor}30`
              }}
            >
              {policy.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
