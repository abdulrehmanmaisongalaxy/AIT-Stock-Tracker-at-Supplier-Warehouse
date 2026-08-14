export default function OrderConsolidation({ requisitions }) {
  return <div className="text-slate-200"><h2 className="text-xl font-semibold mb-4">MOQ & Consolidation</h2><p className="text-slate-400">Total Requisitions Received: {requisitions.length}</p></div>;
}
