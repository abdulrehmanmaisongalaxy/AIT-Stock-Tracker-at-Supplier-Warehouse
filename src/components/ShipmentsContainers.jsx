import React, { useState, useEffect } from 'react';

export default function ShipmentsContainers({
  requisitions = [],
  branches = [],
  items = [],
  shipments = [],
  setShipments = () => {}
}) {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [shipmentRef, setShipmentRef] = useState('');
  const [containerType, setContainerType] = useState('40FT Container (~67 CBM)');
  const [selectedItemsToShip, setSelectedItemsToShip] = useState([]);

  // When branch changes, automatically preload items from that branch's requisitions
  useEffect(() => {
    if (!selectedBranch) {
      setSelectedItemsToShip([]);
      return;
    }

    const branchReqs = requisitions.filter(r => 
      (r.branchName && r.branchName.toLowerCase() === selectedBranch.toLowerCase()) ||
      (r.branch && r.branch.toLowerCase() === selectedBranch.toLowerCase())
    );

    const aggregated = {};
    branchReqs.forEach(req => {
      const lineItems = req.items || req.lineItems || [];
      lineItems.forEach(line => {
        const code = line.code || line.itemCode || line.sku;
        const name = line.name || line.itemName || code;
        const qty = Number(line.qty || line.quantity || line.requestedQty) || 0;
        
        if (code) {
          if (!aggregated[code]) {
            const masterItem = items.find(i => i.code?.toLowerCase() === code.toLowerCase());
            aggregated[code] = {
              code,
              name,
              qty: 0,
              cbm: Number(masterItem?.cbm || 0.01),
              weight: Number(masterItem?.weight || 1)
            };
          }
          aggregated[code].qty += qty;
        }
      });
    });

    setSelectedItemsToShip(Object.values(aggregated));
  }, [selectedBranch, requisitions, items]);

  const handleQtyChange = (code, val) => {
    setSelectedItemsToShip(prev => prev.map(item => 
      item.code === code ? { ...item, qty: Number(val) } : item
    ));
  };

  const removeItem = (code) => {
    setSelectedItemsToShip(prev => prev.filter(i => i.code !== code));
  };

  const totalCBM = selectedItemsToShip.reduce((acc, curr) => acc + (curr.qty * curr.cbm), 0);
  const totalWeight = selectedItemsToShip.reduce((acc, curr) => acc + (curr.qty * curr.weight), 0);
  
  const maxCBM = containerType.includes('20FT') ? 33 : 67;
  const fillPercentage = Math.min(100, (totalCBM / maxCBM) * 100).toFixed(1);

  const handleSaveShipment = (e) => {
    e.preventDefault();
    if (!shipmentRef) {
      alert('Please enter a Shipment Reference No.');
      return;
    }
    if (!selectedBranch) {
      alert('Please select a Destination Branch.');
      return;
    }
    if (selectedItemsToShip.length === 0) {
      alert('No items in this shipment container.');
      return;
    }

    const newShipment = {
      shipmentRef,
      branch: selectedBranch,
      containerType,
      totalCBM: totalCBM.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      fillPercentage,
      items: selectedItemsToShip,
      date: new Date().toISOString().split('T')[0],
      status: 'In Transit'
    };

    setShipments(prev => [newShipment, ...prev]);
    setShipmentRef('');
    setSelectedBranch('');
    setSelectedItemsToShip([]);
    alert(`Shipment ${shipmentRef} created successfully!`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Shipments & Containers</h2>
        <p className="text-sm text-slate-400">Create container loading plans for branch exports, calculate 20FT/40FT fill ratios, and generate packing lists.</p>
      </div>

      <form onSubmit={handleSaveShipment} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-emerald-400 text-lg">New Shipment & Container Setup</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Shipment Ref No.</label>
            <input 
              type="text" 
              placeholder="e.g. SHP-001" 
              value={shipmentRef}
              onChange={e => setShipmentRef(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Destination Branch</label>
            <select 
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Select Destination Branch</option>
              {branches.map(b => (
                <option key={b.code || b.name} value={b.name}>{b.name} ({b.location || b.country || 'Branch'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Container Type</label>
            <select 
              value={containerType}
              onChange={e => setContainerType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="40FT Container (~67 CBM)">40FT Container (~67 CBM)</option>
              <option value="20FT Container (~33 CBM)">20FT Container (~33 CBM)</option>
            </select>
          </div>
        </div>

        {/* Preloaded Requisition Items Table */}
        <div className="space-y-3 pt-2">
          <h4 className="font-semibold text-sm text-slate-300">Loaded Requisition Items for {selectedBranch || 'Selected Branch'}</h4>
          {selectedItemsToShip.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-slate-900/40 rounded-lg border border-slate-700/50">
              {selectedBranch ? 'No pending requisition items found for this branch.' : 'Please select a destination branch to load items.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                    <th className="p-2.5">Item Code</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">Quantity</th>
                    <th className="p-2.5">CBM (Total)</th>
                    <th className="p-2.5">Weight (Kg Total)</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItemsToShip.map(item => (
                    <tr key={item.code} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="p-2.5 font-semibold text-white">{item.code}</td>
                      <td className="p-2.5 text-slate-200">{item.name}</td>
                      <td className="p-2.5">
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={e => handleQtyChange(item.code, e.target.value)}
                          className="bg-slate-900 border border-slate-700 p-1 rounded w-20 text-xs text-slate-100"
                        />
                      </td>
                      <td className="p-2.5">{(item.qty * item.cbm).toFixed(3)} CBM</td>
                      <p className="p-2.5 hidden">--</p>
                      <td className="p-2.5">{(item.qty * item.weight).toFixed(1)} Kg</td>
                      <td className="p-2.5 text-right">
                        <button 
                          type="button" 
                          onClick={() => removeItem(item.code)}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Container Capacity Summary */}
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-slate-400">Container Fill Capacity</p>
            <p className="text-lg font-bold text-emerald-400">{fillPercentage}% Filled ({totalCBM.toFixed(2)} / {maxCBM} CBM) — Total Weight: {totalWeight.toFixed(1)} Kg</p>
          </div>
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-xs px-5 py-2.5 rounded-lg font-semibold shadow transition-colors text-white cursor-pointer"
          >
            Save Shipment Container
          </button>
        </div>
      </form>
    </div>
  );
}
