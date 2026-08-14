import React, { useState, useEffect, useRef } from 'react';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { StockLedger } from './components/StockLedger';
import { BranchHandling } from './components/BranchHandling';
import { BranchPortalTab } from './components/BranchPortal';
import { MOQConsolidationTab } from './components/MOQConsolidationTab';
import { ProformaInvoices } from './components/ProformaInvoices';
import { Shipments } from './components/Shipments';
import { MasterSetupTab } from './components/MasterSetup';

// --- Utility Helpers ---
const uid = () => Math.random().toString(36).substring(2, 9);
const todayStr = () => new Date().toISOString().split('T')[0];
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const fmt = (n) => new Intl.NumberFormat().format(n || 0);

// --- Shared UI Style Constants ---
const card = "bg-white rounded-2xl border border-[#E4DFD3] shadow-sm";
const sectionLabel = "text-xs font-bold uppercase tracking-[0.08em] text-[#7A7568] mb-3";
const inputCls = "w-full bg-[#FAF8F5] border border-[#E4DFD3] rounded-xl px-3 py-2 text-sm text-[#1B2430] placeholder-[#9C9788] focus:outline-none focus:border-[#C98A3E]";
const btnPrimary = "bg-[#1B2430] hover:bg-[#2B3848] text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer";

function Stamp({ tone = "stock", children }) {
  const styles = {
    stock: "bg-emerald-50 text-emerald-700 border-emerald-200",
    low: "bg-amber-50 text-amber-700 border-amber-200",
    out: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[tone] || styles.stock}`}>
      {children}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-8 text-xs text-[#7A7568] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E4DFD3]">
      {text}
    </div>
  );
}

export default function App() {
  // --- Global Application State with LocalStorage Persistence ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ait_portal_data_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default Initial Mock Data
    return {
      suppliers: [
        { id: 's1', name: 'Guangzhou Trade Co.', country: 'China' },
        { id: 's2', name: 'Istanbul Fragrance Ltd.', country: 'Turkey' }
      ],
      branches: [
        { id: 'b1', name: 'Dubai Main Branch', country: 'UAE', code: 'DXB-01', allowedProductIds: ['p1', 'p2'] },
        { id: 'b2', name: 'Sharjah Showroom', country: 'UAE', code: 'SHJ-02', allowedProductIds: ['p3'] }
      ],
      products: [
        { id: 'p1', supplierId: 's1', name: 'Naomi Luxury Perfume 100ml', sku: 'NAOMI-100', packingSize: '24 pcs/ctn', weight: 0.45, cbm: 0.002, stock: 1200, unit: 'pcs', moq: 500 },
        { id: 'p2', supplierId: 's1', name: 'Naomi Body Mist 250ml', sku: 'NAOMI-MIST', packingSize: '48 pcs/ctn', weight: 0.30, cbm: 0.001, stock: 800, unit: 'pcs', moq: 300 },
        { id: 'p3', supplierId: 's2', name: 'T5 Essence Collection', sku: 'T5-ESC', packingSize: '12 pcs/ctn', weight: 0.60, cbm: 0.004, stock: 450, unit: 'pcs', moq: 200 }
      ],
      branchOrders: [],
      pis: [],
      shipments: []
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBranchLogin, setCurrentBranchLogin] = useState('Admin'); // 'Admin' or Branch ID
  const [toast, setToast] = useState(null);

  // --- Master Setup Form States ---
  const [sName, setSName] = useState('');
  const [sCountry, setSCountry] = useState('');
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  const [bName, setBName] = useState('');
  const [bCountry, setBCountry] = useState('');
  const [bCode, setBCode] = useState('');
  const [editingBranchId, setEditingBranchId] = useState(null);

  const [pSupplierId, setPSupplierId] = useState('');
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pPackingSize, setPPackingSize] = useState('');
  const [pWeight, setPWeight] = useState('');
  const [pCbm, setPCbm] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);

  const [selectedBranchForAssign, setSelectedBranchForAssign] = useState(data.branches[0]?.id || '');
  const [importType, setImportType] = useState('products');
  const fileInputRef = useRef(null);

  // --- Sync to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('ait_portal_data_v2', JSON.stringify(data));
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveData = (nextData, successMsg) => {
    setData(nextData);
    if (successMsg) showToast(successMsg);
  };

  // --- Master CRUD Handlers ---
  const handleSaveSupplier = () => {
    if (!sName.trim()) return showToast("Supplier name is required", "error");
    let updated;
    if (editingSupplierId) {
      updated = { ...data, suppliers: data.suppliers.map(s => s.id === editingSupplierId ? { ...s, name: sName, country: sCountry } : s) };
      setEditingSupplierId(null);
    } else {
      updated = { ...data, suppliers: [...data.suppliers, { id: uid(), name: sName, country: sCountry }] };
    }
    setSName(''); setSCountry('');
    saveData(updated, "Supplier saved successfully!");
  };

  const handleEditSupplier = (s) => { setEditingSupplierId(s.id); setSName(s.name); setSCountry(s.country || ''); };
  const handleDeleteSupplier = (id) => { saveData({ ...data, suppliers: data.suppliers.filter(s => s.id !== id) }, "Supplier deleted"); };

  const handleSaveBranch = () => {
    if (!bName.trim()) return showToast("Branch name is required", "error");
    let updated;
    if (editingBranchId) {
      updated = { ...data, branches: data.branches.map(b => b.id === editingBranchId ? { ...b, name: bName, country: bCountry, code: bCode } : b) };
      setEditingBranchId(null);
    } else {
      updated = { ...data, branches: [...data.branches, { id: uid(), name: bName, country: bCountry, code: bCode, allowedProductIds: [] }] };
    }
    setBName(''); setBCountry(''); setBCode('');
    saveData(updated, "Branch saved successfully!");
  };

  const handleEditBranch = (b) => { setEditingBranchId(b.id); setBName(b.name); setBCountry(b.country || ''); setBCode(b.code || ''); };
  const handleDeleteBranch = (id) => { saveData({ ...data, branches: data.branches.filter(b => b.id !== id) }, "Branch deleted"); };

  const handleSaveProduct = () => {
    if (!pName.trim()) return showToast("Item name is required", "error");
    let updated;
    const prodObj = {
      supplierId: pSupplierId,
      name: pName,
      sku: pSku,
      packingSize: pPackingSize,
      weight: num(pWeight),
      cbm: num(pCbm),
      stock: 0,
      unit: 'pcs',
      moq: 100
    };
    if (editingProductId) {
      updated = { ...data, products: data.products.map(p => p.id === editingProductId ? { ...p, ...prodObj } : p) };
      setEditingProductId(null);
    } else {
      updated = { ...data, products: [...data.products, { id: uid(), ...prodObj }] };
    }
    setPSupplierId(''); setPName(''); setPSku(''); setPPackingSize(''); setPWeight(''); setPCbm('');
    saveData(updated, "Master item saved successfully!");
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    setPSupplierId(p.supplierId || '');
    setPName(p.name);
    setPSku(p.sku || '');
    setPPackingSize(p.packingSize || '');
    setPWeight(p.weight || '');
    setPCbm(p.cbm || '');
  };

  const handleDeleteProduct = (id) => {
    saveData({ ...data, products: data.products.filter(p => p.id !== id) }, "Master item deleted");
  };

  const currentBranchForAssignObj = data.branches.find(b => b.id === selectedBranchForAssign);
  const toggleProductAssignment = (productId) => {
    if (!currentBranchForAssignObj) return;
    const currentList = currentBranchForAssignObj.allowedProductIds || [];
    const newList = currentList.includes(productId)
      ? currentList.filter(id => id !== productId)
      : [...currentList, productId];

    const updatedBranches = data.branches.map(b => b.id === selectedBranchForAssign ? { ...b, allowedProductIds: newList } : b);
    saveData({ ...data, branches: updatedBranches }, "Branch item permissions updated");
  };

  const downloadTemplate = (type) => {
    showToast(`Downloading template for ${type}...`, "success");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B2430] flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold animate-bounce ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Top Header & Switcher */}
      <header className="bg-white border-b border-[#E4DFD3] px-6 py-3.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B2430] text-[#C98A3E] flex items-center justify-center font-extrabold text-sm shadow-sm">
            AIT
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[#1B2430]">AIT Supplier &amp; Branch Portal</h1>
            <p className="text-[11px] text-[#7A7568]">Multi-Country Inventory &amp; Requisition Management</p>
          </div>
        </div>

        <BranchHandling 
          data={data}
          currentBranchLogin={currentBranchLogin}
          setCurrentBranchLogin={setCurrentBranchLogin}
        />
      </header>

      {/* Navigation Tabs (Admin vs Branch) */}
      <nav className="bg-white border-b border-[#E4DFD3] px-6 flex overflow-x-auto shadow-2xs">
        {currentBranchLogin === 'Admin' ? (
          <>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>Executive Dashboard</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'ledger' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>Stock Ledger</button>
            <button onClick={() => setActiveTab('consolidation')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'consolidation' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>MOQ &amp; Consolidation</button>
            <button onClick={() => setActiveTab('pi')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'pi' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>Proforma Invoices</button>
            <button onClick={() => setActiveTab('shipments')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'shipments' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>Shipments</button>
            <button onClick={() => setActiveTab('setup')} className={`px-4 py-3 border-b-2 font-medium text-xs transition-colors cursor-pointer ${activeTab === 'setup' ? 'border-[#C98A3E] text-[#1B2430] font-bold' : 'border-transparent text-[#7A7568] hover:text-[#1B2430]'}`}>Master Setup</button>
          </>
        ) : (
          <button className="px-4 py-3 border-b-2 border-[#C98A3E] text-[#1B2430] font-bold text-xs">Branch Restricted Ordering Portal</button>
        )}
      </nav>

      {/* Main Content Router */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentBranchLogin === 'Admin' ? (
          <>
            {activeTab === 'dashboard' && <ExecutiveDashboard data={data} card={card} sectionLabel={sectionLabel} fmt={fmt} Stamp={Stamp} />}
            {activeTab === 'ledger' && <StockLedger data={data} card={card} sectionLabel={sectionLabel} fmt={fmt} EmptyState={EmptyState} />}
            {activeTab === 'consolidation' && <MOQConsolidationTab data={data} save={saveData} showToast={showToast} card={card} sectionLabel={sectionLabel} inputCls={inputCls} btnPrimary={btnPrimary} EmptyState={EmptyState} Stamp={Stamp} fmt={fmt} num={num} uid={uid} todayStr={todayStr} />}
            {activeTab === 'pi' && <ProformaInvoices data={data} card={card} sectionLabel={sectionLabel} EmptyState={EmptyState} />}
            {activeTab === 'shipments' && <Shipments data={data} card={card} sectionLabel={sectionLabel} EmptyState={EmptyState} />}
            {activeTab === 'setup' && (
              <MasterSetupTab 
                data={data} save={saveData} showToast={showToast}
                sName={sName} setSName={setSName} sCountry={sCountry} setSCountry={setSCountry}
                editingSupplierId={editingSupplierId} handleSaveSupplier={handleSaveSupplier} handleEditSupplier={handleEditSupplier} handleDeleteSupplier={handleDeleteSupplier}
                bName={bName} setBName={setBName} bCountry={bCountry} setBCountry={bCountry} bCode={bCode} setBCode={setBCode}
                editingBranchId={editingBranchId} handleSaveBranch={handleSaveBranch} handleEditBranch={handleEditBranch} handleDeleteBranch={handleDeleteBranch}
                pSupplierId={pSupplierId} setPSupplierId={setPSupplierId} pName={pName} setPName={setPName} pSku={pSku} setPSku={setPSku}
                pPackingSize={pPackingSize} setPPackingSize={setPPackingSize} pWeight={pWeight} setPWeight={setPWeight} pCbm={pCbm} setPCbm={setPCbm}
                editingProductId={editingProductId} handleSaveProduct={handleSaveProduct} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct}
                selectedBranchForAssign={selectedBranchForAssign} setSelectedBranchForAssign={setSelectedBranchForAssign}
                currentBranchForAssignObj={currentBranchForAssignObj} toggleProductAssignment={toggleProductAssignment}
                downloadTemplate={downloadTemplate} setImportType={setImportType} fileInputRef={fileInputRef}
                card={card} sectionLabel={sectionLabel} inputCls={inputCls} btnPrimary={btnPrimary}
              />
            )}
          </>
        ) : (
          <BranchPortalTab 
            data={data} 
            save={saveData} 
            showToast={showToast} 
            branchId={currentBranchLogin}
            card={card}
            inputCls={inputCls}
            btnPrimary={btnPrimary}
            EmptyState={EmptyState}
            Stamp={Stamp}
            fmt={fmt}
            num={num}
            uid={uid}
            todayStr={todayStr}
          />
        )}
      </main>
    </div>
  );
}
