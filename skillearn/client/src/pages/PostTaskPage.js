import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATS     = ['Design','Writing','Data','Social Media','Video','Coding','Research','Marketing','Other'];
const DEADLINES= ['6 hrs','12 hrs','24 hrs','48 hrs','72 hrs','1 week'];

// AI Chat Wizard Step
function AIChatWizard({ onDone }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Task Assistant. I'll help you build the perfect brief so students deliver exactly what you need.\n\nTo start, what is the short title or idea for your task?" }
  ]);
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const text = input;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setTyping(true);

    try {
      const { data } = await api.post('/ai/chat', { messages: newMsgs });
      let replyContent = data.reply || '';
      
      const jsonMatch = replyContent.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      let parsedDraft = null;
      if (jsonMatch) {
        try {
          parsedDraft = JSON.parse(jsonMatch[1]);
          replyContent = replyContent.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim();
          if (!replyContent) replyContent = "🎉 All done! I've collected all the requirements. Review the summary below and click 'Review & Edit Form' to proceed.";
        } catch (e) { console.error("Failed to parse AI JSON", e); }
      }

      setMessages([...newMsgs, { role: 'assistant', content: replyContent }]);
      if (parsedDraft) setDraft(parsedDraft);
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: "Sorry, I'm having trouble generating a response. Please try again." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)', background:'var(--s-low)', borderRadius:20, overflow:'hidden', border:'1px solid var(--outline-v)' }}>
      <div style={{ padding:'14px 20px', background:'var(--s-mid)', display:'flex', gap:12, alignItems:'center', borderBottom:'1px solid var(--outline-v)' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#fff', flexShrink:0 }}>AI</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>AI Brief Assistant</div>
          <div style={{ fontSize:11, color:'var(--on-sv)' }}>{draft ? 'Complete' : 'Collecting task details...'}</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', gap:8, alignItems:'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:10, color:'#fff', flexShrink:0, marginTop:2 }}>AI</div>
            )}
            <div style={{ maxWidth:'78%', padding:'11px 14px', borderRadius:14, fontSize:13.5, lineHeight:1.6, wordBreak:'break-word', background: m.role==='user' ? 'var(--p-container)' : 'var(--s-mid)', color: m.role==='user' ? '#fff' : 'var(--on-surface)', borderBottomLeftRadius: m.role==='assistant' ? 4 : 14, borderBottomRightRadius: m.role==='user' ? 4 : 14 }}>
              {m.content.split('\n').map((line, j) => {
                if (line.startsWith('**') && line.includes('**', 2)) {
                   return <span key={j}><strong style={{ color: m.role==='user'?'#fff':'var(--primary)' }}>{line.replace(/\*\*/g, '')}</strong><br/></span>
                }
                return <span key={j}>{line}{j<m.content.split('\n').length-1 && <br/>}</span>
              })}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:10, color:'#fff' }}>AI</div>
            <div style={{ padding:'11px 16px', borderRadius:14, borderBottomLeftRadius:4, background:'var(--s-mid)', color:'var(--primary)', letterSpacing:2 }}>•••</div>
          </div>
        )}

        {draft && (
          <div style={{ background:'rgba(195,192,255,.1)', border:'1.5px solid var(--primary)', borderRadius:12, padding:'16px', marginTop:8 }}>
            <h4 style={{ fontSize:14, fontWeight:800, marginBottom:10, color:'var(--primary)' }}>Task Brief Summary</h4>
            <div style={{ fontSize:13, display:'grid', gap:8, color:'var(--on-surface)' }}>
              <div><strong>Title:</strong> {draft.title}</div>
              <div><strong>Category:</strong> {draft.category}</div>
              <div><strong>Budget:</strong> ₹{draft.budget}</div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:14 }} onClick={() => onDone(draft)}>
              Review & Edit Form →
            </button>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--outline-v)', display:'flex', gap:8 }}>
        <input 
          className="form-input" 
          style={{ flex:1 }} 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
          placeholder={draft ? "Brief complete." : "Type your answer..."} 
          disabled={typing || !!draft}
        />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={typing || !input.trim() || !!draft}>
          <span className="material-symbols-outlined" style={{ fontSize:18 }}>send</span>
        </button>
      </div>
    </div>
  );
}

