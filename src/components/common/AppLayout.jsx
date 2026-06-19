import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, Sparkles, LayoutDashboard, Users, BarChart3 } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    /* h-screen + overflow-hidden: locks the outer shell to the viewport so
       the sidebar and main content area can each own their own scroll. */
    <div className="h-screen overflow-hidden bg-bg-base text-text-main flex">

      {/* Sidebar Navigation — fixed on md+, drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Canvas: flex column that fills the remaining horizontal space */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 min-w-0 overflow-hidden">

        {/* ── Mobile-only Top Header Bar ─────────────────────────────────── */}
        <header className="md:hidden shrink-0 flex items-center justify-between border-b border-border-subtle bg-bg-surface px-4 py-3 z-30">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-text-main">Luminate</span>
          </div>

          <button
            onClick={toggleSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* ── Scrollable Page Content ─────────────────────────────────────
            flex-1 fills remaining vertical space; overflow-y-auto provides
            independent scrolling so the header + bottom-nav never move. */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile Bottom Navigation Bar ───────────────────────────────── */}
        <nav className="md:hidden shrink-0 h-16 bg-bg-surface border-t border-border-subtle flex items-center justify-around px-4 z-40 shadow-premium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-primary-light text-primary dark:bg-primary/10'
                    : 'text-text-muted hover:text-text-main'}
                `}
                aria-label={item.label}
              >
                <Icon className="h-6 w-6" />
              </NavLink>
            );
          })}
        </nav>

      </div>
    </div>
  );
}


