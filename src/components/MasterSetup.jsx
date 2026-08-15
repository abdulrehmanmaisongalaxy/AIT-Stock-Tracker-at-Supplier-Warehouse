import React, { useState } from 'react';

export function MasterSetup({ items, setItems, suppliers, setSuppliers }) {
  const [activeTab, setActiveTab] = useState('items');
  const [searchTerm, setSearchTerm] = useState('');

  const [itemForm, setItemForm] = useState({ id: '', name: '', category: '', unit: 'Pcs', supplier: '', moq: 500, packSize: '', weightKg: 1, cbm: 0.01 });
  const [editingItemId, setEditingItemId] = useState(null);

  const [supplierForm, setSupplierForm] = useState({ id: '', name: '', country: '', warehouse: '', contact: '' });
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  // CSV Template & Importer
  const downloadCsvTemplate = (type) => {
    let headers = type === 'items' ? 'id,name,category,unit,supplier,moq,packSize,weightKg,cbm\n' : 'id,name,country,warehouse,contact\n';
    let sample = type === 'items' ? 'ITM-101,Organic Honey,Grocery,Pcs,Global Trading,500,12 Pcs/CTN,5,0.02\n' : 'SUP-01,Global Trading FZE,UAE,Jebel Ali,Mr. Ahmed\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      const rows = lines.slice(1).map(line => line.split(','));

      if (type === 'items') {
        const newItems = rows.map(r => ({
          id: r[0]?.trim() || `ITM-${Math.floor(100+Math.random()*900)}`,
          name: r[1]?.trim() || '',
          category: r[2]?.trim() || '',
          unit: r[3]?.trim() || 'Pcs',
          supplier: r[4]?.trim() || '',
          moq: Number(r[5]) || 500,
          packSize: r[6]?.trim() || '',
          weightKg: Number(r[7]) || 1,
          cbm: Number(r[8]) || 0.01
        }));
        setItems([...items, ...newItems]);
        alert(`Successfully imported ${newItems.length} items!`);
      } else {
        const newSups = rows.map(r => ({
          id: r[0]?.trim() || `SUP-${Math.floor(100+Math.random()*900)}`,
          name: r[1]?.trim() || '',
          country: r[2]?.trim() || '',
          warehouse: r[3]?.trim() || '',
          contact: r[4]?.trim() || ''
        }));
        setSuppliers([...suppliers, ...newSups]);
        alert(`Successfully imported ${newSups.length} suppliers!`);
      }
    };
    reader.readAsText(file);
  };

  // Item Submit & Actions
  const handleItemSubmit = (e) => {
    e.preventDefault();
    if (editingItemId) {
      setItems(items.map(i => i.id === editingItemId ? { ...itemForm } : i));
      setEditingItemId(null);
    } else {
      setItems([...items, { ...itemForm, id: itemForm.id || `ITM-${Math.floor(100+Math.random()*900)}` }]);
    }
    setItemForm({ id: '', name: '', category: '', unit: 'Pcs', supplier: '', moq: 500, packSize: '', weightKg: 1, cbm: 0.01 });
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Delete this item?')) setItems(items.filter(i => i.id !== id));
  };

  // Supplier Submit & Actions
  const handleSupplierSubmit = (e) => {
    e.preventDefault();
    if (editingSupplierId) {
      setSuppliers(suppliers.map(s => s.id === editingSupplierId ? { ...supplierForm } : s));
      setEditingSupplierId(null);
    } else {
      setSuppliers([...suppliers, { ...supplierForm, id: supplierForm.id || `SUP-${Math.floor(100+Math.random()*900)}` }]);
    }
    setSupplierForm({ id: '', name: '', country: '', warehouse: '', contact: '' });
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm('Delete this supplier?')) setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm gap-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${activeTab === 'items' ? 'bg-[#1B2430] text-white' : 'bg-gray-100 text-[#7A7568]'}`}>
            Manage Master Items ({items.length})
          </button>
          <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${activeTab === 'suppliers' ? 'bg-[#1B2430] text-white' : 'bg-gray-100 text-[#7A7568]'}`}>
            Manage Suppliers ({suppliers.length})
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => downloadCsvTemplate(activeTab)} className="text-xs bg-gray-100 text-[#1B2430] border border-[#E4DFD3] px-3 py-2 rounded-xl font-medium cursor-pointer">
            Download CSV Template
          </button>
          <label className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium cursor-pointer shadow-sm hover:bg-emerald-700">
            Upload & Import CSV
            <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, activeTab)} className="hidden" />
          </label>
        </div>
      </div>

      {activeTab === 'items' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm h-fit">
            <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">{editingItemId ? 'Edit Master Item' : 'Add New Master Item'}</h2>
            <form onSubmit={handleItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#7A7568] mb-1">Item ID</label>
                <input type="text" placeholder="ITM-101" value={itemForm.id} onChange={e => setItemForm({...itemForm, id: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div>
                <label className="block text-[#7A7568] mb-1">Item Name</label>
                <input type="text" required placeholder="Product Description" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7A7568] mb-1">Category</label>
                  <input type="text" placeholder="Cosmetics" value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
                <div>
                  <label className="block text-[#7A7568] mb-1">Unit</label>
                  <input type="text" placeholder="Pcs" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-[#7A7568] mb-1">Supplier</label>
                <select value={itemForm.supplier} onChange={e => setItemForm({...itemForm, supplier: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl bg-white">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#7A7568] mb-1">MOQ</label>
                  <input type="number" required value={itemForm.moq} onChange={e => setItemForm({...itemForm, moq: Number(e.target.value)})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
                <div>
                  <label className="block text-[#7A7568] mb-1">Weight (Kg)</label>
                  <input type="number" step="0.1" value={itemForm.weightKg} onChange={e => setItemForm({...itemForm, weightKg: Number(e.target.value)})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
                <div>
                  <label className="block text-[#7A7568] mb-1">CBM</label>
                  <input type="number" step="0.001" value={itemForm.cbm} onChange={e => setItemForm({...itemForm, cbm: Number(e.target.value)})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-[#7A7568] mb-1">Pack Size</label>
                <input type="text" placeholder="24 Pcs/CTN" value={itemForm.packSize} onChange={e => setItemForm({...itemForm, packSize: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1B2430] text-white py-2.5 rounded-xl font-semibold cursor-pointer">{editingItemId ? 'Update Item' : 'Save Item'}</button>
                {editingItemId && <button type="button" onClick={() => { setEditingItemId(null); setItemForm({ id: '', name: '', category: '', unit: 'Pcs', supplier: '', moq: 500, packSize: '', weightKg: 1, cbm: 0.01 }); }} className="bg-gray-200 px-3 py-2.5 rounded-xl">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Item Master Registry</h2>
              <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border border-[#E4DFD3] rounded-xl text-xs w-64" />
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
                  <tr>
                    <th className="p-2.5">ID / Name</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5">MOQ</th>
                    <th className="p-2.5">Wt / CBM</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DFD3]">
                  {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2.5">
                        <div className="font-semibold text-[#1B2430]">{item.name}</div>
                        <div className="text-[10px] text-[#7A7568]">{item.id} • {item.category}</div>
                      </td>
                      <td className="p-2.5 text-[#7A7568]">{item.supplier}</td>
                      <td className="p-2.5 font-medium">{item.moq} {item.unit}</td>
                      <td className="p-2.5 text-[11px] text-[#7A7568]">{item.weightKg} kg / {item.cbm} cbm</td>
                      <td className="p-2.5 text-right space-x-2">
                        <button onClick={() => { setItemForm(item); setEditingItemId(item.id); }} className="text-indigo-600 font-semibold cursor-pointer">Edit</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-rose-600 font-semibold cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-400">No items found. Add manually or import via CSV.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm h-fit">
            <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">{editingSupplierId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <form onSubmit={handleSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#7A7568] mb-1">Supplier ID</label>
                <input type="text" placeholder="SUP-01" value={supplierForm.id} onChange={e => setSupplierForm({...supplierForm, id: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div>
                <label className="block text-[#7A7568] mb-1">Supplier Name</label>
                <input type="text" required placeholder="Company Name" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7A7568] mb-1">Country</label>
                  <input type="text" placeholder="UAE" value={supplierForm.country} onChange={e => setSupplierForm({...supplierForm, country: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
                <div>
                  <label className="block text-[#7A7568] mb-1">Warehouse Hub</label>
                  <input type="text" placeholder="Jebel Ali" value={supplierForm.warehouse} onChange={e => setSupplierForm({...supplierForm, warehouse: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-[#7A7568] mb-1">Contact Person</label>
                <input type="text" placeholder="Mr. Ahmed" value={supplierForm.contact} onChange={e => setSupplierForm({...supplierForm, contact: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1B2430] text-white py-2.5 rounded-xl font-semibold cursor-pointer">{editingSupplierId ? 'Update Supplier' : 'Save Supplier'}</button>
                {editingSupplierId && <button type="button" onClick={() => { setEditingSupplierId(null); setSupplierForm({ id: '', name: '', country: '', warehouse: '', contact: '' }); }} className="bg-gray-200 px-3 py-2.5 rounded-xl">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
            <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">Supplier Registry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
                  <tr>
                    <th className="p-2.5">Supplier ID & Name</th>
                    <th className="p-2.5">Country / Hub</th>
                    <th className="p-2.5">Contact</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DFD3]">
                  {suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-gray-50">
                      <td className="p-2.5">
                        <div className="font-semibold text-[#1B2430]">{sup.name}</div>
                        <div className="text-[10px] text-[#7A7568]">{sup.id}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="text-[#1B2430]">{sup.country}</div>
                        <div className="text-[10px] text-[#7A7568]">{sup.warehouse}</div>
                      </td>
                      <td className="p-2.5 text-[#7A7568]">{sup.contact}</td>
                      <td className="p-2.5 text-right space-x-2">
                        <button onClick={() => { setSupplierForm(sup); setEditingSupplierId(sup.id); }} className="text-indigo-600 font-semibold cursor-pointer">Edit</button>
                        <button onClick={() => handleDeleteSupplier(sup.id)} className="text-rose-600 font-semibold cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-400">No suppliers found. Add manually or import via CSV.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
