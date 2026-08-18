import React from 'react';

export default function ProformaInvoices({ proformaInvoices, setProformaInvoices, stockLedger, setStockLedger }) {
  const receiveGoods = (pi) => {
    // Add items received into Stock Ledger
    const updatedLedger = [...stockLedger];
    pi.items.forEach(piItem => {
      const existingIndex = updatedLedger.findIndex(l => l.code === piItem.code);
      if (existingIndex >= 0) {
        updatedLedger[existingIndex].receivedQty = Number(updatedLedger[existingIndex].receivedQty || 0) + Number(piItem.qty);
        updatedLedger[existingIndex].closingStock = Number(updatedLedger[existingIndex].openingStock || 0) + Number(updatedLedger[existingIndex].receivedQty) - Number(updatedLedger[existingIndex].shippedQty || 0);
      } else {
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
          unitPriceUSD: piItem.currency === 'USD' ? piItem.unitPrice : (piItem.currency === 'YUAN' ? piItem.unitPrice * 0.14 : piItem.unitPrice * 0.012)
        });
      }
    });

    setStockLedger(updatedLedger);
    setProformaInvoices(proformaInvoices.map(p => p.piNo === pi.piNo ? { ...p, status: 'Goods Received & Stock Updated' } : p));
    alert(`Stock successfully received for PI ${pi.piNo} and Stock Ledger updated!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Proforma Invoices & Supplier Orders</h2>
        <p className="text-sm text-slate-400">Track signed PIs, monitor confirmation status, convert LCY to USD, and receive goods into stock.</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
        <h3 className="font-bold text-emerald-400">Proforma Invoices Directory</h3>
        {proformaInvoices.length === 0 ? (
          <p className="text-sm text-slate-400">No Proforma Invoices created yet.</p>
        ) : (
          <div className="space-y-4">
            {proformaInvoices.map(pi => (
              <div key={pi.piNo} className="border border-slate-700 rounded-xl p-4 bg-slate-900/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-emerald-400">{pi.piNo} — Supplier: {pi.supplierName}</h4>
                    <p className="text-xs text-slate-400">Date: {pi.date} | Status: <span className="text-amber-400 font-semibold">{pi.status}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{pi.totalLCY} {pi.currency}</p>
                    <p className="text-xs text-slate-400">(${pi.totalUSD} USD)</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="p-2">Item Code</th><th className="p-2">Item Name</th><th className="p-2">Ordered Qty</th><th className="p-2">Unit Price ({pi.currency})</th><th className="p-2">Total LCY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pi.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-700/30">
                          <td className="p-2 font-semibold">{item.code}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.qty}</td>
                          <td className="p-2">{item.unitPrice}</td>
                          <td className="p-2">{item.totalLCY.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pi.status !== 'Goods Received & Stock Updated' && (
                  <button onClick={() => receiveGoods(pi)} className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4 py-2 rounded-lg font-semibold shadow">Receive Goods into Stock Ledger</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
