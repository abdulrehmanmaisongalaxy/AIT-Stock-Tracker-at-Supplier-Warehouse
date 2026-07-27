import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Trash2, Package, FileText, Ship, LayoutGrid, X, 
  AlertCircle, Loader2, CheckCircle2, Boxes, BookOpen, 
  Upload, Download, FileSpreadsheet, Edit3, Globe,
  Search, AlertTriangle
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

const STORE_KEY = "trading-ledger-v2";
const emptyData = { suppliers: [], products: [], pis: [], shipments: [] };

function Stamp({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    pipeline: "bg-amber-50 text-amber-800 border border-amber-200/60",
    partial: "bg-amber-50 text-amber-800 border border-amber-200/60",
    stock: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
    low: "bg-rose-50 text-rose-700 border border-rose-200/60",
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
  ["pis", "Proforma Invoices", FileText],
  ["shipments", "Shipments", Ship],
  ["setup", "Suppliers & Items", Package],
];

export default function StockLedger() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
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
            showToast("Local data successfully migrated to central database!", "success");
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
    for (const pi of data.pis) {
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
    for (const sh of data.shipments) {
      for (const it of sh.items) {
        const row = touch(sh.supplierId, it.productId);
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

          <div className="px-2 pt-4 border-t border-[#E4DFD3]/80 space-y-2 text-[11px] text-[#7A7568] mb-4">
            <div className="flex justify-between items-center">
              <span>Suppliers</span>
              <span className="font-semibold text-[#1B2430]">{data.suppliers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>PIs Logged</span>
              <span className="font-semibold text-[#1B2430]">{data.pis.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipments</span>
              <span className="font-semibold text-[#1B2430]">{data.shipments.length}</span>
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
        </main>
      </div>

      {/* Floating Toast Notification */}
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
        
        {/* Global Search Bar */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A7568]" />
          <input 
            type="text" 
            placeholder="Search Item Name, Item Code, supplier..." 
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

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Closing Stock Value" value={"AED " + money(totals.closingValue)} icon={Boxes} tone="stock" hint="Current Sellable Valuation" />
        <StatCard label="Total Sellable Quantity" value={fmt(totals.closingQty)} icon={CheckCircle2} tone="stock" hint="In Warehouse Right Now" />
        <StatCard label="Pipeline Quantity" value={fmt(totals.pipelineQty)} icon={FileText} tone="pipeline" hint="Ordered & In Transit" />
      </div>

      {/* Country Wise Summary Card */}
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

      {/* Stock by Supplier Detailed Breakdown */}
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
                  <span className="text-[#9C9788] text-xs font-mono">{sh.date}</span>
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

    data.shipments.filter(s => s.supplierId === selectedSupplier).forEach(sh => {
      sh.items.forEach(it => {
        events.push({
          date: sh.date,
          type: "Shipment Out",
          ref: sh.shipmentNumber + " → " + (sh.destinationBranch || "Branch"),
          productId: it.productId,
          ordered: 0,
          received: 0,
          shipped: num(it.qty),
        });
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
  const [supplierId, setSupplierId] = useState("");
  const [piNumber, setPiNumber] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([]);

  const addPI = () => {
    if (!supplierId || !piNumber.trim()) return;
    const newPI = {
      id: uid(),
      supplierId,
      piNumber: piNumber.trim(),
      date,
      items: items.filter((i) => i.productId && num(i.qty) > 0),
    };
    save({ ...data, pis: [...data.pis, newPI] }, "Proforma Invoice saved successfully");
    setShowModal(false);
    setPiNumber("");
    setItems([]);
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
    save({ ...data, pis: data.pis.filter((p) => p.id !== id) }, "PI removed");
  };

  const availableProducts = useMemo(() => {
    return data.products.filter((p) => p.supplierId === supplierId);
  }, [data.products, supplierId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proforma Invoices (PIs)</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Log signed purchase orders and record physical warehouse receipts.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}>
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
                  <button onClick={() => deletePI(pi.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4DFD3]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Log Proforma Invoice</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-black" /></button>
            </div>
            <div className="space-y-4">
              <Field label="Supplier">
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputCls + " w-full"}>
                  <option value="">Select Supplier...</option>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="PI Number"><input type="text" value={piNumber} onChange={(e) => setPiNumber(e.target.value)} placeholder="e.g. PI-2026-001" className={inputCls} /></Field>
                <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
              </div>

              {supplierId && (
                <div>
                  <div className={sectionLabel}>Items in PI</div>
                  {availableProducts.map((p) => {
                    const existing = items.find((i) => i.productId === p.id) || { qty: 0, unitPrice: 0 };
                    return (
                      <div key={p.id} className="flex items-center gap-2 mb-2">
                        <span className="flex-1 text-xs font-medium truncate">{p.name}</span>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={existing.qty || ""}
                          onChange={(e) => {
                            const qty = num(e.target.value);
                            setItems((prev) => [...prev.filter((i) => i.productId !== p.id), { productId: p.id, qty, unitPrice: existing.unitPrice }]);
                          }}
                          className={inputCls + " w-20 py-1 text-xs"}
                        />
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={existing.unitPrice || ""}
                          onChange={(e) => {
                            const unitPrice = num(e.target.value);
                            setItems((prev) => [...prev.filter((i) => i.productId !== p.id), { productId: p.id, qty: existing.qty, unitPrice }]);
                          }}
                          className={inputCls + " w-24 py-1 text-xs"}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setShowModal(false)} className={btnGhost}>Cancel</button>
                <button onClick={addPI} className={btnPrimary}>Save PI</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShipmentsTab({ data, save, supplierName, productInfo, closingQtyFor }) {
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [destinationBranch, setDestinationBranch] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([]);

  const addShipment = () => {
    if (!supplierId || !shipmentNumber.trim()) return;
    const newShipment = {
      id: uid(),
      supplierId,
      shipmentNumber: shipmentNumber.trim(),
      destinationBranch: destinationBranch.trim(),
      date,
      items: items.filter((i) => i.productId && num(i.qty) > 0),
    };
    save({ ...data, shipments: [...data.shipments, newShipment] }, "Shipment recorded successfully");
    setShowModal(false);
    setShipmentNumber("");
    setDestinationBranch("");
    setItems([]);
  };

  const deleteShipment = (id) => {
    save({ ...data, shipments: data.shipments.filter((s) => s.id !== id) }, "Shipment deleted");
  };

  const exportPackingListPDF = (sh) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("OUTBOUND SHIPMENT PACKING LIST", 14, 20);

    doc.setFontSize(10);
    doc.text(`Shipment Ref: ${sh.shipmentNumber}`, 14, 28);
    doc.text(`Destination: ${sh.destinationBranch || "Branch"}`, 14, 34);
    doc.text(`Supplier: ${supplierName(sh.supplierId)}`, 14, 40);
    doc.text(`Dispatch Date: ${sh.date}`, 14, 46);

    const tableRows = sh.items.map((it) => {
      const p = productInfo(it.productId);
      const totalWeight = num(it.qty) * num(p.weightKg);
      const totalCbm = num(it.qty) * num(p.cbm);
      return [p.name, p.sku || "—", fmt(it.qty) + " " + p.unit, p.packingSize || "—", totalWeight > 0 ? totalWeight.toFixed(2) + " kg" : "—", totalCbm > 0 ? totalCbm.toFixed(3) + " m³" : "—"];
    });

    autoTable(doc, {
      startY: 52,
      head: [["Item Name", "Item Code", "Shipped Qty", "Packing Size", "Est. Weight", "Est. CBM"]],
      body: tableRows,
      headStyles: { fillColor: [27, 36, 48] },
    });

    doc.save(`Packing_List_${sh.shipmentNumber}.pdf`);
  };

  const availableProducts = useMemo(() => {
    return data.products.filter((p) => p.supplierId === supplierId);
  }, [data.products, supplierId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments &amp; Dispatches</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Record outbound goods movement and export PDF packing lists.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={btnPrimary}>
          <Plus className="w-4 h-4" /> Record New Shipment
        </button>
      </div>

      <div className="space-y-4">
        {data.shipments.length === 0 ? (
          <EmptyState text="No outbound shipments logged yet." />
        ) : (
          data.shipments.map((sh) => (
            <div key={sh.id} className={card + " p-5"}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFEAE0]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{sh.shipmentNumber}</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">→ {sh.destinationBranch || "Branch"}</span>
                  <span className="text-xs text-[#7A7568] font-medium">• {supplierName(sh.supplierId)}</span>
                  <span className="text-xs text-[#9C9788] font-mono">• {sh.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportPackingListPDF(sh)} className={btnGhost + " py-1 text-xs"}>
                    <Download className="w-3.5 h-3.5 text-rose-600" /> PDF Packing List
                  </button>
                  <button onClick={() => deleteShipment(sh.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                    <th className="text-left py-1 font-medium">Item Name</th>
                    <th className="text-right py-1 font-medium">Shipped Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F0E7]">
                  {sh.items.map((it, idx) => {
                    const p = productInfo(it.productId);
                    return (
                      <tr key={idx}>
                        <td className="py-1.5 font-medium">{p.name} {p.sku && <span className="text-xs font-mono text-[#7A7568]">({p.sku})</span>}</td>
                        <td className="text-right py-1.5 font-semibold text-[#B5453A]">{fmt(it.qty)} {p.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4DFD3]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Record Outbound Shipment</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-black" /></button>
            </div>
            <div className="space-y-4">
              <Field label="Supplier">
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputCls + " w-full"}>
                  <option value="">Select Supplier...</option>
                  {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shipment Ref #"><input type="text" value={shipmentNumber} onChange={(e) => setShipmentNumber(e.target.value)} placeholder="e.g. SH-001" className={inputCls} /></Field>
                <Field label="Destination Branch"><input type="text" value={destinationBranch} onChange={(e) => setDestinationBranch(e.target.value)} placeholder="e.g. Dubai Main Branch" className={inputCls} /></Field>
              </div>
              <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>

              {supplierId && (
                <div>
                  <div className={sectionLabel}>Items Dispatched</div>
                  {availableProducts.map((p) => {
                    const stock = closingQtyFor(supplierId, p.id);
                    const existing = items.find((i) => i.productId === p.id) || { qty: 0 };
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{p.name}</div>
                          <div className="text-[10px] text-[#7A7568]">Available Stock: {fmt(stock)} {p.unit}</div>
                        </div>
                        <input
                          type="number"
                          placeholder="Shipped Qty"
                          value={existing.qty || ""}
                          onChange={(e) => {
                            const qty = num(e.target.value);
                            setItems((prev) => [...prev.filter((i) => i.productId !== p.id), { productId: p.id, qty }]);
                          }}
                          className={inputCls + " w-28 py-1 text-xs text-right"}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setShowModal(false)} className={btnGhost}>Cancel</button>
                <button onClick={addShipment} className={btnPrimary}>Save Shipment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupTab({ data, save, showToast }) {
  const [sName, setSName] = useState("");
  const [sCountry, setSCountry] = useState("");
  
  const [pSupplierId, setPSupplierId] = useState("");
  const [pName, setPName] = useState("");
  const [pSku, setPSku] = useState("");
  const [pUnit, setPUnit] = useState("pcs");
  const [pWeight, setPWeight] = useState("");
  const [pCbm, setPCbm] = useState("");
  const [pPackingSize, setPPackingSize] = useState("");

  const fileInputRef = useRef(null);

  const addSupplier = () => {
    if (!sName.trim()) return;
    const sup = { id: uid(), name: sName.trim(), country: sCountry.trim() };
    save({ ...data, suppliers: [...data.suppliers, sup] }, "Supplier added");
    setSName("");
    setSCountry("");
  };

  const addProduct = () => {
    if (!pSupplierId || !pName.trim()) return;
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
    save({ ...data, products: [...data.products, prod] }, "Item master catalog updated");
    setPName("");
    setPSku("");
    setPWeight("");
    setPCbm("");
    setPPackingSize("");
  };

  const handleBulkExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        if (rows.length === 0) {
          showToast("Uploaded Excel file contains no valid rows", "error");
          return;
        }

        const newSuppliers = [...data.suppliers];
        const newProducts = [...data.products];

        rows.forEach((row) => {
          const sNameRaw = String(row["Supplier Name"] || row["Supplier"] || "").trim();
          const sCountryRaw = String(row["Country"] || "").trim();
          const pNameRaw = String(row["Item Name"] || row["Product Name"] || "").trim();
          const pCodeRaw = String(row["Item Code"] || row["SKU"] || "").trim();
          const pUnitRaw = String(row["Unit"] || "pcs").trim();

          if (sNameRaw) {
            let supplier = newSuppliers.find((s) => s.name.toLowerCase() === sNameRaw.toLowerCase());
            if (!supplier) {
              supplier = { id: uid(), name: sNameRaw, country: sCountryRaw };
              newSuppliers.push(supplier);
            }

            if (pNameRaw) {
              newProducts.push({
                id: uid(),
                supplierId: supplier.id,
                name: pNameRaw,
                sku: pCodeRaw,
                unit: pUnitRaw,
                weightKg: num(row["Weight (Kg)"]),
                cbm: num(row["CBM"]),
                packingSize: String(row["Packing Size"] || "").trim(),
              });
            }
          }
        });

        save({ ...data, suppliers: newSuppliers, products: newProducts }, `Bulk imported ${rows.length} records successfully!`);
      } catch (err) {
        console.error("Bulk upload parse error:", err);
        showToast("Error parsing Excel file. Ensure headers match required schema.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers &amp; Items Setup</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Manage master database of suppliers and item master catalog.</p>
        </div>

        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkExcelUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button onClick={() => fileInputRef.current.click()} className={btnGhost}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Excel Bulk Import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Suppliers Setup */}
        <div className={card + " p-5"}>
          <div className={sectionLabel}>Register New Supplier</div>
          <div className="space-y-3 mb-6">
            <Field label="Supplier Name"><input type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Guangzhou Trade Co." className={inputCls} /></Field>
            <Field label="Country"><input type="text" value={sCountry} onChange={(e) => setSCountry(e.target.value)} placeholder="e.g. China" className={inputCls} /></Field>
            <button onClick={addSupplier} className={btnPrimary + " w-full justify-center"}>Add Supplier</button>
          </div>

          <div className={sectionLabel}>Active Suppliers ({data.suppliers.length})</div>
          <ul className="divide-y divide-[#F3F0E7] max-h-60 overflow-y-auto">
            {data.suppliers.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-[#7A7568] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E4DFD3]">{s.country || "—"}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Catalog Setup */}
        <div className={card + " p-5"}>
          <div className={sectionLabel}>Register New Item</div>
          <div className="space-y-3 mb-6">
            <Field label="Supplier">
              <select value={pSupplierId} onChange={(e) => setPSupplierId(e.target.value)} className={inputCls}>
                <option value="">Select Supplier...</option>
                {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Item Name"><input type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Perfume 100ml" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Item Code"><input type="text" value={pSku} onChange={(e) => setPSku(e.target.value)} placeholder="e.g. PRF-001" className={inputCls} /></Field>
              <Field label="Unit"><input type="text" value={pUnit} onChange={(e) => setPUnit(e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Weight (Kg)"><input type="number" value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="0.00" className={inputCls} /></Field>
              <Field label="CBM"><input type="number" value={pCbm} onChange={(e) => setPCbm(e.target.value)} placeholder="0.000" className={inputCls} /></Field>
              <Field label="Packing Size"><input type="text" value={pPackingSize} onChange={(e) => setPPackingSize(e.target.value)} placeholder="e.g. 24 pcs/ctn" className={inputCls} /></Field>
            </div>
            <button onClick={addProduct} className={btnPrimary + " w-full justify-center"}>Add Item to Catalog</button>
          </div>

          <div className={sectionLabel}>Item Master Catalog ({data.products.length})</div>
          <ul className="divide-y divide-[#F3F0E7] max-h-60 overflow-y-auto">
            {data.products.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-[#7A7568] font-mono">{p.sku || "No Code"}</div>
                </div>
                <span className="text-xs text-[#7A7568]">{p.unit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
