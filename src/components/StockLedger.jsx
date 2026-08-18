import React, { useState } from 'react';

export default function StockLedger({ stockLedger, suppliers }) {
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const filteredLedger = stockLedger.filter(row => {
    const supObj = suppliers.find(s => s.name === row.supplier);
    const countryMatch = selectedCountry === 'All' || (supObj && supObj.country === selectedCountry);
    const supplierMatch = selectedSupplier === 'All' || row.supplier === selectedSupplier;
    return countryMatch && supplierMatch;
  });

  const exportToCSV = () => {
    let csv = "Code,Name,Supplier,Opening,Ordered,Received,Shipped,Closing,Unit Price LCY,Currency,Total Value USD\n";
    filteredLedger.forEach(r => {
      csv += `${r.code},"${r.name}","${r.supplier}",${r.openingStock || 0},${r.orderedQty || 0},${r.receivedQty || 0},${r.shippedQty || 0},${r.closingStock || 0},${r.unitPriceLCY},${r.currency},${(Number(r.closingStock || 0) * Number(r.unitPriceUSD || 0)).toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'stock_ledger_report.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Stock Ledger & Multi-Warehouse Tracking</h2>
          <p className="text-sm text-slate-400">Real-time inventory movement, valuations in LCY and USD across supplier warehouses.</p>
        </div>
        <div className="flex gap-3">
          <select value={selectedSupplier} onChange={e=>setSelectedSupplier(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm">
            <option value="All">All Suppliers</option>
            {suppliers.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
          </select>
          <select value={selectedCountry} onChange={e=>setSelectedCountry(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm">
            <option value="All">All Countries</option>
            {[...new Set(suppliers.map(s => s.country))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500 text-sm px-4 py-2 rounded-lg font-semibold shadow">Export Excel/CSV</button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400">
              <th className="p-3">Code</th><th className="p-3">Item Name</th><th className="p-3">Supplier</th><th className="p-3">Opening</th><th className="p-3">Ordered</th><th className="p-3">Received</th><th className="p-3">Shipped</th><th className="p-3">Closing Stock</th><th className="p-3">Unit Price</th><th className="p-3 text-right">Total Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.length === 0 ? (
              <tr><td colSpan="10" className="p-6 text-center text-slate-400">No stock records found. Receive goods via Proforma Invoices to populate ledger.</td></tr>
            ) : (
              filteredLedger.map((row, idx) => {
                const totalValUSD = Number(row.closingStock || 0) * Number(row.unitPriceUSD || 0);
                return (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-semibold">{row.code}</td>
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.supplier}</td>
                    <td className="p-3">{row.openingStock || 0}</td>
                    <td className="p-3">{row.orderedQty || 0}</td>
                    <td className="p-3">{row.receivedQty || 0}</td>
                    <td className="p-3">{row.shippedQty || 0}</td>
                    <td className="p-3 font-bold text-emerald-400">{row.closingStock || 0}</td>
                    <td className="p-3">{row.unitPriceLCY} {row.currency}</td>
                    <td className="p-3 text-right font-semibold">${totalValUSD.toFixed(2)}</td>
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
