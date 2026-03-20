import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const CAT_COLOR = { Design:'violet', Writing:'sky', Data:'amber', 'Social Media':'rose', Video:'emerald', Coding:'violet', Research:'sky', Other:'gray' };

const PortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><h3>User not found</h3></div>;

  const { user, recentTasks } = data;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Profile header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--violet)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, flexShrink: 0 }}>
              {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>{user.name}</h1>
                {user.isVerified && <span className="badge badge-emerald">✓ Verified</span>}
                {user.isSenior && <span className="badge badge-amber">⭐ Senior</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                {user.college && `${user.college} · `}{user.city || 'India'}
              </div>
              {user.bio && <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{user.bio}</p>}

              {/* Social links */}
              <div style={{ display: 'flex', gap: 10 }}>
                {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--sky)' }}>LinkedIn →</a>}
                {user.githubUrl && <a href={user.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--ink-3)' }}>GitHub →</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="four-col" style={{ marginBottom: 20 }}>
          {[
            { label: 'Tasks done', value: user.tasksCompleted || 0 },
            { label: 'Total earned', value: `₹${(user.totalEarned || 0).toLocaleString('en-IN')}` },
            { label: 'Rating', value: user.rating ? `${user.rating}★` : 'No rating' },
            { label: 'Streak', value: `${user.streak || 0} days` },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Verified skills */}
        {user.verifiedSkills?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>✓ Verified Skills</h3>
            <div className="tag-row">
              {user.verifiedSkills.map(s => (
                <span key={s} style={{ padding: '5px 14px', background: 'var(--emerald-lt)', color: '#007055', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 600, border: '1.5px solid #9FE8D0' }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {user.skills?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Skills</h3>
            <div className="tag-row">
              {user.skills.map(s => <span key={s} className={`badge badge-${CAT_COLOR[s] || 'gray'}`}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Badges */}
        {user.badges?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Achievements</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {user.badges.map((b, i) => (
                <div key={i} style={{ background: 'var(--amber-lt)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16 }}>{b.icon || '🏅'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92600A' }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{new Date(b.awardedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent work */}
        {recentTasks?.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent Work</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map(t => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{t.title}</div>
                    <span className={`badge badge-${CAT_COLOR[t.category] || 'gray'}`}>{t.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>₹{Math.round(t.budget * 0.88)}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{new Date(t.updatedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
