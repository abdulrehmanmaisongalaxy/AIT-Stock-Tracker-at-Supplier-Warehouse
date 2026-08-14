import React, { useState, useMemo } from 'react';
import { CheckSquare } from 'lucide-react';

export function MOQConsolidationTab({ data, save, showToast, card, sectionLabel, inputCls, btnPrimary, EmptyState, Stamp, fmt, num, uid, todayStr }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(data.suppliers[0]?.id || "");

  const supplierOrders = useMemo(() => {
    if (!selectedSupplierId) return [];
    const orders = data.branchOrders || [];
    const supplierProducts = new Set(
      data.products.filter(p => p.supplierId === selectedSupplierId).map(p => p.id)
    );

    const consolidatedMap = {};
    orders.forEach(ord => {
      ord.items.forEach(it => {
        if (supplierProducts.has(it.productId)) {
          consolidatedMap[it.productId] = (consolidatedMap[it.productId] || 0) + num(it.qty);
        }
      });
    });

    return Object.entries(consolidatedMap).map(([productId, totalQty]) => {
      const p = data.products.find(prod => prod.id === productId);
      const moq = num(p?.moq || 100); 
      return {
        productId,
        productName: p?.name || "—",
        sku: p?.sku || "—",
        unit: p?.unit || "pcs",
        totalQty,
        moq,
        met: totalQty >= moq
      };
    });
  }, [data, selectedSupplierId]);

  const convertToPI = () => {
    const validItems = supplierOrders
      .filter(o => o.totalQty > 0)
      .map(o => ({
        productId: o.productId,
        qty: o.totalQty,
        unitPrice: 0,
        receivedQty: 0
      }));

    if (validItems.length === 0) {
      showToast("No quantities available to convert into PI", "error");
      return;
    }

    const newPI = {
      id: uid(),
      supplierId: selectedSupplierId,
      piNumber: `PI-CONSOL-${Math.floor(Math.random() * 8999 + 1000)}`,
      date: todayStr(),
      items: validItems
    };

    const nextData = {
      ...data,
      pis: [...data.pis, newPI],
      branchOrders: []
    };

    save(nextData, "Successfully consolidated branch orders into a new Proforma Invoice!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MOQ Consolidation &amp; Procurement</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Consolidate multi-branch requisitions against supplier Minimum Order Quantities (MOQ).</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className={inputCls + " font-medium text-xs py-1.5"}
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
          >
            {data.suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.country || "General"})</option>
            ))}
          </select>

          <button onClick={convertToPI} className={btnPrimary}>
            <CheckSquare className="w-4 h-4 text-[#C98A3E]" /> Convert to Purchase Order (PI)
          </button>
        </div>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Consolidated Demand vs. MOQ Threshold</div>
        {supplierOrders.length === 0 ? (
          <EmptyState text="No branch requisitions found for this supplier." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-2 font-semibold">Item Name &amp; Code</th>
                  <th className="text-right py-2 font-semibold">Total Branch Demand</th>
                  <th className="text-right py-2 font-semibold">Target MOQ</th>
                  <th className="text-center py-2 font-semibold">MOQ Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {supplierOrders.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-2.5 font-medium">
                      {row.productName} {row.sku && <span className="text-xs text-[#7A7568] font-mono">({row.sku})</span>}
                    </td>
                    <td className="text-right py-2.5 font-bold text-[#1B2430]">
                      {fmt(row.totalQty)} {row.unit}
                    </td>
                    <td className="text-right py-2.5 text-[#7A7568]">
                      {fmt(row.moq)} {row.unit}
                    </td>
                    <td className="text-center py-2.5">
                      {row.met ? (
                        <Stamp tone="stock">MOQ Met ✓</Stamp>
                      ) : (
                        <Stamp tone="low">Below MOQ</Stamp>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
