import React, { useState, useEffect } from 'react';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { StockLedger } from './components/StockLedger';
import { BranchHandling } from './components/BranchHandling';
import { BranchPortalTab } from './components/BranchPortal';
import { OrderConsolidation } from './components/OrderConsolidation';
import { ProformaInvoices } from './components/ProformaInvoices';
import { Shipments } from './components/Shipments';
import { MasterSetup } from './components/MasterSetup';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check URL query parameters for standalone branch link sharing (e.g. ?branch=Branch-A)
  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get('branch');

  // --- Master State Setup with Rich Default Attributes ---
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ait_items');
    return saved ? JSON.parse(saved) : [
      { id: 'ITM-001', name: 'Matte Liquid Lipstick Set', category: 'Cosmetics', unit: 'Pcs', supplier: 'Guangzhou Beauty Ltd', moq: 1200, packSize: '24 Pcs/CTN', weightKg: 12.5, cbm: 0.045, allowedBranches: ['Branch-A', 'Branch-B', 'Branch-C'] },
      { id: 'ITM-002', name: 'Hydrating Facial Sheet Mask', category: 'Skincare', unit: 'Pcs', supplier: 'Bangkok Glow Co', moq: 2000, packSize: '100 Pcs/CTN', weightKg: 15.0, cbm: 0.060, allowedBranches: ['Branch-A', 'Branch-B'] },
      { id: 'ITM-003', name: 'Vitamin C Brightening Serum', category: 'Skincare', unit: 'Pcs', supplier: 'Bangkok Glow Co', moq: 1000, packSize: '50 Pcs/CTN', weightKg: 10.0, cbm: 0.030, allowedBranches: ['Branch-A'] },
      { id: 'ITM-004', name: 'Waterproof Volume Mascara', category: 'Cosmetics', unit: 'Pcs', supplier: 'Guangzhou Beauty Ltd', moq: 1500, packSize: '120 Pcs/CTN', weightKg: 14.2, cbm: 0.050, allowedBranches: ['Branch-A', 'Branch-B', 'Branch-C'] },
      { id: 'ITM-005', name: 'Pressed Powder Compact', category: 'Cosmetics', unit: 'Pcs', supplier: 'Yiwu Cosmetics Direct', moq: 1000, packSize: '80 Pcs/CTN', weightKg: 11.0, cbm: 0.035, allowedBranches: ['Branch-B', 'Branch-C'] },
    ];
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('ait_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: 'SUP-01', name: 'Guangzhou Beauty Ltd', country: 'China', warehouse: 'Guangzhou Whse #1', contact: 'Mr. Chen' },
      { id: 'SUP-02', name: 'Bangkok Glow Co', country: 'Thailand', warehouse: 'Bangkok Hub West', contact: 'Ms. Somchai' },
      { id: 'SUP-03', name: 'Yiwu Cosmetics Direct', country: 'China', warehouse: 'Yiwu Cargo Station', contact: 'Aiden Wang' },
    ];
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('ait_branches');
    return saved ? JSON.parse(saved) : [
      { id: 'Branch-A', name: 'AIT Nairobi Branch', country: 'Kenya', user: 'nairobi_admin', pass: 'nair123' },
      { id: 'Branch-B', name: 'AIT Lagos Branch', country: 'Nigeria', user: 'lagos_admin', pass: 'lag123' },
      { id: 'Branch-C', name: 'AIT Casablanca Branch', country: 'Morocco', user: 'casa_admin', pass: 'casa123' },
    ];
  });

  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('ait_requisitions');
    return saved ? JSON.parse(saved) : [
      { id: 'REQ-101', branchId: 'Branch-A', date: '2026-08-01', status: 'Pending', items: [{ itemId: 'ITM-001', qty: 1200 }, { itemId: 'ITM-002', qty: 2000 }] },
    ];
  });

  const [proformaInvoices, setProformaInvoices] = useState(() => {
    const saved = localStorage.getItem('ait_pis');
    return saved ? JSON.parse(saved) : [
      { id: 'PI-2026-001', supplierId: 'SUP-01', date: '2026-08-05', status: 'In Production', items: [{ itemId: 'ITM-001', qty: 1200, unitPrice: 2.5 }] },
    ];
  });

  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('ait_shipments');
    return saved ? JSON.parse(saved) : [
      { id: 'SHP-901', branchId: 'Branch-A', containerNo: 'CBMU-8823910', date: '2026-08-10', items: [{ itemId: 'ITM-001', qty: 300 }] },
    ];
  });

  useEffect(() => { localStorage.setItem('ait_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('ait_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('ait_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('ait_requisitions', JSON.stringify(requisitions)); }, [requisitions]);
  useEffect(() => { localStorage.setItem('ait_pis', JSON.stringify(proformaInvoices)); }, [proformaInvoices]);
  useEffect(() => { localStorage.setItem('ait_shipments', JSON.stringify(shipments)); }, [shipments]);

  // If a branch link was opened directly (e.g. site.onrender.com/?branch=Branch-A), show only that branch portal view
  if (branchParam) {
    const targetBranch = branches.find(b => b.id === branchParam) || branches[0];
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#1B2430] p-6">
        <BranchPortalTab preselectedBranch={targetBranch} items={items} requisitions={requisitions} setRequisitions={setRequisitions} isStandalone={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1B2430] flex flex-col font-sans">
      <header className="bg-[#1B2430] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#D97706] text-white p-2 rounded-xl font-bold tracking-wider text-sm">AIT</div>
          <div>
            <h1 className="font-bold text-base tracking-wide">AIT Supplier & Inventory Control Portal</h1>
            <p className="text-xs text-[#94A3B8]">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
          </div>
        </div>
        <div className="text-xs bg-[#2B3848] px-3 py-1.5 rounded-lg text-emerald-400 font-medium border border-emerald-500/30">
          Admin Mode Active
        </div>
      </header>

      <nav className="bg-white border-b border-[#E4DFD3] px-6 flex items-center gap-2 overflow-x-auto shadow-xs">
        {[
          { id: 'dashboard', label: 'Executive Dashboard' },
          { id: 'ledger', label: 'Stock Ledger' },
          { id: 'consolidation', label: 'Order Consolidation & MOQ' },
          { id: 'pis', label: 'Proforma Invoices' },
          { id: 'shipments', label: 'Shipments & Containers' },
          { id: 'branches', label: 'Branch Management & Links' },
          { id: 'master', label: 'Master Setup & Import' },
          { id: 'branchPortal', label: 'Branch Login Hub' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id ? 'border-[#1B2430] text-[#1B2430]' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <ExecutiveDashboard items={items} suppliers={suppliers} requisitions={requisitions} proformaInvoices={proformaInvoices} shipments={shipments} />}
        {activeTab === 'ledger' && <StockLedger items={items} suppliers={suppliers} proformaInvoices={proformaInvoices} shipments={shipments} />}
        {activeTab === 'consolidation' && <OrderConsolidation items={items} suppliers={suppliers} requisitions={requisitions} setProformaInvoices={setProformaInvoices} setRequisitions={setRequisitions} />}
        {activeTab === 'pis' && <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} suppliers={suppliers} items={items} />}
        {activeTab === 'shipments' && <Shipments shipments={shipments} setShipments={setShipments} branches={branches} items={items} suppliers={suppliers} proformaInvoices={proformaInvoices} />}
        {activeTab === 'branches' && <BranchHandling branches={branches} setBranches={setBranches} />}
        {activeTab === 'master' && <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} branches={branches} />}
        {activeTab === 'branchPortal' && <BranchPortalTab branches={branches} items={items} requisitions={requisitions} setRequisitions={setRequisitions} isStandalone={false} />}
      </main>
    </div>
  );
}
