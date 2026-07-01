import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { Badge, Button, EmptyState, Skeleton } from '../../components/ui';
import api from '../../utils/api';

const MOCK_PENDING = [
  { _id: 'm1', taskId: { _id: 't1', title: 'React State Management Test', category: 'Web Dev' }, studentId: { name: 'Alice Chen', college: 'MIT' }, questions: [1,2,3], submittedAt: new Date().toISOString() }
];

const MOCK_REVIEWQ = [
  { _id: 'm2', title: 'Implement Login Form', category: 'Frontend', budget: 1500, assignedTo: { name: 'Bob Smith' }, submissionNote: 'Finished the form using formik as requested!', submissionLink: 'https://github.com/demo' }
];

export default function SeniorHome() {
  const [pending, setPending]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [fullTest, setFullTest] = useState(null);
  const [tab, setTab]           = useState('tests');
  const [reviewQ, setReviewQ]   = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [note, setNote]         = useState('');
  const [score, setScore]       = useState(70);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/ai/pending-reviews').catch(() => ({ data: [] })),
      api.get('/tasks?status=submitted').catch(() => ({ data: [] })),
    ]).then(([ai, tasks]) => {
      if (!active) return;
      setPending(ai.data || []);
      setReviewQ(tasks.data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const openTest = async (test) => {
    try {
      const { data } = await api.get(`/ai/test/${test.taskId?._id || test.taskId}/responses`);
      setFullTest(data.test);
      setSelected(test);
      setNote('');
      setScore(70);
    } catch {
      alert('Could not load test');
    }
  };

  const displayPending = pending.length > 0 ? pending : MOCK_PENDING;
  const displayReviewQ = reviewQ.length > 0 ? reviewQ : MOCK_REVIEWQ;

  const submitReview = async (passed) => {
    if (!note.trim()) { alert('Please add review notes'); return; }
    setSubmitting(true);
    try {
      await api.patch(`/ai/test/${fullTest.taskId}/review`, { note, finalScore: score, passed });
      setMsg(`✓ Marked as ${passed ? 'Passed' : 'Failed'}`);
      setPending(prev => prev.filter(t => String(t.taskId?._id||t.taskId) !== String(fullTest.taskId)));
      setFullTest(null); 
      setSelected(null);
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const approveTask = async (taskId, action, reviewNote) => {
    try {
      await api.patch(`/tasks/${taskId}/review`, { action, note: reviewNote });
      setReviewQ(prev => prev.filter(t => t._id !== taskId));
      setReviewNotes(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setMsg(`✓ Task ${action === 'approve' ? 'approved and sent to client' : 'revision requested'}`);
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating task');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Senior Review Dashboard">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-12 w-1/3 rounded-lg" />
          <Skeleton className="h-64 rounded-xl w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Senior Review Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-1">
            Review Queue
          </h2>
          <p className="text-sm text-on-sv">Review peer submissions and AI tests</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {displayPending.length > 0 && <Badge variant="warning">{displayPending.length} AI tests</Badge>}
          {displayReviewQ.length > 0 && <Badge variant="primary">{displayReviewQ.length} submissions</Badge>}
        </div>
      </div>

      {msg && (
        <div className="mb-6 flex items-start gap-2.5 bg-success/10 border border-success/20 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-success text-[18px] mt-0.5 shrink-0 icon-fill">check_circle</span>
          <p className="text-[13.5px] text-success font-bold">{msg}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="AI Tests Pending" value={pending.length} icon="pending_actions" variant="warning" />
        <StatCard title="Submissions" value={reviewQ.length} icon="rate_review" variant="primary" />
        <StatCard title="Reviews Done" value={12} icon="task_alt" variant="success" subtitle="This week" />
        <StatCard title="My Rating" value="4.9" icon="star" variant="secondary" subtitle="From peers" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-v/30 mb-6 custom-scrollbar overflow-x-auto">
        <button 
          className={`px-5 py-3 text-[14px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab === 'tests' ? 'border-primary text-primary' : 'border-transparent text-on-sv hover:text-on-surface'}`}
          onClick={() => setTab('tests')}
        >
          AI Test Reviews ({displayPending.length})
        </button>
        <button 
          className={`px-5 py-3 text-[14px] font-bold border-b-2 whitespace-nowrap transition-colors ${tab === 'submissions' ? 'border-primary text-primary' : 'border-transparent text-on-sv hover:text-on-surface'}`}
          onClick={() => setTab('submissions')}
        >
          Task Submissions ({displayReviewQ.length})
        </button>
      </div>

      {/* ── AI TESTS TAB ── */}
      {tab === 'tests' && (
        <div className={`grid grid-cols-1 ${fullTest ? 'lg:grid-cols-[340px_1fr]' : ''} gap-6`}>
          {/* List */}
          <div className="flex flex-col gap-3">
            {displayPending.length === 0 && !fullTest ? (
              <div className="bg-s-low rounded-2xl border border-dashed border-outline-v/40">
                <EmptyState icon="task_alt" title="All caught up!" description="No AI test responses waiting for review right now." />
              </div>
            ) : displayPending.map(t => (
              <div 
                key={t._id} 
                className={`bg-s-low rounded-xl p-4 cursor-pointer border transition-all duration-200 hover:-translate-y-0.5 ${selected?._id === t._id ? 'border-primary shadow-lg shadow-primary/10' : 'border-outline-v/30 hover:border-outline-v/50 hover:shadow-md'}`}
                onClick={() => openTest(t)}
              >
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge variant="primary" size="sm">{t.taskId?.category}</Badge>
                  <Badge variant="warning" size="sm">Awaiting review</Badge>
                </div>
                <div className="font-extrabold text-[14px] mb-1.5 text-on-surface leading-snug">{t.taskId?.title}</div>
                <div className="text-[12.5px] text-on-sv flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  {t.studentId?.name} • {t.studentId?.college}
                </div>
                <div className="text-[11px] text-on-sv/70 font-semibold">
                  {t.questions?.length || '?'} questions • {t.submittedAt ? new Date(t.submittedAt).toLocaleString('en-IN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : 'Just now'}
                </div>
              </div>
            ))}
          </div>

          {/* Review Panel */}
          {fullTest && (
            <div className="flex flex-col gap-6">
              <div className="bg-s-low rounded-2xl p-6 border border-outline-v/30 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[18px] font-extrabold mb-1 text-on-surface">{fullTest.testTitle}</h3>
                    <div className="text-[13px] text-on-sv">
                      {fullTest.studentId?.name} • {fullTest.studentId?.college}
                      {fullTest.studentId?.city && ` • ${fullTest.studentId.city}`}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFullTest(null); setSelected(null); }}>
                    Close
                  </Button>
                </div>

                {/* Q&A */}
                <div className="flex flex-col gap-5">
                  {fullTest.questions?.map((q, qi) => {
                    const ans = fullTest.answers?.[qi];
                    return (
                      <div key={qi} className="border border-outline-v/30 rounded-xl overflow-hidden bg-bg">
                        <div className="bg-s-mid px-4 py-2.5 flex justify-between items-center border-b border-outline-v/20">
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-black text-on-sv uppercase tracking-wider">Q{qi+1}</span>
                            <Badge variant={q.type === 'mcq' ? 'primary' : q.type === 'short' ? 'success' : 'secondary'} size="sm">
                              {q.type}
                            </Badge>
                          </div>
                          <span className="text-[12px] font-bold text-on-sv">{q.points} pts</span>
                        </div>
                        <div className="p-5">
                          <p className="text-[15px] font-bold mb-4 leading-relaxed text-on-surface">{q.question}</p>
                          
                          {q.type === 'mcq' && q.options && (
                            <div className="flex flex-col gap-2 mb-4">
                              {q.options.map((opt, oi) => {
                                const isSelected = ans?.mcqChoice === oi;
                                return (
                                  <div key={oi} className={`px-3.5 py-2.5 rounded-lg text-[13.5px] flex items-start gap-2.5 border transition-colors ${isSelected ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm' : 'bg-s-mid border-outline-v/10 text-on-sv'}`}>
                                    <span className={`material-symbols-outlined text-[18px] pt-0.5 ${isSelected ? 'icon-fill' : ''}`}>
                                      {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {(q.type === 'short' || q.type === 'practical') && (
                            <div className={`bg-s-mid rounded-lg p-4 text-[14px] leading-relaxed mb-4 border ${ans?.answer ? 'border-outline-v/30 text-on-surface' : 'border-dashed border-outline-v/40 text-on-sv italic'}`}>
                              {ans?.answer || 'No answer provided'}
                            </div>
                          )}

                          {q.correctHint && (
                            <div className="bg-success/10 rounded-lg p-3 text-[12.5px] text-success border border-success/20 flex gap-2">
                              <span className="material-symbols-outlined text-[16px] shrink-0">lightbulb</span>
                              <div><strong className="font-extrabold mr-1">AI hint:</strong> {q.correctHint}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review form */}
              <div className="bg-s-low rounded-2xl p-6 border border-outline-v/30 shadow-md">
                <h3 className="text-[16px] font-extrabold mb-5 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_document</span>
                  Submit Your Review
                </h3>
                
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-on-sv">Score calculation</label>
                    <span className={`font-black text-[24px] leading-none ${score >= 60 ? 'text-success' : 'text-error'}`}>{score}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={score} onChange={e => setScore(Number(e.target.value))} 
                    className="w-full mb-2 accent-primary" 
                  />
                  <p className="text-[11px] font-semibold text-on-sv text-right">
                    {score >= 60 ? 'Pass (60% or above)' : 'Fail (Below 60%)'}
                  </p>
                </div>

                <div className="mb-6 flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-on-sv">Review feedback (Required)</label>
                  <textarea 
                    className="w-full bg-s-mid border border-outline-v/30 rounded-xl p-4 text-[14px] text-on-surface min-h-[120px] outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar" 
                    value={note} onChange={e => setNote(e.target.value)} 
                    placeholder="Give constructive feedback on what they did well and what needs improvement..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="success" fullWidth disabled={submitting || !note.trim()} onClick={() => submitReview(true)} leftIcon="check_circle">
                    Mark as Passed
                  </Button>
                  <Button variant="danger" fullWidth disabled={submitting || !note.trim()} onClick={() => submitReview(false)} leftIcon="cancel">
                    Mark as Failed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS TAB ── */}
      {tab === 'submissions' && (
        <div className="flex flex-col gap-5">
          {displayReviewQ.length === 0 ? (
            <div className="bg-s-low rounded-2xl border border-dashed border-outline-v/40">
              <EmptyState icon="done_all" title="No submissions pending" description="All task submissions have been reviewed." />
            </div>
          ) : displayReviewQ.map(task => (
            <div key={task._id} className="bg-s-low rounded-2xl p-6 border border-outline-v/30 shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Badge variant="primary">{task.category}</Badge>
                  <Badge variant="warning">Awaiting Senior Review</Badge>
                </div>
                <h3 className="text-[18px] font-extrabold mb-1.5 text-on-surface line-clamp-2">{task.title}</h3>
                <div className="text-[13.5px] text-on-sv mb-4 font-semibold">
                  By <span className="text-on-surface">{task.assignedTo?.name}</span> • Budget <span className="text-success">₹{task.budget}</span>
                </div>
                
                {task.submissionNote && (
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 mb-5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-primary mb-2">Student Submission</div>
                    <p className="text-[14px] text-on-surface leading-relaxed mb-3 whitespace-pre-wrap">{task.submissionNote}</p>
                    {task.submissionLink && (
                      <a href={task.submissionLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:text-primary-fixed bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-outline-v/20">
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        View Project Link
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-[320px] shrink-0 bg-bg rounded-xl p-5 border border-outline-v/30">
                <h4 className="text-[13px] font-extrabold text-on-surface mb-3 uppercase tracking-wider">Your Verdict</h4>
                <div className="flex flex-col gap-1.5 mb-4">
                  <textarea 
                    className="w-full bg-s-mid border border-outline-v/30 rounded-xl p-3 text-[13.5px] text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all min-h-[90px] custom-scrollbar" 
                    value={reviewNotes[task._id] || ''} 
                    onChange={e => setReviewNotes(prev => ({ ...prev, [task._id]: e.target.value }))} 
                    placeholder="Feedback for the student..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="success" size="sm" onClick={() => approveTask(task._id, 'approve', reviewNotes[task._id] || '')} leftIcon="done_all">
                    Approve (Send to client)
                  </Button>
                  <Button variant="danger" size="sm" disabled={!(reviewNotes[task._id] || '').trim()} onClick={() => approveTask(task._id, 'revision', reviewNotes[task._id] || '')} leftIcon="edit">
                    Request Revision
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
