import React from 'react';
import { Link } from 'react-router-dom';

const CATS = [
  { icon:'🎨', name:'Design', desc:'Posters, logos, social media graphics' },
  { icon:'✍️', name:'Writing', desc:'Captions, descriptions, articles' },
  { icon:'📊', name:'Data', desc:'Excel, spreadsheets, data entry' },
  { icon:'📱', name:'Social Media', desc:'Content calendars, reels strategy' },
  { icon:'💻', name:'Coding', desc:'Websites, scripts, automation' },
  { icon:'🔍', name:'Research', desc:'Market research, competitor analysis' },
];

const STEPS = [
  { num:'01', color:'var(--blue)',   title:'Business posts a task', desc:'Describe what you need, set a budget of ₹150–₹500, pick a deadline of 6–72 hours.' },
  { num:'02', color:'var(--orange)', title:'AI matches best student', desc:'Our engine finds the top-rated student whose skills match your task perfectly.' },
  { num:'03', color:'var(--emerald)',title:'Work gets peer-reviewed', desc:'A senior student reviews quality before it ever reaches you. No bad deliverables.' },
  { num:'04', color:'var(--blue)',   title:'Approve and pay via UPI', desc:'You approve, money releases to the student instantly via UPI. Done.' },
];

const STATS = [
  { val:'₹150–₹500', label:'Per task range' },
  { val:'6–72 hrs',  label:'Typical turnaround' },
  { val:'12%',       label:'Platform fee only' },
  { val:'4.8★',      label:'Avg quality rating' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'72px 24px 64px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--orange-lt)', border:'1px solid #FAC08A', borderRadius:99, padding:'5px 16px', fontSize:13, fontWeight:600, color:'var(--orange-dk)', marginBottom:24 }}>
            🇮🇳 Built for Tier-2 &amp; Tier-3 India
          </div>
          <h1 style={{ fontSize:48, fontWeight:800, lineHeight:1.15, marginBottom:18 }}>
            Turn your <span style={{ color:'var(--blue)' }}>skills</span> into{' '}
            <span style={{ color:'var(--orange)' }}>income</span>
          </h1>
          <p style={{ fontSize:18, color:'var(--ink-3)', lineHeight:1.7, marginBottom:36, maxWidth:560, margin:'0 auto 36px' }}>
            India's first peer-reviewed micro-internship platform. College students earn ₹150–₹500 per task. Small businesses get quality work in 24–72 hours.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register?role=student">
              <button className="btn btn-primary btn-lg">I'm a Student — Start Earning →</button>
            </Link>
            <Link to="/register?role=business">
              <button className="btn btn-orange btn-lg">I'm a Business — Post a Task</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background:'var(--blue)', padding:'20px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:12 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center', color:'#fff' }}>
              <div style={{ fontSize:22, fontWeight:800 }}>{s.val}</div>
              <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding:'64px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <h2 style={{ fontSize:30, fontWeight:800, textAlign:'center', marginBottom:8 }}>How it works</h2>
          <p style={{ textAlign:'center', color:'var(--ink-3)', fontSize:15, marginBottom:48 }}>Four steps from task to payment</p>
          <div className="four-col">
            {STEPS.map(s => (
              <div key={s.num} className="card" style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:s.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, margin:'0 auto 14px' }}>{s.num}</div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--ink-3)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding:'64px 24px', background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <h2 style={{ fontSize:30, fontWeight:800, textAlign:'center', marginBottom:8 }}>Task categories</h2>
          <p style={{ textAlign:'center', color:'var(--ink-3)', fontSize:15, marginBottom:40 }}>Whatever your skill, there is a task for you</p>
          <div className="three-col">
            {CATS.map(c => (
              <Link key={c.name} to={`/tasks?category=${c.name}`} style={{ textDecoration:'none' }}>
                <div className="card card-hover" style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <span style={{ fontSize:28 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:4 }}>{c.name}</div>
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>{c.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:32 }}>
            <Link to="/tasks"><button className="btn btn-outline btn-lg">Browse all tasks →</button></Link>
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section style={{ padding:'64px 24px', background:'var(--blue)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:30, fontWeight:800, color:'#fff', marginBottom:12 }}>Ready to start?</h2>
          <p style={{ color:'rgba(255,255,255,.8)', fontSize:16, marginBottom:32 }}>
            Join thousands of students earning real income from their skills while still in college.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register?role=student">
              <button style={{ ...CTA, background:'var(--orange)' }}>Create student account</button>
            </Link>
            <Link to="/tasks">
              <button style={{ ...CTA, background:'rgba(255,255,255,.15)', border:'1.5px solid rgba(255,255,255,.4)' }}>Browse tasks first</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const CTA = { borderRadius:10, padding:'13px 28px', fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer', border:'none' };
