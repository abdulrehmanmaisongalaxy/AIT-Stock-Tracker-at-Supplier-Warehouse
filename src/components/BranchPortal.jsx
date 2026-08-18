import React, { useState } from 'react';
import BranchRequisitionPortal from './BranchRequisitionPortal';

const BranchPortal = () => {
  // Authentication & Session States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Dubai - Al Quoz Branch');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      alert('Please enter valid branch credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // If NOT logged in, show the Branch Login Portal view
  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={styles.loginTitle}>Branch Portal Login</h2>
          <p style={styles.loginSubtitle}>Enter your branch credentials to access requisitioning</p>
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Branch User ID</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="e.g., DXB-ALQUOZ-01"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Branch Location</label>
              <select 
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={styles.input}
              >
                <option value="Dubai - Al Quoz Branch">Dubai - Al Quoz Branch</option>
                <option value="Sharjah - Al Majaz Branch">Sharjah - Al Majaz Branch</option>
                <option value="Abu Dhabi - Mussafah Branch">Abu Dhabi - Mussafah Branch</option>
              </select>
            </div>

            <button type="submit" style={styles.loginButton}>
              Login to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If logged in, show the dashboard container hosting the Requisition Portal
  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.navbar}>
        <div style={styles.brandArea}>
          <h2 style={styles.navTitle}>Enterprise Branch Hub</h2>
          <span style={styles.branchIndicator}>{selectedBranch}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main style={styles.mainContent}>
        {/* Renders the requisition component */}
        <BranchRequisitionPortal branchName={selectedBranch} />
      </main>
    </div>
  );
};

// Styling definitions for the login & layout wrapper
const styles = {
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f1f5f9' },
  loginCard: { background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' },
  loginTitle: { margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px' },
  loginSubtitle: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  loginButton: { background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  
  dashboardContainer: { minHeight: '80vh', background: '#f8fafc' },
  navbar: { background: '#ffffff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  brandArea: { display: 'flex', alignItems: 'center', gap: '16px' },
  navTitle: { margin: 0, fontSize: '18px', color: '#1e293b' },
  branchIndicator: { background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  logoutButton: { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  mainContent: { padding: '32px 16px' }
};

export default BranchPortal;
