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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ait_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ait_current_user');
    }
  }, [currentUser]);

  // Render the appropriate component based on the active tab/view
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'ledger':
        return <StockLedger />;
      case 'consolidation':
        return <OrderConsolidation />;
      case 'invoices':
        return <ProformaInvoices />;
      case 'shipments':
        return <Shipments />;
      case 'branch':
        return <BranchHandling />;
      case 'requisition':
        return <BranchRequisitionPortal />;
      case 'portal':
        return <BranchPortal />;
      case 'setup':
        return <MasterSetup />;
      default:
        return <ExecutiveDashboard />;
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
