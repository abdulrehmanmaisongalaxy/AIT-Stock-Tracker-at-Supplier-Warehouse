import React, { useState } from 'react';

export function BranchHandling({ branches, setBranches }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!name || !user || !pass) return;
    const newBranch = {
      id: `Branch-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name,
      country,
      user,
      pass
    };
    setBranches(prev => [...prev, newBranch]);
    setName('');
    setCountry('');
    setUser('');
    setPass('');
    alert("Branch user login successfully created!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Branch User & Login Management</h2>
        <p className="text-xs text-[#7A7568]">Configure regional branch portals, usernames, and secure passwords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Branch Form */}
        <form onSubmit={handleAddBranch} className="bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Add New Branch Portal</h3>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Branch Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AIT Accra Branch" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Country</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Ghana" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Login Username</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="accra_admin" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A7568] mb-1">Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs" required />
          </div>
          <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer">
            Create Branch Credentials
          </button>
        </form>

        {/* Existing Branches List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E4DFD3] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Active Branch Portals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4DFD3] text-[#7A7568]">
                  <th className="pb-3 font-semibold">Branch ID</th>
                  <th className="pb-3 font-semibold">Branch Name</th>
                  <th className="pb-3 font-semibold">Country</th>
                  <th className="pb-3 font-semibold">Login Username</th>
                  <th className="pb-3 font-semibold">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD3]">
                {branches.map(b => (
                  <tr key={b.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#1B2430]">{b.id}</td>
                    <td className="py-3 text-[#1B2430]">{b.name}</td>
                    <td className="py-3 text-[#7A7568]">{b.country}</td>
                    <td className="py-3 font-mono text-[#D97706]">{b.user}</td>
                    <td className="py-3 font-mono text-gray-500">{b.pass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
