import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SKILLS = ['Design', 'Writing', 'Data', 'Social Media', 'Video', 'Coding', 'Research', 'Excel', 'Canva'];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', city: user?.city || '', skills: user?.skills || [], whatsapp: user?.whatsapp || '', businessName: user?.businessName || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s] }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={styles.title}>Your Profile</h1>

        {/* Profile header card */}
        <div style={styles.profileHeader}>
          <div style={styles.bigAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.profileName}>{user?.name}</div>
            <div style={styles.profileRole}>{user?.role === 'student' ? `🎓 Student${user?.isSenior ? ' · ⭐ Senior Reviewer' : ''}` : user?.role === 'business' ? '🏪 Business' : '🏢 Company'}</div>
            {user?.role === 'student' && (
              <div style={styles.profileStats}>
                <span>₹{(user?.totalEarned || 0).toLocaleString('en-IN')} earned</span>
                <span>·</span>
                <span>{user?.tasksCompleted || 0} tasks</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.name} onChange={set('name')} />
            </div>

            {user?.role === 'student' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">College</label>
                    <input className="form-input" value={form.college} onChange={set('college')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={set('city')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Your skills</label>
                  <div className="tag-row" style={{ marginTop: 4 }}>
                    {SKILLS.map((s) => (
                      <button key={s} type="button" className={`tag ${form.skills.includes(s) ? 'active' : ''}`} onClick={() => toggleSkill(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(user?.role === 'business' || user?.role === 'company') && (
              <>
                <div className="form-group">
                  <label className="form-label">Business / Company name</label>
                  <input className="form-input" value={form.businessName} onChange={set('businessName')} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={set('city')} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 26, fontWeight: 700, marginBottom: 20 },
  profileHeader: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid #E4E2DC', borderRadius: 14, padding: '20px 24px', marginBottom: 20 },
  bigAvatar: { width: 64, height: 64, background: '#3B30CC', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 },
  profileName: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  profileRole: { fontSize: 13.5, color: '#6B6A64', marginBottom: 6 },
  profileStats: { display: 'flex', gap: 8, fontSize: 13, color: '#3B30CC', fontWeight: 500 },
};

export default ProfilePage;
