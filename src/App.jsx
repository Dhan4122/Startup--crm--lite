import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/common/AppLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/index.jsx';

/**
 * Root application component.
 *
 * Provider / routing hierarchy:
 *
 *   BrowserRouter
 *     AuthProvider         ← session state + login/logout actions
 *       Routes
 *         /login           ← public
 *         /register        ← public
 *         ProtectedRoute   ← redirects to /login when no token
 *           AppLayout      ← sidebar + topbar shell
 *             /            → Dashboard
 *             /leads       → Leads
 *             /analytics   → Analytics
 *
 * AuthProvider is placed INSIDE BrowserRouter because it calls useNavigate()
 * internally.  LeadProvider, ThemeProvider, and FilterProvider are mounted
 * one level up in main.jsx so they remain available to any future top-level
 * siblings of App without re-wrapping.
 *
 * @returns {React.JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      {/*
       * AuthProvider must be a child of BrowserRouter so that the
       * useNavigate() call inside AuthContext works correctly.
       */}
      <AuthProvider>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected routes ──────────────────────────────────────── */}
          {/*
           * ProtectedRoute checks for a token and either renders <Outlet />
           * (which becomes AppLayout and its children) or redirects to /login.
           */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Routes>

        {/* Global toast notification container */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-bg-surface dark:text-text-main dark:border dark:border-border-subtle bg-white text-text-main border border-border-subtle shadow-premium rounded-lg text-sm font-medium',
            duration: 3000
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
