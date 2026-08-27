import React, { useState } from 'react';

export default function ProformaInvoices({ 
  proformaInvoices = [], 
  setProformaInvoices = () => {}, 
  suppliers = [], 
  items = [], 
  stockLedger = [], 
  setStockLedger = () => {},
  exchangeRates = {}
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleReceiveGoods = (pi) => {
    // 1. Prevent duplicate processing if already received
    if (pi.status === 'Received into Stock') {
      alert('This Proforma Invoice has already been received into the stock ledger.');
      return;
    }

    const piItems = pi.items || pi.lineItems || [];
    if (piItems.length === 0) {
      alert('No items found in this Proforma Invoice to receive.');
      return;
    }

    // 2. Clone current ledger to modify immutably
    let updatedLedger = [...stockLedger];

    piItems.forEach(piItem => {
      const code = (piItem.code || piItem.itemCode || '').toString();
      const name = piItem.name || piItem.itemName || code;
      const orderedQty = Number(piItem.orderedQty || piItem.qty || piItem.quantity || 0);
      const unitPriceLCY = Number(piItem.unitPrice || piItem.price || 0);
      const currency = pi.currency || piItem.currency || 'USD';
      
      // Calculate USD unit price using exchange rates if available
      const rateToUSD = Number(exchangeRates[currency] || (currency === 'USD' ? 1 : 0.14));
      const unitPriceUSD = unitPriceLCY * rateToUSD;

      const existingIndex = updatedLedger.findIndex(row => row.code?.toString().toLowerCase() === code.toLowerCase());

      if (existingIndex >= 0) {
        // Update existing row
        const current = updatedLedger[existingIndex];
        const prevReceived = Number(current.receivedQty || 0);
        const prevClosing = Number(current.closingStock || 0);
        const newReceived = prevReceived + orderedQty;
        const newClosing = prevClosing + orderedQty;

        updatedLedger[existingIndex] = {
          ...current,
          receivedQty: newReceived,
          closingStock: newClosing,
          supplier: pi.supplier || current.supplier,
          unitPriceLCY,
          unitPriceUSD,
          currency
        };
      } else {
        // Insert new row into stock ledger
        const masterItem = items.find(i => (i.code || i.sku)?.toString().toLowerCase() === code.toLowerCase());
        updatedLedger.push({
          code,
          name,
          supplier: pi.supplier || 'Unknown Supplier',
          country: masterItem?.country || '',
          openingStock: 0,
          orderedQty: 0,
          receivedQty: orderedQty,
          shippedQty: 0,
          closingStock: orderedQty,
          unitPriceLCY,
          unitPriceUSD,
          currency
        });
      }
    });

    // 3. Update stock ledger state and localStorage
    setStockLedger(updatedLedger);
    localStorage.setItem('ait_ledger', JSON.stringify(updatedLedger));

    // 4. Update PI status to received
    const updatedPIs = proformaInvoices.map(p => 
      p.piRef === pi.piRef || p.id === pi.id 
        ? { ...p, status: 'Received into Stock' } 
        : p
    );
    setProformaInvoices(updatedPIs);
    localStorage.setItem('ait_pis', JSON.stringify(updatedPIs));

    alert(`Successfully received ${pi.piRef} goods into the Stock Ledger!`);
  };

  const filteredPIs = proformaInvoices.filter(pi => {
    const refMatch = pi.piRef?.toLowerCase().includes(searchTerm.toLowerCase());
    const supplierMatch = pi.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    return !searchTerm || refMatch || supplierMatch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Proforma Invoices & Supplier Orders</h2>
          <p className="text-sm text-slate-400">Track signed PIs, monitor confirmation status, convert LCY to USD, and receive goods into inventory.</p>
        </div>
        <input 
          type="text"
          placeholder="Search PI Ref or Supplier..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none w-full md:w-64 shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredPIs.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-400 shadow-xl">
            No Proforma Invoices found. Consolidate orders and generate PIs from the Order Consolidation tab.
          </div>
        ) : (
          filteredPIs.map((pi, idx) => {
            const piItems = pi.items || pi.lineItems || [];
            const isReceived = pi.status === 'Received into Stock';

            return (
              <div key={pi.piRef || idx} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-400">
                      {pi.piRef || `PI-${idx}`} — Supplier: <span className="text-white">{pi.supplier}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Date: {pi.date || 'N/A'} • Status: <span className={`font-semibold ${isReceived ? 'text-emerald-400' : 'text-amber-400'}`}>{pi.status || 'Pending Supplier Confirmation'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">{Number(pi.totalAmountLCY || pi.totalAmount || 0).toLocaleString()} {pi.currency || 'YUAN'}</p>
                    <p className="text-xs text-slate-400">(${Number(pi.totalAmountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                        <th className="p-2.5">Item Code</th>
                        <th className="p-2.5">Item Name</th>
                        <th className="p-2.5">Ordered Qty</th>
                        <th className="p-2.5">Unit Price ({pi.currency || 'LCY'})</th>
                        <th className="p-2.5 text-right">Total LCY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {piItems.map((item, iIdx) => {
                        const qty = Number(item.orderedQty || item.qty || item.quantity || 0);
                        const price = Number(item.unitPrice || item.price || 0);
                        return (
                          <tr key={iIdx} className="border-b border-slate-700/30">
                            <td className="p-2.5 font-semibold text-white">{item.code || item.itemCode}</td>
                            <td className="p-2.5 text-slate-200">{item.name || item.itemName}</td>
                            <td className="p-2.5 font-bold text-emerald-400">{qty}</td>
                            <td className="p-2.5 text-slate-300">{price.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono text-slate-100">{(qty * price).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => handleReceiveGoods(pi)}
                    disabled={isReceived}
                    className={`text-xs px-4 py-2 rounded-lg font-semibold shadow transition-colors text-white cursor-pointer ${
                      isReceived 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' 
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {isReceived ? '✓ Received into Stock Ledger' : 'Receive Goods into Stock Ledger'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
