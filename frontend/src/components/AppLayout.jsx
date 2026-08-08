import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ShaderBackground from './ShaderBackground';

export default function AppLayout() {
  return (
    <div className="app-container">
      <ShaderBackground />
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
