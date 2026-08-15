import React from 'react';

export function StockLedger({ items, suppliers, proformaInvoices, shipments }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-[#E4DFD3] pb-4">
        <div>
          <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Stock Ledger & Inventory Valuation</h2>
          <p className="text-xs text-[#7A7568]">Real-time tracking of master inventory items and stock movements</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
            <tr>
              <th className="p-3">Item Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">MOQ</th>
              <th className="p-3 text-right">Pack Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DFD3]">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold text-[#1B2430]">{item.name}</div>
                  <div className="text-[10px] text-[#7A7568]">{item.id}</div>
                </td>
                <td className="p-3 text-[#7A7568]">{item.category}</td>
                <td className="p-3 text-[#7A7568]">{item.supplier}</td>
                <td className="p-3 font-medium">{item.moq} {item.unit}</td>
                <td className="p-3 text-right text-[#7A7568]">{item.packSize || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
