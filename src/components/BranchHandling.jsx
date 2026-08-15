import React, { useState } from 'react';

export function BranchHandling({ branches, setBranches }) {
  const [branchForm, setBranchForm] = useState({ id: '', name: '', country: '', user: '', pass: 'pass123' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setBranches(branches.map(b => b.id === editingId ? { ...branchForm } : b));
      setEditingId(null);
    } else {
      setBranches([...branches, { ...branchForm, id: branchForm.id || `Branch-${Math.floor(100+Math.random()*900)}` }]);
    }
    setBranchForm({ id: '', name: '', country: '', user: '', pass: 'pass123' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this branch?')) setBranches(branches.filter(b => b.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm h-fit">
        <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">{editingId ? 'Edit Branch' : 'Register New Branch'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#7A7568] mb-1">Branch Code ID</label>
            <input type="text" placeholder="KIN-123" value={branchForm.id} onChange={e => setBranchForm({...branchForm, id: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
          </div>
          <div>
            <label className="block text-[#7A7568] mb-1">Branch Name</label>
            <input type="text" required placeholder="MG Kinshasa" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
          </div>
          <div>
            <label className="block text-[#7A7568] mb-1">Country</label>
            <input type="text" required placeholder="Congo" value={branchForm.country} onChange={e => setBranchForm({...branchForm, country: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#7A7568] mb-1">Username</label>
              <input type="text" required value={branchForm.user} onChange={e => setBranchForm({...branchForm, user: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
            </div>
            <div>
              <label className="block text-[#7A7568] mb-1">Password</label>
              <input type="text" required value={branchForm.pass} onChange={e => setBranchForm({...branchForm, pass: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-[#1B2430] text-white py-2.5 rounded-xl font-semibold cursor-pointer">{editingId ? 'Update Branch' : 'Add Branch'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setBranchForm({ id: '', name: '', country: '', user: '', pass: 'pass123' }); }} className="bg-gray-200 px-3 py-2.5 rounded-xl">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
        <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">Active Branches & Secure Direct URLs</h2>
        <div className="space-y-4">
          {branches.map(branch => {
            const secureUrl = `${window.location.origin}${window.location.pathname}?branch=${branch.id}`;
            return (
              <div key={branch.id} className="p-4 border border-[#E4DFD3] rounded-xl bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#1B2430]">{branch.name} ({branch.country})</h3>
                  <p className="text-[11px] text-[#7A7568] mt-0.5">Login: <span className="font-semibold">{branch.user}</span></p>
                  <div className="mt-2 text-[10px] bg-white p-1.5 rounded border border-[#E4DFD3] font-mono text-indigo-600 break-all">
                    {secureUrl}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => navigator.clipboard.writeText(secureUrl)} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-semibold cursor-pointer">
                    Copy URL
                  </button>
                  <button onClick={() => { setBranchForm(branch); setEditingId(branch.id); }} className="text-xs bg-gray-200 text-[#1B2430] px-3 py-1.5 rounded-xl font-semibold cursor-pointer">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(branch.id)} className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl font-semibold cursor-pointer">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {branches.length === 0 && <p className="text-xs text-gray-400">No branches registered yet.</p>}
        </div>
      </div>
    </div>
  );
}
