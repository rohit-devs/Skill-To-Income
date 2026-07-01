import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Count-up hook ───────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ── Data ────────────────────────────────────────────────────── */
const STATS = [
  ['500+', 'Students'],
  ['200+', 'Businesses'],
  ['₹10L+', 'Paid Out'],
  ['4.8★', 'Rating'],
];

const FEATURES = [
  { icon: 'bolt',      title: 'Speed',    desc: 'Turnaround in as little as 6 hours. Our agile student workforce is ready whenever you are.',    tag: '6–72 hrs delivery',   color: '#6366F1' },
  { icon: 'verified',  title: 'Quality',  desc: 'Every task undergoes a Peer Review by a senior student before the client ever sees it.',         tag: 'Senior peer-reviewed', color: '#8B5CF6' },
  { icon: 'lock',      title: 'Safety',   desc: 'Secure post-delivery escrow. You only pay after approving the work.',                            tag: 'Escrow payments',      color: '#10B981' },
  { icon: 'smart_toy', title: 'AI Match', desc: 'Our AI assistant helps businesses draft briefs and matches the best-fit student instantly.',      tag: 'Claude-powered AI',    color: '#F59E0B' },
];

const HOW = [
  { n: '01', icon: 'post_add',     title: 'Business posts task', desc: 'AI assistant builds the perfect brief in 2 minutes via chat.' },
  { n: '02', icon: 'auto_awesome', title: 'AI matches student',  desc: 'Rule-based skill + city filter. No bad matches.' },
  { n: '03', icon: 'rate_review',  title: 'Senior reviews work', desc: 'A senior student peer-reviews before the client sees it.' },
  { n: '04', icon: 'payments',     title: 'Approve & pay UPI',   desc: 'Post-delivery escrow. Pay after approval. Instant UPI payout.' },
];

/* Each card gets a unique float class + staggered card-entry class */
const TASK_CARDS = [
  { title: 'Slide Deck Design',    pay: '₹450', cat: 'Design',    floatClass: 'float-a', entryClass: 'card-entry-1', featured: false, offsetY: 0 },
  { title: 'React Dashboard',      pay: '₹800', cat: 'Coding',    floatClass: 'float-b', entryClass: 'card-entry-2', featured: true,  offsetY: 16 },
  { title: 'Social Media Content', pay: '₹300', cat: 'Marketing', floatClass: 'float-c', entryClass: 'card-entry-3', featured: false, offsetY: 0 },
  { title: 'Data Analysis',        pay: '₹550', cat: 'Data',      floatClass: 'float-d', entryClass: 'card-entry-4', featured: false, offsetY: 10 },
];

