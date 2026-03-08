import React, { useEffect, useRef, useState } from 'react';

// Risk color helpers
function getRiskColor(score) {
  if (score <= 30) return '#22c55e';
  if (score <= 55) return '#facc15';
  if (score <= 75) return '#f97316';
  return '#ef4444';
}

function getRiskLabel(score) {
  if (score <= 30) return 'Secure';
  if (score <= 55) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

export default function IndiaGridMap({ states = [], year, onYearChange, heatmapEnabled, onToggleHeatmap, heatmapData = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const geoLayerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    // Dynamic import of Leaflet
    import('leaflet').then((L) => {
      // Fix Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [22, 80],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 9
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = { map, L };
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON layer when states change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || states.length === 0) return;

    const { map, L } = mapInstanceRef.current;

    // Remove existing layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
    }

    // Create state markers as circle markers (fallback without GeoJSON file)
    const markers = [];

    states.forEach(state => {
      if (!state.lat || !state.lng) return;

      const color = getRiskColor(state.riskScore);
      const radius = Math.max(8, Math.min(20, state.demand / 2500));

      const circle = L.circleMarker([state.lat, state.lng], {
        radius,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.35,
      });

      // Popup content
      const popupContent = `
        <div style="
          font-family: 'Rajdhani', sans-serif;
          background: #0d1526;
          color: #e2e8f0;
          padding: 0;
          min-width: 220px;
          border-radius: 8px;
          overflow: hidden;
        ">
          <div style="
            background: ${color};
            padding: 10px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <span style="font-weight: 700; font-size: 1rem; color: #000;">${state.name}</span>
            <span style="
              background: rgba(0,0,0,0.3);
              color: #fff;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 0.75rem;
              font-weight: 700;
            ">${getRiskLabel(state.riskScore)}</span>
          </div>
          <div style="padding: 12px 14px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
              <tr>
                <td style="color: #94a3b8; padding: 3px 0;">Installed Capacity</td>
                <td style="color: #f1f5f9; text-align: right; font-weight: 600;">${(state.installedCapacity/1000).toFixed(1)} GW</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 3px 0;">Demand</td>
                <td style="color: #f1f5f9; text-align: right; font-weight: 600;">${(state.demand/1000).toFixed(1)} GW</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 3px 0;">Renewable Share</td>
                <td style="color: #22c55e; text-align: right; font-weight: 600;">${state.renewableShare}%</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 3px 0;">Risk Score</td>
                <td style="color: ${color}; text-align: right; font-weight: 700;">${state.riskScore}/100</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 3px 0;">Congestion</td>
                <td style="color: #f1f5f9; text-align: right; font-weight: 600;">${Math.round(state.transmissionCongestion * 100)}%</td>
              </tr>
            </table>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'grid-popup'
      });

      // Label
      const icon = L.divIcon({
        html: `<div style="
          font-family: monospace;
          font-size: 9px;
          color: ${color};
          text-shadow: 0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.9);
          white-space: nowrap;
          font-weight: 700;
          pointer-events: none;
          transform: translate(-50%, 0);
        ">${state.code}</div>`,
        iconSize: [0, 0],
        className: ''
      });

      L.marker([state.lat - 0.5, state.lng], { icon, interactive: false }).addTo(map);
      circle.addTo(map);
      markers.push(circle);
    });

    // Store reference for cleanup
    geoLayerRef.current = {
      remove: () => markers.forEach(m => map.removeLayer(m))
    };

  }, [mapReady, states]);

  // Update heatmap
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const { map, L } = mapInstanceRef.current;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!heatmapEnabled || heatmapData.length === 0) return;

    // Create heatmap using circle overlays as fallback (no plugin needed)
    const heatPoints = heatmapData.map(pt => {
      const color = getRiskColor(pt.intensity * 100);
      const circle = L.circle([pt.lat, pt.lng], {
        radius: 80000 * pt.intensity + 40000,
        fillColor: color,
        color: 'transparent',
        fillOpacity: 0.12 * pt.intensity
      });
      return circle;
    });

    const heatGroup = L.layerGroup(heatPoints);
    heatGroup.addTo(map);
    heatLayerRef.current = heatGroup;

  }, [mapReady, heatmapEnabled, heatmapData]);

  return (
    <div className="map-section">
      <div className="map-container">
        <div className="map-controls">
          <div className="map-title">🗺️ India Power Grid Map</div>
          <div className="map-controls-right">
            <select
              className="year-select"
              value={year}
              onChange={e => onYearChange(e.target.value)}
            >
              <option value="2023">FY 2023</option>
              <option value="2024">FY 2024</option>
              <option value="2025">FY 2025</option>
            </select>

            <button
              className={`toggle-btn ${heatmapEnabled ? 'active' : ''}`}
              onClick={onToggleHeatmap}
            >
              🌡️ Heat Stress Map {heatmapEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Leaflet map container */}
        <div id="india-map" ref={mapRef} />

        {/* Legend */}
        <div className="map-legend">
          <span className="legend-title">Risk Level:</span>
          <div className="legend-items">
            {[
              { label: 'Secure (≤30)', color: '#22c55e' },
              { label: 'Moderate (31-55)', color: '#facc15' },
              { label: 'High (56-75)', color: '#f97316' },
              { label: 'Critical (>75)', color: '#ef4444' }
            ].map(item => (
              <div key={item.label} className="legend-item">
                <div className="legend-dot" style={{ background: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
