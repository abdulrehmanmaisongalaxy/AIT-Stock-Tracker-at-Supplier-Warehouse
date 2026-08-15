import React from 'react';

export function ExecutiveDashboard({ items, suppliers, requisitions, proformaInvoices, shipments }) {
  const totalItems = items.length;
  const pendingReqs = requisitions.filter(r => r.status === 'Pending').length;
  const activePis = proformaInvoices.filter(pi => pi.status !== 'Completed').length;
  const totalShipments = shipments.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Executive Summary & Operations Dashboard</h2>
        <p className="text-xs text-[#7A7568]">Real-time overview of supplier warehouse stock, active PIs, and regional branch orders.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Registered Items</div>
          <div className="text-2xl font-black text-[#1B2430] mt-2">{totalItems}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Across {suppliers.length} Suppliers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Pending Branch Requisitions</div>
          <div className="text-2xl font-black text-[#D97706] mt-2">{pendingReqs}</div>
          <div className="text-xs text-[#7A7568] mt-1">Awaiting consolidation & MOQ check</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Active Proforma Invoices</div>
          <div className="text-2xl font-black text-[#1B2430] mt-2">{activePis}</div>
          <div className="text-xs text-blue-600 mt-1 font-medium">In Production / At Warehouse</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Containers Dispatched</div>
          <div className="text-2xl font-black text-[#1B2430] mt-2">{totalShipments}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Exported to Africa Branches</div>
        </div>
      </div>

      {/* Quick Activity Summary Table */}
      <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568] mb-4">Recent Supplier Proforma Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                <th className="pb-3 font-semibold">PI Reference</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {proformaInvoices.map((pi) => {
                const sup = suppliers.find(s => s.id === pi.supplierId);
                return (
                  <tr key={pi.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#1B2430]">{pi.id}</td>
                    <td className="py-3 text-[#1B2430]">{sup ? sup.name : pi.supplierId}</td>
                    <td className="py-3 text-[#7A7568]">{pi.date}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        {pi.status}
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
