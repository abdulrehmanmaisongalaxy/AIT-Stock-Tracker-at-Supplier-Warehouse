import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Trash2, Package, FileText, Ship, LayoutGrid, X, 
  AlertCircle, Loader2, CheckCircle2, Boxes, BookOpen, 
  Upload, Download, FileSpreadsheet, Edit3, Globe,
  Search, AlertTriangle, Building2, CheckSquare, Square, Box
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "https://ait-inventory-backend.onrender.com/api/inventory";
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const num = (n) => Number(n) || 0;
const fmt = (n) => num(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
const money = (n) => num(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STORE_KEY = "trading-ledger-v3";
const emptyData = { suppliers: [], products: [], pis: [], shipments: [], branches: [], branchOrders: [] };

const CONTAINER_20FT = { cbm: 33, weight: 28000 };
const CONTAINER_40FT = { cbm: 76, weight: 28000 };

const SHIPMENT_STATUSES = [
  "Draft",
  "Container Checking",
  "Loaded",
  "Ready to Dispatch",
  "Dispatched"
];

function Stamp({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    pipeline: "bg-amber-50 text-amber-800 border border-amber-200/60",
    partial: "bg-amber-50 text-amber-800 border border-amber-200/60",
    stock: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
    low: "bg-rose-50 text-rose-700 border border-rose-200/60",
    info: "bg-blue-50 text-blue-800 border border-blue-200/60"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-semibold">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-[#9C9788]">{hint}</span>}
    </label>
  );
}

function StatCard({ label, value, icon: Icon, tone, hint }) {
  const toneBg = tone === "stock" ? "bg-emerald-100/70 text-emerald-800" : "bg-amber-100/70 text-amber-800";
  return (
    <div className="bg-white border border-[#E4DFD3] rounded-xl p-5 shadow-[0_1px_3px_rgba(27,36,48,0.04)] flex items-start justify-between">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-[#7A7568] mb-1">{label}</div>
        <div className="text-2xl font-bold text-[#1B2430] tracking-tight">{value}</div>
        {hint && <div className="text-[11px] text-[#9C9788] mt-1 font-medium">{hint}</div>}
      </div>
      <div className={`p-2.5 rounded-xl ${toneBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-8 text-center text-sm text-[#7A7568] italic border border-dashed border-[#DDD7C7] rounded-xl bg-[#FAF8F5]/50">
      {text}
    </div>
  );
}

const inputCls = "border border-[#DDD7C7] bg-white rounded-lg px-3 py-2 text-sm text-[#1B2430] focus:outline-none focus:ring-2 focus:ring-[#C98A3E]/30 focus:border-[#C98A3E] transition-all shadow-sm";
const btnPrimary = "inline-flex items-center gap-1.5 bg-[#1B2430] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3A48] active:scale-[0.99] transition-all shadow-sm cursor-pointer";
const btnGhost = "inline-flex items-center gap-1.5 border border-[#DDD7C7] bg-white text-[#1B2430] px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[#F6F3EC] active:scale-[0.99] transition-all cursor-pointer";
const card = "bg-white border border-[#E4DFD3] rounded-xl shadow-[0_1px_3px_rgba(27,36,48,0.04)] hover:shadow-md transition-shadow duration-200";
const sectionLabel = "text-[11px] uppercase tracking-[0.1em] text-[#7A7568] font-bold mb-3";

const NAV = [
  ["dashboard", "Dashboard", LayoutGrid],
  ["ledger", "Stock Ledger", BookOpen],
  ["branch-portal", "Branch Portal", Globe],
  ["moq-consolidation", "MOQ Consolidation", CheckSquare],
  ["pis", "Proforma Invoices", FileText],
  ["shipments", "Shipments", Ship],
  ["setup", "Master Setup", Package],
];

export default function StockLedger() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [branchPortalLogin, setBranchPortalLogin] = useState(null); 
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((serverData) => {
        if (serverData && (serverData.suppliers?.length > 0 || serverData.pis?.length > 0)) {
          setData({ ...emptyData, ...serverData });
        } else {
          const localSaved = localStorage.getItem(STORE_KEY);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            const merged = { ...emptyData, ...parsed };
            setData(merged);
            fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(merged),
            });
            showToast("Local data synced with central database!", "success");
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching inventory data:", err);
        showToast("Could not connect to central database", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = (next, msg) => {
    setData(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        if (msg) showToast(msg, "success");
      })
      .catch(() => {
        showToast("Could not save to central database.", "error");
      });
  };

  const ledger = useMemo(() => {
    const map = {};
    const touch = (supplierId, productId) => {
      const k = supplierId + "|" + productId;
      if (!map[k]) map[k] = { supplierId, productId, ordered: 0, received: 0, shipped: 0, costWeightedQty: 0, costWeightedSum: 0 };
      return map[k];
    };
    for (const pi of data.pis || []) {
      for (const it of pi.items) {
        const row = touch(pi.supplierId, it.productId);
        row.ordered += num(it.qty);
        const recv = Math.min(num(it.receivedQty), num(it.qty));
        row.received += recv;
        if (recv > 0) {
          row.costWeightedQty += recv;
          row.costWeightedSum += recv * num(it.unitPrice);
        }
      }
    }
    for (const sh of data.shipments || []) {
      for (const it of sh.items) {
        const supId = it.supplierId || sh.supplierId;
        const row = touch(supId, it.productId);
        row.shipped += num(it.qty);
      }
    }
    return Object.values(map).map((r) => ({
      ...r,
      pipeline: Math.max(0, r.ordered - r.received),
      closingQty: r.received - r.shipped,
      avgCost: r.costWeightedQty > 0 ? r.costWeightedSum / r.costWeightedQty : 0,
    }));
  }, [data]);

  const supplierName = (id) => data.suppliers.find((s) => s.id === id)?.name || "—";
  const productInfo = (id) => data.products.find((p) => p.id === id) || { name: "—", sku: "", unit: "pcs", weightKg: 0, cbm: 0, packingSize: "" };
  const closingQtyFor = (supplierId, productId) => ledger.find((r) => r.supplierId === supplierId && r.productId === productId)?.closingQty || 0;

  const piStatus = (pi) => {
    const totalOrdered = pi.items.reduce((s, i) => s + num(i.qty), 0);
    const totalReceived = pi.items.reduce((s, i) => s + Math.min(num(i.receivedQty), num(i.qty)), 0);
    if (totalReceived <= 0) return { label: "Pipeline · Signed", tone: "pipeline" };
    if (totalReceived < totalOrdered) return { label: "Partially Received", tone: "partial" };
    return { label: "In Stock", tone: "stock" };
  };

  const totals = useMemo(() => {
    const closingValue = ledger.reduce((s, r) => s + Math.max(0, r.closingQty) * r.avgCost, 0);
    const pipelineQty = ledger.reduce((s, r) => s + r.pipeline, 0);
    const closingQty = ledger.reduce((s, r) => s + Math.max(0, r.closingQty), 0);
    return { closingValue, pipelineQty, closingQty };
  }, [ledger]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#F6F3EC] text-[#7A7568]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading inventory portal…
      </div>
    );
  }

  if (branchPortalLogin) {
    const currentBranchObj = (data.branches || []).find(b => b.id === branchPortalLogin);
    return (
      <div className="min-h-screen bg-[#F9F8F6] p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E4DFD3] shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#7A7568] font-bold">Branch Portal Session</div>
              <div className="text-lg font-bold text-[#1B2430]">{currentBranchObj?.name || "Branch"}</div>
            </div>
            <button 
              onClick={() => setBranchPortalLogin(null)}
              className="px-4 py-2 bg-[#1B2430] text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
            >
              Log Out to Admin Dashboard
            </button>
          </div>
          
          <BranchPortalTab branchId={branchPortalLogin} data={data} save={save} showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F6F3EC] text-[#1B2430]" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <div className="flex max-w-[1280px] mx-auto min-h-screen">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 border-r border-[#E4DFD3] min-h-screen px-4 py-6 bg-[#F6F3EC]/50 backdrop-blur-sm sticky top-0 h-screen flex flex-col justify-between">
          <div>
            <div className="mb-8 px-2">
              <div className="inline-block px-2 py-0.5 rounded bg-[#C98A3E]/10 text-[10px] uppercase tracking-[0.18em] text-[#C98A3E] font-bold mb-1">
                AIT SUPPLIER PORTAL
              </div>
              <div className="text-[16px] font-bold tracking-tight text-[#1B2430]">
                Inventory Tracker
              </div>
              <div className="text-[11px] text-[#7A7568] mt-1 font-medium">
                Created by <span className="text-[#1B2430] font-semibold">Abdul Rehman</span>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV.map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-left transition-all ${
                    tab === key ? "bg-[#1B2430] text-white shadow-sm" : "text-[#4A4638] hover:bg-[#EFEAE0] hover:text-[#1B2430]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${tab === key ? "text-[#C98A3E]" : "text-[#7A7568]"}`} /> {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="px-2 pt-2">
              <div className="text-[10px] uppercase font-bold text-[#7A7568] mb-1.5">Simulate Branch Login</div>
              <select 
                className="w-full text-xs py-1.5 px-2 border rounded border-[#E4DFD3] bg-white text-[#1B2430] font-medium focus:outline-none focus:ring-1 focus:ring-[#C98A3E]"
                onChange={(e) => { if(e.target.value) setBranchPortalLogin(e.target.value); }}
                defaultValue=""
              >
                <option value="" disabled>Select Branch View...</option>
                {(data.branches || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="px-2 pt-3 border-t border-[#E4DFD3]/80 space-y-2 text-[11px] text-[#7A7568]">
              <div className="flex justify-between items-center">
                <span>Suppliers</span>
                <span className="font-semibold text-[#1B2430]">{data.suppliers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branches / Clients</span>
                <span className="font-semibold text-[#1B2430]">{(data.branches || []).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipments</span>
                <span className="font-semibold text-[#1B2430]">{data.shipments.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-8 py-6 min-w-0">
          {tab === "dashboard" && <Dashboard data={data} ledger={ledger} totals={totals} supplierName={supplierName} productInfo={productInfo} piStatus={piStatus} />}
          {tab === "ledger" && <LedgerTab data={data} ledger={ledger} supplierName={supplierName} productInfo={productInfo} />}
          {tab === "pis" && <PIsTab data={data} save={save} supplierName={supplierName} productInfo={productInfo} piStatus={piStatus} />}
          {tab === "shipments" && <ShipmentsTab data={data} save={save} supplierName={supplierName} productInfo={productInfo} closingQtyFor={closingQtyFor} />}
          {tab === "setup" && <SetupTab data={data} save={save} showToast={showToast} />}
          {tab === "branch-portal" && <BranchPortalTab data={data} save={save} showToast={showToast} />}
          {tab === "moq-consolidation" && <MOQConsolidationTab data={data} save={save} showToast={showToast} />}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 z-50 ${
          toast.type === "error" ? "bg-rose-900 text-white border-rose-800" : "bg-[#1B2430] text-white border-slate-700"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, ledger, totals, supplierName, productInfo, piStatus }) {
  const [search, setSearch] = useState("");

  const bySupplier = useMemo(() => {
    const m = {};
    for (const r of ledger) {
      if (r.pipeline <= 0 && r.closingQty <= 0) continue;
      const p = productInfo(r.productId);
      const sup = supplierName(r.supplierId);
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        sup.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) continue;
      m[r.supplierId] = m[r.supplierId] || [];
      m[r.supplierId].push(r);
    }
    return m;
  }, [ledger, search, productInfo, supplierName]);

  const byCountry = useMemo(() => {
    const m = {};
    for (const r of ledger) {
      const sup = data.suppliers.find((s) => s.id === r.supplierId);
      const country = sup?.country?.trim() || "Unassigned";
      if (!m[country]) m[country] = { country, suppliersCount: new Set(), closingValue: 0, closingQty: 0, pipelineQty: 0 };
      
      m[country].suppliersCount.add(r.supplierId);
      m[country].closingQty += Math.max(0, r.closingQty);
      m[country].closingValue += Math.max(0, r.closingQty) * r.avgCost;
      m[country].pipelineQty += r.pipeline;
    }
    return Object.values(m);
  }, [ledger, data.suppliers]);

  const openPIs = data.pis.filter((p) => piStatus(p).label !== "In Stock");
  const recentShipments = [...data.shipments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Real-time inventory valuation, pipeline shipments, and country breakdown.</p>
        </div>
        
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A7568]" />
          <input 
            type="text" 
            placeholder="Search Item, Code, Supplier..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls + " pl-9 w-full bg-white"}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-[#7A7568] hover:text-black">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Closing Stock Value" value={"AED " + money(totals.closingValue)} icon={Boxes} tone="stock" hint="Current Sellable Valuation" />
        <StatCard label="Total Sellable Quantity" value={fmt(totals.closingQty)} icon={CheckCircle2} tone="stock" hint="In Warehouse Right Now" />
        <StatCard label="Pipeline Quantity" value={fmt(totals.pipelineQty)} icon={FileText} tone="pipeline" hint="Ordered & In Transit" />
      </div>

      <div className={card + " p-5 mb-6"}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C98A3E]" />
            <div className={sectionLabel + " mb-0"}>Closing Stock Summary by Country</div>
          </div>
          <span className="text-xs text-[#7A7568]">{byCountry.length} Regions Active</span>
        </div>
        {byCountry.length === 0 ? (
          <EmptyState text="No regional data available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-2 font-semibold">Country</th>
                  <th className="text-center py-2 font-semibold">Suppliers</th>
                  <th className="text-right py-2 font-semibold">Pipeline Qty</th>
                  <th className="text-right py-2 font-semibold">Closing Stock Qty</th>
                  <th className="text-right py-2 font-semibold">Total Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {byCountry.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FDFBF7] transition-colors font-medium">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C98A3E]" />
                      {c.country}
                    </td>
                    <td className="text-center py-2.5 text-[#7A7568]">{c.suppliersCount.size}</td>
                    <td className="text-right py-2.5 text-[#8A6420]">{c.pipelineQty > 0 ? fmt(c.pipelineQty) : "—"}</td>
                    <td className="text-right py-2.5 text-[#2F5A41]">{fmt(c.closingQty)}</td>
                    <td className="text-right py-2.5 font-bold text-[#1B2430]">AED {money(c.closingValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={card + " p-5 mb-6"}>
        <div className="flex items-center justify-between mb-4">
          <div className={sectionLabel + " mb-0"}>Closing Stock by Supplier &amp; Item</div>
          {search && <span className="text-xs text-[#C98A3E] font-medium">Filtered by: "{search}"</span>}
        </div>
        {Object.keys(bySupplier).length === 0 ? (
          <EmptyState text={search ? "No stock items match your search." : "No active stock recorded yet."} />
        ) : (
          Object.entries(bySupplier).map(([supplierId, rows]) => {
            const supplierClosingValue = rows.reduce((s, r) => s + Math.max(0, r.closingQty) * r.avgCost, 0);
            const sup = data.suppliers.find(s => s.id === supplierId);
            return (
              <div key={supplierId} className="mb-6 last:mb-0 border border-[#EFEAE0] rounded-xl p-4 bg-[#FAF8F5]">
                <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-[#E4DFD3]">
                  <div className="font-bold text-[14.5px] flex items-center gap-2">
                    {supplierName(supplierId)}
                    {sup?.country && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#DDD7C7] text-[#7A7568]">{sup.country}</span>}
                  </div>
                  <div className="text-xs text-[#7A7568]">
                    Supplier Stock Value: <span className="font-bold text-[#1B2430] text-sm ml-1">AED {money(supplierClosingValue)}</span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                      <th className="text-left py-1.5 font-medium">Item Details</th>
                      <th className="text-right py-1.5 font-medium">Pipeline</th>
                      <th className="text-right py-1.5 font-medium">Closing Sellable Qty</th>
                      <th className="text-right py-1.5 font-medium">Avg Unit Cost</th>
                      <th className="text-right py-1.5 font-medium">Closing Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const p = productInfo(r.productId);
                      const isLowStock = r.closingQty <= 0;
                      return (
                        <tr key={i} className="border-b border-[#EFEAE0] last:border-0 hover:bg-white/60 transition-colors">
                          <td className="py-2">
                            <span className="font-medium text-[#1B2430]">{p.name}</span>
                            {p.sku && <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>}
                          </td>
                          <td className="text-right py-2 text-[#8A6420]">{r.pipeline > 0 ? fmt(r.pipeline) + " " + p.unit : "—"}</td>
                          <td className="text-right py-2">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                                <AlertTriangle className="w-3 h-3" /> 0 {p.unit}
                              </span>
                            ) : (
                              <span className="font-bold text-[#2F5A41]">{fmt(r.closingQty)} {p.unit}</span>
                            )}
                          </td>
                          <td className="text-right py-2 text-[#7A7568]">{r.avgCost > 0 ? "AED " + money(r.avgCost) : "—"}</td>
                          <td className="text-right py-2 font-bold text-[#1B2430]">{r.avgCost > 0 ? "AED " + money(Math.max(0, r.closingQty) * r.avgCost) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={card + " p-5"}>
          <div className={sectionLabel}>PIs Pending Warehouse Receipt</div>
          {openPIs.length === 0 ? (
            <EmptyState text="All signed PIs have been fully received." />
          ) : (
            <ul className="divide-y divide-[#F3F0E7]">
              {openPIs.map((pi) => {
                const st = piStatus(pi);
                return (
                  <li key={pi.id} className="py-2.5 flex items-center justify-between text-sm hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold">{pi.piNumber}</span>
                      <span className="text-[#7A7568] text-xs ml-2">({supplierName(pi.supplierId)})</span>
                    </div>
                    <Stamp tone={st.tone}>{st.label}</Stamp>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={card + " p-5"}>
          <div className={sectionLabel}>Recent Dispatches &amp; Shipments</div>
          {recentShipments.length === 0 ? (
            <EmptyState text="No outbound shipments logged yet." />
          ) : (
            <ul className="divide-y divide-[#F3F0E7]">
              {recentShipments.map((sh) => (
                <li key={sh.id} className="py-2.5 flex items-center justify-between text-sm hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                  <div>
                    <span className="font-semibold text-[#1B2430]">{sh.shipmentNumber}</span>
                    <span className="text-[#7A7568] text-xs ml-2">→ {sh.destinationBranch || "Branch"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stamp tone="info">{sh.status || "Dispatched"}</Stamp>
                    <span className="text-[#9C9788] text-xs font-mono">{sh.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function LedgerTab({ data, ledger, supplierName, productInfo }) {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const countriesList = useMemo(() => {
    const list = new Set();
    data.suppliers.forEach((s) => {
      if (s.country) list.add(s.country.trim());
    });
    return Array.from(list).sort();
  }, [data.suppliers]);

  const filteredSuppliers = useMemo(() => {
    if (selectedCountry === "all") return data.suppliers;
    return data.suppliers.filter((s) => (s.country || "").trim() === selectedCountry);
  }, [data.suppliers, selectedCountry]);

  useEffect(() => {
    if (filteredSuppliers.length > 0) {
      if (!filteredSuppliers.some((s) => s.id === selectedSupplier)) {
        setSelectedSupplier(filteredSuppliers[0].id);
      }
    } else {
      setSelectedSupplier("");
    }
  }, [selectedCountry, filteredSuppliers, selectedSupplier]);

  const filteredLedger = useMemo(() => {
    if (!selectedSupplier) return [];
    return ledger.filter((r) => r.supplierId === selectedSupplier);
  }, [ledger, selectedSupplier]);

  const supplierMovements = useMemo(() => {
    if (!selectedSupplier) return [];
    const events = [];

    data.pis.filter(p => p.supplierId === selectedSupplier).forEach(pi => {
      pi.items.forEach(it => {
        events.push({
          date: pi.date,
          type: "PI Signed",
          ref: pi.piNumber,
          productId: it.productId,
          ordered: num(it.qty),
          received: num(it.receivedQty),
          shipped: 0,
        });
      });
    });

    data.shipments.forEach(sh => {
      sh.items.forEach(it => {
        if ((it.supplierId || sh.supplierId) === selectedSupplier) {
          events.push({
            date: sh.date,
            type: "Shipment Out",
            ref: sh.shipmentNumber + " → " + (sh.destinationBranch || "Branch"),
            productId: it.productId,
            ordered: 0,
            received: 0,
            shipped: num(it.qty),
          });
        }
      });
    });

    return events.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [data, selectedSupplier]);

  const exportLedgerExcel = () => {
    const supName = supplierName(selectedSupplier);
    const rows = filteredLedger.map((r) => {
      const p = productInfo(r.productId);
      return {
        "Supplier": supName,
        "Item Name": p.name,
        "Item Code": p.sku,
        "Unit": p.unit,
        "Ordered Qty": r.ordered,
        "Received Qty": r.received,
        "Shipped Qty": r.shipped,
        "Pipeline Qty": r.pipeline,
        "Closing Sellable Qty": r.closingQty,
        "Avg Unit Cost (AED)": r.avgCost,
        "Closing Value (AED)": Math.max(0, r.closingQty) * r.avgCost,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Ledger");
    XLSX.writeFile(workbook, `Stock_Ledger_${supName.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Audit item stock balances and complete transaction movement history.</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedSupplier && (
            <button onClick={exportLedgerExcel} className={btnGhost}>
              <Download className="w-4 h-4 text-emerald-600" /> Export Excel
            </button>
          )}

          <div className="flex items-center gap-3 bg-white p-2 border border-[#E4DFD3] rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7A7568] font-bold uppercase tracking-wider">Country:</span>
              <select 
                className={inputCls + " font-medium py-1 text-xs"} 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="all">All Countries</option>
                {countriesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="h-4 w-[1px] bg-[#E4DFD3]" />

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7A7568] font-bold uppercase tracking-wider">Supplier:</span>
              <select 
                className={inputCls + " font-medium py-1 text-xs"} 
                value={selectedSupplier} 
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {filteredSuppliers.length === 0 && <option value="">No suppliers</option>}
                {filteredSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.country || "General"})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedSupplier ? (
        <EmptyState text="Select a supplier above to view their item stock balance and movement logs." />
      ) : (
        <>
          <div className={card + " p-5 mb-6"}>
            <div className={sectionLabel}>Current Item Balances — {supplierName(selectedSupplier)}</div>
            {filteredLedger.length === 0 ? (
              <EmptyState text="No active items or balances registered for this supplier." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                      <th className="text-left py-2 font-semibold">Item Name &amp; Item Code</th>
                      <th className="text-right py-2 font-semibold">Ordered</th>
                      <th className="text-right py-2 font-semibold">Received</th>
                      <th className="text-right py-2 font-semibold">Shipped</th>
                      <th className="text-right py-2 font-semibold">Pipeline Qty</th>
                      <th className="text-right py-2 font-semibold">Closing Sellable Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0E7]">
                    {filteredLedger.map((r, i) => {
                      const p = productInfo(r.productId);
                      return (
                        <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2.5">
                            <span className="font-medium text-[#1B2430]">{p.name}</span>
                            {p.sku && <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>}
                          </td>
                          <td className="text-right py-2.5">{fmt(r.ordered)} {p.unit}</td>
                          <td className="text-right py-2.5">{fmt(r.received)} {p.unit}</td>
                          <td className="text-right py-2.5 text-[#B5453A]">{fmt(r.shipped)} {p.unit}</td>
                          <td className="text-right py-2.5 text-[#8A6420]">{fmt(r.pipeline)} {p.unit}</td>
                          <td className={`text-right py-2.5 font-bold ${r.closingQty <= 0 ? "text-rose-600" : "text-[#2F5A41]"}`}>
                            {fmt(r.closingQty)} {p.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={card + " p-5"}>
            <div className={sectionLabel}>Item Movement &amp; Audit Log</div>
            {supplierMovements.length === 0 ? (
              <EmptyState text="No logs or movements recorded for this supplier." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                      <th className="text-left py-2 font-semibold">Date</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Reference</th>
                      <th className="text-left py-2 font-semibold">Item Name</th>
                      <th className="text-right py-2 font-semibold">Ordered</th>
                      <th className="text-right py-2 font-semibold">Received</th>
                      <th className="text-right py-2 font-semibold">Shipped Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0E7]">
                    {supplierMovements.map((m, i) => {
                      const p = productInfo(m.productId);
                      return (
                        <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2.5 text-[#7A7568] font-mono text-xs">{m.date}</td>
                          <td className="py-2.5 font-medium">
                            <Stamp tone={m.type.includes("PI") ? "pipeline" : "stock"}>{m.type}</Stamp>
                          </td>
                          <td className="py-2.5 font-medium">{m.ref}</td>
                          <td className="py-2.5">{p.name}</td>
                          <td className="text-right py-2.5">{m.ordered > 0 ? fmt(m.ordered) : "—"}</td>
                          <td className="text-right py-2.5 text-[#2F5A41] font-medium">{m.received > 0 ? fmt(m.received) : "—"}</td>
                          <td className="text-right py-2.5 text-[#B5453A] font-medium">{m.shipped > 0 ? fmt(m.shipped) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PIsTab({ data, save, supplierName, productInfo, piStatus }) {
  const [showModal, setShowModal] = useState(false);
  const [editingPiId, setEditingPiId] = useState(null);
  
  const [supplierId, setSupplierId] = useState("");
  const [piNumber, setPiNumber] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([{ productId: "", qty: "", unitPrice: "", receivedQty: 0 }]);

  const catalogProducts = useMemo(() => {
    if (!supplierId) return data.products;
    const filtered = data.products.filter((p) => p.supplierId === supplierId);
    return filtered.length > 0 ? filtered : data.products;
  }, [data.products, supplierId]);

  const handleOpenCreateModal = () => {
    setEditingPiId(null);
    setSupplierId("");
    setPiNumber("");
    setDate(todayStr());
    setItems([{ productId: "", qty: "", unitPrice: "", receivedQty: 0 }]);
    setShowModal(true);
  };

  const handleOpenEditModal = (pi) => {
    setEditingPiId(pi.id);
    setSupplierId(pi.supplierId);
    setPiNumber(pi.piNumber);
    setDate(pi.date || todayStr());
    setItems(pi.items.map(it => ({
      productId: it.productId,
      qty: String(it.qty),
      unitPrice: String(it.unitPrice),
      receivedQty: it.receivedQty || 0
    })));
    setShowModal(true);
  };

  const handleAddLine = () => {
    setItems((prev) => [...prev, { productId: "", qty: "", unitPrice: "", receivedQty: 0 }]);
  };

  const handleRemoveLine = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const savePI = () => {
    if (!supplierId || !piNumber.trim()) return;

    const validItems = items
      .filter((i) => i.productId && num(i.qty) > 0)
      .map((i) => ({ 
        productId: i.productId, 
        qty: num(i.qty), 
        unitPrice: num(i.unitPrice), 
        receivedQty: num(i.receivedQty) 
      }));

    if (validItems.length === 0) {
      alert("Please select at least one item and enter a valid quantity.");
      return;
    }

    if (editingPiId) {
      const updatedPis = data.pis.map(p => {
        if (p.id === editingPiId) {
          return { ...p, supplierId, piNumber: piNumber.trim(), date, items: validItems };
        }
        return p;
      });
      save({ ...data, pis: updatedPis }, "Proforma Invoice updated");
    } else {
      const newPI = {
        id: uid(),
        supplierId,
        piNumber: piNumber.trim(),
        date,
        items: validItems,
      };
      save({ ...data, pis: [...data.pis, newPI] }, "Proforma Invoice saved successfully");
    }

    setShowModal(false);
  };

  const updateReceived = (piId, productId, val) => {
    const updatedPIs = data.pis.map((pi) => {
      if (pi.id !== piId) return pi;
      const updatedItems = pi.items.map((it) => {
        if (it.productId !== productId) return it;
        return { ...it, receivedQty: Math.max(0, num(val)) };
      });
      return { ...pi, items: updatedItems };
    });
    save({ ...data, pis: updatedPIs });
  };

  const deletePI = (id) => {
    if (confirm("Are you sure you want to delete this PI?")) {
      save({ ...data, pis: data.pis.filter((p) => p.id !== id) }, "PI removed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proforma Invoices (PIs)</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Log signed purchase orders and record physical warehouse receipts.</p>
        </div>
        <button onClick={handleOpenCreateModal} className={btnPrimary}>
          <Plus className="w-4 h-4" /> Log New PI
        </button>
      </div>

      <div className="space-y-4">
        {data.pis.length === 0 ? (
          <EmptyState text="No Proforma Invoices logged yet. Click above to log your first PI." />
        ) : (
          data.pis.map((pi) => {
            const st = piStatus(pi);
            return (
              <div key={pi.id} className={card + " p-5"}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFEAE0]">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{pi.piNumber}</span>
                    <Stamp tone={st.tone}>{st.label}</Stamp>
                    <span className="text-xs text-[#7A7568] font-medium">• {supplierName(pi.supplierId)}</span>
                    <span className="text-xs text-[#9C9788] font-mono">• {pi.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEditModal(pi)} className="text-slate-400 hover:text-[#C98A3E] transition-colors p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deletePI(pi.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                      <th className="text-left py-1 font-medium">Item Name</th>
                      <th className="text-right py-1 font-medium">Ordered Qty</th>
                      <th className="text-right py-1 font-medium">Unit Price</th>
                      <th className="text-right py-1 font-medium">Received Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0E7]">
                    {pi.items.map((it, idx) => {
                      const p = productInfo(it.productId);
                      return (
                        <tr key={idx}>
                          <td className="py-2 font-medium">{p.name} {p.sku && <span className="text-xs font-mono text-[#7A7568]">({p.sku})</span>}</td>
                          <td className="text-right py-2">{fmt(it.qty)} {p.unit}</td>
                          <td className="text-right py-2">AED {money(it.unitPrice)}</td>
                          <td className="text-right py-2">
                            <input
                              type="number"
                              min="0"
                              max={it.qty}
                              value={it.receivedQty || 0}
                              onChange={(e) => updateReceived(pi.id, it.productId, e.target.value)}
                              className="w-24 text-right border border-[#DDD7C7] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#C98A3E]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-[90vw] h-[85vh] max-w-none p-6 shadow-2xl border border-[#E4DFD3] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFEAE0]">
              <h2 className="text-lg font-bold">{editingPiId ? "Edit Proforma Invoice" : "Log Proforma Invoice"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-black" /></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              <Field label="Supplier">
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputCls + " w-full"}>
                  <option value="">Select Supplier...</option>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="PI Number">
                  <input type="text" value={piNumber} onChange={(e) => setPiNumber(e.target.value)} placeholder="e.g. PI-2026-001" className={inputCls} />
                </Field>
                <Field label="Date">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </Field>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-[#7A7568] font-bold">Items in PI</span>
                  <button onClick={handleAddLine} className="text-xs text-[#C98A3E] hover:underline font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item Line
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded-lg border border-[#EFEAE0]">
                      <div className="flex-1 min-w-0">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                          className={inputCls + " w-full text-xs py-1.5"}
                        >
                          <option value="">Select Item...</option>
                          {catalogProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.sku ? `(${p.sku})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        className={inputCls + " w-20 text-xs py-1.5 text-right"}
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className={inputCls + " w-24 text-xs py-1.5 text-right"}
                      />

                      {items.length > 1 && (
                        <button onClick={() => handleRemoveLine(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EFEAE0] mt-2">
              <button onClick={() => setShowModal(false)} className={btnGhost}>Cancel</button>
              <button onClick={savePI} className={btnPrimary}>{editingPiId ? "Update PI" : "Save PI"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShipmentsTab({ data, save, supplierName, productInfo, closingQtyFor }) {
  const [showModal, setShowModal] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState(null);

  const [filterCountry, setFilterCountry] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [country, setCountry] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [destinationBranch, setDestinationBranch] = useState("");
  const [status, setStatus] = useState("Draft");
  const [date, setDate] = useState(todayStr());
  
  const [itemSelections, setItemSelections] = useState({});

  const countriesList = useMemo(() => {
    const list = new Set();
    data.suppliers.forEach((s) => { if (s.country) list.add(s.country.trim()); });
    return Array.from(list).sort();
  }, [data.suppliers]);

  const suppliersInCountry = useMemo(() => {
    if (!country) return [];
    return data.suppliers.filter((s) => (s.country || "").trim() === country);
  }, [data.suppliers, country]);

  const availableProducts = useMemo(() => {
    if (selectedSupplierIds.length === 0) return [];
    return data.products.filter((p) => selectedSupplierIds.includes(p.supplierId));
  }, [data.products, selectedSupplierIds]);

  const handleOpenCreateModal = () => {
    setEditingShipmentId(null);
    setCountry(countriesList[0] || "");
    setSelectedSupplierIds([]);
    setShipmentNumber("");
    setDestinationBranch("");
    setStatus("Draft");
    setDate(todayStr());
    setItemSelections({});
    setShowModal(true);
  };

  const handleOpenEditModal = (sh) => {
    setEditingShipmentId(sh.id);
    setCountry(sh.country || "");
    setSelectedSupplierIds(sh.supplierIds || (sh.supplierId ? [sh.supplierId] : []));
    setShipmentNumber(sh.shipmentNumber);
    setDestinationBranch(sh.destinationBranch || "");
    setStatus(sh.status || "Draft");
    setDate(sh.date || todayStr());
    
    const initialMap = {};
    (sh.items || []).forEach(it => {
      initialMap[it.productId] = {
        selected: true,
        qty: String(it.qty),
        unitPrice: String(it.unitPrice || 0)
      };
    });
    setItemSelections(initialMap);
    setShowModal(true);
  };

  const toggleSelectAllSuppliers = () => {
    if (selectedSupplierIds.length === suppliersInCountry.length) {
      setSelectedSupplierIds([]);
    } else {
      setSelectedSupplierIds(suppliersInCountry.map(s => s.id));
    }
  };

  const toggleSupplier = (supId) => {
    setSelectedSupplierIds(prev => 
      prev.includes(supId) ? prev.filter(id => id !== supId) : [...prev, supId]
    );
  };

  const toggleSelectAllProducts = () => {
    const allSelected = availableProducts.every(p => itemSelections[p.id]?.selected);
    const next = { ...itemSelections };
    availableProducts.forEach(p => {
      next[p.id] = {
        selected: !allSelected,
        qty: next[p.id]?.qty || "",
        unitPrice: next[p.id]?.unitPrice || ""
      };
    });
    setItemSelections(next);
  };

  const toggleProductSelection = (pId) => {
    setItemSelections(prev => ({
      ...prev,
      [pId]: {
        ...prev[pId],
        selected: !prev[pId]?.selected,
        qty: prev[pId]?.qty || "",
        unitPrice: prev[pId]?.unitPrice || ""
      }
    }));
  };

  const handleItemValueChange = (pId, field, val) => {
    setItemSelections(prev => ({
      ...prev,
      [pId]: {
        ...prev[pId],
        selected: true,
        [field]: val
      }
    }));
  };

  const containerTotals = useMemo(() => {
    let totalCbm = 0;
    let totalWeight = 0;
    let totalValue = 0;
    let totalCtns = 0;

    Object.entries(itemSelections).forEach(([pId, info]) => {
      if (info.selected && num(info.qty) > 0) {
        const p = productInfo(pId);
        const q = num(info.qty);
        totalCbm += q * num(p.cbm);
        totalWeight += q * num(p.weightKg);
        totalValue += q * num(info.unitPrice);

        let packSize = 1;
        if (p.packingSize) {
          const match = p.packingSize.match(/\d+/);
          if (match) packSize = Number(match[0]) || 1;
        }
        totalCtns += Math.ceil(q / packSize);
      }
    });

    return { totalCbm, totalWeight, totalValue, totalCtns };
  }, [itemSelections, productInfo]);

  const saveShipment = () => {
    if (!shipmentNumber.trim()) {
      alert("Please enter a shipment reference number.");
      return;
    }

    const selectedItems = Object.entries(itemSelections)
      .filter(([_, info]) => info.selected && num(info.qty) > 0)
      .map(([pId, info]) => {
        const p = productInfo(pId);
        return {
          productId: pId,
          supplierId: p.supplierId,
          qty: num(info.qty),
          unitPrice: num(info.unitPrice)
        };
      });

    if (selectedItems.length === 0) {
      alert("Please select at least one item and enter a quantity.");
      return;
    }

    const shipmentPayload = {
      id: editingShipmentId || uid(),
      shipmentNumber: shipmentNumber.trim(),
      country,
      supplierIds: selectedSupplierIds,
      destinationBranch,
      status,
      date,
      items: selectedItems,
      totalCbm: containerTotals.totalCbm,
      totalWeight: containerTotals.totalWeight,
      totalValue: containerTotals.totalValue,
      totalCtns: containerTotals.totalCtns
    };

    if (editingShipmentId) {
      const updated = data.shipments.map(s => s.id === editingShipmentId ? shipmentPayload : s);
      save({ ...data, shipments: updated }, "Shipment updated");
    } else {
      save({ ...data, shipments: [...data.shipments, shipmentPayload] }, "Shipment recorded successfully");
    }

    setShowModal(false);
  };

  const deleteShipment = (id) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      save({ ...data, shipments: data.shipments.filter((s) => s.id !== id) }, "Shipment deleted");
    }
  };

  const exportShipmentExcel = (sh) => {
    const rows = sh.items.map((it) => {
      const p = productInfo(it.productId);
      const q = num(it.qty);
      const uPrice = num(it.unitPrice);
      let packSize = 1;
      if (p.packingSize) {
        const m = p.packingSize.match(/\d+/);
        if (m) packSize = Number(m[0]) || 1;
      }
      return {
        "Shipment Ref": sh.shipmentNumber,
        "Status": sh.status || "Dispatched",
        "Destination": sh.destinationBranch || "Branch",
        "Item Name": p.name,
        "Item Code": p.sku || "—",
        "Supplier": supplierName(it.supplierId || sh.supplierId),
        "Shipped Qty": q,
        "Pack Size": p.packingSize || "—",
        "Est. Cartons": Math.ceil(q / packSize),
        "Unit Price (AED)": uPrice,
        "Total Line Value (AED)": q * uPrice,
        "Total Weight (Kg)": (q * num(p.weightKg)).toFixed(2),
        "Total CBM": (q * num(p.cbm)).toFixed(3),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipment Details");
    XLSX.writeFile(workbook, `Shipment_${sh.shipmentNumber}.xlsx`);
  };

  const exportPackingListPDF = (sh) => {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("OUTBOUND SHIPMENT & CONTAINER MANIFEST", 14, 18);

    doc.setFontSize(9);
    doc.text(`Shipment Ref: ${sh.shipmentNumber}`, 14, 25);
    doc.text(`Status: ${sh.status || "Dispatched"}`, 14, 30);
    doc.text(`Destination: ${sh.destinationBranch || "Branch"}`, 14, 35);
    doc.text(`Origin Country: ${sh.country || "—"}`, 14, 40);
    doc.text(`Dispatch Date: ${sh.date}`, 14, 45);

    let totCbm = 0, totWt = 0, totVal = 0, totCtns = 0;

    const tableRows = sh.items.map((it) => {
      const p = productInfo(it.productId);
      const q = num(it.qty);
      const uPrice = num(it.unitPrice);
      const weight = q * num(p.weightKg);
      const cbm = q * num(p.cbm);
      const lineVal = q * uPrice;

      let packSize = 1;
      if (p.packingSize) {
        const m = p.packingSize.match(/\d+/);
        if (m) packSize = Number(m[0]) || 1;
      }
      const ctns = Math.ceil(q / packSize);

      totCbm += cbm;
      totWt += weight;
      totVal += lineVal;
      totCtns += ctns;

      return [
        p.name, 
        p.sku || "—", 
        supplierName(it.supplierId || sh.supplierId),
        fmt(q) + " " + p.unit, 
        ctns + " ctns",
        "AED " + money(uPrice),
        "AED " + money(lineVal),
        cbm.toFixed(3) + " m³"
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [["Item Name", "Code", "Supplier", "Qty", "Cartons", "Unit Price", "Total Value", "CBM"]],
      body: tableRows,
      headStyles: { fillColor: [27, 36, 48] },
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Container Value: AED ${money(totVal)}`, 14, finalY);
    doc.text(`Total Volume: ${totCbm.toFixed(3)} CBM | Total Weight: ${totWt.toFixed(2)} Kg | Total Boxes: ${totCtns}`, 14, finalY + 6);

    doc.save(`Packing_List_${sh.shipmentNumber}.pdf`);
  };

  const filteredShipments = useMemo(() => {
    return data.shipments.filter(sh => {
      const matchCountry = filterCountry === "all" || sh.country === filterCountry;
      const matchStatus = filterStatus === "all" || (sh.status || "Dispatched") === filterStatus;
      return matchCountry && matchStatus;
    });
  }, [data.shipments, filterCountry, filterStatus]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments &amp; Dispatches</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Container capacity checking, multi-supplier loads, and valuation tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 border border-[#E4DFD3] rounded-xl text-xs shadow-sm">
            <span className="font-bold text-[#7A7568] uppercase">Country:</span>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="border rounded px-2 py-1 font-medium">
              <option value="all">All Countries</option>
              {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <span className="font-bold text-[#7A7568] uppercase ml-2">Status:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1 font-medium">
              <option value="all">All Statuses</option>
              {SHIPMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <button onClick={handleOpenCreateModal} className={btnPrimary}>
            <Plus className="w-4 h-4" /> Create Shipment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredShipments.length === 0 ? (
          <EmptyState text="No outbound shipments match your filters." />
        ) : (
          filteredShipments.map((sh) => {
            const containerVal = sh.items.reduce((s, it) => s + num(it.qty) * num(it.unitPrice), 0);
            const containerCbm = sh.items.reduce((s, it) => {
              const p = productInfo(it.productId);
              return s + num(it.qty) * num(p.cbm);
            }, 0);

            return (
              <div key={sh.id} className={card + " p-5"}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFEAE0]">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{sh.shipmentNumber}</span>
                    <Stamp tone="info">{sh.status || "Dispatched"}</Stamp>
                    <span className="text-xs text-[#7A7568] font-medium">• Destination: {sh.destinationBranch || "Branch"}</span>
                    {sh.country && <span className="text-xs bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-medium">• {sh.country}</span>}
                    <span className="text-xs text-[#9C9788] font-mono">• {sh.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => exportShipmentExcel(sh)} className={btnGhost + " py-1 text-xs"}>
                      <Download className="w-3.5 h-3.5 text-emerald-600" /> Excel
                    </button>
                    <button onClick={() => exportPackingListPDF(sh)} className={btnGhost + " py-1 text-xs"}>
                      <Download className="w-3.5 h-3.5 text-rose-600" /> PDF Manifest
                    </button>
                    <button onClick={() => handleOpenEditModal(sh)} className="text-slate-400 hover:text-[#C98A3E] transition-colors p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteShipment(sh.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EFEAE0] text-xs">
                  <div>Container Valuation: <strong className="text-sm font-bold text-[#1B2430]">AED {money(containerVal)}</strong></div>
                  <div>Total CBM Volume: <strong className="text-sm font-bold text-[#1B2430]">{containerCbm.toFixed(3)} m³</strong></div>
                  <div>20FT Fill Ratio: <strong className="text-sm font-bold text-[#C98A3E]">{((containerCbm / CONTAINER_20FT.cbm) * 100).toFixed(1)}%</strong></div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                      <th className="text-left py-1 font-medium">Item Details</th>
                      <th className="text-left py-1 font-medium">Supplier</th>
                      <th className="text-right py-1 font-medium">Unit Price</th>
                      <th className="text-right py-1 font-medium">Shipped Qty</th>
                      <th className="text-right py-1 font-medium">Total Line Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0E7]">
                    {sh.items.map((it, idx) => {
                      const p = productInfo(it.productId);
                      const lineVal = num(it.qty) * num(it.unitPrice);
                      return (
                        <tr key={idx}>
                          <td className="py-1.5 font-medium">{p.name} {p.sku && <span className="text-xs font-mono text-[#7A7568]">({p.sku})</span>}</td>
                          <td className="py-1.5 text-xs text-[#7A7568]">{supplierName(it.supplierId || sh.supplierId)}</td>
                          <td className="text-right py-1.5 text-xs text-[#7A7568]">{it.unitPrice ? "AED " + money(it.unitPrice) : "—"}</td>
                          <td className="text-right py-1.5 font-semibold text-[#B5453A]">{fmt(it.qty)} {p.unit}</td>
                          <td className="text-right py-1.5 font-bold text-[#1B2430]">{lineVal > 0 ? "AED " + money(lineVal) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-[90vw] h-[85vh] max-w-none p-6 shadow-2xl border border-[#E4DFD3] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFEAE0]">
              <h2 className="text-lg font-bold">{editingShipmentId ? "Edit Outbound Shipment" : "Create Outbound Shipment & Container Check"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-black" /></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEAE0]">
                <Field label="1. Select Country">
                  <select value={country} onChange={(e) => { setCountry(e.target.value); setSelectedSupplierIds([]); setItemSelections({}); }} className={inputCls}>
                    <option value="">Choose Country...</option>
                    {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Shipment Ref #">
                  <input type="text" value={shipmentNumber} onChange={(e) => setShipmentNumber(e.target.value)} placeholder="e.g. SH-2026-001" className={inputCls} />
                </Field>

                <Field label="Destination Branch/Client">
                  <select value={destinationBranch} onChange={(e) => setDestinationBranch(e.target.value)} className={inputCls}>
                    <option value="">Select Branch...</option>
                    {(data.branches || []).map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.country || "General"})</option>
                    ))}
                  </select>
                </Field>

                <Field label="Workflow Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                    {SHIPMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
              </div>

              {country && (
                <div className="border border-[#E4DFD3] rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-[#7A7568] font-bold">2. Select Suppliers in {country}</span>
                    <button onClick={toggleSelectAllSuppliers} className="text-xs text-[#C98A3E] font-bold flex items-center gap-1 hover:underline">
                      {selectedSupplierIds.length === suppliersInCountry.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />} Select All Suppliers
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suppliersInCountry.map(s => {
                      const isSel = selectedSupplierIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSupplier(s.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                            isSel ? "bg-[#1B2430] text-white border-[#1B2430]" : "bg-white text-[#4A4638] border-[#DDD7C7] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {isSel ? <CheckSquare className="w-3.5 h-3.5 text-[#C98A3E]" /> : <Square className="w-3.5 h-3.5" />}
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedSupplierIds.length > 0 && (
                <div className="border border-[#E4DFD3] rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-[#7A7568] font-bold">3. Select Items &amp; Quantities</span>
                    <button onClick={toggleSelectAllProducts} className="text-xs text-[#C98A3E] font-bold flex items-center gap-1 hover:underline">
                      Select All Items
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-60 overflow-y-auto border border-[#EFEAE0] rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF8F5] sticky top-0 border-b border-[#EFEAE0]">
                        <tr>
                          <th className="p-2 text-center w-10">Select</th>
                          <th className="p-2 font-semibold">Item Name</th>
                          <th className="p-2 font-semibold">Supplier</th>
                          <th className="p-2 font-semibold">Pack Size</th>
                          <th className="p-2 font-semibold text-right">In Stock</th>
                          <th className="p-2 font-semibold text-right w-24">Shipped Qty</th>
                          <th className="p-2 font-semibold text-right w-28">Unit Price (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F0E7]">
                        {availableProducts.map(p => {
                          const info = itemSelections[p.id] || { selected: false, qty: "", unitPrice: "" };
                          const inStock = closingQtyFor(p.supplierId, p.id);

                          return (
                            <tr key={p.id} className={info.selected ? "bg-amber-50/40" : "hover:bg-slate-50"}>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!info.selected}
                                  onChange={() => toggleProductSelection(p.id)}
                                  className="rounded border-slate-300 text-[#C98A3E] focus:ring-[#C98A3E]"
                                />
                              </td>
                              <td className="p-2 font-medium">{p.name} {p.sku && <span className="text-[10px] font-mono text-[#7A7568]">({p.sku})</span>}</td>
                              <td className="p-2 text-[#7A7568]">{supplierName(p.supplierId)}</td>
                              <td className="p-2 text-[#7A7568]">{p.packingSize || "—"}</td>
                              <td className="p-2 text-right font-medium text-emerald-700">{fmt(inStock)}</td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={info.qty}
                                  onChange={(e) => handleItemValueChange(p.id, "qty", e.target.value)}
                                  className="w-full border rounded px-1.5 py-1 text-right text-xs"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={info.unitPrice}
                                  onChange={(e) => handleItemValueChange(p.id, "unitPrice", e.target.value)}
                                  className="w-full border rounded px-1.5 py-1 text-right text-xs"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-[#1B2430] text-white p-4 rounded-xl shadow-inner border border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#C98A3E]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Automated Container Capacity &amp; Load Calculator</span>
                  </div>
                  <div className="text-xs text-[#C98A3E] font-bold">Total Container Value: AED {money(containerTotals.totalValue)}</div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center text-xs">
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Est. Total Cartons</span>
                    <span className="text-base font-bold text-white">{fmt(containerTotals.totalCtns)} Boxes</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Volume</span>
                    <span className="text-base font-bold text-amber-400">{containerTotals.totalCbm.toFixed(3)} m³</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Gross Weight</span>
                    <span className="text-base font-bold text-emerald-400">{containerTotals.totalWeight.toFixed(2)} Kg</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">20FT / 40FT Fill Ratio</span>
                    <span className="text-base font-bold text-blue-400">
                      {((containerTotals.totalCbm / CONTAINER_20FT.cbm) * 100).toFixed(0)}% / {((containerTotals.totalCbm / CONTAINER_40FT.cbm) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                    <span>20FT Container Capacity ({CONTAINER_20FT.cbm} CBM Max)</span>
                    <span>{containerTotals.totalCbm.toFixed(2)} / {CONTAINER_20FT.cbm} CBM</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${containerTotals.totalCbm > CONTAINER_20FT.cbm ? "bg-rose-500" : "bg-[#C98A3E]"}`} 
                      style={{ width: `${Math.min(100, (containerTotals.totalCbm / CONTAINER_20FT.cbm) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EFEAE0] mt-2">
              <button onClick={() => setShowModal(false)} className={btnGhost}>Cancel</button>
              <button onClick={saveShipment} className={btnPrimary}>{editingShipmentId ? "Update Shipment" : "Save Shipment & Container Check"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupTab({ data, save, showToast }) {
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [sName, setSName] = useState("");
  const [sCountry, setSCountry] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);
  const [pSupplierId, setPSupplierId] = useState("");
  const [pName, setPName] = useState("");
  const [pSku, setPSku] = useState("");
  const [pUnit, setPUnit] = useState("pcs");
  const [pWeight, setPWeight] = useState("");
  const [pCbm, setPCbm] = useState("");
  const [pPackingSize, setPPackingSize] = useState("");

  const [editingBranchId, setEditingBranchId] = useState(null);
  const [bName, setBName] = useState("");
  const [bCountry, setBCountry] = useState("");
  const [bCode, setBCode] = useState("");

  const [selectedBranchForAssign, setSelectedBranchForAssign] = useState(data.branches?.[0]?.id || "");

  const fileInputRef = useRef(null);
  const [importType, setImportType] = useState("suppliers");

  const handleSaveSupplier = () => {
    if (!sName.trim()) return;

    if (editingSupplierId) {
      const updated = data.suppliers.map(s => s.id === editingSupplierId ? { ...s, name: sName.trim(), country: sCountry.trim() } : s);
      save({ ...data, suppliers: updated }, "Supplier updated");
      setEditingSupplierId(null);
    } else {
      const sup = { id: uid(), name: sName.trim(), country: sCountry.trim() };
      save({ ...data, suppliers: [...data.suppliers, sup] }, "Supplier added");
    }
    setSName("");
    setSCountry("");
  };

  const handleEditSupplier = (sup) => {
    setEditingSupplierId(sup.id);
    setSName(sup.name);
    setSCountry(sup.country || "");
  };

  const handleDeleteSupplier = (id) => {
    save({ ...data, suppliers: data.suppliers.filter(s => s.id !== id) }, "Supplier removed");
  };

  const handleSaveProduct = () => {
    if (!pSupplierId || !pName.trim()) return;

    if (editingProductId) {
      const updated = data.products.map(p => p.id === editingProductId ? {
        ...p,
        supplierId: pSupplierId,
        name: pName.trim(),
        sku: pSku.trim(),
        unit: pUnit,
        weightKg: num(pWeight),
        cbm: num(pCbm),
        packingSize: pPackingSize.trim(),
      } : p);
      save({ ...data, products: updated }, "Item catalog updated");
      setEditingProductId(null);
    } else {
      const prod = { 
        id: uid(), 
        supplierId: pSupplierId, 
        name: pName.trim(), 
        sku: pSku.trim(), 
        unit: pUnit,
        weightKg: num(pWeight),
        cbm: num(pCbm),
        packingSize: pPackingSize.trim(),
      };
      save({ ...data, products: [...data.products, prod] }, "Item added to catalog");
    }

    setPName("");
    setPSku("");
    setPWeight("");
    setPCbm("");
    setPPackingSize("");
  };

  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setPSupplierId(prod.supplierId);
    setPName(prod.name);
    setPSku(prod.sku || "");
    setPUnit(prod.unit || "pcs");
    setPWeight(prod.weightKg ? String(prod.weightKg) : "");
    setPCbm(prod.cbm ? String(prod.cbm) : "");
    setPPackingSize(prod.packingSize || "");
  };

  const handleDeleteProduct = (id) => {
    save({ ...data, products: data.products.filter(p => p.id !== id) }, "Item removed from catalog");
  };

  const handleSaveBranch = () => {
    if (!bName.trim()) return;

    const branches = data.branches || [];

    if (editingBranchId) {
      const updated = branches.map(b => b.id === editingBranchId ? {
        ...b,
        name: bName.trim(),
        country: bCountry.trim(),
        code: bCode.trim()
      } : b);
      save({ ...data, branches: updated }, "Branch / Client updated");
      setEditingBranchId(null);
    } else {
      const newBranch = {
        id: uid(),
        name: bName.trim(),
        country: bCountry.trim(),
        code: bCode.trim(),
        allowedProductIds: []
      };
      save({ ...data, branches: [...branches, newBranch] }, "Branch / Client added");
    }

    setBName("");
    setBCountry("");
    setBCode("");
  };

  const handleEditBranch = (branch) => {
    setEditingBranchId(branch.id);
    setBName(branch.name);
    setBCountry(branch.country || "");
    setBCode(branch.code || "");
  };

  const handleDeleteBranch = (id) => {
    const branches = data.branches || [];
    save({ ...data, branches: branches.filter(b => b.id !== id) }, "Branch / Client removed");
  };

  const toggleProductAssignment = (productId) => {
    const currentBranch = (data.branches || []).find(b => b.id === selectedBranchForAssign);
    if (!currentBranch) return;

    const currentAllowed = currentBranch.allowedProductIds || [];
    const isAssigned = currentAllowed.includes(productId);

    const nextAllowed = isAssigned
      ? currentAllowed.filter(id => id !== productId)
      : [...currentAllowed, productId];

    const updatedBranches = data.branches.map(b => 
      b.id === currentBranch.id ? { ...b, allowedProductIds: nextAllowed } : b
    );

    save({ ...data, branches: updatedBranches }, `Updated item access for ${currentBranch.name}`);
  };

  const downloadTemplate = (type) => {
    let sampleData = [];
    let filename = "";

    if (type === "suppliers") {
      filename = "Suppliers_Template.xlsx";
      sampleData = [{ "Supplier Name": "Guangzhou Trading Co.", "Country": "China" }];
    } else if (type === "products") {
      filename = "Master_Items_Template.xlsx";
      sampleData = [{ "Item Name": "Perfume 100ml", "Item Code": "PRF-001", "Supplier Name": "Guangzhou Trading Co.", "Unit": "pcs", "Packing Size": "24 pcs/ctn", "Weight (Kg)": 0.45, "CBM": 0.002 }];
    } else if (type === "branches") {
      filename = "Branches_Template.xlsx";
      sampleData = [{ "Branch / Client Name": "Dubai Central Warehouse", "Country": "UAE", "Branch Code": "DXB-MAIN" }];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws);

        if (type === "suppliers") {
          const newSuppliers = [...data.suppliers];
          rows.forEach((r) => {
            const name = r["Supplier Name"] || r["name"];
            const country = r["Country"] || r["country"];
            if (name) {
              newSuppliers.push({ id: uid(), name: String(name).trim(), country: String(country || "").trim() });
            }
          });
          save({ ...data, suppliers: newSuppliers }, `Successfully imported ${rows.length} suppliers`);
        } else if (type === "products") {
          const newProducts = [...data.products];
          rows.forEach((r) => {
            const name = r["Item Name"] || r["name"];
            const sku = r["Item Code"] || r["sku"] || "";
            const supName = r["Supplier Name"] || r["supplierName"] || "";
            const unit = r["Unit"] || r["unit"] || "pcs";
            const packingSize = r["Packing Size"] || r["packingSize"] || "";
            const weightKg = Number(r["Weight (Kg)"] || r["weightKg"] || 0);
            const cbm = Number(r["CBM"] || r["cbm"] || 0);

            let matchedSup = data.suppliers.find(s => s.name.toLowerCase() === String(supName).toLowerCase());
            const supplierId = matchedSup ? matchedSup.id : (data.suppliers[0]?.id || "");

            if (name) {
              newProducts.push({
                id: uid(),
                supplierId,
                name: String(name).trim(),
                sku: String(sku).trim(),
                unit: String(unit).trim(),
                packingSize: String(packingSize).trim(),
                weightKg,
                cbm
              });
            }
          });
          save({ ...data, products: newProducts }, `Successfully imported ${rows.length} items`);
        } else if (type === "branches") {
          const newBranches = [...(data.branches || [])];
          rows.forEach((r) => {
            const name = r["Branch / Client Name"] || r["name"];
            const country = r["Country"] || r["country"] || "";
            const code = r["Branch Code"] || r["code"] || "";
            if (name) {
              newBranches.push({ id: uid(), name: String(name).trim(), country: String(country).trim(), code: String(code).trim(), allowedProductIds: [] });
            }
          });
          save({ ...data, branches: newBranches }, `Successfully imported ${rows.length} branches/clients`);
        }
      } catch (err) {
        console.error(err);
        showToast("Error parsing uploaded file", "error");
      }
      e.target.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const currentBranchForAssignObj = (data.branches || []).find(b => b.id === selectedBranchForAssign);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Data Setup</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Manage master suppliers, item catalogs, and branch/client destinations.</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e, importType)} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Suppliers Box */}
        <div className={card + " p-5 flex flex-col justify-between"}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className={sectionLabel + " mb-0"}>{editingSupplierId ? "Edit Supplier" : "Register Supplier"}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => downloadTemplate("suppliers")} title="Download Excel Template" className="text-xs text-[#7A7568] hover:text-[#C98A3E] font-medium flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded border border-[#E4DFD3]">
                  <Download className="w-3 h-3" /> Template
                </button>
                <button onClick={() => { setImportType("suppliers"); fileInputRef.current.click(); }} title="Bulk Import Excel" className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <Upload className="w-3 h-3" /> Import
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Field label="Supplier Name"><input type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Guangzhou Trade Co." className={inputCls} /></Field>
              <Field label="Country"><input type="text" value={sCountry} onChange={(e) => setSCountry(e.target.value)} placeholder="e.g. China" className={inputCls} /></Field>
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
              <Field label="Branch / Client Name"><input type="text" value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. Dubai Warehouse" className={inputCls} /></Field>
              <Field label="Destination Country"><input type="text" value={bCountry} onChange={(e) => setBCountry(e.target.value)} placeholder="e.g. UAE" className={inputCls} /></Field>
              <Field label="Branch Code"><input type="text" value={bCode} onChange={(e) => setBCode(e.target.value)} placeholder="e.g. DXB-MAIN" className={inputCls} /></Field>
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
              <Field label="Supplier">
                <select value={pSupplierId} onChange={(e) => setPSupplierId(e.target.value)} className={inputCls}>
                  <option value="">Select Supplier...</option>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Item Name"><input type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Perfume 100ml" className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Item Code"><input type="text" value={pSku} onChange={(e) => setPSku(e.target.value)} placeholder="e.g. PRF-001" className={inputCls} /></Field>
                <Field label="Packing Size"><input type="text" value={pPackingSize} onChange={(e) => setPPackingSize(e.target.value)} placeholder="24 pcs/ctn" className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Weight (Kg)"><input type="number" value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="0.00" className={inputCls} /></Field>
                <Field label="CBM"><input type="number" value={pCbm} onChange={(e) => setPCbm(e.target.value)} placeholder="0.000" className={inputCls} /></Field>
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

      <div className={card + " p-6 mt-6 space-y-4"}>
        <div className="flex items-center justify-between border-b border-[#E4DFD3] pb-4">
          <div>
            <h2 className="font-bold text-base text-[#1B2430]">Branch Item Access Control</h2>
            <p className="text-xs text-[#7A7568]">Select a branch below and toggle which items they are permitted to view and order.</p>
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

function BranchPortalTab({ data, save, showToast, branchId }) {
  const [selectedBranchId, setSelectedBranchId] = useState(branchId || data.branches?.[0]?.id || "");
  const [orderCart, setOrderCart] = useState({});

  const currentBranch = data.branches.find(b => b.id === selectedBranchId);

  const availableProducts = useMemo(() => {
    if (!currentBranch) return [];
    const allowed = currentBranch.allowedProductIds || [];
    if (allowed.length === 0) return data.products; 
    return data.products.filter(p => allowed.includes(p.id));
  }, [currentBranch, data.products]);

  const handleQtyChange = (productId, val) => {
    setOrderCart(prev => ({ ...prev, [productId]: num(val) }));
  };

  const submitBranchOrder = () => {
    if (!selectedBranchId) return showToast("Please select a branch first", "error");
    const itemsToOrder = Object.entries(orderCart)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId, qty }));

    if (itemsToOrder.length === 0) return showToast("Please add quantities to order", "error");

    const newOrder = {
      id: uid(),
      branchId: selectedBranchId,
      branchName: currentBranch?.name || "Branch",
      date: todayStr(),
      status: "Submitted",
      items: itemsToOrder
    };

    const nextData = {
      ...data,
      branchOrders: [...(data.branchOrders || []), newOrder]
    };

    save(nextData, "Branch order submitted successfully!");
    setOrderCart({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branch Order Portal</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Restricted item catalog for branch-level requisition.</p>
        </div>
        {!branchId && (
          <div className="flex items-center gap-2 bg-white p-2 border border-[#E4DFD3] rounded-xl shadow-sm">
            <span className="text-[11px] text-[#7A7568] font-bold uppercase tracking-wider">Select Branch:</span>
            <select 
              className={inputCls + " font-medium py-1 text-xs"}
              value={selectedBranchId}
              onChange={(e) => { setSelectedBranchId(e.target.value); setOrderCart({}); }}
            >
              {(data.branches || []).map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.location || "Branch"})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={card + " p-5"}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4DFD3]">
          <div>
            <h2 className="font-bold text-base text-[#1B2430]">{currentBranch?.name || "Select a Branch"} Catalog</h2>
            <p className="text-xs text-[#7A7568]">Permitted items available for requisition.</p>
          </div>
          <button onClick={submitBranchOrder} className={btnPrimary}>
            Submit Requisition
          </button>
        </div>

        {availableProducts.length === 0 ? (
          <EmptyState text="No permitted items assigned to this branch yet. Please contact admin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-2 font-semibold">Item Name</th>
                  <th className="text-left py-2 font-semibold">SKU / Code</th>
                  <th className="text-left py-2 font-semibold">Packing Size</th>
                  <th className="text-right py-2 font-semibold w-36">Request Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {availableProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2.5 font-medium text-[#1B2430]">{p.name}</td>
                    <td className="py-2.5 font-mono text-xs text-slate-500">{p.sku || "—"}</td>
                    <td className="py-2.5 text-xs text-[#7A7568]">{p.packingSize || "—"}</td>
                    <td className="text-right py-2.5">
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="0"
                        value={orderCart[p.id] || ""}
                        onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        className={inputCls + " w-28 text-right py-1 text-xs"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MOQConsolidationTab({ data, save, showToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">MOQ Consolidation</h1>
        <p className="text-sm text-[#7A7568] mt-0.5">Consolidate supplier minimum order quantities and branch orders into draft PIs.</p>
      </div>
      <div className={card + " p-6"}>
        <EmptyState text="MOQ Consolidation module is ready. Branch requisitions and supplier thresholds will appear here for batch processing." />
      </div>
    </div>
  );
}
