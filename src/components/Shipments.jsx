import React, { useState } from 'react';

export function Shipments({ shipments, setShipments, branches, items, suppliers, proformaInvoices }) {
  const [selectedCountry, setSelectedCountry] = useState('China');
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [containerNo, setContainerNo] = useState('CBMU-' + Math.floor(1000000 + Math.random() * 9000000));
  const [branchId, setBranchId] = useState(branches[0]?.id || 'Branch-A');
  const [shipItems, setShipItems] = useState({});

  // Filter suppliers by selected country
  const filteredSuppliers = suppliers.filter(s => s.country === selectedCountry);
  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || filteredSuppliers[0];

  // Filter items belonging to active supplier
  const supplierItems = items.filter(i => i.supplier === activeSupplier?.name);

  // Calculate available stock per item
  const getAvailableStock = (itemId) => {
    let ordered = 0;
    proformaInvoices.forEach(pi => {
      (pi.items || []).forEach(piItm => { if (piItm.itemId === itemId) ordered += Number(piItm.qty || 0); });
    });
    let shipped = 0;
    shipments.forEach(shp => {
      (shp.items || []).forEach(shpItm => { if (shpItm.itemId === itemId) shipped += Number(shpItm.qty || 0); });
    });
    return ordered - shipped;
  };

  const handleQtyChange = (itemId, val) => {
    setShipItems(prev => ({ ...prev, [itemId]: Number(val) }));
  };

  // Container Fill calculations
  let totalCbm = 0;
  let totalWeight = 0;
  Object.keys(shipItems).forEach(itemId => {
    const qty = shipItems[itemId];
    const itm = items.find(i => i.id === itemId);
    if (qty > 0 && itm) {
      totalCbm += qty * (itm.cbm || 0.04);
      totalWeight += qty * ((itm.weightKg || 12) / 100);
    }
  });

  const containerType = totalCbm > 30 ? '40FT Container' : '20FT Container';
  const maxCbm = totalCbm > 30 ? 58 : 28;
  const fillPct = Math.min(100, Math.round((totalCbm / maxCbm) * 100));

  const handleDispatchContainer = (e) => {
    e.preventDefault();
    const itemsList = Object.keys(shipItems)
      .filter(itemId => shipItems[itemId] > 0)
      .map(itemId => ({ itemId, qty: shipItems[itemId] }));

    if (itemsList.length === 0) {
      alert("Please add items to ship.");
      return;
    }

    const newShipment = {
      id: `SHP-${Math.floor(900 + Math.random() * 90)}`,
      branchId,
      containerNo,
      date: new Date().toISOString().split('T')[0],
      items: itemsList
    };

    setShipments(prev => [newShipment, ...prev]);
    setShipItems({});
    setContainerNo('CBMU-' + Math.floor(1000000 + Math.random() * 9000000));
    alert("Container successfully dispatched and stock ledger updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Container Shipments & Packing Lists</h2>
        <p className="text-xs text-[#7A7568]">Select origin country and supplier warehouse to ship available stock to African branches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleDispatchContainer} className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">New Container Dispatch Form</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Origin Country</label>
              <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                <option value="China">China</option>
                <option value="Thailand">Thailand</option>
                <option value="UAE">UAE (Dubai)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Supplier Warehouse</label>
              <select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                {filteredSuppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.warehouse})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Container Number</label>
              <input type="text" value={containerNo} onChange={e => setContainerNo(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Destination Branch</label>
              <select value={branchId} onChange={e => setBranchId(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs">
                {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.country})</option>)}
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7568] mt-4 mb-2">Available Stock Selection</h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="pb-2 font-semibold">Pack Size</th>
                  <th className="pb-2 font-semibold text-right">Available Stock</th>
                  <th className="pb-2 font-semibold text-right">Ship Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD3]">
                {supplierItems.map(i => {
                  const avail = getAvailableStock(i.id);
                  return (
                    <tr key={i.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-2.5 font-medium text-[#1B2430]">{i.name}</td>
                      <td className="py-2.5 text-[#7A7568]">{i.packSize || 'N/A'}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">{avail} {i.unit}</td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          placeholder="0"
                          max={avail}
                          value={shipItems[i.id] || ''}
                          onChange={e => handleQtyChange(i.id, e.target.value)}
                          className="w-24 bg-[#FAF8F5] border border-[#E4DFD3] rounded-lg px-2 py-1 text-xs text-right font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Container Fill Gauge */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E4DFD3] flex justify-between items-center text-xs">
            <span>Container Fill Status: <strong className="text-[#1B2430]">{totalCbm.toFixed(2)} CBM / {totalWeight.toFixed(1)} kg</strong></span>
            <span className="font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              {containerType} ({fillPct}% Full)
            </span>
          </div>

          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl cursor-pointer">
            Dispatch Container & Generate Packing List
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Dispatched Containers</h3>
          <div className="space-y-3">
            {shipments.map(shp => {
              const b = branches.find(br => br.id === shp.branchId);
              return (
                <div key={shp.id} className="p-3 border border-[#E4DFD3] rounded-xl space-y-1 bg-[#FAF8F5] text-xs">
                  <div className="font-bold text-[#1B2430]">{shp.containerNo}</div>
                  <div className="text-[#7A7568]">To: {b ? b.name : shp.branchId}</div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => alert("Downloading Excel Packing List...")} className="bg-white border px-2.5 py-1 rounded-md text-[11px] cursor-pointer">Excel</button>
                    <button onClick={() => alert("Downloading PDF Packing List...")} className="bg-white border px-2.5 py-1 rounded-md text-[11px] cursor-pointer">PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
