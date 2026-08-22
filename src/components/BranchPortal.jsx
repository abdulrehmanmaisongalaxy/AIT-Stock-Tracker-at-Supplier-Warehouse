import React, { useState } from 'react';

export default function BranchPortal({ branch, branches, setBranches, items, isManagementMode, onLogout, onSubmitRequisition }) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loggedInBranch, setLoggedInBranch] = useState(branch || null);
  
  // Requisition form item quantities mapping: { [itemCode]: qty }
  const [reqQuantities, setReqQuantities] = useState({});

  // 1. Management Mode (Admin view for managing branches and generating links)
  if (isManagementMode) {
    const [newBranchName, setNewBranchName] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedAllowedItems, setSelectedAllowedItems] = useState([]);

    const handleAddBranch = (e) => {
      e.preventDefault();
      if (!newBranchName) return alert('Please enter branch name.');
      const newB = {
        id: 'br-' + Date.now(),
        name: newBranchName,
        location: newLocation,
        country: newCountry,
        email: newEmail || 'branch@ayulintl.com',
        password: newPassword || 'password123',
        allowedItems: selectedAllowedItems.length > 0 ? selectedAllowedItems : items.map(i => i.code)
      };
      setBranches([...branches, newB]);
      setNewBranchName('');
      setNewLocation('');
      setNewCountry('');
      setNewEmail('');
      setNewPassword('');
      setSelectedAllowedItems([]);
      alert('Branch created successfully!');
    };

    const copyPortalLink = (branchId) => {
      const link = `${window.location.origin}/?branch=${branchId}`;
      navigator.clipboard.writeText(link);
      alert('Branch portal login link copied to clipboard:\n' + link);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Branch Management & Links</h2>
          <p className="text-sm text-slate-400">Configure branches, set credentials, and generate portal access links with restricted item views.</p>
        </div>

        {/* Add Branch Form */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Add New Branch / User</h3>
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Branch Name (e.g. MG Kinshasa)" 
                value={newBranchName} 
                onChange={e => setNewBranchName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required 
              />
              <input 
                type="text" 
                placeholder="Location / City" 
                value={newLocation} 
                onChange={e => setNewLocation(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
              <input 
                type="text" 
                placeholder="Country" 
                value={newCountry} 
                onChange={e => setNewCountry(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="email" 
                placeholder="Branch Login Email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
              <input 
                type="text" 
                placeholder="Password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-md">
              Save Branch & Generate Portal Access
            </button>
          </form>
        </div>

        {/* Existing Branches List & Links */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Active Branches & Direct Portal Links</h3>
          <div className="space-y-4">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-100">{b.name} <span className="text-xs font-normal text-slate-400">({b.location}, {b.country})</span></h4>
                  <p className="text-xs text-slate-400">Login Email: {b.email} | Allowed SKUs: {b.allowedItems?.length || items.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyPortalLink(b.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2"
                  >
                    <i className="fa-solid fa-link"></i> Copy Secure Portal Link
                  </button>
                  <button 
                    onClick={() => setBranches(branches.filter(x => x.id !== b.id))}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {branches.length === 0 && <p className="text-slate-400 text-sm">No branches configured yet.</p>}
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged-in Branch Requisition View (Accessed via Link or Login)
  if (loggedInBranch) {
    const allowedCatalog = items.filter(i => !loggedInBranch.allowedItems || loggedInBranch.allowedItems.includes(i.code));

    const handleQuantityChange = (code, val) => {
      setReqQuantities(prev => ({ ...prev, [code]: parseInt(val) || 0 }));
    };

    const handleSendOrder = () => {
      const orderItems = Object.entries(reqQuantities)
        .filter(([code, qty]) => qty > 0)
        .map(([code, qty]) => {
          const item = items.find(i => i.code === code);
          return { code, name: item?.name, quantity: qty, unitPrice: item?.price || 0, currency: item?.currency || 'USD' };
        });

      if (orderItems.length === 0) {
        return alert('Please enter a quantity for at least one item before submitting.');
      }

      const newReq = {
        id: 'REQ-' + Date.now(),
        branchId: loggedInBranch.id,
        branchName: loggedInBranch.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: orderItems
      };

      if (onSubmitRequisition) {
        onSubmitRequisition(newReq);
      }
      setReqQuantities({});
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-6xl mx-auto bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">{loggedInBranch.name} Requisition Portal</h2>
              <p className="text-sm text-slate-400">Location: {loggedInBranch.location}, {loggedInBranch.country}</p>
            </div>
            <button 
              onClick={() => { setLoggedInBranch(null); if (onLogout) onLogout(); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Product Catalog & Order Requisition</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-700 sticky top-0">
                    <th className="p-3">Code</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Pack Size</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Requested Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {allowedCatalog.map(item => (
                    <tr key={item.code} className="hover:bg-slate-750">
                      <td className="p-3 font-medium text-emerald-400">{item.code}</td>
                      <td className="p-3 text-slate-200">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.supplier}</td>
                      <td className="p-3 text-slate-400">{item.packSize}</td>
                      <td className="p-3 text-slate-300">{item.price} {item.currency}</td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={reqQuantities[item.code] || ''}
                          onChange={e => handleQuantityChange(item.code, e.target.value)}
                          className="w-28 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={handleSendOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md w-full"
            >
              Submit Order Requisition to Dubai HQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fallback Login Screen if accessed without a direct URL link token
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const matched = branches.find(b => b.email.toLowerCase() === emailInput.toLowerCase() && b.password === passwordInput);
    if (matched) {
      setLoggedInBranch(matched);
    } else {
      alert('Invalid email or password. Please check credentials or use your generated portal link.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-400">Branch Portal Login</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your assigned branch credentials or use your direct portal link.</p>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Branch Login Email</label>
            <input 
              type="email" 
              value={emailInput} 
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            Login to Secure Portal
          </button>
        </form>
      </div>
    </div>
  );
}
