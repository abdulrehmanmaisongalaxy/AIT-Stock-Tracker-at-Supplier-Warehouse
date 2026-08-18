import React, { useState } from 'react';

export default function OrderConsolidation({ requisitions, setRequisitions, proformaInvoices, setProformaInvoices, items, setItems, suppliers }) {
  const [actionChoices, setActionChoices] = useState({});
  const [editingReqId, setEditingReqId] = useState(null);
  const [editItemQtyMap, setEditItemQtyMap] = useState({});

  const handleChoiceChange = (reqId, itemCode, choice) => {
    setActionChoices({ ...actionChoices, [`${reqId}_${itemCode}`]: choice });
  };

  const handleStartEditReq = (req) => {
    setEditingReqId(req.id);
    const map = {};
    req.items.forEach(i => { map[i.code] = i.orderedQty; });
    setEditItemQtyMap(map);
  };

  const handleSaveEditReq = (reqId) => {
    const updated = requisitions.map(r => {
      if (r.id === reqId) {
        const newItems = r.items.map(item => ({
          ...item,
          orderedQty: parseInt(editItemQtyMap[item.code]) || item.orderedQty
        }));
        return { ...r, items: newItems };
      }
      return r;
    });
    setRequisitions(updated);
    setEditingReqId(null);
    alert('Requisition quantities updated successfully!');
  };

  const handleDeleteReq = (reqId) => {
    if (confirm('Are you sure you want to delete this requisition?')) {
      setRequisitions(requisitions.filter(r => r.id !== reqId));
    }
  };

  const handleConvertToPI = (req) => {
    // Group items by supplier or pick main supplier
    const firstItem = req.items[0];
    const masterItemObj = items.find(m => m.code === firstItem?.code);
    const supplierName = masterItemObj ? masterItemObj.supplier : 'Global Chem China';
    const supplierObj = suppliers.find(s => s.name === supplierName) || suppliers[0];

    const currency = supplierObj?.currency || 'CNY';
    const exRate = supplierObj?.exchangeRate || 7.25;

    let totalLCY = 0;
    let totalUSD = 0;

    const piItems = req.items.map(it => {
      const mItem = items.find(m => m.code === it.code);
      const unitLCY = mItem ? mItem.unitPriceLCY : 85;
      const unitUSD = mItem ? mItem.unitPriceUSD : 11.72;
      const lineLCY = it.orderedQty * unitLCY;
      const lineUSD = it.orderedQty * unitUSD;
      totalLCY += lineLCY;
      totalUSD += lineUSD;
      return { ...it, supplier: supplierName, unitLCY, unitUSD, lineLCY, lineUSD };
    });

    const piRef = 'PI-' + Date.now().toString().slice(-6);
    const newPI = {
      piId: piRef,
      reqId: req.id,
      branchName: req.branchName,
      supplierName: supplierObj.name,
      currency,
      exchangeRate: exRate,
      totalAmountLCY: totalLCY,
      totalAmountUSD: totalUSD,
      status: 'Pending Supplier Confirmation',
      items: piItems
    };

    setProformaInvoices([...proformaInvoices, newPI]);
    setRequisitions(requisitions.map(r => r.id === req.id ? { ...r, status: `Converted to PI (${piRef})` } : r));

    // Update items ordered quantity in master
    const updatedItems = items.map(item => {
      const matched = req.items.find(i => i.code === item.code);
      if (matched) {
        return { ...item, orderedQty: (item.orderedQty || 0) + matched.orderedQty };
      }
      return item;
    });
    setItems(updatedItems);
    alert(`Requisition successfully converted to PI (${piRef})!`);
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Order Consolidation & MOQ Planning Hub</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Review branch requisitions, edit quantities to meet MOQ, and generate Proforma Invoices.</p>

      {requisitions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px' }}>
          No branch requisitions available. Submit a test order from a branch portal to view it here.
        </div>
      ) : (
        requisitions.map(req => {
          const isEditing = editingReqId === req.id;
          return (
            <div key={req.id} style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '6px', marginBottom: '20px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a' }}>{req.branchName}</b> (Req ID: <b>{req.id}</b>) 
                  <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '13px' }}>Date: {req.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ background: req.status.includes('Converted') ? '#dcfce7' : '#fef9c3', color: req.status.includes('Converted') ? '#166534' : '#854d0e', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {req.status}
                  </span>
                  {!req.status.includes('Converted') && (
                    <>
                      {isEditing ? (
                        <button onClick={() => handleSaveEditReq(req.id)} style={btnGreen}>Save Qty</button>
                      ) : (
                        <button onClick={() => handleStartEditReq(req)} style={btnSmEdit}>Edit Qty</button>
                      )}
                      <button onClick={() => handleDeleteReq(req.id)} style={btnSmDel}>Delete</button>
                    </>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                    <th style={thStyle}>Item Code & Name</th>
                    <th style={thStyle}>Assigned Supplier</th>
                    <th style={thStyle}>Ordered Pcs</th>
                    <th style={thStyle}>MOQ</th>
                    <th style={thStyle}>MOQ Status</th>
                    <th style={thStyle}>HQ Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {req.items.map((it, idx) => {
                    const masterItem = items.find(m => m.code === it.code);
                    const moq = masterItem ? masterItem.moq : 500;
                    const supplierName = masterItem ? masterItem.supplier : 'Global Chem China';
                    const currentQty = isEditing ? (editItemQtyMap[it.code] !== undefined ? editItemQtyMap[it.code] : it.orderedQty) : it.orderedQty;
                    const isMet = currentQty >= moq;
                    const key = `${req.id}_${it.code}`;
                    const currentChoice = actionChoices[key] || (isMet ? 'Place Order' : 'Hold / Increase Qty');

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}><b>{it.code}</b><br/>{it.name}</td>
                        <td style={{ ...tdStyle, fontWeight: '600', color: '#0284c7' }}>{supplierName}</td>
                        <td style={tdStyle}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editItemQtyMap[it.code] ?? it.orderedQty} 
                              onChange={(e) => setEditItemQtyMap({ ...editItemQtyMap, [it.code]: e.target.value })}
                              style={{ width: '80px', padding: '4px' }}
                            />
                          ) : (
                            <b>{it.orderedQty}</b>
                          )}
                        </td>
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
                            disabled={req.status.includes('Converted')}
                          >
                            <option value="Place Order">Place Order</option>
                            <option value="Hold / Increase Qty">Hold / Increase Qty</option>
                            <option value="Place with Buffer">Place with Buffer</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!req.status.includes('Converted') && (
                <button onClick={() => handleConvertToPI(req)} style={btnGreen}>
                  Convert to Proforma Invoice (PI) & Place Order
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', fontWeight: '600' };
const tdStyle = { padding: '10px 12px', color: '#475569' };
const btnGreen = { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnSmEdit = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const btnSmDel = { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
