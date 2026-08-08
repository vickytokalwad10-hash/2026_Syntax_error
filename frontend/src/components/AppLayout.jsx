import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ language, setLanguage }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header language={language} setLanguage={setLanguage} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
