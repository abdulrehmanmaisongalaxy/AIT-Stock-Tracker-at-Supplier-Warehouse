import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import ItemMaster from './components/ItemMaster';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userSession, setUserSession] = useState({ name: 'Branch Manager', branch: 'Dubai Central' });

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={userSession} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'orders' && <OrderForm branch={userSession.branch} />}
          {currentView === 'items' && <ItemMaster />}
        </main>
      </div>
    </div>
  );
}
