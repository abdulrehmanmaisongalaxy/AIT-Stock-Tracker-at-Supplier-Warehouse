import React, { useState } from 'react';

export default function BranchHandling({ branches, setBranches, items }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [allowedItems, setAllowedItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Extract unique suppliers and countries from items
  const suppliers = [...new Set(items.map(i => i.supplier))];
  const countries = [...new Set(items.map(i => i.country))];

  const filteredItemsForRestriction = items.filter(i => {
    if (selectedSupplierFilter !== 'ALL' && i.supplier !== selectedSupplierFilter) return false;
    if (selectedCountryFilter !== 'ALL' && i.country !== selectedCountryFilter) return false;
    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setAllowedItems(filteredItemsForRestriction.map(i => i.code));
    } else {
      setAllowedItems([]);
    }
  };

  const handleToggleItem = (code) => {
    if (allowedItems.includes(code)) {
      setAllowedItems(allowedItems.filter(c => c !== code));
    } else {
      setAllowedItems([...allowedItems, code]);
    }
  };

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (!name || !location || !username || !password) {
      alert('Please fill out all branch fields.');
      return;
    }

    const newBranch = { name, location, username, password, allowedItems };
    if (editingIndex !== null) {
      const updated = [...branches];
      updated[editingIndex] = newBranch;
      setBranches(updated);
      setEditingIndex(null);
    } else {
      setBranches([...branches, newBranch]);
    }

    setName('');
    setLocation('');
    setUsername('');
    setPassword('');
    setAllowedItems([]);
  };

  const handleEdit = (idx) => {
    const b = branches[idx];
    setName(b.name);
    setLocation(b.location);
    setUsername(b.username);
    setPassword(b.password);
    setAllowedItems(b.allowedItems || []);
    setEditingIndex(idx);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter((_, i) => i !== idx));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Branch Management & Access Control</h2>
      
      <form onSubmit={handleSaveBranch} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3>{editingIndex !== null ? 'Edit Branch' : 'Add New Branch & Access'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Branch Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MG Kinshasa" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location / Country</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. DRC" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Login Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. kinshasa_user" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Login Password</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="e.g. securePass123" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
        </div>

        {/* Restricted Items Selection */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <h4>Restricted Item View Assignment</h4>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Filter by Supplier</label>
              <select value={selectedSupplierFilter} onChange={e => setSelectedSupplierFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="ALL">All Suppliers</option>
                {suppliers.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Filter by Country</label>
              <select value={selectedCountryFilter} onChange={e => setSelectedCountryFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="ALL">All Countries</option>
                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={filteredItemsForRestriction.length > 0 && filteredItemsForRestriction.every(i => allowedItems.includes(i.code))} />
                Select All Filtered Items
              </label>
            </div>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px', background: '#f8fafc' }}>
            {filteredItemsForRestriction.map(item => (
              <label key={item.code} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={allowedItems.includes(item.code)} 
                  onChange={() => handleToggleItem(item.code)} 
                />
                <span style={{ fontWeight: '500' }}>{item.code}</span> - {item.name} <span style={{ color: '#64748b', fontSize: '12px' }}>({item.supplier})</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {editingIndex !== null ? 'Update Branch' : 'Save Branch'}
        </button>
      </form>

      {/* Existing Branches List */}
      <h3>Registered Branches</h3>
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Branch Name</th>
            <th style={{ padding: '12px' }}>Location</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>Allowed Items Count</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((b, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>{b.name}</td>
              <td style={{ padding: '12px' }}>{b.location}</td>
              <td style={{ padding: '12px' }}>{b.username}</td>
              <td style={{ padding: '12px' }}>{b.allowedItems ? b.allowedItems.length : 0} items</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => handleEdit(idx)} style={{ marginRight: '8px', padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(idx)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
