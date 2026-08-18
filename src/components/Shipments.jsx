import React, { useState } from 'react';

export default function Shipments({ branches, stockLedger, shipments, setShipments, items }) {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [containerType, setContainerType] = useState('20FT');
  const [shippingItems, setShippingItems] = useState({});

  const handleQtyChange = (code, val) => {
    setShippingItems({ ...shippingItems, [code]: Math.max(0, parseInt(val) || 0) });
  };

  let totalCbm = 0;
  let totalWeight = 0;
  Object.keys(shippingItems).forEach(code => {
    const qty = shippingItems[code] || 0;
    const itemMaster = items.find(i => i.code === code);
    if (itemMaster) {
      totalCbm += qty * (itemMaster.cbm || 0);
      totalWeight += qty * (itemMaster.weight || 0);
    }
  });

  const capacityCbm = containerType === '20FT' ? 28 : 58;
  const fillRatio = Math.min(100, ((totalCbm / capacityCbm) * 100)).toFixed(1);

  const handleCreateShipment = () => {
    if (!selectedBranch) {
      alert('Please select a destination branch.');
      return;
    }
    const shippedList = Object.keys(shippingItems)
      .filter(code => shippingItems[code] > 0)
      .map(code => {
        const im = items.find(i => i.code === code);
        return { code, name: im ? im.name : code, qty: shippingItems[code] };
      });

    if (shippedList.length === 0) {
      alert('Select items to ship.');
      return;
    }

    const newShipment = {
      id: 'SHP-' + Math.floor(1000 + Math.random() * 9000),
      branch: selectedBranch,
      containerType,
      totalCbm: totalCbm.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      fillRatio,
      items: shippedList,
      date: new Date().toISOString().split('T')[0]
    };

    setShipments([...shipments, newShipment]);
    setShippingItems({});
    alert('Shipment container created successfully!');
  };

  const exportPackingListCSV = (shp) => {
    let csv = 'Item Code,Item Name,Shipped Qty\n';
    shp.items.forEach(i => {
      csv += `${i.code},"${i.name}",${i.qty}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Packing_List_${shp.id}.csv`);
    a.click();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Shipments & Container Loading</h2>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3>Create New Container Shipment</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Select Destination Branch</label>
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="">Select Branch</option>
              {branches.map((b, idx) => <option key={idx} value={b.name}>{b.name} ({b.location})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Container Type</label>
            <select value={containerType} onChange={e => setContainerType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="20FT">20FT Container</option>
              <option value="40FT">40FT Container</option>
            </select>
          </div>
        </div>

        <h4>Select Available Stock Items to Load</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '8px' }}>Code</th>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Supplier</th>
              <th style={{ padding: '8px' }}>Available Stock</th>
              <th style={{ padding: '8px', width: '120px' }}>Ship Qty</th>
            </tr>
          </thead>
          <tbody>
            {stockLedger.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: '600' }}>{s.code}</td>
                <td style={{ padding: '8px' }}>{s.name}</td>
                <td style={{ padding: '8px' }}>{s.supplier}</td>
                <td style={{ padding: '8px' }}>{s.closingStock}</td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    min="0" 
                    max={s.closingStock} 
                    value={shippingItems[s.code] || ''} 
                    onChange={e => handleQtyChange(s.code, e.target.value)}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <span>Total CBM: <b>{totalCbm.toFixed(2)} m³</b> | Total Weight: <b>{totalWeight.toFixed(2)} kg</b></span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#16a34a' }}>
            Container Fill Ratio ({containerType}): {fillRatio}%
          </div>
        </div>

        <button onClick={handleCreateShipment} style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Save Shipment & Generate Packing List
        </button>
      </div>

      <h3>Active Shipments & Packing Lists</h3>
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Shipment ID</th>
            <th style={{ padding: '12px' }}>Branch</th>
            <th style={{ padding: '12px' }}>Container</th>
            <th style={{ padding: '12px' }}>Total CBM</th>
            <th style={{ padding: '12px' }}>Fill Ratio</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Packing List</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shp, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px', fontWeight: '600' }}>{shp.id}</td>
              <td style={{ padding: '12px' }}>{shp.branch}</td>
              <td style={{ padding: '12px' }}>{shp.containerType}</td>
              <td style={{ padding: '12px' }}>{shp.totalCbm} m³</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{shp.fillRatio}%</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => exportPackingListCSV(shp)} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Download CSV
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