/* ── Main Component ─────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const earningsCount = useCountUp(1250, 2000, true); // starts immediately on mount

  /* ── Hover helpers ── */
  const lift = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = e.currentTarget.dataset.hoverShadow || '0 16px 40px rgba(0,0,0,0.4)';
  };
  const drop = (e) => {
    const base = e.currentTarget.dataset.baseTransform || 'none';
    e.currentTarget.style.transform = base;
    e.currentTarget.style.boxShadow = e.currentTarget.dataset.baseShadow || 'none';
  };

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>

      {/* ────────────────────────────────────────────────────────
          ANIMATED BACKGROUND ORBS (slow drift, GPU-composited)
      ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Indigo — top-right */}
        <div
          className="animate-drift"
          style={{ position: 'absolute', top: '-15%', right: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 68%)', willChange: 'transform' }}
        />
        {/* Purple — centre-left */}
        <div
          className="animate-drift"
          style={{ position: 'absolute', top: '25%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 68%)', animationDelay: '-7s', willChange: 'transform' }}
        />
        {/* Amber — bottom-left */}
        <div
          className="animate-drift"
          style={{ position: 'absolute', bottom: '-12%', left: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 68%)', animationDelay: '-13s', willChange: 'transform' }}
        />
      </div>

      {/* ────────────────────────────────────────────────────────
          HERO SECTION
      ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 64, alignItems: 'center' }}>

          {/* ── LEFT: Staggered headline + CTA ── */}
          <div>
            {/* Trust badge */}
            <div
              className="hero-entry-1"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A5B4FC', marginBottom: 28 }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite', display: 'inline-block', flexShrink: 0 }} />
              Trusted by students across India 🇮🇳
            </div>

            {/* H1 */}
            <h1 className="hero-entry-2" style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, color: '#fff' }}>
              Turn Your Skills<br />
              <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Into Income
              </span>
            </h1>

            {/* Sub */}
            <p className="hero-entry-3" style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 1.7, maxWidth: 460, marginBottom: 40, fontWeight: 500 }}>
              India's first peer-reviewed micro-internship platform. Earn{' '}
              <strong style={{ color: '#F59E0B' }}>₹150–₹800</strong> per task, UPI payouts in 24 hours.
            </p>

            {/* CTAs */}
            <div className="hero-entry-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
              {/* Primary CTA — animated indigo glow */}
              <button
                className="animate-primary-glow"
                onClick={() => navigate('/register')}
                style={{ padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; }}
              >
                Start Earning Free
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>

              {/* Secondary CTA — ghost */}
              <button
                onClick={() => navigate('/tasks')}
                style={{ padding: '14px 32px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              >
                Explore Tasks
              </button>
            </div>

            {/* Trust signals */}
            <div className="hero-entry-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {[['verified', 'Skill Verified'], ['lock', 'Secure Escrow'], ['payments', 'UPI Payouts']].map(([ic, lbl]) => (
                <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize: 16, color: '#10B981' }}>{ic}</span>
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Staggered + floating task cards ── */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {TASK_CARDS.map((t, i) => (
                <div
                  key={t.title}
                  /* entry animation class + continuous float class */
                  className={`${t.entryClass} ${t.floatClass}`}
                  data-hover-shadow={t.featured ? '0 24px 56px rgba(99,102,241,0.55)' : '0 16px 40px rgba(0,0,0,0.45)'}
                  data-base-shadow={t.featured ? '0 8px 32px rgba(99,102,241,0.35)' : '0 4px 16px rgba(0,0,0,0.3)'}
                  data-base-transform={t.offsetY ? `translateY(${t.offsetY}px)` : 'none'}
                  style={{
                    background: t.featured ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(17,24,39,0.9)',
                    border: t.featured ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '20px 20px 18px',
                    cursor: 'pointer',
                    transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease',
                    boxShadow: t.featured ? '0 8px 32px rgba(99,102,241,0.35)' : '0 4px 16px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(12px)',
                    marginTop: t.offsetY,
                  }}
                  onMouseOver={lift}
                  onMouseOut={drop}
                >
                  <div style={{ fontSize: 24, fontWeight: 900, color: t.featured ? '#fff' : '#F59E0B', marginBottom: 6, letterSpacing: '-0.02em' }}>{t.pay}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.featured ? '#fff' : '#F9FAFB', marginBottom: 6, lineHeight: 1.3 }}>{t.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: t.featured ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}>{t.cat}</div>
                  {t.featured && (
                    <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}>
                      <span className="material-symbols-outlined icon-fill" style={{ fontSize: 12 }}>auto_awesome</span>
                      AI-matched
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── EARNINGS CARD — count-up + pulse glow ── */}
            <div
              className="animate-pulse-glow card-entry-5"
              style={{
                position: 'absolute',
                bottom: -28,
                left: -36,
                background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                borderRadius: 20,
                padding: '16px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                minWidth: 210,
                zIndex: 10,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined icon-fill" style={{ color: '#fff', fontSize: 22 }}>currency_rupee</span>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>Instant Payout</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{earningsCount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* AI-matched badge */}
            <div
              className="card-entry-5"
              style={{ position: 'absolute', top: -18, right: -16, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)', zIndex: 10 }}
            >
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 14, color: '#10B981' }}>verified</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981' }}>Verified · Escrow Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATS.map(([v, l], i) => (
              <div
                key={l}
                style={{ padding: '28px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'background 0.25s ease', cursor: 'default' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.07)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{v}</div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', marginTop: 60 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F59E0B', marginBottom: 16 }}>Why choose us</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', marginBottom: 20 }}>
              Built for the{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                next generation
              </span>
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              No long resumes, no complex contracts — just work, deliver, and earn.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={{ background: 'rgba(17,24,39,0.75)', borderRadius: 20, padding: '32px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)', cursor: 'default', backdropFilter: 'blur(8px)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.35)`; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${f.color}35`, transition: 'transform 0.3s ease' }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color: f.color, fontSize: 26 }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
                <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)' }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '100px 24px', background: 'rgba(17,24,39,0.4)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
              Posting to payout in{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
                4 steps
              </span>
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Typically 6–72 hours end-to-end</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 32 }}>
            {HOW.map((h, i) => (
              <div
                key={h.n}
                style={{ cursor: 'default', transition: 'transform 0.3s ease' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>{h.n}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: i === 3 ? 'linear-gradient(135deg, #F59E0B, #F97316)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: i === 3 ? '0 4px 20px rgba(245,158,11,0.35)' : '0 4px 20px rgba(99,102,241,0.35)' }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color: '#fff', fontSize: 24 }}>{h.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{h.title}</h3>
                <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.65 }}>{h.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <Link to="/register">
              <button
                style={{ padding: '16px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 800, color: '#78350F', background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 24px rgba(245,158,11,0.35)', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(245,158,11,0.35)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              >
                Get Started Free
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20 }}>send</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 1, background: 'rgba(17,24,39,0.6)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '80px 24px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 48, marginBottom: 60 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#6366F1', marginBottom: 16, letterSpacing: '-0.02em' }}>Skill-To-Income</div>
              <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>Connecting Indian students with high-impact micro-tasks to build portfolio and income.</p>
            </div>
            {[
              ['Platform', ['Browse Tasks', 'Leaderboard', 'Pricing', 'Post a Task']],
              ['Company', ['About Us', 'FAMT Ratnagiri', 'Design Research', 'Blog']],
              ['Legal', ['Terms', 'Privacy Center', 'Help Center']],
            ].map(([title, items]) => (
              <div key={title}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => (
                    <button key={item} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#6366F1'}
                      onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}
                    >{item}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: '#9CA3AF', fontSize: 12, fontWeight: 700 }}>
            <span>© 2026 Skill-To-Income · Dept. of IT, FAMT Ratnagiri</span>
            <span>Built with ❤️ for India's students</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
