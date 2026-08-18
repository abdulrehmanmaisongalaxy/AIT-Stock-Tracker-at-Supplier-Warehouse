import React, { useState } from 'react';

export default function StockLedger({ stockLedger, suppliers }) {
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');

  const countries = [...new Set(stockLedger.map(s => s.country))];

  const filteredLedger = stockLedger.filter(item => {
    if (supplierFilter !== 'ALL' && item.supplier !== supplierFilter) return false;
    if (countryFilter !== 'ALL' && item.country !== countryFilter) return false;
    return true;
  });

  const exportStockLedgerCSV = () => {
    let csv = 'Code,Name,Supplier,Country,Currency,Opening,Ordered,Received,Shipped,Closing,Unit Rate LCY,Unit Rate USD\n';
    filteredLedger.forEach(i => {
      csv += `${i.code},"${i.name}","${i.supplier}",${i.country},${i.currency},${i.openingStock},${i.orderedQty},${i.receivedQty},${i.shippedQty},${i.closingStock},${i.unitRateLCY},${i.unitRateUSD}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'stock_ledger_report.csv');
    a.click();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Stock Ledger & Supplier Warehouse Inventory</h2>
        <button onClick={exportStockLedgerCSV} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Export Stock Ledger (CSV)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Filter by Supplier</label>
          <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <option value="ALL">Select All Suppliers</option>
            {suppliers.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Filter by Country</label>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <option value="ALL">Select All Countries</option>
            {countries.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Code</th>
            <th style={{ padding: '12px' }}>Item Name</th>
            <th style={{ padding: '12px' }}>Supplier</th>
            <th style={{ padding: '12px' }}>Opening</th>
            <th style={{ padding: '12px' }}>Ordered</th>
            <th style={{ padding: '12px' }}>Received</th>
            <th style={{ padding: '12px' }}>Shipped</th>
            <th style={{ padding: '12px' }}>Closing Stock</th>
            <th style={{ padding: '12px' }}>Rate (LCY)</th>
            <th style={{ padding: '12px' }}>Rate (USD)</th>
          </tr>
        </thead>
        <tbody>
          {filteredLedger.length === 0 ? (
            <tr><td colSpan="10" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No inventory movement recorded in stock ledger.</td></tr>
          ) : (
            filteredLedger.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: '600' }}>{item.code}</td>
                <td style={{ padding: '12px' }}>{item.name}</td>
                <td style={{ padding: '12px' }}>{item.supplier}</td>
                <td style={{ padding: '12px' }}>{item.openingStock}</td>
                <td style={{ padding: '12px' }}>{item.orderedQty}</td>
                <td style={{ padding: '12px' }}>{item.receivedQty}</td>
                <td style={{ padding: '12px' }}>{item.shippedQty}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{item.closingStock}</td>
                <td style={{ padding: '12px' }}>{item.unitRateLCY} {item.currency}</td>
                <td style={{ padding: '12px' }}>${item.unitRateUSD.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
