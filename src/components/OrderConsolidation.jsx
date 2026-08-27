import React, { useState } from 'react';

export default function OrderConsolidation({ 
  requisitions = [], 
  setRequisitions = () => {}, 
  items = [], 
  suppliers = [], 
  setProformaInvoices = () => {} 
}) {
  const [editedQtys, setEditedQtys] = useState({});

  const handleDeleteReq = (reqNo) => {
    if (window.confirm(`Are you sure you want to delete requisition ${reqNo}?`)) {
      setRequisitions(requisitions.filter(r => r.reqNo !== reqNo));
    }
  };

  // Aggregate total ordered quantities across all requisitions by item code
  const consolidatedMap = {};
  requisitions.forEach(req => {
    const reqItems = req.items || req.lineItems || [];
    if (Array.isArray(reqItems)) {
      reqItems.forEach(line => {
        const itemCode = line.code || line.itemCode || line.sku;
        const itemName = line.name || line.itemName || itemCode;
        if (itemCode || itemName) {
          const mapKey = itemCode || itemName;
          if (!consolidatedMap.hasOwnProperty(mapKey)) {
            consolidatedMap[mapKey] = { 
              code: itemCode || itemName, 
              name: itemName, 
              totalOrdered: 0, 
              branchBreakdown: {} 
            };
          }
          const qtyVal = Number(line.qty || line.quantity || line.requestedQty) || 0;
          consolidatedMap[mapKey].totalOrdered += qtyVal;
          const branchName = req.branchName || req.branch || 'Branch';
          consolidatedMap[mapKey].branchBreakdown[branchName] = 
            (consolidatedMap[mapKey].branchBreakdown[branchName] || 0) + qtyVal;
        }
      });
    }
  });

  const handleQtyChange = (code, val) => {
    setEditedQtys({ ...editedQtys, [code]: Number(val) });
  };

  // Group by Supplier to generate Proforma Invoices
  const convertToPI = (supplierName) => {
    const supplierItems = Object.values(consolidatedMap).map(itemMeta => {
      const itemMaster = items.find(i => 
        (i.code && itemMeta.code && i.code.toLowerCase() === itemMeta.code.toLowerCase()) || 
        (i.name && itemMeta.name && i.name.toLowerCase() === itemMeta.name.toLowerCase())
      );
      
      const itemSupplier = itemMaster ? itemMaster.supplier : null;

      // Match supplier case-insensitively or via exact match
      const matchesSupplier = itemSupplier && supplierName && 
        itemSupplier.trim().toLowerCase() === supplierName.trim().toLowerCase();

      if (!matchesSupplier) return null;
      
      const finalQty = editedQtys[itemMeta.code] !== undefined ? Number(editedQtys[itemMeta.code]) : Number(itemMeta.totalOrdered);
      const unitPrice = Number(itemMaster?.price || itemMaster?.unitPrice || 0);
      
      return {
        code: itemMeta.code,
        name: itemMeta.name,
        qty: finalQty,
        unitPrice: unitPrice,
        currency: itemMaster?.currency || 'USD',
        totalLCY: finalQty * unitPrice
      };
    }).filter(Boolean);

    if (supplierItems.length === 0) {
      alert('No valid items found for this supplier.');
      return;
    }

    const totalLCYAmount = supplierItems.reduce((acc, curr) => acc + curr.totalLCY, 0);
    const supObj = suppliers.find(s => s.name?.toLowerCase() === supplierName?.toLowerCase());
    const currency = supObj ? supObj.currency : (supplierItems[0]?.currency || 'USD');
    
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

      {/* Pending Requisitions Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-emerald-400 text-lg">Pending Requisitions</h3>
        {requisitions.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No requisitions submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                  <th className="p-3">Req #</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Items Count</th>
                  <th className="p-3">Total CBM</th>
                  <th className="p-3">Total Weight (Kg)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map(req => {
                  const reqKey = req.reqNo || req.id;
                  const reqItemsCount = (req.items || req.lineItems || []).length;
                  return (
                    <tr key={reqKey} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-3 font-semibold text-white">{reqKey}</td>
                      <td className="p-3">{req.branchName || req.branch}</td>
                      <td className="p-3">{reqItemsCount} items</td>
                      <td className="p-3">{req.totalCBM || req.totalCbm || '0.00'}</td>
                      <td className="p-3">{req.totalWeight || '0'}</td>
                      <td className="p-3">
                        <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleDeleteReq(reqKey)} 
                          className="text-rose-400 hover:text-rose-300 hover:underline text-xs font-medium cursor-pointer transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consolidated Items & Supplier MOQ Check */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-emerald-400 text-lg">Consolidated Items & Supplier MOQ Check</h3>
        </div>

        {Object.keys(consolidatedMap).length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No items available to consolidate from pending requisitions.</p>
        ) : (
          suppliers.map(sup => {
            // Strictly filter items that belong to this specific supplier using robust matching
            const supItems = Object.values(consolidatedMap).filter(meta => {
              const master = items.find(i => 
                (i.code && meta.code && i.code.toLowerCase() === meta.code.toLowerCase()) || 
                (i.name && meta.name && i.name.toLowerCase() === meta.name.toLowerCase())
              );
              return master && master.supplier && sup.name && 
                master.supplier.trim().toLowerCase() === sup.name.trim().toLowerCase();
            });

            // If this supplier has no items in the current requisitions, hide their card
            if (supItems.length === 0) return null;

            return (
              <div key={sup.code || sup.name} className="border border-slate-700 rounded-xl p-4 space-y-3 bg-slate-900/40 mt-4 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="font-bold text-sm text-amber-400">
                    Supplier: {sup.name} ({sup.country || 'Global'}) — Warehouse: {sup.warehouseNo || 'WH-01'}
                  </h4>
                  <button 
                    onClick={() => convertToPI(sup.name)} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2 rounded-lg font-semibold shadow transition-colors cursor-pointer text-white"
                  >
                    Convert to Proforma Invoice
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs text-slate-400 bg-slate-900/50">
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
                        const master = items.find(i => 
                          (i.code && meta.code && i.code.toLowerCase() === meta.code.toLowerCase()) || 
                          (i.name && meta.name && i.name.toLowerCase() === meta.name.toLowerCase())
                        );
                        const moqLimit = master ? Number(master.moq || master.MOQ) || 1000 : 1000;
                        const currentQty = editedQtys[meta.code] !== undefined ? editedQtys[meta.code] : meta.totalOrdered;
                        const meetsMOQ = currentQty >= moqLimit;
                        const breakdownStr = Object.entries(meta.branchBreakdown).map(([b, q]) => `${b}: ${q}`).join(', ');

                        return (
                          <tr key={meta.code} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="p-2.5 font-semibold text-white">{meta.code}</td>
                            <td className="p-2.5">{master ? master.name : meta.name}</td>
                            <td className="p-2.5 font-bold text-emerald-300">{currentQty}</td>
                            <td className="p-2.5 text-slate-300">{moqLimit}</td>
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
                                className="bg-slate-900 border border-slate-700 p-1.5 rounded-md w-24 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
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
          })
        )}
      </div>
    </div>
  );
}
