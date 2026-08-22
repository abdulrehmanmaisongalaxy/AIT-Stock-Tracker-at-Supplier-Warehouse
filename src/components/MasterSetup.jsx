import React, { useState } from 'react';

export default function MasterSetup({ items, setItems, suppliers, setSuppliers }) {
  const [subTab, setSubTab] = useState('items');
  const [itemForm, setItemForm] = useState({ code: '', name: '', packSize: '', weight: '', cbm: '', supplier: '', country: '', price: '', currency: 'USD', moq: '', stock: 0 });
  const [supplierForm, setSupplierForm] = useState({ code: '', name: '', warehouseNo: '', country: '', currency: 'USD' });
  const [editingItemCode, setEditingItemCode] = useState(null);
  const [editingSupplierCode, setEditingSupplierCode] = useState(null);

  // Item Handlers
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (editingItemCode) {
      setItems(items.map(i => i.code === editingItemCode ? itemForm : i));
      setEditingItemCode(null);
    } else {
      setItems([...items, itemForm]);
    }
    setItemForm({ code: '', name: '', packSize: '', weight: '', cbm: '', supplier: '', country: '', price: '', currency: 'USD', moq: '', stock: 0 });
  };

  const handleEditItem = (item) => {
    setItemForm(item);
    setEditingItemCode(item.code);
  };

  const handleDeleteItem = (code) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(i => i.code !== code));
    }
  };

  // Supplier Handlers
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (editingSupplierCode) {
      setSuppliers(suppliers.map(s => s.code === editingSupplierCode ? supplierForm : s));
      setEditingSupplierCode(null);
    } else {
      setSuppliers([...suppliers, supplierForm]);
    }
    setSupplierForm({ code: '', name: '', warehouseNo: '', country: '', currency: 'USD' });
  };

  const handleEditSupplier = (sup) => {
    setSupplierForm(sup);
    setEditingSupplierCode(sup.code);
  };

  const handleDeleteSupplier = (code) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.code !== code));
    }
  };

  // CSV Templates download
  const downloadItemTemplate = () => {
    const headers = "code,name,packSize,weight,cbm,supplier,country,price,currency,moq,stock\n";
    const sample = "NAHB-060,Naomi Mouth Wash 70ml,48,4.4,0.0122,Global Chem,China,5,YUAN,5000,0\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'item_master_template.csv'; a.click();
  };

  const downloadSupplierTemplate = () => {
    const headers = "code,name,warehouseNo,country,currency\n";
    const sample = "SUP-001,Global Chem Supplier,WH-CN-01,China,YUAN\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'supplier_master_template.csv'; a.click();
  };

  const handleItemCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '').slice(1);
      const newItems = [...items];
      lines.forEach(line => {
        const cols = line.split(',').map(c => c.trim());
        if (cols.length >= 11) {
          newItems.push({
            code: cols[0], name: cols[1], packSize: Number(cols[2]), weight: Number(cols[3]),
            cbm: Number(cols[4]), supplier: cols[5], country: cols[6], price: Number(cols[7]),
            currency: cols[8], moq: Number(cols[9]), stock: Number(cols[10])
          });
        }
      });
      setItems(newItems);
      alert('Items imported successfully!');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Master Setup & Imports</h2>
          <p className="text-sm text-slate-400">Manage items, supplier warehouses, currencies, and CSV templates.</p>
        </div>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setSubTab('items')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${subTab === 'items' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Items Master</button>
          <button onClick={() => setSubTab('suppliers')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${subTab === 'suppliers' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Supplier Master</button>
        </div>
      </div>

      {subTab === 'items' && (
        <div className="space-y-6">
          <div className="flex gap-4 items-center bg-slate-800 p-4 rounded-xl border border-slate-700 flex-wrap">
            <button onClick={downloadItemTemplate} className="bg-slate-700 hover:bg-slate-600 text-sm px-4 py-2 rounded-lg font-medium text-white">Download CSV Template</button>
            <label className="bg-emerald-700 hover:bg-emerald-600 text-sm px-4 py-2 rounded-lg font-medium cursor-pointer text-white">
              Import Items CSV <input type="file" accept=".csv" onChange={handleItemCSVImport} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleSaveItem} className="bg-slate-800 p-5 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h3 className="md:col-span-4 font-bold text-emerald-400">{editingItemCode ? 'Edit Item' : 'Add New Item'}</h3>
            <input placeholder="Item Code" value={itemForm.code} onChange={e=>setItemForm({...itemForm, code: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Item Name" value={itemForm.name} onChange={e=>setItemForm({...itemForm, name: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input type="number" placeholder="Pack Size" value={itemForm.packSize} onChange={e=>setItemForm({...itemForm, packSize: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input type="number" step="0.01" placeholder="Weight / CTN" value={itemForm.weight} onChange={e=>setItemForm({...itemForm, weight: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input type="number" step="0.0001" placeholder="CBM / CTN" value={itemForm.cbm} onChange={e=>setItemForm({...itemForm, cbm: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <select value={itemForm.supplier} onChange={e=>setItemForm({...itemForm, supplier: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>
            <input placeholder="Country" value={itemForm.country} onChange={e=>setItemForm({...itemForm, country: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input type="number" step="0.01" placeholder="Unit Price (LCY)" value={itemForm.price} onChange={e=>setItemForm({...itemForm, price: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Currency (e.g. YUAN, INR, USD)" value={itemForm.currency} onChange={e=>setItemForm({...itemForm, currency: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input type="number" placeholder="MOQ Quantity" value={itemForm.moq} onChange={e=>setItemForm({...itemForm, moq: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <button type="submit" className="md:col-span-4 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-lg font-semibold text-sm text-white">{editingItemCode ? 'Update Item' : 'Save Item'}</button>
          </form>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                  <th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Pack Size</th><th className="p-3">Supplier</th><th className="p-3">Country</th><th className="p-3">Price (LCY)</th><th className="p-3">MOQ</th><th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.code} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-white">{item.code}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.packSize}</td>
                    <td className="p-3">{item.supplier}</td>
                    <td className="p-3">{item.country}</td>
                    <td className="p-3">{item.price} {item.currency}</td>
                    <td className="p-3">{item.moq}</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => handleEditItem(item)} className="text-amber-400 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteItem(item.code)} className="text-rose-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex gap-4 items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
            <button onClick={downloadSupplierTemplate} className="bg-slate-700 hover:bg-slate-600 text-sm px-4 py-2 rounded-lg font-medium text-white">Download Supplier Template</button>
          </div>

          <form onSubmit={handleSaveSupplier} className="bg-slate-800 p-5 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4">
            <h3 className="md:col-span-5 font-bold text-emerald-400">{editingSupplierCode ? 'Edit Supplier' : 'Add New Supplier'}</h3>
            <input placeholder="Supplier Code" value={supplierForm.code} onChange={e=>setSupplierForm({...supplierForm, code: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Supplier Name" value={supplierForm.name} onChange={e=>setSupplierForm({...supplierForm, name: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Warehouse Number" value={supplierForm.warehouseNo} onChange={e=>setSupplierForm({...supplierForm, warehouseNo: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Country" value={supplierForm.country} onChange={e=>setSupplierForm({...supplierForm, country: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <input placeholder="Local Currency (e.g. YUAN, INR)" value={supplierForm.currency} onChange={e=>setSupplierForm({...supplierForm, currency: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-slate-100" required />
            <button type="submit" className="md:col-span-5 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-lg font-semibold text-sm text-white">{editingSupplierCode ? 'Update Supplier' : 'Save Supplier'}</button>
          </form>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                  <th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Warehouse No</th><th className="p-3">Country</th><th className="p-3">Currency</th><th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.code} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-white">{sup.code}</td>
                    <td className="p-3">{sup.name}</td>
                    <td className="p-3">{sup.warehouseNo}</td>
                    <td className="p-3">{sup.country}</td>
                    <td className="p-3">{sup.currency}</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => handleEditSupplier(sup)} className="text-amber-400 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteSupplier(sup.code)} className="text-rose-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
