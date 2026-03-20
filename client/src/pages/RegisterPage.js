import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SKILLS = ['Design', 'Writing', 'Data', 'Social Media', 'Video', 'Coding', 'Research', 'Excel', 'Canva'];

const RegisterPage = () => {
  const [params] = useSearchParams();
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: params.get('role') || 'student',
    college: '', city: '', skills: [], whatsapp: '', businessName: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setForm((f) => ({ ...f, role: params.get('role') || 'student' }));
  }, [params]);

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.role === 'student' && form.skills.length === 0) {
      setLocalError('Please select at least one skill.');
      return;
    }
    try {
      const user = await register(form);
      navigate(user.role === 'student' ? '/tasks' : '/post-task');
    } catch {}
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>S</div>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.sub}>Join SkillEarn and start today</p>
        </div>

        {/* Role selector */}
        <div style={styles.roleRow}>
          {['student', 'business', 'company'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}
            >
              {r === 'student' ? '🎓 Student' : r === 'business' ? '🏪 Business' : '🏢 Company'}
            </button>
          ))}
        </div>

        {(error || localError) && <div className="alert alert-error">{error || localError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="Priya Sharma" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="priya@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
          </div>

          {form.role === 'student' && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">College name</label>
                  <input className="form-input" value={form.college} onChange={set('college')} placeholder="FAMT Ratnagiri" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={set('city')} placeholder="Ratnagiri" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp number</label>
                <input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Your skills (select all that apply) *</label>
                <div className="tag-row" style={{ marginTop: 4 }}>
                  {SKILLS.map((s) => (
                    <button
                      key={s} type="button"
                      className={`tag ${form.skills.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSkill(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(form.role === 'business' || form.role === 'company') && (
            <>
              <div className="form-group">
                <label className="form-label">{form.role === 'business' ? 'Business name' : 'Company name'} *</label>
                <input className="form-input" value={form.businessName} onChange={set('businessName')} placeholder={form.role === 'business' ? "Ravi's Bakery" : "Acme Corp"} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={set('city')} placeholder="Nashik" />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '13px', fontSize: 15 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', background: '#F8F7F4' },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #E4E2DC', padding: '36px 32px', width: '100%', maxWidth: 480 },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { width: 44, height: 44, background: '#3B30CC', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, margin: '0 auto 14px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B6A64' },
  roleRow: { display: 'flex', gap: 8, marginBottom: 22 },
  roleBtn: { flex: 1, padding: '9px 4px', borderRadius: 8, border: '1.5px solid #E4E2DC', background: '#fff', fontSize: 13, fontWeight: 500, color: '#6B6A64', cursor: 'pointer' },
  roleBtnActive: { borderColor: '#3B30CC', background: '#EEEDFE', color: '#3B30CC' },
  loginLink: { textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#6B6A64' },
};

export default RegisterPage;
