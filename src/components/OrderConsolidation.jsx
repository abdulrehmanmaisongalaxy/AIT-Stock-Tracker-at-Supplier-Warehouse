import React, { useState } from 'react';

export default function OrderConsolidation({ items, requisitions, setProformaInvoices }) {
  const [selectedSupplier, setSelectedSupplier] = useState(items[0]?.supplier || '');
  const supplierItems = items.filter(i => i.supplier === selectedSupplier);

  const getConsolidatedQty = (itemId) => {
    let total = 0;
    Object.values(requisitions).forEach(branchReqs => {
      total += Number(branchReqs[itemId]) || 0;
    });
    return total;
  };

  const handleGeneratePI = () => {
    const activeSupplierItems = supplierItems.map(i => ({ ...i, qty: getConsolidatedQty(i.id) })).filter(i => i.qty > 0);
    if (activeSupplierItems.length === 0) {
      alert("No branch requisition demand found for this supplier to generate a Proforma Invoice.");
      return;
    }

    const newPI = {
      id: `PI-${Date.now().toString().slice(-4)}`,
      supplier: selectedSupplier,
      date: new Date().toISOString().split('T')[0],
      items: activeSupplierItems
    };
    setProformaInvoices(prev => [...prev, newPI]);
    alert(`Proforma Invoice ${newPI.id} generated successfully for supplier ${selectedSupplier}!`);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold">ORDER CONSOLIDATION & MOQ OPTIMIZER</h2>
          <p className="text-xs text-gray-400">Consolidate branch demands into supplier purchase orders based on submitted requisitions</p>
        </div>
        <select 
          value={selectedSupplier} 
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-2 text-gray-200"
        >
          {[...new Set(items.map(i => i.supplier))].map(sup => (
            <option key={sup} value={sup}>{sup}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 bg-gray-900/40">
              <th className="p-3">Item Description</th>
              <th className="p-3">Supplier MOQ</th>
              <th className="p-3">Total Consolidated Qty</th>
              <th className="p-3">Estimated CBM / Wt</th>
              <th className="p-3">MOQ Status</th>
            </tr>
          </thead>
          <tbody>
            {supplierItems.map(item => {
              const qty = getConsolidatedQty(item.id);
              const isMet = qty >= item.moq;

              return (
                <tr key={item.id} className="border-b border-gray-700/60 hover:bg-gray-700/20">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.moq} PCS</td>
                  <td className="p-3 font-bold text-blue-400">{qty} PCS</td>
                  <td className="p-3 text-gray-400">{(item.cbm * qty).toFixed(2)} CBM / {(item.weight * (qty / (parseInt(item.packSize) || 1))).toFixed(1)} kg</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      qty === 0 ? 'bg-gray-700 text-gray-400' : isMet ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-900/60 text-amber-400'
                    }`}>
                      {qty === 0 ? 'No Demand' : isMet ? 'MOQ Met' : 'Below MOQ'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleGeneratePI}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2 rounded text-sm transition-colors shadow"
      >
        Generate Proforma Invoice (PI) for {selectedSupplier}
      </button>
    </div>
  );
}
