import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AITestReviewPage = () => {
  const [pendingTests, setPendingTests] = useState([]);
  const [selected, setSelected]        = useState(null);
  const [reviewNote, setReviewNote]    = useState('');
  const [score, setScore]              = useState(70);
  const [submitting, setSubmitting]    = useState(false);
  const [loading, setLoading]          = useState(true);
  const [msg, setMsg]                  = useState('');

  useEffect(() => {
    api.get('/ai/pending-reviews')
      .then(({ data }) => { setPendingTests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openReview = async (test) => {
    try {
      const { data } = await api.get(`/ai/test/${test.taskId?._id || test.taskId}/responses`);
      setSelected(data.test);
      setReviewNote('');
      setScore(70);
    } catch (err) {
      alert('Could not load test responses');
    }
  };

  const submitReview = async (passed) => {
    if (!reviewNote.trim()) { alert('Please add review notes before submitting'); return; }
    setSubmitting(true);
    try {
      await api.patch(`/ai/test/${selected.taskId}/review`, {
        note: reviewNote, finalScore: score, passed,
      });
      setMsg(`Test marked as ${passed ? 'PASSED' : 'FAILED'} successfully`);
      setPendingTests(prev => prev.filter(t => String(t.taskId?._id || t.taskId) !== String(selected.taskId)));
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const TYPE_COLOR = { mcq: 'var(--blue-lt)', short: 'var(--emerald-lt)', practical: 'var(--orange-lt)' };
  const TYPE_TEXT  = { mcq: 'var(--blue-dk)', short: '#007055', practical: 'var(--orange-dk)' };

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">AI Test Review Queue</h1>
            <p className="page-sub">Review student answers to AI-generated task tests</p>
          </div>
          <span style={{ background: 'var(--orange-lt)', color: 'var(--orange-dk)', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {pendingTests.length} pending
          </span>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div style={{ display: selected ? 'grid' : 'block', gridTemplateColumns: '300px 1fr', gap: 20 }}>

          {/* Test list */}
          <div>
            {pendingTests.length === 0 && !selected && (
              <div className="empty-state">
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <h3>All caught up!</h3>
                <p>No test responses waiting for review.</p>
              </div>
            )}
            {pendingTests.map(t => (
              <div key={t._id} className="card card-hover"
                style={{ marginBottom: 12, cursor: 'pointer', border: selected?._id === t._id ? '2px solid var(--blue)' : '1px solid var(--border)' }}
                onClick={() => openReview(t)}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span className="badge badge-blue">{t.taskId?.category}</span>
                  <span className="badge badge-orange">Awaiting review</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.taskId?.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 4 }}>
                  👤 {t.studentId?.name} · {t.studentId?.college}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  📅 Submitted {t.submittedAt ? new Date(t.submittedAt).toLocaleString('en-IN') : 'just now'}
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: 'var(--ink-3)' }}>
                  {t.questions?.length || '?'} questions · {t.timeTakenTotal ? `${Math.round(t.timeTakenTotal / 60)} mins` : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Review panel */}
          {selected && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{selected.testTitle}</h3>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                      Student: <strong>{selected.studentId?.name}</strong>
                      {selected.studentId?.college && ` · ${selected.studentId.college}`}
                      {selected.studentId?.city && ` · ${selected.studentId.city}`}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back</button>
                </div>

                {/* Student profile */}
                {selected.studentId && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {selected.studentId.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 3 }}>{selected.studentId.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {selected.studentId.tasksCompleted || 0} tasks completed · {selected.studentId.rating || 0}★ rating
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                        {(selected.studentId.skills || []).map(s => (
                          <span key={s} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: 'var(--blue-lt)', color: 'var(--blue-dk)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Link to={`/portfolio/${selected.studentId._id}`}>
                        <button className="btn btn-outline btn-sm">View Profile</button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Q&A */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selected.questions?.map((q, qi) => {
                    const ans = selected.answers?.[qi];
                    return (
                      <div key={qi} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ background: 'var(--surface-2)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>Q{qi + 1}</span>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: TYPE_COLOR[q.type], color: TYPE_TEXT[q.type], fontWeight: 600 }}>
                            {q.type.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 'auto' }}>{q.points} pts</span>
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{q.question}</p>

                          {q.type === 'mcq' && q.options && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                              {q.options.map((opt, oi) => (
                                <div key={oi} style={{
                                  padding: '6px 10px', borderRadius: 6, fontSize: 13,
                                  background: ans?.mcqChoice === oi ? 'var(--blue-lt)' : 'var(--surface-2)',
                                  color: ans?.mcqChoice === oi ? 'var(--blue-dk)' : 'var(--ink-3)',
                                  border: `1px solid ${ans?.mcqChoice === oi ? 'var(--blue)' : 'var(--border)'}`,
                                  fontWeight: ans?.mcqChoice === oi ? 600 : 400,
                                }}>
                                  {ans?.mcqChoice === oi ? '● ' : '○ '}{opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {(q.type === 'short' || q.type === 'practical') && ans?.answer && (
                            <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.6, marginBottom: 10, color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                              {ans.answer}
                            </div>
                          )}
                          {(q.type === 'short' || q.type === 'practical') && !ans?.answer && (
                            <div style={{ fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic', marginBottom: 10 }}>No answer provided</div>
                          )}

                          {/* Hint for reviewer */}
                          {q.correctHint && (
                            <div style={{ background: 'var(--emerald-lt)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#007055', border: '1px solid #9FE8D0' }}>
                              <strong>AI hint:</strong> {q.correctHint}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review form */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Submit Your Review</h3>

                <div className="form-group">
                  <label className="form-label">Score (0–100)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="range" min="0" max="100" value={score}
                      onChange={e => setScore(Number(e.target.value))} style={{ flex: 1 }}/>
                    <span style={{ fontWeight: 800, fontSize: 20, color: score >= 60 ? 'var(--emerald)' : 'var(--rose)', minWidth: 40 }}>{score}%</span>
                  </div>
                  <span className="form-hint">{score >= 60 ? 'Pass threshold (60% or above)' : 'Below pass threshold'}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Review notes for student *</label>
                  <textarea className="form-input form-textarea" value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    placeholder="Explain your scoring decision. Give specific feedback on strong and weak answers. This helps the student improve."/>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-success" style={{ flex: 1 }}
                    disabled={submitting || !reviewNote.trim()} onClick={() => submitReview(true)}>
                    ✓ Mark as Passed
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }}
                    disabled={submitting || !reviewNote.trim()} onClick={() => submitReview(false)}>
                    ✗ Mark as Failed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITestReviewPage;
