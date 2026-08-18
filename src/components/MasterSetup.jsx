import React, { useState } from 'react';

export default function MasterSetup({ items, setItems, suppliers, setSuppliers }) {
  // Supplier State
  const [supName, setSupName] = useState('');
  const [supCode, setSupCode] = useState('');
  const [supWarehouse, setSupWarehouse] = useState('');
  const [supCurrency, setSupCurrency] = useState('USD');
  const [supCountry, setSupCountry] = useState('');
  const [editingSupIdx, setEditingSupIdx] = useState(null);

  // Item State
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemSupplier, setItemSupplier] = useState('');
  const [itemCountry, setItemCountry] = useState('');
  const [itemPackSize, setItemPackSize] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemCbm, setItemCbm] = useState('');
  const [itemMoq, setItemMoq] = useState('');
  const [itemUnitRate, setItemUnitRate] = useState('');
  const [itemInStock, setItemInStock] = useState('');
  const [editingItemIdx, setEditingItemIdx] = useState(null);

  // Supplier Save
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    const newSup = { code: supCode, name: supName, warehouse: supWarehouse, currency: supCurrency, country: supCountry };
    if (editingSupIdx !== null) {
      const updated = [...suppliers];
      updated[editingSupIdx] = newSup;
      setSuppliers(updated);
      setEditingSupIdx(null);
    } else {
      setSuppliers([...suppliers, newSup]);
    }
    setSupName(''); setSupCode(''); setSupWarehouse(''); setSupCurrency('USD'); setSupCountry('');
  };

  // Item Save
  const handleSaveItem = (e) => {
    e.preventDefault();
    const newItem = {
      code: itemCode,
      name: itemName,
      supplier: itemSupplier,
      country: itemCountry,
      packSize: itemPackSize,
      weight: parseFloat(itemWeight) || 0,
      cbm: parseFloat(itemCbm) || 0,
      moq: parseInt(itemMoq) || 0,
      unitRate: parseFloat(itemUnitRate) || 0,
      inStock: parseInt(itemInStock) || 0
    };
    if (editingItemIdx !== null) {
      const updated = [...items];
      updated[editingItemIdx] = newItem;
      setItems(updated);
      setEditingItemIdx(null);
    } else {
      setItems([...items, newItem]);
    }
    setItemCode(''); setItemName(''); setItemSupplier(''); setItemCountry(''); setItemPackSize(''); setItemWeight(''); setItemCbm(''); setItemMoq(''); setItemUnitRate(''); setItemInStock('');
  };

  // CSV Template Download
  const downloadItemTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,code,name,supplier,country,packSize,weight,cbm,moq,unitRate,inStock\nITM001,Example Item,Supplier A,China,Box of 12,1.5,0.02,100,12.50,500";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "item_master_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSupplierTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,code,name,warehouseNumber,currency,country\nSUP001,Supplier Alpha,WH-CN-01,USD,China";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "supplier_master_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Master Setup: Suppliers & Items</h2>

      {/* SUPPLIER SECTION */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>{editingSupIdx !== null ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={downloadSupplierTemplate} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download Supplier Template</button>
        </div>
        <form onSubmit={handleSaveSupplier} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Supplier Code</label>
            <input type="text" value={supCode} onChange={e => setSupCode(e.target.value)} placeholder="SUP01" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Supplier Name</label>
            <input type="text" value={supName} onChange={e => setSupName(e.target.value)} placeholder="Name" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Warehouse No.</label>
            <input type="text" value={supWarehouse} onChange={e => setSupWarehouse(e.target.value)} placeholder="WH-01" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Local Currency (LCY)</label>
            <input type="text" value={supCurrency} onChange={e => setSupCurrency(e.target.value)} placeholder="USD / CNY / THB" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Country</label>
            <input type="text" value={supCountry} onChange={e => setSupCountry(e.target.value)} placeholder="China" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <button type="submit" style={{ padding: '9px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
        </form>

        {/* Suppliers Table */}
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Code</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Warehouse No.</th>
              <th style={{ padding: '10px' }}>Currency</th>
              <th style={{ padding: '10px' }}>Country</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600' }}>{s.code}</td>
                <td style={{ padding: '10px' }}>{s.name}</td>
                <td style={{ padding: '10px' }}>{s.warehouse}</td>
                <td style={{ padding: '10px' }}>{s.currency}</td>
                <td style={{ padding: '10px' }}>{s.country}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => { setSupCode(s.code); setSupName(s.name); setSupWarehouse(s.warehouse); setSupCurrency(s.currency); setSupCountry(s.country); setEditingSupIdx(idx); }} style={{ marginRight: '6px', padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => setSuppliers(suppliers.filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ITEM SECTION */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>{editingItemIdx !== null ? 'Edit Item' : 'Add Item Master'}</h3>
          <button onClick={downloadItemTemplate} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download Item Template</button>
        </div>
        <form onSubmit={handleSaveItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <div><label style={{ fontSize: '13px' }}>Item Code</label><input type="text" value={itemCode} onChange={e => setItemCode(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>Item Name</label><input type="text" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div>
            <label style={{ fontSize: '13px' }}>Supplier</label>
            <select value={itemSupplier} onChange={e => setItemSupplier(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required>
              <option value="">Select Supplier</option>
              {suppliers.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: '13px' }}>Country</label><input type="text" value={itemCountry} onChange={e => setItemCountry(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>Pack Size</label><input type="text" value={itemPackSize} onChange={e => setItemPackSize(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>Weight (kg)</label><input type="number" step="0.01" value={itemWeight} onChange={e => setItemWeight(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>CBM</label><input type="number" step="0.001" value={itemCbm} onChange={e => setItemCbm(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>MOQ</label><input type="number" value={itemMoq} onChange={e => setItemMoq(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>Unit Rate</label><input type="number" step="0.01" value={itemUnitRate} onChange={e => setItemUnitRate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
          <div><label style={{ fontSize: '13px' }}>Opening Stock Qty</label><input type="number" value={itemInStock} onChange={e => setItemInStock(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required /></div>
        </form>
        <button type="button" onClick={handleSaveItem} style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{editingItemIdx !== null ? 'Update Item' : 'Save Item'}</button>

        {/* Items Table */}
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Code</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Supplier</th>
              <th style={{ padding: '10px' }}>Pack Size</th>
              <th style={{ padding: '10px' }}>MOQ</th>
              <th style={{ padding: '10px' }}>Rate</th>
              <th style={{ padding: '10px' }}>In Stock</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600' }}>{i.code}</td>
                <td style={{ padding: '10px' }}>{i.name}</td>
                <td style={{ padding: '10px' }}>{i.supplier}</td>
                <td style={{ padding: '10px' }}>{i.packSize}</td>
                <td style={{ padding: '10px' }}>{i.moq}</td>
                <td style={{ padding: '10px' }}>{i.unitRate}</td>
                <td style={{ padding: '10px' }}>{i.inStock}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button onClick={() => { setItemCode(i.code); setItemName(i.name); setItemSupplier(i.supplier); setItemCountry(i.country); setItemPackSize(i.packSize); setItemWeight(i.weight); setItemCbm(i.cbm); setItemMoq(i.moq); setItemUnitRate(i.unitRate); setItemInStock(i.inStock); setEditingItemIdx(idx); }} style={{ marginRight: '6px', padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => setItems(items.filter((_, idx2) => idx2 !== idx))} style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
