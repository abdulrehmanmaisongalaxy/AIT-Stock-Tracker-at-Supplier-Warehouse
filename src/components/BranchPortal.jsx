import React, { useState } from 'react';

export default function BranchPortal({ branch, items, requisitions, setRequisitions }) {
  const allowedItems = items.filter(item => branch.allowedItems.includes(item.code));
  const [orderQtys, setOrderQtys] = useState({});

  const handleQtyChange = (code, val) => {
    setOrderQtys({ ...orderQtys, [code]: Math.max(0, parseInt(val) || 0) });
  };

  let totalCbm = 0;
  let totalWeight = 0;
  let totalCtns = 0;

  allowedItems.forEach(item => {
    const qty = orderQtys[item.code] || 0;
    if (qty > 0) {
      totalCtns += Math.ceil(qty / item.packSize);
      totalCbm += qty * item.cbm;
      totalWeight += qty * item.weight;
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
        orderedQty: orderQtys[item.code],
        ctns: Math.ceil(orderQtys[item.code] / item.packSize)
      }));

    if (orderItems.length === 0) {
      alert('Please enter order quantities.');
      return;
    }

    const newReq = {
      id: 'REQ-' + Date.now().toString().slice(-6),
      branchName: branch.name,
      date: new Date().toISOString().split('T')[0],
      items: orderItems,
      status: 'Pending Consolidation'
    };

    setRequisitions([...requisitions, newReq]);
    alert('Requisition submitted successfully!');
    setOrderQtys({});
  };

  return (
    <form onSubmit={handleSubmitRequisition}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>{branch.name} — Order Requisition</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Your view is restricted to authorized items only.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#334155' }}>
              <th style={thStyle}>Item Code</th>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Supplier</th>
              <th style={thStyle}>Pack Size</th>
              <th style={thStyle}>Weight (kg)</th>
              <th style={thStyle}>CBM</th>
              <th style={thStyle}>In Stock</th>
              <th style={{ ...thStyle, width: '120px' }}>Order Qty</th>
            </tr>
          </thead>
          <tbody>
            {allowedItems.map(item => (
              <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><b>{item.code}</b></td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.supplier}</td>
                <td style={tdStyle}>{item.packSize}</td>
                <td style={tdStyle}>{item.weight}</td>
                <td style={tdStyle}>{item.cbm}</td>
                <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{item.stock}</span></td>
                <td style={tdStyle}>
                  <input 
                    type="number" 
                    min="0"
                    value={orderQtys[item.code] || ''} 
                    onChange={(e) => handleQtyChange(item.code, e.target.value)}
                    style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Container Fill Calculator Footer */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0' }}>📦 Container Fill Ratio Calculator</h4>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#cbd5e1' }}>
            <span>Total CTNs: <b>{totalCtns}</b></span>
            <span>Gross Weight: <b>{totalWeight.toFixed(1)} kg</b></span>
            <span>Total CBM: <b>{totalCbm.toFixed(2)} m³</b></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', padding: '8px 14px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>20FT Fill</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: fill20 >= 80 ? '#22c55e' : '#facc15' }}>{fill20}%</div>
          </div>
          <div style={{ background: '#1e293b', padding: '8px 14px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>40FT Fill</div>
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
