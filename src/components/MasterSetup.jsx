import React, { useState } from 'react';

export function MasterSetup({ items, setItems, suppliers, setSuppliers, branches }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Cosmetics');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [moq, setMoq] = useState(1000);
  const [allowed, setAllowed] = useState(branches.map(b => b.id));

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName) return;
    const newItem = {
      id: `ITM-00${items.length + 1}`,
      name: itemName,
      category,
      unit: 'Pcs',
      supplier,
      moq: Number(moq),
      allowedBranches: allowed
    };
    setItems(prev => [...prev, newItem]);
    setItemName('');
    alert("New item successfully registered in Item Master!");
  };

  const toggleBranchAccess = (branchId) => {
    setAllowed(prev => prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Master Setup & Item Catalog</h2>
        <p className="text-xs text-[#7A7568]">Register new cosmetic items, assign suppliers, set MOQs, and configure branch visibility restrictions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Add New Item</h3>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Item Name</label>
            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Matte Lipstick" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Category</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Supplier</label>
            <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
              {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Minimum Order Qty (MOQ)</label>
            <input type="number" value={moq} onChange={e => setMoq(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-2">Branch Visibility Permissions</label>
            <div className="space-y-1.5">
              {branches.map(b => (
                <label key={b.id} className="flex items-center gap-2 text-xs text-[#1B2430] cursor-pointer">
                  <input type="checkbox" checked={allowed.includes(b.id)} onChange={() => toggleBranchAccess(b.id)} />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer">
            Register Item
          </button>
        </form>

        {/* Item Master Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Registered Item Master Catalog</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Item Name</th>
                  <th className="pb-3 font-semibold">Supplier</th>
                  <th className="pb-3 font-semibold text-right">MOQ</th>
                  <th className="pb-3 font-semibold">Visible Branches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD3]">
                {items.map(i => (
                  <tr key={i.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#1B2430]">{i.id}</td>
                    <td className="py-3 text-[#1B2430] font-medium">{i.name}</td>
                    <td className="py-3 text-[#7A7568]">{i.supplier}</td>
                    <td className="py-3 text-right font-medium">{i.moq}</td>
                    <td className="py-3 text-xs text-gray-500">{(i.allowedBranches || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
