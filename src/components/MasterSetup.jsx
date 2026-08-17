import React, { useState } from 'react';

export default function MasterSetup({ items, setItems, suppliers, setSuppliers }) {
  // Item Form State
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [supplier, setSupplier] = useState('');
  const [packSize, setPackSize] = useState('');
  const [moq, setMoq] = useState('');
  const [weight, setWeight] = useState('');
  const [cbm, setCbm] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [editingItemCode, setEditingItemCode] = useState(null);

  // Supplier Form State
  const [supCode, setSupCode] = useState('');
  const [supName, setSupName] = useState('');
  const [warehouseNo, setWarehouseNo] = useState('');
  const [country, setCountry] = useState('China');
  const [currency, setCurrency] = useState('CNY');
  const [exchangeRate, setExchangeRate] = useState('7.25');
  const [editingSupId, setEditingSupId] = useState(null);

  const handleRegisterItem = (e) => {
    e.preventDefault();
    if (!itemCode || !itemName) return;

    const supObj = suppliers.find(s => s.name === supplier) || suppliers[0];
    const newItem = {
      code: itemCode,
      name: itemName,
      supplierCode: supObj?.code || 'SUP-001',
      supplier: supObj?.name || 'Global Chem China',
      packSize: parseInt(packSize) || 24,
      moq: parseInt(moq) || 100,
      weight: parseFloat(weight) || 10,
      cbm: parseFloat(cbm) || 0.04,
      unitPrice: parseFloat(unitPrice) || 10.00,
      openingStock: parseInt(openingStock) || 0,
      orderedQty: 0,
      receivedQty: 0,
      shippedQty: 0
    };

    if (editingItemCode) {
      setItems(items.map(i => i.code === editingItemCode ? newItem : i));
      setEditingItemCode(null);
      alert('Item updated successfully!');
    } else {
      setItems([...items, newItem]);
      alert('Item registered successfully!');
    }

    setItemCode('');
    setItemName('');
    setPackSize('');
    setMoq('');
    setWeight('');
    setCbm('');
    setUnitPrice('');
    setOpeningStock('');
  };

  const handleRegisterSupplier = (e) => {
    e.preventDefault();
    if (!supCode || !supName) return;

    const newSup = {
      id: editingSupId || Date.now(),
      code: supCode,
      name: supName,
      warehouseNo,
      country,
      currency,
      exchangeRate: parseFloat(exchangeRate) || 1
    };

    if (editingSupId) {
      setSuppliers(suppliers.map(s => s.id === editingSupId ? newSup : s));
      setEditingSupId(null);
      alert('Supplier updated successfully!');
    } else {
      setSuppliers([...suppliers, newSup]);
      alert('Supplier added successfully!');
    }

    setSupCode('');
    setSupName('');
    setWarehouseNo('');
    setExchangeRate('');
  };

  const handleEditItem = (item) => {
    setEditingItemCode(item.code);
    setItemCode(item.code);
    setItemName(item.name);
    setSupplier(item.supplier);
    setPackSize(item.packSize);
    setMoq(item.moq);
    setWeight(item.weight);
    setCbm(item.cbm);
    setUnitPrice(item.unitPrice);
    setOpeningStock(item.openingStock);
  };

  const handleDeleteItem = (code) => {
    if (confirm('Delete this item?')) setItems(items.filter(i => i.code !== code));
  };

  const handleEditSupplier = (sup) => {
    setEditingSupId(sup.id);
    setSupCode(sup.code);
    setSupName(sup.name);
    setWarehouseNo(sup.warehouseNo);
    setCountry(sup.country);
    setCurrency(sup.currency);
    setExchangeRate(sup.exchangeRate);
  };

  const handleDeleteSupplier = (id) => {
    if (confirm('Delete this supplier?')) setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const downloadTemplate = (type) => {
    let headers = type === 'items' 
      ? 'code,name,supplier,packSize,weight,cbm,moq,unitPrice,openingStock\n' 
      : 'code,name,warehouseNo,country,currency,exchangeRate\n';
    let sample = type === 'items' 
      ? 'COS-103,Herbal Shampoo,Global Chem China,24,10,0.04,500,12.50,1000\n' 
      : 'SUP-003,Global Chem China,WH-CN-01,China,CNY,7.25\n';

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
          if (cols.length >= 9) {
            newItems.push({
              code: cols[0], name: cols[1], supplier: cols[2],
              packSize: parseInt(cols[3]) || 24, weight: parseFloat(cols[4]) || 10,
              cbm: parseFloat(cols[5]) || 0.04, moq: parseInt(cols[6]) || 100,
              unitPrice: parseFloat(cols[7]) || 10, openingStock: parseInt(cols[8]) || 0,
              orderedQty: 0, receivedQty: 0, shippedQty: 0
            });
          }
        }
        setItems(newItems);
        alert('Items imported successfully from CSV!');
      } else if (type === 'suppliers') {
        const newSups = [...suppliers];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length >= 6) {
            newSups.push({
              id: Date.now() + i, code: cols[0], name: cols[1], warehouseNo: cols[2],
              country: cols[3], currency: cols[4], exchangeRate: parseFloat(cols[5]) || 1
            });
          }
        }
        setSuppliers(newSups);
        alert('Suppliers imported successfully from CSV!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Template Download & CSV Import Toolbar */}
      <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Master Templates & CSV Bulk Imports</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Download templates for items or suppliers and upload CSV files.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => downloadTemplate('items')} style={btnSecondary}>Download Item Template</button>
          <label style={btnUpload}>
            Import Items CSV
            <input type="file" accept=".csv" onChange={(e) => handleCSVImport(e, 'items')} style={{ display: 'none' }} />
          </label>
          <button onClick={() => downloadTemplate('suppliers')} style={btnSecondary}>Download Supplier Template</button>
          <label style={btnUpload}>
            Import Suppliers CSV
            <input type="file" accept=".csv" onChange={(e) => handleCSVImport(e, 'suppliers')} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Item Master Form */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>{editingItemCode ? 'Edit Item' : 'Add New Item'}</h3>
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
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.warehouseNo})</option>)}
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
                <label style={labelStyle}>Unit Price ($)</label>
                <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="12.50" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Opening Stock Qty</label>
              <input type="number" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} placeholder="1000" required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={btnPrimary}>{editingItemCode ? 'Update Item' : 'Register Item'}</button>
              {editingItemCode && <button type="button" onClick={() => { setEditingItemCode(null); setItemCode(''); setItemName(''); }} style={btnSecondary}>Cancel</button>}
            </div>
          </form>

          {/* Items Table with Edit/Delete */}
          <div style={{ marginTop: '24px', maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Code</th>
                  <th style={{ padding: '8px' }}>Name</th>
                  <th style={{ padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}><b>{it.code}</b></td>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditItem(it)} style={btnSmEdit}>Edit</button>
                      <button onClick={() => handleDeleteItem(it.code)} style={btnSmDel}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Master Form */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>{editingSupId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          <form onSubmit={handleRegisterSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Supplier Code</label>
                <input type="text" value={supCode} onChange={(e) => setSupCode(e.target.value)} placeholder="e.g. SUP-003" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Warehouse Number</label>
                <input type="text" value={warehouseNo} onChange={(e) => setWarehouseNo(e.target.value)} placeholder="e.g. WH-CN-03" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Supplier Name</label>
              <input type="text" value={supName} onChange={(e) => setSupName(e.target.value)} placeholder="e.g. Global Chem China" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="UAE">UAE</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Local Currency (LCY)</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                  <option value="CNY">CNY (Chinese Yuan)</option>
                  <option value="THB">THB (Thai Baht)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Exchange Rate to USD (1 USD = X LCY)</label>
              <input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder="7.25" required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={btnPrimary}>{editingSupId ? 'Update Supplier' : 'Add Supplier'}</button>
              {editingSupId && <button type="button" onClick={() => { setEditingSupId(null); setSupCode(''); setSupName(''); }} style={btnSecondary}>Cancel</button>}
            </div>
          </form>

          {/* Suppliers Table with Edit/Delete */}
          <div style={{ marginTop: '24px', maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Code</th>
                  <th style={{ padding: '8px' }}>Name / WH</th>
                  <th style={{ padding: '8px' }}>Currency / Rate</th>
                  <th style={{ padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}><b>{sup.code}</b></td>
                    <td style={{ padding: '8px' }}>{sup.name} ({sup.warehouseNo})</td>
                    <td style={{ padding: '8px' }}>{sup.currency} (Ex: {sup.exchangeRate})</td>
                    <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditSupplier(sup)} style={btnSmEdit}>Edit</button>
                      <button onClick={() => handleDeleteSupplier(sup.id)} style={btnSmDel}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
const btnSmEdit = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const btnSmDel = { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
