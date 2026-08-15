import React from 'react';

export function StockLedger({ items = [], suppliers = [], proformaInvoices = [], shipments = [] }) {
  const ledgerData = items.map(item => {
    let totalOrdered = 0;
    proformaInvoices.forEach(pi => {
      (pi.items || []).forEach(piItm => {
        if (piItm.itemId === item.id) totalOrdered += Number(piItm.qty || 0);
      });
    });

    let totalShipped = 0;
    shipments.forEach(shp => {
      (shp.items || []).forEach(shpItm => {
        if (shpItm.itemId === item.id) totalShipped += Number(shpItm.qty || 0);
      });
    });

    const balanceStock = totalOrdered - totalShipped;
    const sup = suppliers.find(s => s.name === item.supplier || s.id === item.supplier);

    return {
      ...item,
      supplierName: sup ? sup.name : (item.supplier || 'N/A'),
      warehouse: sup ? sup.warehouse : 'Supplier Warehouse',
      country: sup ? sup.country : 'Unknown',
      totalOrdered,
      totalShipped,
      balanceStock
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1B2430]">Supplier Warehouse Stock Ledger</h2>
        <p className="text-xs text-[#7A7568]">Live tracking of available inventory across supplier warehouses in China, Thailand, and local hubs.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DFD3] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E4DFD3] bg-[#FAF8F5]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7568]">Inventory Balance Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E4DFD3] text-[#7A7568]">
                <th className="p-3 font-semibold">Item Code</th>
                <th className="p-3 font-semibold">Item Name</th>
                <th className="p-3 font-semibold">Pack Size</th>
                <th className="p-3 font-semibold">Supplier</th>
                <th className="p-3 font-semibold text-right">Total Purchased (PI)</th>
                <th className="p-3 font-semibold text-right">Total Shipped</th>
                <th className="p-3 font-semibold text-right">Available Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {ledgerData.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">No items registered in master setup.</td></tr>
              ) : (
                ledgerData.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAF8F5]">
                    <td className="p-3 font-bold text-[#1B2430]">{row.id}</td>
                    <td className="p-3 text-[#1B2430] font-medium">{row.name}</td>
                    <td className="p-3 text-[#7A7568]">{row.packSize || 'N/A'}</td>
                    <td className="p-3 text-[#1B2430]">{row.supplierName} ({row.country})</td>
                    <td className="p-3 text-right font-medium text-[#1B2430]">{row.totalOrdered} {row.unit}</td>
                    <td className="p-3 text-right font-medium text-rose-600">-{row.totalShipped} {row.unit}</td>
                    <td className="p-3 text-right font-bold">
                      <span className={`px-2.5 py-1 rounded-lg ${row.balanceStock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                        {row.balanceStock} {row.unit}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
