import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);
const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Space Mono', size: 11 }, boxWidth: 10, padding: 12 } }, tooltip: { backgroundColor: '#0d1526', borderColor: '#1a2540', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10 } }, scales: { x: { grid: { color: 'rgba(26,37,64,0.8)' }, ticks: { color: '#475569', font: { family: 'Space Mono', size: 10 } } }, y: { grid: { color: 'rgba(26,37,64,0.8)' }, ticks: { color: '#475569', font: { family: 'Space Mono', size: 10 } } } } };
function DemandSupplyChart({ demandCurve }) {
  if (!demandCurve) return <div className="loading-text">Loading...</div>;
  return <Line data={{ labels: demandCurve.labels, datasets: [{ label: 'Demand (GW)', data: demandCurve.demand, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 2, pointRadius: 2, tension: 0.4, fill: true }, { label: 'Supply (GW)', data: demandCurve.supply, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 2, pointRadius: 2, tension: 0.4, fill: true }] }} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'top' } }, animation: { duration: 600 } }} />;
}
function EnergyMixChart({ energyMix }) {
  if (!energyMix) return null;
  const labels = ['Coal','Gas','Nuclear','Hydro','Solar','Wind','Other'];
  const values = [energyMix.coal, energyMix.gas, energyMix.nuclear, energyMix.hydro, energyMix.solar, energyMix.wind, energyMix.other];
  const colors = ['#6b7280','#3b82f6','#8b5cf6','#06b6d4','#facc15','#22c55e','#94a3b8'];
  return <Bar data={{ labels, datasets: [{ label: 'Generation Share (%)', data: values, backgroundColor: colors.map(c => c+'cc'), borderColor: colors, borderWidth: 1, borderRadius: 4 }] }} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, animation: { duration: 600 } }} />;
}
function MonthlyPeakChart({ monthlyPeak, scenario }) {
  if (!monthlyPeak) return null;
  const multipliers = { baseline: [1,1,1,1,1,1,1,1,1,1,1,1], heatwave: [1,1,1.02,1.05,1.18,1.22,1.25,1.24,1.12,1.02,1,1], gas_disruption: [.94,.94,.94,.94,.94,.93,.92,.92,.93,.94,.94,.94], coal_outage: [.9,.9,.9,.89,.88,.87,.86,.87,.88,.89,.9,.9], renewable_surge: [1.05,1.05,1.06,1.07,1.08,1.09,1.1,1.1,1.08,1.06,1.05,1.05], festival_demand: [1,1,1,1,1,1,1,1,1,1.15,1.18,1.12] };
  const mults = multipliers[scenario] || multipliers.baseline;
  const adjusted = monthlyPeak.data.map((v,i) => Math.round(v * mults[i]));
  const showComp = scenario && scenario !== 'baseline';
  return <Bar data={{ labels: monthlyPeak.labels, datasets: [...(showComp ? [{ label: 'Baseline (GW)', data: monthlyPeak.data, backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)', borderWidth: 1, borderRadius: 2 }] : []), { label: showComp ? scenario.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())+' (GW)' : 'Peak Demand (GW)', data: adjusted, backgroundColor: adjusted.map(v => v>280?'rgba(239,68,68,0.8)':v>255?'rgba(249,115,22,0.8)':v>230?'rgba(59,130,246,0.8)':'rgba(34,197,94,0.8)'), borderColor: 'transparent', borderRadius: 4 }] }} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, display: showComp } }, animation: { duration: 600 } }} />;
}
function GenerationPieChart({ energyMix }) {
  if (!energyMix) return null;
  return <Pie data={{ labels: ['Solar','Wind','Hydro','Coal','Gas','Nuclear','Other'], datasets: [{ data: [energyMix.solar,energyMix.wind,energyMix.hydro,energyMix.coal,energyMix.gas,energyMix.nuclear,energyMix.other], backgroundColor: ['#facc15cc','#22c55ecc','#06b6d4cc','#6b7280cc','#3b82f6cc','#8b5cf6cc','#94a3b8cc'], borderColor: '#0a0f1e', borderWidth: 2 }] }} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'right' } }, scales: {} }} />;
}
function RiskRadarChart({ riskComponents }) {
  const components = riskComponents || [{ label: 'Import Dependency', score: 45 }, { label: 'Reserve Margin', score: 60 }, { label: 'RE Intermittency', score: 30 }, { label: 'Congestion', score: 52 }, { label: 'Weather Impact', score: 35 }];
  return <Radar data={{ labels: components.map(c=>c.label), datasets: [{ label: 'Risk Score', data: components.map(c=>Math.round(c.score)), backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444', borderWidth: 2, pointBackgroundColor: '#ef4444', pointRadius: 4 }] }} options={{ ...chartDefaults, scales: { r: { min: 0, max: 100, ticks: { color: '#475569', font: { size: 9 }, stepSize: 25 }, grid: { color: 'rgba(26,37,64,0.8)' }, angleLines: { color: 'rgba(26,37,64,0.8)' }, pointLabels: { color: '#94a3b8', font: { family: 'Space Mono', size: 9 } } } }, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />;
}
export default function ChartsPanel({ demandCurve, energyMix, monthlyPeak, riskComponents, scenario }) {
  const demandKey = demandCurve ? demandCurve.demand[12]+'-'+demandCurve.supply[12] : 'loading';
  const mixKey = energyMix ? `${energyMix.coal}-${energyMix.solar}-${energyMix.wind}` : 'loading';
  const riskKey = riskComponents ? riskComponents.map(c=>Math.round(c.score)).join('-') : 'loading';
  return (
    <div className="charts-section">
      <div className="section-header"><div><div className="section-title">📈 Power Analytics</div><div className="section-subtitle">Real-time grid performance charts</div></div></div>
      <div className="charts-grid">
        <div className="chart-card col-8"><div className="chart-title">24-Hour Demand vs Supply</div><div className="chart-subtitle">Hourly load curve (GW)</div><div className="chart-wrapper"><DemandSupplyChart key={demandKey} demandCurve={demandCurve} /></div></div>
        <div className="chart-card col-4"><div className="chart-title">Risk Components</div><div className="chart-subtitle">Energy security radar</div><div className="chart-wrapper"><RiskRadarChart key={riskKey} riskComponents={riskComponents} /></div></div>
        <div className="chart-card col-6"><div className="chart-title">Energy Generation Mix</div><div className="chart-subtitle">Share by source (%)</div><div className="chart-wrapper"><EnergyMixChart key={'mix-'+mixKey} energyMix={energyMix} /></div></div>
        <div className="chart-card col-6"><div className="chart-title">Generation Share</div><div className="chart-subtitle">Portfolio composition</div><div className="chart-wrapper"><GenerationPieChart key={'pie-'+mixKey} energyMix={energyMix} /></div></div>
        <div className="chart-card col-12"><div className="chart-title">Monthly Peak Demand Trend</div><div className="chart-subtitle">Jan–Dec historical & forecast (GW)</div><div className="chart-wrapper"><MonthlyPeakChart key={scenario+'-'+monthlyPeak?.data?.[6]} monthlyPeak={monthlyPeak} scenario={scenario} /></div></div>
      </div>
    </div>
  );
}
