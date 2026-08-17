import React, { useState } from 'react';

export default function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers }) {
  const [piRef, setPiRef] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [amountLCY, setAmountLCY] = useState('');

  const selectedSupObj = suppliers.find(s => s.name === supplierName);
  const currency = selectedSupObj ? selectedSupObj.currency : 'USD';
  const exRate = selectedSupObj ? selectedSupObj.exchangeRate : 1;
  const calculatedUSD = amountLCY ? (parseFloat(amountLCY) / exRate).toFixed(2) : '0.00';

  const handleCreatePI = (e) => {
    e.preventDefault();
    if (!piRef || !supplierName || !amountLCY) return;

    const newPI = {
      piId: piRef,
      branchName: 'HQ Central',
      supplierName,
      currency,
      exchangeRate: exRate,
      totalAmountLCY: parseFloat(amountLCY),
      totalAmountUSD: parseFloat(calculatedUSD),
      status: 'Pending Clearance',
      items: []
    };

    setProformaInvoices([...proformaInvoices, newPI]);
    setPiRef('');
    setSupplierName('');
    setAmountLCY('');
    alert('Proforma Invoice created with LCY and USD conversion!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Create Proforma Invoice (LCY & USD)</h3>
        <form onSubmit={handleCreatePI} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>PI Reference No.</label>
            <input type="text" value={piRef} onChange={(e) => setPiRef(e.target.value)} placeholder="e.g. PINV-2026-001" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Supplier Name</label>
            <select value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required style={inputStyle}>
              <option value="">Select supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.currency})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Amount in LCY ({currency})</label>
            <input type="number" step="0.01" value={amountLCY} onChange={(e) => setAmountLCY(e.target.value)} placeholder="0.00" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Converted to USD ($)</label>
            <input type="text" value={`$${calculatedUSD} (Rate: ${exRate})`} disabled style={{ ...inputStyle, background: '#f1f5f9', fontWeight: 'bold', color: '#16a34a' }} />
          </div>
          <button type="submit" style={btnPrimary}>+ Save PI</button>
        </form>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Proforma Invoices Directory</h3>
        {proformaInvoices.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No proforma invoices added yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                <th style={thStyle}>PI Reference</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Amount LCY</th>
                <th style={thStyle}>Converted USD</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {proformaInvoices.map((pi, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><b>{pi.piId}</b></td>
                  <td style={tdStyle}>{pi.supplierName}</td>
                  <td style={tdStyle}>{pi.currency} {(pi.totalAmountLCY || 0).toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2563eb' }}>${(pi.totalAmountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: '600' }}>{pi.status}</span></td>
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
