import React, { useState } from 'react';

export default function ProformaInvoices() {
  const [pis, setPis] = useState([
    { 
      piNo: 'PI-2026-001', 
      reqNo: 'REQ-001', 
      supplier: 'Apex Corp', 
      items: [{ name: 'Tire 205/55R16', qty: 25, unitPriceUSD: 45 }],
      status: 'Pending Supplier Confirmation', 
      receiptQty: 0 
    }
  ]);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSupplier, setManualSupplier] = useState('Apex Corp');
  const [manualCountry, setManualCountry] = useState('China');

  const handleUpdateReceipt = (piNo, qty) => {
    setPis(pis.map(p => p.piNo === piNo ? { ...p, receiptQty: Number(qty), status: Number(qty) > 0 ? 'Confirmed & Received' : p.status } : p));
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Proforma Invoices (PI)</h2>
        <button onClick={() => setShowManualModal(true)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold">+ Create Manual PI</button>
      </div>

      <table className="w-full border-collapse border border-gray-200 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">PI Number</th>
            <th className="border p-2">Linked Req #</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Item Details</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Receipt Qty Entry</th>
            <th className="border p-2">Exports</th>
          </tr>
        </thead>
        <tbody>
          {pis.map(pi => (
            <tr key={pi.piNo}>
              <td className="border p-2 font-bold">{pi.piNo}</td>
              <td className="border p-2">{pi.reqNo}</td>
              <td className="border p-2">{pi.supplier}</td>
              <td className="border p-2 text-sm">
                {pi.items.map((i, idx) => (
                  <div key={idx}>{i.name} (Qty: {i.qty}, @ ${i.unitPriceUSD})</div>
                ))}
              </td>
              <td className="border p-2 italic">{pi.status}</td>
              <td className="border p-2">
                <input 
                  type="number" 
                  value={pi.receiptQty} 
                  onChange={e => handleUpdateReceipt(pi.piNo, e.target.value)} 
                  className="w-24 border p-1 rounded" 
                />
              </td>
              <td className="border p-2 space-x-1 text-center">
                <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">Excel</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showManualModal && (
        <div className="p-4 border rounded bg-gray-50 mb-4">
          <h3 className="font-bold mb-2">Manual PI Creation</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm">Supplier Name Filter:</label>
              <select className="border p-2 rounded w-full" value={manualSupplier} onChange={e => setManualSupplier(e.target.value)}>
                <option value="Apex Corp">Apex Corp</option>
                <option value="Global Parts">Global Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Country Filter:</label>
              <select className="border p-2 rounded w-full" value={manualCountry} onChange={e => setManualCountry(e.target.value)}>
                <option value="China">China</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>
          <button onClick={() => setShowManualModal(false)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Close</button>
        </div>
      )}
    </div>
  );
}
