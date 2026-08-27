import React, { useState, useEffect } from 'react';

export default function BranchPortal({ 
  branch, 
  branches, 
  setBranches, 
  items, 
  isManagementMode, 
  onLogout, 
  onSubmitRequisition,
  requisitions = [] 
}) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loggedInBranch, setLoggedInBranch] = useState(null);
  
  const [reqQuantities, setReqQuantities] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const branchIdParam = params.get('branch');
    if (branchIdParam && branches && branches.length > 0) {
      const found = branches.find(b => String(b.id) === String(branchIdParam));
      if (found && !loggedInBranch) {
        setEmailInput(found.email || '');
      }
    }
  }, [branches, loggedInBranch]);

  const handleSecureLogout = () => {
    // Completely wipe the query string from the browser address bar
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    setLoggedInBranch(null);
    setEmailInput('');
    setPasswordInput('');
    if (onLogout) onLogout();
  };

  // 1. Management Mode
  if (isManagementMode) {
    const [newBranchName, setNewBranchName] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');
    const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
    const [selectedAllowedItems, setSelectedAllowedItems] = useState([]);

    const availableSuppliers = [...new Set(items.map(i => i.supplier))];
    const availableCountries = [...new Set(items.map(i => i.country))];

    const filteredCatalog = items.filter(item => {
      const matchSupplier = selectedSupplierFilter === 'ALL' || item.supplier === selectedSupplierFilter;
      const matchCountry = selectedCountryFilter === 'ALL' || item.country === selectedCountryFilter;
      return matchSupplier && matchCountry;
    });

    const handleToggleItem = (code) => {
      setSelectedAllowedItems(prev => 
        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
      );
    };

    const handleSelectAllFiltered = () => {
      const filteredCodes = filteredCatalog.map(i => i.code);
      const combined = [...new Set([...selectedAllowedItems, ...filteredCodes])];
      setSelectedAllowedItems(combined);
    };

    const handleDeselectAllFiltered = () => {
      const filteredCodes = new Set(filteredCatalog.map(i => i.code));
      setSelectedAllowedItems(prev => prev.filter(c => !filteredCodes.has(c)));
    };

    const handleAddBranch = (e) => {
      e.preventDefault();
      if (!newBranchName) return alert('Please enter branch name.');
      if (!newEmail || !newPassword) return alert('Please enter branch login email and password.');

      const newB = {
        id: 'br-' + Date.now(),
        name: newBranchName,
        location: newLocation,
        country: newCountry,
        email: newEmail,
        password: newPassword,
        allowedItems: selectedAllowedItems
      };
      setBranches([...branches, newB]);
      setNewBranchName('');
      setNewLocation('');
      setNewCountry('');
      setNewEmail('');
      setNewPassword('');
      setSelectedAllowedItems([]);
      alert('Branch created successfully with item restrictions!');
    };

    const copyPortalLink = (branchId) => {
      const link = `${window.location.origin}/?branch=${branchId}`;
      navigator.clipboard.writeText(link);
      alert('Branch secure login link copied to clipboard:\n' + link);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Branch Management & Item Permissions</h2>
          <p className="text-sm text-slate-400">Create branches, assign login credentials, filter items by supplier/country, and generate secure portal links.</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400">Add New Branch & Restrict Catalog Access</h3>
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Branch Name (e.g. MATADI)" 
                value={newBranchName} 
                onChange={e => setNewBranchName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required 
              />
              <input 
                type="text" 
                placeholder="Location / City" 
                value={newLocation} 
                onChange={e => setNewLocation(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
              <input 
                type="text" 
                placeholder="Country" 
                value={newCountry} 
                onChange={e => setNewCountry(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="email" 
                placeholder="Branch Login Email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
                required
              />
              <input 
                type="text" 
                placeholder="Branch Password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" 
                required
              />
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-medium text-slate-200 text-sm">Select Permitted Items ({selectedAllowedItems.length} selected)</h4>
                <div className="flex gap-2">
                  <button type="button" onClick={handleSelectAllFiltered} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs px-3 py-1.5 rounded border border-slate-700 transition">Select Filtered</button>
                  <button type="button" onClick={handleDeselectAllFiltered} className="bg-slate-800 hover:bg-slate-700 text-red-400 text-xs px-3 py-1.5 rounded border border-slate-700 transition">Deselect Filtered</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Filter by Supplier</label>
                  <select 
                    value={selectedSupplierFilter} 
                    onChange={e => setSelectedSupplierFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Suppliers</option>
                    {availableSuppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Filter by Country</label>
                  <select 
                    value={selectedCountryFilter} 
                    onChange={e => setSelectedCountryFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Countries</option>
                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950 p-3 rounded border border-slate-800">
                {filteredCatalog.map(item => (
                  <label key={item.code} className="flex items-center gap-2 text-xs text-slate-300 hover:bg-slate-900 p-1.5 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedAllowedItems.includes(item.code)}
                      onChange={() => handleToggleItem(item.code)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                    />
                    <span className="font-mono text-emerald-400">{item.code}</span>
                    <span className="truncate flex-1">{item.name}</span>
                    <span className="text-slate-500">({item.supplier})</span>
                  </label>
                ))}
                {filteredCatalog.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No items match the current filters.</p>}
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-md">
              Save Branch & Generate Secure Credentials
            </button>
          </form>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400">Active Branches & Portal Links</h3>
          <div className="space-y-3">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-100">{b.name} <span className="text-xs font-normal text-slate-400">({b.location}, {b.country})</span></h4>
                  <p className="text-xs text-slate-400 mt-0.5">Email: <span className="text-slate-300">{b.email}</span> | Password: <span className="text-slate-300">{b.password}</span> | Permitted SKUs: <span className="text-emerald-400 font-semibold">{b.allowedItems?.length || 0} items</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyPortalLink(b.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2"
                  >
                    <i className="fa-solid fa-link"></i> Copy Portal Link
                  </button>
                  <button 
                    onClick={() => setBranches(branches.filter(x => x.id !== b.id))}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {branches.length === 0 && <p className="text-slate-400 text-sm">No branches configured yet.</p>}
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged-in Branch Requisition View
  if (loggedInBranch) {
    const allowedCatalog = items.filter(i => loggedInBranch.allowedItems && loggedInBranch.allowedItems.includes(i.code));
    
    // FIX: Case-insensitive match on branch ID or branch Name to properly capture records from HQ state
    const branchRequisitions = requisitions.filter(r => {
      const matchId = r.branchId && loggedInBranch.id && String(r.branchId).toLowerCase() === String(loggedInBranch.id).toLowerCase();
      const matchName = r.branchName && loggedInBranch.name && String(r.branchName).trim().toLowerCase() === String(loggedInBranch.name).trim().toLowerCase();
      return matchId || matchName;
    });

    const handleQuantityChange = (code, val) => {
      setReqQuantities(prev => ({ ...prev, [code]: parseInt(val) || 0 }));
    };

    let totalOrderWeight = 0;
    let totalOrderCbm = 0;

    allowedCatalog.forEach(item => {
      const qty = reqQuantities[item.code] || 0;
      if (qty > 0) {
        totalOrderWeight += (Number(item.weight) || 0) * qty;
        totalOrderCbm += (Number(item.cbm) || 0) * qty;
      }
    });

    const c20CbmMax = 28;
    const c40CbmMax = 58;
    const fill20Cbm = Math.min(100, (totalOrderCbm / c20CbmMax) * 100);
    const fill40Cbm = Math.min(100, (totalOrderCbm / c40CbmMax) * 100);

    const handleSendOrder = () => {
      const orderItems = Object.entries(reqQuantities)
        .filter(([code, qty]) => qty > 0)
        .map(([code, qty]) => {
          const item = items.find(i => i.code === code);
          return { 
            code, 
            itemCode: code, 
            name: item?.name, 
            quantity: qty, 
            qty: qty, 
            unitPrice: Number(item?.price || item?.unitPrice) || 0, 
            currency: item?.currency || 'USD' 
          };
        });

      if (orderItems.length === 0) {
        return alert('Please enter a quantity for at least one item before submitting.');
      }

      const newReq = {
        reqNo: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
        id: 'REQ-' + Date.now(),
        branchId: loggedInBranch.id,
        branchName: loggedInBranch.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: orderItems,
        totalWeight: Number(totalOrderWeight.toFixed(2)),
        totalCBM: Number(totalOrderCbm.toFixed(3)),
        totalCbm: Number(totalOrderCbm.toFixed(3))
      };

      if (onSubmitRequisition) {
        onSubmitRequisition(newReq);
      }
      setReqQuantities({});
      alert(`Requisition ${newReq.reqNo} submitted successfully to Dubai HQ!`);
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">{loggedInBranch.name} Requisition Portal</h2>
              <p className="text-sm text-slate-400">Location: {loggedInBranch.location}, {loggedInBranch.country}</p>
            </div>
            <button 
              onClick={handleSecureLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout Securely
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs text-slate-400">Total Order Weight</p>
              <p className="text-lg font-bold text-emerald-400">{totalOrderWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Order Volume (CBM)</p>
              <p className="text-lg font-bold text-emerald-400">{totalOrderCbm.toFixed(3)} m³</p>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>20FT Fill: <strong>{fill20Cbm.toFixed(1)}%</strong></span>
                <span>40FT Fill: <strong>{fill40Cbm.toFixed(1)}%</strong></span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ${fill20Cbm > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, fill20Cbm)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 space-y-3">
            <h3 className="text-md font-semibold text-emerald-400 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left"></i> My Submitted Requisitions ({branchRequisitions.length})
            </h3>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                    <th className="p-2.5">Req #</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Items Count</th>
                    <th className="p-2.5">Total Wt / CBM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {branchRequisitions.map(req => (
                    <tr key={req.id || req.reqNo} className="hover:bg-slate-950">
                      <td className="p-2.5 font-mono font-semibold text-emerald-400">{req.reqNo}</td>
                      <td className="p-2.5 text-slate-300">{req.date}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          req.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          req.status === 'Rejected' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300">{req.items?.length || 0} items</td>
                      <td className="p-2.5 text-slate-300">{req.totalWeight || 0} kg / {req.totalCBM || req.totalCbm || 0} m³</td>
                    </tr>
                  ))}
                  {branchRequisitions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-slate-500">No previous orders submitted by this branch yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Permitted Product Catalog & Order Requisition</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-700 sticky top-0">
                    <th className="p-3">Code</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Pack Size</th>
                    <th className="p-3">Unit Weight (kg)</th>
                    <th className="p-3">Unit CBM (m³)</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Requested Qty</th>
                    <th className="p-3">Total Weight / CBM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {allowedCatalog.map(item => {
                    const qty = reqQuantities[item.code] || 0;
                    const lineWt = (Number(item.weight) || 0) * qty;
                    const lineCbm = (Number(item.cbm) || 0) * qty;

                    return (
                      <tr key={item.code} className="hover:bg-slate-750">
                        <td className="p-3 font-medium text-emerald-400">{item.code}</td>
                        <td className="p-3 text-slate-200">{item.name}</td>
                        <td className="p-3 text-slate-400">{item.packSize}</td>
                        <td className="p-3 text-slate-300">{item.weight || 0} kg</td>
                        <td className="p-3 text-slate-300">{item.cbm || 0} m³</td>
                        <td className="p-3 text-slate-300">{item.price} {item.currency}</td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            value={reqQuantities[item.code] || ''}
                            onChange={e => handleQuantityChange(item.code, e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="p-3 text-xs text-slate-300">
                          {qty > 0 ? (
                            <div>
                              <span className="text-emerald-400 font-semibold">{lineWt.toFixed(1)} kg</span> / <span className="text-cyan-400 font-semibold">{lineCbm.toFixed(3)} m³</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {allowedCatalog.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-6 text-slate-400">No items have been assigned to this branch yet. Please contact Dubai HQ.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {allowedCatalog.length > 0 && (
              <button 
                onClick={handleSendOrder}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md w-full"
              >
                Submit Order Requisition to Dubai HQ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Login Screen
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const matched = branches.find(b => b.email.toLowerCase() === emailInput.toLowerCase() && b.password === passwordInput);
    if (matched) {
      setLoggedInBranch(matched);
    } else {
      alert('Invalid branch email or password. Please check your assigned credentials.');
    }
  };

  const params = new URLSearchParams(window.location.search);
  const branchIdParam = params.get('branch');
  const targetBranch = branches.find(b => String(b.id) === String(branchIdParam));

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-400">{targetBranch ? `${targetBranch.name} Portal` : 'Branch Portal Login'}</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your assigned branch email and password to access your secure order requisition form.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Branch Login Email</label>
            <input 
              type="email" 
              value={emailInput} 
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter assigned email"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            Login to Secure Portal
          </button>
        </form>
      </div>
    </div>
  );
}
