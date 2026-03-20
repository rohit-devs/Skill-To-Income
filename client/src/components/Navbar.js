import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (p) => location.pathname.startsWith(p);

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>
          <span style={S.logoMark}>SE</span>
          <span style={S.logoText}>SkillEarn</span>
          <span style={S.logoBeta}>v2</span>
        </Link>

        <div style={S.links} className="hide-mobile">
          <NavLink to="/tasks" active={isActive('/tasks')}>Browse</NavLink>
          <NavLink to="/leaderboard" active={isActive('/leaderboard')}>Leaderboard</NavLink>
          {user?.role === 'student' && <>
            <NavLink to="/my-tasks" active={isActive('/my-tasks')}>My Tasks</NavLink>
            <NavLink to="/earnings" active={isActive('/earnings')}>Earnings</NavLink>
            <NavLink to="/assessments" active={isActive('/assessments')}>Skill Tests</NavLink>
            {user?.isSenior && <NavLink to="/review" active={isActive('/review')}>⭐ Review</NavLink>}
          </>}
          {(user?.role === 'business' || user?.role === 'company') && <>
            <NavLink to="/post-task" active={isActive('/post-task')}>Post Task</NavLink>
            <NavLink to="/my-tasks" active={isActive('/my-tasks')}>My Posts</NavLink>
            <NavLink to="/analytics" active={isActive('/analytics')}>Analytics</NavLink>
          </>}
          {user?.role === 'admin' && <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>}
        </div>

        <div style={S.right}>
          {user ? (
            <>
              <Link to="/profile" style={S.profileBtn}>
                <span style={S.avatarSm}>{user.name?.[0]?.toUpperCase()}</span>
                <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} style={S.logoutBtn} className="hide-mobile">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"><button style={S.loginBtn}>Log in</button></Link>
              <Link to="/register"><button style={S.ctaBtn}>Get started</button></Link>
            </>
          )}
          <button style={S.hamburger} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>

      {menuOpen && (
        <div style={S.mobileMenu}>
          {[['Browse','/tasks'],['Leaderboard','/leaderboard']].map(([label,path]) => (
            <Link key={path} to={path} style={S.mobileLink} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          {user && <>
            <Link to="/my-tasks" style={S.mobileLink} onClick={() => setMenuOpen(false)}>My Tasks</Link>
            {user.role === 'student' && <>
              <Link to="/earnings" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Earnings</Link>
              <Link to="/assessments" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Skill Tests</Link>
            </>}
            {(user.role === 'business' || user.role === 'company') && <>
              <Link to="/post-task" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Post Task</Link>
              <Link to="/analytics" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Analytics</Link>
            </>}
            {user.role === 'admin' && <Link to="/admin" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Admin</Link>}
            <Link to="/profile" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
            <button style={{ ...S.mobileLink, background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, textAlign: 'left' }} onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>Sign out</button>
          </>}
          {!user && <>
            <Link to="/login" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/register" style={S.mobileLink} onClick={() => setMenuOpen(false)}>Get started</Link>
          </>}
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link to={to} style={{ padding:'6px 12px', borderRadius:8, fontSize:14, fontWeight:500, color: active ? 'var(--violet)' : 'var(--ink-2)', background: active ? 'var(--violet-lt)' : 'transparent', textDecoration:'none', transition:'all .12s' }}>{children}</Link>
);

const S = {
  nav: { background:'var(--surface)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:200 },
  inner: { maxWidth:1120, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 },
  logo: { display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 },
  logoMark: { width:34, height:34, background:'var(--violet)', color:'#fff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 },
  logoText: { fontWeight:800, fontSize:18, color:'var(--ink)' },
  logoBeta: { background:'var(--amber-lt)', color:'#92600A', borderRadius:4, padding:'1px 6px', fontSize:10, fontWeight:700 },
  links: { display:'flex', alignItems:'center', gap:2, flex:1, justifyContent:'center' },
  right: { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  profileBtn: { display:'flex', alignItems:'center', gap:8, textDecoration:'none', padding:'5px 10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' },
  avatarSm: { width:28, height:28, borderRadius:'50%', background:'var(--violet)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 },
  logoutBtn: { background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', fontSize:13, color:'var(--ink-3)', cursor:'pointer' },
  loginBtn: { background:'none', border:'1px solid var(--border-2)', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:500, color:'var(--ink)', cursor:'pointer' },
  ctaBtn: { background:'var(--violet)', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' },
  hamburger: { display:'none', background:'none', border:'none', fontSize:22, cursor:'pointer' },
  mobileMenu: { background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'12px 20px', display:'flex', flexDirection:'column', gap:2 },
  mobileLink: { padding:'10px 8px', fontSize:15, fontWeight:500, color:'var(--ink)', textDecoration:'none', borderRadius:8, display:'block' },
};

export default Navbar;
