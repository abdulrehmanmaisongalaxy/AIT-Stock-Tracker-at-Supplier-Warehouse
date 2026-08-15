import React, { useState } from 'react';

export function BranchPortalTab({ branches, items, requisitions, setRequisitions }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInBranch, setLoggedInBranch] = useState(null);
  const [orderQty, setOrderQty] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    const branch = branches.find(b => b.user === username && b.pass === password);
    if (branch) {
      setLoggedInBranch(branch);
    } else {
      alert("Invalid branch username or password. Please try again.");
    }
  };

  const handleQtyChange = (itemId, val) => {
    setOrderQty(prev => ({ ...prev, [itemId]: val }));
  };

  const handleSubmitRequisition = () => {
    const itemsToOrder = Object.keys(orderQty)
      .filter(itemId => Number(orderQty[itemId]) > 0)
      .map(itemId => ({ itemId, qty: Number(orderQty[itemId]) }));

    if (itemsToOrder.length === 0) {
      alert("Please enter quantities for items you wish to order.");
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
    alert("Order requisition submitted successfully to Dubai HQ!");
  };

  if (!loggedInBranch) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E4DFD3] p-8 shadow-sm space-y-6 mt-10">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-[#1B2430]">Branch Portal Secure Login</h2>
          <p className="text-xs text-[#7A7568]">Sign in with your regional branch credentials to view restricted items and submit requisitions.</p>
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
          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
            Login to Branch Portal
          </button>
        </form>

        <div className="border-t border-[#E4DFD3] pt-4 text-center">
          <p className="text-[11px] text-[#7A7568]">Preset Demo Credentials:</p>
          <p className="text-[11px] font-mono text-[#D97706] mt-1">nairobi_admin / nair123 (Branch A)</p>
          <p className="text-[11px] font-mono text-[#D97706]">lagos_admin / lag123 (Branch B)</p>
        </div>
      </div>
    );
  }

  // Filter items visible only to this logged-in branch
  const visibleItems = items.filter(i => (i.allowedBranches || []).includes(loggedInBranch.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#1B2430]">{loggedInBranch.name} Order Requisition Portal</h2>
          <p className="text-xs text-[#7A7568]">Viewing restricted item catalog for {loggedInBranch.country}</p>
        </div>
        <button onClick={() => setLoggedInBranch(null)} className="bg-gray-100 hover:bg-gray-200 text-[#1B2430] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer">
          Logout
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Permitted Cosmetic Item Catalog</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                <th className="pb-3 font-semibold">Item Code</th>
                <th className="pb-3 font-semibold">Item Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold text-right">Order Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {visibleItems.map(i => (
                <tr key={i.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 font-bold text-[#1B2430]">{i.id}</td>
                  <td className="py-3 text-[#1B2430]">{i.name}</td>
                  <td className="py-3 text-[#7A7568]">{i.category}</td>
                  <td className="py-3 text-[#7A7568]">{i.supplier}</td>
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

        <div className="pt-4 border-t border-[#E4DFD3] flex justify-end">
          <button onClick={handleSubmitRequisition} className="bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
            Submit Order Requisition to HQ
          </button>
        </div>
      </div>
    </div>
  );
}
