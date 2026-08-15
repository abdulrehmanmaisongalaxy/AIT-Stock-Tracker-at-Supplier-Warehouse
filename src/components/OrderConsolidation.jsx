import React, { useState } from 'react';

export function OrderConsolidation({ items, suppliers, requisitions, setProformaInvoices, setRequisitions }) {
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]?.name || '');

  // Filter requisitions that contain items from selected supplier
  const supplierItems = items.filter(i => i.supplier === selectedSupplier);
  const supplierItemIds = supplierItems.map(i => i.id);

  // Calculate total consolidated quantities per item
  const consolidatedTotals = {};
  requisitions.forEach(req => {
    req.items.forEach(ri => {
      if (supplierItemIds.includes(ri.itemId)) {
        consolidatedTotals[ri.itemId] = (consolidatedTotals[ri.itemId] || 0) + ri.qty;
      }
    });
  });

  // Container Fill Calculations (20FT = 28 CBM / 21,800 kg; 40FT = 58 CBM / 26,500 kg)
  let totalCbm = 0;
  let totalWeight = 0;
  Object.entries(consolidatedTotals).forEach(([itemId, qty]) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      totalCbm += (item.cbm || 0.01) * qty;
      totalWeight += (item.weightKg || 1) * qty;
    }
  });

  const container20ftPct = Math.min(100, Math.round((totalCbm / 28) * 100));
  const container40ftPct = Math.min(100, Math.round((totalCbm / 58) * 100));

  const handleGeneratePI = () => {
    const itemsList = Object.entries(consolidatedTotals).map(([itemId, qty]) => ({
      itemId,
      qty,
      unitPrice: 2.5 // default baseline
    }));

    if (itemsList.length === 0) {
      alert('No quantities consolidated for this supplier.');
      return;
    }

    const newPi = {
      id: `PI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: suppliers.find(s => s.name === selectedSupplier)?.id || 'SUP-01',
      date: new Date().toISOString().split('T')[0],
      status: 'Draft Issued',
      items: itemsList
    };

    setProformaInvoices(prev => [newPi, ...prev]);
    alert(`Proforma Invoice ${newPi.id} generated successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Order Consolidation & MOQ Optimizer</h2>
          <p className="text-[11px] text-[#7A7568]">Consolidate branch demands into supplier purchase orders</p>
        </div>
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="p-2 border border-[#E4DFD3] rounded-xl text-xs bg-gray-50 font-semibold">
          {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.warehouse})</option>)}
        </select>
      </div>

      {/* Container Fill Metres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#1B2430]">
            <span>20FT Container Capacity ({totalCbm.toFixed(2)} CBM / 28 CBM)</span>
            <span>{container20ftPct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${container20ftPct > 100 ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min(100, container20ftPct)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#7A7568]">Total Weight: {totalWeight.toFixed(1)} kg / Max 21,800 kg</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#1B2430]">
            <span>40FT Container Capacity ({totalCbm.toFixed(2)} CBM / 58 CBM)</span>
            <span>{container40ftPct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${container40ftPct > 100 ? 'bg-rose-600' : 'bg-indigo-600'}`} style={{ width: `${Math.min(100, container40ftPct)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#7A7568]">Total Weight: {totalWeight.toFixed(1)} kg / Max 26,500 kg</p>
        </div>
      </div>

      {/* Consolidation Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E4DFD3] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1B2430]">Consolidated Demand for {selectedSupplier}</h3>
            <p className="text-xs text-[#7A7568]">Review total branch requirements against supplier MOQ thresholds</p>
          </div>
          <button onClick={generatePI => handleGeneratePI()} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm">
            Generate Proforma Invoice (PI)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3">Supplier MOQ</th>
                <th className="p-3">Total Consolidated Qty</th>
                <th className="p-3">Estimated CBM / Wt</th>
                <th className="p-3 text-right">MOQ Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {supplierItems.map(item => {
                const totalQty = consolidatedTotals[item.id] || 0;
                const metMoq = totalQty >= item.moq;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-[#1B2430]">{item.name}</div>
                      <div className="text-[10px] text-[#7A7568]">{item.id}</div>
                    </td>
                    <td className="p-3 font-medium">{item.moq} {item.unit}</td>
                    <td className="p-3 font-bold text-[#1B2430]">{totalQty} {item.unit}</td>
                    <td className="p-3 text-[11px] text-[#7A7568]">{(item.cbm * totalQty).toFixed(2)} CBM / {(item.weightKg * totalQty).toFixed(1)} kg</td>
                    <td className="p-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${metMoq ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {metMoq ? 'MOQ Met' : 'Below MOQ'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
