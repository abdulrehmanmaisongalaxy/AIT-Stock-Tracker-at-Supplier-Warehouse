import React, { useState } from 'react';

export function MasterSetup({ items, setItems, suppliers, setSuppliers, branches }) {
  // Dynamic Country Master List
  const [countries, setCountries] = useState(['China', 'Thailand', 'UAE', 'Vietnam', 'India']);
  const [newCountry, setNewCountry] = useState('');

  // Item Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Cosmetics');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [moq, setMoq] = useState(1000);
  const [packSize, setPackSize] = useState('24 Pcs/CTN');
  const [weightKg, setWeightKg] = useState(12);
  const [cbm, setCbm] = useState(0.045);
  const [editingItem, setEditingItem] = useState(null);

  // Supplier Form State
  const [supName, setSupName] = useState('');
  const [supCountry, setSupCountry] = useState(countries[0] || 'China');
  const [supWarehouse, setSupWarehouse] = useState('');
  const [supContact, setSupContact] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Download CSV Templates
  const downloadTemplate = (type) => {
    let csvContent = "";
    let fileName = "";
    
    if (type === 'items') {
      csvContent = "Item Code,Item Name,Category,Supplier Name,MOQ,Pack Size,Weight,CBM\nITM-101,Example Product,General,Example Supplier,1000,24 Pcs/CTN,10.5,0.04";
      fileName = "item_import_template.csv";
    } else {
      csvContent = "Supplier Name,Country,Warehouse Location,Contact Person\nExample Supplier,Vietnam,Ho Chi Minh Hub,Mr. Nguyen";
      fileName = "supplier_import_template.csv";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Item Submit (Create or Update)
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
    setWeightKg(item.weightKg || 12);
    setCbm(item.cbm || 0.04);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Handle Supplier Submit (Create or Update)
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

  // CSV File Parsers
  const handleItemFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const newItems = [...items];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 6) {
            newItems.push({
              id: cols[0].trim() || `ITM-00${newItems.length + 1}`,
              name: cols[1].trim(),
              category: cols[2].trim() || 'General',
              unit: 'Pcs',
              supplier: cols[3].trim() || (suppliers[0]?.name ?? ''),
              moq: Number(cols[4]) || 1000,
              packSize: cols[5].trim() || '24 Pcs/CTN',
              weightKg: Number(cols[6]) || 12,
              cbm: Number(cols[7]) || 0.04,
              allowedBranches: branches.map(b => b.id)
            });
          }
        }
        setItems(newItems);
        alert("Batch items imported successfully!");
      } catch (err) {
        alert("Error parsing item file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSupplierFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const newSuppliers = [...suppliers];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 4) {
            newSuppliers.push({
              id: `SUP-0${newSuppliers.length + 1}`,
              name: cols[0].trim(),
              country: cols[1].trim(),
              warehouse: cols[2].trim() || 'Hub',
              contact: cols[3].trim() || 'N/A'
            });
          }
        }
        setSuppliers(newSuppliers);
        alert("Batch suppliers imported successfully!");
      } catch (err) {
        alert("Error parsing supplier file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1B2430]">Master Setup, Countries & Imports</h2>
          <p className="text-xs text-[#7A7568]">Manage supplier countries, register items/suppliers manually, or upload via CSV templates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadTemplate('items')} className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer">
            📥 Download Item Template
          </button>
          <label className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer">
            📂 Import Items CSV
            <input type="file" accept=".csv" onChange={handleItemFileUpload} className="hidden" />
          </label>
          <button onClick={() => downloadTemplate('suppliers')} className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer">
            📥 Download Supplier Template
          </button>
          <label className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer">
            📂 Import Suppliers CSV
            <input type="file" accept=".csv" onChange={handleSupplierFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Country Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Manage Supplier Countries</h3>
        <div className="flex gap-2 max-w-md">
          <input 
            type="text" 
            value={newCountry} 
            onChange={e => setNewCountry(e.target.value)} 
            placeholder="Enter new country (e.g. Vietnam, India)..." 
            className="flex-1 bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" 
          />
          <button 
            type="button" 
            onClick={() => { if(newCountry) { setCountries([...countries, newCountry]); setNewCountry(''); } }} 
            className="bg-[#1B2430] text-white px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
          >
            Add Country
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {countries.map(c => (
            <span key={c} className="bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E4DFD3] text-xs font-medium flex items-center gap-2">
              {c}
              <button onClick={() => setCountries(countries.filter(item => item !== c))} className="text-rose-500 hover:font-bold">×</button>
            </span>
          ))}
        </div>
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
              <input type="text" value={supName} onChange={e => setSupName(e.target.value)} placeholder="e.g. Saigon Manufacturing Ltd" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Country</label>
                <select value={supCountry} onChange={e => setSupCountry(e.target.value)} className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7A7568] mb-1">Warehouse Location</label>
                <input type="text" value={supWarehouse} onChange={e => setSupWarehouse(e.target.value)} placeholder="Hub #1" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Contact Person</label>
              <input type="text" value={supContact} onChange={e => setSupContact(e.target.value)} placeholder="Mr. Nguyen" className="w-full bg-white border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
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
