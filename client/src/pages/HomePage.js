import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '500+', label: 'Students earning' },
  { value: '200+', label: 'Businesses served' },
  { value: '₹2,400', label: 'Avg monthly earn' },
  { value: '95%', label: 'Task approval rate' },
];

const HOW_STUDENT = [
  { step: '01', title: 'Register your skills', desc: 'Sign up, add your skill tags and college details. Takes 2 minutes.' },
  { step: '02', title: 'Browse & accept tasks', desc: 'See micro-tasks matched to your skills from businesses near you.' },
  { step: '03', title: 'Submit & get reviewed', desc: 'Complete the task, submit it. A senior student reviews it first.' },
  { step: '04', title: 'Get paid via UPI', desc: 'Business approves → money hits your account within 24 hours.' },
];

const CATEGORIES = ['Design', 'Writing', 'Data', 'Social Media', 'Video', 'Coding', 'Research'];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>🇮🇳 Built for Tier-2 & Tier-3 India</div>
          <h1 style={styles.heroTitle}>
            Real skills.<br />Real tasks.<br />
            <span style={styles.heroAccent}>Real income.</span>
          </h1>
          <p style={styles.heroSub}>
            SkillEarn connects college students with small businesses for quick, affordable micro-tasks.
            Earn ₹150–₹500 per task. No experience needed — just your skill.
          </p>
          <div style={styles.heroBtns}>
            {user ? (
              <Link to="/tasks"><button style={styles.btnPrimary}>Browse Tasks →</button></Link>
            ) : (
              <>
                <Link to="/register"><button style={styles.btnPrimary}>Start Earning →</button></Link>
                <Link to="/register?role=business"><button style={styles.btnOutline}>Post a Task</button></Link>
              </>
            )}
          </div>
        </div>

        {/* Floating task card preview */}
        <div style={styles.heroCard}>
          <div style={styles.hcTop}>
            <span style={styles.hcBadge}>Design</span>
            <span style={styles.hcPay}>₹350</span>
          </div>
          <div style={styles.hcTitle}>Festival poster for Diwali sale</div>
          <div style={styles.hcMeta}>Ravi's Bakery · Nashik · Due in 24 hrs</div>
          <button style={styles.hcBtn}>Accept task — earn ₹315 →</button>
          <div style={styles.hcNote}>After 10% platform fee · Reviewed by senior student</div>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsBar}>
        <div style={styles.statsInner}>
          {STATS.map((s) => (
            <div key={s.label} style={styles.statItem}>
              <div style={styles.statVal}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHead}>
            <span style={styles.sectionTag}>How it works</span>
            <h2 style={styles.sectionTitle}>From skill to income in 4 steps</h2>
          </div>
          <div style={styles.stepsGrid}>
            {HOW_STUDENT.map((s) => (
              <div key={s.step} style={styles.stepCard}>
                <div style={styles.stepNum}>{s.step}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ ...styles.section, background: '#F8F7F4' }}>
        <div className="container">
          <div style={styles.sectionHead}>
            <span style={styles.sectionTag}>Task categories</span>
            <h2 style={styles.sectionTitle}>What skills are in demand?</h2>
          </div>
          <div style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={`/tasks?category=${cat}`} style={{ textDecoration: 'none' }}>
                <div style={styles.catCard}>
                  <span style={styles.catName}>{cat}</span>
                  <span style={styles.catArrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={styles.ctaBanner}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={styles.ctaTitle}>Ready to earn from your skills?</h2>
          <p style={styles.ctaSub}>Join 500+ students already earning on SkillEarn.</p>
          <div style={styles.ctaBtns}>
            <Link to="/register"><button style={styles.ctaBtnPrimary}>Register as Student</button></Link>
            <Link to="/register?role=business"><button style={styles.ctaBtnOutline}>I'm a Business</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: { background: 'linear-gradient(135deg, #3B30CC 0%, #1E1B4B 100%)', padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 60, flexWrap: 'wrap' },
  heroInner: { maxWidth: 520, color: '#fff' },
  heroBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '4px 14px', fontSize: 13, marginBottom: 20 },
  heroTitle: { fontSize: 48, fontWeight: 700, lineHeight: 1.15, marginBottom: 20 },
  heroAccent: { color: '#F59E0B' },
  heroSub: { fontSize: 16, opacity: 0.85, lineHeight: 1.65, marginBottom: 32 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { background: '#F59E0B', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600, color: '#1A1A18', cursor: 'pointer' },
  btnOutline: { background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 500, color: '#fff', cursor: 'pointer' },
  heroCard: { background: '#fff', borderRadius: 14, padding: '20px 22px', maxWidth: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  hcTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hcBadge: { background: '#EEEDFE', color: '#3C3489', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500 },
  hcPay: { fontWeight: 700, fontSize: 18, color: '#1A1A18' },
  hcTitle: { fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#1A1A18' },
  hcMeta: { fontSize: 12, color: '#6B6A64', marginBottom: 14 },
  hcBtn: { width: '100%', background: '#3B30CC', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8 },
  hcNote: { fontSize: 11, color: '#6B6A64', textAlign: 'center' },
  statsBar: { background: '#fff', borderBottom: '1px solid #E4E2DC', padding: '28px 20px' },
  statsInner: { maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px 32px' },
  statItem: { textAlign: 'center' },
  statVal: { fontSize: 28, fontWeight: 700, color: '#3B30CC' },
  statLabel: { fontSize: 13, color: '#6B6A64', marginTop: 2 },
  section: { padding: '64px 20px' },
  sectionHead: { textAlign: 'center', marginBottom: 40 },
  sectionTag: { background: '#EEEDFE', color: '#3B30CC', padding: '4px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500 },
  sectionTitle: { fontSize: 30, fontWeight: 700, marginTop: 12, color: '#1A1A18' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 },
  stepCard: { background: '#fff', border: '1px solid #E4E2DC', borderRadius: 12, padding: '24px 20px' },
  stepNum: { width: 36, height: 36, background: '#EEEDFE', color: '#3B30CC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, marginBottom: 14 },
  stepTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1A1A18' },
  stepDesc: { fontSize: 13.5, color: '#6B6A64', lineHeight: 1.6 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 },
  catCard: { background: '#fff', border: '1px solid #E4E2DC', borderRadius: 10, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.12s' },
  catName: { fontWeight: 500, fontSize: 14, color: '#1A1A18' },
  catArrow: { color: '#3B30CC', fontSize: 16 },
  ctaBanner: { background: '#3B30CC', padding: '64px 20px' },
  ctaTitle: { fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 12 },
  ctaSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  ctaBtns: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  ctaBtnPrimary: { background: '#F59E0B', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600, color: '#1A1A18', cursor: 'pointer' },
  ctaBtnOutline: { background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 500, color: '#fff', cursor: 'pointer' },
};

export default HomePage;
