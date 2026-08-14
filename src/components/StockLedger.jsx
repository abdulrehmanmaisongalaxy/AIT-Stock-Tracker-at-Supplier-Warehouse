import React from 'react';

export function StockLedger({ data, card, sectionLabel, fmt, EmptyState }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Ledger &amp; Warehouse Inventory</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Track real-time inventory levels available across different international suppliers.</p>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Inventory Availability Matrix</div>
        {(data.products || []).length === 0 ? (
          <EmptyState text="No products found in the catalog." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-2 font-semibold">Item Name</th>
                  <th className="text-left py-2 font-semibold">SKU Code</th>
                  <th className="text-left py-2 font-semibold">Supplier</th>
                  <th className="text-right py-2 font-semibold">Packing Size</th>
                  <th className="text-right py-2 font-semibold">Available Stock / Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {data.products.map(p => {
                  const supplier = data.suppliers.find(s => s.id === p.supplierId);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5 text-xs font-mono text-[#7A7568]">{p.sku || "—"}</td>
                      <td className="py-2.5 text-xs text-[#7A7568]">{supplier?.name || "General"} ({supplier?.country || "—"})</td>
                      <td className="text-right py-2.5 text-xs text-[#7A7568]">{p.packingSize || "—"}</td>
                      <td className="text-right py-2.5 font-bold text-[#1B2430]">{fmt(p.stock || 0)} {p.unit || "pcs"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
