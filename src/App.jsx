import React, { useState, useEffect } from 'react';
import MasterSetup from './components/MasterSetup';
import BranchHandling from './components/BranchHandling';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import StockLedger from './components/StockLedger';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import Shipments from './components/Shipments';
import BranchOrderingPortalView from './components/BranchPortal';

export default function AITPortal() {
  const [activeTab, setActiveTab] = useState('master');
  const [isAdminMode, setIsAdminMode] = useState(true);
  
  // Master Setup States
  const [items, setItems] = useState([
    { id: 'ITM-101', name: 'NMDC-008 - Naomi Black Hair Colorant 32ml', category: 'Hair Care', supplier: 'Ch-Yct', country: 'China', moq: 5000, weight: 22, cbm: 0.0501, packSize: 320, openingStock: 1200, unitPrice: 3.5 },
    { id: 'ITM-102', name: 'Nadeem - Diana Lotion 30ml', category: 'Face - Body Skincare', supplier: 'Gajali', country: 'India', moq: 5000, weight: 12.3, cbm: 0.0383, packSize: 240, openingStock: 800, unitPrice: 2.1 }
  ]);

  const [suppliers, setSuppliers] = useState([
    { name: 'Ch-Yct', country: 'China' },
    { name: 'Gajali', country: 'India' }
  ]);

  // Branch Management States
  const [branches, setBranches] = useState([
    { code: 'MTD-123', name: 'MG Kinshasa (DRC)', country: 'Congo', username: 'matadi', pass: 'pass123' },
    { code: 'PTN-245', name: 'Lubumbashi (DRC)', country: 'Congo', username: 'pointnore', pass: 'pass123' },
    { code: 'AJ-634', name: 'Abidjan (Ivory Coast)', country: 'Ivory Coast', username: 'Abidjan', pass: 'pass123' }
  ]);

  // Operational States
  const [requisitions, setRequisitions] = useState({}); // { branchCode: { itemId: qty } }
  const [shipments, setShipments] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);

  // New Item Form State
  const [newItem, setNewItem] = useState({ id: '', name: '', category: '', supplier: '', country: 'China', moq: 5000, weight: 1, cbm: 0.01, packSize: '24 Pcs/CTN', openingStock: 0, unitPrice: 0.0 });
  const [newBranch, setNewBranch] = useState({ code: '', name: '', country: '', username: '', pass: 'pass123' });

  // Filters for Stock Ledger & PI
  const [ledgerSupplierFilter, setLedgerSupplierFilter] = useState('ALL');
  const [ledgerCountryFilter, setLedgerCountryFilter] = useState('ALL');
  const [piSupplierFilter, setPiSupplierFilter] = useState('ALL');

  // Check URL parameters for Branch View (e.g., ?branch=AJ-634)
  const [currentBranch, setCurrentBranch] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branch');
    if (branchParam) {
      const found = branches.find(b => b.code === branchParam);
      if (found) {
        setCurrentBranch(found);
        setIsAdminMode(false);
      }
    }
  }, [branches]);

  // Handlers
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.id || !newItem.name) return;
    setItems([...items, newItem]);
    setNewItem({ id: '', name: '', category: '', supplier: '', country: 'China', moq: 5000, weight: 1, cbm: 0.01, packSize: '24 Pcs/CTN', openingStock: 0, unitPrice: 0.0 });
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranch.code || !newBranch.name) return;
    setBranches([...branches, newBranch]);
    setNewBranch({ code: '', name: '', country: '', username: '', pass: 'pass123' });
  };

  const handleDeleteBranch = (code) => {
    setBranches(branches.filter(b => b.code !== code));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-wide">AIT Supplier & Inventory Control Portal</h1>
          <p className="text-xs text-gray-400">Dubai HQ & Multi-Warehouse Stock Tracking Platform</p>
        </div>
        <div className="flex items-center space-x-4">
          {currentBranch ? (
            <span className="bg-blue-600 px-3 py-1 rounded text-sm font-medium">Branch Mode: {currentBranch.name}</span>
          ) : (
            <span className="bg-emerald-600 px-3 py-1 rounded text-sm font-medium">Admin Mode Active</span>
          )}
        </div>
      </header>

      {/* Navigation Bar (Visible only in Admin Mode) */}
      {isAdminMode && (
        <nav className="bg-gray-800/60 border-b border-gray-700 px-6 flex space-x-6 overflow-x-auto text-sm">
          {[
            { id: 'master', label: 'Master Setup & Import' },
            { id: 'branches', label: 'Branch Management & Links' },
            { id: 'dashboard', label: 'Executive Dashboard' },
            { id: 'ledger', label: 'Stock Ledger' },
            { id: 'consolidation', label: 'Order Consolidation & MOQ' },
            { id: 'pi', label: 'Proforma Invoices' },
            { id: 'shipments', label: 'Shipments & Containers' },
            { id: 'ordering', label: 'Branch Ordering Portal' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content Render View */}
      <main className="p-6">
        {isAdminMode ? (
          <>
            {activeTab === 'master' && (
              <MasterSetupTab 
                items={items} 
                newItem={newItem} 
                setNewItem={setNewItem} 
                handleAddItem={handleAddItem} 
                handleDeleteItem={handleDeleteItem} 
                suppliers={suppliers} 
              />
            )}
            {activeTab === 'branches' && (
              <BranchManagementTab 
                branches={branches} 
                newBranch={newBranch} 
                setNewBranch={setNewBranch} 
                handleAddBranch={handleAddBranch} 
                handleDeleteBranch={handleDeleteBranch} 
              />
            )}
            {activeTab === 'dashboard' && <ExecutiveDashboardTab items={items} requisitions={requisitions} />}
            {activeTab === 'ledger' && (
              <StockLedgerTab 
                items={items} 
                setItems={setItems} 
                requisitions={requisitions} 
                ledgerSupplierFilter={ledgerSupplierFilter} 
                setLedgerSupplierFilter={setLedgerSupplierFilter}
                ledgerCountryFilter={ledgerCountryFilter}
                setLedgerCountryFilter={setLedgerCountryFilter}
              />
            )}
            {activeTab === 'consolidation' && (
              <OrderConsolidationTab 
                items={items} 
                requisitions={requisitions} 
                setProformaInvoices={setProformaInvoices} 
              />
            )}
            {activeTab === 'pi' && (
              <ProformaInvoicesTab 
                proformaInvoices={proformaInvoices} 
                piSupplierFilter={piSupplierFilter} 
                setPiSupplierFilter={setPiSupplierFilter} 
              />
            )}
            {activeTab === 'shipments' && <ShipmentsTab shipments={shipments} setShipments={setShipments} />}
            {activeTab === 'ordering' && (
              <BranchOrderingPortalView 
                items={items} 
                branches={branches} 
                requisitions={requisitions} 
                setRequisitions={setRequisitions} 
              />
            )}
          </>
        ) : (
          <BranchOrderingPortalView 
            items={items} 
            branches={[currentBranch]} 
            requisitions={requisitions} 
            setRequisitions={setRequisitions} 
            lockedBranch={currentBranch} 
          />
        )}
      </main>
    </div>
  );
}
