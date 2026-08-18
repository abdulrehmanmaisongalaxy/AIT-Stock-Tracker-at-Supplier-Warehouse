import React, { useState } from 'react';

export default function OrderConsolidation({ requisitions, setRequisitions, proformaInvoices, setProformaInvoices }) {
  const [editableReqs, setEditableReqs] = useState(requisitions);

  // Sync state if props change
  React.useEffect(() => {
    setEditableReqs(requisitions);
  }, [requisitions]);

  const handleQtyEdit = (reqId, itemCode, newQty) => {
    const updated = editableReqs.map(req => {
      if (req.id === reqId) {
        const newItems = req.items.map(i => i.code === itemCode ? { ...i, orderQty: Math.max(0, parseInt(newQty) || 0) } : i);
        return { ...req, items: newItems };
      }
      return req;
    });
    setEditableReqs(updated);
    setRequisitions(updated);
  };

  const handleDeleteReq = (reqId) => {
    if (window.confirm('Delete this order requisition?')) {
      const updated = editableReqs.filter(r => r.id !== reqId);
      setEditableReqs(updated);
      setRequisitions(updated);
    }
  };

  // Convert Requisition to Proforma Invoice grouped by Supplier
  const convertToPI = (req) => {
    // Group items by supplier
    const groupedBySupplier = {};
    req.items.forEach(item => {
      const sup = item.supplier || 'General Supplier';
      if (!groupedBySupplier[sup]) groupedBySupplier[sup] = [];
      groupedBySupplier[sup].push(item);
    });

    const newPIs = Object.keys(groupedBySupplier).map(supplier => ({
      piNumber: 'PI-' + Math.floor(1000 + Math.random() * 9000),
      reqId: req.id,
      branch: req.branch,
      supplier: supplier,
      date: new Date().toISOString().split('T')[0],
      items: groupedBySupplier[supplier],
      status: 'Pending Supplier Confirmation'
    }));

    setProformaInvoices([...proformaInvoices, ...newPIs]);
    // Remove or update requisition status
    const updated = editableReqs.map(r => r.id === req.id ? { ...r, status: 'Converted to PI' } : r);
    setEditableReqs(updated);
    setRequisitions(updated);
    alert('Proforma Invoices successfully generated for suppliers!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Order Consolidation & MOQ Planning</h2>

      {editableReqs.length === 0 ? (
        <p style={{ color: '#64748b' }}>No branch order requisitions available.</p>
      ) : (
        editableReqs.map((req, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, color: '#1e293b' }}>{req.id} — Branch: <b>{req.branch}</b> ({req.location})</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Date: {req.date} | Status: <b>{req.status}</b></span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleDeleteReq(req.id)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                {req.status !== 'Converted to PI' && (
                  <button onClick={() => convertToPI(req)} style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Convert to Proforma Invoice</button>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px' }}>Supplier</th>
                  <th style={{ padding: '10px' }}>Item Code</th>
                  <th style={{ padding: '10px' }}>Item Name</th>
                  <th style={{ padding: '10px' }}>MOQ</th>
                  <th style={{ padding: '10px' }}>Ordered Qty</th>
                  <th style={{ padding: '10px' }}>MOQ Met?</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((item, iIdx) => {
                  const met = item.orderQty >= (item.moq || 0);
                  return (
                    <tr key={iIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: '500', color: '#2563eb' }}>{item.supplier}</td>
                      <td style={{ padding: '10px' }}>{item.code}</td>
                      <td style={{ padding: '10px' }}>{item.name}</td>
                      <td style={{ padding: '10px' }}>{item.moq}</td>
                      <td style={{ padding: '10px' }}>
                        <input 
                          type="number" 
                          value={item.orderQty} 
                          onChange={(e) => handleQtyEdit(req.id, item.code, e.target.value)}
                          style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: met ? '#dcfce7' : '#fee2e2', color: met ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                          {met ? 'Yes' : 'Below MOQ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
