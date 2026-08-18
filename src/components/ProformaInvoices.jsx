import React, { useState } from 'react';

export default function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers, items, setItems }) {
  const [piRef, setPiRef] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [manualItems, setManualItems] = useState({}); // { itemCode: qty }
  const [selectedPIForDetails, setSelectedPIForDetails] = useState(null);

  const countries = [...new Set(suppliers.map(s => s.country))];

  const filteredItemsForManualPI = items.filter(i => {
    const sObj = suppliers.find(s => s.name === i.supplier);
    const matchSup = !supplierName || i.supplier === supplierName;
    const matchCountry = selectedCountry === 'ALL' || (sObj && sObj.country === selectedCountry);
    return matchSup && matchCountry;
  });

  const selectedSupObj = suppliers.find(s => s.name === supplierName);
  const currency = selectedSupObj ? selectedSupObj.currency : 'CNY';
  const exRate = selectedSupObj ? selectedSupObj.exchangeRate : 7.25;

  const handleManualCreatePI = (e) => {
    e.preventDefault();
    if (!piRef || !supplierName) return;

    let totalLCY = 0;
    let totalUSD = 0;
    const piItemList = [];

    Object.keys(manualItems).forEach(code => {
      const qty = parseInt(manualItems[code]) || 0;
      if (qty > 0) {
        const mItem = items.find(i => i.code === code);
        const unitLCY = mItem ? mItem.unitPriceLCY : 85;
        const unitUSD = mItem ? mItem.unitPriceUSD : 11.72;
        const lineLCY = qty * unitLCY;
        const lineUSD = qty * unitUSD;
        totalLCY += lineLCY;
        totalUSD += lineUSD;
        piItemList.push({ code, name: mItem?.name || code, orderedQty: qty, unitLCY, unitUSD, lineLCY, lineUSD });
      }
    });

    if (piItemList.length === 0) {
      alert('Please select at least one item quantity for this Proforma Invoice.');
      return;
    }

    const newPI = {
      piId: piRef,
      reqId: 'Manual-HQ',
      branchName: 'HQ Direct',
      supplierName,
      currency,
      exchangeRate: exRate,
      totalAmountLCY: totalLCY,
      totalAmountUSD: totalUSD,
      status: 'Pending Supplier Confirmation',
      items: piItemList
    };

    setProformaInvoices([...proformaInvoices, newPI]);

    // Update items ordered quantity
    const updatedItems = items.map(item => {
      const found = piItemList.find(p => p.code === item.code);
      if (found) {
        return { ...item, orderedQty: (item.orderedQty || 0) + found.orderedQty };
      }
      return item;
    });
    setItems(updatedItems);

    setPiRef('');
    setSupplierName('');
    setManualItems({});
    alert('Proforma Invoice created successfully with full item breakdowns!');
  };

  const handleConfirmPI = (piId) => {
    setProformaInvoices(proformaInvoices.map(pi => pi.piId === piId ? { ...pi, status: 'Confirmed by Supplier' } : pi));
    alert('PI confirmed by supplier!');
  };

  const exportPIExcel = (pi) => {
    let csv = `Proforma Invoice:,${pi.piId}\nSupplier:,${pi.supplierName}\nBranch:,${pi.branchName}\nStatus:,${pi.status}\n\n`;
    csv += 'Item Code,Item Name,Ordered Qty,Unit Price LCY,Total LCY,Unit Price USD,Total USD\n';
    pi.items.forEach(it => {
      csv += `"${it.code}","${it.name}",${it.orderedQty},${it.unitLCY},${it.lineLCY},${it.unitUSD},${it.lineUSD}\n`;
    });
    csv += `\nTotal Amount (${pi.currency}),,${pi.totalAmountLCY.toFixed(2)}\n`;
    csv += `Total Amount (USD),,$${pi.totalAmountUSD.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${pi.piId}_supplier_order.csv`;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Manual PI Creation Form */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Manually Create Proforma Invoice (LCY & USD)</h3>
        <form onSubmit={handleManualCreatePI} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>PI Reference No.</label>
              <input type="text" value={piRef} onChange={(e) => setPiRef(e.target.value)} placeholder="e.g. PINV-2026-002" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Filter Supplier Country</label>
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={inputStyle}>
                <option value="ALL">-- All Countries --</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Supplier Name</label>
              <select value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required style={inputStyle}>
                <option value="">Select supplier...</option>
                {suppliers.filter(s => selectedCountry === 'ALL' || s.country === selectedCountry).map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.currency})</option>
                ))}
              </select>
            </div>
          </div>

          {supplierName && (
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Select Items & Quantities for this PI ({currency} Rate: {exRate})</label>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '6px' }}>Code</th>
                      <th style={{ padding: '6px' }}>Item Name</th>
                      <th style={{ padding: '6px' }}>Unit Price ({currency})</th>
                      <th style={{ padding: '6px', width: '120px' }}>Order Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItemsForManualPI.map(item => (
                      <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px' }}><b>{item.code}</b></td>
                        <td style={{ padding: '6px' }}>{item.name}</td>
                        <td style={{ padding: '6px' }}>{item.unitPriceLCY || 85}</td>
                        <td style={{ padding: '6px' }}>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            value={manualItems[item.code] || ''}
                            onChange={(e) => setManualItems({ ...manualItems, [item.code]: e.target.value })}
                            style={{ width: '90px', padding: '4px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button type="submit" style={btnPrimary}>+ Generate Proforma Invoice</button>
        </form>
      </div>

      {/* PI Directory */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Proforma Invoices Directory & Tracking</h3>
        {proformaInvoices.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No proforma invoices generated yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                <th style={thStyle}>PI Reference</th>
                <th style={thStyle}>Linked Order Req</th>
                <th style={thStyle}>Branch / Source</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Amount LCY</th>
                <th style={thStyle}>Amount USD</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proformaInvoices.map((pi, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><b>{pi.piId}</b></td>
                  <td style={tdStyle}>{pi.reqId || 'Manual'}</td>
                  <td style={tdStyle}>{pi.branchName}</td>
                  <td style={tdStyle}>{pi.supplierName}</td>
                  <td style={tdStyle}>{pi.currency} {(pi.totalAmountLCY || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2563eb' }}>${(pi.totalAmountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>
                    <span style={{ color: pi.status.includes('Confirmed') ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>
                      {pi.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelectedPIForDetails(pi)} style={btnSmView}>View Items</button>
                      <button onClick={() => exportPIExcel(pi)} style={btnSmCSV}>Export CSV</button>
                      {pi.status.includes('Pending') && (
                        <button onClick={() => handleConfirmPI(pi.piId)} style={btnSmConfirm}>Confirm</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PI Details Modal */}
      {selectedPIForDetails && (
        <div style={modalOverlay}>
          <div style={modalCardLarge}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>PI Item Details: {selectedPIForDetails.piId}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Supplier: <b>{selectedPIForDetails.supplierName}</b> | Branch: <b>{selectedPIForDetails.branchName}</b></p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Code</th>
                  <th style={{ padding: '8px' }}>Item Name</th>
                  <th style={{ padding: '8px' }}>Ordered Qty</th>
                  <th style={{ padding: '8px' }}>Unit Price ({selectedPIForDetails.currency})</th>
                  <th style={{ padding: '8px' }}>Total ({selectedPIForDetails.currency})</th>
                  <th style={{ padding: '8px' }}>Total (USD)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPIForDetails.items.map((it, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}><b>{it.code}</b></td>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px' }}>{it.orderedQty}</td>
                    <td style={{ padding: '8px' }}>{it.unitLCY?.toFixed(2)}</td>
                    <td style={{ padding: '8px' }}>{it.lineLCY?.toFixed(2)}</td>
                    <td style={{ padding: '8px' }}>${it.lineUSD?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>Total LCY:</b> {selectedPIForDetails.currency} {selectedPIForDetails.totalAmountLCY.toFixed(2)} | <b>Total USD:</b> ${selectedPIForDetails.totalAmountUSD.toFixed(2)}
              </div>
              <button onClick={() => setSelectedPIForDetails(null)} style={btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const btnPrimary = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnSmView = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const btnSmCSV = { background: '#dcfce7', color: '#166534', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const btnSmConfirm = { background: '#fef9c3', color: '#854d0e', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#475569' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCardLarge = { background: '#fff', padding: '24px', borderRadius: '8px', width: '700px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' };
