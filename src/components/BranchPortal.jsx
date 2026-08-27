import React, { useState } from 'react';

export default function BranchPortal({
  branchName = 'Dubai Branch', // Current logged-in branch context
  shipments = [],
  setShipments = () => {},
  branchInventory = [],
  setBranchInventory = () => {}
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Filter shipments intended for this specific branch
  const myShipments = shipments.filter(s => 
    s.branch && s.branch.toLowerCase() === branchName.toLowerCase()
  );

  const filteredShipments = myShipments.filter(s => {
    if (selectedStatusFilter === 'ALL') return true;
    return (s.status || 'Pending').toUpperCase() === selectedStatusFilter.toUpperCase();
  });

  // Handle status progression & branch stock acceptance
  const handleUpdateStatus = (shipmentRef, nextStatus) => {
    const updated = shipments.map(s => {
      if (s.shipmentRef === shipmentRef) {
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setShipments(updated);

    // If branch accepts shipment, update local branch inventory/stock ledger
    if (nextStatus === 'Accepted/In Transit' || nextStatus === 'Completed') {
      const targetShipment = shipments.find(s => s.shipmentRef === shipmentRef);
      if (targetShipment && targetShipment.items) {
        const newInventory = [...branchInventory];
        targetShipment.items.forEach(item => {
          const idx = newInventory.findIndex(inv => inv.code === item.code && inv.branch === branchName);
          if (idx >= 0) {
            newInventory[idx].stockQty = Number(newInventory[idx].stockQty || 0) + Number(item.qty);
          } else {
            newInventory.push({
              branch: branchName,
              code: item.code,
              name: item.name,
              stockQty: Number(item.qty),
              lastUpdated: new Date().toISOString().split('T')[0]
            });
          }
        });
        setBranchInventory(newInventory);
      }
    }
    alert(`Shipment ${shipmentRef} status updated to: ${nextStatus}`);
  };

  // Generate and download a text/CSV Packing List for the shipment
  const handleDownloadPackingList = (shipment) => {
    let content = `PACKING LIST / SHIPMENT MANIFEST\n`;
    content += `=====================================\n`;
    content += `Shipment Ref: ${shipment.shipmentRef}\n`;
    content += `Destination Branch: ${shipment.branch}\n`;
    content += `Container Type: ${shipment.containerType}\n`;
    content += `Dispatch Date: ${shipment.date}\n`;
    content += `Status: ${shipment.status}\n`;
    content += `Total CBM: ${shipment.totalCBM} | Total Weight: ${shipment.totalWeight} Kg\n`;
    content += `-------------------------------------\n`;
    content += `Item Code\tItem Name\t\tQty\tCBM (Total)\tWeight (Kg)\n`;
    
    shipment.items.forEach(i => {
      content += `${i.code}\t${i.name.padEnd(20, ' ')}\t${i.qty}\t${(i.qty * i.cbm).toFixed(3)}\t\t${(i.qty * i.weight).toFixed(1)}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PackingList_${shipment.shipmentRef}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Branch Portal — <span className="text-emerald-400">{branchName}</span></h2>
          <p className="text-sm text-slate-400">Monitor incoming container shipments, track status progression, accept goods into branch inventory, and download packing lists.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter Status:</label>
          <select 
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Consolidated/Ordered">Consolidated/Ordered</option>
            <option value="Accepted/In Transit">Accepted/In Transit</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Shipments List Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-emerald-400 text-lg">Incoming Shipments & Transfer Manifests</h3>
        
        {filteredShipments.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No shipments found for {branchName} under the selected filter.</p>
        ) : (
          <div className="space-y-4">
            {filteredShipments.map(shipment => {
              const status = shipment.status || 'Pending';
              return (
                <div key={shipment.shipmentRef} className="border border-slate-700 rounded-xl p-4 bg-slate-900/40 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-emerald-400 text-base">
                        Ref: {shipment.shipmentRef} — <span className="text-white">{shipment.containerType}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Date: {shipment.date}</span>
                        <span>•</span>
                        <span>Fill: {shipment.fillPercentage}% ({shipment.totalCBM} CBM)</span>
                        <span>•</span>
                        <span>Weight: {shipment.totalWeight} Kg</span>
                        <span>•</span>
                        <span>
                          Status: <span className="font-semibold px-2 py-0.5 rounded text-xs bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">{status}</span>
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownloadPackingList(shipment)}
                        className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors text-white cursor-pointer"
                      >
                        📄 Download Packing List
                      </button>
                    </div>
                  </div>

                  {/* Shipment Line Items */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                          <th className="p-2.5">Item Code</th>
                          <th className="p-2.5">Item Name</th>
                          <th className="p-2.5">Shipped Qty</th>
                          <th className="p-2.5">CBM / Unit</th>
                          <th className="p-2.5 text-right">Total Line CBM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipment.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="p-2.5 font-semibold text-white">{item.code}</td>
                            <td className="p-2.5 text-slate-200">{item.name}</td>
                            <td className="p-2.5 font-bold text-emerald-300">{item.qty}</td>
                            <td className="p-2.5 text-slate-300">{item.cbm}</td>
                            <td className="p-2.5 text-right font-medium text-slate-200">{(item.qty * item.cbm).toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Status Progression Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
                    <div className="text-xs text-slate-400">
                      Progress Status:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={() => handleUpdateStatus(shipment.shipmentRef, 'Pending')}
                        className={`text-xs px-3 py-1 rounded font-medium cursor-pointer ${status === 'Pending' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(shipment.shipmentRef, 'Consolidated/Ordered')}
                        className={`text-xs px-3 py-1 rounded font-medium cursor-pointer ${status === 'Consolidated/Ordered' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        Consolidated/Ordered
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(shipment.shipmentRef, 'Accepted/In Transit')}
                        className={`text-xs px-3 py-1 rounded font-medium cursor-pointer ${status === 'Accepted/In Transit' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        Accept & In Transit
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(shipment.shipmentRef, 'Completed')}
                        className={`text-xs px-3 py-1 rounded font-medium cursor-pointer ${status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
