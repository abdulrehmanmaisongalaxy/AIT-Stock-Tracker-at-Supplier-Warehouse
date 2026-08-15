import React, { useState } from 'react';

export function MasterSetup({ items, setItems, suppliers, setSuppliers, branches }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Cosmetics');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [moq, setMoq] = useState(1000);
  const [packSize, setPackSize] = useState('24 Pcs/CTN');
  const [weightKg, setWeightKg] = useState(12);
  const [cbm, setCbm] = useState(0.045);
  
  // Supplier form state
  const [supName, setSupName] = useState('');
  const [supCountry, setSupCountry] = useState('China');
  const [supWarehouse, setSupWarehouse] = useState('');
  const [supContact, setSupContact] = useState('');

  // Editing states
  const [editingItem, setEditingItem] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName) return;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        name: itemName,
        category,
        supplier,
        moq: Number(moq),
        packSize,
        weightKg: Number(weightKg),
        cbm: Number(cbm)
      } : i));
      setEditingItem(null);
      alert("Item updated successfully!");
    } else {
      const newItem = {
        id: `ITM-00${items.length + 1}`,
        name: itemName,
        category,
        unit: 'Pcs',
        supplier,
        moq: Number(moq),
        packSize,
        weightKg: Number(weightKg),
        cbm: Number(cbm),
        allowedBranches: branches.map(b => b.id)
      };
      setItems(prev => [...prev, newItem]);
      alert("Item successfully registered!");
    }

    setItemName('');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setCategory(item.category);
    setSupplier(item.supplier);
    setMoq(item.moq);
    setPackSize(item.packSize);
    setWeightKg(item.weightKg);
    setWeightKg(item.weightKg || 12);
    setCbm(item.cbm || 0.04);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!supName) return;

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? {
        ...s,
        name: supName,
        country: supCountry,
        warehouse: supWarehouse,
        contact: supContact
      } : s));
      setEditingSupplier(null);
      alert("Supplier updated successfully!");
    } else {
      const newSup = {
        id: `SUP-0${suppliers.length + 1}`,
        name: supName,
        country: supCountry,
        warehouse: supWarehouse || 'Main Hub',
        contact: supContact || 'Admin'
      };
      setSuppliers(prev => [...prev, newSup]);
      alert("Supplier added successfully!");
    }

    setSupName('');
    setSupWarehouse('');
    setSupContact('');
  };

  const handleEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupCountry(sup.country);
    setSupWarehouse(sup.warehouse);
    setSupContact(sup.contact);
  };

  const handleDeleteSupplier = (id) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Master Setup, Suppliers & Items</h2>
        <p className="text-xs text-[#7A7568]">Register, edit, or delete items and supplier profiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Form & Table */}
        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-6">
          <form onSubmit={handleAddItem} className="space-y-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2430]">
              {editingItem ? `Edit Item (${editingItem.id})` : 'Add New Item'}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Item Name</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Glowing Foundation" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Supplier</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Pack Size</label>
                <input type="text" value={packSize} onChange={e => setPackSize(e.target.value)} placeholder="24 Pcs/CTN" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">MOQ</label>
                <input type="number" value={moq} onChange={e => setMoq(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Weight (kg)</label>
                <input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">CBM (m³)</label>
                <input type="number" step="0.001" value={cbm} onChange={e => setCbm(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2 rounded-xl cursor-pointer">
                {editingItem ? 'Update Item' : 'Register Item'}
              </button>
              {editingItem && (
                <button type="button" onClick={() => { setEditingItem(null); setItemName(''); }} className="bg-gray-200 text-[#1B2430] px-3 py-2 rounded-xl text-xs cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Master Items List</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {items.map(i => (
                <div key={i.id} className="p-3 bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#1B2430]">{i.id}</span> - {i.name} <br/>
                    <span className="text-[#7A7568]">{i.supplier} | {i.packSize}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditItem(i)} className="px-2 py-1 bg-white border rounded text-[11px] font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteItem(i.id)} className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-medium cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Form & Table */}
        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-6">
          <form onSubmit={handleAddSupplier} className="space-y-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2430]">
              {editingSupplier ? `Edit Supplier (${editingSupplier.id})` : 'Add New Supplier'}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Supplier Name</label>
              <input type="text" value={supName} onChange={e => setSupName(e.target.value)} placeholder="e.g. Guangzhou Beauty Ltd" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Country</label>
                <select value={supCountry} onChange={e => setSupCountry(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Warehouse Name</label>
                <input type="text" value={supWarehouse} onChange={e => setSupWarehouse(e.target.value)} placeholder="Whse #1" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Contact Person</label>
              <input type="text" value={supContact} onChange={e => setSupContact(e.target.value)} placeholder="Mr. Chen" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2 rounded-xl cursor-pointer">
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </button>
              {editingSupplier && (
                <button type="button" onClick={() => { setEditingSupplier(null); setSupName(''); }} className="bg-gray-200 text-[#1B2430] px-3 py-2 rounded-xl text-xs cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Suppliers List</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {suppliers.map(s => (
                <div key={s.id} className="p-3 bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#1B2430]">{s.name}</span> ({s.country})<br/>
                    <span className="text-[#7A7568]">{s.warehouse} • Contact: {s.contact}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditSupplier(s)} className="px-2 py-1 bg-white border rounded text-[11px] font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteSupplier(s.id)} className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-medium cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
