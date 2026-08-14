import React, { useRef } from 'react';
import { Download, Upload, Edit3, Trash2 } from 'lucide-react';

export function MasterSetupTab({
  data,
  save,
  showToast,
  sName,
  setSName,
  sCountry,
  setSCountry,
  editingSupplierId,
  handleSaveSupplier,
  handleEditSupplier,
  handleDeleteSupplier,
  bName,
  setBName,
  bCountry,
  setBCountry,
  bCode,
  setBCode,
  editingBranchId,
  handleSaveBranch,
  handleEditBranch,
  handleDeleteBranch,
  pSupplierId,
  setPSupplierId,
  pName,
  setPName,
  pSku,
  setPSku,
  pPackingSize,
  setPPackingSize,
  pWeight,
  setPWeight,
  pCbm,
  setPCbm,
  editingProductId,
  handleSaveProduct,
  handleEditProduct,
  handleDeleteProduct,
  selectedBranchForAssign,
  setSelectedBranchForAssign,
  currentBranchForAssignObj,
  toggleProductAssignment,
  downloadTemplate,
  setImportType,
  fileInputRef,
  card,
  sectionLabel,
  inputCls,
  btnPrimary
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Setup &amp; Configuration</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Manage suppliers, destination branches, global item catalogs, and access permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers Box */}
        <div className={card + " p-5 flex flex-col justify-between"}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className={sectionLabel + " mb-0"}>{editingSupplierId ? "Edit Supplier" : "Register Supplier"}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Supplier Name</label>
                <input type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Guangzhou Trade Co." className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Country</label>
                <input type="text" value={sCountry} onChange={(e) => setSCountry(e.target.value)} placeholder="e.g. China" className={inputCls} />
              </div>
              <button onClick={handleSaveSupplier} className={btnPrimary + " w-full justify-center"}>
                {editingSupplierId ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </div>

          <div>
            <div className={sectionLabel}>Active Suppliers ({data.suppliers.length})</div>
            <ul className="divide-y divide-[#F3F0E7] max-h-52 overflow-y-auto">
              {data.suppliers.map((s) => (
                <li key={s.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-[10px] text-[#7A7568] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E4DFD3] ml-2">{s.country || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditSupplier(s)} className="text-slate-400 hover:text-[#C98A3E] p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteSupplier(s.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Branches Box */}
        <div className={card + " p-5 flex flex-col justify-between"}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className={sectionLabel + " mb-0"}>{editingBranchId ? "Edit Branch/Client" : "Register Branch / Client"}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => downloadTemplate("branches")} title="Download Excel Template" className="text-xs text-[#7A7568] hover:text-[#C98A3E] font-medium flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded border border-[#E4DFD3]">
                  <Download className="w-3 h-3" /> Template
                </button>
                <button onClick={() => { setImportType("branches"); fileInputRef.current.click(); }} title="Bulk Import Excel" className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <Upload className="w-3 h-3" /> Import
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Branch / Client Name</label>
                <input type="text" value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. Dubai Warehouse" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Destination Country</label>
                <input type="text" value={bCountry} onChange={(e) => setBCountry(e.target.value)} placeholder="e.g. UAE" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Branch Code</label>
                <input type="text" value={bCode} onChange={(e) => setBCode(e.target.value)} placeholder="e.g. DXB-MAIN" className={inputCls} />
              </div>
              <button onClick={handleSaveBranch} className={btnPrimary + " w-full justify-center"}>
                {editingBranchId ? "Update Branch" : "Add Branch / Client"}
              </button>
            </div>
          </div>

          <div>
            <div className={sectionLabel}>Branches &amp; Clients ({(data.branches || []).length})</div>
            <ul className="divide-y divide-[#F3F0E7] max-h-52 overflow-y-auto">
              {(data.branches || []).map((b) => (
                <li key={b.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold">{b.name}</span>
                    <span className="text-[10px] text-[#7A7568] bg-blue-50 px-1 py-0.5 rounded ml-2">{b.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditBranch(b)} className="text-slate-400 hover:text-[#C98A3E] p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteBranch(b.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Master Item Catalog Box */}
        <div className={card + " p-5 flex flex-col justify-between"}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className={sectionLabel + " mb-0"}>{editingProductId ? "Edit Master Item" : "Register Master Item"}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => downloadTemplate("products")} title="Download Excel Template" className="text-xs text-[#7A7568] hover:text-[#C98A3E] font-medium flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded border border-[#E4DFD3]">
                  <Download className="w-3 h-3" /> Template
                </button>
                <button onClick={() => { setImportType("products"); fileInputRef.current.click(); }} title="Bulk Import Excel" className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <Upload className="w-3 h-3" /> Import
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Supplier</label>
                <select value={pSupplierId} onChange={(e) => setPSupplierId(e.target.value)} className={inputCls}>
                  <option value="">Select Supplier...</option>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1B2430]">Item Name</label>
                <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Perfume 100ml" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1B2430]">Item Code</label>
                  <input type="text" value={pSku} onChange={(e) => setPSku(e.target.value)} placeholder="e.g. PRF-001" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1B2430]">Packing Size</label>
                  <input type="text" value={pPackingSize} onChange={(e) => setPPackingSize(e.target.value)} placeholder="24 pcs/ctn" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1B2430]">Weight (Kg)</label>
                  <input type="number" value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="0.00" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1B2430]">CBM</label>
                  <input type="number" value={pCbm} onChange={(e) => setPCbm(e.target.value)} placeholder="0.000" className={inputCls} />
                </div>
              </div>
              <button onClick={handleSaveProduct} className={btnPrimary + " w-full justify-center"}>
                {editingProductId ? "Update Item" : "Add Item to Master"}
              </button>
            </div>
          </div>

          <div>
            <div className={sectionLabel}>Master Item Catalog ({data.products.length})</div>
            <ul className="divide-y divide-[#F3F0E7] max-h-52 overflow-y-auto">
              {data.products.map((p) => (
                <li key={p.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[10px] text-[#7A7568]">{p.sku || "No Code"} • {p.packingSize || "No Pack Size"}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditProduct(p)} className="text-slate-400 hover:text-[#C98A3E] p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Branch Item Access Control Matrix */}
      <div className={card + " p-6 mt-6 space-y-4"}>
        <div className="flex items-center justify-between border-b border-[#E4DFD3] pb-4">
          <div>
            <h2 className="font-bold text-base text-[#1B2430]">Branch Item Access Control</h2>
            <p className="text-xs text-[#7A7568]">Select a branch below and toggle which items they are permitted to view and order (e.g., Branch A views Naomi brand, Branch B views T5 brand).</p>
          </div>
          <select 
            className={inputCls + " font-medium text-xs py-1.5 w-64"}
            value={selectedBranchForAssign}
            onChange={(e) => setSelectedBranchForAssign(e.target.value)}
          >
            {(data.branches || []).map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.location || b.country || "Branch"})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.products || []).map(p => {
            const allowedList = currentBranchForAssignObj?.allowedProductIds || [];
            const isAssigned = allowedList.includes(p.id);

            return (
              <div 
                key={p.id} 
                onClick={() => toggleProductAssignment(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isAssigned ? "bg-emerald-50/50 border-emerald-400 text-[#1B2430]" : "bg-white border-[#E4DFD3] text-slate-500"
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-[#1B2430]">{p.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {p.sku || "—"}</div>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${isAssigned ? "bg-[#2F5A41] text-white" : "border border-slate-300"}`}>
                  {isAssigned ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
