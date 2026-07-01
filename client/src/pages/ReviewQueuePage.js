import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ReviewQueuePage() {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/review')
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth:740 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ width:40, height:40, background:'var(--orange)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⭐</div>
          <div>
            <h1 className="page-title" style={{ marginBottom:0 }}>Senior Review Queue</h1>
          </div>
        </div>
        <p className="page-sub">Tasks submitted by students waiting for your quality review</p>

        <div style={{ background:'var(--orange-lt)', border:'1px solid #FAC08A', borderRadius:10, padding:'12px 16px', marginBottom:24, fontSize:13.5 }}>
          <strong>Your role:</strong> Review submissions for quality before they reach the client. Approve good work or request revisions with specific feedback.
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize:40, marginBottom:12 }}>✨</div>
            <h3>No submissions waiting</h3>
            <p>All caught up! Check back when students submit work.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {tasks.map(task => {
              const wait = task.submittedAt
                ? Math.floor((Date.now() - new Date(task.submittedAt)) / 3600000)
                : 0;
              return (
                <Link key={task._id} to={`/tasks/${task._id}`} style={{ textDecoration:'none' }}>
                  <div className="card card-hover" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                        <span className="badge badge-blue">{task.category}</span>
                        <span className="badge badge-orange">Awaiting Review</span>
                        {wait > 2 && <span className="badge badge-rose">Waiting {wait}h</span>}
                      </div>
                      <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{task.title}</h3>
                      <div style={{ display:'flex', gap:'4px 16px', flexWrap:'wrap', fontSize:12.5, color:'var(--ink-3)' }}>
                        <span>👤 {task.assignedTo?.name} · {task.assignedTo?.college}</span>
                        <span>🏪 {task.postedBy?.businessName || task.postedBy?.name}</span>
                        <span>⏰ Due in {task.deadline}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800 }}>₹{task.budget}</div>
                      <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:8 }}>task value</div>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--blue)' }}>Review →</span>
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
}
