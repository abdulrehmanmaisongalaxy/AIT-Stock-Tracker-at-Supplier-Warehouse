import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Trash2, Package, FileText, Ship, LayoutGrid, X, 
  AlertCircle, Loader2, CheckCircle2, Boxes, BookOpen, 
  Upload, Download, FileSpreadsheet, Edit3, FileCode, Globe,
  Search, ArrowUpRight, AlertTriangle, Check
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
      setData({ ...emptyData, ...serverData });
    })
    .catch((err) => {
      console.error("Error fetching inventory data:", err);
      showToast("Could not connect to server", "error");
    })
    .finally(() => setLoading(false));
}, []);

const save = (next, msg) => {
  setData(next);
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save");
      if (msg) showToast(msg, "success");
    })
    .catch((e) => {
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
        <aside className="w-[220px] shrink-0 border-r border-[#E4DFD3] min-h-screen px-4 py-6 bg-[#F6F3EC]/50 backdrop-blur-sm sticky top-0 h-screen">
          <div className="mb-8 px-2">
            <div className="inline-block px-2 py-0.5 rounded bg-[#C98A3E]/10 text-[10px] uppercase tracking-[0.18em] text-[#C98A3E] font-bold mb-1">
              Enterprise Hub
            </div>
            <div className="text-[16px] font-bold tracking-tight text-[#1B2430]">Stock &amp; Ledger</div>
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

          <div className="mt-10 px-2 pt-4 border-t border-[#E4DFD3]/80 space-y-2 text-[11px] text-[#7A7568]">
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
          {tab === "setup" && <SetupTab data={data} save={save} />}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
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
            placeholder="Search item, SKU, supplier..." 
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
                            <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Audit item stock balances and complete transaction movement history.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 border border-[#E4DFD3] rounded-xl shadow-sm">
          {/* Country Selection Dropdown */}
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

          {/* Supplier Selection Dropdown */}
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
                      <th className="text-left py-2 font-semibold">Item &amp; SKU</th>
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
                            <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>
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
                      <th className="text-left py-2 font-semibold">Item</th>
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

function StatCard({ label, value, icon: Icon, tone, hint }) {
  const toneBg = tone === "stock" ? "bg-emerald-100/70 text-emerald-800" : "bg-amber-100/70 text-amber-800";
  return (
    <div className={card + " p-5 flex items-start gap-4"}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-[#7A7568] font-bold leading-tight">{label}</div>
        <div className="text-xl font-bold tracking-tight text-[#1B2430] mt-1">{value}</div>
        {hint && <div className="text-[11px] text-[#9C9788] mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border border-dashed border-[#DDD7C7] rounded-xl px-4 py-8 text-center text-sm text-[#9C9788] bg-[#FAF8F5]">
      {text}
    </div>
  );
}

function SetupTab({ data, save }) {
  const [supForm, setSupForm] = useState({ name: "", country: "", contact: "" });
  const [prodForm, setProdForm] = useState({ sku: "", name: "", unit: "pcs", weightKg: "", cbm: "", packingSize: "" });

  const [editingSup, setEditingSup] = useState(null);
  const [editingProd, setEditingProd] = useState(null);

  const addSupplier = () => {
    if (!supForm.name.trim()) return;
    save({ ...data, suppliers: [...data.suppliers, { id: uid(), ...supForm }] }, "Supplier added successfully!");
    setSupForm({ name: "", country: "", contact: "" });
  };

  const addProduct = () => {
    if (!prodForm.name.trim()) return;
    save({
      ...data,
      products: [
        ...data.products,
        {
          id: uid(),
          ...prodForm,
          unit: prodForm.unit.trim() || "pcs",
          weightKg: num(prodForm.weightKg),
          cbm: num(prodForm.cbm),
        },
      ],
    }, "Item added to catalog!");
    setProdForm({ sku: "", name: "", unit: "pcs", weightKg: "", cbm: "", packingSize: "" });
  };

  const saveEditedSupplier = () => {
    if (!editingSup.name.trim()) return;
    const updated = data.suppliers.map((s) => (s.id === editingSup.id ? editingSup : s));
    save({ ...data, suppliers: updated }, "Supplier details updated!");
    setEditingSup(null);
  };

  const saveEditedProduct = () => {
    if (!editingProd.name.trim()) return;
    const updated = data.products.map((p) =>
      p.id === editingProd.id
        ? { ...editingProd, weightKg: num(editingProd.weightKg), cbm: num(editingProd.cbm) }
        : p
    );
    save({ ...data, products: updated }, "Item details updated!");
    setEditingProd(null);
  };

  const removeSupplier = (id) => save({ ...data, suppliers: data.suppliers.filter((s) => s.id !== id) }, "Supplier deleted.");
  const removeProduct = (id) => save({ ...data, products: data.products.filter((p) => p.id !== id) }, "Item removed from catalog.");

  const downloadTemplate = () => {
    const templateData = [
      {
        "Supplier Name": "Perfume France Ltd",
        "Country": "France",
        "Contact": "jean@perfume.fr",
        "Item Code": "PRF-001",
        "Item Name": "Oud Royal 100ml",
        "Unit": "pcs",
        "Weight (kg)": 0.45,
        "CBM": 0.0012,
        "Packing Size": "24 pcs/ctn"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bulk Import");
    XLSX.writeFile(wb, "Supplier_Item_Import_Template.xlsx");
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        const newSuppliers = [...data.suppliers];
        const newProducts = [...data.products];

        rows.forEach((row) => {
          const supName = row["Supplier Name"] || row["Supplier"];
          if (supName) {
            let sup = newSuppliers.find((s) => s.name.toLowerCase() === supName.toString().toLowerCase());
            if (!sup) {
              sup = {
                id: uid(),
                name: supName.toString().trim(),
                country: (row["Country"] || "").toString().trim(),
                contact: (row["Contact"] || "").toString().trim(),
              };
              newSuppliers.push(sup);
            }
          }

          const prodName = row["Item Name"] || row["Product Name"] || row["Product"];
          if (prodName) {
            newProducts.push({
              id: uid(),
              sku: (row["Item Code"] || row["SKU"] || "").toString().trim(),
              name: prodName.toString().trim(),
              unit: (row["Unit"] || "pcs").toString().trim(),
              weightKg: num(row["Weight (kg)"] || row["Weight"]),
              cbm: num(row["CBM"]),
              packingSize: (row["Packing Size"] || "").toString().trim(),
            });
          }
        });

        save({ ...data, suppliers: newSuppliers, products: newProducts }, "Excel catalog imported successfully!");
      } catch (err) {
        alert("Error parsing Excel file. Please use the downloaded template format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers &amp; Master Catalog</h1>
          <p className="text-sm text-[#7A7568] mt-0.5">Manage registered suppliers, product catalog specifications, or import via Excel.</p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={downloadTemplate}>
            <Download className="w-4 h-4 text-[#7A7568]" /> Excel Template
          </button>
          <label className={btnPrimary + " cursor-pointer"}>
            <Upload className="w-4 h-4 text-[#C98A3E]" /> Bulk Import
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={card + " p-5"}>
          <div className={sectionLabel}>Suppliers Directory</div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <input className={inputCls + " flex-1 min-w-[110px]"} placeholder="Supplier Name" value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} />
            <input className={inputCls + " w-28"} placeholder="Country" value={supForm.country} onChange={(e) => setSupForm({ ...supForm, country: e.target.value })} />
            <input className={inputCls + " w-28"} placeholder="Contact email/phone" value={supForm.contact} onChange={(e) => setSupForm({ ...supForm, contact: e.target.value })} />
            <button className={btnPrimary} onClick={addSupplier}><Plus className="w-4 h-4" />Add</button>
          </div>
          <ul className="divide-y divide-[#F3F0E7]">
            {data.suppliers.length === 0 && <li className="py-4 text-sm text-[#9C9788] text-center">No suppliers added yet.</li>}
            {data.suppliers.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between text-sm hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-[#1B2430]">{s.name} {s.country && <span className="text-xs font-normal text-[#7A7568] ml-1">({s.country})</span>}</div>
                  {s.contact && <div className="text-xs text-[#7A7568]">{s.contact}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingSup(s)} className="p-1 text-[#7A7568] hover:text-[#C98A3E]"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeSupplier(s.id)} className="p-1 text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={card + " p-5"}>
          <div className={sectionLabel}>Master Items Catalog</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <input className={inputCls} placeholder="Item Code / SKU" value={prodForm.sku} onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })} />
            <input className={inputCls + " col-span-2"} placeholder="Full Item Name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} />
            <input className={inputCls} placeholder="Unit (e.g. pcs)" value={prodForm.unit} onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })} />
            <input className={inputCls} placeholder="Unit Wt (kg)" type="number" value={prodForm.weightKg} onChange={(e) => setProdForm({ ...prodForm, weightKg: e.target.value })} />
            <input className={inputCls} placeholder="Unit CBM" type="number" value={prodForm.cbm} onChange={(e) => setProdForm({ ...prodForm, cbm: e.target.value })} />
            <input className={inputCls + " col-span-2"} placeholder="Packing size (e.g. 24 pcs/ctn)" value={prodForm.packingSize} onChange={(e) => setProdForm({ ...prodForm, packingSize: e.target.value })} />
            <button className={btnPrimary + " h-[38px] justify-center"} onClick={addProduct}><Plus className="w-4 h-4" />Add Item</button>
          </div>
          <ul className="divide-y divide-[#F3F0E7]">
            {data.products.length === 0 && <li className="py-4 text-sm text-[#9C9788] text-center">No items added to catalog.</li>}
            {data.products.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center justify-between text-sm hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-[#1B2430]">
                    {p.name} <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-1">{p.sku}</span>
                  </div>
                  <div className="text-[11px] text-[#7A7568] mt-0.5">
                    Unit: {p.unit} | Wt: {p.weightKg || 0}kg | CBM: {p.cbm || 0} | Pack: {p.packingSize || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingProd(p)} className="p-1 text-[#7A7568] hover:text-[#C98A3E]"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeProduct(p.id)} className="p-1 text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {editingSup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={card + " p-6 max-w-md w-full space-y-4 shadow-2xl"}>
            <div className="flex justify-between items-center pb-2 border-b border-[#EFEAE0]">
              <h2 className="font-bold text-lg">Edit Supplier Details</h2>
              <button onClick={() => setEditingSup(null)}><X className="w-5 h-5 text-[#7A7568]" /></button>
            </div>
            <Field label="Supplier Name">
              <input className={inputCls} value={editingSup.name} onChange={(e) => setEditingSup({ ...editingSup, name: e.target.value })} />
            </Field>
            <Field label="Country">
              <input className={inputCls} value={editingSup.country} onChange={(e) => setEditingSup({ ...editingSup, country: e.target.value })} />
            </Field>
            <Field label="Contact Information">
              <input className={inputCls} value={editingSup.contact} onChange={(e) => setEditingSup({ ...editingSup, contact: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEditingSup(null)}>Cancel</button>
              <button className={btnPrimary} onClick={saveEditedSupplier}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {editingProd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={card + " p-6 max-w-md w-full space-y-4 shadow-2xl"}>
            <div className="flex justify-between items-center pb-2 border-b border-[#EFEAE0]">
              <h2 className="font-bold text-lg">Edit Master Item</h2>
              <button onClick={() => setEditingProd(null)}><X className="w-5 h-5 text-[#7A7568]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Item Code / SKU">
                <input className={inputCls} value={editingProd.sku} onChange={(e) => setEditingProd({ ...editingProd, sku: e.target.value })} />
              </Field>
              <Field label="Unit">
                <input className={inputCls} value={editingProd.unit} onChange={(e) => setEditingProd({ ...editingProd, unit: e.target.value })} />
              </Field>
            </div>
            <Field label="Item Name">
              <input className={inputCls} value={editingProd.name} onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight (kg)">
                <input className={inputCls} type="number" value={editingProd.weightKg} onChange={(e) => setEditingProd({ ...editingProd, weightKg: e.target.value })} />
              </Field>
              <Field label="CBM">
                <input className={inputCls} type="number" value={editingProd.cbm} onChange={(e) => setEditingProd({ ...editingProd, cbm: e.target.value })} />
              </Field>
            </div>
            <Field label="Packing Configuration">
              <input className={inputCls} value={editingProd.packingSize} onChange={(e) => setEditingProd({ ...editingProd, packingSize: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button className={btnGhost} onClick={() => setEditingProd(null)}>Cancel</button>
              <button className={btnPrimary} onClick={saveEditedProduct}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PIsTab({ data, save, supplierName, productInfo, piStatus }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankPI());
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function blankPI() {
    return { piNumber: "", supplierId: data.suppliers[0]?.id || "", date: todayStr(), docLink: "", notes: "", items: [{ productId: data.products[0]?.id || "", qty: "", unitPrice: "", receivedQty: 0 }] };
  }

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm({ ...form, items });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { productId: data.products[0]?.id || "", qty: "", unitPrice: "", receivedQty: 0 }] });
  const removeItemRow = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const submit = () => {
    if (!form.piNumber.trim() || !form.supplierId) return;
    const items = form.items.filter((i) => i.productId && num(i.qty) > 0).map((i) => ({ ...i, receivedQty: 0 }));
    if (items.length === 0) return;
    save({ ...data, pis: [...data.pis, { id: uid(), ...form, items }] }, "Proforma Invoice signed & logged!");
    setForm(blankPI());
    setShowForm(false);
  };

  const updateReceivedQty = (piId, itemIdx, val) => {
    const nextPis = data.pis.map((p) => {
      if (p.id !== piId) return p;
      const items = [...p.items];
      items[itemIdx] = { ...items[itemIdx], receivedQty: num(val) };
      return { ...p, items };
    });
    save({ ...data, pis: nextPis }, "Received quantity updated!");
  };

  const deletePI = (id) => save({ ...data, pis: data.pis.filter((p) => p.id !== id) }, "Proforma invoice deleted.");

  const filteredPIs = useMemo(() => {
    return [...data.pis]
      .filter((pi) => {
        if (selectedSupplier !== "all" && pi.supplierId !== selectedSupplier) return false;
        const st = piStatus(pi);
        if (statusFilter === "pending" && st.label === "In Stock") return false;
        if (statusFilter === "completed" && st.label !== "In Stock") return false;
        return true;
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [data.pis, selectedSupplier, statusFilter, piStatus]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Proforma Invoices (PI)</h1>
        <button className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "Cancel" : "New Signed PI"}
        </button>
      </div>
      <p className="text-sm text-[#7A7568] mb-6">Signing a PI reserves stock into the pipeline. Enter received quantities as goods arrive at the warehouse.</p>

      <div className="flex items-center gap-3 mb-6 p-3 bg-white border border-[#E4DFD3] rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-bold">Supplier:</span>
          <select className={inputCls + " py-1 text-xs font-medium"} value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
            <option value="all">All Suppliers ({data.suppliers.length})</option>
            {data.suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-[#E4DFD3]" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-bold">Status:</span>
          <select className={inputCls + " py-1 text-xs font-medium"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending / Pipeline</option>
            <option value="completed">Fully Received (In Stock)</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-[#7A7568]">
          Showing <span className="font-bold text-[#1B2430]">{filteredPIs.length}</span> of {data.pis.length} PIs
        </div>
      </div>

      {showForm && (
        <div className={card + " p-5 mb-6 animate-in fade-in slide-in-from-top-2"}>
          {data.suppliers.length === 0 || data.products.length === 0 ? (
            <div className="text-sm text-[#B5453A]">Add at least one supplier and item first (Suppliers &amp; Items tab).</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="PI Number / Ref">
                  <input className={inputCls} placeholder="e.g. PI-2026-001" value={form.piNumber} onChange={(e) => setForm({ ...form, piNumber: e.target.value })} />
                </Field>
                <Field label="Supplier">
                  <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Date Signed">
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </Field>
              </div>

              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-bold">Line Items &amp; Agreed Pricing</span>
                <div className="mt-2 space-y-2">
                  {form.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select className={inputCls + " flex-1"} value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                        {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input className={inputCls + " w-28"} placeholder="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                      <input className={inputCls + " w-32"} placeholder="Unit Cost (AED)" type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                      <button onClick={() => removeItemRow(idx)} className="text-[#B5453A] p-2 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button className={btnGhost + " mt-2"} onClick={addItemRow}><Plus className="w-3.5 h-3.5" />Add Item Line</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Field label="Document Link (Optional)">
                  <input className={inputCls} placeholder="https://drive.google.com/..." value={form.docLink} onChange={(e) => setForm({ ...form, docLink: e.target.value })} />
                </Field>
                <Field label="Notes / Payment Terms">
                  <input className={inputCls} placeholder="e.g. 30% advance paid" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Field>
              </div>

              <button className={btnPrimary} onClick={submit}>Save Proforma Invoice</button>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filteredPIs.length === 0 && <EmptyState text="No Proforma Invoices found matching your filter criteria." />}
        {filteredPIs.map((pi) => {
          const st = piStatus(pi);
          return (
            <div key={pi.id} className={card + " p-5"}>
              <div className="flex items-start justify-between mb-4 pb-2 border-b border-[#EFEAE0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#1B2430]">{pi.piNumber}</span>
                    <Stamp tone={st.tone}>{st.label}</Stamp>
                  </div>
                  <div className="text-xs text-[#7A7568] mt-1">
                    Supplier: <span className="font-semibold text-[#1B2430]">{supplierName(pi.supplierId)}</span> · Signed Date: {pi.date}
                  </div>
                </div>
                <button onClick={() => deletePI(pi.id)} className="text-[#B5453A] hover:opacity-70 text-xs flex items-center gap-1 font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                    <th className="text-left py-1 font-medium">Item Name &amp; Code</th>
                    <th className="text-right py-1 font-medium">Ordered Qty</th>
                    <th className="text-right py-1 font-medium">Agreed Cost</th>
                    <th className="text-right py-1 font-medium">Received at Warehouse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F0E7]">
                  {pi.items.map((it, idx) => {
                    const p = productInfo(it.productId);
                    return (
                      <tr key={idx}>
                        <td className="py-2.5">
                          <span className="font-medium text-[#1B2430]">{p.name}</span>
                          <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>
                        </td>
                        <td className="text-right py-2.5 font-medium">{fmt(it.qty)} {p.unit}</td>
                        <td className="text-right py-2.5 text-[#7A7568]">AED {money(it.unitPrice)}</td>
                        <td className="text-right py-2.5">
                          <input
                            type="number"
                            className={inputCls + " w-28 text-right py-1 px-2 font-bold text-[#2F5A41]"}
                            value={it.receivedQty || 0}
                            onChange={(e) => updateReceivedQty(pi.id, idx, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pi.notes && <div className="text-xs text-[#7A7568] bg-[#FAF8F5] p-2 rounded-lg border border-[#EFEAE0] mt-2">Notes: {pi.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShipmentsTab({ data, save, supplierName, productInfo, closingQtyFor }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPI, setSelectedPI] = useState("");
  const [form, setForm] = useState(blankShipment());

  function blankShipment() {
    return { shipmentNumber: "", supplierId: data.suppliers[0]?.id || "", destinationBranch: "", date: todayStr(), items: [] };
  }

  const handlePISelect = (piId) => {
    setSelectedPI(piId);
    if (!piId) return;
    const pi = data.pis.find((p) => p.id === piId);
    if (pi) {
      setForm({
        ...form,
        supplierId: pi.supplierId,
        items: pi.items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
        })),
      });
    }
  };

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm({ ...form, items });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { productId: data.products[0]?.id || "", qty: "" }] });
  const removeItemRow = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const submit = () => {
    if (!form.shipmentNumber.trim() || !form.supplierId) return;
    const items = form.items.filter((i) => i.productId && num(i.qty) > 0);
    if (items.length === 0) return;
    save({ ...data, shipments: [...data.shipments, { id: uid(), ...form, items }] }, "Shipment logged & stock deducted!");
    setForm(blankShipment());
    setSelectedPI("");
    setShowForm(false);
  };

  const deleteShipment = (id) => save({ ...data, shipments: data.shipments.filter((s) => s.id !== id) }, "Shipment record deleted.");

  const exportExcelPackingList = (sh) => {
    const sup = data.suppliers.find((s) => s.id === sh.supplierId);
    const rows = [
      ["PACKING LIST / SHIPMENT MANIFEST"],
      ["Shipment Ref:", sh.shipmentNumber],
      ["Supplier:", sup?.name || "—"],
      ["Country of Origin:", sup?.country || "—"],
      ["Destination Branch:", sh.destinationBranch || "—"],
      ["Date Shipped:", sh.date],
      [],
      ["Item Code", "Item Name", "Shipped Qty", "Unit", "Packing Config", "Unit Wt (kg)", "Total Wt (kg)", "Unit CBM", "Total CBM"]
    ];

    let totalQty = 0;
    let totalWeight = 0;
    let totalCbm = 0;

    sh.items.forEach((it) => {
      const p = productInfo(it.productId);
      const shippedQty = num(it.qty);
      const lineWt = shippedQty * (p.weightKg || 0);
      const lineCbm = shippedQty * (p.cbm || 0);

      totalQty += shippedQty;
      totalWeight += lineWt;
      totalCbm += lineCbm;

      rows.push([
        p.sku,
        p.name,
        shippedQty,
        p.unit,
        p.packingSize || "—",
        p.weightKg || 0,
        lineWt.toFixed(2),
        p.cbm || 0,
        lineCbm.toFixed(3)
      ]);
    });

    rows.push([]);
    rows.push(["TOTALS", "", totalQty, "", "", "", totalWeight.toFixed(2) + " kg", "", totalCbm.toFixed(3) + " CBM"]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Packing List");
    XLSX.writeFile(wb, `Packing_List_${sh.shipmentNumber}.xlsx`);
  };

  const exportPDFPackingList = (sh) => {
    try {
      const doc = new jsPDF();
      const sup = data.suppliers.find((s) => s.id === sh.supplierId);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("PACKING LIST / SHIPMENT MANIFEST", 14, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Shipment Ref: ${sh.shipmentNumber}`, 14, 28);
      doc.text(`Supplier: ${sup?.name || "—"} (${sup?.country || "N/A"})`, 14, 34);
      doc.text(`Destination: ${sh.destinationBranch || "—"}`, 14, 40);
      doc.text(`Date Shipped: ${sh.date}`, 14, 46);

      const tableRows = [];
      let totalQty = 0;
      let totalWeight = 0;
      let totalCbm = 0;

      sh.items.forEach((it) => {
        const p = productInfo(it.productId);
        const shippedQty = num(it.qty);
        const lineWt = shippedQty * (p.weightKg || 0);
        const lineCbm = shippedQty * (p.cbm || 0);

        totalQty += shippedQty;
        totalWeight += lineWt;
        totalCbm += lineCbm;

        tableRows.push([
          p.sku || "—",
          p.name || "—",
          `${fmt(shippedQty)} ${p.unit}`,
          p.packingSize || "—",
          `${p.weightKg || 0} kg`,
          `${lineWt.toFixed(2)} kg`,
          `${p.cbm || 0}`,
          `${lineCbm.toFixed(3)} m³`
        ]);
      });

      tableRows.push([
        "TOTALS",
        "",
        fmt(totalQty),
        "",
        "",
        `${totalWeight.toFixed(2)} kg`,
        "",
        `${totalCbm.toFixed(3)} m³`
      ]);

      autoTable(doc, {
        startY: 52,
        head: [["Item Code", "Item Name", "Qty", "Packing", "Unit Wt", "Total Wt", "Unit CBM", "Total CBM"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [27, 36, 48] },
        styles: { fontSize: 8 }
      });

      doc.save(`Packing_List_${sh.shipmentNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check browser console for details.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Outbound Shipments &amp; Dispatches</h1>
        <button className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "Cancel" : "New Dispatch"}
        </button>
      </div>
      <p className="text-sm text-[#7A7568] mb-6">Logging an outbound shipment automatically deducts inventory from your sellable closing stock.</p>

      {showForm && (
        <div className={card + " p-5 mb-6 animate-in fade-in slide-in-from-top-2"}>
          <div className="mb-4 p-3 bg-[#FAF8F5] rounded-lg border border-[#E4DFD3]">
            <Field label="Autofill items from signed PI (Optional)">
              <select className={inputCls} value={selectedPI} onChange={(e) => handlePISelect(e.target.value)}>
                <option value="">-- Import line items directly from a PI --</option>
                {data.pis.map((p) => (
                  <option key={p.id} value={p.id}>{p.piNumber} ({supplierName(p.supplierId)})</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <Field label="Shipment / Manifest Ref">
              <input className={inputCls} placeholder="e.g. SH-2026-08" value={form.shipmentNumber} onChange={(e) => setForm({ ...form, shipmentNumber: e.target.value })} />
            </Field>
            <Field label="Supplier">
              <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Destination Branch">
              <input className={inputCls} placeholder="e.g. Dubai Main Showroom" value={form.destinationBranch} onChange={(e) => setForm({ ...form, destinationBranch: e.target.value })} />
            </Field>
          </div>

          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-bold">Dispatched Quantities</span>
            <div className="mt-2 space-y-2">
              {form.items.map((it, idx) => {
                const avail = closingQtyFor(form.supplierId, it.productId);
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <select className={inputCls + " flex-1"} value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                      {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input className={inputCls + " w-28"} placeholder="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                    <span className="text-xs text-[#7A7568] w-32 font-medium">Available: {avail} pcs</span>
                    <button onClick={() => removeItemRow(idx)} className="text-[#B5453A] p-2 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
            <button className={btnGhost + " mt-2"} onClick={addItemRow}><Plus className="w-3.5 h-3.5" />Add Item Line</button>
          </div>

          <button className={btnPrimary} onClick={submit}>Log Shipment Out</button>
        </div>
      )}

      <div className="space-y-4">
        {data.shipments.length === 0 && <EmptyState text="No outbound shipments logged yet." />}
        {data.shipments.map((sh) => (
          <div key={sh.id} className={card + " p-5"}>
            <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#EFEAE0]">
              <div>
                <div className="font-bold text-base text-[#1B2430]">{sh.shipmentNumber}</div>
                <div className="text-xs text-[#7A7568] mt-0.5">
                  Supplier: <span className="font-semibold text-[#1B2430]">{supplierName(sh.supplierId)}</span> → Branch: <span className="font-semibold text-[#1B2430]">{sh.destinationBranch || "—"}</span> · Date: {sh.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportPDFPackingList(sh)} className={btnGhost + " py-1 px-2.5 text-xs font-medium"}>
                  <FileCode className="w-3.5 h-3.5 text-rose-700" /> PDF Packing List
                </button>
                <button onClick={() => exportExcelPackingList(sh)} className={btnGhost + " py-1 px-2.5 text-xs font-medium"}>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Excel Packing List
                </button>
                <button onClick={() => deleteShipment(sh.id)} className="text-[#B5453A] hover:opacity-70 text-xs flex items-center p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
                  <th className="text-left py-1 font-medium">Item Details</th>
                  <th className="text-right py-1 font-medium">Qty Shipped</th>
                  <th className="text-right py-1 font-medium">Est. Total Wt</th>
                  <th className="text-right py-1 font-medium">Est. Total Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0E7]">
                {sh.items.map((it, idx) => {
                  const p = productInfo(it.productId);
                  const shippedQty = num(it.qty);
                  return (
                    <tr key={idx}>
                      <td className="py-2">
                        <span className="font-medium text-[#1B2430]">{p.name}</span>
                        <span className="ml-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.sku}</span>
                      </td>
                      <td className="text-right py-2 font-bold text-[#1B2430]">{fmt(shippedQty)} {p.unit}</td>
                      <td className="text-right py-2 text-[#7A7568]">{(shippedQty * (p.weightKg || 0)).toFixed(2)} kg</td>
                      <td className="text-right py-2 text-[#7A7568]">{(shippedQty * (p.cbm || 0)).toFixed(3)} m³</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
