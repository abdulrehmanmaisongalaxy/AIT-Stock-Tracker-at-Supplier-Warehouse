import React, { useState } from 'react';

export default function BranchPortal({ branchName, inventoryItems, onSubmittingOrder }) {
  const [orderQty, setOrderQty] = useState({});

  const handleQtyChange = (id, val) => {
    setOrderQty({ ...orderQty, [id]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemsOrdered = Object.keys(orderQty)
      .filter((id) => Number(orderQty[id]) > 0)
      .map((id) => ({
        itemId: id,
        qty: Number(orderQty[id])
      }));

    if (itemsOrdered.length === 0) return alert('Please enter quantities to order.');

    const newReq = {
      id: Date.now(),
      branch: branchName,
      date: new Date().toLocaleDateString(),
      items: itemsOrdered
    };

    onSubmittingOrder(newReq);
    alert('Requisition submitted successfully to Admin!');
    setOrderQty({});
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-cyan-400">Branch Requisition Portal</h2>
          <p className="text-xs text-slate-400">Ordering on behalf of: <span className="text-slate-200 font-medium">{branchName}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                <th className="p-3">SKU</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Available Stock</th>
                <th className="p-3">Order Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-slate-500">No items available for requisition.</td></tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50">
                    <td className="p-3 font-mono text-cyan-400">{item.sku}</td>
                    <td className="p-3 text-slate-200">{item.name}</td>
                    <td className="p-3 text-slate-300">{item.stock}</td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        min="0"
                        value={orderQty[item.id] || ''}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-sm text-slate-200 w-28 focus:outline-none focus:border-cyan-500" 
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded text-sm font-medium">
            Submit Requisition
          </button>
        </div>
      </form>
    </div>
  );
}
