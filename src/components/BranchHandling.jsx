import React, { useState } from 'react';

export default function BranchHandling({ branches, setBranches, items }) {
  const [branchName, setBranchName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingBranchId, setEditingBranchId] = useState(null);

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (!branchName || !username || !password) return;

    if (editingBranchId) {
      setBranches(branches.map(b => b.id === editingBranchId ? { ...b, name: branchName, username, password, allowedItems: selectedItems } : b));
      setEditingBranchId(null);
      alert('Branch updated successfully!');
    } else {
      const newBranch = {
        id: Date.now(),
        name: branchName,
        username,
        password,
        allowedItems: selectedItems.length > 0 ? selectedItems : items.map(i => i.code)
      };
      setBranches([...branches, newBranch]);
      alert('Branch created successfully with direct login link!');
    }
    setBranchName('');
    setUsername('');
    setPassword('');
    setSelectedItems([]);
  };

  const handleEdit = (b) => {
    setEditingBranchId(b.id);
    setBranchName(b.name);
    setUsername(b.username);
    setPassword(b.password);
    setSelectedItems(b.allowedItems || []);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>{editingBranchId ? 'Edit Branch' : 'Create Branch User & Access Link'}</h3>
        <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={btnPrimary}>{editingBranchId ? 'Update Branch' : 'Generate Branch Login & Link'}</button>
            {editingBranchId && <button type="button" onClick={() => { setEditingBranchId(null); setBranchName(''); setUsername(''); setPassword(''); setSelectedItems([]); }} style={btnSecondary}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Active Branch Direct Links</h3>
        {branches.map(b => (
          <div key={b.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{b.name}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(b)} style={btnSmEdit}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={btnSmDel}>Delete</button>
              </div>
            </div>
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
const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnSecondary = { background: '#cbd5e1', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnSmEdit = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const btnSmDel = { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
