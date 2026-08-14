import React from 'react';

export default function BranchHandling({ currentBranch, setCurrentBranch }) {
  const branches = ['Admin', 'Branch A', 'Branch B', 'Branch C'];

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-slate-400">Current View:</span>
      <select 
        value={currentBranch} 
        onChange={(e) => setCurrentBranch(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-cyan-400 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-cyan-500"
      >
        {branches.map((b) => (
          <option key={b} value={b}>{b === 'Admin' ? 'Admin / Headquarters' : b}</option>
        ))}
      </select>
    </div>
  );
}
