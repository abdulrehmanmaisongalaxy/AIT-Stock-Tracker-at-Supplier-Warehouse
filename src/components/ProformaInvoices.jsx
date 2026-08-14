import React from 'react';

export function ProformaInvoices({ data, card, sectionLabel, EmptyState }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proforma Invoices &amp; Stock Receipts</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Manage supplier purchase orders, track incoming shipments, and receive stock into ledger.</p>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Active Proforma Invoices (PI)</div>
        {(data.pis || []).length === 0 ? (
          <EmptyState text="No proforma invoices found. Go to MOQ Consolidation to convert orders." />
        ) : (
          <div className="space-y-4">
            {data.pis.map(pi => {
              const supplier = data.suppliers.find(s => s.id === pi.supplierId);
              return (
                <div key={pi.id} className="p-4 bg-[#FAF8F5] border border-[#EFEAE0] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#1B2430]">{pi.piNumber}</span>
                      <span className="text-xs text-[#7A7568] ml-2">Supplier: {supplier?.name || "Unknown"}</span>
                    </div>
                    <span className="text-xs font-medium text-[#7A7568] bg-white px-2 py-1 rounded border border-[#E4DFD3]">{pi.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
