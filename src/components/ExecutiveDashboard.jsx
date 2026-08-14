import React from 'react';
import { Package, Truck, Layers, Building2 } from 'lucide-react';

export function ExecutiveDashboard({ data, card, sectionLabel, fmt, Stamp }) {
  const totalProducts = data.products?.length || 0;
  const totalSuppliers = data.suppliers?.length || 0;
  const totalBranches = data.branches?.length || 0;
  const activeOrders = data.branchOrders?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Global overview of inventory, active requisitions, and multi-country logistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={card + " p-4 flex items-center justify-between"}>
          <div>
            <div className="text-xs font-bold text-[#7A7568] uppercase tracking-wider">Total Master Items</div>
            <div className="text-2xl font-extrabold text-[#1B2430] mt-1">{totalProducts}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C98A3E] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className={card + " p-4 flex items-center justify-between"}>
          <div>
            <div className="text-xs font-bold text-[#7A7568] uppercase tracking-wider">Active Suppliers</div>
            <div className="text-2xl font-extrabold text-[#1B2430] mt-1">{totalSuppliers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className={card + " p-4 flex items-center justify-between"}>
          <div>
            <div className="text-xs font-bold text-[#7A7568] uppercase tracking-wider">Registered Branches</div>
            <div className="text-2xl font-extrabold text-[#1B2430] mt-1">{totalBranches}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className={card + " p-4 flex items-center justify-between"}>
          <div>
            <div className="text-xs font-bold text-[#7A7568] uppercase tracking-wider">Pending Requisitions</div>
            <div className="text-2xl font-extrabold text-[#1B2430] mt-1">{activeOrders}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className={card + " p-5"}>
        <div className={sectionLabel}>Recent Proforma Invoices &amp; Shipments Status</div>
        <div className="space-y-3 mt-3">
          {(data.pis || []).length === 0 ? (
            <div className="text-xs text-[#7A7568] py-4 text-center">No proforma invoices generated yet. Use MOQ Consolidation to create PIs.</div>
          ) : (
            data.pis.slice(-5).map(pi => (
              <div key={pi.id} className="p-3 bg-[#FAF8F5] border border-[#EFEAE0] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#1B2430]">{pi.piNumber}</span>
                  <span className="text-[#7A7568] ml-2">({pi.date})</span>
                </div>
                <Stamp tone="stock">{pi.items?.length || 0} items</Stamp>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
