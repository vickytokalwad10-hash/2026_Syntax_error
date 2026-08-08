import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
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

export default function App() {
  const [language, setLanguage] = useState('en');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout language={language} setLanguage={setLanguage} />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewView />} />
          <Route path="direct-market" element={<DirectMarketView />} />
          <Route path="heatmap" element={<HeatmapView />} />
          <Route path="what-if" element={<WhatIfView />} />
          <Route path="markets" element={<MarketsView />} />
          <Route path="trends" element={<TrendsView />} />
          <Route path="alerts" element={<AlertsView />} />
          <Route path="weather" element={<WeatherView language={language} />} />
          <Route path="copilot" element={<CopilotView language={language} setLanguage={setLanguage} />} />
          <Route path="crop-health" element={<CropHealthView />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
