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
import './modal-overrides.css';

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
const btnGhost = "inline-flex items-center gap-1.5 border border-[#DDD7C7] bg-white text-[#1B2430] px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[#F6F3EC] active:scale-[0.99] transition-all curs[...]";
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
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setData({ ...emptyData, ...JSON.parse(saved) });
    } catch (e) {
      /* first run */
    } finally {
      setLoading(false);
    }
  }, []);

  const save = (next, msg) => {
    setData(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      if (msg) showToast(msg, "success");
    } catch (e) {
      showToast("Could not save — check browser storage limits.", "error");
    }
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

/* NOTE: rest of file is unchanged; we only added import for modal-overrides above. */
