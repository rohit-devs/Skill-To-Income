import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../utils/api';

const AnalyticsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/my').then(({ data }) => { setTasks(data); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const completed = tasks.filter(t => t.status === 'completed');
  const totalSpent = completed.reduce((s, t) => s + t.budget, 0);
  const avgBudget = completed.length ? Math.round(totalSpent / completed.length) : 0;
  const completionRate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  // Category breakdown
  const catBreakdown = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1; return acc;
  }, {});
  const catData = Object.entries(catBreakdown).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Monthly spending
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const spent = completed.filter(t => {
      const td = new Date(t.updatedAt);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    }).reduce((s, t) => s + t.budget, 0);
    return { label, spent };
  });

  // Status breakdown
  const statusCount = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">Business Analytics</h1>
        <p className="page-sub">Track your task performance, spending, and ROI</p>

        {/* KPIs */}
        <div className="four-col" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total tasks posted', value: tasks.length },
            { label: 'Tasks completed', value: completed.length, sub: `${completionRate}% completion rate` },
            { label: 'Total spent', value: `₹${totalSpent.toLocaleString('en-IN')}` },
            { label: 'Avg task cost', value: `₹${avgBudget}`, sub: 'vs ₹3,000+ at agency' },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value">{k.value}</div>
              {k.sub && <div className="stat-sub">{k.sub}</div>}
            </div>
          ))}
        </div>

        {/* ROI callout */}
        <div style={{ background: 'var(--emerald-lt)', border: '1px solid #9FE8D0', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#007055', marginBottom: 4 }}>💰 Your savings vs traditional agencies</div>
            <div style={{ fontSize: 13, color: '#007055' }}>Each task saved you approx ₹{Math.max(0, 3000 - avgBudget)} on average compared to agency pricing.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#007055' }}>₹{((3000 - avgBudget) * completed.length).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 12, color: '#007055' }}>Total estimated savings</div>
          </div>
        </div>

        <div className="two-col" style={{ marginBottom: 24 }}>
          {/* Monthly spending chart */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Monthly spending</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Spent']} />
                <Bar dataKey="spent" fill="#5B4FE8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Tasks by category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#00A878" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task status summary */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Task status breakdown</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(statusCount).map(([status, count]) => (
              <div key={status} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, textTransform: 'capitalize' }}>{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tasks table */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent tasks</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Task', 'Category', 'Budget', 'Status', 'Assigned to', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 10).map((t, i) => (
                  <tr key={t._id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 500 }}>{t.title}</td>
                    <td style={{ padding: '9px 12px' }}><span className="badge badge-violet">{t.category}</span></td>
                    <td style={{ padding: '9px 12px', fontWeight: 700 }}>₹{t.budget}</td>
                    <td style={{ padding: '9px 12px' }}><span className="chip" style={{ background: 'var(--violet-lt)', color: 'var(--violet-dk)', fontSize: 11 }}>{t.status}</span></td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink-3)', fontSize: 12 }}>{t.assignedTo?.name || '—'}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink-3)', fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
