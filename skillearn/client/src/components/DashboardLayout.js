import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * DashboardLayout — shell for all authenticated dashboard pages
 * @param {React.ReactNode} children
 * @param {string} title    - page heading shown in topbar
 * @param {React.ReactNode} headerAction - optional right-side CTA in header
 */
export default function DashboardLayout({ children, title, headerAction }) {
  const { user } = useAuth();
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [sidebarCollapsed,  setSidebarCollapsed]   = useState(false);

  const toggleCollapse = useCallback(() => setSidebarCollapsed(c => !c), []);

  const contentMargin = sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]';

  return (
    <div className="flex min-h-screen bg-bg relative">
      {/* ── Global Dashboard Animated Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] -right-[5%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-drift" />
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/6 blur-[120px] animate-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-[10%] right-[20%] w-[550px] h-[550px] rounded-full bg-accent-violet/5 blur-[120px] animate-drift" style={{ animationDelay: '-10s' }} />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        className="z-50"
      />

      {/* ── Main content ── */}
      <div className={`flex flex-col flex-1 min-w-0 transition-[margin] duration-300 relative z-10 ${contentMargin}`}>

        {/* ── Sticky topbar ── */}
        <header className="h-16 flex items-center px-5 sticky top-0 z-30 gap-3 shrink-0" style={{ background: 'rgba(6, 8, 15, 0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-s-mid text-on-sv hover:text-on-surface hover:bg-s-high transition-all active:scale-95 border border-outline-v"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Title */}
          <h1 className="text-[17px] font-extrabold text-on-surface tracking-tight flex-1 truncate">
            {title || 'Dashboard'}
          </h1>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {headerAction}

            {/* Quick-nav home */}
            <Link to="/" title="Back to site">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl text-on-sv hover:bg-white/10 hover:text-on-surface transition-all">
                <span className="material-symbols-outlined text-[19px]">home</span>
              </button>
            </Link>

            {/* User avatar */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center font-black text-xs text-white shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]
              ring-2 ring-primary/30 outline outline-1 outline-white/10"
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1440px] mx-auto z-10 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
