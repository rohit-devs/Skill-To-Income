import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CAT = { Design:'🎨', Writing:'✍️', Data:'📊', 'Social Media':'📱', Video:'🎬', Coding:'💻', Research:'🔍', Other:'📋' };

function CircleStat({ value, max, label, color }) {
  const pct  = Math.min((Number(value)||0) / (max||1), 1);
  const r    = 28, cx = 36, cy = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={72} height={72} style={{ display:'block', margin:'0 auto 8px' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(70,69,85,.4)" strokeWidth={5}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1-pct)}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition:'stroke-dashoffset .6s' }}/>
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="central" fill={color} style={{ fontSize:13, fontWeight:700, fontFamily:'Plus Jakarta Sans' }}>{value}</text>
      </svg>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--on-sv)' }}>{label}</div>
    </div>
  );
}

export default function PortfolioPage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!data)   return <div className="empty-state"><h3>User not found</h3><Link to="/leaderboard"><button className="btn btn-primary" style={{ marginTop:12 }}>Back to Leaderboard</button></Link></div>;

  const { user, recentTasks } = data;
  const isBusiness = me && (me.role === 'business' || me.role === 'company');
  const isOwnProfile = me && me._id === user._id;

  return (
    <div className="page-wrap" style={{ background:'var(--bg)' }}>
      {/* Hero */}
      <div style={{ background:'var(--grad)', padding:'40px 28px 36px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:24, flexWrap:'wrap' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:32, color:'#fff', flexShrink:0, border:'3px solid rgba(255,255,255,.2)' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-.02em', color:'#fff' }}>{user.name}</h1>
                {user.isVerified && <span className="verified-badge">✓ Verified</span>}
                {user.isSenior  && <span style={{ padding:'2px 9px', borderRadius:99, background:'rgba(255,185,95,.2)', color:'var(--sec-fixed)', border:'1px solid rgba(255,185,95,.3)', fontSize:10.5, fontWeight:700 }}>⭐ Senior</span>}
              </div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,.8)', marginBottom:10 }}>
                {user.college && `${user.college} · `}{user.city||'India'}
                {user.whatsapp && ` · WhatsApp: ${user.whatsapp}`}
              </div>
              {user.bio && <p style={{ fontSize:14, color:'rgba(255,255,255,.85)', lineHeight:1.7, maxWidth:540, marginBottom:14 }}>{user.bio}</p>}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {isOwnProfile && <Link to="/profile"><button className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.2)' }}>Edit Profile →</button></Link>}
                {isBusiness && <Link to="/post-task"><button className="btn btn-saffron btn-sm">Post task for this student →</button></Link>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, alignItems:'start' }}>

          {/* Left column */}
          <div>
            {/* Circular stats */}
            <div className="card" style={{ marginBottom:16 }}>
              <div className="section-title">Performance</div>
              <div style={{ display:'flex', gap:20, justifyContent:'space-around', flexWrap:'wrap' }}>
                <CircleStat value={user.tasksCompleted||0} max={50} label="Tasks done" color="var(--primary)"/>
                <CircleStat value={`₹${(user.totalEarned||0)/100 > 0 ? Math.round((user.totalEarned||0)/100)+'K' : (user.totalEarned||0)}`} max={1} label="Total earned" color="var(--secondary)"/>
                <CircleStat value={user.rating ? `${user.rating}` : '—'} max={5} label="Rating" color="#4ADE80"/>
                <CircleStat value={user.streak||0} max={30} label="Day streak" color="#60A5FA"/>
              </div>
            </div>

            {/* Skill preview cards */}
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div className="section-title" style={{ margin:0 }}>Skill Preview Cards</div>
                <span style={{ fontSize:12, color:'var(--on-sv)' }}>Portfolio samples</span>
              </div>
              {user.skillPreviews?.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {user.skillPreviews.map((p, i) => (
                    <div key={i} style={{ aspectRatio:'1', background:'var(--s-mid)', borderRadius:'var(--r-md)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', overflow:'hidden', border:'1px solid var(--outline-v)' }}>
                      {p.url ? <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (
                        <>
                          <span style={{ fontSize:28 }}>{CAT[p.category]||'📋'}</span>
                          <span style={{ fontSize:11, color:'var(--on-sv)', fontWeight:600 }}>{p.category}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ aspectRatio:'1', background:'var(--s-mid)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed var(--outline-v)', color:'var(--outline)', fontSize:24 }}>
                      {isOwnProfile ? '+' : '?'}
                    </div>
                  ))}
                </div>
              )}
              {isOwnProfile && <div style={{ fontSize:12, color:'var(--on-sv)', marginTop:10 }}>Upload 3 portfolio samples to increase task acceptance rate by 3x. <Link to="/profile" style={{ color:'var(--primary)' }}>Add now →</Link></div>}
            </div>

            {/* Verified skills */}
            {(user.verifiedSkills?.length > 0 || user.skills?.length > 0) && (
              <div className="card" style={{ marginBottom:16 }}>
                <div className="section-title">Skills</div>
                <div className="tag-row" style={{ marginBottom: user.verifiedSkills?.length > 0 ? 12 : 0 }}>
                  {user.verifiedSkills?.map(s => (
                    <span key={s} style={{ padding:'6px 14px', borderRadius:99, background:'rgba(74,222,128,.1)', color:'#4ADE80', border:'1px solid rgba(74,222,128,.2)', fontSize:13, fontWeight:700 }}>✓ {s}</span>
                  ))}
                </div>
                {user.skills?.filter(s => !user.verifiedSkills?.includes(s)).length > 0 && (
                  <div className="tag-row">
                    {user.skills.filter(s => !user.verifiedSkills?.includes(s)).map(s => (
                      <span key={s} className="chip chip-outline" style={{ padding:'5px 13px' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent work */}
            {recentTasks?.length > 0 && (
              <div className="card">
                <div className="section-title">Recent completed tasks</div>
                {recentTasks.slice(0,5).map((t, i) => (
                  <div key={t._id}>
                    {i > 0 && <div className="divider"/>}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{t.title}</div>
                        <div style={{ fontSize:12, color:'var(--on-sv)' }}>
                          {CAT[t.category]||'📋'} {t.category} · {new Date(t.updatedAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                        </div>
                      </div>
                      <span className="chip chip-success">✓ Done</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            {/* Matched tasks for business */}
            {isBusiness && (
              <div className="card" style={{ marginBottom:16 }}>
                <div className="section-title">Post a task for {user.name.split(' ')[0]}</div>
                <p style={{ fontSize:13, color:'var(--on-sv)', lineHeight:1.6, marginBottom:14 }}>This student has {user.tasksCompleted||0} completed tasks and a {user.rating||0}★ rating. They're available for new work.</p>
                <Link to="/post-task"><button className="btn btn-primary btn-full">Post Task →</button></Link>
              </div>
            )}

            {/* Profile completeness */}
            {isOwnProfile && (
              <div className="card" style={{ marginBottom:16 }}>
                <div className="section-title" style={{ marginBottom:10 }}>Profile completeness</div>
                {(() => {
                  const checks = [!!user.bio, (user.skills?.length>0), (user.verifiedSkills?.length>0), !!user.college, !!user.city, !!user.whatsapp, !!user.upiId];
                  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
                  return (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
                        <span>Completion</span>
                        <span style={{ fontWeight:800, color:'var(--primary)' }}>{pct}%</span>
                      </div>
                      <div className="progress" style={{ marginBottom:14 }}>
                        <div className="progress-fill" style={{ width:`${pct}%` }}/>
                      </div>
                      {[['bio','Add a bio','✓ bio added'],['skills','Add skills','✓ skills added'],['verifiedSkills','Take a skill test','✓ verified'],['college','Add college','✓ college'],['city','Add city','✓ city'],['whatsapp','Add WhatsApp','✓ WhatsApp'],['upiId','Add UPI ID','✓ UPI ID']].map(([k,pending,done]) => (
                        <div key={k} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, fontSize:12.5 }}>
                          <span style={{ color: user[k]?'#4ADE80':'var(--outline)' }}>{user[k]?'✓':'○'}</span>
                          <span style={{ color: user[k]?'#4ADE80':'var(--on-sv)' }}>{user[k]?done:pending}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
                <Link to="/profile"><button className="btn btn-outline btn-full btn-sm" style={{ marginTop:10 }}>Edit Profile →</button></Link>
              </div>
            )}

            {/* Verification status */}
            <div className="card" style={{ marginBottom:16 }}>
              <div className="section-title" style={{ marginBottom:12 }}>Verification</div>
              <div style={{ display:'flex', gap:8, flexDirection:'column' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                  {user.isVerified ? <span className="verified-badge">✓ Phone verified</span> : <span className="unverified-badge">⚠ Phone unverified</span>}
                </div>
                {user.isSenior && <span className="verified-badge" style={{ display:'inline-flex' }}>⭐ Senior student</span>}
                {user.college && <span className="verified-badge" style={{ display:'inline-flex' }}>🎓 College confirmed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
