import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const COLORS = ['#5B4FE8', '#F5A623', '#00A878', '#E8445A', '#0EA5E9', '#8B5CF6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users?limit=20'),
      api.get('/admin/tasks?limit=20'),
      api.get('/admin/disputes'),
    ]).then(([s, u, t, d]) => {
      setStats(s.data);
      setUsers(u.data.users);
      setTasks(t.data.tasks);
      setDisputes(d.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    const { data } = await api.get(`/admin/users?search=${search}&role=${userRole}&limit=30`);
    setUsers(data.users);
  };

  const banUser = async (id, isBanned, reason = '') => {
    await api.patch(`/admin/users/${id}/ban`, { isBanned, banReason: reason });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned } : u));
  };

  const verifyUser = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: true } : u));
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/admin/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-sub">Platform overview and management</p>
          </div>
          <span className="badge badge-rose">Admin Access</span>
        </div>

        {/* KPI Row */}
        <div className="four-col" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total users', value: stats?.users?.total || 0, sub: `${stats?.users?.students} students` },
            { label: 'Total tasks', value: stats?.tasks?.total || 0, sub: `${stats?.tasks?.open} open` },
            { label: 'Revenue (commission)', value: `₹${(stats?.revenue?.commission || 0).toLocaleString('en-IN')}`, sub: 'All time' },
            { label: 'Open disputes', value: stats?.disputes?.open || 0, sub: 'Needs attention' },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value">{k.value}</div>
              <div className="stat-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'users', 'tasks', 'disputes'].map(t => (
            <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="two-col">
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Monthly task volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.monthlyTasks?.map(m => ({ name: `M${m._id.month}`, tasks: m.count })) || []}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#5B4FE8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Tasks by category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || []}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {(stats?.categoryStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <input className="form-input" style={{ width: 220 }} placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-input form-select" style={{ width: 150 }} value={userRole} onChange={e => setUserRole(e.target.value)}>
                <option value="">All roles</option>
                <option value="student">Students</option>
                <option value="business">Businesses</option>
                <option value="company">Companies</option>
              </select>
              <button className="btn btn-outline" onClick={fetchUsers}>Search</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={TS.table}>
                <thead>
                  <tr style={TS.thead}>
                    {['Name', 'Email', 'Role', 'Tasks', 'Status', 'Actions'].map(h => (
                      <th key={h} style={TS.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                      <td style={TS.td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        {u.isSenior && <span className="badge badge-amber" style={{ fontSize: 10 }}>Senior</span>}
                      </td>
                      <td style={TS.td}><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u.email}</span></td>
                      <td style={TS.td}><span className={`badge badge-${u.role === 'student' ? 'violet' : 'sky'}`}>{u.role}</span></td>
                      <td style={TS.td}><span style={{ fontSize: 13 }}>{u.tasksCompleted || 0}</span></td>
                      <td style={TS.td}>
                        {u.isBanned ? <span className="badge badge-rose">Banned</span> :
                          u.isVerified ? <span className="badge badge-emerald">Verified</span> :
                          <span className="badge badge-gray">Unverified</span>}
                      </td>
                      <td style={TS.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!u.isVerified && <button className="btn btn-outline btn-sm" onClick={() => verifyUser(u._id)}>Verify</button>}
                          {!u.isBanned
                            ? <button className="btn btn-danger btn-sm" onClick={() => { const r = prompt('Ban reason?'); if (r) banUser(u._id, true, r); }}>Ban</button>
                            : <button className="btn btn-outline btn-sm" onClick={() => banUser(u._id, false)}>Unban</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === 'tasks' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={TS.table}>
              <thead>
                <tr style={TS.thead}>
                  {['Title', 'Category', 'Budget', 'Status', 'Posted by', 'Actions'].map(h => <th key={h} style={TS.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={t._id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                    <td style={TS.td}><Link to={`/tasks/${t._id}`} style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</Link></td>
                    <td style={TS.td}><span className="badge badge-violet">{t.category}</span></td>
                    <td style={TS.td}><strong>₹{t.budget}</strong></td>
                    <td style={TS.td}><span className="chip" style={{ background: 'var(--violet-lt)', color: 'var(--violet-dk)', fontSize: 11 }}>{t.status}</span></td>
                    <td style={TS.td}><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t.postedBy?.businessName || t.postedBy?.name}</span></td>
                    <td style={TS.td}><button className="btn btn-danger btn-sm" onClick={() => deleteTask(t._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DISPUTES */}
        {tab === 'disputes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {disputes.length === 0 && <div className="empty-state"><h3>No disputes</h3><p>All clear!</p></div>}
            {disputes.map(d => (
              <div key={d._id} className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.taskId?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Raised by: {d.raisedBy?.name} · Against: {d.againstUser?.name}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{d.reason}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge badge-${d.status === 'open' ? 'rose' : 'emerald'}`}>{d.status}</span>
                  <Link to={`/disputes/${d._id}`}><button className="btn btn-outline btn-sm">Review</button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TS = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--surface)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' },
  thead: { background: 'var(--surface-2)' },
  th: { padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '10px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' },
};

export default AdminDashboard;
