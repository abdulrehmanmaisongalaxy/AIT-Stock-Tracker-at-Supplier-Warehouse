import React from 'react';

export default function StockLedgerTab({ items, setItems, requisitions, ledgerSupplierFilter, setLedgerSupplierFilter, ledgerCountryFilter, setLedgerCountryFilter }) {
  const getTotalPiOrdered = (itemId) => {
    return Object.values(requisitions).reduce((sum, branchReqs) => sum + (Number(branchReqs[itemId]) || 0), 0);
  };

  const handleOpeningStockChange = (id, val) => {
    setItems(items.map(item => item.id === id ? { ...item, openingStock: Number(val) } : item));
  };

  const handleUnitPriceChange = (id, val) => {
    setItems(items.map(item => item.id === id ? { ...item, unitPrice: Number(val) } : item));
  };

  const filteredItems = items.filter(item => {
    if (ledgerSupplierFilter !== 'ALL' && item.supplier !== ledgerSupplierFilter) return false;
    if (ledgerCountryFilter !== 'ALL' && item.country !== ledgerCountryFilter) return false;
    return true;
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold">STOCK LEDGER & INVENTORY VALUATION</h2>
          <p className="text-xs text-gray-400">Real-time tracking of master inventory items, opening quantities, stock valuation, and movements</p>
        </div>
        
        {/* Global Filters */}
        <div className="flex flex-wrap gap-2">
          <select 
            value={ledgerSupplierFilter} 
            onChange={(e) => setLedgerSupplierFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-1.5 text-gray-200"
          >
            <option value="ALL">All Suppliers (Select All)</option>
            {[...new Set(items.map(i => i.supplier))].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select 
            value={ledgerCountryFilter} 
            onChange={(e) => setLedgerCountryFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-1.5 text-gray-200"
          >
            <option value="ALL">All Countries (Select All)</option>
            {[...new Set(items.map(i => i.country).filter(Boolean))].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 bg-gray-900/40">
              <th className="p-3">Item Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Opening Stock</th>
              <th className="p-3">Unit Price ($)</th>
              <th className="p-3">Stock Value ($)</th>
              <th className="p-3">PI Ordered</th>
              <th className="p-3">Available Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const piOrdered = getTotalPiOrdered(item.id);
              const availableStock = (item.openingStock || 0) + piOrdered;
              const stockValue = (item.openingStock || 0) * (item.unitPrice || 0);

              return (
                <tr key={item.id} className="border-b border-gray-700/60 hover:bg-gray-700/20">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-gray-400">{item.category}</td>
                  <td className="p-3 text-gray-400">{item.supplier}</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      value={item.openingStock || 0} 
                      onChange={(e) => handleOpeningStockChange(item.id, e.target.value)}
                      className="w-24 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center text-white"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={item.unitPrice || 0} 
                      onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                      className="w-24 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-center text-white"
                    />
                  </td>
                  <td className="p-3 font-semibold text-emerald-400">${stockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-blue-400">{piOrdered} PCS</td>
                  <td className="p-3 font-bold text-white">{availableStock} PCS</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
