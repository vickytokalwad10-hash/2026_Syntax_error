import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import ChatbotWidget from './components/ChatbotWidget';
import OverviewView from './pages/OverviewView';
import DirectMarketView from './pages/DirectMarketView';
import HeatmapView from './pages/HeatmapView';
import WhatIfView from './pages/WhatIfView';
import MarketsView from './pages/MarketsView';
import TrendsView from './pages/TrendsView';
import AlertsView from './pages/AlertsView';
import CopilotView from './pages/CopilotView';
import CropHealthView from './pages/CropHealthView';
import WeatherView from './pages/WeatherView';
// Auth Pages
import RoleSelect from './pages/RoleSelect';
import FarmerLogin from './pages/FarmerLogin';
import FarmerSignup from './pages/FarmerSignup';
import BuyerLogin from './pages/BuyerLogin';
import BuyerSignup from './pages/BuyerSignup';
// Role Dashboards
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Main App Layout (Sidebar + Header) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="overview" element={<OverviewView />} />
              <Route path="direct-market" element={<DirectMarketView />} />
              <Route path="heatmap" element={<HeatmapView />} />
              <Route path="what-if" element={<WhatIfView />} />
              <Route path="markets" element={<MarketsView />} />
              <Route path="trends" element={<TrendsView />} />
              <Route path="alerts" element={<AlertsView />} />
              <Route path="weather" element={<WeatherView />} />
              <Route path="copilot" element={<CopilotView />} />
              <Route path="crop-health" element={<CropHealthView />} />

              {/* Auth Routes — rendered inside the main layout */}
              <Route path="login" element={<Navigate to="/auth/role" replace />} />
              <Route path="auth/role" element={<RoleSelect />} />
              <Route path="auth/farmer/login" element={<FarmerLogin />} />
              <Route path="auth/farmer/signup" element={<FarmerSignup />} />
              <Route path="auth/buyer/login" element={<BuyerLogin />} />
              <Route path="auth/buyer/signup" element={<BuyerSignup />} />

              {/* Role Dashboards */}
              <Route path="dashboard/farmer" element={<FarmerDashboard />} />
              <Route path="dashboard/buyer" element={<BuyerDashboard />} />

              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Routes>

          {/* Global floating chatbot widget — always mounted */}
          <ChatbotWidget />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
