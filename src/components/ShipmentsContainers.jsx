import React, { useState, useEffect } from 'react';

export default function ShipmentsContainers({
  requisitions = [],
  stockLedger = [],
  branches = [],
  items = [],
  shipments = [],
  setShipments = () => {}
}) {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [shipmentRef, setShipmentRef] = useState('');
  const [containerType, setContainerType] = useState('40FT Container (~67 CBM)');
  const [selectedItemsToShip, setSelectedItemsToShip] = useState([]);
  const [itemToAddCode, setItemToAddCode] = useState('');
  const [addQty, setAddQty] = useState(100);

  // Automatically load items from branch requisitions or stock ledger when branch changes
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
    
    // 1. Try pulling from requisitions first
    if (branchReqs.length > 0) {
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
    }

    // 2. Fallback or supplement with available stock ledger items if no active requisitions remain
    if (Object.keys(aggregated).length === 0 && stockLedger.length > 0) {
      stockLedger.forEach(stock => {
        if (Number(stock.closingStock || stock.receivedQty || 0) > 0) {
          const masterItem = items.find(i => i.code?.toLowerCase() === stock.code?.toLowerCase());
          aggregated[stock.code] = {
            code: stock.code,
            name: stock.name,
            qty: Math.min(500, Number(stock.closingStock || stock.receivedQty)),
            cbm: Number(masterItem?.cbm || 0.01),
            weight: Number(masterItem?.weight || 1)
          };
        }
      });
    }

    setSelectedItemsToShip(Object.values(aggregated));
  }, [selectedBranch, requisitions, stockLedger, items]);

  const handleQtyChange = (code, val) => {
    setSelectedItemsToShip(prev => prev.map(item => 
      item.code === code ? { ...item, qty: Number(val) } : item
    ));
  };

  const removeItem = (code) => {
    setSelectedItemsToShip(prev => prev.filter(i => i.code !== code));
  };

  // Manual addition of extra items based on container space availability
  const handleAddItemManually = () => {
    if (!itemToAddCode) {
      alert('Please select an item to add.');
      return;
    }
    const masterItem = items.find(i => (i.code || i.sku) === itemToAddCode);
    if (!masterItem) return;

    const existingIndex = selectedItemsToShip.findIndex(i => i.code === masterItem.code);
    if (existingIndex >= 0) {
      const updated = [...selectedItemsToShip];
      updated[existingIndex].qty += Number(addQty);
      setSelectedItemsToShip(updated);
    } else {
      setSelectedItemsToShip([...selectedItemsToShip, {
        code: masterItem.code,
        name: masterItem.name,
        qty: Number(addQty),
        cbm: Number(masterItem.cbm || 0.01),
        weight: Number(masterItem.weight || 1)
      }]);
    }
    setItemToAddCode('');
    setAddQty(100);
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
      status: 'Consolidated/Ordered' // Initial status aligned with BranchPortal workflow
    };

    setShipments(prev => [newShipment, ...prev]);
    setShipmentRef('');
    setSelectedBranch('');
    setSelectedItemsToShip([]);
    alert(`Shipment ${shipmentRef} saved and sent to branch portal successfully!`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Shipments & Containers</h2>
        <p className="text-sm text-slate-400">Create container loading plans for branch exports, calculate fill ratios, and manually add extra items based on container space.</p>
      </div>

      <form onSubmit={handleSaveShipment} className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-5 shadow-xl">
        <h3 className="font-bold text-emerald-400 text-lg">New Shipment & Container Setup</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Shipment Ref No.</label>
            <input 
              type="text" 
              placeholder="e.g. AIT-1234" 
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

        {/* Manual Item Addition for Container Space Optimization */}
        <div className="bg-slate-900/50 border border-slate-700/70 p-4 rounded-xl space-y-3">
          <h4 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider">Add Extra Items to Container (Space Optimization)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7">
              <label className="block text-xs text-slate-400 mb-1">Select Item from Master</label>
              <select 
                value={itemToAddCode} 
                onChange={e => setItemToAddCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Choose item to include...</option>
                {items.map(i => (
                  <option key={i.code || i.sku} value={i.code || i.sku}>
                    {i.code} — {i.name} (CBM: {i.cbm || 0.01})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input 
                type="number" 
                value={addQty} 
                onChange={e => setAddQty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button 
                type="button" 
                onClick={handleAddItemManually}
                className="w-full bg-slate-700 hover:bg-slate-600 text-xs py-2 px-3 rounded-lg font-semibold text-white transition-colors cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Requisition & Container Items Table */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-300">Container Loading List for {selectedBranch || 'Selected Branch'}</h4>
          {selectedItemsToShip.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-slate-900/40 rounded-lg border border-slate-700/50">
              {selectedBranch ? 'No items loaded yet. Select items above or choose a branch with stock/requisitions.' : 'Please select a destination branch.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                    <th className="p-2.5">Item Code</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">Quantity</th>
                    <th className="p-2.5">Total CBM</th>
                    <th className="p-2.5">Total Weight (Kg)</th>
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
