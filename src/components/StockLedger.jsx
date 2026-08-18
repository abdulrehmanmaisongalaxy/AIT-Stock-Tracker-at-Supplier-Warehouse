import React, { useState } from 'react';

export default function StockLedger({ 
  items = [], 
  suppliers = [], 
  setItems = () => {} 
}) {
  const safeItems = items || [];
  const safeSuppliers = suppliers || [];

  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [receivingModalItem, setReceivingModalItem] = useState(null);
  const [receiveInputQty, setReceiveInputQty] = useState('');

  const countries = [...new Set(safeSuppliers.map(s => s.country).filter(Boolean))];

  const filteredItems = safeItems.filter(item => {
    const matchSupplier = selectedSupplier === 'ALL' || item.supplier === selectedSupplier;
    const matchCountry = selectedCountry === 'ALL' || (item.country || 'China') === selectedCountry;
    return matchSupplier && matchCountry;
  });

  const handleReceiveStockSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(receiveInputQty) || 0;
    if (qty <= 0 || !receivingModalItem) return;

    const updated = safeItems.map(it => {
      if (it.code === receivingModalItem.code) {
        return { ...it, receivedQty: (it.receivedQty || 0) + qty };
      }
      return it;
    });

    setItems(updated);
    setReceivingModalItem(null);
    setReceiveInputQty('');
    alert(`Successfully received ${qty} units into stock ledger!`);
  };

  const exportToCSV = () => {
    const headers = 'Item Code,Item Name,Supplier,Country,Opening,Ordered,Received,Shipped,Closing,Unit LCY,Unit USD,Total LCY,Total USD\n';
    const rows = filteredItems.map(item => {
      const closing = (item.openingStock || 0) + (item.receivedQty || 0) - (item.shippedQty || 0);
      const valLCY = closing * (item.unitPriceLCY || 0);
      const valUSD = closing * (item.unitPriceUSD || 0);
      return `"${item.code}","${item.name}","${item.supplier}","${item.country || 'China'}",${item.openingStock || 0},${item.orderedQty || 0},${item.receivedQty || 0},${item.shippedQty || 0},${closing},${item.unitPriceLCY || 0},${item.unitPriceUSD || 0},${valLCY.toFixed(2)},${valUSD.toFixed(2)}`;
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
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Full movement tracking with LCY/USD unit rates, total valuation, and direct Goods Receipt (GRN) posting.</p>
        </div>
        <button onClick={exportToCSV} style={btnPrimary}>📥 Export to Excel / CSV</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Filter by Supplier</label>
          <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} style={inputStyle}>
            <option value="ALL">-- Select All Suppliers --</option>
            {safeSuppliers.map(s => <option key={s.id || s.code} value={s.name}>{s.name} ({s.code})</option>)}
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
              <th style={thStyle}>Supplier / Country</th>
              <th style={thStyle}>Opening</th>
              <th style={thStyle}>Ordered</th>
              <th style={thStyle}>Received</th>
              <th style={thStyle}>Shipped</th>
              <th style={thStyle}>Closing</th>
              <th style={thStyle}>Unit Rate (LCY / USD)</th>
              <th style={thStyle}>Total Value (LCY / USD)</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  No items found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const closing = (item.openingStock || 0) + (item.receivedQty || 0) - (item.shippedQty || 0);
                const valLCY = closing * (item.unitPriceLCY || 0);
                const valUSD = closing * (item.unitPriceUSD || 0);
                const currency = item.currency || 'CNY';
                return (
                  <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}><b>{item.code}</b></td>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.supplier} <br/><span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.country || 'China'}</span></td>
                    <td style={tdStyle}>{item.openingStock || 0}</td>
                    <td style={tdStyle}>{item.orderedQty || 0}</td>
                    <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 'bold' }}>{item.receivedQty || 0}</td>
                    <td style={tdStyle}>{item.shippedQty || 0}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2563eb' }}>{closing}</td>
                    <td style={tdStyle}>{currency} {(item.unitPriceLCY || 0).toFixed(2)}<br/><span style={{ fontSize: '11px', color: '#64748b' }}>(${(item.unitPriceUSD || 0).toFixed(2)})</span></td>
                    <td style={tdStyle}>{currency} {valLCY.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br/><b>${valUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                    <td style={tdStyle}>
                      <button onClick={() => setReceivingModalItem(item)} style={btnReceive}>Receive Stock</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {receivingModalItem && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Receive Goods (GRN) for {receivingModalItem.code}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{receivingModalItem.name} — Current Received: <b>{receivingModalItem.receivedQty || 0}</b></p>
            <form onSubmit={handleReceiveStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Quantity to Receive Now</label>
                <input type="number" min="1" value={receiveInputQty} onChange={(e) => setReceiveInputQty(e.target.value)} placeholder="e.g. 500" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={btnPrimary}>Confirm Receipt & Update Ledger</button>
                <button type="button" onClick={() => setReceivingModalItem(null)} style={btnCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' };
const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minWidth: '220px', width: '100%', boxSizing: 'border-box' };
const btnPrimary = { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnReceive = { background: '#0284c7', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
const btnCancel = { background: '#cbd5e1', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const thStyle = { padding: '12px 10px', fontWeight: '600' };
const tdStyle = { padding: '12px 10px', color: '#475569' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCard = { background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' };
