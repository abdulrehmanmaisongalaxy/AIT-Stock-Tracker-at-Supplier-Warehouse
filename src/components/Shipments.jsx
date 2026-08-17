import React, { useState } from 'react';

export default function Shipments({ shipments, setShipments, proformaInvoices }) {
  const [selectedPiId, setSelectedPiId] = useState(proformaInvoices[0]?.id || '');
  const [containerNo, setContainerNo] = useState('');
  const [status, setStatus] = useState('In Production');

  const handleCreateShipment = (e) => {
    e.preventDefault();
    if (!selectedPiId) {
      alert("Please select a Proforma Invoice to map to this shipment.");
      return;
    }
    if (!containerNo) {
      alert("Please enter a container number.");
      return;
    }

    const targetPi = proformaInvoices.find(pi => pi.id === selectedPiId);

    const newShipment = {
      id: `SHP-${Date.now().toString().slice(-4)}`,
      piId: selectedPiId,
      supplier: targetPi ? targetPi.supplier : 'Unknown Supplier',
      containerNo,
      status,
      date: new Date().toISOString().split('T')[0],
      items: targetPi ? targetPi.items : []
    };

    setShipments(prev => [...prev, newShipment]);
    setContainerNo('');
    alert(`Shipment ${newShipment.id} successfully mapped and created!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-lg font-bold mb-1">SHIPMENTS & CONTAINERS</h2>
        <p className="text-xs text-gray-400 mb-6">Track active containers and logistics schedules mapped from finalized PIs</p>

        {proformaInvoices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No Proforma Invoices available. Finalize PIs in Order Consolidation first before mapping shipments.</p>
        ) : (
          <form onSubmit={handleCreateShipment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Select Proforma Invoice</label>
              <select 
                value={selectedPiId} 
                onChange={(e) => setSelectedPiId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"
                required
              >
                {proformaInvoices.map(pi => (
                  <option key={pi.id} value={pi.id}>{pi.id} ({pi.supplier})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Container Number / ID</label>
              <input 
                type="text" 
                value={containerNo} 
                onChange={(e) => setContainerNo(e.target.value)} 
                placeholder="TGHU1234567" 
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" 
                required 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Logistics Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"
              >
                <option value="In Production">In Production</option>
                <option value="Shipped / At Sea">Shipped / At Sea</option>
                <option value="Customs Clearance">Customs Clearance</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-sm transition-colors shadow">
              Create Shipment
            </button>
          </form>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-md font-bold mb-4">ACTIVE SHIPMENTS REGISTRY ({shipments.length})</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No shipments active currently. Map a shipment above using your generated PIs.</p>
        ) : (
          <div className="space-y-4">
            {shipments.map(shp => (
              <div key={shp.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-emerald-400 text-sm">{shp.id}</h3>
                    <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded font-mono">Container: {shp.containerNo}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Supplier: {shp.supplier} | Linked PI: {shp.piId} | Date: {shp.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    shp.status === 'Delivered' ? 'bg-emerald-900/60 text-emerald-400' :
                    shp.status === 'Shipped / At Sea' ? 'bg-blue-900/60 text-blue-400' : 'bg-amber-900/60 text-amber-400'
                  }`}>
                    {shp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
