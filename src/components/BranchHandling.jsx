import React, { useState } from 'react';

export default function BranchHandling() {
  const [branches, setBranches] = useState([
    { id: 1, name: 'MG Kinshasa', location: 'Kinshasa, DRC' }
  ]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Restricted items filtering state
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [selectAll, setSelectAll] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setIsAuthenticated(true);
    } else {
      alert('Please enter valid credentials.');
    }
  };

  if (selectedBranch && !isAuthenticated) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded shadow mt-10">
        <h2 className="text-xl font-bold mb-4">Branch Login: {selectedBranch.name}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold">Login to Requisition Portal</button>
          <button type="button" onClick={() => setSelectedBranch(null)} className="w-full bg-gray-300 text-gray-700 p-2 rounded mt-2">Cancel / Back</button>
        </form>
      </div>
    );
  }

  if (selectedBranch && isAuthenticated) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Requisition Portal for {selectedBranch.name} ({selectedBranch.location})</h2>
          <button onClick={() => { setSelectedBranch(null); setIsAuthenticated(false); }} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Logout</button>
        </div>
        <p className="text-green-600 font-medium">Successfully authenticated. Branch order form ready.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Branch Management & Links</h2>
      <table className="w-full border-collapse border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Branch Name</th>
            <th className="border p-2 text-left">Location</th>
            <th className="border p-2 text-left">Action Link</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(b => (
            <tr key={b.id}>
              <td className="border p-2 font-medium">{b.name}</td>
              <td className="border p-2">{b.location}</td>
              <td className="border p-2">
                <button onClick={() => setSelectedBranch(b)} className="text-blue-600 underline font-medium">Open Portal (Login Gate)</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Restricted Item Configuration</h3>
        <div className="flex gap-4 mb-4 items-center">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Supplier Filter:</label>
            <select className="border p-2 rounded" value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
              <option value="ALL">All Suppliers</option>
              <option value="Apex Corp">Apex Corp</option>
              <option value="Global Parts">Global Parts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Country Filter:</label>
            <select className="border p-2 rounded" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
              <option value="ALL">All Countries</option>
              <option value="China">China</option>
              <option value="India">India</option>
            </select>
          </div>
          <div className="flex items-end pt-5">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} />
              <span className="text-sm font-semibold">Select All Filtered Items</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
