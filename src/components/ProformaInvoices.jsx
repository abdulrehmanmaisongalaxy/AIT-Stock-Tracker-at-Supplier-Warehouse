import React, { useState } from 'react';

export default function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers, stockLedger, setStockLedger }) {
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');

  const filteredPIs = proformaInvoices.filter(pi => {
    if (selectedSupplierFilter !== 'ALL' && pi.supplier !== selectedSupplierFilter) return false;
    return true;
  });

  const handleConfirmAndReceiveStock = (piIndex) => {
    const pi = proformaInvoices[piIndex];
    if (pi.status === 'Confirmed & Received') {
      alert('Stock already received into ledger.');
      return;
    }

    // Update PI status
    const updatedPIs = [...proformaInvoices];
    updatedPIs[piIndex].status = 'Confirmed & Received';
    setProformaInvoices(updatedPIs);

    // Add to Stock Ledger
    const newStockEntries = pi.items.map(item => {
      const supObj = suppliers.find(s => s.name === pi.supplier);
      const currency = supObj ? supObj.currency : 'USD';
      const unitRate = item.unitRate || 0;
      return {
        code: item.code,
        name: item.name,
        supplier: pi.supplier,
        country: item.country || 'China',
        currency: currency,
        openingStock: 0,
        orderedQty: item.orderQty,
        receivedQty: item.orderQty,
        shippedQty: 0,
        closingStock: item.orderQty,
        unitRateLCY: unitRate,
        unitRateUSD: currency === 'USD' ? unitRate : unitRate / 3.67 // Example conversion rate factor
      };
    });

    setStockLedger([...stockLedger, ...newStockEntries]);
    alert('Proforma Invoice confirmed and stock successfully received into Stock Ledger!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Proforma Invoices & Supplier Orders</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: '500' }}>Filter by Supplier:</label>
        <select value={selectedSupplierFilter} onChange={e => setSelectedSupplierFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <option value="ALL">All Suppliers</option>
          {suppliers.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {filteredPIs.length === 0 ? (
        <p style={{ color: '#64748b' }}>No Proforma Invoices generated yet.</p>
      ) : (
        filteredPIs.map((pi, idx) => {
          const supObj = suppliers.find(s => s.name === pi.supplier);
          const currency = supObj ? supObj.currency : 'USD';
          let totalLCY = 0;

          return (
            <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{pi.piNumber} — Supplier: <b>{pi.supplier}</b> ({currency})</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Linked Requisition: {pi.reqId} | Branch: {pi.branch} | Date: {pi.date} | Status: <b style={{ color: pi.status === 'Confirmed & Received' ? '#16a34a' : '#d97706' }}>{pi.status}</b></span>
                </div>
                {pi.status !== 'Confirmed & Received' && (
                  <button onClick={() => handleConfirmAndReceiveStock(idx)} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Confirm & Receive Stock
                  </button>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px' }}>Item Code</th>
                    <th style={{ padding: '10px' }}>Item Name</th>
                    <th style={{ padding: '10px' }}>Pack Size</th>
                    <th style={{ padding: '10px' }}>Ordered Qty</th>
                    <th style={{ padding: '10px' }}>Unit Rate ({currency})</th>
                    <th style={{ padding: '10px' }}>Total Amount ({currency})</th>
                    <th style={{ padding: '10px' }}>Converted (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {pi.items.map((item, iIdx) => {
                    const lineTotal = (item.orderQty || 0) * (item.unitRate || 0);
                    totalLCY += lineTotal;
                    const usdTotal = currency === 'USD' ? lineTotal : lineTotal / 3.67;

                    return (
                      <tr key={iIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{item.code}</td>
                        <td style={{ padding: '10px' }}>{item.name}</td>
                        <td style={{ padding: '10px' }}>{item.packSize}</td>
                        <td style={{ padding: '10px' }}>{item.orderQty}</td>
                        <td style={{ padding: '10px' }}>{item.unitRate || 0}</td>
                        <td style={{ padding: '10px' }}>{lineTotal.toFixed(2)}</td>
                        <td style={{ padding: '10px' }}>${usdTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
                Total PI Amount: {totalLCY.toFixed(2)} {currency} (~${(currency === 'USD' ? totalLCY : totalLCY / 3.67).toFixed(2)} USD)
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
