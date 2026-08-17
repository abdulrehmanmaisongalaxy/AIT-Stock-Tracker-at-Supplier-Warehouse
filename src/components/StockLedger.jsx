import React, { useState } from 'react';

export default function StockLedger({ items, suppliers }) {
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  const countries = [...new Set(suppliers.map(s => s.country))];

  const filteredItems = items.filter(item => {
    const matchSupplier = selectedSupplier === 'ALL' || item.supplier === selectedSupplier;
    const supObj = suppliers.find(s => s.name === item.supplier);
    const matchCountry = selectedCountry === 'ALL' || (supObj && supObj.country === selectedCountry);
    return matchSupplier && matchCountry;
  });

  const exportToCSV = () => {
    const headers = 'Item Code,Item Name,Supplier,Opening Stock,Ordered Qty,Received Qty,Shipped Qty,Closing Stock,Unit Price ($),Total Value ($)\n';
    const rows = filteredItems.map(item => {
      const closing = (item.openingStock || 0) + (item.receivedQty || 0) - (item.shippedQty || 0);
      const totalVal = closing * (item.unitPrice || 0);
      return `"${item.code}","${item.name}","${item.supplier}",${item.openingStock || 0},${item.orderedQty || 0},${item.receivedQty || 0},${item.shippedQty || 0},${closing},${item.unitPrice || 0},${totalVal.toFixed(2)}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock_ledger_report.csv';
    link.click();
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Stock Ledger & Movement Report</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Full movement tracking including opening, ordered, received, shipped, and closing stock valuation.</p>
        </div>
        <button onClick={exportToCSV} style={btnPrimary}>📥 Export to Excel / CSV</button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Filter by Supplier</label>
          <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} style={inputStyle}>
            <option value="ALL">-- Select All Suppliers --</option>
            {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Filter by Country</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={inputStyle}>
            <option value="ALL">-- Select All Countries --</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
              <th style={thStyle}>Item Code</th>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Supplier Warehouse</th>
              <th style={thStyle}>Opening</th>
              <th style={thStyle}>Ordered</th>
              <th style={thStyle}>Received</th>
              <th style={thStyle}>Shipped</th>
              <th style={thStyle}>Closing Stock</th>
              <th style={thStyle}>Unit Price ($)</th>
              <th style={thStyle}>Total Value ($)</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const closing = (item.openingStock || 0) + (item.receivedQty || 0) - (item.shippedQty || 0);
              const totalVal = closing * (item.unitPrice || 0);
              return (
                <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><b>{item.code}</b></td>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{item.supplier}</td>
                  <td style={tdStyle}>{item.openingStock || 0}</td>
                  <td style={tdStyle}>{item.orderedQty || 0}</td>
                  <td style={tdStyle}>{item.receivedQty || 0}</td>
                  <td style={tdStyle}>{item.shippedQty || 0}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#16a34a' }}>{closing}</td>
                  <td style={tdStyle}>${(item.unitPrice || 0).toFixed(2)}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>${totalVal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' };
const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '220px' };
const btnPrimary = { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const thStyle = { padding: '12px 12px', fontWeight: '600' };
const tdStyle = { padding: '12px 12px', color: '#475569' };
