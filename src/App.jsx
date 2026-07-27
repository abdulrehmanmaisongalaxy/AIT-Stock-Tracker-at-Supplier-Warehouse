import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Package, FileText, Ship, LayoutGrid, X, Link as LinkIcon, AlertCircle, Loader2, CheckCircle2, Boxes, BookOpen } from "lucide-react";

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
  ["setup", "Suppliers & Products", Package],
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
  const productInfo = (id) => data.products.find((p) => p.id === id) || { name: "—", sku: "", unit: "" };
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
                      <th className="text-left py-1.5 font-medium">Product</th>
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

    // Add PIs
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

    // Add Shipments
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
              <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSupplier ? (
        <EmptyState text="Please add and select a supplier to view their stock ledger." />
      ) : (
        <>
          {/* Summary Stock Balance Table */}
          <div className={card + " p-5 mb-6"}>
            <div className={sectionLabel}>Current Stock Balance — {supplierName(selectedSupplier)}</div>
            {filteredLedger.length === 0 ? (
              <EmptyState text="No products recorded for this supplier yet." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                    <th className="text-left py-2 font-medium">Product SKU & Name</th>
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

          {/* Movement Logs */}
          <div className={card + " p-5"}>
            <div className={sectionLabel}>Transaction & Movement Log</div>
            {supplierMovements.length === 0 ? (
              <EmptyState text="No transaction logs recorded for this supplier." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788] border-b border-[#EFEAE0]">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Reference</th>
                    <th className="text-left py-2 font-medium">Product</th>
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
  const [prodForm, setProdForm] = useState({ sku: "", name: "", unit: "pcs" });

  const addSupplier = () => {
    if (!supForm.name.trim()) return;
    save({ ...data, suppliers: [...data.suppliers, { id: uid(), ...supForm }] });
    setSupForm({ name: "", country: "", contact: "" });
  };

  const addProduct = () => {
    if (!prodForm.name.trim()) return;
    save({ ...data, products: [...data.products, { id: uid(), ...prodForm, unit: prodForm.unit.trim() || "pcs" }] });
    setProdForm({ sku: "", name: "", unit: "pcs" });
  };

  const removeSupplier = (id) => save({ ...data, suppliers: data.suppliers.filter((s) => s.id !== id) });
  const removeProduct = (id) => save({ ...data, products: data.products.filter((p) => p.id !== id) });

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Suppliers &amp; Products</h1>
      <p className="text-sm text-[#7A7568] mb-6">Set these up once. Add a supplier called "Dubai Local" if you want to track locally-bought stock the same way.</p>
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
              <li key={s.id} className="py-2 flex items-center justify-between text-sm">
                <span>{s.name} <span className="text-[#9C9788]">— {s.country}</span></span>
                <button onClick={() => removeSupplier(s.id)} className="text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>

        <div className={card + " p-5"}>
          <div className={sectionLabel}>Products</div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <input className={inputCls + " w-20"} placeholder="SKU" value={prodForm.sku} onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })} />
            <input className={inputCls + " flex-1 min-w-[110px]"} placeholder="Product name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} />
            <input className={inputCls + " w-24"} placeholder="Unit e.g. pcs, ctn" value={prodForm.unit} onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })} />
            <button className={btnPrimary} onClick={addProduct}><Plus className="w-4 h-4" />Add</button>
          </div>
          <ul className="divide-y divide-[#F3F0E7]">
            {data.products.length === 0 && <li className="py-3 text-sm text-[#9C9788]">No products yet.</li>}
            {data.products.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                <span>{p.name} <span className="text-[#9C9788]">({p.sku}) — unit: {p.unit}</span></span>
                <button onClick={() => removeProduct(p.id)} className="text-[#B5453A] hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
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

  // Filtered PIs based on selected dropdowns
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
      <p className="text-sm text-[#7A7568] mb-5">Signing a PI puts stock into the pipeline. It only becomes sellable Closing Stock once you mark it received below.</p>

      {/* Filter Bar */}
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
            <div className="text-sm text-[#B5453A]">Add at least one supplier and product first (Suppliers &amp; Products tab).</div>
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
              <button className={btnPrimary} onClick={submit}>Save PI</button>
            </>
          )}
        </div>
      )}

      {filteredPIs.length === 0 ? (
        <EmptyState text="No Proforma Invoices match the selected filters." />
      ) : (
        <div className="space-y-3">
          {filteredPIs.map((pi) => (
            <PICard key={pi.id} pi={pi} data={data} save={save} supplierName={supplierName} productInfo={productInfo} piStatus={piStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function PICard({ pi, data, save, supplierName, productInfo, piStatus }) {
  const [draft, setDraft] = useState(pi.items.map((i) => i.receivedQty || 0));
  const st = piStatus(pi);
  const dirty = draft.some((v, i) => num(v) !== num(pi.items[i].receivedQty));
  const total = pi.items.reduce((s, i) => s + num(i.qty) * num(i.unitPrice), 0);

  const saveReceipt = () => {
    const items = pi.items.map((it, i) => ({ ...it, receivedQty: Math.min(Math.max(0, num(draft[i])), num(it.qty)) }));
    save({ ...data, pis: data.pis.map((p) => (p.id === pi.id ? { ...p, items } : p)) });
  };

  return (
    <div className={card + " p-4"}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm">
          <span className="font-bold">{pi.piNumber}</span> · {supplierName(pi.supplierId)} · <span className="text-[#9C9788]">{pi.date}</span>
        </div>
        <div className="flex items-center gap-2">
          {pi.docLink && <a href={pi.docLink} target="_blank" rel="noreferrer" className="text-[#7A7568] hover:text-[#C98A3E]"><LinkIcon className="w-3.5 h-3.5" /></a>}
          <Stamp tone={st.tone}>{st.label}</Stamp>
        </div>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-[0.06em] text-[#9C9788]">
            <th className="text-left pb-1 font-medium">Product</th>
            <th className="text-right pb-1 font-medium">Ordered</th>
            <th className="text-right pb-1 font-medium">Unit cost</th>
            <th className="text-right pb-1 font-medium w-32">Received qty</th>
          </tr>
        </thead>
        <tbody>
          {pi.items.map((it, i) => {
            const p = productInfo(it.productId);
            return (
              <tr key={i} className="border-t border-[#F3F0E7]">
                <td className="py-1.5">{p.name} <span className="text-[#9C9788]">({p.sku})</span></td>
                <td className="text-right py-1.5">{fmt(it.qty)} {p.unit}</td>
                <td className="text-right py-1.5 text-[#7A7568]">{money(it.unitPrice)}</td>
                <td className="text-right py-1.5">
                  <input
                    type="number"
                    className={inputCls + " w-24 text-right py-1"}
                    value={draft[i]}
                    max={num(it.qty)}
                    min={0}
                    onChange={(e) => {
                      const next = [...draft];
                      next[i] = e.target.value;
                      setDraft(next);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-[#9C9788]">{total > 0 && <>PI value: {money(total)}</>} {pi.notes && <span className="ml-2">· {pi.notes}</span>}</div>
        {dirty && (
          <button className={btnPrimary + " !py-1.5 !px-[#3] text-xs"} onClick={saveReceipt}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm received qty
          </button>
        )}
      </div>
    </div>
  );
}

function ShipmentsTab({ data, save, supplierName, productInfo, closingQtyFor }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankShipment());

  function blankShipment() {
    return {
      shipmentNumber: "",
      supplierId: data.suppliers[0]?.id || "",
      date: todayStr(),
      destinationBranch: "",
      docLink: "",
      piRefs: [],
      items: [{ productId: data.products[0]?.id || "", qty: "" }],
    };
  }

  const supplierPIs = data.pis.filter((p) => p.supplierId === form.supplierId);

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm({ ...form, items });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { productId: data.products[0]?.id || "", qty: "" }] });
  const removeItemRow = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const togglePI = (id) => setForm({ ...form, piRefs: form.piRefs.includes(id) ? form.piRefs.filter((x) => x !== id) : [...form.piRefs, id] });

  const submit = () => {
    if (!form.shipmentNumber.trim() || !form.supplierId) return;
    const items = form.items.filter((i) => i.productId && num(i.qty) > 0);
    if (items.length === 0) return;
    save({ ...data, shipments: [...data.shipments, { id: uid(), ...form, items }] });
    setForm(blankShipment());
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Shipments</h1>
        <button className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? "Cancel" : "New shipment"}
        </button>
      </div>
      <p className="text-sm text-[#7A7568] mb-5">Only stock already marked "received" on a PI can be shipped — this deducts from Closing Stock.</p>

      {showForm && (
        <div className={card + " p-5 mb-6"}>
          {data.suppliers.length === 0 || data.products.length === 0 ? (
            <div className="text-sm text-[#B5453A]">Add at least one supplier and product first.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Shipment / container #">
                  <input className={inputCls} value={form.shipmentNumber} onChange={(e) => setForm({ ...form, shipmentNumber: e.target.value })} />
                </Field>
                <Field label="Supplier (loading from)">
                  <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value, piRefs: [] })}>
                    {data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Destination branch">
                  <input className={inputCls} placeholder="e.g. Nairobi, Lagos…" value={form.destinationBranch} onChange={(e) => setForm({ ...form, destinationBranch: e.target.value })} />
                </Field>
                <Field label="Document link">
                  <input className={inputCls} placeholder="https://…" value={form.docLink} onChange={(e) => setForm({ ...form, docLink: e.target.value })} />
                </Field>
              </div>

              {supplierPIs.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-medium">Linked PI(s) — for reference</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {supplierPIs.map((pi) => (
                      <button
                        key={pi.id}
                        type="button"
                        onClick={() => togglePI(pi.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border ${form.piRefs.includes(pi.id) ? "bg-[#1B2430] text-white border-[#1B2430]" : "border-[#DDD7C7] text-[#7A7568]"}`}
                      >
                        {pi.piNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-[0.08em] text-[#7A7568] font-medium">Items loaded</span>
                <div className="mt-1.5 space-y-2">
                  {form.items.map((it, idx) => {
                    const avail = closingQtyFor(form.supplierId, it.productId);
                    const over = num(it.qty) > avail;
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select className={inputCls + " flex-1"} value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                          {data.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                        <input className={inputCls + " w-28"} placeholder="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                        <span className={`text-xs ${over ? "text-[#B5453A] font-semibold" : "text-[#7A7568]"}`}>
                          (Available: {fmt(avail)})
                        </span>
                        <button onClick={() => removeItemRow(idx)} className="text-[#B5453A]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                </div>
                <button className={btnGhost + " mt-2"} onClick={addItemRow}><Plus className="w-3.5 h-3.5" />Add line</button>
              </div>

              <button className={btnPrimary} onClick={submit}>Save Shipment</button>
            </>
          )}
        </div>
      )}

      {data.shipments.length === 0 ? (
        <EmptyState text="No shipments recorded yet." />
      ) : (
        <div className="space-y-3">
          {[...data.shipments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((sh) => (
            <div key={sh.id} className={card + " p-4"}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold">{sh.shipmentNumber} · {supplierName(sh.supplierId)} → {sh.destinationBranch || "Branch"}</div>
                <div className="text-xs text-[#9C9788]">{sh.date}</div>
              </div>
              <ul className="text-xs space-y-1">
                {sh.items.map((it, i) => {
                  const p = productInfo(it.productId);
                  return <li key={i}>{p.name} ({p.sku}): <span className="font-semibold">{fmt(it.qty)} {p.unit}</span></li>;
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}