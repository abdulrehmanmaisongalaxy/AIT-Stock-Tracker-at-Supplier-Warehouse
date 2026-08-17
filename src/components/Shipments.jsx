import React from 'react';

export default function ShipmentsTab({ shipments, setShipments }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <h2 className="text-lg font-bold mb-1">SHIPMENTS & CONTAINERS</h2>
      <p className="text-xs text-gray-400 mb-6">Track active containers and logistics schedules</p>
      <p className="text-sm text-gray-400 text-center py-8">No shipments active currently. Shipments can be mapped once PIs are finalized.</p>
    </div>
  );
}