// Form Step
function TaskForm({ initialData }) {
  const navigate = useNavigate();
  const [form, setForm]     = useState(initialData || { title:'', description:'', category:'Design', budget:'', deadline:'24 hrs', revisions:1, priority:false });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [posted, setPosted] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [testGenerated, setTestGenerated] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.budget || Number(form.budget) < 50) { setError('Budget must be at least ₹50'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', { ...form, budget:Number(form.budget), revisions:Number(form.revisions) });
      setPosted(data);
    } catch (err) { setError(err.response?.data?.message||'Failed to post task'); }
    finally { setLoading(false); }
  };

  const generateTest = async () => {
    if (!posted?._id) return;
    setGenerating(true);
    try { await api.post('/ai/generate-test', { taskId:posted._id }); setTestGenerated(true); }
    catch (err) { window.alert(err.response?.data?.message || 'Failed to generate AI quiz'); }
    finally { setGenerating(false); }
  };

  const netPay = form.budget ? Math.round(Number(form.budget) * 0.88) : 0;

  if (posted) return (
    <div style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
      <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Task posted!</h2>
      <p style={{ color:'var(--on-sv)', fontSize:14, marginBottom:24 }}>"{posted.title}" is now live. Students are being matched.</p>
      {!testGenerated ? (
        <div style={{ background:'rgba(195,192,255,.1)', border:'1.5px solid var(--outline-v)', borderRadius:14, padding:'20px 24px', marginBottom:24, textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:11 }}>AI</div>
            <div style={{ fontWeight:700, fontSize:15 }}>Generate an AI skill test?</div>
          </div>
          <p style={{ fontSize:13.5, color:'var(--on-sv)', lineHeight:1.7, marginBottom:16 }}>I can auto-create 4 task-specific questions to evaluate students before they start. Helps seniors review and gives you a better-qualified student.</p>
          <button className="btn btn-primary btn-full" disabled={generating} onClick={generateTest}>
            {generating ? '⏳ Generating...' : '✨ Yes, generate AI skill test'}
          </button>
          <button className="btn btn-ghost btn-full" style={{ marginTop:8, fontSize:13 }} onClick={() => navigate(`/tasks/${posted._id}`)}>Skip — view task directly</button>
        </div>
      ) : (
        <div style={{ background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.2)', borderRadius:12, padding:'16px', marginBottom:24, textAlign:'left' }}>
          <div style={{ fontWeight:700, color:'#4ADE80', marginBottom:6 }}>✓ AI test generated!</div>
          <p style={{ fontSize:13.5, color:'rgba(74,222,128,.8)', lineHeight:1.6 }}>Students who apply for your task will answer 4 AI-generated questions. You'll safely review their application.</p>
        </div>
      )}
      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/tasks/${posted._id}`)}>View Task →</button>
        <button className="btn btn-outline" onClick={() => navigate('/my-tasks')}>My Tasks</button>
      </div>
    </div>
  );

  return (
    <div className="card">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Task title *</label>
          <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g. Design a Diwali sale poster" required maxLength={80}/>
          <span className="form-hint">{form.title.length}/80 characters</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input form-select" value={form.category} onChange={set('category')}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <select className="form-input form-select" value={form.deadline} onChange={set('deadline')}>
              {DEADLINES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Task description & requirements *</label>
          <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} placeholder="Describe exactly what you need — format, size, style, tone, reference examples..." style={{ minHeight: 140 }} required/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Budget (₹) *</label>
            <input className="form-input" type="number" min="50" max="5000" value={form.budget} onChange={set('budget')} placeholder="350" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Revisions</label>
            <select className="form-input form-select" value={form.revisions} onChange={e => setForm(f => ({ ...f, revisions:Number(e.target.value) }))}>
              {[1,2,3].map(n => <option key={n} value={n}>{n} revision{n>1?'s':''}</option>)}
            </select>
          </div>
        </div>
        {form.budget && (
          <div style={{ background:'var(--s-mid)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', gap:20, flexWrap:'wrap' }}>
            <div><div style={{ fontSize:11, color:'var(--on-sv)', textTransform:'uppercase', letterSpacing:'.06em' }}>You pay</div><div style={{ fontSize:20, fontWeight:800 }}>₹{form.budget}</div></div>
            <div style={{ fontSize:18, color:'var(--outline)', alignSelf:'flex-end' }}>→</div>
            <div><div style={{ fontSize:11, color:'var(--on-sv)', textTransform:'uppercase', letterSpacing:'.06em' }}>Student receives</div><div style={{ fontSize:20, fontWeight:800, color:'#4ADE80' }}>₹{netPay}</div><div style={{ fontSize:11, color:'var(--on-sv)' }}>after 12% fee</div></div>
          </div>
        )}
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, cursor:'pointer', marginBottom:18 }}>
          <input type="checkbox" checked={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.checked }))} style={{ accentColor:'var(--primary)' }}/>
          <span>⭐ Feature this task (shown at top of feed)</span>
        </label>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Posting...' : 'Post Task →'}
        </button>
      </form>
    </div>
  );
}

export default function PostTaskPage() {
  const [mode, setMode] = useState('choose');
  const [aiData, setAiData] = useState(null);

  const handleAIDone = (data) => {
    if (data) setAiData(data);
    setMode('form');
  };

  if (mode === 'choose') return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:640, paddingTop:36 }}>
        <div style={{ marginBottom:28 }}>
          <h1 className="page-title">Post a micro-task</h1>
          <p className="page-sub">Choose how you want to create your task brief</p>
        </div>
        <div className="two-col" style={{ gap:16 }}>
          <div className="card card-hover" style={{ cursor:'pointer', border:'2px solid var(--primary)', textAlign:'center', padding:28 }} onClick={() => setMode('ai')}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontWeight:800, fontSize:16, color:'#fff' }}>AI</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>AI Chat Assistant</div>
            <p style={{ fontSize:13, color:'var(--on-sv)', lineHeight:1.6, marginBottom:14 }}>An interactive step-by-step chat wizard that collects requirements and auto-fills the perfect brief.</p>
            <span className="chip chip-saffron">Recommended ✓</span>
          </div>
          <div className="card card-hover" style={{ cursor:'pointer', textAlign:'center', padding:28 }} onClick={() => setMode('form')}>
            <div style={{ width:56, height:56, borderRadius:14, background:'var(--s-mid)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:24 }}>📝</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>Fill form directly</div>
            <p style={{ fontSize:13, color:'var(--on-sv)', lineHeight:1.6, marginBottom:14 }}>Fill in task details manually. Good if you know exactly what you need.</p>
            <span className="chip chip-outline">Manual entry</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === 'ai') return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:640, paddingTop:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:800 }}>AI Task Wizard</h2>
            <p style={{ fontSize:13, color:'var(--on-sv)' }}>Follow the 4 guided steps below</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode('choose')}>← Back</button>
          </div>
        </div>
        <AIChatWizard onDone={handleAIDone}/>
      </div>
    </div>
  );

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:600, paddingTop:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom:4 }}>Task details</h1>
            <p style={{ fontSize:13, color:'var(--on-sv)' }}>Review or edit your parsed task information</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode('choose')}>← Back</button>
        </div>
        <TaskForm initialData={aiData}/>
      </div>
    </div>
  );
}
