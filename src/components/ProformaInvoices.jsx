import React from 'react';

export default function ProformaInvoices({ proformaInvoices, setProformaInvoices, stockLedger, setStockLedger }) {
  const receiveGoods = (pi) => {
    // Add items received into Stock Ledger
    const updatedLedger = [...stockLedger];
    pi.items.forEach(piItem => {
      const existingIndex = updatedLedger.findIndex(l => l.code === piItem.code);
      if (existingIndex >= 0) {
        const current = updatedLedger[existingIndex];
        const newReceived = Number(current.receivedQty || 0) + Number(piItem.qty);
        const newOrdered = Number(current.orderedQty || 0) + Number(piItem.qty);
        const opening = Number(current.openingStock || 0);
        const shipped = Number(current.shippedQty || 0);
        
        updatedLedger[existingIndex] = {
          ...current,
          orderedQty: newOrdered,
          receivedQty: newReceived,
          closingStock: opening + newReceived - shipped
        };
      } else {
        const unitPriceUSD = piItem.currency === 'USD' 
          ? piItem.unitPrice 
          : (piItem.currency === 'YUAN' ? piItem.unitPrice * 0.14 : piItem.unitPrice * 0.012);

        updatedLedger.push({
          code: piItem.code,
          name: piItem.name,
          supplier: pi.supplierName,
          openingStock: 0,
          orderedQty: piItem.qty,
          receivedQty: piItem.qty,
          shippedQty: 0,
          closingStock: piItem.qty,
          unitPriceLCY: piItem.unitPrice,
          currency: piItem.currency,
          unitPriceUSD: Number(unitPriceUSD.toFixed(2))
        });
      }
    });

    setStockLedger(updatedLedger);
    setProformaInvoices(proformaInvoices.map(p => p.piNo === pi.piNo ? { ...p, status: 'Goods Received & Stock Updated' } : p));
    alert(`Stock successfully received for PI ${pi.piNo} and Stock Ledger updated!`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Proforma Invoices & Supplier Orders</h2>
        <p className="text-sm text-slate-400">Track signed PIs, monitor confirmation status, convert LCY to USD, and receive goods into stock.</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4 shadow-md">
        <h3 className="font-bold text-emerald-400">Proforma Invoices Directory</h3>
        {proformaInvoices.length === 0 ? (
          <p className="text-sm text-slate-400">No Proforma Invoices created yet.</p>
        ) : (
          <div className="space-y-4">
            {proformaInvoices.map(pi => {
              const isReceived = pi.status === 'Goods Received & Stock Updated';
              return (
                <div key={pi.piNo} className="border border-slate-700 rounded-xl p-4 bg-slate-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-emerald-400">{pi.piNo} — Supplier: <span className="text-white">{pi.supplierName}</span></h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Date: {pi.date} | Status: <span className={`font-semibold px-2 py-0.5 rounded text-xs ml-1 ${isReceived ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>{pi.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{pi.totalLCY} {pi.currency}</p>
                      <p className="text-xs text-slate-400">(${pi.totalUSD} USD)</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/30">
                          <th className="p-2.5">Item Code</th>
                          <th className="p-2.5">Item Name</th>
                          <th className="p-2.5">Ordered Qty</th>
                          <th className="p-2.5">Unit Price ({pi.currency})</th>
                          <th className="p-2.5 text-right">Total LCY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pi.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="p-2.5 font-semibold text-white">{item.code}</td>
                            <td className="p-2.5 text-slate-200">{item.name}</td>
                            <td className="p-2.5 font-bold text-emerald-300">{item.qty}</td>
                            <td className="p-2.5 text-slate-300">{item.unitPrice}</td>
                            <td className="p-2.5 text-right font-medium text-slate-200">{Number(item.totalLCY).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!isReceived && (
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => receiveGoods(pi)} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2 rounded-lg font-semibold shadow transition-colors text-white"
                      >
                        Receive Goods into Stock Ledger
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
