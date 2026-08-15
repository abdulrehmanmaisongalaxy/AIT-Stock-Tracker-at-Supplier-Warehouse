import React, { useState } from 'react';

export function Shipments({ shipments, setShipments, branches, items, suppliers }) {
  const [containerNo, setContainerNo] = useState('CBMU-' + Math.floor(1000000 + Math.random() * 9000000));
  const [branchId, setBranchId] = useState(branches[0]?.id || 'Branch-A');
  const [selectedItem, setSelectedItem] = useState(items[0]?.id || '');
  const [qty, setQty] = useState(500);
  const [shipItems, setShipItems] = useState([]);

  const handleAddItem = () => {
    if (!selectedItem || qty <= 0) return;
    setShipItems(prev => [...prev, { itemId: selectedItem, qty: Number(qty) }]);
    setQty(500);
  };

  const handleCreateShipment = (e) => {
    e.preventDefault();
    if (shipItems.length === 0) {
      alert("Please add at least one item to the container shipment.");
      return;
    }
    const newShipment = {
      id: `SHP-${Math.floor(900 + Math.random() * 90)}`,
      branchId,
      containerNo,
      date: new Date().toISOString().split('T')[0],
      items: shipItems
    };
    setShipments(prev => [newShipment, ...prev]);
    setShipItems([]);
    setContainerNo('CBMU-' + Math.floor(1000000 + Math.random() * 9000000));
    alert("Container shipment successfully created and stock ledger updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Container Shipments & Packing Lists</h2>
        <p className="text-xs text-[#7A7568]">Manage direct shipments from supplier warehouses to African branches and generate packing lists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Shipment Form */}
        <form onSubmit={handleCreateShipment} className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">New Container Loading Dispatch</h3>

          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Container Number</label>
            <input
              type="text"
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs text-[#1B2430]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Destination Branch / Client</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs text-[#1B2430]"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.country})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Select Item</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs text-[#1B2430]"
              >
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Quantity</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs text-[#1B2430]"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-[#1B2430] text-white px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Added Items Preview */}
          <div className="border border-[#E4DFD3] rounded-xl p-3 bg-[#FAF8F5]">
            <h4 className="text-[11px] font-bold uppercase text-[#7A7568] mb-2">Container Manifest Items</h4>
            {shipItems.length === 0 ? (
              <p className="text-xs text-gray-400">No items added to container yet.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {shipItems.map((si, idx) => (
                  <li key={idx} className="flex justify-between text-[#1B2430]">
                    <span>{items.find(i => i.id === si.itemId)?.name}</span>
                    <span className="font-bold">{si.qty} units</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Dispatch Container & Generate Packing List
          </button>
        </form>

        {/* Existing Shipments List */}
        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Dispatched Shipments</h3>
          <div className="space-y-3">
            {shipments.map(shp => {
              const b = branches.find(br => br.id === shp.branchId);
              return (
                <div key={shp.id} className="p-4 border border-[#E4DFD3] rounded-xl space-y-2 bg-[#FAF8F5]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#1B2430]">{shp.id} • {shp.containerNo}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">Dispatched</span>
                  </div>
                  <div className="text-xs text-[#7A7568]">Destination: {b ? b.name : shp.branchId}</div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => alert(`Generating Excel Packing List for ${shp.containerNo}...`)}
                      className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer"
                    >
                      Export Excel
                    </button>
                    <button
                      onClick={() => alert(`Generating PDF Packing List for ${shp.containerNo}...`)}
                      className="bg-white border border-[#E4DFD3] text-[#1B2430] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer"
                    >
                      Export PDF
                    </button>
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
