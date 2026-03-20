import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const DisputeListPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/disputes/my').then(({ data }) => { setDisputes(data); setLoading(false); });
  }, []);

  const statusColor = { open: 'rose', under_review: 'amber', resolved_student: 'emerald', resolved_business: 'emerald', closed: 'gray' };

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 className="page-title">My Disputes</h1>
        <p className="page-sub">Track and manage disputes on your tasks</p>
        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
          disputes.length === 0 ? (
            <div className="empty-state">
              <h3>No disputes</h3><p>You have no active disputes. That's great!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {disputes.map(d => (
                <Link key={d._id} to={`/disputes/${d._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.taskId?.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
                          Reason: {d.reason} · {new Date(d.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ fontSize: 12 }}>{d.description?.slice(0, 100)}...</div>
                      </div>
                      <span className={`badge badge-${statusColor[d.status] || 'gray'}`}>{d.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
};

export const DisputeDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    api.get(`/disputes/${id}`).then(({ data }) => { setDispute(data); setLoading(false); }).catch(() => navigate('/disputes'));
  }, [id, navigate]);

  const resolve = async (status) => {
    if (!resolution) { alert('Please enter a resolution description'); return; }
    setResolving(true);
    try {
      await api.patch(`/disputes/${id}/resolve`, { resolution, status, adminNotes });
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve');
    } finally { setResolving(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!dispute) return null;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 680 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Back</button>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Dispute #{id.slice(-6).toUpperCase()}</h1>
              <span className="badge badge-rose">{dispute.status.replace('_', ' ')}</span>
            </div>
            <Link to={`/tasks/${dispute.taskId?._id}`}><button className="btn btn-outline btn-sm">View Task</button></Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>RAISED BY</div>
              <div style={{ fontWeight: 600 }}>{dispute.raisedBy?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{dispute.raisedBy?.role}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>AGAINST</div>
              <div style={{ fontWeight: 600 }}>{dispute.againstUser?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{dispute.againstUser?.role}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>REASON</div>
            <div style={{ background: 'var(--rose-lt)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#B5203A' }}>{dispute.reason}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>DESCRIPTION</div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>{dispute.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 10 }}>TIMELINE</div>
            {dispute.timeline?.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--violet)', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <strong>{t.action}</strong>
                  {t.note && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{t.note}</div>}
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{new Date(t.timestamp).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin resolution panel */}
        {user?.role === 'admin' && dispute.status === 'open' && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Resolve Dispute</h3>
            <div className="form-group">
              <label className="form-label">Resolution description *</label>
              <textarea className="form-input form-textarea" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe the resolution decision..." />
            </div>
            <div className="form-group">
              <label className="form-label">Internal admin notes</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 60 }} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Internal notes (not visible to users)..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" disabled={resolving} onClick={() => resolve('resolved_student')}>
                Favour Student
              </button>
              <button className="btn btn-outline" disabled={resolving} onClick={() => resolve('resolved_business')}>
                Favour Business
              </button>
            </div>
          </div>
        )}

        {dispute.status !== 'open' && dispute.resolution && (
          <div className="card" style={{ background: 'var(--emerald-lt)', borderColor: '#9FE8D0' }}>
            <div style={{ fontWeight: 700, color: 'var(--emerald)', marginBottom: 6 }}>✓ Dispute Resolved</div>
            <p style={{ fontSize: 14 }}>{dispute.resolution}</p>
          </div>
        )}
      </div>
    </div>
  );
};
