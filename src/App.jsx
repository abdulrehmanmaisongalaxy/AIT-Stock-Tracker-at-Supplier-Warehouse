import React, { useState, useEffect } from 'react';
import { MasterSetup } from './components/MasterSetup';
import { BranchPortalTab } from './components/BranchPortal';
import { BranchHandling } from './components/BranchHandling';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { OrderConsolidation } from './components/OrderConsolidation';
import { ProformaInvoices } from './components/ProformaInvoices';
import { Shipments } from './components/Shipments';
import { StockLedger } from './components/StockLedger';

export default function App() {
  // Master States
  const [branches, setBranches] = useState([
    { id: 'Branch-A', name: 'AIT Nairobi Branch', country: 'Kenya', user: 'nairobi_admin', pass: 'pass123' },
    { id: 'Branch-B', name: 'AIT Lagos Branch', country: 'Nigeria', user: 'lagos_admin', pass: 'pass123' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-01', name: 'Saigon Manufacturing Ltd', country: 'Vietnam', warehouse: 'Ho Chi Minh Hub', contact: 'Mr. Nguyen' },
    { id: 'SUP-02', name: 'Guangzhou Cosmetics Co.', country: 'China', warehouse: 'Baiyun Warehouse', contact: 'Ms. Li' }
  ]);

  const [items, setItems] = useState([
    { id: 'ITM-101', name: 'Glowing Foundation SPF30', category: 'Cosmetics', unit: 'Pcs', supplier: 'Guangzhou Cosmetics Co.', moq: 1000, packSize: '24 Pcs/CTN', weightKg: 12, cbm: 0.045, allowedBranches: ['Branch-A', 'Branch-B'] },
    { id: 'ITM-102', name: 'Matte Liquid Lipstick Set', category: 'Cosmetics', unit: 'Pcs', supplier: 'Saigon Manufacturing Ltd', moq: 800, packSize: '50 Pcs/CTN', weightKg: 10, cbm: 0.035, allowedBranches: ['Branch-A'] }
  ]);

  const [requisitions, setRequisitions] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([
    { id: 'PI-2026-101', supplierId: 'SUP-02', date: '2026-08-01', status: 'In Production', items: [{ itemId: 'ITM-101', qty: 1200, unitPrice: 2.5 }] }
  ]);
  const [shipments, setShipments] = useState([]);

  const [currentTab, setActiveTab] = useState('dashboard');

  // Check URL parameters for standalone branch access (e.g. ?branch=Branch-A)
  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get('branch');

  // If accessed via a direct branch URL
  if (branchParam) {
    const targetBranch = branches.find(b => b.id === branchParam);
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-6">
        <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm">
          <div>
            <h1 className="text-base font-bold text-[#1B2430]">AIT Branch Ordering Portal</h1>
            <p className="text-xs text-[#7A7568]">Logged in securely as: <span className="font-semibold text-[#1B2430]">{targetBranch?.name || branchParam}</span></p>
          </div>
          <a href={window.location.pathname} className="text-xs bg-gray-100 text-[#1B2430] px-3 py-1.5 rounded-xl font-medium">
            Switch Account / Logout
          </a>
        </header>
        <BranchPortalTab 
          preselectedBranch={targetBranch} 
          branches={branches} 
          items={items} 
          requisitions={requisitions} 
          setRequisitions={setRequisitions} 
          isStandalone={true} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B2430] flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-[#1B2430] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-base font-bold">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-[11px] text-gray-300">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
        </div>
        <span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-semibold shadow-inner">Admin Mode Active</span>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-[#E4DFD3] px-6 flex gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Executive Dashboard' },
          { id: 'ledger', label: 'Stock Ledger' },
          { id: 'orders', label: 'Order Consolidation & MOQ' },
          { id: 'proforma', label: 'Proforma Invoices' },
          { id: 'shipments', label: 'Shipments & Containers' },
          { id: 'branch-portal', label: 'Branch Ordering Portal' },
          { id: 'branches', label: 'Branch Management & Links' },
          { id: 'master', label: 'Master Setup & Import' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`py-3.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${currentTab === tab.id ? 'border-[#1B2430] text-[#1B2430]' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentTab === 'dashboard' && (
          <ExecutiveDashboard 
            items={items} 
            suppliers={suppliers} 
            requisitions={requisitions} 
            proformaInvoices={proformaInvoices} 
            shipments={shipments} 
          />
        )}
        {currentTab === 'ledger' && (
          <StockLedger 
            items={items} 
            suppliers={suppliers} 
            proformaInvoices={proformaInvoices} 
            shipments={shipments} 
          />
        )}
        {currentTab === 'orders' && (
          <OrderConsolidation 
            items={items} 
            suppliers={suppliers} 
            requisitions={requisitions} 
            setProformaInvoices={setProformaInvoices} 
            setRequisitions={setRequisitions} 
          />
        )}
        {currentTab === 'proforma' && (
          <ProformaInvoices 
            proformaInvoices={proformaInvoices} 
            setProformaInvoices={setProformaInvoices} 
            suppliers={suppliers} 
            items={items} 
          />
        )}
        {currentTab === 'shipments' && (
          <Shipments 
            shipments={shipments} 
            setShipments={setShipments} 
            branches={branches} 
            items={items} 
            suppliers={suppliers} 
            proformaInvoices={proformaInvoices} 
          />
        )}
        {currentTab === 'branch-portal' && (
          <BranchPortalTab 
            branches={branches} 
            items={items} 
            requisitions={requisitions} 
            setRequisitions={setRequisitions} 
            isStandalone={false} 
          />
        )}
        {currentTab === 'branches' && (
          <BranchHandling 
            branches={branches} 
            setBranches={setBranches} 
          />
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
      </main>
    </div>
  );
}
