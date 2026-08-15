import React, { useState } from 'react';

export function Shipments({ shipments, setShipments, branches, items, suppliers, proformaInvoices }) {
  const [form, setForm] = useState({ trackingNo: '', piId: '', branchId: '', containerType: '40FT', eta: '', status: 'In Transit' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newShipment = { ...form, id: `SHP-${Date.now().toString().slice(-4)}` };
    setShipments([newShipment, ...shipments]);
    setForm({ trackingNo: '', piId: '', branchId: '', containerType: '40FT', eta: '', status: 'In Transit' });
    alert('Shipment tracking added successfully!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm h-fit">
        <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">Logistics & Container Dispatch</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#7A7568] mb-1">Bill of Lading / Tracking No</label>
            <input type="text" required placeholder="BL-982341" value={form.trackingNo} onChange={e => setForm({...form, trackingNo: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
          </div>
          <div>
            <label className="block text-[#7A7568] mb-1">Associated Proforma Invoice</label>
            <select value={form.piId} onChange={e => setForm({...form, piId: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl bg-white">
              <option value="">Select Proforma Invoice</option>
              {proformaInvoices.map(pi => <option key={pi.id} value={pi.id}>{pi.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#7A7568] mb-1">Destination Branch</label>
            <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl bg-white">
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#7A7568] mb-1">Container Type</label>
              <select value={form.containerType} onChange={e => setForm({...form, containerType: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl bg-white">
                <option value="20FT">20FT Container</option>
                <option value="40FT">40FT Container</option>
                <option value=" LCL">LCL Consolidation</option>
              </select>
            </div>
            <div>
              <label className="block text-[#7A7568] mb-1">Estimated Arrival (ETA)</label>
              <input type="date" value={form.eta} onChange={e => setForm({...form, eta: e.target.value})} className="w-full p-2 border border-[#E4DFD3] rounded-xl" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#1B2430] text-white py-2.5 rounded-xl font-semibold cursor-pointer pt-2">Dispatch Container</button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E4DFD3] shadow-sm">
        <h2 className="text-xs font-bold text-[#1B2430] mb-4 uppercase tracking-wider">Active Shipments & Transit Monitor</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[#7A7568] border-b border-[#E4DFD3]">
              <tr>
                <th className="p-3">Tracking / BL No</th>
                <th className="p-3">Destination Branch</th>
                <th className="p-3">Container</th>
                <th className="p-3">ETA Date</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFD3]">
              {shipments.map(shp => {
                const branch = branches.find(b => b.id === shp.branchId);
                return (
                  <tr key={shp.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-[#1B2430]">
                      {shp.trackingNo}
                      <div className="text-[10px] text-[#7A7568]">PI: {shp.piId}</div>
                    </td>
                    <td className="p-3 text-[#7A7568]">{branch?.name || shp.branchId}</td>
                    <td className="p-3 font-medium">{shp.containerType}</td>
                    <td className="p-3 text-[#7A7568]">{shp.eta || 'TBD'}</td>
                    <td className="p-3 text-right">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">{shp.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
