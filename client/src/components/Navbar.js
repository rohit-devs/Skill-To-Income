import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const active = (p) => location.pathname.startsWith(p);

  return (
    <nav style={S.nav}>
      <div style={S.inner}>

        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={S.logoBox}>
            <span style={S.logoS}>S</span>
            <span style={S.logoI}>2I</span>
          </div>
          <div style={S.logoText}>
            <span style={{ color:'var(--blue)', fontWeight:800 }}>Skill</span>
            <span style={{ color:'var(--ink-3)', fontWeight:500, fontSize:13 }}> to </span>
            <span style={{ color:'var(--orange)', fontWeight:800 }}>Income</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={S.links} className="hide-mobile">
          <NL to="/tasks"       active={active('/tasks')}>Browse</NL>
          <NL to="/leaderboard" active={active('/leaderboard')}>Leaderboard</NL>
          {user?.role === 'student' && <>
            <NL to="/my-tasks"    active={active('/my-tasks')}>My Tasks</NL>
            <NL to="/earnings"    active={active('/earnings')}>Earnings</NL>
            <NL to="/assessments" active={active('/assessments')}>Skill Tests</NL>
            {user?.isSenior && <NL to="/review" active={active('/review')} orange>⭐ Review</NL>}
          </>}
          {(user?.role === 'business' || user?.role === 'company') && <>
            <NL to="/post-task"  active={active('/post-task')}>Post Task</NL>
            <NL to="/my-tasks"   active={active('/my-tasks')}>My Posts</NL>
            <NL to="/analytics"  active={active('/analytics')}>Analytics</NL>
          </>}
          {user?.role === 'admin' && <NL to="/admin" active={active('/admin')}>Admin</NL>}
        </div>

        {/* Right */}
        <div style={S.right}>
          {user ? (
            <>
              <Link to="/profile" style={S.profileBtn}>
                <span style={S.avatar}>{user.name?.[0]?.toUpperCase()}</span>
                <span className="hide-mobile" style={{ fontSize:13, fontWeight:600 }}>{user.name?.split(' ')[0]}</span>
              </Link>
              <button className="hide-mobile" style={S.signout} onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"><button style={S.loginBtn}>Log in</button></Link>
              <Link to="/register"><button style={S.ctaBtn}>Get started</button></Link>
            </>
          )}
          <button style={S.burger} onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={S.mobileMenu}>
          {[['Browse','/tasks'],['Leaderboard','/leaderboard']].map(([l,p]) => (
            <Link key={p} to={p} style={S.mLink} onClick={() => setOpen(false)}>{l}</Link>
          ))}
          {user && <>
            <Link to="/my-tasks"    style={S.mLink} onClick={() => setOpen(false)}>My Tasks</Link>
            {user.role === 'student' && <>
              <Link to="/earnings"    style={S.mLink} onClick={() => setOpen(false)}>Earnings</Link>
              <Link to="/assessments" style={S.mLink} onClick={() => setOpen(false)}>Skill Tests</Link>
              {user.isSenior && <Link to="/review" style={{ ...S.mLink, color:'var(--orange)' }} onClick={() => setOpen(false)}>⭐ Review Queue</Link>}
            </>}
            {(user.role === 'business' || user.role === 'company') && <>
              <Link to="/post-task"  style={S.mLink} onClick={() => setOpen(false)}>Post Task</Link>
              <Link to="/analytics"  style={S.mLink} onClick={() => setOpen(false)}>Analytics</Link>
            </>}
            {user.role === 'admin' && <Link to="/admin" style={S.mLink} onClick={() => setOpen(false)}>Admin</Link>}
            <Link to="/profile" style={S.mLink} onClick={() => setOpen(false)}>Profile</Link>
            <button style={{ ...S.mLink, background:'none', border:'none', color:'var(--rose)', cursor:'pointer', fontFamily:'inherit', fontSize:15, textAlign:'left' }} onClick={() => { logout(); navigate('/'); setOpen(false); }}>Sign out</button>
          </>}
          {!user && <>
            <Link to="/login"    style={S.mLink} onClick={() => setOpen(false)}>Log in</Link>
            <Link to="/register" style={S.mLink} onClick={() => setOpen(false)}>Get started</Link>
          </>}
        </div>
      )}
    </nav>
  );
};

const NL = ({ to, active, children, orange }) => (
  <Link to={to} style={{
    padding:'6px 12px', borderRadius:8, fontSize:14, fontWeight:500, textDecoration:'none', transition:'all .12s',
    color: active ? (orange ? 'var(--orange)' : 'var(--blue)') : 'var(--ink-2)',
    background: active ? (orange ? 'var(--orange-lt)' : 'var(--blue-lt)') : 'transparent',
  }}>{children}</Link>
);

const S = {
  nav: { background:'var(--surface)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:200 },
  inner: { maxWidth:1120, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 },
  logo: { display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 },
  logoBox: { width:38, height:38, background:'linear-gradient(135deg,var(--blue),var(--orange))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', gap:1 },
  logoS: { color:'#fff', fontWeight:800, fontSize:16 },
  logoI: { color:'rgba(255,255,255,.85)', fontWeight:700, fontSize:11 },
  logoText: { display:'flex', alignItems:'baseline', gap:0 },
  links: { display:'flex', alignItems:'center', gap:2, flex:1, justifyContent:'center' },
  right: { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  profileBtn: { display:'flex', alignItems:'center', gap:8, textDecoration:'none', padding:'5px 10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' },
  avatar: { width:28, height:28, borderRadius:'50%', background:'var(--blue)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 },
  signout: { background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', fontSize:13, color:'var(--ink-3)', cursor:'pointer' },
  loginBtn: { background:'none', border:'1px solid var(--border-2)', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:500, color:'var(--ink)', cursor:'pointer' },
  ctaBtn: { background:'var(--orange)', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' },
  burger: { display:'none', background:'none', border:'none', fontSize:22, cursor:'pointer' },
  mobileMenu: { background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'12px 20px', display:'flex', flexDirection:'column', gap:2 },
  mLink: { padding:'10px 8px', fontSize:15, fontWeight:500, color:'var(--ink)', textDecoration:'none', borderRadius:8, display:'block' },
};

export default Navbar;
