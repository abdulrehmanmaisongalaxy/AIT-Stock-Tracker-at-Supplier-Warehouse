import React, { useState } from 'react';

export function BranchPortalTab({ preselectedBranch, branches, items, requisitions, setRequisitions, isStandalone }) {
  const [selectedBranchId, setSelectedBranchId] = useState(preselectedBranch ? preselectedBranch.id : (branches[0]?.id || ''));
  const [cart, setCart] = useState({}); // { itemId: qty }
  const [notes, setNotes] = useState('');

  const currentBranch = branches.find(b => b.id === selectedBranchId);
  const availableItems = items.filter(i => !i.allowedBranches || i.allowedBranches.includes(selectedBranchId));

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

      <form onSubmit={handleSubmitRequisition} className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E4DFD3] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1B2430]">Create Requisition Order — {currentBranch?.name}</h3>
            <p className="text-xs text-[#7A7568]">Select required quantities ensuring Minimum Order Quantities (MOQ)</p>
          </div>
          <button type="submit" className="bg-[#1B2430] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
            Submit Requisition to HQ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">MOQ Requirement</th>
                <th className="p-3">Pack Size</th>
                <th className="p-3 w-40">Order Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {availableItems.map(item => {
                const qty = cart[item.id] || 0;
                const isBelowMoq = qty > 0 && qty < item.moq;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-[#1B2430]">{item.name}</div>
                      <div className="text-[10px] text-[#7A7568]">{item.id} • {item.category}</div>
                    </td>
                    <td className="p-3 text-[#7A7568]">{item.supplier}</td>
                    <td className="p-3 font-semibold text-indigo-600">{item.moq} {item.unit}</td>
                    <td className="p-3 text-[#7A7568]">{item.packSize || 'N/A'}</td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        min="0" 
                        value={cart[item.id] || ''} 
                        onChange={e => handleQtyChange(item.id, e.target.value)} 
                        placeholder="0" 
                        className={`w-full p-2 border rounded-xl text-xs ${isBelowMoq ? 'border-amber-500 bg-amber-50' : 'border-[#E4DFD3]'}`} 
                      />
                      {isBelowMoq && <div className="text-[9px] text-amber-600 mt-0.5">Below MOQ ({item.moq})</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-xs text-[#7A7568] mb-1">Branch Requisition Notes / Special Instructions</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any delivery or packaging notes..." className="w-full p-3 border border-[#E4DFD3] rounded-xl text-xs h-20"></textarea>
        </div>
      </form>
    </div>
  );
}
