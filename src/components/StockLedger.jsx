import React, { useState } from 'react';

export default function StockLedger({ items, setItems }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !sku) return;
    const newItem = { id: Date.now(), name, sku, stock: Number(stock) || 0 };
    setItems([...items, newItem]);
    setName('');
    setSku('');
    setStock('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-200">Stock Ledger</h2>
      
      {/* Simple Form to Add Items */}
      <form onSubmit={handleAddItem} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Item Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200" placeholder="Item name..." />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">SKU</label>
          <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200" placeholder="SKU code..." />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Initial Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200" placeholder="0" />
        </div>
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-sm font-medium">Add Item</button>
      </form>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <th className="p-3">SKU</th>
              <th className="p-3">Item Name</th>
              <th className="p-3">Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-slate-500">No inventory items found. Add one above.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-3 font-mono text-cyan-400">{item.sku}</td>
                  <td className="p-3 text-slate-200">{item.name}</td>
                  <td className="p-3 text-slate-300">{item.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
