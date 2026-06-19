import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/common/AppLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';

/**
 * Root application component.
 *
 * Defines routing and global UI chrome (toast notifications).
 * Context providers (LeadProvider, ThemeProvider) are intentionally
 * mounted one level up in main.jsx so that they are available to any
 * future top-level siblings of App without requiring re-wrapping.
 *
 * @returns {React.JSX.Element}
 */
export default function App() {
  return (
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
  );
}
