import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS = {
  open:               { label:'Open',              color:'#00A878', bg:'#EAF3DE' },
  assigned:           { label:'In Progress',       color:'var(--blue)', bg:'var(--blue-lt)' },
  submitted:          { label:'Submitted for Review', color:'#F5A623', bg:'#FAEEDA' },
  under_review:       { label:'Awaiting Client Approval', color:'var(--blue)', bg:'var(--blue-lt)' },
  revision_requested: { label:'Revision Requested', color:'var(--rose)', bg:'var(--rose-lt)' },
  completed:          { label:'Completed ✓',        color:'#00A878', bg:'#EAF3DE' },
  disputed:           { label:'Disputed',           color:'var(--rose)', bg:'var(--rose-lt)' },
};

export default function TaskDetailPage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [task, setTask]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [note, setNote]         = useState('');
  const [link, setLink]         = useState('');
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then(({ data }) => setTask(data))
      .catch(() => navigate('/tasks'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const action = async (endpoint, body = {}) => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const { data } = await api.patch(`/tasks/${id}/${endpoint}`, body);
      setTask(data.task);
      setMsg(data.message);
      setShowSubmit(false);
    } catch (e) {
      setErr(e.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!task)   return null;

  const st        = STATUS[task.status] || STATUS.open;
  const isOwner   = user && String(task.postedBy?._id) === String(user?._id);
  const isAssigned= user && String(task.assignedTo?._id) === String(user?._id);
  const isSenior  = user?.isSenior || user?.role === 'admin';
  const bizName   = task.postedBy?.businessName || task.postedBy?.name;
  const studentPay= task.studentPay || Math.round((task.budget || 0) * 0.88);
  const commission= Math.round((task.budget || 0) * 0.12);

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:740 }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'var(--ink-3)', cursor:'pointer', marginBottom:20, fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
          ← Back to tasks
        </button>

        <div className="card" style={{ marginBottom:16 }}>
          {/* Status + category badges */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <span className="badge badge-blue">{task.category}</span>
            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11.5, fontWeight:600, background:st.bg, color:st.color }}>{st.label}</span>
            {task.priority && <span className="badge badge-orange">⭐ Featured</span>}
          </div>

          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:14 }}>{task.title}</h1>

          <div style={{ display:'flex', gap:'6px 20px', flexWrap:'wrap', fontSize:13.5, color:'var(--ink-3)', marginBottom:24 }}>
            {bizName && <span>🏪 {bizName}</span>}
            {task.postedBy?.city && <span>📍 {task.postedBy.city}</span>}
            <span>⏰ Due in {task.deadline}</span>
            {task.postedBy?.ratingCount > 0 && <span>⭐ {task.postedBy.rating?.toFixed(1)} ({task.postedBy.ratingCount} reviews)</span>}
          </div>

          {/* Pay block */}
          <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 22px', marginBottom:24, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:3 }}>Task budget</div>
              <div style={{ fontSize:28, fontWeight:800 }}>₹{task.budget}</div>
            </div>
            <div style={{ fontSize:20, color:'var(--ink-4)' }}>→</div>
            <div>
              <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:3 }}>You receive</div>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--emerald)' }}>₹{studentPay}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>after 12% platform fee (₹{commission})</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:13, color:'var(--ink-3)', display:'flex', flexDirection:'column', gap:5 }}>
              <span>🔄 {task.revisions || 1} revision{task.revisions > 1 ? 's' : ''} included</span>
              <span>👥 Senior peer-reviewed before delivery</span>
              <span>✓ Payment guaranteed on approval</span>
            </div>
          </div>

          {/* Task brief */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Task Brief</div>
            <p style={{ fontSize:15, lineHeight:1.8, color:'var(--ink-2)' }}>{task.description}</p>
          </div>

          {/* Assigned to */}
          {task.assignedTo && (
            <div style={{ background:'var(--blue-lt)', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:13 }}>
              <strong>Assigned to:</strong> {task.assignedTo.name}
              {task.assignedTo.college && ` · ${task.assignedTo.college}`}
            </div>
          )}

          {/* Submission info */}
          {task.submissionNote && (
            <div style={{ background:'var(--emerald-lt)', borderRadius:8, padding:'12px 14px', marginBottom:12, fontSize:13.5, lineHeight:1.6 }}>
              <strong style={{ display:'block', marginBottom:4 }}>Student submission:</strong>
              {task.submissionNote}
              {task.submissionLink && (
                <div style={{ marginTop:8 }}>
                  <a href={task.submissionLink} target="_blank" rel="noreferrer"
                    style={{ color:'var(--blue)', fontWeight:600 }}>View submission file →</a>
                </div>
              )}
            </div>
          )}

          {/* Senior review note */}
          {task.reviewNote && (
            <div style={{ background:'var(--orange-lt)', borderRadius:8, padding:'12px 14px', marginBottom:12, fontSize:13.5, lineHeight:1.6, border:'1px solid #FAC08A' }}>
              <strong style={{ color:'var(--orange-dk)', display:'block', marginBottom:4 }}>Senior review feedback:</strong>
              {task.reviewNote}
            </div>
          )}

          <hr className="divider"/>

          {/* MESSAGES */}
          {msg && <div className="alert alert-success" style={{ marginBottom:12 }}>{msg}</div>}
          {err && <div className="alert alert-error" style={{ marginBottom:12 }}>{err}</div>}

          {/* ════ ACTION BUTTONS ════ */}

          {/* 1. Not logged in */}
          {!user && task.status === 'open' && (
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:14, color:'var(--ink-3)', marginBottom:14 }}>Sign in to accept this task and start earning</p>
              <Link to="/login"><button className="btn btn-primary btn-lg">Login to Accept →</button></Link>
            </div>
          )}

          {/* 2. Student accepts open task */}
          {user?.role === 'student' && task.status === 'open' && (
            <button className="btn btn-primary btn-full" style={{ padding:'15px', fontSize:16 }}
              disabled={busy} onClick={() => action('accept')}>
              {busy ? 'Accepting…' : `✓ Accept Task — Earn ₹${studentPay}`}
            </button>
          )}

          {/* 3. After accepting — show confirmation and submit button */}
          {user?.role === 'student' && isAssigned && task.status === 'assigned' && (
            <div>
              <div style={{ background:'var(--blue-lt)', border:'1.5px solid var(--blue)', borderRadius:12, padding:'16px 20px', marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'var(--blue)', marginBottom:6 }}>✓ Task accepted — it's yours!</div>
                <p style={{ fontSize:13.5, color:'var(--ink-2)', lineHeight:1.6 }}>
                  Complete the work and submit your delivery link below. Deadline: <strong>{task.deadline}</strong> from acceptance.
                </p>
              </div>
              {!showSubmit ? (
                <button className="btn btn-orange btn-full" style={{ padding:'14px', fontSize:15 }}
                  onClick={() => setShowSubmit(true)}>
                  I'm done — Submit My Work →
                </button>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Google Drive / Canva / GitHub link *</label>
                    <input className="form-input" value={link} onChange={e => setLink(e.target.value)}
                      placeholder="https://drive.google.com/..." />
                    <span className="form-hint">Make sure the link is set to "Anyone with the link can view"</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Submission notes</label>
                    <textarea className="form-input form-textarea" value={note} onChange={e => setNote(e.target.value)}
                      placeholder="Describe what you delivered, any important notes for the reviewer..." style={{ minHeight:80 }}/>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-success" style={{ flex:1, padding:'13px' }}
                      disabled={busy || !link.trim()} onClick={() => action('submit', { note, link })}>
                      {busy ? 'Submitting…' : 'Submit for Review →'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowSubmit(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Student revision needed */}
          {user?.role === 'student' && isAssigned && task.status === 'revision_requested' && (
            <div>
              <div style={{ background:'var(--rose-lt)', border:'1.5px solid var(--rose)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'var(--rose)', marginBottom:4 }}>Revision requested</div>
                <p style={{ fontSize:13.5 }}>The senior reviewer has requested changes. Please update your work and resubmit.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Updated delivery link</label>
                <input className="form-input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..."/>
              </div>
              <div className="form-group">
                <label className="form-label">What did you change?</label>
                <textarea className="form-input form-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Describe your changes..."/>
              </div>
              <button className="btn btn-success btn-full" style={{ padding:'13px' }}
                disabled={busy} onClick={() => action('submit', { note, link })}>
                {busy ? 'Resubmitting…' : 'Resubmit for Review →'}
              </button>
            </div>
          )}

          {/* 5. Senior review panel */}
          {isSenior && task.status === 'submitted' && !isOwner && (
            <div>
              <div style={{ background:'var(--orange-lt)', border:'1.5px solid var(--orange)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'var(--orange-dk)', marginBottom:4 }}>⭐ Senior Review Required</div>
                <p style={{ fontSize:13.5 }}>Review the submission above and either approve it for client review or request changes.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Review feedback (required for revision request, optional for approval)</label>
                <textarea className="form-input form-textarea" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Describe what's good, what needs improvement, or why you're approving..."/>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-success" style={{ flex:1, padding:'12px' }}
                  disabled={busy} onClick={() => action('review', { action:'approve', note })}>
                  ✓ Approve — Send to Client
                </button>
                <button className="btn btn-danger" style={{ flex:1, padding:'12px' }}
                  disabled={busy || !note.trim()} onClick={() => action('review', { action:'revision', note })}>
                  Request Revision
                </button>
              </div>
            </div>
          )}

          {/* 6. Business approves — shows for under_review status */}
          {isOwner && task.status === 'under_review' && (
            <div>
              <div style={{ background:'var(--emerald-lt)', border:'1.5px solid var(--emerald)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                <div style={{ fontWeight:700, color:'var(--emerald)', marginBottom:4 }}>✓ Passed senior review — ready for your approval</div>
                <p style={{ fontSize:13.5 }}>A senior student has reviewed and approved this work. Please check the submission and approve to release payment.</p>
              </div>
              <button className="btn btn-success btn-full" style={{ padding:'15px', fontSize:16 }}
                disabled={busy} onClick={() => action('approve')}>
                {busy ? 'Processing…' : '✓ Approve & Release Payment →'}
              </button>
            </div>
          )}

          {/* 7. Completed */}
          {task.status === 'completed' && (
            <div style={{ textAlign:'center', padding:'20px', background:'var(--emerald-lt)', borderRadius:12, color:'#27500A', fontWeight:600, fontSize:16 }}>
              🎉 Task completed successfully — payment released!
            </div>
          )}

          {/* 8. Student sees submitted/under_review status */}
          {user?.role === 'student' && isAssigned && (task.status === 'submitted' || task.status === 'under_review') && (
            <div style={{ textAlign:'center', padding:'16px', background:'var(--blue-lt)', borderRadius:10, color:'var(--blue-dk)', fontSize:14 }}>
              {task.status === 'submitted' ? '⏳ Waiting for senior review...' : '⏳ Waiting for client approval — almost there!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
