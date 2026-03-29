import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ChatWindow from '../components/ChatWindow';
import { Modal } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../utils/api';

const STATUS = {
  open: { label: 'Open', color: '#00A878', bg: '#EAF3DE' },
  assigned: { label: 'In Progress', color: 'var(--blue)', bg: 'var(--blue-lt)' },
  submitted: { label: 'Submitted for Review', color: '#F5A623', bg: '#FAEEDA' },
  under_review: { label: 'Awaiting Client Approval', color: 'var(--blue)', bg: 'var(--blue-lt)' },
  revision_requested: { label: 'Revision Requested', color: 'var(--rose)', bg: 'var(--rose-lt)' },
  completed: { label: 'Completed', color: '#00A878', bg: '#EAF3DE' },
  disputed: { label: 'Disputed', color: 'var(--rose)', bg: 'var(--rose-lt)' },
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const [bids, setBids] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);

  // Apply Modal state
  const [showApply, setShowApply] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');

  // Dispute Modal state
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Non-delivery');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeErr, setDisputeErr] = useState('');

  useEffect(() => {
    const loadTaskData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data);

        // If owner, fetch applications
        if (user && (String(data.postedBy?._id) === String(user._id) || user.role === 'admin')) {
          const res = await api.get(`/applications/task/${id}`);
          setBids(res.data);
        }

      } catch {
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTaskData();
  }, [id, navigate, user]);

  useEffect(() => {
    const loadQuizStatus = async () => {
      if (!task?.hasAITest || user?.role !== 'student') {
        setQuizStatus(null);
        return;
      }

      try {
        const { data } = await api.get(`/ai/test/${id}`);
        const attempt = data.test?.attempt || null;
        setQuizStatus({
          exists: true,
          passed: Boolean(attempt?.passed),
          percentage: attempt?.percentage ?? null,
          submittedAt: attempt?.submittedAt ?? null,
          passThreshold: data.test?.passThreshold || 70,
        });
      } catch {
        setQuizStatus({ exists: false, passed: false, percentage: null, submittedAt: null, passThreshold: 70 });
      }
    };

    loadQuizStatus();
  }, [id, task?.hasAITest, user?.role]);

  const action = async (endpoint, body = {}) => {
    setBusy(true);
    setErr('');
    setMsg('');

    try {
      const { data } = await api.patch(`/tasks/${id}/${endpoint}`, body);
      setTask(data.task);
      setMsg(data.message);
      setShowSubmit(false);
    } catch (error) {
      setErr(getApiErrorMessage(error, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (applyMsg.length < 10) {
      setErr('Please provide a meaningful pitch (at least 10 characters).');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post('/applications/apply', { taskId: id, message: applyMsg });
      setMsg(data.message);
      setShowApply(false);
      setApplyMsg('');
      // Force task re-fetch to see applicant tracking if we want, or just wait.
      setTask({ ...task, applicants: [...(task.applicants || []), user?._id] });
    } catch (error) {
      setErr(getApiErrorMessage(error, 'Failed to submit application.'));
    } finally {
      setBusy(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (disputeDesc.length < 10) {
      setDisputeErr('Please provide a detailed description (at least 10 characters).');
      return;
    }
    setBusy(true);
    setDisputeErr('');
    try {
      await api.post('/disputes', {
        taskId: id,
        reason: disputeReason,
        description: disputeDesc
      });
      setMsg('Dispute raised successfully. Admins will review the case.');
      setShowDispute(false);
      setTask({ ...task, status: 'disputed' });
    } catch (error) {
      setDisputeErr(getApiErrorMessage(error, 'Failed to raise dispute.'));
    } finally {
      setBusy(false);
    }
  };

  const handleHire = async (appId) => {
    if (!window.confirm('Are you sure you want to hire this student? All other applications will be rejected.')) return;
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.patch(`/applications/${appId}/accept`);
      setMsg(data.message);
      setTask(data.task);
      setBids(bids.map(b => b._id === appId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }));
    } catch (error) {
      setErr(getApiErrorMessage(error, 'Failed to hire student.'));
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErr('Choose a file before uploading');
      return null;
    }
    setUploading(true);
    setErr('');
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/uploads/submission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFile(data);
      setLink(data.url);
      setMsg('File uploaded successfully. You can submit now.');
      return data;
    } catch (error) {
      setErr(getApiErrorMessage(error, 'File upload failed. Please try again.'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!task) return null;

  const st = STATUS[task.status] || STATUS.open;
  const isOwner = user && String(task.postedBy?._id) === String(user?._id);
  const isAssigned = user && String(task.assignedTo?._id) === String(user?._id);
  const isSenior = user?.isSenior || user?.role === 'admin';
  const hasApplied = task.applicants?.includes(user?._id) || false;
  
  const canAccessChat = Boolean(
    user &&
    task.assignedTo?._id &&
    (isOwner || isAssigned) &&
    ['assigned', 'submitted', 'under_review', 'revision_requested', 'completed'].includes(task.status)
  );
  
  const bizName = task.postedBy?.businessName || task.postedBy?.name;
  const studentPay = task.studentPay || Math.round((task.budget || 0) * 0.88);
  const commission = Math.round((task.budget || 0) * 0.12);
  const mustPassQuiz = user?.role === 'student' && task.status === 'open' && task.hasAITest;
  const canAcceptTask = !mustPassQuiz || Boolean(quizStatus?.passed);

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 740 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          Back to tasks
        </button>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{task.category}</span>
            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
            {task.priority && <span className="badge badge-orange">Featured</span>}
            {task.hasAITest && <span className="badge badge-blue">AI Quiz Required</span>}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>{task.title}</h1>

          <div style={{ display: 'flex', gap: '6px 20px', flexWrap: 'wrap', fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 24 }}>
            {bizName && <span>{bizName}</span>}
            {task.postedBy?.city && <span>{task.postedBy.city}</span>}
            <span>Due in {task.deadline}</span>
            {task.postedBy?.ratingCount > 0 && <span>{task.postedBy.rating?.toFixed(1)} ({task.postedBy.ratingCount} reviews)</span>}
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 3 }}>Task budget</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>Rs {task.budget}</div>
            </div>
            <div style={{ fontSize: 20, color: 'var(--ink-4)' }}>to</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 3 }}>You receive</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--emerald)' }}>Rs {studentPay}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>after 12% platform fee (Rs {commission})</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Task Brief</div>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--ink-2)' }}>{task.description}</p>
          </div>

          {task.hasAITest && task.status === 'open' && (
            <div style={{ background: 'var(--blue-lt)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--blue)' }}>
              <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>Pre-acceptance AI quiz</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Students must pass a short AI-generated MCQ quiz with at least {quizStatus?.passThreshold || 70}% before they can apply.
              </div>
              {quizStatus?.submittedAt && (
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8 }}>
                  Your latest score: <strong>{quizStatus.percentage}%</strong> {quizStatus.passed ? '(passed)' : '(not passed)'}
                </div>
              )}
            </div>
          )}

          {task.assignedTo && (
            <div style={{ background: 'var(--blue-lt)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
              <strong>Assigned to:</strong> {task.assignedTo.name}
              {task.assignedTo.college && ` · ${task.assignedTo.college}`}
            </div>
          )}

          <hr className="divider" />

          {msg && <div className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</div>}
          {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>{err}</div>}

          {!user && task.status === 'open' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 14 }}>Sign in to unlock and apply for this task</p>
              <Link to="/login"><button className="btn btn-primary btn-lg">Login to Continue</button></Link>
            </div>
          )}

           {/* BIDDING ENGINE: Student Apply Mechanics */}
           {user?.role === 'student' && task.status === 'open' && !hasApplied && (
            <div style={{ marginBottom: 16 }}>
              {task.hasAITest && (
                 <button className="btn btn-outline btn-full" style={{ padding: '14px', fontSize: 15, marginBottom: 10 }} onClick={() => navigate(`/tasks/${task._id}/test`)}>
                   {quizStatus?.submittedAt ? 'Retake Quiz to Improve Score' : 'Take Quiz to Unlock Task'}
                 </button>
              )}
              {canAcceptTask ? (
                <button className="btn btn-primary btn-full" style={{ padding: '15px', fontSize: 16 }} onClick={() => setShowApply(true)}>
                  Apply for Task - Earn Rs {studentPay}
                </button>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
                  Pass the quiz first to unlock task application.
                </div>
              )}
            </div>
          )}

          {user?.role === 'student' && hasApplied && task.status === 'open' && (
            <div className="alert alert-info">
              You have already applied for this task. The business will review your pitch!
            </div>
          )}

           {/* BIDDING ENGINE: Application Review UI (Business/Owner) */}
           {isOwner && task.status === 'open' && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Applicant Queue ({bids.length})</h2>
              {bids.length === 0 ? (
                <div style={{ background: 'var(--surface-container-low)', padding: 30, borderRadius: 12, textAlign: 'center', border: '1px dashed var(--outline-v)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--on-sv)', marginBottom: 12 }}>group</span>
                  <p style={{ fontSize: 14, color: 'var(--on-sv)' }}>No applications yet. When students apply, they will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {bids.map((bid) => (
                    <div key={bid._id} style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--blue-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--blue)' }}>
                            {bid.studentId?.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{bid.studentId?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{bid.studentId?.college || bid.studentId?.city} • {bid.studentId?.tasksCompleted || 0} tasks completed</div>
                          </div>
                        </div>
                        {bid.status === 'pending' && (
                          <button className="btn btn-success btn-sm" disabled={busy} onClick={() => handleHire(bid._id)}>Hire Student</button>
                        )}
                        {bid.status === 'accepted' && (
                          <span className="badge badge-emerald">Hired</span>
                        )}
                        {bid.status === 'rejected' && (
                          <span className="badge" style={{ background: '#F1F5F9', color: '#64748B' }}>Rejected</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, background: 'var(--surface-container-low)', padding: 12, borderRadius: 8, fontStyle: 'italic', color: 'var(--ink-2)' }}>
                        "{bid.message}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lifecycle & Submissions Workflow */}
          {user?.role === 'student' && isAssigned && task.status === 'assigned' && (
            <div>
              <div style={{ background: 'var(--blue-lt)', border: '1.5px solid var(--blue)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>Task accepted and assigned to you</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  Complete the work and submit your delivery link below. Deadline: <strong>{task.deadline}</strong>.
                </p>
              </div>
              {!showSubmit ? (
                <button className="btn btn-orange btn-full" style={{ padding: '14px', fontSize: 15 }} onClick={() => setShowSubmit(true)}>
                  I&apos;m done - Submit My Work
                </button>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Upload delivery file</label>
                    <input
                      className="form-input"
                      type="file"
                      onChange={(event) => {
                        setFile(event.target.files?.[0] || null);
                        setUploadedFile(null);
                      }}
                    />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline" type="button" disabled={uploading || busy || !file} onClick={handleUpload}>
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </button>
                      {uploadedFile?.url && (
                        <a href={uploadedFile.url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                          View uploaded file
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Google Drive / Canva / GitHub link</label>
                    <input className="form-input" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://drive.google.com/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Submission notes</label>
                    <textarea className="form-input form-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Describe what you delivered and any notes for the reviewer..." style={{ minHeight: 80 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-success" style={{ flex: 1, padding: '13px' }} disabled={busy || uploading || !link.trim()} onClick={() => action('submit', { note, link })}>
                      {busy ? 'Submitting...' : 'Submit for Review'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowSubmit(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {canAccessChat && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Task Chat</h3>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ color: 'var(--rose)', borderColor: 'var(--rose)', padding: '6px 12px' }}
                onClick={() => setShowDispute(true)}
              >
                ⚠️ Raise Dispute
              </button>
            </div>
          )}
          {canAccessChat && <ChatWindow taskId={task._id} />}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for Task">
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
            Write a short pitch to the business explaining why you are perfect for this task. Keep it professional.
          </p>
          <textarea
            className="form-input form-textarea"
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
            placeholder="Hi, I have experience in..."
            style={{ width: '100%', minHeight: 120, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={busy || applyMsg.length < 10}>
            {busy ? 'Submitting...' : 'Submit Pitch'}
          </button>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal open={showDispute} onClose={() => setShowDispute(false)} title="Raise Dispute">
        {disputeErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>{disputeErr}</div>}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Reason</label>
          <select 
            className="form-input form-select" 
            value={disputeReason} 
            onChange={(e) => setDisputeReason(e.target.value)}
          >
            <option>Non-delivery</option>
            <option>Poor Quality</option>
            <option>Unresponsive</option>
            <option>Payment Issue</option>
            <option>Other</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Description</label>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>
            Please clearly describe the issue. Admins will review this and the chat history.
          </p>
          <textarea
            className="form-input form-textarea"
            value={disputeDesc}
            onChange={(e) => setDisputeDesc(e.target.value)}
            placeholder="Explain what went wrong in detail..."
            style={{ width: '100%', minHeight: 120, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setShowDispute(false)}>Cancel</button>
          <button className="btn" style={{ background: 'var(--rose)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 600 }} onClick={handleRaiseDispute} disabled={busy || disputeDesc.length < 10}>
            {busy ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
