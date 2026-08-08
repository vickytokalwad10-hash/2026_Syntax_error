import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ShaderBackground from './ShaderBackground';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <ShaderBackground />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
