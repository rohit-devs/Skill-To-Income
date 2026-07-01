import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { Badge, Button, Card } from '../../components/ui';
import api from '../../utils/api';

const COLORS = ['#5B4FE8', '#F5A623', '#00A878', '#E8445A', '#0EA5E9', '#8B5CF6'];

const MOCK_USERS = [
  { _id: 'u1', name: 'Alice Chen', email: 'alice@student.demo', role: 'student', tasksCompleted: 14, isVerified: true, isSenior: true },
  { _id: 'u2', name: 'Tech Solutions Inc', email: 'hello@techinc.demo', role: 'business', tasksCompleted: 0, isVerified: true },
  { _id: 'u3', name: 'Bob Smith', email: 'bob@student.demo', role: 'student', tasksCompleted: 2, isVerified: false }
];
const MOCK_TASKS = [
  { _id: 't1', title: 'React UI Migration', category: 'Web Development', budget: 5000, status: 'open', postedBy: { businessName: 'Tech Solutions Inc' } },
  { _id: 't2', title: 'Python Web Scraper', category: 'Data Science', budget: 2500, status: 'assigned', postedBy: { name: 'Startup Labs' } }
];
const MOCK_DISPUTES = [
  { _id: 'd1', taskId: { title: 'SEO Optimization' }, raisedBy: { name: 'Alice Chen' }, againstUser: { name: 'SEO Client' }, reason: 'Client rejecting valid work', status: 'open' }
];

export default function AdminHome() {
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

  if (loading) {
    return (
      <DashboardLayout title="Admin Console">
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
      </DashboardLayout>
    );
  }

  const displayUsers = users.length > 0 ? users : MOCK_USERS;
  const displayTasks = tasks.length > 0 ? tasks : MOCK_TASKS;
  const displayDisputes = disputes.length > 0 ? disputes : MOCK_DISPUTES;

  const kpis = [
    { label: 'Total users', value: stats?.users?.total || 142, sub: `${stats?.users?.students || 95} students` },
    { label: 'Total tasks', value: stats?.tasks?.total || 38, sub: `${stats?.tasks?.open || 12} open` },
    { label: 'Revenue (commission)', value: `₹${(stats?.revenue?.commission || 45000).toLocaleString('en-IN')}`, sub: 'All time' },
    { label: 'Open disputes', value: stats?.disputes?.open || displayDisputes.length, sub: 'Needs attention' },
  ];

  return (
    <DashboardLayout title="Admin Console">
      <div className="flex flex-col gap-6">

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <Card key={k.label} className="p-5 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-on-sv uppercase tracking-widest">{k.label}</span>
              <span className="text-2xl font-extrabold text-on-surface">{k.value}</span>
              <span className="text-[10px] font-bold text-on-sv">{k.sub}</span>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-v/20 pb-0 shrink-0 overflow-x-auto custom-scrollbar">
          {['overview', 'users', 'tasks', 'disputes'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-on-sv hover:text-on-surface'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-[14px] font-extrabold text-on-surface mb-6">Monthly task volume</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats?.monthlyTasks?.map(m => ({ name: `M${m._id.month}`, tasks: m.count })) || []}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--on-sv)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--on-sv)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} />
                  <Bar dataKey="tasks" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-[14px] font-extrabold text-on-surface mb-6">Tasks by category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || []}
                    cx="50%" cy="50%" outerRadius={90} innerRadius={60} dataKey="value" stroke="var(--surface)" strokeWidth={3}
                  >
                    {(stats?.categoryStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="w-full sm:w-64 px-4 py-2.5 bg-s-low border border-outline-v/30 rounded-xl text-[13px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search name or email..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
              <select
                className="px-4 py-2.5 bg-s-low border border-outline-v/30 rounded-xl text-[13px] text-on-surface focus:border-primary outline-none"
                value={userRole} onChange={e => setUserRole(e.target.value)}
              >
                <option value="">All roles</option>
                <option value="student">Students</option>
                <option value="business">Businesses</option>
                <option value="company">Companies</option>
              </select>
              <Button variant="secondary" onClick={fetchUsers}>Search</Button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-outline-v/20">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-s-low text-[11px] font-black uppercase tracking-widest text-on-sv border-b border-outline-v/20">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Stats</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface text-[13px]">
                  {displayUsers.map((u) => (
                    <tr key={u._id} className="border-b border-outline-v/10 last:border-none hover:bg-s-low transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-on-surface">{u.name}</div>
                        {u.isSenior && <div className="text-[9px] font-black text-warning uppercase mt-0.5">Senior</div>}
                      </td>
                      <td className="px-4 py-3 text-on-sv">{u.email}</td>
                      <td className="px-4 py-3"><Badge variant={u.role === 'student' ? 'primary' : 'warning'}>{u.role}</Badge></td>
                      <td className="px-4 py-3 font-semibold text-on-surface">{u.tasksCompleted || 0}</td>
                      <td className="px-4 py-3">
                        {u.isBanned ? <Badge variant="danger">Banned</Badge> :
                          u.isVerified ? <Badge variant="success">Verified</Badge> :
                          <Badge variant="secondary">Unverified</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!u.isVerified && <Button variant="secondary" size="sm" onClick={() => verifyUser(u._id)}>Verify</Button>}
                          {!u.isBanned
                            ? <Button variant="danger" size="sm" onClick={() => { const r = prompt('Ban reason?'); if (r) banUser(u._id, true, r); }}>Ban</Button>
                            : <Button variant="secondary" size="sm" onClick={() => banUser(u._id, false)}>Unban</Button>}
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
          <div className="overflow-x-auto rounded-xl border border-outline-v/20">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-s-low text-[11px] font-black uppercase tracking-widest text-on-sv border-b border-outline-v/20">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface text-[13px]">
                {displayTasks.map((t) => (
                  <tr key={t._id} className="border-b border-outline-v/10 last:border-none hover:bg-s-low transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/tasks/${t._id}`} className="font-bold text-primary hover:underline line-clamp-1">{t.title}</Link>
                      <div className="text-[11px] text-on-sv mt-0.5">{t.postedBy?.businessName || t.postedBy?.name}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-on-surface">₹{t.budget}</td>
                    <td className="px-4 py-3"><Badge variant="primary">{t.status}</Badge></td>
                    <td className="px-4 py-3"><Button variant="danger" size="sm" onClick={() => deleteTask(t._id)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DISPUTES */}
        {tab === 'disputes' && (
          <div className="flex flex-col gap-4">
            {displayDisputes.length === 0 && (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-4xl text-on-sv/30 mb-2">task_alt</span>
                <p className="text-[13px] font-bold text-on-sv">No active disputes.</p>
              </div>
            )}
            {displayDisputes.map(d => (
              <Card key={d._id} className="p-4 flex sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                  <div className="text-[14px] font-bold text-on-surface">{d.taskId?.title}</div>
                  <div className="text-[11px] text-on-sv mt-0.5 mb-2">Raised by {d.raisedBy?.name} vs. {d.againstUser?.name}</div>
                  <p className="text-[12px] text-on-surface bg-s-low p-2 rounded-lg">{d.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={d.status === 'open' ? 'danger' : 'success'}>{d.status}</Badge>
                  <Link to={`/disputes/${d._id}`}><Button variant="secondary" size="sm">Review</Button></Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
