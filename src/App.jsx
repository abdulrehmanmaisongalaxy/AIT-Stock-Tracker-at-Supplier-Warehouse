import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  FileText, 
  Truck, 
  BarChart3, 
  Plus, 
  Search, 
  Layers, 
  CheckCircle2,
  FileSpreadsheet,
  Send,
  ArrowRight,
  ShieldCheck,
  Clock,
  Boxes,
  Globe
} from 'lucide-react';

export default function AITEnterprisePortal() {
  const [portalRole, setPortalRole] = useState('admin');
  const [adminTab, setAdminTab] = useState('consolidation');
  const [currentBranch, setCurrentBranch] = useState('Branch A');

  // 1. Persistent Inventory & Master Catalog State
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('ait_inventory');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'SKU-8801', name: 'Industrial Grade Steel Rods', category: 'Raw Materials', country: 'Turkey', supplier: 'Metro Metals Ltd', stock: 1450, unit: 'pcs', unitCost: 45.00, moq: 1000, allowedBranches: ['Branch A', 'Branch B'] },
      { id: 'SKU-8802', name: 'Polyethylene Granules (HDPE)', category: 'Polymers', country: 'Saudi Arabia', supplier: 'Gulf Polymers FZE', stock: 3200, unit: 'kg', unitCost: 3.50, moq: 3000, allowedBranches: ['Branch A'] },
      { id: 'SKU-8803', name: 'Aluminum Extrusion Profiles', category: 'Raw Materials', country: 'Bahrain', supplier: 'Aluminium Bahrain', stock: 890, unit: 'pcs', unitCost: 78.50, moq: 800, allowedBranches: ['Branch B'] },
      { id: 'SKU-8804', name: 'Hydraulic Seal Kits', category: 'Components', country: 'Sweden', supplier: 'Nordic Parts AB', stock: 430, unit: 'sets', unitCost: 120.00, moq: 500, allowedBranches: ['Branch A', 'Branch B'] },
    ];
  });

  // 2. Persistent Branch Orders State
  const [branchOrders, setBranchOrders] = useState(() => {
    const saved = localStorage.getItem('ait_branch_orders');
    if (saved) return JSON.parse(saved);
    return {
      'Branch A': { 'SKU-8801': 600, 'SKU-8802': 2500, 'SKU-8804': 200 },
      'Branch B': { 'SKU-8801': 300, 'SKU-8803': 400, 'SKU-8804': 150 }
    };
  });

  // 3. Persistent Proforma Invoices Ledger
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('ait_invoices');
    if (saved) return JSON.parse(saved);
    return [
      { piNumber: 'PI-2026-901', supplier: 'Metro Metals Ltd', date: '2026-08-10', totalAmount: 45200.00, status: 'Confirmed' },
      { piNumber: 'PI-2026-902', supplier: 'Gulf Polymers FZE', date: '2026-08-12', totalAmount: 18750.50, status: 'Draft' },
    ];
  });

  // 4. Shipments Module State
  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('ait_shipments');
    if (saved) return JSON.parse(saved);
    return [
      { trackingId: 'TRK-5501', piNumber: 'PI-2026-901', origin: 'Turkey', destination: 'Dubai Warehouse', status: 'In Transit', cbm: 42, weight: 14500 }
    ];
  });

  const [branchInputQty, setBranchInputQty] = useState({});

  // Save changes to localStorage automatically to prevent data loss
  useEffect(() => {
    localStorage.setItem('ait_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('ait_branch_orders', JSON.stringify(branchOrders));
  }, [branchOrders]);

  useEffect(() => {
    localStorage.setItem('ait_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('ait_shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Total Portfolio Valuation
  const totalValuation = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.stock * item.unitCost), 0);
  }, [inventory]);

  // Consolidated Item List calculation across all branches mapped against Supplier MOQ
  const consolidatedItems = useMemo(() => {
    const totals = {};
    Object.entries(branchOrders).forEach(([branchName, items]) => {
      Object.entries(items).forEach(([skuId, qty]) => {
        if (!totals[skuId]) {
          totals[skuId] = { totalQty: 0, breakdown: {} };
        }
        totals[skuId].totalQty += qty;
        totals[skuId].breakdown[branchName] = qty;
      });
    });

    return inventory.map(item => {
      const orderData = totals[item.id] || { totalQty: 0, breakdown: {} };
      const meetsMoq = orderData.totalQty >= item.moq;
      return {
        ...item,
        totalOrdered: orderData.totalQty,
        breakdown: orderData.breakdown,
        meetsMoq,
        status: meetsMoq ? 'Ready to Order' : 'On Hold (Below MOQ)'
      };
    });
  }, [inventory, branchOrders]);

  const handleBranchQtyChange = (skuId, val) => {
    setBranchInputQty(prev => ({ ...prev, [skuId]: val }));
  };

  const submitBranchOrder = (e) => {
    e.preventDefault();
    setBranchOrders(prev => ({
      ...prev,
      [currentBranch]: {
        ...(prev[currentBranch] || {}),
        ...Object.fromEntries(
          Object.entries(branchInputQty).map(([k, v]) => [k, parseFloat(v) || 0])
        )
      }
    }));
    alert(`Order quantities successfully recorded for ${currentBranch}. Consolidated totals updated.`);
    setBranchInputQty({});
  };

  const generatePIFromConsolidation = (item) => {
    if (!item.meetsMoq) {
      alert("Cannot place order. Total ordered quantity has not met the supplier's MOQ threshold.");
      return;
    }
    const piNumber = `PI-2026-${Math.floor(910 + Math.random() * 90)}`;
    const totalAmount = item.totalOrdered * item.unitCost;
    
    setInvoices(prev => [
      { piNumber, supplier: item.supplier, date: new Date().toISOString().slice(0, 10), totalAmount, status: 'Generated / Pending Supplier Dispatch' },
      ...prev
    ]);
    alert(`MOQ requirement cleared! Proforma Invoice ${piNumber} has been successfully generated for ${item.supplier}.`);
  };

  const exportToCSV = (dataType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (dataType === 'inventory') {
      csvContent += "SKU,Item Name,Category,Country,Supplier,Stock,Unit Cost (AED),MOQ\r\n";
      inventory.forEach(row => {
        csvContent += `${row.id},"${row.name}",${row.category},${row.country},"${row.supplier}",${row.stock},${row.unitCost},${row.moq}\r\n`;
      });
    } else {
      csvContent += "PI Number,Supplier,Date,Total Amount (AED),Status\r\n";
      invoices.forEach(row => {
        csvContent += `${row.piNumber},"${row.supplier}",${row.date},${row.totalAmount},${row.status}\r\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIT_${dataType}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AIT Supplier Inventory & Trading Ledger
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Enterprise Portal</span>
            </h1>
            <p className="text-xs text-slate-400">Stock Ledger, Multi-Branch MOQ Consolidation, PI Generation & Shipments Tracker</p>
          </div>
        </div>

        {/* Portal Role Toggle Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setPortalRole('admin')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${portalRole === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Head Office Dashboard
          </button>
          <button 
            onClick={() => setPortalRole('branch')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${portalRole === 'branch' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Branch Order Form Link
          </button>
        </div>
      </header>

      {portalRole === 'admin' ? (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Admin Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-2">
            <button 
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard & Analytics</span>
            </button>

            <button 
              onClick={() => setAdminTab('consolidation')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'consolidation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <Boxes className="w-5 h-5" />
              <span>MOQ Consolidation Engine</span>
            </button>

            <button 
              onClick={() => setAdminTab('inventory')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <Package className="w-5 h-5" />
              <span>Stock Ledger & Valuation</span>
            </button>
            
            <button 
              onClick={() => setAdminTab('invoices')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'invoices' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <FileText className="w-5 h-5" />
              <span>Proforma Invoices (PI)</span>
            </button>

            <button 
              onClick={() => setAdminTab('shipments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'shipments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <Truck className="w-5 h-5" />
              <span>Shipments Tracker</span>
            </button>

            <button 
              onClick={() => setAdminTab('setup')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${adminTab === 'setup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <Globe className="w-5 h-5" />
              <span>Master Setup & Branch Controls</span>
            </button>
          </aside>

          {/* Admin Content Panels */}
          <main className="flex-1 p-6 overflow-y-auto bg-slate-900">
            
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Executive Dashboard & KPIs</h2>
                  <p className="text-sm text-slate-400">High-level financial valuation and multi-country supplier stock performance.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Portfolio Valuation</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      AED {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Active stock across global warehouses</div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Supplier SKUs</div>
                    <div className="text-2xl font-bold font-mono text-blue-400">{inventory.length} Items</div>
                    <div className="text-xs text-slate-500 mt-2">Sourced across international hubs</div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending Proforma Orders</div>
                    <div className="text-2xl font-bold font-mono text-amber-400">
                      {invoices.filter(i => i.status !== 'Confirmed').length} PIs
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Awaiting supplier shipment confirmation</div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'consolidation' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Multi-Branch Order Consolidation & MOQ Engine</h2>
                  <p className="text-sm text-slate-400">Review aggregated branch demands against supplier MOQ. Place order to generate PI when MOQ is met, or hold for future branch orders.</p>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="p-4">SKU & Item Name</th>
                          <th className="p-4">Supplier & Country</th>
                          <th className="p-4">Supplier MOQ</th>
                          <th className="p-4">Total Ordered (All Branches)</th>
                          <th className="p-4">MOQ Status / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {consolidatedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4">
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-xs text-blue-400 font-mono">{item.id}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-200">{item.supplier}</div>
                              <div className="text-xs text-slate-500">{item.country}</div>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-300">
                              {item.moq.toLocaleString()} units
                            </td>
                            <td className="p-4">
                              <div className="font-mono font-bold text-emerald-400 text-base">
                                {item.totalOrdered.toLocaleString()} units
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {Object.entries(item.breakdown).map(([b, q]) => `${b}: ${q}`).join(' | ') || 'No branch orders yet'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col items-start gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 ${
                                  item.meetsMoq 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {item.meetsMoq ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  {item.status}
                                </span>

                                {item.meetsMoq ? (
                                  <button 
                                    onClick={() => generatePIFromConsolidation(item)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium transition flex items-center gap-1 shadow"
                                  >
                                    <span>Place Order & Generate PI</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500 italic">Holding until further orders received</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Stock Ledger & Valuation</h2>
                    <p className="text-sm text-slate-400">Available supplier warehouse stock across multiple international countries.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => exportToCSV('inventory')}
                      className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm border border-slate-700 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                    <button 
                      onClick={() => {
                        const name = prompt("Enter Item Name:");
                        const country = prompt("Enter Supplier Country:", "Turkey");
                        const supplier = prompt("Enter Supplier Name:", "Global Supplier FZE");
                        const stock = parseFloat(prompt("Enter Initial Stock:", "500") || 0);
                        const unitCost = parseFloat(prompt("Enter Unit Cost (AED):", "10") || 0);
                        const moq = parseFloat(prompt("Enter Supplier MOQ:", "500") || 100);
                        if (name) {
                          setInventory([...inventory, {
                            id: `SKU-880${inventory.length + 1}`,
                            name,
                            category: 'Raw Materials',
                            country,
                            supplier,
                            stock,
                            unit: 'pcs',
                            unitCost,
                            moq,
                            allowedBranches: ['Branch A', 'Branch B']
                          }]);
                        }
                      }}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Catalog Item</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">SKU & Item Name</th>
                        <th className="p-4">Supplier & Country</th>
                        <th className="p-4">Available Stock</th>
                        <th className="p-4">Unit Cost (AED)</th>
                        <th className="p-4">Total Value (AED)</th>
                        <th className="p-4">MOQ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {inventory.map((item) => {
                        const totalVal = item.stock * item.unitCost;
                        return (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4">
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-xs text-blue-400 font-mono">{item.id}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-200">{item.supplier}</div>
                              <div className="text-xs text-slate-500">{item.country}</div>
                            </td>
                            <td className="p-4 font-mono text-slate-200">{item.stock.toLocaleString()} {item.unit}</td>
                            <td className="p-4 font-mono text-slate-300">{item.unitCost.toFixed(2)}</td>
                            <td className="p-4 font-mono font-semibold text-emerald-400">{totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="p-4 font-mono text-slate-300">{item.moq}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Proforma Invoice (PI) Ledger</h2>
                    <p className="text-sm text-slate-400">Generated from consolidated branch orders meeting supplier MOQs.</p>
                  </div>
                  <button 
                    onClick={() => exportToCSV('invoices')}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm border border-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export PIs</span>
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">PI Number</th>
                        <th className="p-4">Supplier</th>
                        <th className="p-4">Date Issued</th>
                        <th className="p-4">Total Amount (AED)</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {invoices.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono font-semibold text-blue-400">{inv.piNumber}</td>
                          <td className="p-4 font-medium text-white">{inv.supplier}</td>
                          <td className="p-4 text-slate-400">{inv.date}</td>
                          <td className="p-4 font-mono font-semibold text-emerald-400">
                            AED {inv.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="p-4">
                            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'shipments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Shipments & Logistics Tracker</h2>
                  <p className="text-sm text-slate-400">Track containers and dispatches corresponding to confirmed PIs.</p>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Tracking ID</th>
                        <th className="p-4">PI Reference</th>
                        <th className="p-4">Origin / Route</th>
                        <th className="p-4">Volume / Weight</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {shipments.map((shp, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono font-semibold text-blue-400">{shp.trackingId}</td>
                          <td className="p-4 font-mono text-slate-300">{shp.piNumber}</td>
                          <td className="p-4 text-slate-300">{shp.origin} ➔ {shp.destination}</td>
                          <td className="p-4 font-mono text-xs text-slate-400">{shp.cbm} CBM | {shp.weight} kg</td>
                          <td className="p-4">
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                              {shp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'setup' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Master Setup & Branch Visibility Control</h2>
                  <p className="text-sm text-slate-400">Configure item catalog access restrictions for individual branches.</p>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-4 rounded-lg border border-slate-800 gap-4">
                      <div>
                        <div className="font-bold text-white">{item.name} <span className="font-mono text-xs text-blue-400">({item.id})</span></div>
                        <div className="text-xs text-slate-400 mt-1">Supplier: {item.supplier} | Country: {item.country} | MOQ: {item.moq}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Visible Branches:</span>
                        {item.allowedBranches.map(b => (
                          <span key={b} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2 py-0.5 rounded font-mono">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-blue-950/40 border border-blue-800/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Branch Order Requisition Link</h2>
                <p className="text-xs text-slate-300">Submit order quantities for items available at global supplier warehouses.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300">Logged-in Branch:</label>
              <select 
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="Branch A">Branch A (Dubai Hub)</option>
                <option value="Branch B">Branch B (Jebel Ali Hub)</option>
              </select>
            </div>
          </div>

          <form onSubmit={submitBranchOrder} className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Restricted Catalog for {currentBranch}</h3>
                <p className="text-xs text-slate-400">You can only view and order items assigned specifically to your branch permissions.</p>
              </div>
              <div className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded border border-slate-800">
                Active Orders Logged: <span className="font-mono text-emerald-400">{Object.keys(branchOrders[currentBranch] || {}).length} SKUs</span>
              </div>
            </div>

            <div className="space-y-4">
              {inventory
                .filter(item => item.allowedBranches.includes(currentBranch))
                .map((item) => {
                  const currentOrderedQty = branchOrders[currentBranch]?.[item.id] || 0;
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 p-4 rounded-lg border border-slate-800 gap-4">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          SKU: {item.id} | Supplier: {item.supplier} ({item.country}) | Supplier MOQ: {item.moq}
                        </div>
                        <div className="text-xs text-emerald-400 mt-1">
                          Previously Submitted Qty: {currentOrderedQty} units
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-xs text-slate-400 whitespace-nowrap">Order Qty:</label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          defaultValue={currentOrderedQty}
                          onChange={(e) => handleBranchQtyChange(item.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono w-28 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Branch Order Requisition</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
