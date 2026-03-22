import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/tasks';
  const [form, setForm] = useState({ email:'', password:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === 'student' ? from : '/my-tasks');
    } catch {}
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:440 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,var(--blue),var(--orange))', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22, fontWeight:800, color:'#fff' }}>S2I</div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'var(--ink-3)', fontSize:14 }}>Sign in to your Skill-To-Income account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={form.email} autoFocus required
                placeholder="you@example.com"
                onChange={e => setForm(f => ({ ...f, email:e.target.value }))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} required
                placeholder="Your password"
                onChange={e => setForm(f => ({ ...f, password:e.target.value }))}/>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ marginTop:4, padding:'13px', fontSize:15 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:20, padding:'16px', background:'var(--surface-2)', borderRadius:10, border:'1px solid var(--border)' }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, textAlign:'center' }}>Demo accounts</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                ['🎓 Student',   'student@demo.com',  'demo123'],
                ['⭐ Senior',    'senior@demo.com',   'demo123'],
                ['🏪 Business',  'business@demo.com', 'demo123'],
                ['🔐 Admin',     'admin@demo.com',    'demo123'],
              ].map(([label, email, pw]) => (
                <button key={label} onClick={() => fill(email, pw)}
                  style={{ padding:'8px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12.5, fontWeight:500, cursor:'pointer', transition:'all .12s' }}
                  onMouseEnter={e => e.target.style.borderColor='var(--blue)'}
                  onMouseLeave={e => e.target.style.borderColor='var(--border)'}>
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontSize:11, color:'var(--ink-4)', textAlign:'center', marginTop:8 }}>Click a role to fill credentials, then Sign In</p>
          </div>

          <p style={{ textAlign:'center', fontSize:13, marginTop:16, color:'var(--ink-3)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--blue)', fontWeight:600 }}>Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
