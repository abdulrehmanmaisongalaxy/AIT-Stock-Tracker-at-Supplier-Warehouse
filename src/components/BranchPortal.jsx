import React, { useState } from 'react';

export default function BranchPortal({
  branchName = 'Dubai Branch', // Current logged-in branch context
  setBranchName = () => {}, // Function to switch active branch view if needed
  shipments = [],
  setShipments = () => {},
  branchInventory = [],
  setBranchInventory = () => {},
  branches = [], // List of branches
  setBranches = () => {}, // Function to update branches list/credentials
  catalogItems = [] // Available items for restriction setup
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = pers => setSelectedStatusFilter('ALL');
  const [activeTab, setActiveTab] = useState('shipments'); // 'shipments' vs 'management'

  // State for adding/editing a branch and its login credentials / restrictions
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchUser, setNewBranchUser] = useState('');
  const [newBranchPass, setNewBranchPass] = useState('');
  const [restrictedItemCodes, setRestrictedItemCodes] = useState([]);

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

  // Save or Create a New Branch with Login Credentials and Restricted Items
  const handleSaveNewBranch = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      alert('Please enter a valid branch name.');
      return;
    }

    const branchEntry = {
      name: newBranchName.trim(),
      username: newBranchUser.trim() || `${newBranchName.toLowerCase().replace(/\s+/g, '')}_mgr`,
      password: newBranchPass.trim() || 'password123',
      restrictedItems: restrictedItemCodes
    };

    setBranches([...branches, branchEntry]);
    alert(`Branch "${newBranchName}" successfully created with login credentials & item restrictions!`);
    
    // Reset form
    setNewBranchName('');
    setNewBranchUser('');
    setNewBranchPass('');
    setRestrictedItemCodes([]);
  };

  const toggleItemRestriction = (code) => {
    if (restrictedItemCodes.includes(code)) {
      setRestrictedItemCodes(restrictedItemCodes.filter(c => c !== code));
    } else {
      setRestrictedItemCodes([...restrictedItemCodes, code]);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Branch Portal — <span className="text-emerald-400">{branchName}</span></h2>
          <p className="text-sm text-slate-400">Monitor incoming shipments, manage branch setups, login credentials, and item restrictions.</p>
        </div>
        
        {/* Navigation Tabs inside Portal */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('shipments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'shipments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📦 Incoming Shipments
          </button>
          <button 
            onClick={() => setActiveTab('management')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'management' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            ⚙️ Setup & Credentials
          </button>
        </div>
      </div>

      {activeTab === 'shipments' ? (
        <>
          <div className="flex justify-end items-center">
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
        </>
      ) : (
        /* Branch Creation, Credentials & Item Restrictions Setup */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-emerald-400 text-lg">Create New Branch & Credentials</h3>
            <form onSubmit={handleSaveNewBranch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Branch Name</label>
                <input 
                  type="text" 
                  value={newBranchName} 
                  onChange={e => setNewBranchName(e.target.value)} 
                  placeholder="e.g. Abu Dhabi Warehouse" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Login Username</label>
                  <input 
                    type="text" 
                    value={newBranchUser} 
                    onChange={e => setNewBranchUser(e.target.value)} 
                    placeholder="e.g. ad_mgr" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Login Password</label>
                  <input 
                    type="password" 
                    value={newBranchPass} 
                    onChange={e => setNewBranchPass(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Restrict Specific Items for this Branch</label>
                <p className="text-[11px] text-slate-500 mb-2">Select items that this branch should be restricted from ordering or stocking.</p>
                <div className="max-h-44 overflow-y-auto space-y-1 bg-slate-900 p-2 rounded-lg border border-slate-700">
                  {catalogItems.length === 0 ? (
                    <p className="text-slate-500 text-center py-2">No catalog items available.</p>
                  ) : (
                    catalogItems.map(item => (
                      <label key={item.code} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={restrictedItemCodes.includes(item.code)}
                          onChange={() => toggleItemRestriction(item.code)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span className="text-white font-medium">{item.code}</span>
                        <span className="text-slate-400 truncate">— {item.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Save Branch & Setup Credentials
              </button>
            </form>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-emerald-400 text-lg">Configured Branches Directory</h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {branches.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No custom branches configured yet.</p>
              ) : (
                branches.map((b, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{b.name}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">User: {b.username}</span>
                    </div>
                    <p className="text-slate-400">
                      Restricted Items: <span className="text-amber-400 font-semibold">{b.restrictedItems?.length ? b.restrictedItems.join(', ') : 'None'}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
