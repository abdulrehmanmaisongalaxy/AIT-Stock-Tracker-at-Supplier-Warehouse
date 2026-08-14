import React from 'react';

export function BranchHandling({ data, card, sectionLabel, EmptyState }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branch User Access Management</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Control branch login IDs and restrict visibility per location.</p>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Registered Branch Portals &amp; Restrictions</div>
        {(data.branches || []).length === 0 ? (
          <EmptyState text="No branches registered yet. Add branches in Master Setup." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {data.branches.map(b => (
              <div key={b.id} className="p-4 bg-[#FAF8F5] border border-[#EFEAE0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1B2430]">{b.name}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{b.country || "UAE"}</span>
                </div>
                <div className="text-xs text-[#7A7568]">Code: <span className="font-mono">{b.code || "N/A"}</span></div>
                <div className="text-xs text-[#7A7568]">Allowed Items Count: <strong className="text-[#C98A3E]">{b.allowedProductIds?.length || 0} items</strong></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
