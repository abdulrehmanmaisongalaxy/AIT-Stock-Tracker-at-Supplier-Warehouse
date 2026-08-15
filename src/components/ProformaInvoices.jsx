import React, { useState } from 'react';

export function ProformaInvoices({ proformaInvoices, setProformaInvoices, suppliers, items }) {
  const [editingPI, setEditingPI] = useState(null);
  const [status, setStatus] = useState('In Production');

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this Proforma Invoice?")) {
      setProformaInvoices(proformaInvoices.filter(pi => pi.id !== id));
    }
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!editingPI) return;
    setProformaInvoices(proformaInvoices.map(pi => pi.id === editingPI.id ? { ...pi, status } : pi));
    setEditingPI(null);
    alert("PI status updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Proforma Invoices (PI) Management</h2>
        <p className="text-xs text-[#7A7568]">Track supplier purchase orders, update production status, or remove obsolete PIs.</p>
      </div>

      {editingPI && (
        <form onSubmit={handleUpdateStatus} className="bg-white p-4 rounded-2xl border border-[#E4DFD3] flex items-center gap-4 text-xs">
          <span className="font-bold">Editing PI: {editingPI.id}</span>
          <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2">
            <option value="Draft">Draft</option>
            <option value="In Production">In Production</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="submit" className="bg-[#1B2430] text-white px-4 py-2 rounded-xl cursor-pointer">Save Status</button>
          <button type="button" onClick={() => setEditingPI(null)} className="bg-gray-200 px-3 py-2 rounded-xl cursor-pointer">Cancel</button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E4DFD3] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E4DFD3] text-[#7A7568]">
              <th className="p-3 font-semibold">PI Reference</th>
              <th className="p-3 font-semibold">Supplier</th>
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Items & Qty</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DFD3]">
            {proformaInvoices.map(pi => {
              const sup = suppliers.find(s => s.id === pi.supplierId || s.name === pi.supplierId);
              return (
                <tr key={pi.id} className="hover:bg-[#FAF8F5]">
                  <td className="p-3 font-bold text-[#1B2430]">{pi.id}</td>
                  <td className="p-3 text-[#1B2430]">{sup ? sup.name : pi.supplierId}</td>
                  <td className="p-3 text-[#7A7568]">{pi.date}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-medium">
                      {pi.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {(pi.items || []).map((it, idx) => {
                      const itm = items.find(i => i.id === it.itemId);
                      return <div key={idx} className="text-[11px] text-[#7A7568]">{itm ? itm.name : it.itemId}: <strong>{it.qty}</strong></div>;
                    })}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => { setEditingPI(pi); setStatus(pi.status); }} className="px-2.5 py-1 bg-white border rounded-lg font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(pi.id)} className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
