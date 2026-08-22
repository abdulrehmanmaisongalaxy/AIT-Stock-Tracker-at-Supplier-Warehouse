import React from 'react';

export default function Dashboard({ items = [], suppliers = [], branches = [], requisitions = [], proformaInvoices = [], shipments = [], stockLedger = [] }) {
  const totalStockValUSD = stockLedger.reduce((acc, curr) => acc + (Number(curr.closingStock || 0) * Number(curr.unitPriceUSD || 0)), 0);

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Executive Dashboard</h2>
        <p className="text-sm text-slate-400">Overview of your global supplier warehouse operations and branch replenishment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Items</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400">{items.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Suppliers & Warehouses</p>
          <p className="text-3xl font-bold mt-2 text-amber-400">{suppliers.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Active Branches</p>
          <p className="text-3xl font-bold mt-2 text-purple-400">{branches.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Pending Requisitions</p>
          <p className="text-3xl font-bold mt-2 text-blue-400">{requisitions.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Proforma Invoices</p>
          <p className="text-3xl font-bold mt-2 text-teal-400">{proformaInvoices.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">Active Shipments</p>
          <p className="text-3xl font-bold mt-2 text-rose-400">{shipments.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow sm:col-span-2 lg:col-span-3">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Stock Value (USD)</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400">${totalStockValUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>
    </div>
  );
}
