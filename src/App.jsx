import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MasterSetup from './components/MasterSetup';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import StockLedger from './components/StockLedger';
import ShipmentsContainers from './components/ShipmentsContainers';
import BranchPortal from './components/BranchPortal';

export default function App() {
  // Initial / Default State setup
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ait_items');
    return saved ? JSON.parse(saved) : [
      { code: 'NAHB-060', name: 'Naomi Mouth Wash 70ml-Fresh Burst', packSize: 48, weight: 4.4, cbm: 0.0122, supplier: 'Global Chem Supplier', country: 'China', price: 5, currency: 'YUAN', moq: 5000, stock: 0 },
      { code: 'NMRO-083', name: 'Naomi Skin Cream 50gm-Papaya', packSize: 200, weight: 14.9, cbm: 0.0506, supplier: 'Cosmetic Trade India', country: 'India', price: 5, currency: 'INR', moq: 5000, stock: 0 }
    ];
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('ait_suppliers');
    return saved ? JSON.parse(saved) : [
      { code: 'SUP-001', name: 'Global Chem Supplier', warehouseNo: 'WH-CN-01', country: 'China', currency: 'YUAN' },
      { code: 'SUP-002', name: 'Cosmetic Trade India', warehouseNo: 'WH-IN-02', country: 'India', currency: 'INR' }
    ];
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('ait_branches');
    return saved ? JSON.parse(saved) : [
      { id: 'br-1', name: 'MG Abidjan', location: 'Abidjan', country: 'Ivory Coast', email: 'inventory@ayulintl.com', password: 'password123', allowedItems: ['NAHB-060', 'NMRO-083'] }
    ];
  });

  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('ait_requisitions');
    return saved ? JSON.parse(saved) : [];
  });

  const [proformaInvoices, setProformaInvoices] = useState(() => {
    const saved = localStorage.getItem('ait_pis');
    return saved ? JSON.parse(saved) : [];
  });

  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('ait_shipments');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockLedger, setStockLedger] = useState(() => {
    const saved = localStorage.getItem('ait_ledger');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [branchSession, setBranchSession] = useState(null); // Active logged-in branch if via link

  // Check URL query parameters for direct branch login token (e.g., ?branch=br-1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const branchIdParam = params.get('branch');
    if (branchIdParam) {
      const foundBranch = branches.find(b => b.id === branchIdParam);
      if (foundBranch) {
        setBranchSession(foundBranch);
      }
    }
  }, [branches]);

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('ait_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('ait_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('ait_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('ait_requisitions', JSON.stringify(requisitions)); }, [requisitions]);
  useEffect(() => { localStorage.setItem('ait_pis', JSON.stringify(proformaInvoices)); }, [proformaInvoices]);
  useEffect(() => { localStorage.setItem('ait_shipments', JSON.stringify(shipments)); }, [shipments]);
  useEffect(() => { localStorage.setItem('ait_ledger', JSON.stringify(stockLedger)); }, [stockLedger]);

  // If a branch user logged in via link/credentials, show Branch Portal exclusively
  if (branchSession) {
    return (
      <BranchPortal 
        branch={branchSession} 
        items={items} 
        onLogout={() => { setBranchSession(null); window.history.replaceState({}, document.title, window.location.pathname); }}
        onSubmitRequisition={(newReq) => {
          setRequisitions(prev => [newReq, ...prev]);
          alert('Order Requisition submitted successfully to Dubai HQ!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm relative z-20">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-emerald-700">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-xs text-slate-500">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-semibold">Admin Mode Active</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-6 flex gap-2 overflow-x-auto py-3 shadow-sm relative z-10">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'master', label: 'Master Setup & Import' },
          { id: 'consolidation', label: 'Order Consolidation & MOQ' },
          { id: 'pis', label: 'Proforma Invoices' },
          { id: 'stock', label: 'Stock Ledger' },
          { id: 'shipments', label: 'Shipments & Containers' },
          { id: 'branches', label: 'Branch Management & Links' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto mt-2">
        {activeTab === 'dashboard' && <Dashboard items={items} suppliers={suppliers} branches={branches} requisitions={requisitions} proformaInvoices={proformaInvoices} shipments={shipments} stockLedger={stockLedger} />}
        {activeTab === 'master' && <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} branches={branches} setBranches={setBranches} />}
        {activeTab === 'consolidation' && <OrderConsolidation requisitions={requisitions} setRequisitions={setRequisitions} items={items} suppliers={suppliers} setProformaInvoices={setProformaInvoices} />}
        {activeTab === 'pis' && <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} suppliers={suppliers} items={items} stockLedger={stockLedger} setStockLedger={setStockLedger} />}
        {activeTab === 'stock' && <StockLedger stockLedger={stockLedger} suppliers={suppliers} setItems={setItems} />}
        {activeTab === 'shipments' && <ShipmentsContainers shipments={shipments} setShipments={setShipments} branches={branches} items={items} stockLedger={stockLedger} />}
        {activeTab === 'branches' && <BranchPortal branches={branches} setBranches={setBranches} items={items} isManagementMode={true} />}
      </main>
    </div>
  );
}
