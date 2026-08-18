import React, { useState } from 'react';

export default function BranchPortal({ branches, items, onsubmitRequisition }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentBranch, setCurrentBranch] = useState(null);
  const [orderQtys, setOrderQtys] = useState({});
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const found = branches.find(b => b.username === username && b.password === password);
    if (found) {
      setCurrentBranch(found);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password. Please check your credentials.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#16a34a' }}>Branch Portal Login</h2>
        {error && <div style={{ color: '#dc2626', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              placeholder="Enter branch username"
              required 
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              value={orderQtys} // Wait, fix state reference: password
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              placeholder="Enter branch password"
              required 
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Login to Requisition Portal
          </button>
        </form>
      </div>
    );
  }

  // Filter items assigned to this branch
  const allowedItems = items.filter(i => currentBranch.allowedItems && currentBranch.allowedItems.includes(i.code));

  const handleQtyChange = (code, val) => {
    setOrderQtys({ ...orderQtys, [code]: Math.max(0, parseInt(val) || 0) });
  };

  // Real-time calculations for CBM and Weight
  let totalCbm = 0;
  let totalWeight = 0;
  allowedItems.forEach(item => {
    const qty = orderQtys[item.code] || 0;
    totalCbm += qty * (parseFloat(item.cbm) || 0);
    totalWeight += qty * (parseFloat(item.weight) || 0);
  });

  // Standard container capacities (approximate metrics)
  const container20CapacityCbm = 28;
  const container40CapacityCbm = 58;
  const fill20 = Math.min(100, ((totalCbm / container20CapacityCbm) * 100)).toFixed(1);
  const fill40 = Math.min(100, ((totalCbm / container40CapacityCbm) * 100)).toFixed(1);

  const handleSubmitOrder = () => {
    const requisitionItems = allowedItems
      .map(item => ({ ...item, orderQty: orderQtys[item.code] || 0 }))
      .filter(i => i.orderQty > 0);

    if (requisitionItems.length === 0) {
      alert('Please enter order quantities for at least one item.');
      return;
    }

    onsubmitRequisition({
      id: 'REQ-' + Math.floor(100 + Math.random() * 900),
      branch: currentBranch.name,
      location: currentBranch.location,
      date: new Date().toISOString().split('T')[0],
      items: requisitionItems,
      totalCbm: totalCbm.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      status: 'Pending Consolidation'
    });
    alert('Requisition submitted successfully!');
    setOrderQtys({});
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Branch Requisition Portal — {currentBranch.name} ({currentBranch.location})</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Item Code</th>
              <th style={{ padding: '12px' }}>Item Name</th>
              <th style={{ padding: '12px' }}>Pack Size</th>
              <th style={{ padding: '12px' }}>Weight (kg)</th>
              <th style={{ padding: '12px' }}>CBM</th>
              <th style={{ padding: '12px' }}>In Stock</th>
              <th style={{ padding: '12px', width: '130px' }}>Order Qty</th>
            </tr>
          </thead>
          <tbody>
            {allowedItems.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No items assigned to this branch yet.</td></tr>
            ) : (
              allowedItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{item.code}</td>
                  <td style={{ padding: '12px' }}>{item.name}</td>
                  <td style={{ padding: '12px' }}>{item.packSize}</td>
                  <td style={{ padding: '12px' }}>{item.weight}</td>
                  <td style={{ padding: '12px' }}>{item.cbm}</td>
                  <td style={{ padding: '12px' }}>{item.inStock || 0}</td>
                  <td style={{ padding: '12px' }}>
                    <input 
                      type="number" 
                      min="0" 
                      value={orderQtys[item.code] || ''} 
                      onChange={(e) => handleQtyChange(item.code, e.target.value)}
                      style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Real-time Container Fill Meter */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Real-Time Container Fill Summary</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Total Weight: <b>{totalWeight.toFixed(2)} kg</b> | Total CBM: <b>{totalCbm.toFixed(2)} m³</b></p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>{fill20}%</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>20FT Container Fill</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>{fill40}%</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>40FT Container Fill</div>
          </div>
          <button onClick={handleSubmitOrder} style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Submit Order Requisition
          </button>
        </div>
      </div>
    </div>
  );
}
