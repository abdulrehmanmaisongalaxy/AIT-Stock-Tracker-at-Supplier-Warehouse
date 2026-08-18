import React, { useState } from 'react';

export default function OrderConsolidation() {
  const [requisitions, setRequisitions] = useState([
    { id: 'REQ-001', branch: 'MG Kinshasa', item: 'Tire 205/55R16', supplier: 'Apex Corp (China)', qty: 10, moq: 25 }
  ]);

  const handleDelete = (id) => {
    setRequisitions(requisitions.filter(r => r.id !== id));
  };

  const handleQtyChange = (id, val) => {
    setRequisitions(requisitions.map(r => r.id === id ? { ...r, qty: Number(val) } : r));
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Order Consolidation & MOQ Management</h2>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Req ID</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Item Name</th>
            <th className="border p-2">Assigned Supplier</th>
            <th className="border p-2">Ordered Qty</th>
            <th className="border p-2">MOQ Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.length === 0 ? (
            <tr><td colSpan="7" className="text-center p-4 text-gray-500">No active branch requisitions found.</td></tr>
          ) : (
            requisitions.map(r => (
              <tr key={r.id}>
                <td className="border p-2 font-bold">{r.id}</td>
                <td className="border p-2">{r.branch}</td>
                <td className="border p-2">{r.item}</td>
                <td className="border p-2 font-semibold text-blue-600">{r.supplier}</td>
                <td className="border p-2">
                  <input 
                    type="number" 
                    value={r.qty} 
                    onChange={e => handleQtyChange(r.id, e.target.value)} 
                    className="w-20 border p-1 rounded text-center" 
                  />
                </td>
                <td className="border p-2">
                  {r.qty >= r.moq ? (
                    <span className="text-green-600 font-bold">MOQ Met</span>
                  ) : (
                    <span className="text-red-600 font-bold">Below MOQ (Min: {r.moq})</span>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
