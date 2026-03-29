import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const MILESTONES = [
  { tasks:3,  bonus:100, label:'First sprint',      icon:'rocket_launch' },
  { tasks:10, bonus:250, label:'Consistent earner', icon:'local_fire_department' },
  { tasks:25, bonus:500, label:'Power student',     icon:'workspace_premium' },
];

export default function EarningsPage() {
  const { user }  = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const canvasRef = useRef(null);

  useEffect(() => {
    api.get('/users/earnings').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Draw mini bar chart
  useEffect(() => {
    if (!canvasRef.current || !data?.weekly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const weekly = data.weekly;
    const max = Math.max(...weekly.map(d => d.amount), 1);
    ctx.clearRect(0, 0, w, h);
    const barW = (w - 40) / weekly.length - 8;
    weekly.forEach((d, i) => {
      const barH = Math.max((d.amount / max) * (h - 40), 4);
      const x = 20 + i * ((w - 40) / weekly.length);
      const y = h - 24 - barH;
      ctx.fillStyle = d.amount > 0 ? 'rgba(195,192,255,.7)' : 'rgba(70,69,85,.4)';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(199,196,216,.6)';
      ctx.font = '10px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW/2, h - 4);
    });
  }, [data]);

  if (loading) return <div style={{ display:'flex' }}><Sidebar open={sideOpen} onClose={() => setSideOpen(false)}/><main className="with-sidebar"><div className="spinner-wrap"><div className="spinner"/></div></main></div>;

  const total     = data?.totalEarned || 0;
  const tasks     = data?.completedTasks || [];
  const done      = user?.tasksCompleted || 0;
  const thisMonth = tasks.filter(t => { const d=new Date(t.updatedAt), now=new Date(); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); }).reduce((s,t) => s+(t.studentPay||0), 0);

  return (
    <div style={{ display:'flex', background:'var(--bg)', minHeight:'100vh' }}>
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)}/>
      <main className="with-sidebar" style={{ minHeight:'100vh' }}>
        <div className="topbar">
          <button onClick={() => setSideOpen(true)} className="hide-desktop btn btn-ghost btn-sm"><span className="material-symbols-outlined">menu</span></button>
          <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:'-.02em' }}>Earnings</h2>
          {total > 0 && <button className="btn btn-saffron btn-sm"><span className="material-symbols-outlined" style={{ fontSize:16 }}>account_balance_wallet</span>Withdraw via UPI</button>}
        </div>

        <div style={{ padding:28, maxWidth:860 }}>
          {/* Hero card */}
          <div style={{ background:'var(--grad)', borderRadius:20, padding:'28px 32px', marginBottom:20, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>
            <div style={{ position:'absolute', bottom:-30, left:'30%', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.04)' }}/>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'rgba(255,255,255,.7)', marginBottom:10 }}>Total earned — all time</div>
            <div style={{ fontSize:48, fontWeight:800, letterSpacing:'-.03em', color:'#fff', marginBottom:8 }}>₹{total.toLocaleString('en-IN')}</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.75)', display:'flex', gap:20, flexWrap:'wrap' }}>
              <span>{done} tasks completed</span>
              {user?.isSenior ? <span>⭐ Senior student</span> : <span>{Math.max(0,10-done)} more tasks to Senior status</span>}
              {user?.rating > 0 && <span>⭐ {user.rating} avg rating</span>}
            </div>
          </div>

          {/* Stats row */}
          <div className="three-col" style={{ marginBottom:20 }}>
            {[
              { icon:'calendar_month', label:'This month',  value:`₹${thisMonth.toLocaleString('en-IN')}`, bg:'rgba(195,192,255,.1)', c:'var(--primary)' },
              { icon:'bar_chart',      label:'Avg per task', value:`₹${tasks.length ? Math.round(total/tasks.length) : 0}`, bg:'rgba(255,185,95,.1)', c:'var(--secondary)' },
              { icon:'star',           label:'Rating',       value: user?.rating ? `${user.rating}★` : '—', bg:'rgba(74,222,128,.1)', c:'#4ADE80' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background:s.bg }}>
                  <span className="material-symbols-outlined" style={{ color:s.c }}>{s.icon}</span>
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.c, fontSize:22 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Earnings chart */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <div className="section-title" style={{ margin:0 }}>Income overview</div>
                <div style={{ fontSize:12, color:'var(--on-sv)' }}>Weekly earnings trend</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['weekly','monthly'].map(p => (
                  <button key={p} onClick={() => setChartPeriod(p)} style={{ padding:'5px 12px', borderRadius:'var(--r-full)', fontSize:12, fontWeight:700, background: chartPeriod===p ? 'var(--primary)' : 'var(--s-mid)', color: chartPeriod===p ? 'var(--on-primary)' : 'var(--on-sv)', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    {p.charAt(0).toUpperCase()+p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <canvas ref={canvasRef} width={800} height={160} style={{ width:'100%', height:160 }}/>
          </div>

          {/* Cash milestones */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <span className="material-symbols-outlined icon-fill" style={{ color:'var(--secondary)', fontSize:22 }}>payments</span>
              <div className="section-title" style={{ margin:0 }}>Cash milestone bonuses</div>
            </div>
            <p style={{ fontSize:13, color:'var(--on-sv)', marginBottom:24 }}>Real money rewards at key milestones — not badges.</p>
            {MILESTONES.map(m => {
              const pct    = Math.min((done/m.tasks)*100, 100);
              const earned = done >= m.tasks;
              return (
                <div key={m.tasks} style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:10, background: earned?'rgba(74,222,128,.12)':'rgba(195,192,255,.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:16, color: earned?'#4ADE80':'var(--primary)' }}>{m.icon}</span>
                      </div>
                      <div>
                        <span style={{ fontSize:14, fontWeight:700 }}>Task {m.tasks} — {m.label}</span>
                        {earned && <span className="chip chip-success" style={{ marginLeft:8, fontSize:10 }}>✓ Earned</span>}
                      </div>
                    </div>
                    <span style={{ fontSize:17, fontWeight:800, color: earned?'#4ADE80':'var(--secondary)' }}>+₹{m.bonus}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width:`${pct}%`, background: earned?'#4ADE80':'var(--primary)' }}/>
                  </div>
                  <div style={{ fontSize:11, color:'var(--on-sv)', marginTop:5, textTransform:'uppercase', letterSpacing:'.06em' }}>
                    {earned ? 'Completed!' : `${done}/${m.tasks} tasks`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent payouts */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div className="section-title" style={{ margin:0 }}>Recent payouts</div>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state" style={{ padding:'28px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize:44, display:'block', marginBottom:10, color:'var(--on-sv)' }}>payments</span>
                <h3>No earnings yet</h3>
                <p>Accept and complete tasks to start earning</p>
                <Link to="/tasks"><button className="btn btn-primary" style={{ marginTop:8 }}>Browse Tasks →</button></Link>
              </div>
            ) : tasks.slice(0,10).map((task, i) => (
              <div key={task._id}>
                {i > 0 && <div className="divider"/>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:3, letterSpacing:'-.01em' }}>{task.title}</div>
                    <div style={{ fontSize:12, color:'var(--on-sv)' }}>
                      {task.postedBy?.businessName||task.postedBy?.name} · {new Date(task.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:17, fontWeight:800, color:'#4ADE80', letterSpacing:'-.01em' }}>+₹{task.studentPay||0}</div>
                    <span className="chip chip-success" style={{ fontSize:10 }}>Paid</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
