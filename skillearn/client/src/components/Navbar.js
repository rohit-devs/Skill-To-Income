import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';
import api from '../utils/api';

const SIDEBAR_ROUTES = ['/dashboard','/my-tasks','/earnings','/profile','/analytics','/admin','/ai-test-review','/review','/post-task'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs]       = useState([]);
  const [unread, setUnread]       = useState(0);
  const menuRef = useRef(null);

  const hasSidebar = SIDEBAR_ROUTES.some(r => location.pathname.startsWith(r));
  const isBusiness = user?.role === 'business' || user?.role === 'company';

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        if (isBusiness) {
          const { data } = await api.get('/ai/business-notifications');
          const n = data.slice(0, 8).map((d, i) => ({
            id: i,
            msg: `${d.student?.name || 'A student'} accepted "${d.taskTitle?.slice(0,30)}..."`,
            time: d.assignedAt,
            read: false,
          }));
          setNotifs(n);
          setUnread(n.length);
        }
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, [user, isBusiness]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setMenuOpen(false); setNotifOpen(false); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (hasSidebar) return null;

  return (
    <nav className="sticky top-0 z-50 h-16" style={{ background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(99,102,241,0.5)]" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <span className="material-symbols-outlined text-white text-lg icon-fill">trending_up</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-primary hidden sm:block">Skill-To-Income</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            ['Browse Tasks', '/tasks'],
            ['Leaderboard', '/leaderboard'],
            ['Pricing', '/pricing'],
          ].map(([label, to]) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-[13.5px] font-bold transition-all duration-200 ${
                active
                  ? 'text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div ref={menuRef} className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification bell */}
              <div className="relative">
                <button 
                  onClick={() => { setNotifOpen(!notifOpen); setUnread(0); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-on-sv hover:bg-white/5 hover:text-on-surface transition-all active:scale-95 relative"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface animate-pulse" />}
                </button>
                
                {notifOpen && (
                  <div className="absolute top-[calc(100%+12px)] right-0 w-80 bg-s-high rounded-xl border border-outline-v/30 shadow-2xl overflow-hidden z-[100] animate-[slideUp_0.2s_ease-out]">
                    <div className="px-4 py-3 border-b border-outline-v/30 flex justify-between items-center bg-s-highest">
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-sv">Notifications</span>
                      {unread > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{notifs.length} new</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifs.length === 0 ? (
                        <div className="p-8 text-center text-on-sv flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-3xl opacity-20">notifications_off</span>
                          <p className="text-xs font-bold">All caught up!</p>
                        </div>
                      ) : (
                        notifs.map(n => (
                          <div key={n.id} className="p-4 border-b border-outline-v/10 hover:bg-white/5 transition-colors cursor-pointer group">
                            <p className="text-[12.5px] font-medium text-on-surface mb-1 group-hover:text-primary transition-colors leading-snug">{n.msg}</p>
                            <p className="text-[10px] font-bold text-on-sv">
                              {n.time ? new Date(n.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Post task CTA */}
              {isBusiness && (
                <div className="hidden sm:block">
                  <Link to="/post-task">
                    <Button variant="secondary" size="sm" leftIcon="add_circle">Post Task</Button>
                  </Link>
                </div>
              )}

              {/* Avatar menu */}
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-transparent hover:border-outline-v/30 hover:bg-white/5 transition-all active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3525CD] to-[#4F46E5] flex items-center justify-center font-black text-xs text-white shadow-inner ring-2 ring-primary/20">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left mr-1">
                    <div className="text-[12px] font-black text-on-surface leading-none">{user.name?.split(' ')[0]}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-primary mt-1">{user.role}</div>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] text-on-sv transition-transform duration-200 ${menuOpen ? 'rotate-180' : 'group-hover:text-on-surface'}`}>expand_more</span>
                </button>

                {menuOpen && (
                  <div className="absolute top-[calc(100%+12px)] right-0 w-52 bg-s-highest rounded-xl p-2 border border-outline-v/30 shadow-2xl z-[100] animate-[slideUp_0.15s_ease-out]">
                    <div className="px-3 py-2 mb-1 lg:hidden border-b border-outline-v/20">
                      <div className="text-[13px] font-black text-on-surface">{user.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">{user.role}</div>
                    </div>
                    {[
                      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                      { to: '/profile', icon: 'person', label: 'My Profile' },
                      ...(user?.role === 'student' ? [{ to: '/earnings', icon: 'payments', label: 'Earnings' }] : []),
                      { to: `/portfolio/${user._id}`, icon: 'wb_incandescent', label: 'Public Portfolio' },
                      ...(user?.role === 'admin' ? [{ to: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' }] : []),
                    ].map(({ to, icon, label }) => (
                      <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold text-on-surface hover:bg-white/5 transition-all text-left">
                          <span className="material-symbols-outlined text-[18px] text-on-sv">{icon}</span>
                          {label}
                        </button>
                      </Link>
                    ))}
                    <div className="my-1.5 border-t border-outline-v/30" />
                    <button 
                      onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold text-error/80 hover:bg-error/10 hover:text-error transition-all text-left group"
                    >
                      <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Join Free</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
