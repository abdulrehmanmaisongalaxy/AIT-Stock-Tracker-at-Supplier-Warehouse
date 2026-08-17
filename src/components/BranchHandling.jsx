import React, { useState } from 'react';

export default function BranchHandling({ branches, setBranches, items }) {
  const [branchName, setBranchName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCreateBranch = (e) => {
    e.preventDefault();
    if (!branchName || !username || !password) return;
    const newBranch = {
      id: Date.now(),
      name: branchName,
      username,
      password,
      allowedItems: selectedItems.length > 0 ? selectedItems : items.map(i => i.code)
    };
    setBranches([...branches, newBranch]);
    setBranchName('');
    setUsername('');
    setPassword('');
    setSelectedItems([]);
    alert('Branch created successfully with login credentials and secure access link!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Create Branch User & Access Link</h3>
        <form onSubmit={handleCreateBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Branch Name / Location</label>
            <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Branch B - Kampala" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Branch Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. branch_b" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Branch Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Restricted Item View (Select items visible to this branch)</label>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px' }}>
              {items.map(item => (
                <label key={item.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.code)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedItems([...selectedItems, item.code]);
                      else setSelectedItems(selectedItems.filter(c => c !== item.code));
                    }}
                  />
                  <b>{item.code}</b> - {item.name}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" style={btnPrimary}>Generate Branch Login & Link</button>
        </form>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Active Branch Direct Links</h3>
        {branches.map(b => (
          <div key={b.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{b.name}</div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Username: <b>{b.username}</b> | Password: <b>{b.password}</b></div>
            <div style={{ fontSize: '12px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', wordBreak: 'break-all' }}>
              🔗 Login Link: <a href={`${window.location.origin}/?branch=${b.username}`} target="_blank" rel="noreferrer">{window.location.origin}/?branch={b.username}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
