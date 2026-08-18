import React, { useState } from 'react';
import MasterSetup from './components/MasterSetup';
import BranchHandling from './components/BranchHandling';
import BranchPortal from './components/BranchPortal';
import OrderConsolidation from './components/OrderConsolidation';
import ProformaInvoices from './components/ProformaInvoices';
import StockLedger from './components/StockLedger';
import Shipments from './components/Shipments';

export default function App() {
  const [activeTab, setActiveTab] = useState('master');

  // Core Data States
  const [suppliers, setSuppliers] = useState([
    { code: 'SUP01', name: 'Guangzhou Beauty Ltd', warehouse: 'WH-CN-01', currency: 'USD', country: 'China' }
  ]);
  const [items, setItems] = useState([
    { code: 'COS-01', name: 'Matte Lipstick Set', supplier: 'Guangzhou Beauty Ltd', country: 'China', packSize: 'Box of 24', weight: 2.5, cbm: 0.03, moq: 50, unitRate: 15.00, inStock: 500 }
  ]);
  const [branches, setBranches] = useState([
    { name: 'MG Kinshasa', location: 'DRC', username: 'kinshasa', password: '123', allowedItems: ['COS-01'] }
  ]);
  const [requisitions, setRequisitions] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [stockLedger, setStockLedger] = useState([
    { code: 'COS-01', name: 'Matte Lipstick Set', supplier: 'Guangzhou Beauty Ltd', country: 'China', currency: 'USD', openingStock: 500, orderedQty: 0, receivedQty: 500, shippedQty: 0, closingStock: 500, unitRateLCY: 15.00, unitRateUSD: 15.00 }
  ]);
  const [shipments, setShipments] = useState([]);

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f1f5f9', minHeight: '100vh', margin: 0 }}>
      {/* Navigation Header */}
      <nav style={{ background: '#1e293b', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>AIT Supplier & Stock Portal</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('master')} style={navBtnStyle(activeTab === 'master')}>Master Setup</button>
          <button onClick={() => setActiveTab('branches')} style={navBtnStyle(activeTab === 'branches')}>Branch Management</button>
          <button onClick={() => setActiveTab('branchPortal')} style={navBtnStyle(activeTab === 'branchPortal')}>Branch Portal (Client)</button>
          <button onClick={() => setActiveTab('consolidation')} style={navBtnStyle(activeTab === 'consolidation')}>Order Consolidation</button>
          <button onClick={() => setActiveTab('pi')} style={navBtnStyle(activeTab === 'pi')}>Proforma Invoices</button>
          <button onClick={() => setActiveTab('ledger')} style={navBtnStyle(activeTab === 'ledger')}>Stock Ledger</button>
          <button onClick={() => setActiveTab('shipments')} style={navBtnStyle(activeTab === 'shipments')}>Shipments & Containers</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ padding: '20px' }}>
        {activeTab === 'master' && <MasterSetup items={items} setItems={setItems} suppliers={suppliers} setSuppliers={setSuppliers} />}
        {activeTab === 'branches' && <BranchHandling branches={branches} setBranches={setBranches} items={items} />}
        {activeTab === 'branchPortal' && <BranchPortal branches={branches} items={items} onsubmitRequisition={(req) => setRequisitions([...requisitions, req])} />}
        {activeTab === 'consolidation' && <OrderConsolidation requisitions={requisitions} setRequisitions={setRequisitions} proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} />}
        {activeTab === 'pi' && <ProformaInvoices proformaInvoices={proformaInvoices} setProformaInvoices={setProformaInvoices} suppliers={suppliers} stockLedger={stockLedger} setStockLedger={setStockLedger} />}
        {activeTab === 'ledger' && <StockLedger stockLedger={stockLedger} suppliers={suppliers} />}
        {activeTab === 'shipments' && <Shipments branches={branches} stockLedger={stockLedger} shipments={shipments} setShipments={setShipments} items={items} />}
      </main>
    </div>
  );
}

function navBtnStyle(isActive) {
  return {
    padding: '8px 14px',
    background: isActive ? '#16a34a' : '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? 'bold' : 'normal'
  };
}
