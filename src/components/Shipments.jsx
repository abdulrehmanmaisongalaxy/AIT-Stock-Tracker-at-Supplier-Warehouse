import React from 'react';

export function Shipments({ data, card, sectionLabel, EmptyState }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branch Shipments &amp; Dispatches</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Track merchandise dispatch and logistics fulfillment to regional branches and clients.</p>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Outgoing Shipments Status</div>
        {(data.shipments || []).length === 0 ? (
          <EmptyState text="No shipments dispatched yet." />
        ) : (
          <div className="space-y-3">
            {data.shipments.map(sh => (
              <div key={sh.id} className="p-3 bg-[#FAF8F5] border border-[#EFEAE0] rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold">Shipment Ref: {sh.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
