import React, { useState, useEffect } from 'react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import StockLedger from './components/StockLedger';
import BranchHandling from './components/BranchHandling';
import BranchPortal from './components/BranchPortal';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import Shipments from './components/Shipments';
import MasterSetup from './components/MasterSetup';

export default function App() {
  // Global States (with localStorage persistence)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBranch, setCurrentBranch] = useState('Admin');
  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('ait_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('ait_requisitions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ait_inventory', JSON.stringify(inventoryItems));
    localStorage.setItem('ait_requisitions', JSON.stringify(requisitions));
  }, [inventoryItems, requisitions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar / Branch Switcher */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide text-cyan-400">AIT Inventory Portal</h1>
        <BranchHandling 
          currentBranch={currentBranch} 
          setCurrentBranch={setCurrentBranch} 
        />
      </header>

      {/* Navigation Tabs */}
      <nav className="flex bg-slate-900/50 border-b border-slate-800 px-4 overflow-x-auto">
        {currentBranch === 'Admin' ? (
          <>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>Executive Dashboard</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'ledger' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>Stock Ledger</button>
            <button onClick={() => setActiveTab('consolidation')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'consolidation' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>MOQ & Consolidation</button>
            <button onClick={() => setActiveTab('pi')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'pi' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>Proforma Invoices</button>
            <button onClick={() => setActiveTab('shipments')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'shipments' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>Shipments</button>
            <button onClick={() => setActiveTab('setup')} className={`px-4 py-3 border-b-2 font-medium text-sm ${activeTab === 'setup' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>Master Setup</button>
          </>
        ) : (
          <button className="px-4 py-3 border-b-2 border-cyan-500 text-cyan-400 font-medium text-sm">Branch Ordering Portal</button>
        )}
      </nav>

      {/* Main Content Area Routing */}
      <main className="flex-1 p-6 overflow-y-auto">
        {currentBranch !== 'IsolatedBranch' && activeTab === 'dashboard' && currentBranch === 'Admin' && <ExecutiveDashboard items={inventoryItems} />}
        {currentBranch !== 'IsolatedBranch' && activeTab === 'ledger' && currentBranch === 'Admin' && <StockLedger items={inventoryItems} setItems={setInventoryItems} />}
        {currentBranch !== 'IsolatedBranch' && activeTab === 'consolidation' && currentBranch === 'Admin' && <OrderConsolidation requisitions={requisitions} inventoryItems={inventoryItems} />}
        {currentBranch !== 'IsolatedBranch' && activeTab === 'pi' && currentBranch === 'Admin' && <ProformaInvoices />}
        {currentBranch !== 'IsolatedBranch' && activeTab === 'shipments' && currentBranch === 'Admin' && <Shipments />}
        {currentBranch !== 'IsolatedBranch' && activeTab === 'setup' && currentBranch === 'Admin' && <MasterSetup />}

        {/* Branch View Override */}
        {currentBranch !== 'Admin' && (
          <BranchPortal 
            branchName={currentBranch} 
            inventoryItems={inventoryItems} 
            onSubmittingOrder={(newReq) => setRequisitions([newReq, ...requisitions])} 
          />
        )}
      </main>
    </div>
  );
}
