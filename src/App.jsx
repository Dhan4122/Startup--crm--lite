import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { LeadProvider } from './context/LeadContext';
import AppLayout from './components/common/AppLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <ThemeProvider>
      <LeadProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'dark:bg-bg-surface dark:text-text-main dark:border dark:border-border-subtle bg-white text-text-main border border-border-subtle shadow-premium rounded-lg text-sm font-medium',
              duration: 3000
            }} 
          />
        </BrowserRouter>
      </LeadProvider>
    </ThemeProvider>
  );
}
