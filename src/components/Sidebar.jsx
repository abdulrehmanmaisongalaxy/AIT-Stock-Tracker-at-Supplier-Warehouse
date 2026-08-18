import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Branch Ordering', icon: '📦' },
    { id: 'items', label: 'Item Master & Rules', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-md">
      <div className="p-5 text-xl font-bold tracking-wider border-b border-slate-800">
        AIT Supplier Portal
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
