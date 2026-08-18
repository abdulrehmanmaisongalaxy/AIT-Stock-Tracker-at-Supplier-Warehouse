import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Cleared out all dummy data as requested
  const [db, setDb] = useState({
    items: [],
    suppliers: [],
    branches: [],
    proformaInvoices: [],
    shipments: []
  });

  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    country: '',
    email: '',
    password: ''
  });

  const handleBranchSubmit = (e) => {
    e.preventDefault();
    const branchId = `br_${db.branches.length + 1}_${Date.now().toString().slice(-6)}`;
    const createdBranch = { ...newBranch, id: branchId };
    
    setDb({
      ...db,
      branches: [...db.branches, createdBranch]
    });
    
    setNewBranch({ name: '', location: '', country: '', email: '', password: '' });
    alert('Branch created successfully with a dedicated requisition link!');
  };

  const copyRequisitionLink = (branchId) => {
    const link = `${window.location.origin}/?branch=${branchId}`;
    navigator.clipboard.writeText(link);
    alert('Dedicated requisition link copied to clipboard!');
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', color: '#333333', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white px-4 py-3 mb-4 shadow-sm border-bottom">
        <div className="container-fluid">
          <div>
            <h4 className="mb-0 text-success fw-bold">
              <i className="fa-solid fa-boxes-stacked me-2"></i>AIT Supplier & Inventory Control Portal
            </h4>
            <small className="text-muted">Dubai HQ & Multi-Warehouse Stock Tracking Platform</small>
          </div>
          <span className="badge bg-success fs-6">Admin Mode Active</span>
        </div>
      </nav>

      <div className="container-fluid px-4">
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'dashboard' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'setup' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('setup')}>Master Setup & Import</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'moq' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('moq')}>Order Consolidation & MOQ</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'pi' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('pi')}>Proforma Invoices</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'ledger' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('ledger')}>Stock Ledger</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'shipments' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('shipments')}>Shipments & Containers</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'branches' ? 'active fw-bold text-success' : 'text-dark'}`} onClick={() => setActiveTab('branches')}>Branch Management & Links</button>
          </li>
        </ul>

        {/* Tab Content */}
        <div>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card p-3 border-start border-success border-4 shadow-sm bg-white">
                    <h6 className="text-muted">Total Items</h6>
                    <h3 className="fw-bold">{db.items.length}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 border-start border-primary border-4 shadow-sm bg-white">
                    <h6 className="text-muted">Active Suppliers</h6>
                    <h3 className="fw-bold">{db.suppliers.length}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 border-start border-warning border-4 shadow-sm bg-white">
                    <h6 className="text-muted">Registered Branches</h6>
                    <h3 className="fw-bold">{db.branches.length}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 border-start border-info border-4 shadow-sm bg-white">
                    <h6 className="text-muted">Active Shipments</h6>
                    <h3 className="fw-bold">{db.shipments.length}</h3>
                  </div>
                </div>
              </div>
              <div className="card p-4 shadow-sm bg-white">
                <h5>Welcome to AIT Stock Tracker</h5>
                <p className="text-muted">All dummy records have been cleared. Head over to <strong>Master Setup & Import</strong> to upload your fresh master and transactional datasets.</p>
              </div>
            </div>
          )}

          {/* Master Setup Tab */}
          {activeTab === 'setup' && (
            <div className="card p-4 shadow-sm bg-white">
              <h5 className="mb-3">Master Setup & CSV Imports</h5>
              <p className="text-muted">Upload fresh master data files for items, suppliers, and currency rules.</p>
              <div className="d-flex gap-3">
                <button className="btn btn-outline-secondary" onClick={() => alert('CSV template downloaded.')}><i class="fa-solid fa-download me-2"></i>Download CSV Template</button>
                <button className="btn btn-success" onClick={() => alert('Ready to receive fresh item uploads.')}><i class="fa-solid fa-upload me-2"></i>Import Items CSV</button>
              </div>
            </div>
          )}

          {/* MOQ Tab */}
          {activeTab === 'moq' && (
            <div className="card p-4 shadow-sm bg-white">
              <h5>Order Consolidation & MOQ Tracking</h5>
              <p className="text-muted">Consolidate branch requests to meet minimum order quantities.</p>
              <div className="alert alert-info">No active requisitions found.</div>
            </div>
          )}

          {/* Proforma Invoices Tab */}
          {activeTab === 'pi' && (
            <div className="card p-4 shadow-sm bg-white">
              <h5>Proforma Invoices (PI)</h5>
              <p className="text-muted">Manage supplier PI confirmations and financial statuses.</p>
              <div className="alert alert-info">No proforma invoices available.</div>
            </div>
          )}

          {/* Stock Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="card p-4 shadow-sm bg-white">
              <h5>Stock Ledger</h5>
              <p className="text-muted">Track live inventory balances across warehouses.</p>
              <div className="alert alert-info">Ledger is currently empty.</div>
            </div>
          )}

          {/* Shipments Tab (Fixed Blank Screen Issue) */}
          {activeTab === 'shipments' && (
            <div className="card p-4 shadow-sm bg-white">
              <h5 className="mb-3"><i className="fa-solid fa-ship me-2"></i>Shipments & Containers Tracking</h5>
              <p className="text-muted">Monitor departures, customs clearance, and warehouse arrivals.</p>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Shipment ID</th>
                      <th>Supplier</th>
                      <th>Container No</th>
                      <th>ETD</th>
                      <th>ETA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.shipments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">No shipments recorded yet. Upload fresh shipment tracking data.</td>
                      </tr>
                    ) : (
                      db.shipments.map((s, idx) => (
                        <tr key={idx}>
                          <td>{s.id}</td>
                          <td>{s.supplier}</td>
                          <td>{s.containerNo}</td>
                          <td>{s.etd}</td>
                          <td>{s.eta}</td>
                          <td>{s.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Branch Management & Links Tab */}
          {activeTab === 'branches' && (
            <div>
              <div className="card p-4 shadow-sm bg-white mb-4">
                <h5 className="mb-3">Add New Branch</h5>
                <form onSubmit={handleBranchSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <input type="text" className="form-control" placeholder="Branch Name" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <input type="text" className="form-control" placeholder="Location / City" value={newBranch.location} onChange={e => setNewBranch({...newBranch, location: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <input type="text" className="form-control" placeholder="Country" value={newBranch.country} onChange={e => setNewBranch({...newBranch, country: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <input type="email" className="form-control" placeholder="Branch Login Email" value={newBranch.email} onChange={e => setNewBranch({...newBranch, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <input type="password" className="form-control" placeholder="Password" value={newBranch.password} onChange={e => setNewBranch({...newBranch, password: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success mt-3"><i className="fa-solid fa-plus me-2"></i>Save Branch</button>
                </form>
              </div>

              <div className="card p-4 shadow-sm bg-white">
                <h5 className="mb-3">Registered Branches & Requisition Links</h5>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Branch Name</th>
                        <th>Location</th>
                        <th>Login Email</th>
                        <th>Direct Requisition Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.branches.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">No branches created yet.</td>
                        </tr>
                      ) : (
                        db.branches.map((b, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">{b.name}</td>
                            <td>{b.location}, {b.country}</td>
                            <td>{b.email}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-success" onClick={() => copyRequisitionLink(b.id)}>
                                <i className="fa-solid fa-copy me-1"></i> Copy Requisition Link
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
