import React, { useState } from 'react';

export function MasterSetup({ items, setItems, suppliers, setSuppliers, branches }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Cosmetics');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [moq, setMoq] = useState(1000);
  const [packSize, setPackSize] = useState('24 Pcs/CTN');
  const [weightKg, setWeightKg] = useState(12);
  const [cbm, setCbm] = useState(0.045);
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
      packSize,
      weightKg: Number(weightKg),
      cbm: Number(cbm),
      allowedBranches: allowed
    };
    setItems(prev => [...prev, newItem]);
    setItemName('');
    alert("Item successfully registered!");
  };

  const handleFileUpload = (e) => {
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
              category: cols[2].trim() || 'Cosmetics',
              unit: 'Pcs',
              supplier: cols[3].trim() || suppliers[0].name,
              moq: Number(cols[4]) || 1000,
              packSize: cols[5].trim() || '24 Pcs/CTN',
              weightKg: Number(cols[6]) || 12,
              cbm: Number(cols[7]) || 0.04,
              allowedBranches: branches.map(b => b.id)
            });
          }
        }
        setItems(newItems);
        alert("Batch items imported successfully from file!");
      } catch (err) {
        alert("Error parsing file. Please ensure CSV format matches the template.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1B2430]">Master Setup, Suppliers & Import</h2>
          <p className="text-xs text-[#7A7568]">Register items with weight, CBM, pack sizes, and import via CSV/Excel templates.</p>
        </div>
        <div className="flex gap-2">
          <label className="bg-white border border-[#E4DFD3] text-[#1B2430] px-4 py-2 rounded-xl text-xs font-medium cursor-pointer hover:bg-gray-50 flex items-center gap-1.5">
            📥 Import Items (CSV)
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleAddItem} className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Add Single Item</h3>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Item Name</label>
            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Glowing Foundation" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Supplier</label>
            <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
              {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Pack Size</label>
              <input type="text" value={packSize} onChange={e => setPackSize(e.target.value)} placeholder="24 Pcs/CTN" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">MOQ</label>
              <input type="number" value={moq} onChange={e => setMoq(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">CBM (m³)</label>
              <input type="number" step="0.001" value={cbm} onChange={e => setCbm(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl cursor-pointer">
            Register Item
          </button>
        </form>

        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Master Catalog Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Item Name</th>
                  <th className="pb-3 font-semibold">Supplier</th>
                  <th className="pb-3 font-semibold">Pack Size</th>
                  <th className="pb-3 font-semibold text-right">MOQ</th>
                  <th className="pb-3 font-semibold text-right">Weight / CBM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD3]">
                {items.map(i => (
                  <tr key={i.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#1B2430]">{i.id}</td>
                    <td className="py-3 text-[#1B2430] font-medium">{i.name}</td>
                    <td className="py-3 text-[#7A7568]">{i.supplier}</td>
                    <td className="py-3 text-[#7A7568]">{i.packSize || 'N/A'}</td>
                    <td className="py-3 text-right font-medium">{i.moq}</td>
                    <td className="py-3 text-right text-gray-500">{i.weightKg || 10}kg | {i.cbm || 0.04}m³</td>
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
