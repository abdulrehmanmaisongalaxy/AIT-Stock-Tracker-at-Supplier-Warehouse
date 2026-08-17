import React from 'react';

export default function ProformaInvoicesTab({ proformaInvoices, piSupplierFilter, setPiSupplierFilter }) {
  const filteredPIs = proformaInvoices.filter(pi => {
    if (piSupplierFilter !== 'ALL' && pi.supplier !== piSupplierFilter) return false;
    return true;
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold">PROFORMA INVOICES (PI)</h2>
          <p className="text-xs text-gray-400">Review and filter generated supplier purchase orders</p>
        </div>
        <select 
          value={piSupplierFilter} 
          onChange={(e) => setPiSupplierFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-2 text-gray-200"
        >
          <option value="ALL">All Suppliers</option>
          {[...new Set(proformaInvoices.map(p => p.supplier))].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filteredPIs.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No Proforma Invoices generated yet. Go to Order Consolidation & MOQ to create PIs.</p>
      ) : (
        <div className="space-y-6">
          {filteredPIs.map(pi => (
            <div key={pi.id} className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <div className="flex justify-between mb-4 border-b border-gray-800 pb-3">
                <div>
                  <h3 className="font-bold text-emerald-400">{pi.id}</h3>
                  <p className="text-xs text-gray-400">Supplier: {pi.supplier} | Date: {pi.date}</p>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-xs">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Ordered Qty</th>
                    <th className="pb-2">Unit Price</th>
                    <th className="pb-2">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pi.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-800/40">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-blue-400">{item.qty} PCS</td>
                      <td className="py-2">${item.unitPrice || 0}</td>
                      <td className="py-2 font-semibold">${((item.qty || 0) * (item.unitPrice || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
