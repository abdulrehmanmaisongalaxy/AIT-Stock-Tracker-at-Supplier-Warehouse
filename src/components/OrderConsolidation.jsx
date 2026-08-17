import React from 'react';

export default function OrderConsolidation({ requisitions, setRequisitions, proformaInvoices, setProformaInvoices, items, setItems }) {
  const handleConvertToPI = (req) => {
    const newPI = {
      piId: 'PI-' + Date.now().toString().slice(-6),
      ...req,
      status: 'In Production'
    };
    setProformaInvoices([...proformaInvoices, newPI]);
    setRequisitions(requisitions.map(r => r.id === req.id ? { ...r, status: 'Converted to PI' } : r));

    // Automatically reduce supplier stock if direct sale/shipment, or add incoming stock ledger
    const updatedItems = items.map(item => {
      const orderedMatch = req.items.find(i => i.code === item.code);
      if (orderedMatch) {
        return { ...item, stock: item.stock + orderedMatch.orderedQty };
      }
      return item;
    });
    setItems(updatedItems);
    alert('Requisition successfully converted to Proforma Invoice! Supplier stock ledger updated.');
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Order Consolidation & MOQ Optimizer</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Review branch requisitions and consolidate them to meet supplier minimum order quantities.</p>

      {requisitions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px' }}>
          No branch requisitions submitted yet.
        </div>
      ) : (
        requisitions.map(req => (
          <div key={req.id} style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '8px' }}>
              <div><b>{req.branchName}</b> ({req.id}) — Date: {req.date}</div>
              <div>Status: <b>{req.status}</b></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Item Name</th>
                  <th style={thStyle}>Ordered Pcs</th>
                  <th style={thStyle}>Cartons</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{it.code}</td>
                    <td style={tdStyle}>{it.name}</td>
                    <td style={tdStyle}>{it.orderedQty}</td>
                    <td style={tdStyle}>{it.ctns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {req.status === 'Pending Consolidation' && (
              <button onClick={() => handleConvertToPI(req)} style={btnGreen}>Convert into Proforma Invoice (PI)</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', fontWeight: '600' };
const tdStyle = { padding: '10px 12px', color: '#475569' };
const btnGreen = { background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
