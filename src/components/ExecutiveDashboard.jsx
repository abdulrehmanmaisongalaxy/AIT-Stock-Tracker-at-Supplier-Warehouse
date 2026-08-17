import React from 'react';

export default function ExecutiveDashboard({ items, branches, proformaInvoices }) {
  const totalStockVal = items.reduce((acc, item) => acc + (((item.openingStock || 0) + (item.receivedQty || 0) - (item.shippedQty || 0)) * (item.unitPrice || 0)), 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Total Active Items</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>{items.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Total Stock Valuation ($)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>${totalStockVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Active Proforma Invoices</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', marginTop: '8px' }}>{proformaInvoices.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Active Branches</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>{branches.length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Executive Overview & Multi-Warehouse Tracking</h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Monitor inventory movements, LCY/USD PI conversions, supplier warehouse balances, and branch order consolidation thresholds from this central hub.</p>
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
