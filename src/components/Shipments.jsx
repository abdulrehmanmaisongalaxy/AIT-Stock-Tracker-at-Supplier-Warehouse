import React, { useState } from 'react';

export default function Shipments({ shipments, setShipments, items, setItems, branches }) {
  const [shpRef, setShpRef] = useState('');
  const [containerType, setContainerType] = useState('40FT Container (Max ~58 CBM)');
  const [targetBranch, setTargetBranch] = useState(branches[0]?.name || 'MG Kinshasa');
  const [selectedItemsForShip, setSelectedItemsForShip] = useState({}); // { itemCode: qty }

  const handleQtyChange = (code, val) => {
    setSelectedItemsForShip({ ...selectedItemsForShip, [code]: Math.max(0, parseInt(val) || 0) });
  };

  let totalCbm = 0;
  let totalWeight = 0;
  const shipmentItemsList = [];

  items.forEach(item => {
    const qty = selectedItemsForShip[item.code] || 0;
    if (qty > 0) {
      totalCbm += qty * (item.cbm || 0.04);
      totalWeight += qty * (item.weight || 10);
      shipmentItemsList.push({ code: item.code, name: item.name, qty, weight: item.weight * qty, cbm: item.cbm * qty });
    }
  });

  const maxCbm = containerType.includes('20FT') ? 28 : 58;
  const fillRatio = Math.min(100, Math.round((totalCbm / maxCbm) * 100));

  const handleSaveShipment = (e) => {
    e.preventDefault();
    if (!shpRef || shipmentItemsList.length === 0) {
      alert('Please enter a shipment reference and select items to ship.');
      return;
    }

    const newShp = {
      id: shpRef,
      containerType,
      branch: targetBranch,
      cbm: totalCbm.toFixed(2),
      weight: totalWeight.toFixed(1),
      fillRatio,
      status: 'In Transit',
      items: shipmentItemsList
    };

    setShipments([...shipments, newShp]);

    // Update shipped quantity in master items
    const updatedItems = items.map(item => {
      const found = shipmentItemsList.find(s => s.code === item.code);
      if (found) {
        return { ...item, shippedQty: (item.shippedQty || 0) + found.qty };
      }
      return item;
    });
    setItems(updatedItems);

    setShpRef('');
    setSelectedItemsForShip({});
    alert('Shipment successfully created and linked to branch with real-time container fill calculation!');
  };

  const exportPackingListCSV = (shp) => {
    let csv = `Packing List / Shipment Ref:,${shp.id}\nContainer:,${shp.containerType}\nBranch:,${shp.branch}\nTotal CBM:,${shp.cbm} m3\nTotal Weight:,${shp.weight} kg\n\n`;
    csv += 'Item Code,Item Name,Shipped Qty,Total Weight (kg),Total CBM (m3)\n';
    shp.items.forEach(i => {
      csv += `"${i.code}","${i.name}",${i.qty},${i.weight},${i.cbm}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${shp.id}_packing_list.csv`;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Create New Shipment & Container Packing List</h3>
        <form onSubmit={handleSaveShipment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Shipment Ref No.</label>
              <input type="text" value={shpRef} onChange={(e) => setShpRef(e.target.value)} placeholder="e.g. SHP-SZ-002" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Container Type</label>
              <select value={containerType} onChange={(e) => setContainerType(e.target.value)} style={inputStyle}>
                <option>20FT Container (Max ~28 CBM)</option>
                <option>40FT Container (Max ~58 CBM)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Target Branch / Destination</label>
              <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)} style={inputStyle}>
                {branches.map(b => <option key={b.id} value={b.name}>{b.name} ({b.location})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>Select Items & Quantities to Ship</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Code</th>
                    <th style={{ padding: '6px' }}>Item Name</th>
                    <th style={{ padding: '6px' }}>Weight / CBM</th>
                    <th style={{ padding: '6px', width: '120px' }}>Shipping Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px' }}><b>{item.code}</b></td>
                      <td style={{ padding: '6px' }}>{item.name}</td>
                      <td style={{ padding: '6px' }}>{item.weight} kg / {item.cbm} m³</td>
                      <td style={{ padding: '6px' }}>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={selectedItemsForShip[item.code] || ''}
                          onChange={(e) => handleQtyChange(item.code, e.target.value)}
                          style={{ width: '90px', padding: '4px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Container Filling Ratio Footer Bar */}
          <div style={{ background: '#0f172a', color: '#fff', padding: '16px 20px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Real-Time Container Filling Ratio</div>
              <div style={{ fontSize: '14px', marginTop: '2px' }}>
                Weight: <b>{totalWeight.toFixed(1)} kg</b> | CBM: <b>{totalCbm.toFixed(2)} / {maxCbm} m³</b>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: fillRatio >= 80 ? '#22c55e' : '#facc15' }}>
                {fillRatio}% Filled
              </div>
              <button type="submit" style={btnPrimaryGreen}>Save & Link Shipment</button>
            </div>
          </div>
        </form>
      </div>

      {/* Shipments Directory */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Active Shipments & Branch Packing Lists</h3>
        {shipments.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No shipments created yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                <th style={thStyle}>Shipment Ref</th>
                <th style={thStyle}>Target Branch</th>
                <th style={thStyle}>Container Type</th>
                <th style={thStyle}>CBM / Weight</th>
                <th style={thStyle}>Fill Ratio</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Packing List</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}><b>{s.id}</b></td>
                  <td style={tdStyle}>{s.branch}</td>
                  <td style={tdStyle}>{s.containerType}</td>
                  <td style={tdStyle}>{s.cbm} m³ / {s.weight} kg</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#16a34a' }}>{s.fillRatio}%</td>
                  <td style={tdStyle}>{s.status}</td>
                  <td style={tdStyle}>
                    <button onClick={() => exportPackingListCSV(s)} style={btnSmCSV}>Download Packing List (CSV)</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const btnPrimaryGreen = { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSmCSV = { background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };
const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#475569' };
