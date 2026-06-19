import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Sun, Moon, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLeads } from '../../context/LeadContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { leads } = useLeads();

  const navItems = [
    { to: '/', label: 'Dashboard', subLabel: 'Control Center', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads Ledger', subLabel: 'Prospect Database', icon: Users, badge: leads.length },
    { to: '/analytics', label: 'Analytics', subLabel: 'Performance Metrics', icon: BarChart3 }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col 
    border-r border-border-subtle bg-bg-surface
    transition-all duration-300 ease-in-out
    
    /* Mobile Drawer */
    w-64 p-4 py-6
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    
    /* Tablet Narrow Sidebar */
    md:translate-x-0 md:w-20 md:p-2 md:py-6
    
    /* Desktop Wide Sidebar */
    lg:w-64 lg:p-4 lg:py-6
  `;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header / Brand */}
        <div className="mb-8 flex items-center justify-between md:justify-center lg:justify-between">
          <div className="flex items-center gap-3 md:flex-col lg:flex-row">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-subtle shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="md:hidden lg:block text-center lg:text-left">
              <h1 className="text-sm font-bold tracking-tight text-text-main">Luminate CRM</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Startup Suite</p>
            </div>
          </div>

          {/* Close button for mobile screens */}
          <button 
            onClick={toggleSidebar} 
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-bg-surface-hover hover:text-text-main md:hidden cursor-pointer"
            aria-label="Close menu drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 md:space-y-1.5 lg:space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={({ isActive }) => `
                relative flex flex-row md:flex-col lg:flex-row items-center md:items-center lg:items-start lg:justify-between rounded-lg px-3 py-3 md:py-2.5 lg:py-2.5 text-sm transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'bg-primary-light text-primary dark:bg-primary/10 font-bold' 
                  : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main font-medium'}
              `}
            >
              {/* Icon & labels layout */}
              <div className="flex flex-row md:flex-col lg:flex-row items-center md:items-center lg:items-start gap-3 md:gap-1 lg:gap-3 w-full text-left md:text-center lg:text-left">
                <item.icon className="h-5 w-5 md:h-5 md:w-5 lg:h-4 lg:w-4 shrink-0" />
                <div className="flex flex-col items-start md:items-center lg:items-start">
                  <span className="text-sm md:text-[10px] lg:text-sm">{item.label}</span>
                  <span className="hidden lg:block text-[10px] font-normal text-text-muted mt-0.5">
                    {item.subLabel}
                  </span>
                </div>
              </div>

              {/* Badge */}
              {item.badge !== undefined && (
                <span className="
                  absolute top-2 right-2 md:top-1 md:right-1 lg:static
                  rounded-full bg-bg-base border border-border-subtle px-1.5 py-0.5 text-[9px] lg:text-xs text-text-muted font-bold lg:font-medium
                ">
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
            className="flex w-full items-center justify-between md:justify-center lg:justify-between rounded-lg p-3 md:p-2.5 lg:px-3 lg:py-2 text-xs font-medium text-text-muted hover:bg-bg-surface-hover hover:text-text-main transition-colors cursor-pointer h-11 md:h-9 lg:h-auto"
            aria-label="Toggle light/dark theme"
          >
            <div className="flex items-center gap-3 md:gap-0 lg:gap-3">
              {isDark ? <Sun className="h-5 w-5 md:h-5 md:w-5 lg:h-4 lg:w-4" /> : <Moon className="h-5 w-5 md:h-5 md:w-5 lg:h-4 lg:w-4" />}
              <span className="md:hidden lg:block">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className="hidden lg:flex md:hidden h-5 w-9 items-center rounded-full bg-border-subtle p-0.5 transition-colors dark:bg-primary/20">
              <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 dark:translate-x-4 dark:bg-primary" />
            </div>
          </button>

          {/* User Profile */}
          <div className="flex items-center justify-start md:justify-center lg:justify-start gap-3 rounded-lg p-2 hover:bg-bg-surface-hover transition-colors cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold dark:bg-primary/10 shrink-0">
              SS
            </div>
            <div className="overflow-hidden md:hidden lg:block">
              <p className="truncate text-xs font-semibold text-text-main">Sai Dhanvesh</p>
              <p className="truncate text-[10px] text-text-muted">Founder & CEO</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

