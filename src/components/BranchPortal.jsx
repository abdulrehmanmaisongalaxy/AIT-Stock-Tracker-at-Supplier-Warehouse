import React, { useState } from 'react';

export default function BranchPortal({ branch, items, requisitions, setRequisitions }) {
  const allowedItems = items.filter(item => branch.allowedItems.includes(item.code));
  const [orderQtys, setOrderQtys] = useState({});

  const handleQtyChange = (code, val) => {
    setOrderQtys({ ...orderQtys, [code]: Math.max(0, parseInt(val) || 0) });
  };

  let totalCbm = 0;
  let totalWeight = 0;

  allowedItems.forEach(item => {
    const qty = orderQtys[item.code] || 0;
    if (qty > 0) {
      totalCbm += qty * (item.cbm || 0.04);
      totalWeight += qty * (item.weight || 10);
    }
  });

  const fill20 = Math.min(100, Math.round((totalCbm / 28) * 100));
  const fill40 = Math.min(100, Math.round((totalCbm / 58) * 100));

  const handleSubmitRequisition = (e) => {
    e.preventDefault();
    const orderItems = allowedItems
      .filter(item => (orderQtys[item.code] || 0) > 0)
      .map(item => ({
        code: item.code,
        name: item.name,
        supplier: item.supplier,
        packSize: item.packSize,
        orderedQty: orderQtys[item.code]
      }));

    if (orderItems.length === 0) {
      alert('Please enter order quantities.');
      return;
    }

    const newReq = {
      id: 'REQ-' + Date.now().toString().slice(-6),
      branchName: `${branch.name} / ${branch.location}`,
      date: new Date().toISOString().split('T')[0],
      items: orderItems,
      status: 'Pending Consolidation'
    };

    setRequisitions([...requisitions, newReq]);
    alert('Requisition submitted successfully to Dubai HQ!');
    setOrderQtys({});
  };

  return (
    <form onSubmit={handleSubmitRequisition}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>{branch.name} ({branch.location}) — Order Requisition Form</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Enter quantities for authorized items below.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#334155' }}>
              <th style={thStyle}>Item Code</th>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Pack Size</th>
              <th style={thStyle}>Weight (kg)</th>
              <th style={thStyle}>CBM (m³)</th>
              <th style={{ ...thStyle, width: '130px' }}>Ordering Qty</th>
            </tr>
          </thead>
          <tbody>
            {allowedItems.map(item => (
              <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><b>{item.code}</b></td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.packSize}</td>
                <td style={tdStyle}>{item.weight}</td>
                <td style={tdStyle}>{item.cbm}</td>
                <td style={tdStyle}>
                  <input 
                    type="number" 
                    min="0"
                    value={orderQtys[item.code] || ''} 
                    onChange={(e) => handleQtyChange(item.code, e.target.value)}
                    style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0' }}>📦 Real-Time Container Fill Ratio</h4>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#cbd5e1' }}>
            <span>Gross Weight: <b>{totalWeight.toFixed(1)} kg</b></span>
            <span>Total CBM: <b>{totalCbm.toFixed(2)} m³</b></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', padding: '8px 14px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>20FT Fill (Max 28 CBM)</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: fill20 >= 80 ? '#22c55e' : '#facc15' }}>{fill20}%</div>
          </div>
          <div style={{ background: '#1e293b', padding: '8px 14px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>40FT Fill (Max 58 CBM)</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: fill40 >= 80 ? '#22c55e' : '#facc15' }}>{fill40}%</div>
          </div>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Submit Requisition
          </button>
        </div>
      </div>
    </form>
  );
}

const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#475569' };
