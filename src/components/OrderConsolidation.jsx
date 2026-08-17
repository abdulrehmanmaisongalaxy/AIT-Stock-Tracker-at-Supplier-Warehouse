import React, { useState } from 'react';

export default function OrderConsolidation({ requisitions, setRequisitions, proformaInvoices, setProformaInvoices, items, setItems, suppliers }) {
  const [actionChoices, setActionChoices] = useState({});

  const handleChoiceChange = (reqId, itemCode, choice) => {
    setActionChoices({ ...actionChoices, [`${reqId}_${itemCode}`]: choice });
  };

  const handleConvertToPI = (req) => {
    const supplierObj = suppliers.find(s => s.name === req.items[0]?.supplier) || suppliers[0];
    const currency = supplierObj?.currency || 'USD';
    const exRate = supplierObj?.exchangeRate || 1;

    const totalQty = req.items.reduce((sum, i) => sum + i.orderedQty, 0);
    const estimatedUSD = req.items.reduce((sum, i) => sum + (i.orderedQty * 10), 0); // Estimated unit value $10
    const estimatedLCY = estimatedUSD * exRate;

    const newPI = {
      piId: 'PI-' + Date.now().toString().slice(-6),
      branchName: req.branchName,
      supplierName: supplierObj.name,
      currency,
      exchangeRate: exRate,
      totalAmountLCY: estimatedLCY,
      totalAmountUSD: estimatedUSD,
      status: 'Pending Supplier Confirmation',
      items: req.items
    };

    setProformaInvoices([...proformaInvoices, newPI]);
    setRequisitions(requisitions.map(r => r.id === req.id ? { ...r, status: 'Converted to PI' } : r));

    // Update stock ledger ordered quantity
    const updatedItems = items.map(item => {
      const matched = req.items.find(i => i.code === item.code);
      if (matched) {
        return { ...item, orderedQty: (item.orderedQty || 0) + matched.orderedQty };
      }
      return item;
    });
    setItems(updatedItems);
    alert('Requisition consolidated and Proforma Invoice created successfully!');
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Order Consolidation & MOQ Planning Hub</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Review branch requisitions against MOQ thresholds. Place orders, hold, or include buffer stock.</p>

      {requisitions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px' }}>
          No branch requisitions available for consolidation.
        </div>
      ) : (
        requisitions.map(req => (
          <div key={req.id} style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <div>
                <b style={{ fontSize: '15px', color: '#0f172a' }}>{req.branchName}</b> ({req.id}) 
                <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '13px' }}>Date: {req.date}</span>
              </div>
              <span style={{ background: req.status === 'Converted to PI' ? '#dcfce7' : '#fef9c3', color: req.status === 'Converted to PI' ? '#166534' : '#854d0e', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                {req.status}
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                  <th style={thStyle}>Item Code</th>
                  <th style={thStyle}>Item Name</th>
                  <th style={thStyle}>Ordered Pcs</th>
                  <th style={thStyle}>MOQ</th>
                  <th style={thStyle}>MOQ Status</th>
                  <th style={thStyle}>HQ Decision / Action</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((it, idx) => {
                  const masterItem = items.find(m => m.code === it.code);
                  const moq = masterItem ? masterItem.moq : 500;
                  const isMet = it.orderedQty >= moq;
                  const key = `${req.id}_${it.code}`;
                  const currentChoice = actionChoices[key] || (isMet ? 'Place Order' : 'Hold');

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}><b>{it.code}</b></td>
                      <td style={tdStyle}>{it.name}</td>
                      <td style={tdStyle}>{it.orderedQty}</td>
                      <td style={tdStyle}>{moq}</td>
                      <td style={tdStyle}>
                        <span style={{ color: isMet ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                          {isMet ? '✅ MOQ Met' : '❌ Below MOQ'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <select 
                          value={currentChoice} 
                          onChange={(e) => handleChoiceChange(req.id, it.code, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          disabled={req.status === 'Converted to PI'}
                        >
                          <option value="Place Order">Place Order</option>
                          <option value="Hold">Hold / Wait for More Orders</option>
                          <option value="Place with Buffer">Place with Buffer Stock</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {req.status === 'Pending Consolidation' && (
              <button onClick={() => handleConvertToPI(req)} style={btnGreen}>
                Convert Consolidated Requisition to Proforma Invoice (PI)
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', fontWeight: '600' };
const tdStyle = { padding: '10px 12px', color: '#475569' };
const btnGreen = { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
