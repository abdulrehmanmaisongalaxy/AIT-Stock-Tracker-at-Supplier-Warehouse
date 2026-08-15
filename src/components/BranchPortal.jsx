import React, { useState } from 'react';

export function BranchPortalTab({ preselectedBranch, branches, items, requisitions, setRequisitions, isStandalone }) {
  const [selectedBranchId, setSelectedBranchId] = useState(preselectedBranch ? preselectedBranch.id : (branches[0]?.id || ''));
  const [cart, setCart] = useState({}); // { itemId: qty }
  const [notes, setNotes] = useState('');

  const currentBranch = branches.find(b => b.id === selectedBranchId);

  // Real-time container fill calculation (20FT = 28 CBM, 40FT = 58 CBM)
  let totalCbm = 0;
  let totalWeight = 0;
  Object.entries(cart).forEach(([itemId, qty]) => {
    const item = items.find(i => i.id === itemId);
    if (item && qty > 0) {
      totalCbm += (item.cbm || 0.01) * qty;
      totalWeight += (item.weightKg || 1) * qty;
    }
  });

  const container20ftPct = Math.min(100, Math.round((totalCbm / 28) * 100));
  const container40ftPct = Math.min(100, Math.round((totalCbm / 58) * 100));

  const handleQtyChange = (itemId, qty) => {
    setCart({ ...cart, [itemId]: Number(qty) });
  };

  const handleSubmitRequisition = (e) => {
    e.preventDefault();
    const itemsList = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (itemsList.length === 0) {
      alert('Please add at least one item quantity.');
      return;
    }

    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      branchId: selectedBranchId,
      branchName: currentBranch?.name || selectedBranchId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Consolidation',
      notes,
      items: itemsList
    };

    setRequisitions([newReq, ...requisitions]);
    setCart({});
    setNotes('');
    alert('Requisition submitted successfully to Dubai HQ!');
  };

  const handleDeleteRequisition = (id) => {
    if (window.confirm('Delete this requisition?')) {
      setRequisitions(requisitions.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {!isStandalone && (
        <div className="bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Branch Ordering Portal (HQ View)</h2>
            <p className="text-[11px] text-[#7A7568]">Simulate ordering on behalf of any regional branch</p>
          </div>
          <select value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} className="p-2 border border-[#E4DFD3] rounded-xl text-xs bg-gray-50 font-semibold">
            {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.country})</option>)}
          </select>
        </div>
      )}

      {/* Live Container Fill Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#1B2430]">
            <span>20FT Container Fill ({totalCbm.toFixed(2)} / 28 CBM)</span>
            <span className={container20ftPct > 100 ? 'text-rose-600' : 'text-emerald-600'}>{container20ftPct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className={`h-full ${container20ftPct > 100 ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${Math.min(100, container20ftPct)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#7A7568]">Total Weight: {totalWeight.toFixed(1)} kg {container20ftPct < 80 ? '— Tip: Increase order to optimize container!' : '— Optimal fill level!'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#1B2430]">
            <span>40FT Container Fill ({totalCbm.toFixed(2)} / 58 CBM)</span>
            <span className="text-indigo-600">{container40ftPct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, container40ftPct)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#7A7568]">Total Weight: {totalWeight.toFixed(1)} kg</p>
        </div>
      </div>

      <form onSubmit={handleSubmitRequisition} className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E4DFD3] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1B2430]">Create Requisition Order — {currentBranch?.name || selectedBranchId}</h3>
            <p className="text-xs text-[#7A7568]">Enter required quantities below</p>
          </div>
          <button type="submit" className="bg-[#1B2430] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
            Submit Requisition to HQ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
              <tr>
                <th className="p-3">Item Code & Name</th>
                <th className="p-3">Pack Size</th>
                <th className="p-3">Item Weight</th>
                <th className="p-3">Item CBM</th>
                <th className="p-3 w-40">Order Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold text-[#1B2430]">{item.name}</div>
                    <div className="text-[10px] text-[#7A7568]">{item.id}</div>
                  </td>
                  <td className="p-3 text-[#7A7568]">{item.packSize || 'N/A'}</td>
                  <td className="p-3 text-[#7A7568]">{item.weightKg || 1} kg</td>
                  <td className="p-3 text-[#7A7568]">{item.cbm || 0.01} cbm</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="0" 
                      value={cart[item.id] || ''} 
                      onChange={e => handleQtyChange(item.id, e.target.value)} 
                      placeholder="0" 
                      className="w-full p-2 border border-[#E4DFD3] rounded-xl text-xs font-bold" 
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No master items available. Please add items in Master Setup first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </form>

      {/* Submitted Requisitions List with Delete Option */}
      <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">Submitted Requisitions ({requisitions.length})</h3>
        <div className="space-y-3">
          {requisitions.map(req => (
            <div key={req.id} className="p-4 border border-[#E4DFD3] rounded-xl bg-gray-50 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-[#1B2430]">{req.id} — {req.branchName} ({req.date})</div>
                <div className="text-[11px] text-[#7A7568] mt-1">Items count: {req.items.length} | Status: <span className="text-indigo-600 font-semibold">{req.status}</span></div>
              </div>
              <button onClick={() => handleDeleteRequisition(req.id)} className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl font-semibold cursor-pointer">
                Delete
              </button>
            </div>
          ))}
          {requisitions.length === 0 && <p className="text-xs text-gray-400">No requisitions submitted yet.</p>}
        </div>
      </div>
    </div>
  );
}
