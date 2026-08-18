import React from 'react';

export default function ExecutiveDashboard({ items = [], branches = [], proformaInvoices = [] }) {
  const safeItems = items || [];
  const safeBranches = branches || [];
  const safeInvoices = proformaInvoices || [];

  const totalStockVal = safeItems.reduce((acc, item) => {
    const opening = Number(item.openingStock) || 0;
    const received = Number(item.receivedQty) || 0;
    const shipped = Number(item.shippedQty) || 0;
    const price = Number(item.unitPriceUSD) || 0;
    return acc + ((opening + received - shipped) * price);
  }, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Total Active Items</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>{safeItems.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Total Stock Valuation (USD)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>${totalStockVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Active Proforma Invoices</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', marginTop: '8px' }}>{safeInvoices.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Active Branches</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>{safeBranches.length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Executive Overview & Multi-Warehouse Tracking</h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Monitor inventory movements, LCY/USD conversions, supplier warehouse balances, branch order consolidations, and GRN stock receipts.</p>
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
