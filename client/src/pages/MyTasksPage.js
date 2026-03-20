import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_MAP = {
  open: { label: 'Open', color: '#10B981', bg: '#EAF3DE' },
  assigned: { label: 'In Progress', color: '#3B30CC', bg: '#EEEDFE' },
  submitted: { label: 'Submitted', color: '#F59E0B', bg: '#FAEEDA' },
  under_review: { label: 'Client Review', color: '#3B30CC', bg: '#EEEDFE' },
  revision_requested: { label: 'Revision', color: '#EF4444', bg: '#FCEBEB' },
  completed: { label: 'Completed', color: '#10B981', bg: '#EAF3DE' },
};

const MyTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const { data } = await api.get('/tasks/my');
        setTasks(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMyTasks();
  }, []);

  const activeTasks = tasks.filter((t) => !['completed'].includes(t.status));
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const shown = tab === 'active' ? activeTasks : completedTasks;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{user?.role === 'student' ? 'My Tasks' : 'My Posted Tasks'}</h1>
            <p style={styles.sub}>{tasks.length} total tasks</p>
          </div>
          {(user?.role === 'business' || user?.role === 'company') && (
            <Link to="/post-task"><button className="btn btn-primary">+ Post New Task</button></Link>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'active' ? styles.tabActive : {}) }}
            onClick={() => setTab('active')}>
            Active ({activeTasks.length})
          </button>
          <button style={{ ...styles.tab, ...(tab === 'completed' ? styles.tabActive : {}) }}
            onClick={() => setTab('completed')}>
            Completed ({completedTasks.length})
          </button>
        </div>

        {shown.length === 0 ? (
          <div className="empty-state">
            <h3>{tab === 'active' ? 'No active tasks' : 'No completed tasks yet'}</h3>
            <p style={{ marginTop: 8, marginBottom: 20 }}>
              {user?.role === 'student' ? 'Browse available tasks and accept one to get started.' : 'Post your first task to get started.'}
            </p>
            <Link to={user?.role === 'student' ? '/tasks' : '/post-task'}>
              <button className="btn btn-primary">{user?.role === 'student' ? 'Browse Tasks' : 'Post a Task'}</button>
            </Link>
          </div>
        ) : (
          <div style={styles.list}>
            {shown.map((task) => {
              const s = STATUS_MAP[task.status] || STATUS_MAP.open;
              const other = user?.role === 'student' ? task.postedBy : task.assignedTo;
              return (
                <Link key={task._id} to={`/tasks/${task._id}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.taskRow}>
                    <div style={styles.taskLeft}>
                      <div style={styles.taskTopRow}>
                        <span className="badge badge-primary">{task.category}</span>
                        <span style={{ ...styles.statusPill, background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <div style={styles.taskMeta}>
                        {other && <span>{user?.role === 'student' ? `🏪 ${other.businessName || other.name}` : `🎓 ${other.name}`}</span>}
                        <span>⏰ Due in {task.deadline}</span>
                        <span>📅 Posted {new Date(task.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <div style={styles.taskRight}>
                      <div style={styles.taskPay}>₹{user?.role === 'student' ? task.studentPay : task.budget}</div>
                      <div style={styles.taskPayLabel}>{user?.role === 'student' ? 'your earnings' : 'task budget'}</div>
                      <span style={styles.viewLink}>View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700 },
  sub: { fontSize: 14, color: '#6B6A64', marginTop: 4 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #E4E2DC' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: '#6B6A64', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#3B30CC', borderBottomColor: '#3B30CC' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  taskRow: { background: '#fff', border: '1px solid #E4E2DC', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.12s' },
  taskLeft: { flex: 1 },
  taskTopRow: { display: 'flex', gap: 8, marginBottom: 8 },
  statusPill: { padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500 },
  taskTitle: { fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 6 },
  taskMeta: { display: 'flex', gap: '4px 16px', flexWrap: 'wrap', fontSize: 12.5, color: '#6B6A64' },
  taskRight: { textAlign: 'right', flexShrink: 0 },
  taskPay: { fontSize: 20, fontWeight: 700, color: '#1A1A18' },
  taskPayLabel: { fontSize: 11, color: '#6B6A64', marginBottom: 8 },
  viewLink: { fontSize: 12.5, fontWeight: 500, color: '#3B30CC' },
};

export default MyTasksPage;
