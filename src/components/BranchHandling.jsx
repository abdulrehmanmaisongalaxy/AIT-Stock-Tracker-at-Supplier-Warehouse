import React from 'react';

export default function BranchHandling({ branches, newBranch, setNewBranch, handleAddBranch, handleDeleteBranch }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-md font-bold mb-4">REGISTER NEW BRANCH</h2>
        <form onSubmit={handleAddBranch} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Branch Code ID</label>
            <input type="text" value={newBranch.code} onChange={e => setNewBranch({...newBranch, code: e.target.value})} placeholder="KIN-123" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Branch Name</label>
            <input type="text" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} placeholder="MG Kinshasa" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Country</label>
            <input type="text" value={newBranch.country} onChange={e => setNewBranch({...newBranch, country: e.target.value})} placeholder="Congo" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Username</label>
            <input type="text" value={newBranch.username} onChange={e => setNewBranch({...newBranch, username: e.target.value})} placeholder="matadi" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-sm transition-colors shadow">Add Branch</button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-md font-bold">ACTIVE BRANCHES & SECURE DIRECT URLS</h2>
        {branches.map(b => {
          const directUrl = `${window.location.origin}${window.location.pathname}?branch=${b.code}`;
          return (
            <div key={b.code} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center shadow">
              <div>
                <h3 className="font-bold text-sm">{b.name} ({b.country})</h3>
                <p className="text-xs text-gray-400">Login: {b.username}</p>
                <div className="mt-2 bg-gray-900 px-3 py-1 rounded text-xs text-blue-400 select-all font-mono">{directUrl}</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => navigator.clipboard.writeText(directUrl)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-xs font-medium">Copy URL</button>
                <button onClick={() => handleDeleteBranch(b.code)} className="bg-red-900/40 text-red-400 hover:bg-red-900/60 px-3 py-1.5 rounded text-xs font-medium">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
