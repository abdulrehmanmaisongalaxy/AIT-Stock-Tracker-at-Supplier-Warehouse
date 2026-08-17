import React from 'react';

export default function MasterSetupTab({ items, newItem, setNewItem, handleAddItem, handleDeleteItem, suppliers }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-md font-bold mb-4">ADD NEW MASTER ITEM</h2>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Item ID</label>
            <input type="text" value={newItem.id} onChange={e => setNewItem({...newItem, id: e.target.value})} placeholder="ITM-101" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Item Name</label>
            <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Product Description" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Category</label>
            <input type="text" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} placeholder="Cosmetics" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Supplier</label>
            <select value={newItem.supplier} onChange={e => setNewItem({...newItem, supplier: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">MOQ</label>
              <input type="number" value={newItem.moq} onChange={e => setNewItem({...newItem, moq: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Weight (Kg)</label>
              <input type="number" step="0.1" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">CBM</label>
              <input type="number" step="0.0001" value={newItem.cbm} onChange={e => setNewItem({...newItem, cbm: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Pack Size</label>
              <input type="text" value={newItem.packSize} onChange={e => setNewItem({...newItem, packSize: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-sm transition-colors shadow">Add Item</button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-md font-bold mb-4">ITEM MASTER REGISTRY ({items.length})</h2>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 bg-gray-900/40">
                <th className="p-3">ID / Name</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">MOQ</th>
                <th className="p-3">Wt / CBM</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700/60 hover:bg-gray-700/20">
                  <td className="p-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.id} • {item.category}</div>
                  </td>
                  <td className="p-3 text-gray-300">{item.supplier}</td>
                  <td className="p-3 text-gray-300">{item.moq} PCS</td>
                  <td className="p-3 text-gray-400 text-xs">{item.weight} kg / {item.cbm} cbm</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
