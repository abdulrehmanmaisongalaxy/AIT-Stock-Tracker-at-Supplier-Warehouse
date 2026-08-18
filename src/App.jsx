import React, { useState, useEffect } from 'react';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import StockLedger from './components/StockLedger';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import Shipments from './components/Shipments';
import BranchHandling from './components/BranchHandling';
import MasterSetup from './components/MasterSetup';
import BranchLoginPortal from './components/BranchLoginPortal';

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

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ait_items');
    return saved ? JSON.parse(saved) : [
      { code: 'COS-101', name: 'Hydrating Face Cream 50ml', supplier: 'Global Chem China', country: 'China', currency: 'CNY', exchangeRate: 7.25, packSize: 24, weight: 8.5, cbm: 0.045, moq: 500, openingStock: 1000, orderedQty: 0, receivedQty: 0, shippedQty: 0, unitPriceLCY: 85.00, unitPriceUSD: 11.72 },
      { code: 'COS-102', name: 'Matte Liquid Lipstick Set', supplier: 'Bangkok Beauty Thai', country: 'Thailand', currency: 'THB', exchangeRate: 36.50, packSize: 48, weight: 6.2, cbm: 0.025, moq: 300, openingStock: 800, orderedQty: 0, receivedQty: 0, shippedQty: 0, unitPriceLCY: 292.00, unitPriceUSD: 8.00 }
    ];
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('ait_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: 1, code: 'SUP-001', name: 'Global Chem China', warehouseNo: 'WH-CN-01', country: 'China', currency: 'CNY', exchangeRate: 7.25 },
      { id: 2, code: 'SUP-002', name: 'Bangkok Beauty Thai', warehouseNo: 'WH-TH-02', country: 'Thailand', currency: 'THB', exchangeRate: 36.50 }
    ];
  });

  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('ait_branches');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'MG Kinshasa', location: 'DRC', username: 'MTD-123', password: '123', allowedItems: ['COS-101', 'COS-102'] }
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

  useEffect(() => {
    localStorage.setItem('ait_current_user', JSON.stringify(currentUser));
    localStorage.setItem('ait_items', JSON.stringify(items));
    localStorage.setItem('ait_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('ait_branches', JSON.stringify(branches));
    localStorage.setItem('ait_requisitions', JSON.stringify(requisitions));
    localStorage.setItem('ait_pis', JSON.stringify(proformaInvoices));
    localStorage.setItem('ait_shipments', JSON.stringify(shipments));
  }, [currentUser, items, suppliers, branches, requisitions, proformaInvoices, shipments]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    if (username === 'admin' && password === 'admin123') {
      setCurrentUser({ role: 'admin', name: 'Dubai HQ Admin' });
    } else {
      alert('Invalid admin credentials. Use admin / admin123');
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginCard}>
          <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>AIT Supplier & Inventory Portal</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Sign in as HQ Administrator</p>
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={styles.label}>Admin Username</label>
              <input type="text" name="username" defaultValue="admin" required style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" defaultValue="admin123" required style={styles.input} />
            </div>
            <button type="submit" style={styles.primaryBtn}>Sign In to HQ Admin</button>
          </form>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'branch_login_screen') {
    return (
      <BranchLoginPortal 
        usernameQuery={currentUser.usernameQuery} 
        branches={branches} 
        onLoginSuccess={(branchObj) => setCurrentUser({ role: 'branch', ...branchObj })} 
      />
    );
  }

  if (currentUser.role === 'branch') {
    return (
      <div style={styles.appContainer}>
        <header style={styles.header}>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>AIT Branch Ordering Portal</h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Logged in as: {currentUser.name} ({currentUser.location})</span>
          </div>
          <button onClick={() => { setCurrentUser(null); window.location.href = window.location.pathname; }} style={styles.logoutBtn}>Logout</button>
        </header>
        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <BranchPortal branch={currentUser} items={items} requisitions={requisitions} setRequisitions={setRequisitions} />
        </main>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>AIT Supplier & Inventory Control Portal</h1>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dubai HQ & Multi-Warehouse Stock Tracking Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Admin Mode Active</span>
          <button onClick={() => { localStorage.removeItem('ait_current_user'); setCurrentUser(null); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <nav style={styles.navBar}>
        <button style={activeTab === 'dashboard' ? navActive : navBtn} onClick={() => setActiveTab('dashboard')}>Executive Dashboard</button>
        <button style={activeTab === 'ledger' ? navActive : navBtn} onClick={() => setActiveTab('ledger')}>Stock Ledger</button>
        <button style={activeTab === 'consolidation' ? navActive : navBtn} onClick={() => setActiveTab('consolidation')}>Order Consolidation & MOQ</button>
        <button style={activeTab === 'pis' ? navActive : navBtn} onClick={() => setActiveTab('pis')}>Proforma Invoices</button>
        <button style={activeTab === 'shipments' ? navActive : navBtn} onClick={() => setActiveTab('shipments')}>Shipments & Containers</button>
        <button style={activeTab === 'branches' ? navActive : navBtn} onClick={() => setActiveTab('branches')}>Branch Management & Links</button>
        <button style={activeTab === 'master' ? navActive : navBtn} onClick={() => setActiveTab('master')}>Master Setup & Import</button>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <ExecutiveDashboard items={items} branches={branches} proformaInvoices={proformaInvoices} />}
        {activeTab === 'ledger' && <StockLedger items={items} suppliers={suppliers} setItems={setItems} />}
        {activeTab === 'consolidation' && <OrderConsolidation requisitions={requisitions} setRequisitions={setRequisitions} proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} items={items} setItems={setItems} suppliers={suppliers} />}
        {activeTab === 'pis' && <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} suppliers={suppliers} items={items} setItems={setItems} />}
        {activeTab === 'shipments' && <Shipments shipments={shipments} setShipments={setShipments} items={items} setItems={setItems} branches={branches} />}
        {activeTab === 'branches' && <BranchHandling branches={branches} setBranches={setBranches} items={items} suppliers={suppliers} />}
        {activeTab === 'master' && <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} />}
      </main>
    </div>
  );
}

const styles = {
  loginWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' },
  loginCard: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' },
  appContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#0f172a', borderBottom: '1px solid #1e293b' },
  navBar: { display: 'flex', gap: '8px', padding: '12px 32px', background: '#1e293b', overflowX: 'auto' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
  primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  logoutBtn: { background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }
};

const navBtn = { background: 'transparent', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' };
const navActive = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' };
