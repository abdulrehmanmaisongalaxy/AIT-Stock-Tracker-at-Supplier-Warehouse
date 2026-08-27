import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MasterSetup from './components/MasterSetup';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import StockLedger from './components/StockLedger';
import ShipmentsContainers from './components/ShipmentsContainers';
import BranchPortal from './components/BranchPortal';

export default function App() {
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

  const [exchangeRates, setExchangeRates] = useState(() => {
    const saved = localStorage.getItem('ait_exchange_rates');
    return saved ? JSON.parse(saved) : {};
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('ait_branches');
    return saved ? JSON.parse(saved) : [
      { id: 'br-1', name: 'MATADI', location: 'Kinshasa', country: 'DRC', email: 'matadi@ait.com', password: 'password123', allowedItems: ['NAHB-060', 'NMRO-083'] }
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
  const [branchSession, setBranchSession] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const branchIdParam = params.get('branch');
    if (branchIdParam) {
      const foundBranch = branches.find(b => String(b.id) === String(branchIdParam));
      if (foundBranch) setBranchSession(foundBranch);
    }
  }, [branches]);

  useEffect(() => { localStorage.setItem('ait_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('ait_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('ait_exchange_rates', JSON.stringify(exchangeRates)); }, [exchangeRates]);
  useEffect(() => { localStorage.setItem('ait_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('ait_requisitions', JSON.stringify(requisitions)); }, [requisitions]);
  useEffect(() => { localStorage.setItem('ait_pis', JSON.stringify(proformaInvoices)); }, [proformaInvoices]);
  useEffect(() => { localStorage.setItem('ait_shipments', JSON.stringify(shipments)); }, [shipments]);
  useEffect(() => { localStorage.setItem('ait_ledger', JSON.stringify(stockLedger)); }, [stockLedger]);

  if (branchSession) {
    return (
      <BranchPortal 
        branch={branchSession} 
        branches={branches}
        setBranches={setBranches}
        items={items}
        requisitions={requisitions}
        isManagementMode={false}
        onLogout={() => { 
          setBranchSession(null); 
          window.history.replaceState({}, document.title, window.location.pathname); 
        }}
        onSubmitRequisition={(newReq) => {
          setRequisitions(prev => [newReq, ...prev]);
          alert('Order Requisition successfully submitted to Dubai HQ!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg relative z-20">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-emerald-400">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-xs text-slate-400">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">Admin Mode Active</span>
        </div>
      </header>

      <nav className="bg-slate-900 border-b border-slate-800 px-6 flex gap-2 overflow-x-auto py-3 shadow-md relative z-10">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto mt-2">
        {activeTab === 'dashboard' && <Dashboard items={items} suppliers={suppliers} branches={branches} requisitions={requisitions} proformaInvoices={proformaInvoices} shipments={shipments} stockLedger={stockLedger} />}
        {activeTab === 'master' && <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} branches={branches} setBranches={setBranches} exchangeRates={exchangeRates} setExchangeRates={setExchangeRates} />}
        
        {/* Order Consolidation correctly receives requisitions, items, suppliers, and proforma setter */}
        {activeTab === 'consolidation' && (
          <OrderConsolidation 
            requisitions={requisitions} 
            setRequisitions={setRequisitions} 
            items={items} 
            suppliers={suppliers} 
            setProformaInvoices={setProformaInvoices} 
          />
        )}

        {activeTab === 'pis' && <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} suppliers={suppliers} items={items} stockLedger={stockLedger} setStockLedger={setStockLedger} />}
        {activeTab === 'stock' && <StockLedger stockledger={stockLedger} suppliers={suppliers} setItems={setItems} />}
        {activeTab === 'shipments' && <ShipmentsContainers shipments={shipments} setShipments={setShipments} branches={branches} items={items} stockLedger={stockLedger} />}
        {activeTab === 'branches' && <BranchPortal branches={branches} setBranches={setBranches} items={items} requisitions={requisitions} onSubmitRequisition={(newReq) => setRequisitions(prev => [newReq, ...prev])} isManagementMode={true} />}
      </main>
    </div>
  );
}
