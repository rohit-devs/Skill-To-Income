import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Design','Writing','Data','Social Media','Video','Research','Coding','Marketing','Other'];
const DEADLINES  = ['6 hrs','12 hrs','24 hrs','48 hrs','72 hrs','1 week'];

const PostTaskPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', description:'', category:'Design',
    budget:'', deadline:'24 hrs', revisions:1, priority:false,
  });
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.budget || form.budget < 50) { setError('Budget must be at least ₹50'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', {
        ...form,
        budget:   Number(form.budget),
        deadline: String(form.deadline),
        revisions: Number(form.revisions),
      });
      navigate(`/tasks/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post task');
    } finally { setLoading(false); }
  };

  const netPay = form.budget ? Math.round(Number(form.budget) * 0.88) : 0;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:600 }}>
        <h1 className="page-title">Post a micro-task</h1>
        <p className="page-sub">Describe your task clearly. Students will see it within minutes.</p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Task title *</label>
              <input className="form-input" value={form.title} onChange={set('title')}
                placeholder="e.g. Design a Diwali sale poster" required maxLength={80}/>
              <span style={{fontSize:11,color:'var(--ink-3)',alignSelf:'flex-end'}}>{form.title.length}/80</span>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Task description *</label>
              <textarea className="form-input form-textarea" value={form.description}
                onChange={set('description')}
                placeholder="Describe exactly what you need — format, size, style, references..."
                required/>
            </div>

            <div className="two-col">
              <div className="form-group">
                <label className="form-label">Budget (₹) *</label>
                <input className="form-input" type="number" min="50" value={form.budget}
                  onChange={set('budget')} placeholder="350" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline *</label>
                <select className="form-input form-select" value={form.deadline} onChange={set('deadline')}>
                  {DEADLINES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Revisions allowed</label>
              <select className="form-input form-select" value={form.revisions}
                onChange={e => setForm(f => ({ ...f, revisions: Number(e.target.value) }))}>
                {[1,2,3].map(n => <option key={n} value={n}>{n} revision{n>1?'s':''}</option>)}
              </select>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}>
                <input type="checkbox" checked={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.checked }))}/>
                <span>⭐ Feature this task (shown at top of feed)</span>
              </label>
            </div>

            {form.budget && (
              <div style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'4px 0'}}>
                  <span>You pay</span><strong>₹{form.budget}</strong>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'4px 0'}}>
                  <span>Platform fee (12%)</span>
                  <span style={{color:'var(--rose)'}}>−₹{Math.round(form.budget*0.12)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'8px 0 4px',borderTop:'1px solid var(--border)',marginTop:4}}>
                  <span>Student receives</span>
                  <strong style={{color:'var(--emerald)'}}>₹{netPay}</strong>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Posting...' : 'Post Task →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostTaskPage;
