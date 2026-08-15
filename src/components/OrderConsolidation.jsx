import React, { useState } from 'react';

export function OrderConsolidation({ items, suppliers, requisitions, setProformaInvoices, setRequisitions }) {
  // Consolidate pending requisitions by Item ID
  const consolidatedMap = {};
  requisitions.filter(r => r.status === 'Pending').forEach(req => {
    req.items.forEach(it => {
      if (!consolidatedMap[it.itemId]) {
        consolidatedMap[it.itemId] = 0;
      }
      consolidatedMap[it.itemId] += Number(it.qty || 0);
    });
  });

  const consolidatedList = Object.keys(consolidatedMap).map(itemId => {
    const item = items.find(i => i.id === itemId) || { name: itemId, moq: 1000, supplier: 'General Supplier' };
    const totalQty = consolidatedMap[itemId];
    const meetsMOQ = totalQty >= (item.moq || 0);
    return {
      itemId,
      itemName: item.name,
      supplier: item.supplier,
      moq: item.moq || 1000,
      totalQty,
      meetsMOQ
    };
  });

  const handleConvertToPI = (supplierName) => {
    const supplierItems = consolidatedList.filter(i => i.supplier === supplierName && i.meetsMOQ);
    if (supplierItems.length === 0) {
      alert("No items meet the MOQ requirement for this supplier.");
      return;
    }

    const newPiId = `PI-2026-${Math.floor(100 + Math.random() * 900)}` ;
    const supObj = suppliers.find(s => s.name === supplierName) || { id: 'SUP-01' };
    
    const piItems = supplierItems.map(i => ({
      itemId: i.itemId,
      qty: i.totalQty,
      unitPrice: 2.5 // Default placeholder price
    }));

    const newPi = {
      id: newPiId,
      supplierId: supObj.id,
      date: new Date().toISOString().split('T')[0],
      status: 'In Production',
      items: piItems
    };

    setProformaInvoices(prev => [newPi, ...prev]);

    // Mark requisitions as processed
    setRequisitions(prev => prev.map(r => ({ ...r, status: 'Converted to PI' })));
    alert(`Successfully generated Proforma Invoice ${newPiId} for ${supplierName}!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Order Consolidation & MOQ Check</h2>
        <p className="text-xs text-[#7A7568]">Consolidating branch order requisitions and checking supplier Minimum Order Quantities (MOQ).</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Consolidated Branch Demand vs. Supplier MOQ</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                <th className="pb-3 font-semibold">Item Code</th>
                <th className="pb-3 font-semibold">Item Name</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold text-right">Required MOQ</th>
                <th className="pb-3 font-semibold text-right">Total Ordered Qty</th>
                <th className="pb-3 font-semibold text-center">MOQ Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {consolidatedList.map((row) => (
                <tr key={row.itemId} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 font-bold text-[#1B2430]">{row.itemId}</td>
                  <td className="py-3 text-[#1B2430]">{row.itemName}</td>
                  <td className="py-3 text-[#7A7568]">{row.supplier}</td>
                  <td className="py-3 text-right font-medium">{row.moq}</td>
                  <td className="py-3 text-right font-bold text-[#1B2430]">{row.totalQty}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.meetsMOQ ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {row.meetsMOQ ? 'MOQ Met ✓' : 'Below MOQ ⚠'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Panel */}
        <div className="pt-4 border-t border-[#E4DFD3] flex justify-between items-center">
          <span className="text-xs text-[#7A7568]">Suppliers with met MOQs can be instantly converted into Proforma Invoices.</span>
          {suppliers.map(sup => (
            <button
              key={sup.id}
              onClick={() => handleConvertToPI(sup.name)}
              className="bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Convert {sup.name} to PI
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
