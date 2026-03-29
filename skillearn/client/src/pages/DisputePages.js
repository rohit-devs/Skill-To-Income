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

  const statusColor = { open: 'rose', under_review: 'amber', resolved_student: 'emerald', resolved_business: 'emerald', closed: 'gray', disputed: 'rose' };

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 740 }}>
        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 8 }}>My Disputes</h1>
        <p className="page-sub" style={{ marginBottom: 32 }}>Track and manage escalations across your tasks</p>
        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> :
          disputes.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--surface-container-low)', border: '1px dashed var(--outline-v)', borderRadius: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--emerald)', marginBottom: 16 }}>verified_user</span>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>All clear!</h3>
              <p style={{ color: 'var(--on-sv)' }}>You have no active disputes. Keep up the great work!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {disputes.map(d => (
                <Link key={d._id} to={`/disputes/${d._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{ borderRadius: 16, border: '1px solid var(--outline-v)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                           <span className={`badge badge-${statusColor[d.status] || 'rose'}`} style={{ padding: '4px 10px', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{d.status.replace('_', ' ')}</span>
                           <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 600 }}>CASE #{d._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: 'var(--ink)' }}>{d.taskId?.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                          Raised Reason: <strong style={{ color: 'var(--ink)' }}>{d.reason}</strong> · {new Date(d.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 12, lineHeight: 1.5 }}>{d.description?.slice(0, 100)}...</div>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--outline-v)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                      </div>
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
    if (!resolution) { window.alert('Please enter a resolution description'); return; }
    setResolving(true);
    try {
      await api.patch(`/disputes/${id}/resolve`, { resolution, status, adminNotes });
      navigate('/admin');
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to resolve');
    } finally { setResolving(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!dispute) return null;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 700 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span> Back to Disputes
        </button>

        <div className="card" style={{ marginBottom: 24, borderRadius: 20, border: '1px solid var(--outline-v)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--outline-v)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Dispute Request</h1>
                <span className="badge badge-rose" style={{ padding: '4px 10px', fontSize: 12 }}>{dispute.status.replace('_', ' ')}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '.04em' }}>CASE #{id.slice(-6).toUpperCase()}</div>
            </div>
            <Link to={`/tasks/${dispute.taskId?._id}`}>
              <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                View Task Details
              </button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--outline-v)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>RAISED BY (COMPLAINANT)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontWeight: 700, fontSize: 18 }}>
                  {dispute.raisedBy?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{dispute.raisedBy?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{dispute.raisedBy?.role}</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--outline-v)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>AGAINST (RESPONDENT)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--rose-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)', fontWeight: 700, fontSize: 18 }}>
                  {dispute.againstUser?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{dispute.againstUser?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{dispute.againstUser?.role}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23f43f5e\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '16px 16px', backgroundColor: 'var(--s-low)', borderRadius: 12, border: '1px solid rgba(244, 63, 94, 0.2)', padding: '20px', marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Primary Issue: {dispute.reason}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-2)', fontStyle: 'italic' }}>"{dispute.description}"</p>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.05em' }}>RESOLUTION TIMELINE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '2px solid var(--outline-v)', marginLeft: 8, paddingLeft: 20 }}>
              {dispute.timeline?.map((t, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'var(--violet)', left: -27, top: 4, border: '2px solid var(--surface)' }} />
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--outline-v)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.action}</div>
                    {t.note && <div style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}>{t.note}</div>}
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8, fontWeight: 600 }}>{new Date(t.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin resolution panel */}
        {user?.role === 'admin' && dispute.status === 'open' && (
          <div className="card" style={{ border: '1.5px solid var(--violet)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--violet)' }}>Admin Action: Resolve Dispute</h3>
            <div className="form-group">
              <label className="form-label">Resolution description (Sent to parties) *</label>
              <textarea className="form-input form-textarea" value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe the resolution decision clearly..." style={{ height: 100 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Internal admin notes (Hidden)</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 60, background: 'var(--surface-2)' }} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Optional internal logs..." />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-success" style={{ flex: 1, padding: 14, fontSize: 15 }} disabled={resolving} onClick={() => resolve('resolved_student')}>
                Accept Student Delivery
              </button>
              <button className="btn btn-outline" style={{ flex: 1, padding: 14, fontSize: 15, color: 'var(--rose)', borderColor: 'var(--rose)' }} disabled={resolving} onClick={() => resolve('resolved_business')}>
                Refund Business
              </button>
            </div>
          </div>
        )}

        {dispute.status !== 'open' && dispute.resolution && (
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid #10B981', borderRadius: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment_turned_in</span>
              </div>
              <div style={{ fontWeight: 800, color: '#047857', fontSize: 16 }}>Dispute Resolved by Admin</div>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#065F46' }}>{dispute.resolution}</p>
          </div>
        )}
      </div>
    </div>
  );
};
