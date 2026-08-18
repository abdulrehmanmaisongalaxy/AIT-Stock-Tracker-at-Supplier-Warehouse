import React, { useState } from 'react';

export default function BranchHandling({ branches = [], setBranches = () => {}, items = [], suppliers = [] }) {
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingBranchId, setEditingBranchId] = useState(null);

  // Filters for restricted item selection
  const [filterSupplier, setFilterSupplier] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');

  const safeSuppliers = suppliers || [];
  const safeItems = items || [];
  const safeBranches = branches || [];

  const countries = [...new Set(safeSuppliers.map(s => s.country).filter(Boolean))];

  const filteredItemsForRestriction = safeItems.filter(item => {
    const matchSup = filterSupplier === 'ALL' || item.supplier === filterSupplier;
    const sObj = safeSuppliers.find(s => s.name === item.supplier);
    const matchCountry = filterCountry === 'ALL' || (sObj && sObj.country === filterCountry);
    return matchSup && matchCountry;
  });

  const handleSelectAllFiltered = (checked) => {
    const filteredCodes = filteredItemsForRestriction.map(i => i.code);
    if (checked) {
      const combined = [...new Set([...selectedItems, ...filteredCodes])];
      setSelectedItems(combined);
    } else {
      setSelectedItems(selectedItems.filter(code => !filteredCodes.includes(code)));
    }
  };

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (!branchName || !branchLocation || !username || !password) return;

    if (editingBranchId) {
      setBranches(safeBranches.map(b => b.id === editingBranchId ? { ...b, name: branchName, location: branchLocation, username, password, allowedItems: selectedItems } : b));
      setEditingBranchId(null);
      alert('Branch updated successfully!');
    } else {
      const newBranch = {
        id: Date.now(),
        name: branchName,
        location: branchLocation,
        username,
        password,
        allowedItems: selectedItems.length > 0 ? selectedItems : safeItems.map(i => i.code)
      };
      setBranches([...safeBranches, newBranch]);
      alert('Branch created successfully with login credentials!');
    }
    setBranchName('');
    setBranchLocation('');
    setUsername('');
    setPassword('');
    setSelectedItems([]);
  };

  const handleEdit = (b) => {
    setEditingBranchId(b.id);
    setBranchName(b.name || '');
    setBranchLocation(b.location || '');
    setUsername(b.username || '');
    setPassword(b.password || '');
    setSelectedItems(b.allowedItems || []);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this branch?')) setBranches(safeBranches.filter(b => b.id !== id));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>{editingBranchId ? 'Edit Branch' : 'Create Branch User & Access Link'}</h3>
        <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Branch Name</label>
              <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. MG Kinshasa" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Branch Location</label>
              <input type="text" value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} placeholder="e.g. DRC" required style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Branch Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. MTD-123" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Branch Password</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
            </div>
          </div>

          {/* Supplier & Country filters for restricted item selection */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <label style={{ ...labelStyle, fontWeight: 'bold', marginBottom: '8px' }}>Restricted Item View Configuration</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Filter by Country</label>
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={inputStyle}>
                  <option value="ALL">-- All Countries --</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Filter by Supplier</label>
                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} style={inputStyle}>
                  <option value="ALL">-- All Suppliers --</option>
                  {safeSuppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Select Items ({filteredItemsForRestriction.length} available)</span>
              <label style={{ fontSize: '12px', cursor: 'pointer', color: '#2563eb', fontWeight: '600' }}>
                <input type="checkbox" onChange={(e) => handleSelectAllFiltered(e.target.checked)} style={{ marginRight: '4px' }} /> Select All Filtered
              </label>
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '4px', background: '#fff' }}>
              {filteredItemsForRestriction.map(item => (
                <label key={item.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '4px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.code)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedItems([...selectedItems, item.code]);
                      else setSelectedItems(selectedItems.filter(c => c !== item.code));
                    }}
                  />
                  <b>{item.code}</b> — {item.name} <span style={{ color: '#94a3b8', fontSize: '11px' }}>({item.supplier})</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={btnPrimary}>{editingBranchId ? 'Update Branch' : 'Generate Branch Login & Link'}</button>
            {editingBranchId && <button type="button" onClick={() => { setEditingBranchId(null); setBranchName(''); }} style={btnSecondary}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Active Branch Direct Links & Login Credentials</h3>
        {safeBranches.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No active branches created yet.</p>
        ) : (
          safeBranches.map(b => (
            <div key={b.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px' }}>{b.name} / {b.location}</div>
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
          ))
        )}
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
