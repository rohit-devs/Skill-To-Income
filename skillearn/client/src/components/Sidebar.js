import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

function NavLink({ to, icon, label, badge, collapsed, onClose }) {
  const location  = useLocation();
  const isActive  = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link to={to} onClick={onClose} title={collapsed ? label : undefined}>
      <button
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group
          ${isActive
            ? 'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20'
            : 'text-on-sv hover:bg-white/[0.06] hover:text-on-surface'
          }
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 transition-colors
            ${isActive ? 'text-primary' : 'text-on-sv group-hover:text-on-surface'}
          `}
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>

        {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}

        {badge && !collapsed && (
          <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" />
        )}
        {badge && collapsed && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-1 ring-s-low" />
        )}
      </button>
    </Link>
  );
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isStudent  = user?.role === 'student';
  const isBusiness = user?.role === 'business' || user?.role === 'company';
  const isAdmin    = user?.role === 'admin';

  const studentLinks = [
    { to: '/student',      icon: 'dashboard',      label: 'Overview' },
    { to: '/tasks',        icon: 'explore',        label: 'Browse Tasks' },
    { to: '/my-tasks',     icon: 'assignment',     label: 'My Tasks' },
    { to: '/earnings',     icon: 'payments',       label: 'Earnings' },
    { to: '/assessments',  icon: 'verified',       label: 'Skill Tests' },
    { to: '/leaderboard',  icon: 'emoji_events',   label: 'Leaderboard' },
    { to: `/portfolio/${user?._id}`, icon: 'wb_incandescent', label: 'Portfolio' },
  ];

  if (user?.isSenior) {
    studentLinks.push({ to: '/review', icon: 'rate_review', label: 'Review Queue', badge: true });
  }

  const businessLinks = [
    { to: '/business',   icon: 'dashboard',   label: 'Overview' },
    { to: '/my-tasks',   icon: 'assignment',  label: 'Posted Tasks' },
    { to: '/post-task',  icon: 'add_circle',  label: 'Post New Task' },
    { to: '/analytics',  icon: 'bar_chart',   label: 'Analytics' },
    { to: '/tasks',      icon: 'explore',     label: 'Browse Talent' },
  ];

  const adminLinks = [
    { to: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' },
    { to: '/tasks', icon: 'explore',              label: 'All Tasks' },
  ];

  const links = isAdmin ? adminLinks : isBusiness ? businessLinks : studentLinks;
  const displayName = isBusiness ? (user?.businessName || user?.name) : user?.name?.split(' ')[0];
  const roleLabel   = user?.isSenior ? 'Senior Reviewer' : user?.role;
  const initial     = displayName?.[0]?.toUpperCase();

  const sidebarW = collapsed ? 'w-[68px]' : 'w-[260px]';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen ${sidebarW} border-r
          flex flex-col z-50 transition-[width,transform] duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden`}
        style={{ background: 'rgba(6, 8, 15, 0.65)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        {/* ── Logo + collapse toggle ── */}
        <div className={`flex items-center h-16 px-4 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                <span className="material-symbols-outlined text-white text-[17px] icon-fill">trending_up</span>
              </div>
              <div>
                <div className="text-[15px] font-extrabold tracking-tight text-primary leading-none">S2I</div>
                <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-outline">Skill-To-Income</div>
              </div>
            </Link>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3525CD] to-[#4F46E5] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[17px] icon-fill">trending_up</span>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-on-sv hover:bg-white/10 hover:text-on-surface transition-all duration-200 shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* ── User profile mini-card ── */}
        {!collapsed && (
          <div className="mx-3 mt-4 mb-2 rounded-2xl p-3 shrink-0 relative overflow-hidden group" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-2 ring-primary/30">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-on-surface truncate">{displayName}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{roleLabel}</span>
                  {isBusiness && (
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${user?.subscriptionPlan === 'pro' ? 'bg-gradient-to-r from-primary-dim to-primary text-white shadow-sm' : 'bg-s-high/50 text-on-sv border border-outline-v/30'}`}>
                      {user?.subscriptionPlan === 'pro' ? 'PRO' : 'FREE'}
                    </span>
                  )}
                  {isStudent && (
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${user?.subscriptionPlan === 'premium' ? 'bg-gradient-to-r from-secondary to-sec-container text-on-sec shadow-sm' : 'bg-s-high/50 text-on-sv border border-outline-v/30'}`}>
                      {user?.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE'}
                    </span>
                  )}
                </div>
              </div>
              {user?.isVerified && (
                <span className="material-symbols-outlined text-success text-[16px] icon-fill shrink-0" title="Verified">verified</span>
              )}
            </div>

            {isStudent && (
              <div className="flex gap-2 mt-3 pt-2.5 border-t border-outline-v/20">
                {[
                  [formatCurrency(user?.totalEarned || 0), 'earned'],
                  [user?.tasksCompleted || 0, 'tasks'],
                  [user?.rating ? user.rating.toFixed(1) : '–', 'rating'],
                ].map(([val, lbl], i) => (
                  <div key={lbl} className={`flex-1 text-center ${i > 0 ? 'border-l border-outline-v/20 pl-2' : ''}`}>
                    <div className="text-[11px] font-extrabold text-secondary leading-tight">{val}</div>
                    <div className="text-[8.5px] text-on-sv uppercase tracking-wider font-semibold">{lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {isBusiness && (
              <div className="flex gap-2 mt-3 pt-2.5 border-t border-outline-v/20">
                {[
                  [user?.tasksPosted || 0, 'posted'],
                  [formatCurrency(user?.totalSpent || 0), 'spent'],
                ].map(([val, lbl], i) => (
                  <div key={lbl} className={`flex-1 text-center ${i > 0 ? 'border-l border-outline-v/20 pl-2' : ''}`}>
                    <div className="text-[11px] font-extrabold text-secondary leading-tight">{val}</div>
                    <div className="text-[8.5px] text-on-sv uppercase tracking-wider font-semibold">{lbl}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && (
          <div className="flex justify-center mt-4 mb-2 shrink-0">
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center font-extrabold text-sm text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-2 ring-primary/30"
              title={displayName}
            >
              {initial}
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        {!collapsed && (
          <div className="px-5 mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-outline">Navigation</span>
          </div>
        )}

        {/* ── Nav links ── */}
        <nav className={`flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar ${collapsed ? 'px-1.5' : 'px-3'}`}>
          {links.map(({ to, icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              icon={icon}
              label={label}
              badge={badge}
              collapsed={collapsed}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className={`border-t border-outline-v/20 ${collapsed ? 'px-1.5 py-3' : 'px-3 py-3'} mt-auto flex flex-col gap-0.5 shrink-0`}>
          <Link to="/profile" onClick={onClose} title={collapsed ? 'Settings' : undefined}>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-on-sv hover:bg-white/[0.06] hover:text-on-surface transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              {!collapsed && <span>Settings</span>}
            </button>
          </Link>

          <button
            onClick={() => { logout(); navigate('/'); onClose?.(); }}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-error/70 hover:bg-error/10 hover:text-error transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
