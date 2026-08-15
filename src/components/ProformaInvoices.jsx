import React, { useState } from 'react';

export function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers, items }) {
  const [selectedPi, setSelectedPi] = useState(proformaInvoices[0] || null);

  const updateStatus = (piId, newStatus) => {
    setProformaInvoices(prev => prev.map(pi => pi.id === piId ? { ...pi, status: newStatus } : pi));
    if (selectedPi && selectedPi.id === piId) {
      setSelectedPi(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Supplier Proforma Invoices (PI)</h2>
        <p className="text-xs text-[#7A7568]">Track signed PIs, production progress, and upload supplier documentation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PI List */}
        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">All Proforma Invoices</h3>
          <div className="space-y-2">
            {proformaInvoices.map(pi => {
              const sup = suppliers.find(s => s.id === pi.supplierId);
              return (
                <div
                  key={pi.id}
                  onClick={() => setSelectedPi(pi)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedPi?.id === pi.id ? 'border-[#1B2430] bg-[#FAF8F5]' : 'border-[#E4DFD3] hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#1B2430]">{pi.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">{pi.status}</span>
                  </div>
                  <div className="text-xs text-[#7A7568] mt-1">{sup ? sup.name : pi.supplierId}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Date: {pi.date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PI Details & Management */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          {selectedPi ? (
            <>
              <div className="flex justify-between items-start border-b border-[#E4DFD3] pb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2430]">{selectedPi.id} Details</h3>
                  <p className="text-xs text-[#7A7568]">Issued Date: {selectedPi.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPi.status}
                    onChange={(e) => updateStatus(selectedPi.id, e.target.value)}
                    className="bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-1.5 text-xs font-medium text-[#1B2430] focus:outline-none"
                  >
                    <option value="In Production">In Production</option>
                    <option value="Ready at Warehouse">Ready at Warehouse</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7568] mb-3">Line Items</h4>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                      <th className="pb-2 font-semibold">Item</th>
                      <th className="pb-2 font-semibold text-right">Quantity</th>
                      <th className="pb-2 font-semibold text-right">Unit Price ($)</th>
                      <th className="pb-2 font-semibold text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DFD3]">
                    {selectedPi.items.map((it, idx) => {
                      const itemObj = items.find(i => i.id === it.itemId);
                      return (
                        <tr key={idx}>
                          <td className="py-2.5 font-medium text-[#1B2430]">{itemObj ? itemObj.name : it.itemId}</td>
                          <td className="py-2.5 text-right">{it.qty}</td>
                          <td className="py-2.5 text-right">${it.unitPrice || 0}</td>
                          <td className="py-2.5 text-right font-bold">${(it.qty * (it.unitPrice || 0)).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-[#E4DFD3] flex items-center justify-between">
                <span className="text-xs text-[#7A7568]">Upload signed PI PDF or supplier documents</span>
                <input type="file" className="text-xs text-[#7A7568]" />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-[#7A7568]">Select a Proforma Invoice to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
