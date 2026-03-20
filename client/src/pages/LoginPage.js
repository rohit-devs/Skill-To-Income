import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/tasks';

  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'student' ? from : '/my-tasks');
    } catch {}
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>S</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.sub}>Sign in to your SkillEarn account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="priya@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Your password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginTop: 8, padding: '13px', fontSize: 15 }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo accounts</p>
          <div style={styles.demoGrid}>
            <button style={styles.demoBtn} onClick={() => setForm({ email: 'student@demo.com', password: 'demo123' })}>
              🎓 Student
            </button>
            <button style={styles.demoBtn} onClick={() => setForm({ email: 'business@demo.com', password: 'demo123' })}>
              🏪 Business
            </button>
          </div>
        </div>

        <p style={styles.registerLink}>
          Don't have an account? <Link to="/register">Register free</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', background: '#F8F7F4' },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #E4E2DC', padding: '40px 36px', width: '100%', maxWidth: 420 },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { width: 44, height: 44, background: '#3B30CC', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, margin: '0 auto 14px' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B6A64' },
  demoBox: { marginTop: 20, padding: '14px', background: '#F8F7F4', borderRadius: 10 },
  demoTitle: { fontSize: 12, color: '#6B6A64', marginBottom: 8, textAlign: 'center' },
  demoGrid: { display: 'flex', gap: 8 },
  demoBtn: { flex: 1, padding: '8px', background: '#fff', border: '1px solid #E4E2DC', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' },
  registerLink: { textAlign: 'center', marginTop: 18, fontSize: 13.5, color: '#6B6A64' },
};

export default LoginPage;
