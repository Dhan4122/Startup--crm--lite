import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Sun, Moon, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLeads } from '../../context/LeadContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { leads } = useLeads();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads Ledger', icon: Users, badge: leads.length },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex w-60 flex-col 
    border-r border-border-subtle bg-bg-surface px-4 py-6
    transition-transform duration-300 ease-in-out lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header / Brand */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-subtle">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-text-main">Luminate CRM</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Startup Suite</p>
            </div>
          </div>

          {/* Close button for mobile screens */}
          <button 
            onClick={toggleSidebar} 
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-surface-hover hover:text-text-main lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) => `
                flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary-light text-primary dark:bg-primary/10' 
                  : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="rounded-full bg-bg-base border border-border-subtle px-2 py-0.5 text-xs text-text-muted font-medium">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="mt-auto border-t border-border-subtle pt-4 space-y-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-text-muted hover:bg-bg-surface-hover hover:text-text-main transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className="flex h-5 w-9 items-center rounded-full bg-border-subtle p-0.5 transition-colors dark:bg-primary/20">
              <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 dark:translate-x-4 dark:bg-primary" />
            </div>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-bg-surface-hover transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold dark:bg-primary/10">
              SS
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-text-main">Sai Sumanth</p>
              <p className="truncate text-[10px] text-text-muted">Founder & CEO</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
