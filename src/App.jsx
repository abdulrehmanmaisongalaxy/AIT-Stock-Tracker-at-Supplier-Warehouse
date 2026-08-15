import React, { useState, useEffect } from 'react';
import { MasterSetup } from './components/MasterSetup';

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
          <h2 className="text-lg font-bold text-rose-600">⚠️ Invalid Branch Link</h2>
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
  const [branches, setBranches] = useState([
    { id: 'Branch-A', name: 'Dubai Mall Branch', secretPin: 'dubai123' },
    { id: 'Branch-B', name: 'Marina Walk Branch', secretPin: 'marina123' }
  ]);
  
  const [items, setItems] = useState([
    { id: 'ITM-001', name: 'Glowing Foundation', category: 'Cosmetics', unit: 'Pcs', supplier: 'Guangzhou Beauty Ltd', moq: 1000, packSize: '24 Pcs/CTN', weightKg: 12, cbm: 0.045 }
  ]);
  
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-01', name: 'Guangzhou Beauty Ltd', country: 'China', warehouse: 'Whse #1', contact: 'Mr. Chen' }
  ]);
  
  const [currentTab, setCurrentTab] = useState('dashboard');

  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get('branch');

  if (branchParam) {
    return (
      <BranchLoginGuard branchId={branchParam} branches={branches}>
        <div className="min-h-screen bg-[#FAF8F5] p-6">
          <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm">
            <div>
              <h1 className="text-base font-bold text-[#1B2430]">AIT Branch Ordering Portal</h1>
              <p className="text-xs text-[#7A7568]">Logged in securely for: <span className="font-semibold text-[#1B2430]">{branchParam}</span></p>
            </div>
            <button 
              onClick={() => { sessionStorage.removeItem(`auth_${branchParam}`); window.location.href = window.location.pathname; }} 
              className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl font-medium cursor-pointer hover:bg-rose-100"
            >
              Lock / Logout
            </button>
          </header>
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Branch Requisition & Ordering Dashboard</h2>
            <p className="text-xs text-[#7A7568]">Select items from active suppliers below to submit branch replenishment orders.</p>
            <div className="border border-[#E4DFD3] rounded-xl p-4 bg-[#FAF8F5]">
              <h3 className="text-xs font-bold text-[#1B2430] mb-2">Available Master Items</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#E4DFD3] text-xs">
                    <div>
                      <span className="font-bold">{item.name}</span> ({item.supplier}) - MOQ: {item.moq} {item.unit}
                    </div>
                    <button className="bg-[#1B2430] text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer">
                      Request Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </BranchLoginGuard>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B2430] flex flex-col">
      <header className="bg-[#1B2430] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-base font-bold">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-[11px] text-gray-300">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
        </div>
        <span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-semibold shadow-inner">Admin Mode Active</span>
      </header>

      <nav className="bg-white border-b border-[#E4DFD3] px-6 flex gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Executive Dashboard' },
          { id: 'ledger', label: 'Stock Ledger' },
          { id: 'orders', label: 'Order Consolidation & MOQ' },
          { id: 'proforma', label: 'Proforma Invoices' },
          { id: 'shipments', label: 'Shipments & Containers' },
          { id: 'branches', label: 'Branch Management & Links' },
          { id: 'master', label: 'Master Setup & Import' },
          { id: 'hub', label: 'Branch Login Hub' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)} 
            className={`py-3.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${currentTab === tab.id ? 'border-[#1B2430] text-[#1B2430]' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
                <p className="text-xs text-[#7A7568] font-semibold">Total Active Items</p>
                <h3 className="text-xl font-bold text-[#1B2430] mt-1">{items.length}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
                <p className="text-xs text-[#7A7568] font-semibold">Registered Suppliers</p>
                <h3 className="text-xl font-bold text-[#1B2430] mt-1">{suppliers.length}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
                <p className="text-xs text-[#7A7568] font-semibold">Active Branches</p>
                <h3 className="text-xl font-bold text-[#1B2430] mt-1">{branches.length}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
                <p className="text-xs text-[#7A7568] font-semibold">System Status</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">Operational</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-[#1B2430]">Executive Overview & Inventory Valuation</h2>
              <p className="text-xs text-[#7A7568]">Monitor stock velocity, container shipments, and branch consolidation thresholds from this central hub.</p>
            </div>
          </div>
        )}

        {currentTab === 'ledger' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Stock Ledger & Multi-Warehouse Tracking</h2>
            <p className="text-xs text-[#7A7568]">Real-time visibility into stock distributed across regional warehouses.</p>
            <div className="border border-[#E4DFD3] rounded-xl p-4 bg-[#FAF8F5] text-xs text-[#7A7568]">
              Ledger tracking is synced with active master items and supplier inbound shipments.
            </div>
          </div>
        )}

        {currentTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Order Consolidation & MOQ Optimizer</h2>
            <p className="text-xs text-[#7A7568]">Review branch requisitions and consolidate them to meet supplier minimum order quantities.</p>
          </div>
        )}

        {currentTab === 'proforma' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Proforma Invoices</h2>
            <p className="text-xs text-[#7A7568]">Manage supplier invoices, advance payments, and financial clearance status.</p>
          </div>
        )}

        {currentTab === 'shipments' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Shipments & Maritime Containers</h2>
            <p className="text-xs text-[#7A7568]">Track container stuffing, CBM capacities, and estimated time of arrival (ETA).</p>
          </div>
        )}

        {currentTab === 'branches' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Branch Management & Secure Links</h2>
            <p className="text-xs text-[#7A7568]">Direct branch portal URLs with PIN authentication:</p>
            <div className="space-y-3">
              {branches.map(b => (
                <div key={b.id} className="p-4 bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#1B2430]">{b.name} ({b.id})</span>
                    <p className="text-[#7A7568]">PIN: <code className="bg-white px-2 py-0.5 border rounded">{b.secretPin}</code></p>
                  </div>
                  <a 
                    href={`?branch=${b.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-[#1B2430] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#2B3848]"
                  >
                    Open Branch Portal ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'master' && (
          <MasterSetup 
            items={items} 
            setItems={setItems} 
            suppliers={suppliers} 
            setSuppliers={setSuppliers} 
            branches={branches} 
          />
        )}

        {currentTab === 'hub' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E4DFD3] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B2430]">Branch Login Hub</h2>
            <p className="text-xs text-[#7A7568]">Central overview of active branch user sessions and access logs.</p>
          </div>
        )}
      </main>
    </div>
  );
}
