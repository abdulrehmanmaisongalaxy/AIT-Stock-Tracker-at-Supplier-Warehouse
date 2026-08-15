import React, { useState } from 'react';

export function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers, items }) {
  const [selectedPi, setSelectedPi] = useState(proformaInvoices[0] || null);

  const handleDeletePi = (piId) => {
    if (window.confirm('Delete this Proforma Invoice?')) {
      setProformaInvoices(proformaInvoices.filter(pi => pi.id !== piId));
      setSelectedPi(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Proforma Invoices ({proformaInvoices.length})</h2>
        <div className="space-y-2">
          {proformaInvoices.map(pi => {
            const sup = suppliers.find(s => s.id === pi.supplierId);
            const isSelected = selectedPi?.id === pi.id;
            return (
              <div 
                key={pi.id} 
                onClick={() => setSelectedPi(pi)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-[#1B2430] bg-gray-50' : 'border-[#E4DFD3] hover:border-gray-400'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1B2430]">{pi.id}</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">{pi.status}</span>
                </div>
                <p className="text-[11px] text-[#7A7568]">{sup?.name || pi.supplierId}</p>
              </div>
            );
          })}
          {proformaInvoices.length === 0 && <p className="text-xs text-gray-400">No Proforma Invoices created yet.</p>}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-6">
        {selectedPi ? (
          <>
            <div className="flex justify-between items-start border-b border-[#E4DFD3] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1B2430]">{selectedPi.id} Details</h3>
                <p className="text-xs text-[#7A7568]">Supplier: {suppliers.find(s => s.id === selectedPi.supplierId)?.name}</p>
              </div>
              <button onClick={() => handleDeletePi(selectedPi.id)} className="bg-rose-50 text-rose-700 text-xs px-3 py-1.5 rounded-xl font-semibold cursor-pointer">
                Delete PI
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Price ($)</th>
                    <th className="p-3 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DFD3]">
                  {selectedPi.items.map((piItem, idx) => {
                    const item = items.find(i => i.id === piItem.itemId);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-semibold text-[#1B2430]">{item?.name || piItem.itemId}</div>
                          <div className="text-[10px] text-[#7A7568]">{piItem.itemId}</div>
                        </td>
                        <td className="p-3 font-medium">{piItem.qty}</td>
                        <td className="p-3">${piItem.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-[#1B2430]">${(piItem.qty * piItem.unitPrice).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-xs text-[#7A7568]">Select a Proforma Invoice to view details</div>
        )}
      </div>
    </div>
  );
}
