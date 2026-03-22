import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_MAP = {
  open:               { label:'Open',           color:'#00A878', bg:'#EAF3DE' },
  assigned:           { label:'In Progress',    color:'#5B4FE8', bg:'#EEEDFE' },
  submitted:          { label:'Submitted',      color:'#F5A623', bg:'#FAEEDA' },
  under_review:       { label:'Client Review',  color:'#0EA5E9', bg:'#E0F5FE' },
  revision_requested: { label:'Revision',       color:'#E8445A', bg:'#FDEAED' },
  completed:          { label:'Completed',      color:'#00A878', bg:'#EAF3DE' },
};

const MyTasksPage = () => {
  const { user }           = useAuth();
  const [tasks, setTasks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]      = useState('active');

  useEffect(() => {
    api.get('/tasks/my')
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active    = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completed = tasks.filter(t => t.status === 'completed');
  const shown     = tab === 'active' ? active : completed;

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{display:'flex',justifyContent:'space-between',
          alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h1 className="page-title">
              {user?.role === 'student' ? 'My Tasks' : 'My Posted Tasks'}
            </h1>
            <p className="page-sub">{tasks.length} total tasks</p>
          </div>
          {(user?.role === 'business' || user?.role === 'company') && (
            <Link to="/post-task">
              <button className="btn btn-primary">+ Post New Task</button>
            </Link>
          )}
        </div>

        <div className="tabs">
          <button className={`tab-item ${tab==='active'?'active':''}`}
            onClick={() => setTab('active')}>
            Active ({active.length})
          </button>
          <button className={`tab-item ${tab==='completed'?'active':''}`}
            onClick={() => setTab('completed')}>
            Completed ({completed.length})
          </button>
        </div>

        {shown.length === 0 ? (
          <div className="empty-state">
            <h3>{tab==='active' ? 'No active tasks' : 'No completed tasks yet'}</h3>
            <p style={{marginTop:8,marginBottom:20}}>
              {user?.role==='student'
                ? 'Browse available tasks and accept one to get started.'
                : 'Post your first task to get started.'}
            </p>
            <Link to={user?.role==='student' ? '/tasks' : '/post-task'}>
              <button className="btn btn-primary">
                {user?.role==='student' ? 'Browse Tasks' : 'Post a Task'}
              </button>
            </Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {shown.map(task => {
              const s   = STATUS_MAP[task.status] || STATUS_MAP.open;
              const pay = task.studentPay || task.studentEarnings || Math.round((task.budget||0)*0.88);
              const other = user?.role==='student'
                ? task.postedBy
                : task.assignedTo;
              return (
                <Link key={task._id} to={`/tasks/${task._id}`}
                  style={{textDecoration:'none'}}>
                  <div className="card card-hover"
                    style={{display:'flex',justifyContent:'space-between',
                      alignItems:'center',gap:16,flexWrap:'wrap'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                        <span className="badge badge-violet">{task.category}</span>
                        <span style={{padding:'3px 10px',borderRadius:999,fontSize:11.5,
                          fontWeight:600,background:s.bg,color:s.color}}>{s.label}</span>
                      </div>
                      <h3 style={{fontSize:15,fontWeight:700,marginBottom:6}}>{task.title}</h3>
                      <div style={{display:'flex',gap:'4px 16px',flexWrap:'wrap',
                        fontSize:12.5,color:'var(--ink-3)'}}>
                        {other && (
                          <span>{user?.role==='student'
                            ? `🏪 ${other.businessName||other.name}`
                            : `🎓 ${other.name}`}</span>
                        )}
                        <span>⏰ Due in {task.deadline}</span>
                        <span>📅 {new Date(task.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:20,fontWeight:800}}>
                        ₹{user?.role==='student' ? pay : task.budget}
                      </div>
                      <div style={{fontSize:11,color:'var(--ink-3)',marginBottom:8}}>
                        {user?.role==='student' ? 'your earnings' : 'task budget'}
                      </div>
                      <span style={{fontSize:12.5,fontWeight:600,color:'var(--violet)'}}>
                        View →
                      </span>
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

export default MyTasksPage;
