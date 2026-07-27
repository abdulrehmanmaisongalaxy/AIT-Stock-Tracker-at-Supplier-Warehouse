import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Trash2, Package, FileText, Ship, LayoutGrid, X, 
  AlertCircle, Loader2, CheckCircle2, Boxes, BookOpen, 
  Upload, Download, FileSpreadsheet, Edit3, FileCode
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const num = (n) => Number(n) || 0;
const fmt = (n) => num(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
const money = (n) => num(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STORE_KEY = "trading-ledger-v2";
const emptyData = { suppliers: [], products: [], pis: [], shipments: [] };

function Stamp({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[#EFEAE0] text-[#7A7568]",
    pipeline: "bg-[#F4E4C8] text-[#8A6420]",
    partial: "bg-[#F4E4C8] text-[#8A6420]",
    stock: "bg-[#E1EAE3] text-[#2F5A41]",
    low: "bg-[#F3DEDA] text-[#A13B2F]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-[0.08em] uppercase font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-medium">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-[#9C9788]">{hint}</span>}
    </label>
  );
}

const inputCls = "border border-[#DDD7C7] bg-white rounded-lg px-3 py-2 text-sm text-[#1B2430] focus:outline-none focus:ring-2 focus:ring-[#C98A3E]/30 focus:border-[#C98A3E] transition-shadow";
const btnPrimary = "inline-flex items-center gap-1.5 bg-[#1B2430] text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3A48] transition-colors shadow-sm";
const btnGhost = "inline-flex items-center gap-1.5 border border-[#DDD7C7] bg-white text-[#1B2430] px-3.5 py-2 rounded-lg text-sm hover:bg-[#F6F3EC] transition-colors";
const card = "bg-white border border-[#E4DFD3] rounded-xl shadow-[0_1px_2px_rgba(27,36,48,0.04)]";
const sectionLabel = "text-[12px] uppercase tracking-[0.1em] text-[#7A7568] font-semibold mb-3";

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

  const save = (next) => {
    setData(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch (e) {
      setToast("Could not save — check your storage.");
      setTimeout(() => setToast(null), 3000);
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
    const closingValue = ledger.reduce((s, r) => s + r.closingQty * r.avgCost, 0);
    const pipelineQty = ledger.reduce((s, r) => s + r.pipeline, 0);
    const closingQty = ledger.reduce((s, r) => s + Math.max(0, r.closingQty), 0);
    return { closingValue, pipelineQty, closingQty };
  }, [ledger]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#F6F3EC] text-[#7A7568]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading ledger…
      </div>
    );
  }

  return (
    <div className="w-full min-h-[640px] bg-[#F6F3EC] text-[#1B2430]" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <div className="flex max-w-[1200px] mx-auto">
        <aside className="w-[210px] shrink-0 border-r border-[#E4DFD3] min-h-[640px] px-4 py-6">
          <div className="mb-8 px-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#C98A3E] font-bold mb-0.5">Manifest &amp; Ledger</div>
            <div className="text-[15px] font-bold leading-tight">Stock Tracker</div>
          </div>
          <nav className="space-y-1">
            {NAV.map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] text-left transition-colors ${
                  tab === key ? "bg-[#1B2430] text-white font-medium" : "text-[#4A4638] hover:bg-[#EFEAE0]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 px-1 space-y-2 text-[11px] text-[#9C9788]">
            <div>{data.suppliers.length} suppliers</div>
            <div>{data.pis.length} PIs signed</div>
            <div>{data.shipments.length} shipments</div>
          </div>
        </aside>

        <main className="flex-1 px-8 py-6 min-w-0">
          {tab === "dashboard" && <Dashboard data={data} ledger={ledger} totals={totals} supplierName={supplierName} productInfo={productInfo} piStatus={piStatus} />}
          {tab === "ledger" && <LedgerTab data={data} ledger={ledger} supplierName={supplierName} productInfo={productInfo} />}
          {tab === "pis" && <PIsTab data={data} save={save} supplierName={supplierName} productInfo={productInfo} piStatus={piStatus} />}
          {tab === "shipments" && <ShipmentsTab data={data} save={save} supplierName={supplierName} productInfo={productInfo} closingQtyFor={closingQtyFor} />}
          {tab === "setup" && <SetupTab data={data} save={save} />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#B5453A] text-white px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, ledger, totals, supplierName, productInfo, piStatus }) {
  const bySupplier = useMemo(() => {
    const m = {};
    for (const r of ledger) {
      if (r.pipeline <= 0 && r.closingQty <= 0) continue;
      m[r.supplierId] = m[r.supplierId] || [];
      m[r.supplierId].push(r);
    }
    return m;
  }, [ledger]);

  const openPIs = data.pis.filter((p) => piStatus(p).label !== "In Stock");
  const recentShipments = [...data.shipments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-[#7A7568] mb-6">Live view of what's ordered, what's ready to sell, and what's already shipped.</p>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Closing stock value" value={"AED " + money(totals.closingValue)} icon={Boxes} tone="stock" />
        <StatCard label="Closing stock qty (sellable now)" value={fmt(totals.closingQty)} icon={CheckCircle2} tone="stock" />
        <StatCard label="In pipeline (ordered, not received)" value={fmt(totals.pipelineQty)} icon={FileText} tone="pipeline" />
      </div>

      <div className={card + " p-5 mb-6"}>
        <div className={sectionLabel}>Closing stock by supplier — sellable inventory, right now</div>
        {Object.keys(bySupplier).length === 0 ? (
          <EmptyState text="No stock yet. Sign a PI, then mark it received once goods are ready at the warehouse." />
        ) : (
          Object.entries(bySupplier).map(([supplierId, rows]) => {
            const supplierClosingValue = rows.reduce((s, r) => s + Math.max(0, r.closingQty) * r.avgCost, 0);
            return (
              <div key={supplierId} className="mb-5 last:mb-0">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-semibold text-[14px]">{supplierName(supplierId)}</div>
                  <div className="text-[12px] text-[#7A7568]">
                    Closing value: <span className="font-semibold text-[#1B2430]">AED {money(supplierClosingValue)}</span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                      <th className="text-left py-1.5 font-medium">Item</th>
                      <th className="text-right py-1.5 font-medium">Pipeline</th>
                      <th className="text-right py-1.5 font-medium">Closing qty</th>
                      <th className="text-right py-1.5 font-medium">Avg cost</th>
                      <th className="text-right py-1.5 font-medium">Closing value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const p = productInfo(r.productId);
                      return (
                        <tr key={i} className="border-b border-[#F3F0E7] last:border-0">
                          <td className="py-1.5">{p.name} <span className="text-[#9C9788]">({p.sku})</span></td>
                          <td className="text-right py-1.5 text-[#8A6420]">{r.pipeline > 0 ? fmt(r.pipeline) + " " + p.unit : "—"}</td>
                          <td className={`text-right py-1.5 font-semibold ${r.closingQty <= 0 ? "text-[#A13B2F]" : "text-[#2F5A41]"}`}>
                            {fmt(r.closingQty)} {p.unit}
                          </td>
                          <td className="text-right py-1.5 text-[#7A7568]">{r.avgCost > 0 ? money(r.avgCost) : "—"}</td>
                          <td className="text-right py-1.5 font-medium">{r.avgCost > 0 ? money(Math.max(0, r.closingQty) * r.avgCost) : "—"}</td>
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
          <div className={sectionLabel}>PIs awaiting receipt at warehouse</div>
          {openPIs.length === 0 ? (
            <EmptyState text="Nothing pending — all signed PIs are fully received." />
          ) : (
            <ul className="divide-y divide-[#F3F0E7]">
              {openPIs.map((pi) => {
                const st = piStatus(pi);
                return (
                  <li key={pi.id} className="py-2 flex items-center justify-between text-sm">
                    <span><span className="font-semibold">{pi.piNumber}</span> — {supplierName(pi.supplierId)}</span>
                    <Stamp tone={st.tone}>{st.label}</Stamp>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={card + " p-5"}>
          <div className={sectionLabel}>Recent shipments</div>
          {recentShipments.length === 0 ? (
            <EmptyState text="No shipments logged yet." />
          ) : (
            <ul className="divide-y divide-[#F3F0E7]">
              {recentShipments.map((sh) => (
                <li key={sh.id} className="py-2 flex items-center justify-between text-sm">
                  <span><span className="font-semibold">{sh.shipmentNumber}</span> — {supplierName(sh.supplierId)} → {sh.destinationBranch || "—"}</span>
                  <span className="text-[#9C9788] text-xs">{sh.date}</span>
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
  const [selectedSupplier, setSelectedSupplier] = useState(data.suppliers[0]?.id || "");

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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold">Stock Ledger</h1>
          <p className="text-sm text-[#7A7568]">Detailed balance and transaction logs per supplier.</p>
        </div>
        <div>
          <select className={inputCls + " font-medium"} value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
            {data.suppliers.length === 0 && <option value="">No suppliers available</option>}
            {data.suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.country || "General"})</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSupplier ? (
        <EmptyState text="Please add and select a supplier to view their stock ledger." />
      ) : (
        <>
          <div className={card + " p-5 mb-6"}>
            <div className={sectionLabel}>Current Stock Balance — {supplierName(selectedSupplier)}</div>
            {filteredLedger.length === 0 ? (
              <EmptyState text="No items recorded for this supplier yet." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                    <th className="text-left py-2 font-medium">Item Code &amp; Name</th>
                    <th className="text-right py-2 font-medium">Total Ordered</th>
                    <th className="text-right py-2 font-medium">Total Received</th>
                    <th className="text-right py-2 font-medium">Total Shipped</th>
                    <th className="text-right py-2 font-medium">Pipeline Qty</th>
                    <th className="text-right py-2 font-medium">Closing Sellable Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((r, i) => {
                    const p = productInfo(r.productId);
                    return (
                      <tr key={i} className="border-b border-[#F3F0E7] last:border-0">
                        <td className="py-2.5 font-medium">{p.name} <span className="text-[#9C9788] font-normal">({p.sku})</span></td>
                        <td className="text-right py-2.5">{fmt(r.ordered)} {p.unit}</td>
                        <td className="text-right py-2.5">{fmt(r.received)} {p.unit}</td>
                        <td className="text-right py-2.5 text-[#B5453A]">{fmt(r.shipped)} {p.unit}</td>
                        <td className="text-right py-2.5 text-[#8A6420]">{fmt(r.pipeline)} {p.unit}</td>
                        <td className={`text-right py-2.5 font-bold ${r.closingQty <= 0 ? "text-[#A13B2F]" : "text-[#2F5A41]"}`}>
                          {fmt(r.closingQty)} {p.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className={card + " p-5"}>
            <div className={sectionLabel}>Transaction &amp; Movement Log</div>
            {supplierMovements.length === 0 ? (
              <EmptyState text="No transaction logs recorded for this supplier." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Reference</th>
                    <th className="text-left py-2 font-medium">Item</th>
                    <th className="text-right py-2 font-medium">Ordered</th>
                    <th className="text-right py-2 font-medium">Received</th>
                    <th className="text-right py-2 font-medium">Shipped Out</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierMovements.map((m, i) => {
                    const p = productInfo(m.productId);
                    return (
                      <tr key={i} className="border-b border-[#F3F0E7] last:border-0">
                        <td className="py-2 text-[#7A7568]">{m.date}</td>
                        <td className="py-2 font-medium">
                          <Stamp tone={m.type.includes("PI") ? "pipeline" : "stock"}>{m.type}</Stamp>
                        </td>
                        <td className="py-2">{m.ref}</td>
                        <td className="py-2">{p.name}</td>
                        <td className="text-right py-2">{m.ordered > 0 ? fmt(m.ordered) : "—"}</td>
                        <td className="text-right py-2 text-[#2F5A41]">{m.received > 0 ? fmt(m.received) : "—"}</td>
                        <td className="text-right py-2 text-[#B5453A]">{m.shipped > 0 ? fmt(m.shipped) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const toneBg = tone === "stock" ? "bg-[#E1EAE3] text-[#2F5A41]" : "bg-[#F4E4C8] text-[#8A6420]";
  return (
    <div className={card + " p-4 flex items-center gap-3"}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-[#7A7568] leading-tight">{label}</div>
        <div className="text-[17px] font-bold leading-tight truncate">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="border border-dashed border-[#DDD7C7] rounded-lg px-4 py-6 text-center text-sm text-[#9C9788]">{text}</div>;
}

function SetupTab({ data, save }) {
  const [supForm, setSupForm] = useState({ name: "", country: "", contact: "" });
  const [prodForm, setProdForm] = useState({ sku: "", name: "", unit: "pcs", weightKg: "", cbm: "", packingSize: "" });

  const [editingSup, setEditingSup] = useState(null);
  const [editingProd, setEditingProd] = useState(null);

  const addSupplier = () => {
    if (!supForm.name.trim()) return;
    save({ ...data, suppliers: [...data.suppliers, { id: uid(), ...supForm }] });
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
    });
    setProdForm({ sku: "", name: "", unit: "pcs", weightKg: "", cbm: "", packingSize: "" });
  };

  const saveEditedSupplier = () => {
    if (!editingSup.name.trim()) return;
    const updated = data.suppliers.map((s) => (s.id === editingSup.id ? editingSup : s));
    save({ ...data, suppliers: updated });
    setEditingSup(null);
  };

  const saveEditedProduct = () => {
    if (!editingProd.name.trim()) return;
    const updated = data.products.map((p) =>
      p.id === editingProd.id
        ? { ...editingProd, weightKg: num(editingProd.weightKg), cbm: num(editingProd.cbm) }
        : p
    );
    save({ ...data, products: updated });
    setEditingProd(null);
  };

  const removeSupplier = (id) => save({ ...data, suppliers: data.suppliers.filter((s) => s.id !== id) });
  const removeProduct = (id) => save({ ...data, products: data.products.filter((p) => p.id !== id) });

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

        save({ ...data, suppliers: newSuppliers, products: newProducts });
        alert("Excel data imported successfully!");
      } catch (err) {
        alert("Error parsing Excel file. Please use the downloaded template format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">Suppliers &amp; Items</h1>
          <p className="text-sm text-[#7A7568]">Set up master suppliers and items, edit existing ones, or bulk import via Excel.</p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={downloadTemplate}>
            <Download className="w-4 h-4" /> Download Template
          </button>
          <label className={btnPrimary + " cursor-pointer"}>
            <Upload className="w-4 h-4" /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={card + " p-5"}>
          <div className={sectionLabel}>Suppliers</div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <input className={inputCls + " flex-1 min-w-[110px]"} placeholder="Name" value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} />
            <input className={inputCls + " w-24"} placeholder="Country" value={supForm.country} onChange={(e) => setSupForm({ ...supForm, country: e.target.value })} />
            <input className={inputCls + " w-28"} placeholder="Contact" value={supForm.contact} onChange={(e) => setSupForm({ ...supForm, contact: e.target.value })} />
            <button className={btnPrimary} onClick={addSupplier}><Plus className="w-4 h-4" />Add</button>
          </div>
          <ul className="divide-y divide-[#F3F0E7]">
            {data.suppliers.length === 0 && <li className="py-3 text-sm text-[#9C9788]">No suppliers yet.</li>}
            {data.suppliers.map((s) => (
              <li key={s.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{s.name} {s.country && <span className="text-[#9C9788] font-normal">({s.country})</span>}</div>
                  {s.contact && <div className="text-xs text-[#7A7568]">{s.contact}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingSup(s)} className="text-[#4A4638] hover:text-[#C98A3E]"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeSupplier(s.id)} className="text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={card + " p-5"}>
          <div className={sectionLabel}>Items (Master Catalog)</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input className={inputCls} placeholder="Item Code" value={prodForm.sku} onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })} />
            <input className={inputCls + " col-span-2"} placeholder="Item Name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} />
            <input className={inputCls} placeholder="pcs" value={prodForm.unit} onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })} />
            <input className={inputCls} placeholder="Weight (kg)" type="number" value={prodForm.weightKg} onChange={(e) => setProdForm({ ...prodForm, weightKg: e.target.value })} />
            <input className={inputCls} placeholder="CBM" type="number" value={prodForm.cbm} onChange={(e) => setProdForm({ ...prodForm, cbm: e.target.value })} />
            <input className={inputCls + " col-span-2"} placeholder="Packing size (e.g. 12 pcs/ctn)" value={prodForm.packingSize} onChange={(e) => setProdForm({ ...prodForm, packingSize: e.target.value })} />
            <button className={btnPrimary + " h-[38px] justify-center"} onClick={addProduct}><Plus className="w-4 h-4" />Add Item</button>
          </div>
          <ul className="divide-y divide-[#F3F0E7]">
            {data.products.length === 0 && <li className="py-3 text-sm text-[#9C9788]">No items yet.</li>}
            {data.products.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{p.name} <span className="text-[#9C9788] font-normal">({p.sku})</span></div>
                  <div className="text-[11px] text-[#7A7568]">
                    Unit: {p.unit} | Wt: {p.weightKg || 0}kg | CBM: {p.cbm || 0} | Packing: {p.packingSize || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingProd(p)} className="text-[#4A4638] hover:text-[#C98A3E]"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeProduct(p.id)} className="text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {editingSup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className={card + " p-6 max-w-md w-full space-y-4 shadow-xl"}>
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Edit Supplier</h2>
              <button onClick={() => setEditingSup(null)}><X className="w-5 h-5 text-[#7A7568]" /></button>
            </div>
            <Field label="Supplier Name">
              <input className={inputCls} value={editingSup.name} onChange={(e) => setEditingSup({ ...editingSup, name: e.target.value })} />
            </Field>
            <Field label="Country">
              <input className={inputCls} value={editingSup.country} onChange={(e) => setEditingSup({ ...editingSup, country: e.target.value })} />
            </Field>
            <Field label="Contact Details">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className={card + " p-6 max-w-md w-full space-y-4 shadow-xl"}>
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Edit Item</h2>
              <button onClick={() => setEditingProd(null)}><X className="w-5 h-5 text-[#7A7568]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Item Code">
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
            <Field label="Packing Size / Configuration">
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
    save({ ...data, pis: [...data.pis, { id: uid(), ...form, items }] });
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
    save({ ...data, pis: nextPis });
  };

  const deletePI = (id) => save({ ...data, pis: data.pis.filter((p) => p.id !== id) });

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
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Proforma Invoices</h1>
        <button className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "Cancel" : "New PI"}
        </button>
      </div>
      <p className="text-sm text-[#7A7568] mb-5">Signing a PI puts stock into the pipeline. Mark received below when goods hit warehouse.</p>

      <div className="flex items-center gap-3 mb-5 p-3 bg-white border border-[#E4DFD3] rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-semibold">Filter Supplier:</span>
          <select className={inputCls + " py-1 text-xs font-medium"} value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
            <option value="all">All Suppliers ({data.suppliers.length})</option>
            {data.suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-[#E4DFD3] mx-1" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-semibold">Status:</span>
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
        <div className={card + " p-5 mb-6"}>
          {data.suppliers.length === 0 || data.products.length === 0 ? (
            <div className="text-sm text-[#B5453A]">Add at least one supplier and item first (Suppliers &amp; Items tab).</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="PI Number">
                  <input className={inputCls} value={form.piNumber} onChange={(e) => setForm({ ...form, piNumber: e.target.value })} />
                </Field>
                <Field label="Supplier">
                  <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Date signed">
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </Field>
              </div>

              <div className="mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-medium">Line items</span>
                <div className="mt-1.5 space-y-2">
                  {form.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select className={inputCls + " flex-1"} value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                        {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input className={inputCls + " w-24"} placeholder="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                      <input className={inputCls + " w-28"} placeholder="Unit cost" type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                      <button onClick={() => removeItemRow(idx)} className="text-[#B5453A]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button className={btnGhost + " mt-2"} onClick={addItemRow}><Plus className="w-3.5 h-3.5" />Add line</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Field label="Document link (Drive/Dropbox)">
                  <input className={inputCls} placeholder="https://…" value={form.docLink} onChange={(e) => setForm({ ...form, docLink: e.target.value })} />
                </Field>
                <Field label="Notes">
                  <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Field>
              </div>

              <button className={btnPrimary} onClick={submit}>Save Proforma Invoice</button>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filteredPIs.length === 0 && <EmptyState text="No Proforma Invoices matching your filters." />}
        {filteredPIs.map((pi) => {
          const st = piStatus(pi);
          return (
            <div key={pi.id} className={card + " p-5"}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{pi.piNumber}</span>
                    <Stamp tone={st.tone}>{st.label}</Stamp>
                  </div>
                  <div className="text-xs text-[#7A7568] mt-0.5">
                    Supplier: <span className="font-medium text-[#1B2430]">{supplierName(pi.supplierId)}</span> · Signed: {pi.date}
                  </div>
                </div>
                <button onClick={() => deletePI(pi.id)} className="text-[#B5453A] hover:opacity-70 text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                    <th className="text-left py-1 font-medium">Item</th>
                    <th className="text-right py-1 font-medium">Ordered</th>
                    <th className="text-right py-1 font-medium">Unit cost</th>
                    <th className="text-right py-1 font-medium">Received Qty at Warehouse</th>
                  </tr>
                </thead>
                <tbody>
                  {pi.items.map((it, idx) => {
                    const p = productInfo(it.productId);
                    return (
                      <tr key={idx} className="border-b border-[#F3F0E7] last:border-0">
                        <td className="py-2">{p.name} <span className="text-[#9C9788]">({p.sku})</span></td>
                        <td className="text-right py-2">{fmt(it.qty)} {p.unit}</td>
                        <td className="text-right py-2">{money(it.unitPrice)}</td>
                        <td className="text-right py-2">
                          <input
                            type="number"
                            className={inputCls + " w-24 text-right py-1 px-2"}
                            value={it.receivedQty || 0}
                            onChange={(e) => updateReceivedQty(pi.id, idx, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pi.notes && <div className="text-xs text-[#7A7568]">Note: {pi.notes}</div>}
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
    save({ ...data, shipments: [...data.shipments, { id: uid(), ...form, items }] });
    setForm(blankShipment());
    setSelectedPI("");
    setShowForm(false);
  };

  const deleteShipment = (id) => save({ ...data, shipments: data.shipments.filter((s) => s.id !== id) });

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
        p.sku,
        p.name,
        `${fmt(shippedQty)} ${p.unit}`,
        p.packingSize || "—",
        `${p.weightKg || 0} kg`,
        `${lineWt.toFixed(2)} kg`,
        `${p.cbm || 0}`,
        `${lineCbm.toFixed(3)} m³`
      ]);
    });

    tableRows.push([
      { content: "TOTALS", colSpan: 2, styles: { fontStyle: "bold" } },
      { content: fmt(totalQty), styles: { fontStyle: "bold" } },
      "",
      "",
      { content: `${totalWeight.toFixed(2)} kg`, styles: { fontStyle: "bold" } },
      "",
      { content: `${totalCbm.toFixed(3)} m³`, styles: { fontStyle: "bold" } }
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
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Shipments Out</h1>
        <button className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "Cancel" : "New Shipment"}
        </button>
      </div>
      <p className="text-sm text-[#7A7568] mb-6">Dispatching stock deducts from your closing sellable inventory.</p>

      {showForm && (
        <div className={card + " p-5 mb-6"}>
          <div className="mb-4 p-3 bg-[#F6F3EC] rounded-lg border border-[#E4DFD3]">
            <Field label="Autofill lines from PI (Optional)">
              <select className={inputCls} value={selectedPI} onChange={(e) => handlePISelect(e.target.value)}>
                <option value="">-- Select a PI to auto-import line items --</option>
                {data.pis.map((p) => (
                  <option key={p.id} value={p.id}>{p.piNumber} ({supplierName(p.supplierId)})</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <Field label="Shipment / Reference #">
              <input className={inputCls} value={form.shipmentNumber} onChange={(e) => setForm({ ...form, shipmentNumber: e.target.value })} />
            </Field>
            <Field label="Supplier">
              <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Destination Branch">
              <input className={inputCls} placeholder="e.g. Dubai Main" value={form.destinationBranch} onChange={(e) => setForm({ ...form, destinationBranch: e.target.value })} />
            </Field>
          </div>

          <div className="mb-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-medium">Items Shipped</span>
            <div className="mt-1.5 space-y-2">
              {form.items.map((it, idx) => {
                const avail = closingQtyFor(form.supplierId, it.productId);
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <select className={inputCls + " flex-1"} value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                      {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input className={inputCls + " w-28"} placeholder="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                    <span className="text-xs text-[#7A7568] w-28">Available: {avail}</span>
                    <button onClick={() => removeItemRow(idx)} className="text-[#B5453A]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
            <button className={btnGhost + " mt-2"} onClick={addItemRow}><Plus className="w-3.5 h-3.5" />Add line</button>
          </div>

          <button className={btnPrimary} onClick={submit}>Log Shipment</button>
        </div>
      )}

      <div className="space-y-4">
        {data.shipments.length === 0 && <EmptyState text="No shipments recorded yet." />}
        {data.shipments.map((sh) => (
          <div key={sh.id} className={card + " p-5"}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-base">{sh.shipmentNumber}</div>
                <div className="text-xs text-[#7A7568] mt-0.5">
                  Supplier: {supplierName(sh.supplierId)} → Branch: <span className="font-medium text-[#1B2430]">{sh.destinationBranch || "—"}</span> · Date: {sh.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportPDFPackingList(sh)} className={btnGhost + " py-1 px-2.5 text-xs"}>
                  <FileCode className="w-3.5 h-3.5 text-[#B5453A]" /> PDF Packing List
                </button>
                <button onClick={() => exportExcelPackingList(sh)} className={btnGhost + " py-1 px-2.5 text-xs"}>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2F5A41]" /> Excel Packing List
                </button>
                <button onClick={() => deleteShipment(sh.id)} className="text-[#B5453A] hover:opacity-70 text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                  <th className="text-left py-1 font-medium">Item</th>
                  <th className="text-right py-1 font-medium">Qty Shipped</th>
                  <th className="text-right py-1 font-medium">Est. Total Wt</th>
                  <th className="text-right py-1 font-medium">Est. Total CBM</th>
                </tr>
              </thead>
              <tbody>
                {sh.items.map((it, idx) => {
                  const p = productInfo(it.productId);
                  const shippedQty = num(it.qty);
                  return (
                    <tr key={idx} className="border-b border-[#F3F0E7] last:border-0">
                      <td className="py-2">{p.name} <span className="text-[#9C9788]">({p.sku})</span></td>
                      <td className="text-right py-2 font-medium">{fmt(shippedQty)} {p.unit}</td>
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
