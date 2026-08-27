import React, { useState } from 'react';

export default function StockLedger({ stockLedger = [], suppliers = [] }) {
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLedger = stockLedger.filter(row => {
    const supObj = suppliers.find(s => s.name?.toLowerCase() === row.supplier?.toLowerCase());
    const rowCountry = row.country || supObj?.country || '';
    
    const countryMatch = selectedCountry === 'All' || rowCountry.toLowerCase() === selectedCountry.toLowerCase();
    const supplierMatch = selectedSupplier === 'All' || row.supplier?.toLowerCase() === selectedSupplier.toLowerCase();
    
    const searchMatch = !searchTerm || 
      (row.code && row.code.toString().toLowerCase().includes(searchTerm.toLowerCase())) || 
      (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return countryMatch && supplierMatch && searchMatch;
  });

  // Calculate summary metrics
  const totalItemsCount = filteredLedger.length;
  const totalUnitsInStock = filteredLedger.reduce((sum, r) => sum + Number(r.closingStock || 0), 0);
  const totalPortfolioUSD = filteredLedger.reduce((sum, r) => sum + (Number(r.closingStock || 0) * Number(r.unitPriceUSD || 0)), 0);

  const exportToCSV = () => {
    let csv = "Code,Name,Supplier,Opening,Ordered,Received,Shipped,Closing,Unit Price LCY,Currency,Total Value USD\n";
    filteredLedger.forEach(r => {
      csv += `${r.code || ''},"${(r.name || '').replace(/"/g, '""')}","${(r.supplier || '').replace(/"/g, '""')}",${r.openingStock || 0},${r.orderedQty || 0},${r.receivedQty || 0},${r.shippedQty || 0},${r.closingStock || 0},${r.unitPriceLCY || 0},${r.currency || ''},${(Number(r.closingStock || 0) * Number(r.unitPriceUSD || 0)).toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'stock_ledger_report.csv'; 
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableCountries = [...new Set(suppliers.map(s => s.country).filter(Boolean))];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Stock Ledger & Multi-Warehouse Tracking</h2>
          <p className="text-sm text-slate-400">Real-time inventory movement, valuations in LCY and USD across supplier warehouses.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search code or name..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none flex-1 md:w-48 shadow-sm"
          />
          <select 
            value={selectedSupplier} 
            onChange={e => setSelectedSupplier(e.target.value)} 
            className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="All">All Suppliers</option>
            {suppliers.map(s => <option key={s.code || s.name} value={s.name}>{s.name}</option>)}
          </select>
          <select 
            value={selectedCountry} 
            onChange={e => setSelectedCountry(e.target.value)} 
            className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="All">All Countries</option>
            {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={exportToCSV} 
            className="bg-emerald-600 hover:bg-emerald-500 text-sm px-4 py-2 rounded-lg font-semibold shadow transition-colors text-white cursor-pointer"
          >
            Export Excel/CSV
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">Filtered SKUs</p>
          <p className="text-2xl font-bold text-white mt-1">{totalItemsCount}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">Total Closing Units</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalUnitsInStock.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">Total Portfolio Value (USD)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalPortfolioUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400 text-xs">
              <th className="p-3">Code</th>
              <th className="p-3">Item Name</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Opening</th>
              <th className="p-3">Ordered</th>
              <th className="p-3">Received</th>
              <th className="p-3">Shipped</th>
              <th className="p-3">Closing Stock</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3 text-right">Total Value (USD)</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-12 text-center text-slate-400">
                  No stock records found. Receive goods via Proforma Invoices or Purchase Orders to populate ledger.
                </td>
              </tr>
            ) : (
              filteredLedger.map((row, idx) => {
                const totalValUSD = Number(row.closingStock || 0) * Number(row.unitPriceUSD || 0);
                return (
                  <tr key={row.code || idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-semibold text-white">{row.code}</td>
                    <td className="p-3 text-slate-200">{row.name}</td>
                    <td className="p-3 text-slate-300">{row.supplier}</td>
                    <td className="p-3 text-slate-300">{row.openingStock || 0}</td>
                    <td className="p-3 text-slate-300">{row.orderedQty || 0}</td>
                    <td className="p-3 text-slate-300">{row.receivedQty || 0}</td>
                    <td className="p-3 text-slate-300">{row.shippedQty || 0}</td>
                    <td className="p-3 font-bold text-emerald-400">{row.closingStock || 0}</td>
                    <td className="p-3 text-slate-300">{row.unitPriceLCY || 0} {row.currency || ''}</td>
                    <td className="p-3 text-right font-semibold text-slate-100">${totalValUSD.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
