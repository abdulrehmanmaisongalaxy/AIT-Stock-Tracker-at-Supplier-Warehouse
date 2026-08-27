import React, { useState } from 'react';

export default function OrderConsolidation({ requisitions, setRequisitions, items, suppliers, setProformaInvoices }) {
  const [editedQtys, setEditedQtys] = useState({});

  const handleDeleteReq = (reqNo) => {
    if (confirm(`Delete requisition ${reqNo}?`)) {
      setRequisitions(requisitions.filter(r => r.reqNo !== reqNo));
    }
  };

  // Aggregate total ordered quantities across all requisitions by item code
  const consolidatedMap = {};
  requisitions.forEach(req => {
    if (req.items && Array.isArray(req.items)) {
      req.items.forEach(line => {
        const itemCode = line.code || line.itemCode;
        if (itemCode) {
          if (!consolidatedMap[itemCode]) {
            consolidatedMap[itemCode] = { code: itemCode, totalOrdered: 0, branchBreakdown: {} };
          }
          const qtyVal = Number(line.qty || line.quantity) || 0;
          consolidatedMap[itemCode].totalOrdered += qtyVal;
          consolidatedMap[itemCode].branchBreakdown[req.branchName] = (consolidatedMap[itemCode].branchBreakdown[req.branchName] || 0) + qtyVal;
        }
      });
    }
  });

  const handleQtyChange = (code, val) => {
    setEditedQtys({ ...editedQtys, [code]: Number(val) });
  };

  // Group by Supplier to generate Proforma Invoices with safe numeric fallbacks
  const convertToPI = (supplierName) => {
    const supplierItems = Object.values(consolidatedMap).map(itemMeta => {
      const itemMaster = items.find(i => i.code === itemMeta.code);
      if (!itemMaster || itemMaster.supplier !== supplierName) return null;
      
      const finalQty = editedQtys[itemMeta.code] !== undefined ? Number(editedQtys[itemMeta.code]) : Number(itemMeta.totalOrdered);
      const unitPrice = Number(itemMaster.price || itemMaster.unitPrice) || 0;
      
      return {
        code: itemMaster.code,
        name: itemMaster.name,
        qty: finalQty,
        unitPrice: unitPrice,
        currency: itemMaster.currency || 'USD',
        totalLCY: finalQty * unitPrice
      };
    }).filter(Boolean);

    if (supplierItems.length === 0) {
      alert('No valid items found for this supplier.');
      return;
    }

    const totalLCYAmount = supplierItems.reduce((acc, curr) => acc + curr.totalLCY, 0);
    const supObj = suppliers.find(s => s.name === supplierName);
    const currency = supObj ? supObj.currency : (supplierItems[0]?.currency || 'USD');
    
    // Approximate conversion rate mapping
    let rate = 1;
    if (currency === 'YUAN') rate = 0.14;
    if (currency === 'INR') rate = 0.012;
    const totalUSD = totalLCYAmount * rate;

    const newPI = {
      piNo: `PINV-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName,
      currency,
      totalLCY: totalLCYAmount.toFixed(2),
      totalUSD: totalUSD.toFixed(2),
      items: supplierItems,
      status: 'Pending Supplier Confirmation',
      date: new Date().toISOString().split('T')[0]
    };

    setProformaInvoices(prev => [newPI, ...prev]);

    // Clear edited quantities for these specific items
    const updatedQtys = { ...editedQtys };
    supplierItems.forEach(si => delete updatedQtys[si.code]);
    setEditedQtys(updatedQtys);

    alert(`Proforma Invoice ${newPI.piNo} generated successfully for ${supplierName}!`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Order Consolidation & MOQ Planning</h2>
        <p className="text-sm text-slate-400">Review incoming branch requisitions, verify MOQ compliance, adjust quantities, and convert into Proforma Invoices.</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-md">
        <h3 className="font-bold text-emerald-400">Pending Requisitions</h3>
        {requisitions.length === 0 ? (
          <p className="text-sm text-slate-400">No requisitions submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                  <th className="p-3">Req #</th><th className="p-3">Branch</th><th className="p-3">Total CBM</th><th className="p-3">Total Weight (Kg)</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map(req => (
                  <tr key={req.reqNo} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-white">{req.reqNo}</td>
                    <td className="p-3">{req.branchName}</td>
                    <td className="p-3">{req.totalCBM}</td>
                    <td className="p-3">{req.totalWeight}</td>
                    <td className="p-3"><span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded text-xs">{req.status}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteReq(req.reqNo)} className="text-rose-400 hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-emerald-400">Consolidated Items & Supplier MOQ Check</h3>
        </div>

        {suppliers.map(sup => {
          const supItems = Object.values(consolidatedMap).filter(meta => {
            const master = items.find(i => i.code === meta.code);
            return master && master.supplier === sup.name;
          });

          if (supItems.length === 0) return null;

          return (
            <div key={sup.code} className="border border-slate-700 rounded-xl p-4 space-y-3 bg-slate-900/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h4 className="font-bold text-sm text-amber-400">Supplier: {sup.name} ({sup.country}) - Warehouse: {sup.warehouseNo}</h4>
                <button onClick={() => convertToPI(sup.name)} className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2 rounded-lg font-semibold shadow transition-colors">Convert to Proforma Invoice</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs text-slate-400 bg-slate-900/30">
                      <th className="p-2.5">Item Code</th>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5">Total Ordered</th>
                      <th className="p-2.5">MOQ</th>
                      <th className="p-2.5">Meets MOQ?</th>
                      <th className="p-2.5">Branch Breakdown</th>
                      <th className="p-2.5">Edit Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supItems.map(meta => {
                      const master = items.find(i => i.code === meta.code);
                      if (!master) return null;
                      const currentQty = editedQtys[meta.code] !== undefined ? editedQtys[meta.code] : meta.totalOrdered;
                      const meetsMOQ = currentQty >= Number(master.moq);
                      const breakdownStr = Object.entries(meta.branchBreakdown).map(([b, q]) => `${b}: ${q}`).join(', ');

                      return (
                        <tr key={meta.code} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                          <td className="p-2.5 font-semibold text-white">{meta.code}</td>
                          <td className="p-2.5">{master.name}</td>
                          <td className="p-2.5 font-bold text-emerald-300">{currentQty}</td>
                          <td className="p-2.5 text-slate-300">{master.moq}</td>
                          <td className="p-2.5">
                            {meetsMOQ ? (
                              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-xs font-semibold">✓ Yes</span>
                            ) : (
                              <span className="text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded text-xs font-semibold">⚠ No</span>
                            )}
                          </td>
                          <td className="p-2.5 text-xs text-slate-400">{breakdownStr}</td>
                          <td className="p-2.5">
                            <input 
                              type="number" 
                              value={currentQty} 
                              onChange={e => handleQtyChange(meta.code, e.target.value)}
                              className="bg-slate-900 border border-slate-700 p-1.5 rounded w-24 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
