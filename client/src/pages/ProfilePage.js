import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const SKILLS = ['Design','Writing','Data','Social Media','Video','Coding','Research','Excel','Canva','Marketing'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab]   = useState('profile');
  const [sideOpen, setSideOpen] = useState(false);
  const [form, setForm] = useState({
    name:user?.name||'', college:user?.college||'', city:user?.city||'',
    skills:user?.skills||[], whatsapp:user?.whatsapp||'', bio:user?.bio||'',
    businessName:user?.businessName||'', upiId:user?.upiId||'', linkedinUrl:user?.linkedinUrl||'',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s] }));

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true); setMsg(''); setErr('');
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data); setMsg('Profile saved!');
    } catch (err) { setErr(err.response?.data?.message||'Update failed'); }
    finally { setLoading(false); }
  };

  const isStudent  = user?.role === 'student';
  const isBusiness = user?.role === 'business' || user?.role === 'company';

  // Completion %
  const checks   = [!!form.bio, (form.skills.length>0), (user?.verifiedSkills?.length>0), !!form.college, !!form.city, !!form.whatsapp, !!form.upiId];
  const complete  = Math.round((checks.filter(Boolean).length/checks.length)*100);

  return (
    <div style={{ display:'flex', background:'var(--bg)', minHeight:'100vh' }}>
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)}/>
      <main className="with-sidebar" style={{ minHeight:'100vh' }}>
        <div className="topbar bg-surface/80 backdrop-blur-xl border-b border-outline-v/30 z-30 relative transition-all">
          <button onClick={() => setSideOpen(true)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-s-mid text-on-sv hover:text-on-surface hover:bg-s-high transition-all active:scale-95 border border-outline-v"><span className="material-symbols-outlined text-[20px]">menu</span></button>
          <h2 className="text-[17px] font-extrabold tracking-tight">Account Settings</h2>
          <Link to={`/portfolio/${user?._id}`}>
            <button className="flex items-center gap-2 bg-s-mid hover:bg-s-high text-primary font-bold text-[13px] px-3.5 py-2 rounded-xl border border-outline-v transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              Public Profile <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </Link>
        </div>

        <div style={{ padding:28, maxWidth:700 }}>
          {/* Profile hero */}
          <div className="relative overflow-hidden mb-8 p-7 md:p-10 rounded-3xl bg-gradient-to-br from-primary via-accent-violet to-accent-cyan text-white shadow-[0_12px_40px_rgba(99,102,241,0.25)] card-entry-1 group">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full bg-black/10 blur-2xl animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="relative w-24 h-24 shrink-0">
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_6s_linear_infinite]" style={{ borderTopColor: 'rgba(255,255,255,0.9)', borderRightColor: 'rgba(255,255,255,0.4)' }}/>
                <div className="absolute inset-[6px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-4xl shadow-inner backdrop-blur-sm group-hover:scale-105 transition-transform duration-500">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 mt-1">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-x-3 gap-y-1 mb-2">
                  <div className="font-extrabold text-[24px] tracking-tight">{user?.name}</div>
                  <div className="flex gap-2">
                    {user?.isVerified ? <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[11px] font-bold flex items-center gap-1 shadow-sm"><span className="material-symbols-outlined text-[13px] icon-fill">verified</span> Verified</span> 
                                      : <span className="px-2.5 py-0.5 rounded-full bg-black/20 border border-black/10 text-[11px] font-bold text-white/80">Unverified</span>}
                    {user?.isSenior && <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/30 border border-accent-cyan/40 text-[11px] font-bold text-white flex items-center gap-1 shadow-sm"><span className="text-[12px]">⭐</span> Senior</span>}
                  </div>
                </div>
                
                <div className="text-[13.5px] font-medium text-white/80 mb-5">
                  {isStudent?`🎓 Student${user?.isSenior?' · Senior Reviewer':''}`:`🏪 ${user?.businessName||user?.name}`}
                  {user?.city && ` · ${user.city}`}
                </div>
                
                {isStudent && (
                  <div className="flex gap-6 justify-center md:justify-start flex-wrap">
                    {[['₹'+(user?.totalEarned||0).toLocaleString('en-IN'),'Earned'],[(user?.tasksCompleted||0),'Tasks'],[user?.rating?`${user.rating}★`:'—','Rating']].map(([v,l]) => (
                      <div key={l} className="text-center md:text-left">
                        <div className="font-extrabold text-[20px] tabular-nums tracking-tight">{v}</div>
                        <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Completion Block */}
              <div className="md:ml-auto flex flex-col items-center bg-black/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-[26px] font-black tracking-tighter line-height-1 tabular-nums">{complete}%</div>
                <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2.5">Complete</div>
                <div className="w-20 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width:`${complete}%` }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-outline-v/30 mb-8 card-entry-2">
            <button className={`pb-3 text-[14px] font-bold border-b-2 transition-all ${tab==='profile'?'text-primary border-primary':'text-on-sv border-transparent hover:text-on-surface'}`} onClick={() => setTab('profile')}>Edit Profile</button>
            {isStudent && <button className={`pb-3 text-[14px] font-bold border-b-2 transition-all ${tab==='skills'?'text-primary border-primary':'text-on-sv border-transparent hover:text-on-surface'}`} onClick={() => setTab('skills')}>Skills & Tests</button>}
            <button className={`pb-3 text-[14px] font-bold border-b-2 transition-all ${tab==='settings'?'text-primary border-primary':'text-on-sv border-transparent hover:text-on-surface'}`} onClick={() => setTab('settings')}>Account</button>
          </div>

          <div className="card-entry-3">
          {tab === 'profile' && (
            <div className="card">
              {msg && <div className="alert alert-success">{msg}</div>}
              {err && <div className="alert alert-error">{err}</div>}
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={form.name} onChange={set('name')} required/>
                </div>
                {isStudent && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea className="form-input form-textarea" value={form.bio} onChange={set('bio')} placeholder="Tell businesses what you're great at..." style={{ minHeight:72 }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <div className="form-group"><label className="form-label">College</label><input className="form-input" value={form.college} onChange={set('college')} placeholder="FAMT Ratnagiri"/></div>
                      <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={set('city')} placeholder="Ratnagiri"/></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <div className="form-group"><label className="form-label">WhatsApp {user?.isVerified && '(Verified ✓)'}</label><input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+91 98765 43210"/></div>
                      <div className="form-group"><label className="form-label">UPI ID (for payouts) *</label><input className="form-input" value={form.upiId} onChange={set('upiId')} placeholder="name@upi"/></div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn URL (optional)</label>
                      <input className="form-input" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/yourname"/>
                    </div>
                  </>
                )}
                {isBusiness && (
                  <div className="form-group">
                    <label className="form-label">Business name</label>
                    <input className="form-input" value={form.businessName} onChange={set('businessName')}/>
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading?'Saving...':'Save Changes'}</button>
              </form>
            </div>
          )}

          {tab === 'skills' && isStudent && (
            <>
              {user?.verifiedSkills?.length > 0 && (
                <div className="card" style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span className="material-symbols-outlined icon-fill" style={{ color:'#4ADE80', fontSize:18 }}>verified</span>
                    <div className="section-title" style={{ margin:0 }}>Verified skills</div>
                  </div>
                  <div className="tag-row">
                    {user.verifiedSkills.map(s => <span key={s} style={{ padding:'6px 14px', borderRadius:99, background:'rgba(74,222,128,.1)', color:'#4ADE80', border:'1px solid rgba(74,222,128,.2)', fontSize:13, fontWeight:700 }}>✓ {s}</span>)}
                  </div>
                </div>
              )}
              <div className="card" style={{ marginBottom:16 }}>
                <div className="section-title">Select your skills</div>
                <div className="tag-row" style={{ marginBottom:16 }}>
                  {SKILLS.map(s => <button key={s} className={`tag ${form.skills.includes(s)?'active':''}`} onClick={() => toggleSkill(s)}>{s}</button>)}
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>Save Skills</button>
              </div>
              <div className="card" style={{ background:'var(--grad)', border:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color:'var(--secondary)', fontSize:20 }}>auto_awesome</span>
                  <div style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Take skill assessments</div>
                </div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.8)', lineHeight:1.6, marginBottom:14 }}>Verified students get 3x more task assignments.</p>
                <Link to="/assessments"><button className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.2)' }}>Browse Tests →</button></Link>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <div className="card">
              <div className="section-title">Account information</div>
              {[['Email',user?.email],['Role',user?.role],['Member since',new Date(user?.createdAt||Date.now()).toLocaleDateString('en-IN',{year:'numeric',month:'long'})],['Verification',user?.isVerified?'✓ Phone verified':'⚠ Unverified — go to register to verify']].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(70,69,85,.3)', fontSize:14 }}>
                  <span style={{ color:'var(--on-sv)' }}>{l}</span>
                  <span style={{ fontWeight:600, color: l==='Verification' && !user?.isVerified ? 'var(--warning)' : 'var(--on-surface)' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:20, padding:'14px', background:'rgba(255,180,171,.06)', borderRadius:12, border:'1px solid rgba(255,180,171,.15)' }}>
                <div style={{ fontWeight:700, color:'var(--error)', marginBottom:4, fontSize:14 }}>Danger zone</div>
                <div style={{ fontSize:13, color:'rgba(255,180,171,.7)' }}>Contact support to delete your account.</div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
