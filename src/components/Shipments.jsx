import React, { useState } from 'react';

export default function Shipments({ shipments, setShipments }) {
  const [shpRef, setShpRef] = useState('');
  const [containerType, setContainerType] = useState('40FT Container (Max ~58 CBM)');
  const [totalCbm, setTotalCbm] = useState('');
  const [totalWeight, setTotalWeight] = useState('');

  const handleSaveShipment = (e) => {
    e.preventDefault();
    if (!shpRef) return;
    const newShp = { id: shpRef, containerType, cbm: parseFloat(totalCbm) || 0, weight: parseFloat(totalWeight) || 0, status: 'In Transit' };
    setShipments([...shipments, newShp]);
    setShpRef('');
    setTotalCbm('');
    setTotalWeight('');
    alert('Shipment created successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>New Shipment & Container Setup</h3>
        <form onSubmit={handleSaveShipment} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Shipment Ref No.</label>
            <input type="text" value={shpRef} onChange={(e) => setShpRef(e.target.value)} placeholder="e.g. SHP-SZ-001" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Container Type</label>
            <select value={containerType} onChange={(e) => setContainerType(e.target.value)} style={inputStyle}>
              <option>20FT Container (Max ~28 CBM)</option>
              <option>40FT Container (Max ~58 CBM)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Total CBM (m³)</label>
            <input type="number" step="0.01" value={totalCbm} onChange={(e) => setTotalCbm(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Total Weight (Kg)</label>
            <input type="number" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <button type="submit" style={btnPrimary}>+ Save Shipment</button>
        </form>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Active Shipments Directory</h3>
        {shipments.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No shipments created yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                <th style={thStyle}>Shipment Ref</th>
                <th style={thStyle}>Container Type</th>
                <th style={thStyle}>CBM / Weight</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><b>{s.id}</b></td>
                  <td style={tdStyle}>{s.containerType}</td>
                  <td style={tdStyle}>{s.cbm} m³ / {s.weight} kg</td>
                  <td style={{ ...tdStyle, color: '#16a34a', fontWeight: '600' }}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const btnPrimary = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', height: '42px' };
const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#475569' };
