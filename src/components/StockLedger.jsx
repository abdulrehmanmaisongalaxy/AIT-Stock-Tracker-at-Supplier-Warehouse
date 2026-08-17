import React from 'react';

export default function StockLedger({ items }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Stock Ledger & Multi-Warehouse Tracking</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Real-time visibility into stock distributed across regional supplier warehouses.</p>
      
      {items.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px' }}>
          No items found. Please upload your master items via <b>Master Setup & Import</b>.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
              <th style={thStyle}>Item Code</th>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Supplier Warehouse</th>
              <th style={thStyle}>Pack Size</th>
              <th style={thStyle}>MOQ</th>
              <th style={thStyle}>Available Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}><b>{item.code}</b></td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.supplier}</td>
                <td style={tdStyle}>{item.packSize}</td>
                <td style={tdStyle}>{item.moq}</td>
                <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{item.stock}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#475569' };
