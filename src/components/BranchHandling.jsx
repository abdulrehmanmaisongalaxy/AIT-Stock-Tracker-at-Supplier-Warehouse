import React, { useState } from 'react';

export function BranchHandling({ branches, setBranches }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [editingBranch, setEditingBranch] = useState(null);

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (!name || !user) return;

    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? {
        ...b,
        name,
        country,
        user,
        pass: pass || b.pass
      } : b));
      setEditingBranch(null);
      alert("Branch updated successfully!");
    } else {
      const newBranch = {
        id: `Branch-${String.fromCharCode(65 + branches.length)}`,
        name,
        country,
        user,
        pass: pass || 'pass123'
      };
      setBranches(prev => [...prev, newBranch]);
      alert("Branch added successfully!");
    }

    setName('');
    setCountry('');
    setUser('');
    setPass('');
  };

  const handleEdit = (b) => {
    setEditingBranch(b);
    setName(b.name);
    setCountry(b.country);
    setUser(b.user);
    setPass(b.pass);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Branch Management & Secure Access Links</h2>
        <p className="text-xs text-[#7A7568]">Manage branch logins and generate standalone portal links for remote branch teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSaveBranch} className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2430]">
            {editingBranch ? `Edit Branch (${editingBranch.id})` : 'Register New Branch'}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Branch Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AIT Nairobi Branch" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Country / City</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Kenya" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Username</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="nairobi_admin" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Password</label>
            <input type="text" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl cursor-pointer">
              {editingBranch ? 'Update Branch' : 'Add Branch'}
            </button>
            {editingBranch && (
              <button type="button" onClick={() => { setEditingBranch(null); setName(''); setUser(''); }} className="bg-gray-200 text-[#1B2430] px-3 py-2 rounded-xl text-xs cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Existing Branches & Direct Links</h3>
          <div className="space-y-3">
            {branches.map(b => {
              const standaloneLink = `${window.location.origin}/?branch=${b.id}`;
              return (
                <div key={b.id} className="p-4 bg-[#FAF8F5] border border-[#E4DFD3] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-[#1B2430] text-sm">{b.name} ({b.country})</div>
                    <div className="text-[#7A7568]">Login: <code className="bg-white px-2 py-0.5 rounded border">{b.user} / {b.pass}</code></div>
                    <div className="text-blue-600 font-mono text-[11px] break-all">Direct URL: {standaloneLink}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(standaloneLink); alert(`Copied link for ${b.name}!`); }} className="bg-white border px-3 py-1.5 rounded-xl font-medium cursor-pointer hover:bg-gray-50">
                      Copy Link
                    </button>
                    <button onClick={() => handleEdit(b)} className="bg-white border px-3 py-1.5 rounded-xl font-medium cursor-pointer hover:bg-gray-50">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl font-medium cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
