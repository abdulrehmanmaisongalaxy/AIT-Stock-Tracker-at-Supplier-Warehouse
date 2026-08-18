import React, { useState, useEffect } from 'react';
import BranchRequisitionPortal from './components/BranchRequisitionPortal';
import BranchPortal from './components/BranchPortal';

// Safe component loader with error catching
const SafeComponent = ({ component: Component, name }) => {
  try {
    return <Component />;
  } catch (err) {
    return (
      <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
        <h3>Error loading {name}</h3>
        <p>{err.toString()}</p>
      </div>
    );
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('requisition');

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>AIT Stock Tracker & Supplier Warehouse</h1>
        <div style={styles.navLinks}>
          <button style={activeTab === 'requisition' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('requisition')}>Requisition Portal</button>
          <button style={activeTab === 'portal' ? styles.activeBtn : styles.navBtn} onClick={() => setActiveTab('portal')}>Branch Portal</button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {activeTab === 'requisition' && <BranchRequisitionPortal />}
        {activeTab === 'portal' && <BranchPortal />}
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
