import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Canvas Container */}
      <div className="flex-1 flex flex-col lg:pl-60 min-w-0">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between border-b border-border-subtle bg-bg-surface px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">Luminate</span>
          </div>

          <button 
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Dynamic Page View Outlet */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
