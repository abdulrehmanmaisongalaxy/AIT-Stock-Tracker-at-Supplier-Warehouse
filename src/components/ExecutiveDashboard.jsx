import React from 'react';

export default function ExecutiveDashboardTab({ items, requisitions }) {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + ((i.openingStock || 0) * (i.unitPrice || 0)), 0);
  const totalRequisitionsCount = Object.values(requisitions).reduce((sum, branchReqs) => {
    return sum + Object.values(branchReqs).reduce((a, b) => a + (Number(b) || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow">
          <p className="text-xs text-gray-400">Total Master Items</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{totalItems}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow">
          <p className="text-xs text-gray-400">Total Inventory Valuation</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow">
          <p className="text-xs text-gray-400">Total Branch Requisition Units</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{totalRequisitionsCount} PCS</p>
        </div>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-md font-bold mb-2">Executive Overview</h2>
        <p className="text-sm text-gray-300">Welcome to your multi-warehouse stock tracking and supplier control portal. Use the navigation tabs above to manage inventory master catalogs, configure branch links, track stock ledger values, optimize container MOQ consolidation, and generate supplier Proforma Invoices.</p>
      </div>
    </div>
  );
}
