import React from 'react';

function getWeatherEmoji(condition = '') {
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return '☀️';
  if (c.includes('cloud') || c.includes('overcast')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('storm') || c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '🌤️';
}

function getTempColor(temp) {
  if (temp > 40) return '#ef4444';
  if (temp > 35) return '#f97316';
  if (temp > 28) return '#facc15';
  if (temp > 20) return '#22c55e';
  return '#06b6d4';
}

function getStressLevel(temp, condition = '') {
  let stress = 0;
  if (temp > 42) stress += 0.5;
  else if (temp > 38) stress += 0.35;
  else if (temp > 35) stress += 0.2;
  if (condition.toLowerCase().includes('storm')) stress += 0.3;
  else if (condition.toLowerCase().includes('rain')) stress += 0.1;
  return Math.min(1, stress);
}

export default function WeatherCards({ weatherData = [], loading }) {
  if (loading) {
    return (
      <div className="weather-section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="weather-section">
      <div className="section-header">
        <div>
          <div className="section-title">🌤️ Weather Grid Stress Monitor</div>
          <div className="section-subtitle">
            Real-time weather conditions across major grid load centers
            {weatherData[0]?.live === false && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                background: 'rgba(250,204,21,0.1)',
                border: '1px solid rgba(250,204,21,0.3)',
                borderRadius: '4px',
                color: '#facc15',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)'
              }}>
                SIMULATED DATA
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="weather-grid">
        {weatherData.map((w, i) => {
          const stress = getStressLevel(w.temp, w.condition);
          const tempColor = getTempColor(w.temp);

          return (
            <div key={i} className="weather-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="weather-city">{w.city}</div>
                <span style={{ fontSize: '1.4rem' }}>{getWeatherEmoji(w.condition)}</span>
              </div>

              <div className="weather-temp" style={{ color: tempColor }}>
                {w.temp}<span>°C</span>
              </div>

              <div className="weather-condition">{w.condition}</div>

              <div className="weather-details">
                <span>💨 {w.windSpeed} m/s</span>
                {w.humidity && <span>💧 {w.humidity}%</span>}
              </div>

              {/* Stress bar */}
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span>GRID STRESS</span>
                  <span style={{ color: stress > 0.5 ? '#ef4444' : stress > 0.3 ? '#f97316' : '#22c55e' }}>
                    {Math.round(stress * 100)}%
                  </span>
                </div>
                <div className="weather-stress">
                  <div
                    className="weather-stress-fill"
                    style={{ width: `${stress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
