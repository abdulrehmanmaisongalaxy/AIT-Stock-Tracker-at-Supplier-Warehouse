import React from 'react';

export default function ExecutiveDashboard({ items }) {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Executive Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <p className="text-sm text-slate-400">Total Catalog Items</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{totalItems}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <p className="text-sm text-slate-400">Total Stock Quantity</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalStock}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <p className="text-sm text-slate-400">System Status</p>
          <p className="text-2xl font-bold text-green-400 mt-1">Operational</p>
        </div>
      </div>
    </div>
  );
}
