import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function BranchPortalTab({ data, save, showToast, branchId, card, inputCls, btnPrimary, EmptyState, Stamp, fmt, num, uid, todayStr }) {
  const [selectedBranchId, setSelectedBranchId] = useState(branchId || data.branches?.[0]?.id || "");
  const [orderCart, setOrderCart] = useState({});

  const currentBranch = data.branches.find(b => b.id === selectedBranchId);

  const availableProducts = useMemo(() => {
    if (!currentBranch) return [];
    const allowed = currentBranch.allowedProductIds || [];
    if (allowed.length === 0) return data.products; 
    return data.products.filter(p => allowed.includes(p.id));
  }, [currentBranch, data.products]);

  const handleQtyChange = (productId, val) => {
    setOrderCart(prev => ({ ...prev, [productId]: num(val) }));
  };

  const submitBranchOrder = () => {
    if (!selectedBranchId) return showToast("Please select a branch first", "error");
    const itemsToOrder = Object.entries(orderCart)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId, qty }));

    if (itemsToOrder.length === 0) return showToast("Please add quantities to order", "error");

    const newOrder = {
      id: uid(),
      branchId: selectedBranchId,
      branchName: currentBranch?.name || "Branch",
      date: todayStr(),
      status: "Submitted",
      items: itemsToOrder
    };

    const nextData = {
      ...data,
      branchOrders: [...(data.branchOrders || []), newOrder]
    };

    save(nextData, "Branch order submitted successfully!");
    setOrderCart({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branch Order Portal</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Restricted item catalog for branch-level requisition.</p>
        </div>
        {!branchId && (
          <div className="flex items-center gap-2 bg-white p-2 border border-[#E4DFD3] rounded-xl shadow-sm">
            <span className="text-[11px] text-[#7A7568] font-bold uppercase tracking-wider">Select Branch:</span>
            <select 
              className={inputCls + " font-medium py-1 text-xs"}
              value={selectedBranchId}
              onChange={(e) => { setSelectedBranchId(e.target.value); setOrderCart({}); }}
            >
              {(data.branches || []).map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.location || "Branch"})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={card + " p-5"}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4DFD3]">
          <div>
            <h2 className="font-bold text-base text-[#1B2430]">Catalog Requisition — {currentBranch?.name || "Branch"}</h2>
            <p className="text-xs text-[#7A7568]">Enter required quantities for available items and submit to central procurement.</p>
          </div>
          <button onClick={submitBranchOrder} className={btnPrimary}>
            <CheckCircle2 className="w-4 h-4 text-[#C98A3E]" /> Submit Requisition Order
          </button>
        </div>

        {availableProducts.length === 0 ? (
          <EmptyState text="No items have been assigned to this branch yet. Configure access in Master Setup." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-2 font-semibold">Item Name</th>
                  <th className="text-left py-2 font-semibold">SKU Code</th>
                  <th className="text-left py-2 font-semibold">Packing Size</th>
                  <th className="text-right py-2 font-semibold w-36">Request Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {availableProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="py-2.5 text-xs font-mono text-[#7A7568]">{p.sku || "—"}</td>
                    <td className="py-2.5 text-xs text-[#7A7568]">{p.packingSize || "—"}</td>
                    <td className="text-right py-2.5">
                      <input 
                        type="number"
                        min="0"
                        placeholder="0"
                        value={orderCart[p.id] || ""}
                        onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        className={inputCls + " w-28 text-right py-1 text-xs"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={card + " p-5"}>
        <div className="text-xs font-bold uppercase tracking-wider text-[#7A7568] mb-3">Previous Requisition Orders from {currentBranch?.name || "Branch"}</div>
        {((data.branchOrders || []).filter(o => o.branchId === selectedBranchId)).length === 0 ? (
          <EmptyState text="No requisition orders submitted yet." />
        ) : (
          <div className="space-y-3">
            {data.branchOrders.filter(o => o.branchId === selectedBranchId).map(ord => (
              <div key={ord.id} className="p-3 bg-[#FAF8F5] border border-[#EFEAE0] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Order Ref: {ord.id.slice(0, 6).toUpperCase()} ({ord.date})</span>
                  <Stamp tone="stock">{ord.status}</Stamp>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ord.items.map((it, idx) => {
                    const p = data.products.find(prod => prod.id === it.productId);
                    return (
                      <span key={idx} className="bg-white px-2 py-1 rounded border border-[#DDD7C7]">
                        {p?.name || "Item"}: <strong className="text-[#C98A3E]">{it.qty} {p?.unit || "pcs"}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
