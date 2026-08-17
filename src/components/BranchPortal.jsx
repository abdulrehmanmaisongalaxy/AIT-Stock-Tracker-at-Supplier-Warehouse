import React, { useState } from 'react';

export default function BranchOrderingPortalView({ items, branches, requisitions, setRequisitions, lockedBranch }) {
  const [selectedBranchCode, setSelectedBranchCode] = useState(lockedBranch ? lockedBranch.code : branches[0]?.code || '');
  const [branchCart, setBranchCart] = useState(requisitions[selectedBranchCode] || {});

  const currentBranchObj = branches.find(b => b.code === selectedBranchCode) || branches[0];

  const handleQtyChange = (itemId, val) => {
    setBranchCart(prev => ({
      ...prev,
      [itemId]: Math.max(0, Number(val))
    }));
  };

  const handleSubmitRequisition = () => {
    const hasItems = Object.values(branchCart).some(qty => qty > 0);
    if (!hasItems) {
      alert("Please add at least one item quantity.");
      return;
    }

    setRequisitions(prev => ({
      ...prev,
      [currentBranchObj.code]: branchCart
    }));
    alert(`Requisition successfully submitted to HQ for ${currentBranchObj.name}!`);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold">Branch Ordering Portal {lockedBranch ? `— ${lockedBranch.name}` : '(HQ View)'}</h2>
          <p className="text-xs text-gray-400">Select quantities for required inventory items and submit requisition to HQ</p>
        </div>
        {!lockedBranch && branches.length > 0 && (
          <select 
            value={selectedBranchCode} 
            onChange={(e) => setSelectedBranchCode(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-2 text-gray-200"
          >
            {branches.map(b => (
              <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 bg-gray-900/40">
              <th className="p-3">Item Code & Name</th>
              <th className="p-3">Pack Size</th>
              <th className="p-3">Item Weight</th>
              <th className="p-3">Item CBM</th>
              <th className="p-3">Order Qty (PCS)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">No master items available. Please add items in Master Setup first.</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-gray-700/60 hover:bg-gray-700/20">
                  <td className="p-3 font-medium">{item.id} — {item.name}</td>
                  <td className="p-3 text-gray-400">{item.packSize}</td>
                  <td className="p-3 text-gray-400">{item.weight} kg</td>
                  <td className="p-3 text-gray-400">{item.cbm} cbm</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="0"
                      value={branchCart[item.id] || 0}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      className="w-28 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center text-white"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleSubmitRequisition}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded text-sm transition-colors shadow"
      >
        Submit Requisition to HQ
      </button>
    </div>
  );
}
