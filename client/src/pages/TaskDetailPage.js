import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_LABELS = {
  open: { label: 'Open', color: '#10B981', bg: '#EAF3DE' },
  assigned: { label: 'In Progress', color: '#3B30CC', bg: '#EEEDFE' },
  submitted: { label: 'Submitted', color: '#F59E0B', bg: '#FAEEDA' },
  under_review: { label: 'Under Review', color: '#3B30CC', bg: '#EEEDFE' },
  revision_requested: { label: 'Revision Needed', color: '#EF4444', bg: '#FCEBEB' },
  completed: { label: 'Completed', color: '#10B981', bg: '#EAF3DE' },
};

const TaskDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data);
      } catch { navigate('/tasks'); }
      finally { setLoading(false); }
    };
    fetchTask();
  }, [id, navigate]);

  const doAction = async (endpoint, body = {}) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/tasks/${id}/${endpoint}`, body);
      setTask(data.task);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!task) return null;

  const status = STATUS_LABELS[task.status] || STATUS_LABELS.open;
  const isOwner = user && String(task.postedBy?._id) === String(user._id);
  const isAssigned = user && String(task.assignedTo?._id) === String(user._id);
  const isSeniorOrAdmin = user?.isSenior || user?.role === 'company';
  const businessName = task.postedBy?.businessName || task.postedBy?.name;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Back to tasks</button>

        <div className="card">
          {/* Header */}
          <div style={styles.taskHeader}>
            <div style={styles.badgeRow}>
              <span className="badge badge-primary">{task.category}</span>
              <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>{status.label}</span>
              {task.priority && <span className="badge badge-accent">⭐ Featured</span>}
            </div>
            <h1 style={styles.title}>{task.title}</h1>
            <div style={styles.metaRow}>
              <span>🏪 {businessName}</span>
              {task.postedBy?.city && <span>📍 {task.postedBy.city}</span>}
              <span>⏰ Due in {task.deadline}</span>
              {task.postedBy?.ratingCount > 0 && (
                <span>⭐ {task.postedBy.rating?.toFixed(1)} ({task.postedBy.ratingCount} reviews)</span>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* Pay block */}
          <div style={styles.payBlock}>
            <div>
              <div style={styles.payLabel}>Task pay</div>
              <div style={styles.payVal}>₹{task.budget}</div>
            </div>
            <div style={styles.payArrow}>→</div>
            <div>
              <div style={styles.payLabel}>You receive</div>
              <div style={{ ...styles.payVal, color: '#10B981' }}>₹{task.studentPay}</div>
              <div style={styles.payNote}>after {(task.commission * 100).toFixed(0)}% fee</div>
            </div>
            <div style={styles.payMeta}>
              <div>🔁 {task.revisions} revision{task.revisions > 1 ? 's' : ''} included</div>
              <div>👥 Senior-reviewed before delivery</div>
            </div>
          </div>

          <hr className="divider" />

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Task brief</h3>
            <p style={styles.desc}>{task.description}</p>
          </div>

          {/* Submission note */}
          {task.submissionNote && (
            <div style={styles.noteBox}>
              <strong>Student's submission note:</strong> {task.submissionNote}
            </div>
          )}
          {task.reviewNote && (
            <div style={{ ...styles.noteBox, background: '#FAEEDA' }}>
              <strong>Review feedback:</strong> {task.reviewNote}
            </div>
          )}

          <hr className="divider" />

          {/* Messages */}
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* ACTION BUTTONS */}

          {/* Student: accept open task */}
          {user?.role === 'student' && task.status === 'open' && (
            <button className="btn btn-primary btn-full" disabled={actionLoading}
              onClick={() => doAction('accept')} style={styles.bigBtn}>
              {actionLoading ? 'Accepting…' : `Accept & Start — Earn ₹${task.studentPay} →`}
            </button>
          )}

          {/* Student: submit work */}
          {user?.role === 'student' && isAssigned && (task.status === 'assigned' || task.status === 'revision_requested') && (
            <div>
              <div className="form-group">
                <label className="form-label">Submission note / delivery link</label>
                <textarea className="form-input form-textarea" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add your Google Drive / Canva link, or describe what you've delivered…" />
              </div>
              <button className="btn btn-success btn-full" disabled={actionLoading}
                onClick={() => doAction('submit', { note })} style={styles.bigBtn}>
                {actionLoading ? 'Submitting…' : 'Submit Work for Review →'}
              </button>
            </div>
          )}

          {/* Senior: review submitted work */}
          {isSeniorOrAdmin && task.status === 'submitted' && !isOwner && (
            <div>
              <div className="form-group">
                <label className="form-label">Review feedback for student</label>
                <textarea className="form-input form-textarea" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Be specific and constructive…" />
              </div>
              <div style={styles.reviewBtns}>
                <button className="btn btn-success" disabled={actionLoading}
                  onClick={() => doAction('review', { action: 'approve', note })}>
                  {actionLoading ? '…' : '✓ Approve & Send to Client'}
                </button>
                <button className="btn btn-danger" disabled={actionLoading}
                  onClick={() => doAction('review', { action: 'revision', note })}>
                  Request Revision
                </button>
              </div>
            </div>
          )}

          {/* Business/Company: final approval */}
          {isOwner && task.status === 'under_review' && (
            <div>
              <button className="btn btn-success btn-full" disabled={actionLoading}
                onClick={() => doAction('approve')} style={styles.bigBtn}>
                {actionLoading ? 'Processing…' : '✓ Approve & Release Payment →'}
              </button>
            </div>
          )}

          {/* Completed */}
          {task.status === 'completed' && (
            <div style={styles.completedBadge}>🎉 Task completed — payment released</div>
          )}

          {/* Not logged in */}
          {!user && task.status === 'open' && (
            <div style={styles.loginCta}>
              <a href="/login"><button className="btn btn-primary btn-full" style={styles.bigBtn}>Login to Accept This Task →</button></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  back: { background: 'none', border: 'none', color: '#6B6A64', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: '4px 0' },
  taskHeader: { marginBottom: 4 },
  badgeRow: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  statusBadge: { padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 12 },
  metaRow: { display: 'flex', gap: '6px 18px', flexWrap: 'wrap', fontSize: 13.5, color: '#6B6A64' },
  payBlock: { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '4px 0' },
  payLabel: { fontSize: 12, color: '#6B6A64', marginBottom: 4 },
  payVal: { fontSize: 26, fontWeight: 700 },
  payNote: { fontSize: 11, color: '#6B6A64' },
  payArrow: { fontSize: 22, color: '#6B6A64' },
  payMeta: { marginLeft: 'auto', fontSize: 13, color: '#6B6A64', display: 'flex', flexDirection: 'column', gap: 4 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#6B6A64', textTransform: 'uppercase', letterSpacing: '.04em' },
  desc: { fontSize: 15, lineHeight: 1.7, color: '#1A1A18' },
  noteBox: { background: '#EAF3DE', borderRadius: 8, padding: '12px 14px', fontSize: 13.5, marginBottom: 12, lineHeight: 1.6 },
  bigBtn: { padding: '14px', fontSize: 15, marginTop: 8 },
  reviewBtns: { display: 'flex', gap: 10, marginTop: 8 },
  completedBadge: { textAlign: 'center', padding: '16px', background: '#EAF3DE', borderRadius: 10, color: '#27500A', fontWeight: 500 },
  loginCta: { marginTop: 8 },
};

export default TaskDetailPage;
