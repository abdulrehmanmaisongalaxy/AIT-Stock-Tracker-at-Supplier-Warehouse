import React, { useState } from 'react';

export default function MasterSetup({ items, setItems, suppliers, setSuppliers }) {
  // New Item State
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [supplier, setSupplier] = useState('');
  const [packSize, setPackSize] = useState('');
  const [moq, setMoq] = useState('');
  const [weight, setWeight] = useState('');
  const [cbm, setCbm] = useState('');
  const [stock, setStock] = useState('');

  // New Supplier State
  const [supName, setSupName] = useState('');
  const [country, setCountry] = useState('China');

  const handleRegisterItem = (e) => {
    e.preventDefault();
    if (!itemCode || !itemName) return;
    const newItem = {
      code: itemCode,
      name: itemName,
      supplier: supplier || suppliers[0]?.name || 'Global Chem China',
      packSize: parseInt(packSize) || 24,
      moq: parseInt(moq) || 100,
      weight: parseFloat(weight) || 10,
      cbm: parseFloat(cbm) || 0.04,
      stock: parseInt(stock) || 0
    };
    setItems([...items, newItem]);
    setItemCode('');
    setItemName('');
    setPackSize('');
    setMoq('');
    setWeight('');
    setCbm('');
    setStock('');
    alert('Item successfully registered into Item Master!');
  };

  const handleRegisterSupplier = (e) => {
    e.preventDefault();
    if (!supName) return;
    setSuppliers([...suppliers, { id: Date.now(), name: supName, country }]);
    setSupName('');
    alert('Supplier added successfully!');
  };

  const downloadTemplate = (type) => {
    let headers = type === 'items' ? 'code,name,supplier,packSize,weight,cbm,moq,stock\n' : 'name,country\n';
    let sample = type === 'items' ? 'COS-103,Herbal Shampoo,Global Chem China,24,10,0.04,500,1000\n' : 'Global Chem China,China\n';
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
  };

  const handleCSVImport = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split('\n').filter(l => l.trim() !== '');
      if (type === 'items') {
        const newItems = [...items];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length >= 8) {
            newItems.push({
              code: cols[0], name: cols[1], supplier: cols[2],
              packSize: parseInt(cols[3]) || 24, weight: parseFloat(cols[4]) || 10,
              cbm: parseFloat(cols[5]) || 0.04, moq: parseInt(cols[6]) || 100, stock: parseInt(cols[7]) || 0
            });
          }
        }
        setItems(newItems);
        alert('Items imported successfully from CSV!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner for Templates & Import */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Master Setup, Countries & Imports</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Download CSV templates or bulk import items and suppliers.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => downloadTemplate('items')} style={btnSecondary}>Download Item Template</button>
          <label style={btnUpload}>
            Import Items CSV
            <input type="file" accept=".csv" onChange={(e) => handleCSVImport(e, 'items')} style={{ display: 'none' }} />
          </label>
          <button onClick={() => downloadTemplate('suppliers')} style={btnSecondary}>Download Supplier Template</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Register Item */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Add New Item</h3>
          <form onSubmit={handleRegisterItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Item Code</label>
              <input type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="e.g. COS-103" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Item Name</label>
              <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Glowing Foundation" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Supplier Warehouse</label>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} style={inputStyle}>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Pack Size (Pcs/CTN)</label>
                <input type="number" value={packSize} onChange={(e) => setPackSize(e.target.value)} placeholder="24" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>MOQ</label>
                <input type="number" value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="500" required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="10" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CBM (m³)</label>
                <input type="number" step="0.001" value={cbm} onChange={(e) => setCbm(e.target.value)} placeholder="0.04" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Initial Stock Qty</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="1000" required style={inputStyle} />
              </div>
            </div>
            <button type="submit" style={btnPrimary}>Register Item</button>
          </form>
        </div>

        {/* Register Supplier */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Add New Supplier</h3>
          <form onSubmit={handleRegisterSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Supplier Name</label>
              <input type="text" value={supName} onChange={(e) => setSupName(e.target.value)} placeholder="e.g. Bangkok Beauty Thai" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
                <option value="China">China</option>
                <option value="Thailand">Thailand</option>
                <option value="UAE">UAE</option>
                <option value="India">India</option>
              </select>
            </div>
            <button type="submit" style={btnPrimary}>Add Supplier</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const btnPrimary = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnSecondary = { background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' };
const btnUpload = { background: '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'inline-block' };
