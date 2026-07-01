import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const COLORS = ['var(--primary-container)','#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => { setLeaders(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{ background: 'var(--background)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface-container-lowest)', padding: '48px 32px 36px', borderBottom: '1px solid rgba(70,69,85,.3)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 10 }}>Top Earners</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 15 }}>Students leading Skill-To-Income this month · #1 earns ₹500 bonus</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {leaders.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 12 }}>emoji_events</span>
            <h3>No rankings yet</h3>
            <p>Be the first to complete tasks and claim the top spot!</p>
            <Link to="/tasks"><button className="btn btn-primary">Browse Tasks →</button></Link>
          </div>
        ) : (
          <>
            {/* Podium */}
            {leaders.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 40, padding: '0 20px' }}>
                {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
                  const pos    = [2,1,3][i];
                  const color  = COLORS[leaders.indexOf(l) % COLORS.length];
                  const isFirst = pos === 1;
                  return (
                    <div key={l._id} style={{ flex: 1, textAlign: 'center' }}>
                      {isFirst && <div style={{ fontSize: 26, marginBottom: 8 }}>👑</div>}
                      <div style={{ width: isFirst ? 68 : 54, height: isFirst ? 68 : 54, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: isFirst ? 26 : 20, margin: '0 auto 10px', border: isFirst ? '3px solid var(--secondary)' : 'none' }}>
                        {l.name[0].toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: isFirst ? 15 : 13, marginBottom: 3 }}>{l.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 6 }}>{l.college?.split(' ')[0]||'Student'}</div>
                      <div style={{ fontWeight: 800, fontSize: isFirst ? 18 : 14, color: 'var(--secondary)', marginBottom: 8 }}>₹{l.totalEarned?.toLocaleString('en-IN')}</div>
                      <div style={{ height: isFirst?80:pos===2?56:40, background: isFirst?'var(--secondary-container)':pos===2?'var(--surface-container-highest)':'var(--surface-container-high)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                        <span style={{ color: isFirst?'var(--on-secondary-container)':'var(--on-surface-variant)', fontWeight: 800, fontSize: 16 }}>{pos}{['st','nd','rd'][pos-1]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {leaders.map((l, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <Link key={l._id} to={`/portfolio/${l._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(70,69,85,.2)', background: 'transparent', transition: 'background .12s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 32, textAlign: 'center', fontWeight: 800, fontSize: idx < 3 ? 20 : 14, color: idx < 3 ? 'inherit' : 'var(--on-surface-variant)', flexShrink: 0 }}>
                        {idx < 3 ? medals[idx] : `#${idx+1}`}
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                        {l.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {l.name}
                          {l.isSenior && <span className="chip chip-saffron" style={{ fontSize: 10 }}>⭐ Senior</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'flex', gap: 10 }}>
                          <span>{l.college||'Student'}</span>
                          {l.city && <span>· {l.city}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                          {l.skills?.slice(0,3).map(s => <span key={s} className="chip chip-primary" style={{ fontSize: 10 }}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--secondary)', letterSpacing: '-.01em' }}>₹{l.totalEarned?.toLocaleString('en-IN')||0}</div>
                        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 3 }}>{l.tasksCompleted} tasks</div>
                        {l.rating > 0 && <div style={{ fontSize: 12, color: 'var(--secondary)' }}>⭐ {l.rating?.toFixed(1)}</div>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ background: 'var(--editorial-gradient)', borderRadius: 16, padding: '24px 28px', marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>Want to be on this list?</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Accept tasks, deliver quality work, climb the leaderboard.</div>
              </div>
              <Link to="/tasks"><button className="btn" style={{ background: '#fff', color: 'var(--primary-container)', fontWeight: 800 }}>Browse Tasks →</button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
