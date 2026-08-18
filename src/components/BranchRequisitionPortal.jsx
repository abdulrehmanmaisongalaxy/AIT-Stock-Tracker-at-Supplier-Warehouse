import React, { useState } from 'react';

const BranchRequisitionPortal = ({ branchName = "Main Branch" }) => {
  const [items, setItems] = useState([
    { id: 1, name: 'Standard Office Paper (Ream)', category: 'Stationery', stock: 12, requested: 0 },
    { id: 2, name: 'Thermal Receipt Rolls', category: 'Operations', stock: 5, requested: 0 },
    { id: 3, name: 'Cleaning Solution (5L)', category: 'Maintenance', stock: 2, requested: 0 },
    { id: 4, name: 'Ballpoint Pens (Box of 50)', category: 'Stationery', stock: 25, requested: 0 },
  ]);
  
  const [submitted, setSubmitted] = useState(false);
  const [remarks, setRemarks] = useState('');

  const handleQuantityChange = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newRequested = Math.max(0, item.requested + delta);
        return { ...item, requested: newRequested };
      }
      return item;
    }));
  };

  const handleSubmitRequisition = (e) => {
    e.preventDefault();
    const activeRequests = items.filter(i => i.requested > 0);
    
    if (activeRequests.length === 0) {
      alert("Please select at least one item to request.");
      return;
    }

    console.log("Submitting Requisition for:", branchName, { activeRequests, remarks });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.card}>
        <h3 style={styles.successTitle}>Requisition Submitted Successfully!</h3>
        <p style={styles.text}>Your order has been logged and sent to the central supply team.</p>
        <button style={styles.buttonPrimary} onClick={() => { setSubmitted(false); setItems(items.map(i => ({...i, requested: 0}))); setRemarks(''); }}>
          Create New Requisition
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Branch Requisition Portal</h2>
        <span style={styles.badge}>Branch: {branchName}</span>
      </div>
      
      <form onSubmit={handleSubmitRequisition}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Current Stock</th>
                <th style={styles.th}>Quantity to Request</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}><strong>{item.name}</strong></td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>{item.stock}</td>
                  <td style={styles.td}>
                    <div style={styles.counterWrapper}>
                      <button type="button" style={styles.counterBtn} onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                      <span style={styles.requestedCount}>{item.requested}</span>
                      <button type="button" style={styles.counterBtn} onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.footerSection}>
          <label style={styles.label}>Additional Remarks / Urgency Notes:</label>
          <textarea 
            style={styles.textarea} 
            value={remarks} 
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any specific delivery instructions..."
          />
          <button type="submit" style={styles.buttonPrimary}>
            Submit Requisition Order
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { background: '#f8fafc', padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', color: '#334155', fontSize: '14px', verticalAlign: 'middle' },
  counterWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
  counterBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  requestedCount: { minWidth: '24px', textAlign: 'center', fontWeight: '600' },
  footerSection: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#475569' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' },
  buttonPrimary: { background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-end', marginTop: '10px' },
  card: { background: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '40px auto' },
  successTitle: { color: '#16a34a', marginBottom: '10px' },
  text: { color: '#64748b', marginBottom: '20px' }
};

export default BranchRequisitionPortal;
