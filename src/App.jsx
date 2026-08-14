import React, { useState, useMemo } from 'react';
import { 
  Package, 
  FileText, 
  Truck, 
  BarChart3, 
  Plus, 
  Search, 
  Download, 
  ArrowUpDown, 
  Layers, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';

export default function AITPortal() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Initial State: Inventory Stock Data
  const [inventory, setInventory] = useState([
    { id: 'SKU-8801', name: 'Industrial Grade Steel Rods', category: 'Raw Materials', stock: 1450, unit: 'pcs', unitCost: 45.00, supplier: 'Metro Metals Ltd', warehouse: 'WH-Dubai-01' },
    { id: 'SKU-8802', name: 'Polyethylene Granules (HDPE)', category: 'Polymers', stock: 3200, unit: 'kg', unitCost: 3.50, supplier: 'Gulf Polymers FZE', warehouse: 'WH-Dubai-01' },
    { id: 'SKU-8803', name: 'Aluminum Extrusion Profiles', category: 'Raw Materials', stock: 890, unit: 'pcs', unitCost: 78.50, supplier: 'Aluminium Bahrain', warehouse: 'WH-JebelAli-02' },
    { id: 'SKU-8804', name: 'Hydraulic Seal Kits', category: 'Components', stock: 430, sets: 215, unit: 'sets', unitCost: 120.00, supplier: 'Nordic Parts AB', warehouse: 'WH-Dubai-01' },
    { id: 'SKU-8805', name: 'Copper Wiring Harness 5m', category: 'Electrical', stock: 1200, unit: 'pcs', unitCost: 22.40, supplier: 'VoltCraft Industries', warehouse: 'WH-JebelAli-02' },
  ]);

  // Initial State: Proforma Invoices
  const [invoices, setInvoices] = useState([
    { piNumber: 'PI-2026-901', client: 'Al-Futtaim Engineering', date: '2026-08-10', totalAmount: 45200.00, status: 'Confirmed' },
    { piNumber: 'PI-2026-902', client: 'Emirates Global Trading', date: '2026-08-12', totalAmount: 18750.50, status: 'Draft' },
    { piNumber: 'PI-2026-903', client: 'Desert Line LLC', date: '2026-08-13', totalAmount: 92300.00, status: 'Dispatched' },
  ]);

  // Container Calculation State
  const [containerType, setContainerType] = useState('40ft');
  const [selectedItemsForContainer, setSelectedItemsForContainer] = useState([
    { sku: 'SKU-8801', qty: 500, cbmPerUnit: 0.04, weightPerUnit: 15 },
    { sku: 'SKU-8803', qty: 200, cbmPerUnit: 0.08, weightPerUnit: 22 }
  ]);

  // Container Capacities Limits (CBM & Max Weight in KG)
  const containerLimits = {
    '20ft': { maxCbm: 33, maxWeight: 28000 },
    '40ft': { maxCbm: 67, maxWeight: 29000 },
    '40ftHC': { maxCbm: 76, maxWeight: 28500 }
  };

  // Metrics calculation
  const totalValuation = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.stock * item.unitCost), 0);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.stock < 500).length;
  }, [inventory]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, filterCategory]);

  // Container calculation totals
  const containerTotals = useMemo(() => {
    return selectedItemsForContainer.reduce((acc, curr) => {
      acc.totalCbm += curr.qty * curr.cbmPerUnit;
      acc.totalWeight += curr.qty * curr.weightPerUnit;
      return acc;
    }, { totalCbm: 0, totalWeight: 0 });
  }, [selectedItemsForContainer]);

  const currentLimit = containerLimits[containerType];
  const cbmPercentage = Math.min(100, Math.round((containerTotals.totalCbm / currentLimit.maxCbm) * 100));
  const weightPercentage = Math.min(100, Math.round((containerTotals.totalWeight / currentLimit.maxWeight) * 100));

  const exportToCSV = (dataType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (dataType === 'inventory') {
      csvContent += "SKU,Item Name,Category,Stock,Unit,Unit Cost (AED),Supplier,Warehouse\r\n";
      inventory.forEach(row => {
        csvContent += `${row.id},"${row.name}",${row.category},${row.stock},${row.unit},${row.unitCost},"${row.supplier}",${row.warehouse}\r\n`;
      });
    } else {
      csvContent += "PI Number,Client,Date,Total Amount (AED),Status\r\n";
      invoices.forEach(row => {
        csvContent += `${row.piNumber},"${row.client}",${row.date},${row.totalAmount},${row.status}\r\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AIT_${dataType}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AIT Supplier Inventory & Trading Ledger
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Enterprise Portal</span>
            </h1>
            <p className="text-xs text-slate-400">Real-time Stock Valuation, Proforma Management & Container Optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Logged in as</div>
            <div className="text-sm font-medium text-slate-200">Abdul Rehman</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <button 
            onClick={() => alert("System synced successfully with local database via LAN.")}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 transition"
          >
            Sync Database (LAN)
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Menu */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Package className="w-5 h-5" />
            <span>Stock Ledger & Valuation</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Proforma Invoices (PI)</span>
          </button>

          <button 
            onClick={() => setActiveTab('container')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'container' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Truck className="w-5 h-5" />
            <span>Container Capacity Calculator</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Warehouse Analytics</span>
          </button>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Quick Metrics</div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Stock Value:</span>
                <span className="font-semibold text-emerald-400">AED {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Low Stock Items:</span>
                <span className={`font-semibold ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>{lowStockCount} SKU(s)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-900">
          
          {/* TAB 1: INVENTORY STOCK LEDGER */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Stock Ledger & Valuation</h2>
                  <p className="text-sm text-slate-400">Manage stock movements, valuations, and supplier warehouse balances.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => exportToCSV('inventory')}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm border border-slate-700 transition shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Item Name:");
                      const category = prompt("Enter Category (Raw Materials, Polymers, Components, Electrical):", "Raw Materials");
                      const stock = parseFloat(prompt("Enter Initial Stock Quantity:", "100") || 0);
                      const unitCost = parseFloat(prompt("Enter Unit Cost (AED):", "10.00") || 0);
                      const supplier = prompt("Enter Supplier Name:", "AIT Global Supplier");
                      if (name) {
                        setInventory([...inventory, {
                          id: `SKU-880${inventory.length + 1}`,
                          name,
                          category: category || 'Raw Materials',
                          stock,
                          unit: 'pcs',
                          unitCost,
                          supplier: supplier || 'Default',
                          warehouse: 'WH-Dubai-01'
                        }]);
                      }
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New SKU</span>
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search by SKU or item name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="All">All Categories</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Polymers">Polymers</option>
                    <option value="Components">Components</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">SKU & Item Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Stock Quantity</th>
                        <th className="p-4">Unit Cost (AED)</th>
                        <th className="p-4">Total Value (AED)</th>
                        <th className="p-4">Supplier / Warehouse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {filteredInventory.map((item) => {
                        const totalVal = item.stock * item.unitCost;
                        return (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4">
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-xs text-blue-400 font-mono">{item.id}</div>
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-medium text-slate-200">
                              {item.stock.toLocaleString()} {item.unit}
                            </td>
                            <td className="p-4 font-mono text-slate-300">
                              {item.unitCost.toFixed(2)}
                            </td>
                            <td className="p-4 font-mono font-semibold text-emerald-400">
                              {totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className="p-4 text-xs text-slate-400">
                              <div>{item.supplier}</div>
                              <div className="text-slate-500 font-mono">{item.warehouse}</div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredInventory.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No inventory items found matching your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFORMA INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Proforma Invoice (PI) Ledger</h2>
                  <p className="text-sm text-slate-400">Track outward proforma shipments, client orders, and billing statuses.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => exportToCSV('invoices')}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm border border-slate-700 transition shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                  <button 
                    onClick={() => {
                      const client = prompt("Enter Client Name:");
                      const amount = parseFloat(prompt("Enter Total Amount (AED):", "10000") || 0);
                      if (client && amount) {
                        setInvoices([...invoices, {
                          piNumber: `PI-2026-${904 + invoices.length}`,
                          client,
                          date: new Date().toISOString().slice(0, 10),
                          totalAmount: amount,
                          status: 'Draft'
                        }]);
                      }
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New PI</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">PI Reference</th>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total Amount (AED)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {invoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-4 font-mono font-semibold text-blue-400">{inv.piNumber}</td>
                        <td className="p-4 font-medium text-white">{inv.client}</td>
                        <td className="p-4 text-slate-400">{inv.date}</td>
                        <td className="p-4 font-mono font-semibold text-slate-200">
                          {inv.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                            inv.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            inv.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => alert(`Generating formal printable Proforma Invoice view for ${inv.piNumber}`)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition"
                          >
                            Print PI
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTAINER CAPACITY CALCULATOR */}
          {activeTab === 'container' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Container Capacity & Utilization Checker</h2>
                <p className="text-sm text-slate-400">Optimize freight loading configurations and check CBM/Weight restrictions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 lg:col-span-1 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <span>Container Specifications</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Container Type</label>
                    <select 
                      value={containerType}
                      onChange={(e) => setContainerType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="20ft">Standard 20ft (Max 33 CBM / 28,000 kg)</option>
                      <option value="40ft">Standard 40ft (Max 67 CBM / 29,000 kg)</option>
                      <option value="40ftHC">40ft High Cube (Max 76 CBM / 28,500 kg)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Container Limits</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Volume:</span>
                      <span className="font-mono font-bold text-white">{currentLimit.maxCbm} CBM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Weight:</span>
                      <span className="font-mono font-bold text-white">{currentLimit.maxWeight.toLocaleString()} kg</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const sku = prompt("Enter SKU Code to add to container calculation:", "SKU-8802");
                      const qty = parseFloat(prompt("Enter Quantity:", "500") || 0);
                      if (sku && qty) {
                        setSelectedItemsForContainer([...selectedItemsForContainer, { sku, qty, cbmPerUnit: 0.05, weightPerUnit: 12 }]);
                      }
                    }}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to Container</span>
                  </button>
                </div>

                {/* Utilization Meters */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-2 space-y-6 shadow-xl">
                  <h3 className="text-base font-bold text-white">Current Load Utilization</h3>

                  <div className="space-y-4">
                    {/* Volume Meter */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Volume Utilization (CBM)</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {containerTotals.totalCbm.toFixed(1)} / {currentLimit.maxCbm} CBM ({cbmPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${cbmPercentage > 90 ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${cbmPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Weight Meter */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Weight Utilization (KG)</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {containerTotals.totalWeight.toLocaleString()} / {currentLimit.maxWeight.toLocaleString()} kg ({weightPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${weightPercentage > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${weightPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Loaded Items Table */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Manifest Breakdown</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                            <th className="pb-2">SKU</th>
                            <th className="pb-2">Quantity</th>
                            <th className="pb-2">Est. Volume</th>
                            <th className="pb-2">Est. Weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {selectedItemsForContainer.map((item, idx) => (
                            <tr key={idx} className="font-mono text-xs">
                              <td className="py-2.5 text-blue-400 font-semibold">{item.sku}</td>
                              <td className="py-2.5 text-slate-200">{item.qty.toLocaleString()} units</td>
                              <td className="py-2.5 text-slate-300">{(item.qty * item.cbmPerUnit).toFixed(1)} CBM</td>
                              <td className="py-2.5 text-slate-300">{(item.qty * item.weightPerUnit).toLocaleString()} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WAREHOUSE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Warehouse & Inventory Analytics</h2>
                <p className="text-sm text-slate-400">High-level financial KPIs and category asset distribution.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Portfolio Valuation</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    AED {totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Aggregated across all regional warehouses</div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Active SKUs</div>
                  <div className="text-2xl font-bold font-mono text-blue-400">
                    {inventory.length} Items
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Monitored via LAN inventory sync</div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending Proforma Orders</div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {invoices.filter(i => i.status !== 'Confirmed').length} PIs
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Awaiting final client confirmation</div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">Category Valuation Breakdown</h3>
                <div className="space-y-3">
                  {['Raw Materials', 'Polymers', 'Components', 'Electrical'].map((cat) => {
                    const catTotal = inventory.filter(i => i.category === cat).reduce((acc, i) => acc + (i.stock * i.unitCost), 0);
                    const percentage = totalValuation > 0 ? Math.round((catTotal / totalValuation) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300 font-medium">{cat}</span>
                          <span className="font-mono text-slate-400">
                            AED {catTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
