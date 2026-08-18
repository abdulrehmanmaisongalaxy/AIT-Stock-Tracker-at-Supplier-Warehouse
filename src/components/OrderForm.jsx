import React, { useState } from 'react';

export default function OrderForm({ branch }) {
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [cart, setCart] = useState([]);

  // Mock item list with country/supplier restrictions
  const items = [
    { id: 1, name: 'Premium Coffee Beans', supplier: 'Supplier A', country: 'UAE', price: 45.00 },
    { id: 2, name: 'Packaging Boxes (Large)', supplier: 'Supplier B', country: 'All', price: 12.50 },
    { id: 3, name: 'Sanitization Gel', supplier: 'Supplier A', country: 'UAE', price: 18.00 },
  ];

  const filteredItems = items.filter(
    item => selectedSupplier === 'All' || item.supplier === selectedSupplier
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Create Branch Order</h2>
        <div>
          <label className="text-sm font-medium text-gray-600 mr-2">Filter Supplier:</label>
          <select 
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Suppliers</option>
            <option value="Supplier A">Supplier A</option>
            <option value="Supplier B">Supplier B</option>
          </select>
        </div>
      </div>

      {/* Item Selection Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Item Name</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Target Region</th>
              <th className="p-4">Price (AED)</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4 text-gray-600">{item.supplier}</td>
                <td className="p-4 text-gray-600">{item.country}</td>
                <td className="p-4 text-gray-600">{item.price.toFixed(2)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setCart([...cart, item])}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Add to Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
