import React, { useState } from 'react';

export function BranchPortalTab({ preselectedBranch, branches, items, requisitions, setRequisitions, isStandalone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInBranch, setLoggedInBranch] = useState(preselectedBranch || null);
  const [orderQty, setOrderQty] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    const branch = branches.find(b => b.user === username && b.pass === password);
    if (branch) {
      setLoggedInBranch(branch);
    } else {
      alert("Invalid branch username or password.");
    }
  };

  const handleQtyChange = (itemId, val) => {
    setOrderQty(prev => ({ ...prev, [itemId]: val }));
  };

  // Filter items visible only to this branch
  const visibleItems = items.filter(i => (i.allowedBranches || []).includes(loggedInBranch?.id));

  // Calculate total Weight, CBM, and estimated CTNs for the order basket
  let totalOrderCbm = 0;
  let totalOrderWeight = 0;
  let totalEstimatedCtns = 0;

  visibleItems.forEach(i => {
    const qty = Number(orderQty[i.id] || 0);
    if (qty > 0) {
      totalOrderCbm += qty * (i.cbm || 0.04);
      totalOrderWeight += qty * ((i.weightKg || 12) / 100); // approx weight per unit
      const unitsPerCtn = parseInt(i.packSize) || 50;
      totalEstimatedCtns += Math.ceil(qty / unitsPerCtn);
    }
  });

  // Container thresholds: 20FT ~ 28 CBM / 21,000 kg; 40FT ~ 58 CBM / 26,000 kg
  const containerType = totalOrderCbm > 30 ? '40FT Container' : '20FT Container';
  const containerCapacityCbm = totalOrderCbm > 30 ? 58 : 28;
  const fillPercentage = Math.min(100, Math.round((totalOrderCbm / containerCapacityCbm) * 100));

  const handleSubmitRequisition = () => {
    const itemsToOrder = Object.keys(orderQty)
      .filter(itemId => Number(orderQty[itemId]) > 0)
      .map(itemId => ({ itemId, qty: Number(orderQty[itemId]) }));

    if (itemsToOrder.length === 0) {
      alert("Please enter order quantities.");
      return;
    }

    const newReq = {
      id: `REQ-${Math.floor(200 + Math.random() * 800)}`,
      branchId: loggedInBranch.id,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      items: itemsToOrder
    };

    setRequisitions(prev => [newReq, ...prev]);
    setOrderQty({});
    alert("Order requisition successfully submitted to Dubai HQ!");
  };

  if (!loggedInBranch) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E4DFD3] p-8 shadow-sm space-y-6 mt-10">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-[#1B2430]">Branch Portal Secure Login</h2>
          <p className="text-xs text-[#7A7568]">Sign in with your branch credentials to place order requisitions.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. nairobi_admin" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#1B2430]">{loggedInBranch.name} Order Requisition</h2>
          <p className="text-xs text-[#7A7568]">Branch Catalog ({loggedInBranch.country}) • Supplier details hidden</p>
        </div>
        {!isStandalone && (
          <button onClick={() => setLoggedInBranch(null)} className="bg-gray-100 hover:bg-gray-200 text-[#1B2430] px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer">
            Logout
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                <th className="pb-3 font-semibold">Item Code</th>
                <th className="pb-3 font-semibold">Item Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Pack Size</th>
                <th className="pb-3 font-semibold">Weight / CBM</th>
                <th className="pb-3 font-semibold text-right">Order Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {visibleItems.map(i => (
                <tr key={i.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 font-bold text-[#1B2430]">{i.id}</td>
                  <td className="py-3 text-[#1B2430] font-medium">{i.name}</td>
                  <td className="py-3 text-[#7A7568]">{i.category}</td>
                  <td className="py-3 text-[#7A7568]">{i.packSize || 'Standard'}</td>
                  <td className="py-3 text-[#7A7568]">{i.weightKg || 10} kg | {i.cbm || 0.04} CBM</td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      placeholder="0"
                      value={orderQty[i.id] || ''}
                      onChange={e => handleQtyChange(i.id, e.target.value)}
                      className="w-24 bg-[#FAF8F5] border border-[#E4DFD3] rounded-lg px-2 py-1 text-xs text-right font-medium"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Container Fill Calculator at Bottom */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD3] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2430]">Container Load Estimation Analysis</h4>
            <p className="text-xs text-[#7A7568]">
              Estimated CTNs: <strong className="text-[#1B2430]">{totalEstimatedCtns} CTNs</strong> | Total Weight: <strong className="text-[#1B2430]">{totalOrderWeight.toFixed(1)} kg</strong> | Total CBM: <strong className="text-[#1B2430]">{totalOrderCbm.toFixed(2)} m³</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
              Fits: {containerType} ({fillPercentage}% Capacity Filled)
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={handleSubmitRequisition} className="bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium px-6 py-2.5 rounded-xl cursor-pointer">
            Submit Requisition to Dubai HQ
          </button>
        </div>
      </div>
    </div>
  );
}
