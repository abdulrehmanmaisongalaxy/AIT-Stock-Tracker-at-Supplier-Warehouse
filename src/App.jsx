import React, { useState, useEffect } from 'react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import StockLedger from './components/StockLedger';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import Shipments from './components/Shipments';
import BranchHandling from './components/BranchHandling';
import MasterSetup from './components/MasterSetup';
import BranchPortal from './components/BranchPortal';
import BranchRequisitionPortal from './components/BranchRequisitionPortal';

// Initial dummy seed data for robust standalone operation if localStorage is empty
const initialBranches = [
  { id: 1, name: 'MG Kinshasa', location: 'Kinshasa, DRC', contact: 'Jean Pierre' },
  { id: 2, name: 'MG Lubumbashi', location: 'Lubumbashi, DRC', contact: 'Patrick Mwamba' },
  { id: 3, name: 'MG Kolwezi', location: 'Kolwezi, DRC', contact: 'Alain Kabeya' }
];

const initialSuppliers = [
  { id: 1, code: 'SUP-01', name: 'Ningbo Hardware Factory', country: 'China' },
  { id: 2, code: 'SUP-02', name: 'Guangzhou Auto Parts', country: 'China' },
  { id: 3, code: 'SUP-03', name: 'Yiwu General Goods', country: 'China' }
];

const initialItems = [
  { code: 'ITM-001', name: 'Heavy Duty Brake Pads', supplier: 'Guangzhou Auto Parts', country: 'China', openingStock: 1000, orderedQty: 500, receivedQty: 200, shippedQty: 150, unitPriceLCY: 45.00, unitPriceUSD: 6.20, cbm: 0.05, weight: 12.5 },
  { code: 'ITM-002', name: 'Industrial Hydraulic Oil (20L)', supplier: 'Ningbo Hardware Factory', country: 'China', openingStock: 500, orderedQty: 300, receivedQty: 300, shippedQty: 100, unitPriceLCY: 120.00, unitPriceUSD: 16.50, cbm: 0.08, weight: 20.0 },
  { code: 'ITM-003', name: 'LED Floodlight 100W', supplier: 'Yiwu General Goods', country: 'China', openingStock: 2000, orderedQty: 1000, receivedQty: 1000, shippedQty: 400, unitPriceLCY: 35.00, unitPriceUSD: 4.80, cbm: 0.03, weight: 3.5 }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branch');
    if (branchParam) {
      return { role: 'branch_login_screen', usernameQuery: branchParam };
    }
    const saved = localStorage.getItem('ait_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Centralized persistent states across all modules
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ait_master_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('ait_master_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('ait_master_branches');
    return saved ? JSON.parse(saved) : initialBranches;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('ait_purchase_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('ait_shipments');
    return saved ? JSON.parse(saved) : [];
  });

  const [proformaInvoices, setProformaInvoices] = useState(() => {
    const saved = localStorage.getItem('ait_proforma_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('ait_requisitions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ait_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ait_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ait_master_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ait_master_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('ait_master_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('ait_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('ait_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('ait_proforma_invoices', JSON.stringify(proformaInvoices));
  }, [proformaInvoices]);

  useEffect(() => {
    localStorage.setItem('ait_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  // Render the appropriate component with all necessary shared states
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard items={items} shipments={shipments} purchaseOrders={purchaseOrders} branches={branches} />;
      case 'ledger':
        return <StockLedger items={items} suppliers={suppliers} setItems={setItems} />;
      case 'consolidation':
        return <OrderConsolidation items={items} suppliers={suppliers} purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} setItems={setItems} />;
      case 'invoices':
        return <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} items={items} suppliers={suppliers} />;
      case 'shipments':
        return <Shipments shipments={shipments} setShipments={setShipments} items={items} setItems={setItems} branches={branches} />;
      case 'branch':
        return <BranchHandling shipments={shipments} setShipments={setShipments} branches={branches} />;
      case 'requisition':
        return <BranchRequisitionPortal requisitions={requisitions} setRequisitions={setRequisitions} items={items} branches={branches} />;
      case 'portal':
        return <BranchPortal branches={branches} shipments={shipments} requisitions={requisitions} setRequisitions={setRequisitions} items={items} />;
      case 'setup':
        return <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} branches={branches} setBranches={setBranches} />;
      default:
        return <ExecutiveDashboard items={items} shipments={shipments} purchaseOrders={purchaseOrders} branches={branches} />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>AIT Stock Tracker & Supplier Warehouse</h1>
        <div style={styles.navLinks}>
          <button style={activeTab === 'dashboard' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button style={activeTab === 'ledger' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('ledger')}>Stock Ledger</button>
          <button style={activeTab === 'consolidation' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('consolidation')}>Consolidation</button>
          <button style={activeTab === 'invoices' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('invoices')}>Proforma</button>
          <button style={activeTab === 'shipments' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('shipments')}>Shipments</button>
          <button style={activeTab === 'branch' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('branch')}>Branch Handling</button>
          <button style={activeTab === 'requisition' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('requisition')}>Requisition</button>
          <button style={activeTab === 'portal' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('portal')}>Branch Portal</button>
          <button style={activeTab === 'setup' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('setup')}>Setup</button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}

const styles = {
  appContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
  header: { background: '#ffffff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { margin: 0, fontSize: '20px', color: '#1e293b' },
  navLinks: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  navBtn: { background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' },
  activeBtn: { background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  mainContent: { padding: '24px' }
};
