import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Design', 'Writing', 'Data', 'Social Media', 'Video', 'Coding', 'Research', 'Other'];
const DEADLINES = ['6 hrs', '12 hrs', '24 hrs', '48 hrs', '72 hrs', '1 week'];

const PostTaskPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'Design', budget: '', deadline: '24 hrs', revisions: 1, priority: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.budget || form.budget < 50) { setError('Budget must be at least ₹50'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', { ...form, budget: Number(form.budget) });
      navigate(`/tasks/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post task');
    } finally {
      setLoading(false);
    }
  };

  const netPay = form.budget ? Math.round(Number(form.budget) * 0.88) : 0;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={styles.title}>Post a micro-task</h1>
        <p style={styles.sub}>Describe your task clearly. Students will see it in their feed within minutes.</p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Task title *</label>
              <input className="form-input" value={form.title} onChange={set('title')}
                placeholder="e.g. Design a Diwali sale poster" required maxLength={80} />
              <span style={styles.charCount}>{form.title.length}/80</span>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Task description *</label>
              <textarea className="form-input form-textarea" value={form.description}
                onChange={set('description')}
                placeholder="Describe exactly what you need. Include size, format, brand name, color preferences, reference links…"
                required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Budget (₹) *</label>
                <input className="form-input" type="number" min="50" value={form.budget}
                  onChange={set('budget')} placeholder="350" required />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline *</label>
                <select className="form-input form-select" value={form.deadline} onChange={set('deadline')}>
                  {DEADLINES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Revisions allowed</label>
              <select className="form-input form-select" value={form.revisions}
                onChange={(e) => setForm((f) => ({ ...f, revisions: Number(e.target.value) }))}>
                {[1, 2, 3].map((n) => <option key={n} value={n}>{n} revision{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <div style={styles.priorityRow}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.checked }))} />
                <span>⭐ Feature this task (priority listing) — gets seen first</span>
              </label>
            </div>

            {/* Fee preview */}
            {form.budget && (
              <div style={styles.feeBox}>
                <div style={styles.feeRow}>
                  <span>You pay</span><strong>₹{form.budget}</strong>
                </div>
                <div style={styles.feeRow}>
                  <span>Platform fee (12%)</span><span style={{ color: '#EF4444' }}>−₹{Math.round(form.budget * 0.12)}</span>
                </div>
                <div style={{ ...styles.feeRow, borderTop: '1px solid #E4E2DC', paddingTop: 8, marginTop: 4 }}>
                  <span>Student receives</span><strong style={{ color: '#10B981' }}>₹{netPay}</strong>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ padding: '14px', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Posting…' : 'Post Task →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 26, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B6A64', marginBottom: 24 },
  charCount: { fontSize: 11, color: '#6B6A64', alignSelf: 'flex-end' },
  priorityRow: { marginBottom: 16 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' },
  feeBox: { background: '#F8F7F4', border: '1px solid #E4E2DC', borderRadius: 10, padding: '14px 16px', marginBottom: 8 },
  feeRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' },
};

export default PostTaskPage;
