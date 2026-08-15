import React from 'react';

export function ExecutiveDashboard({ items, suppliers, requisitions, proformaInvoices, shipments }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-[11px] font-bold text-[#7A7568] uppercase tracking-wider">Active Items</div>
          <div className="text-2xl font-black text-[#1B2430] mt-1">{items.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-[11px] font-bold text-[#7A7568] uppercase tracking-wider">Suppliers</div>
          <div className="text-2xl font-black text-[#1B2430] mt-1">{suppliers.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-[11px] font-bold text-[#7A7568] uppercase tracking-wider">Pending Requisitions</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{requisitions.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div className="text-[11px] font-bold text-[#7A7568] uppercase tracking-wider">Active Shipments</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{shipments.length}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Recent System Activity</h2>
        <p className="text-xs text-[#7A7568]">All modules are successfully synced. Use the navigation bar above to manage orders, branches, and container shipments.</p>
      </div>
    </div>
  );
}
