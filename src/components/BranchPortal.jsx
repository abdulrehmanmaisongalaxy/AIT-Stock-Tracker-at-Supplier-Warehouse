import React, { useState } from 'react';

export default function BranchPortal({ branches, setBranches, items, branch, onLogout, onSubmitRequisition, isManagementMode }) {
  // If in branch login/ordering mode
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [orderQtys, setOrderQtys] = useState({});

  // Management State for Admin
  const [branchForm, setBranchForm] = useState({ id: '', name: '', location: '', country: '', email: '', password: '', allowedItems: [] });
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');

  const handleBranchLogin = (e) => {
    e.preventDefault();
    const found = branches.find(b => b.email === username && b.password === password);
    if (found) {
      // Simulate session trigger by reloading with query param
      window.location.href = `?branch=${found.id}`;
    } else {
      setAuthError('Invalid Branch Login Email or Password.');
    }
  };

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (editingBranchId) {
      setBranches(branches.map(b => b.id === editingBranchId ? branchForm : b));
      setEditingBranchId(null);
    } else {
      const newBranch = { ...branchForm, id: `br-${Date.now()}` };
      setBranches([...branches, newBranch]);
    }
    setBranchForm({ id: '', name: '', location: '', country: '', email: '', password: '', allowedItems: [] });
  };

  if (branch) {
    // Branch Ordering View
    const allowedItemList = items.filter(i => branch.allowedItems.includes(i.code));
    
    // Calculate live container fill rate
    let totalCBM = 0;
    let totalWeight = 0;
    Object.entries(orderQtys).forEach(([code, qty]) => {
      const item = items.find(i => i.code === code);
      if (item && qty > 0) {
        const ctns = Math.ceil(qty / item.packSize);
        totalCBM += ctns * Number(item.cbm);
        totalWeight += ctns * Number(item.weight);
      }
    });

    const fill20FT = Math.min(100, (totalCBM / 33) * 100).toFixed(1);
    const fill40FT = Math.min(100, (totalCBM / 67) * 100).toFixed(1);

    const submitOrder = () => {
      const orderLines = Object.entries(orderQtys)
        .filter(([_, qty]) => qty > 0)
        .map(([code, qty]) => ({ code, qty }));

      if (orderLines.length === 0) {
        alert('Please enter order quantity for at least one item.');
        return;
      }

      onSubmitRequisition({
        reqNo: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        branchName: branch.name,
        date: new Date().toISOString().split('T')[0],
        items: orderLines,
        totalCBM: totalCBM.toFixed(2),
        totalWeight: totalWeight.toFixed(2),
        status: 'pending'
      });
      setOrderQtys({});
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-emerald-400">{branch.name} Ordering Portal</h2>
            <p className="text-xs text-slate-400">Location: {branch.location}, {branch.country}</p>
          </div>
          <button onClick={onLogout} className="bg-rose-600 hover:bg-rose-500 text-xs px-4 py-2 rounded-lg font-semibold">Logout</button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
                <th className="p-3">Item Code</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Pack Size</th>
                <th className="p-3">Weight (Kg/Ctn)</th>
                <th className="p-3">CBM / Ctn</th>
                <th className="p-3">In Stock</th>
                <th className="p-3">Order Qty</th>
              </tr>
            </thead>
            <tbody>
              {allowedItemList.map(item => (
                <tr key={item.code} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3 font-semibold">{item.code}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.packSize}</td>
                  <td className="p-3">{item.weight}</td>
                  <td className="p-3">{item.cbm}</td>
                  <td className="p-3">{item.stock || 0}</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="0"
                      value={orderQtys[item.code] || ''} 
                      onChange={e => setOrderQtys({...orderQtys, [item.code]: Number(e.target.value)})}
                      className="bg-slate-900 border border-slate-700 p-2 rounded w-28 text-sm"
                      placeholder="Qty"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Real-time Container Fill Calculator */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-emerald-400">Container Fill Rate Calculator</h3>
            <p className="text-xs text-slate-400">Total CBM: {totalCBM.toFixed(3)} m³ | Total Weight: {totalWeight.toFixed(2)} Kg</p>
          </div>
          <div className="flex gap-6 w-full md:w-auto">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center flex-1">
              <p className="text-xs text-slate-400">20FT Container (~33 CBM)</p>
              <p className="text-lg font-bold text-amber-400">{fill20FT}% Filled</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center flex-1">
              <p className="text-xs text-slate-400">40FT Container (~67 CBM)</p>
              <p className="text-lg font-bold text-emerald-400">{fill40FT}% Filled</p>
            </div>
            <button onClick={submitOrder} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold shadow-lg">Submit Requisition</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isManagementMode) {
    // Login Screen for Branch
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form onSubmit={handleBranchLogin} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-emerald-400 text-center">Branch Portal Login</h2>
          <p className="text-xs text-slate-400 text-center">Enter your assigned branch login credentials.</p>
          {authError && <p className="text-xs text-rose-400 text-center">{authError}</p>}
          <input placeholder="Branch Login Email" value={username} onChange={e=>setUsername(e.target.value)} className="bg-slate-900 border border-slate-700 p-3 rounded-xl w-full text-sm" required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-slate-900 border border-slate-700 p-3 rounded-xl w-full text-sm" required />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-sm shadow">Login to Order</button>
        </form>
      </div>
    );
  }

  // Admin Management View
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Branch Management & Links</h2>
        <p className="text-sm text-slate-400">Configure branches, separate locations, set credentials, and generate portal access links.</p>
      </div>

      <form onSubmit={handleSaveBranch} className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
        <h3 className="font-bold text-emerald-400">{editingBranchId ? 'Edit Branch' : 'Add New Branch'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Branch Name" value={branchForm.name} onChange={e=>setBranchForm({...branchForm, name: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
          <input placeholder="Location / City" value={branchForm.location} onChange={e=>setBranchForm({...branchForm, location: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
          <input placeholder="Country" value={branchForm.country} onChange={e=>setBranchForm({...branchForm, country: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
          <input placeholder="Branch Login Email" value={branchForm.email} onChange={e=>setBranchForm({...branchForm, email: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
          <input placeholder="Password" value={branchForm.password} onChange={e=>setBranchForm({...branchForm, password: e.target.value})} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm" required />
        </div>

        {/* Restricted Item Selector */}
        <div className="border border-slate-700 p-4 rounded-xl space-y-3 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Restricted Item Selection ({branchForm.allowedItems.length} selected)</h4>
            <div className="flex gap-2">
              <select value={filterSupplier} onChange={e=>setFilterSupplier(e.target.value)} className="bg-slate-800 border border-slate-700 p-1.5 rounded text-xs">
                <option value="All">All Suppliers</option>
                {[...new Set(items.map(i => i.supplier))].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterCountry} onChange={e=>setFilterCountry(e.target.value)} className="bg-slate-800 border border-slate-700 p-1.5 rounded text-xs">
                <option value="All">All Countries</option>
                {[...new Set(items.map(i => i.country))].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="button" onClick={() => setBranchForm({...branchForm, allowedItems: items.map(i => i.code)})} className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded">Select All</button>
              <button type="button" onClick={() => setBranchForm({...branchForm, allowedItems: []})} className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded">Clear All</button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {items.filter(i => (filterSupplier === 'All' || i.supplier === filterSupplier) && (filterCountry === 'All' || i.country === filterCountry)).map(item => (
              <label key={item.code} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer text-xs">
                <input 
                  type="checkbox" 
                  checked={branchForm.allowedItems.includes(item.code)}
                  onChange={e => {
                    const checked = e.target.checked;
                    const updated = checked ? [...branchForm.allowedItems, item.code] : branchForm.allowedItems.filter(c => c !== item.code);
                    setBranchForm({...branchForm, allowedItems: updated});
                  }}
                />
                <span className="font-semibold">{item.code}</span> - {item.name} ({item.supplier})
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-sm shadow">{editingBranchId ? 'Update Branch' : 'Save Branch'}</button>
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
              <th className="p-3">Branch Name</th><th className="p-3">Location</th><th className="p-3">Country</th><th className="p-3">Login Email</th><th className="p-3">Items Allowed</th><th className="p-3">Direct Portal Link</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 font-semibold">{b.name}</td>
                <td className="p-3">{b.location}</td>
                <td className="p-3">{b.country}</td>
                <td className="p-3">{b.email}</td>
                <td className="p-3">{b.allowedItems.length} items</td>
                <td className="p-3">
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}${window.location.pathname}?branch=${b.id}`;
                      navigator.clipboard.writeText(link);
                      alert(`Copied link for ${b.name}:\n${link}`);
                    }} 
                    className="text-emerald-400 hover:underline text-xs bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full font-medium"
                  >
                    Copy Link
                  </button>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setBranchForm(b); setEditingBranchId(b.id); }} className="text-amber-400 hover:underline">Edit</button>
                  <button onClick={() => setBranches(branches.filter(x => x.id !== b.id))} className="text-rose-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
