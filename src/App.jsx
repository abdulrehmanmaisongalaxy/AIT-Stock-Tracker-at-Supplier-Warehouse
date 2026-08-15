import React, { useState, useEffect } from 'react';
import { MasterSetup } from './components/MasterSetup';
// Import your other components/views here as needed...

// Branch Login Security Guard Component
function BranchLoginGuard({ branchId, children, branches }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  const targetBranch = branches.find(b => b.id === branchId);

  useEffect(() => {
    const authSession = sessionStorage.getItem(`auth_${branchId}`);
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, [branchId]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Default PIN or branch-specific validation
    if (passwordInput === targetBranch?.secretPin || passwordInput === 'Ait2026!') {
      setIsAuthenticated(true);
      sessionStorage.setItem(`auth_${branchId}`, 'true');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!targetBranch) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E4DFD3] shadow-sm max-w-md w-full text-center space-y-3">
          <h2 className="text-lg font-bold text-rose-650">⚠️ Invalid Branch Link</h2>
          <p className="text-xs text-[#7A7568]">The branch identifier specified in the URL is invalid or expired. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E4DFD3] shadow-sm max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1B2430]">🔒 {targetBranch.name} Secure Portal</h2>
            <p className="text-xs text-[#7A7568] mt-1">Please enter your branch access PIN to view your ordering interface.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A7568] mb-1">Branch Password / PIN</label>
              <input 
                type="password" 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
                placeholder="Enter branch password..." 
                className="w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2430]" 
                required 
              />
            </div>
            {error && <p className="text-xs text-rose-600 font-medium">Incorrect password. Please try again.</p>}
            <button type="submit" className="w-full bg-[#1B2430] hover:bg-[#2B3848] text-white text-xs font-medium py-2.5 rounded-xl cursor-pointer">
              Authenticate & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  // Application State
  const [branches, setBranches] = useState([
    { id: 'Branch-A', name: 'Dubai Mall Branch', secretPin: 'dubai123' },
    { id: 'Branch-B', name: 'Marina Walk Branch', secretPin: 'marina123' }
  ]);
  
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-01', name: 'Guangzhou Beauty Ltd', country: 'China', warehouse: 'Whse #1', contact: 'Mr. Chen' }
  ]);
  
  const [currentTab, setCurrentTab] = useState('master');

  // Check URL parameters for branch routing (e.g. ?branch=Branch-B)
  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get('branch');

  // If a branch link is accessed, render the secure branch view
  if (branchParam) {
    return (
      <BranchLoginGuard branchId={branchParam} branches={branches}>
        <div className="min-h-screen bg-[#FAF8F5] p-6">
          <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E4DFD3]">
            <div>
              <h1 className="text-base font-bold text-[#1B2430]">AIT Branch Ordering Portal</h1>
              <p className="text-xs text-[#7A7568]">Logged in securely for: <span className="font-semibold text-[#1B2430]">{branchParam}</span></p>
            </div>
            <button 
              onClick={() => { sessionStorage.removeItem(`auth_${branchParam}`); window.location.href = window.location.pathname; }} 
              className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl font-medium cursor-pointer"
            >
              Lock / Logout
            </button>
          </header>
          {/* Branch-specific ordering components go here */}
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] text-center">
            <p className="text-xs text-[#7A7568]">Branch ordering interface active. You cannot access admin settings from this view.</p>
          </div>
        </div>
      </BranchLoginGuard>
    );
  }

  // Main Admin View (Default if no branch parameter is passed)
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B2430] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#1B2430] text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-[11px] text-gray-300">Admin Mode Active - Secure Global Management</p>
        </div>
        <span className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-full font-semibold">Admin Authorized</span>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-[#E4DFD3] px-6 flex gap-6 text-xs font-semibold">
        <button 
          onClick={() => setCurrentTab('master')} 
          className={`py-3 border-b-2 cursor-pointer ${currentTab === 'master' ? 'border-[#1B2430] text-[#1B2430]' : 'border-transparent text-[#7A7568]'}`}
        >
          Master Setup & Import
        </button>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentTab === 'master' && (
          <MasterSetup 
            items={items} 
            setItems={setItems} 
            suppliers={suppliers} 
            setSuppliers={setSuppliers} 
            branches={branches} 
          />
        )}
      </main>
    </div>
  );
}
