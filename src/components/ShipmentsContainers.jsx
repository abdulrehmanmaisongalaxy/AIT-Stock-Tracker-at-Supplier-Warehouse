import React, { useState } from 'react';

export default function ShipmentsContainers({ shipments, setShipments, branches, items, stockLedger }) {
  const [shipmentForm, setShipmentForm] = useState({ refNo: '', branchId: '', containerType: '40FT', status: 'Draft', items: [] });
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [qtyToShip, setQtyToShip] = useState('');

  const addItemToShipment = () => {
    if (!selectedItemCode || !qtyToShip) return;
    const itemMaster = items.find(i => i.code === selectedItemCode);
    setShipmentForm({
      ...shipmentForm,
      items: [...shipmentForm.items, { code: selectedItemCode, name: itemMaster.name, qty: Number(qtyToShip), cbm: itemMaster.cbm, weight: itemMaster.weight, packSize: itemMaster.packSize }]
    });
    setSelectedItemCode('');
    setQtyToShip('');
  };

  // Calculate container fill
  let totalCBM = 0;
  let totalWeight = 0;
  shipmentForm.items.forEach(i => {
    const ctns = Math.ceil(i.qty / i.packSize);
    totalCBM += ctns * Number(i.cbm);
    totalWeight += ctns * Number(i.weight);
  });
  const maxCBM = shipmentForm.containerType === '20FT' ? 33 : 67;
  const fillRatio = Math.min(100, (totalCBM / maxCBM) * 100).toFixed(1);

  const handleSaveShipment = (e) => {
    e.preventDefault();
    const branchObj = branches.find(b => b.id === shipmentForm.branchId);
    const newShipment = {
      ...shipmentForm,
      id: `SHP-${Date.now()}`,
      branchName: branchObj ? branchObj.name : 'Unknown Branch',
      totalCBM: totalCBM.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      fillRatio
    };
    setShipments([newShipment, ...shipments]);
    setShipmentForm({ refNo: '', branchId: '', containerType: '40FT', status: 'Draft', items: [] });
    alert('Shipment container created successfully!');
  };

  const downloadPackingListCSV = (shp) => {
    let csv = `Packing List - Shipment: ${shp.refNo}, Branch: ${shp.branchName}, Container: ${shp.containerType}\n`;
    csv += "Code,Item Name,Ordered Qty,Cartons,Total CBM,Total Weight\n";
    shp.items.forEach(i => {
      const ctns = Math.ceil(i.qty / i.packSize);
      csv += `${i.code},"${i.name}",${i.qty},${ctns},${(ctns * i.cbm).toFixed(3)},${(ctns * i.weight).toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `packing_list_${shp.refNo}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Shipments & Containers</h2>
        <p className="text-sm text-slate-400">Create container loading plans for branch exports, calculate 20FT/40FT fill ratios, and generate packing lists.</p>
      </div>

      <form onSubmit={handleSaveShipment} className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
        <h3 className="font-bold text-emerald-400">New Shipment & Container Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Shipment Ref No. (e.g. SHP-001)" value={shipmentForm.refNo} onChange={e=>setShipmentForm({...shipmentForm, refNo: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
          <select value={shipmentForm.branchId} onChange={e=>setShipmentForm({...shipmentForm, branchId: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required>
            <option value="">Select Destination Branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.location})</option>)}
          </select>
          <select value={shipmentForm.containerType} onChange={e=>setShipmentForm({...shipmentForm, containerType: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm">
            <option value="20FT">20FT Container (~33 CBM)</option>
            <option value="40FT">40FT Container (~67 CBM)</option>
          </select>
        </div>

        {/* Add Items to Container */}
        <div className="border border-slate-700 p-4 rounded-xl space-y-3 bg-slate-900/50">
          <h4 className="font-semibold text-sm">Select Items to Ship</h4>
          <div className="flex gap-3">
            <select value={selectedItemCode} onChange={e=>setSelectedItemCode(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded text-sm flex-1">
              <option value="">Select Item</option>
              {items.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
            </select>
            <input type="number" placeholder="Quantity" value={qtyToShip} onChange={e=>setQtyToShip(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded w-32 text-sm" />
            <button type="button" onClick={addItemToShipment} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-semibold">Add Item</button>
          </div>

          {shipmentForm.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Qty</th><th className="p-2">Cartons</th><th className="p-2">CBM</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentForm.items.map((i, idx) => {
                    const ctns = Math.ceil(i.qty / i.packSize);
                    return (
                      <tr key={idx} className="border-b border-slate-700/30">
                        <td className="p-2 font-semibold">{i.code}</td>
                        <td className="p-2">{i.name}</td>
                        <td className="p-2">{i.qty}</td>
                        <td className="p-2">{ctns}</td>
                        <td className="p-2">{(ctns * i.cbm).toFixed(3)} m³</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time container fill widget */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700">
          <div>
            <p className="text-xs text-slate-400">Container Fill Capacity</p>
            <p className="text-lg font-bold text-emerald-400">{fillRatio}% Filled ({totalCBM.toFixed(2)} / {maxCBM} CBM)</p>
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl font-bold text-sm shadow">Save Shipment Container</button>
        </div>
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
        <h3 className="font-bold text-emerald-400">Active Shipments & Packing Lists</h3>
        {shipments.length === 0 ? (
          <p className="text-sm text-slate-400">No shipments created yet.</p>
        ) : (
          <div className="space-y-4">
            {shipments.map(shp => (
              <div key={shp.id} className="border border-slate-700 rounded-xl p-4 bg-slate-900/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-emerald-400">{shp.refNo} — Branch: {shp.branchName}</h4>
                    <p className="text-xs text-slate-400">Container: {shp.containerType} | Fill Ratio: <span className="text-amber-400 font-semibold">{shp.fillRatio}%</span></p>
                  </div>
                  <button onClick={() => downloadPackingListCSV(shp)} className="bg-slate-700 hover:bg-slate-600 text-xs px-4 py-2 rounded-lg font-semibold">Download Packing List (CSV/Excel)</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
