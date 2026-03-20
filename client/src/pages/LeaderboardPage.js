import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => { setLeaders(data); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={styles.header}>
          <h1 style={styles.title}>Top Earners 🏆</h1>
          <p style={styles.sub}>Students leading the SkillEarn community this month</p>
        </div>

        {leaders.length === 0 ? (
          <div className="empty-state">
            <h3>No data yet</h3><p>Be the first to complete tasks and claim the top spot!</p>
          </div>
        ) : (
          <div>
            {/* Top 3 podium */}
            {leaders.length >= 3 && (
              <div style={styles.podium}>
                {[leaders[1], leaders[0], leaders[2]].map((l, i) => (
                  <div key={l._id} style={{ ...styles.podiumItem, ...(i === 1 ? styles.podiumFirst : {}) }}>
                    <div style={{ ...styles.podiumAvatar, ...(i === 1 ? styles.podiumAvatarFirst : {}) }}>
                      {l.name[0].toUpperCase()}
                    </div>
                    <div style={styles.podiumRank}>{i === 0 ? '2nd' : i === 1 ? '1st' : '3rd'}</div>
                    <div style={styles.podiumName}>{l.name.split(' ')[0]}</div>
                    <div style={styles.podiumEarned}>₹{l.totalEarned.toLocaleString('en-IN')}</div>
                    {l.isSenior && <span style={styles.seniorTag}>Senior</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Full list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {leaders.map((l, idx) => (
                <div key={l._id} style={{ ...styles.row, ...(idx % 2 === 0 ? {} : { background: '#F8F7F4' }) }}>
                  <div style={styles.rank}>
                    {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                  </div>
                  <div style={{ ...styles.avatar, background: idx === 0 ? '#F59E0B' : idx === 1 ? '#B4B2A9' : idx === 2 ? '#D85A30' : '#EEEDFE', color: idx < 3 ? '#fff' : '#3C3489' }}>
                    {l.name[0].toUpperCase()}
                  </div>
                  <div style={styles.info}>
                    <div style={styles.name}>{l.name} {l.isSenior && <span style={styles.seniorTag}>Senior</span>}</div>
                    <div style={styles.meta}>{l.college || 'Student'} · {l.city || 'India'}</div>
                    <div style={styles.skillTags}>
                      {l.skills?.slice(0, 3).map((s) => <span key={s} className="badge badge-primary" style={{ fontSize: 10, padding: '1px 7px' }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={styles.stats}>
                    <div style={styles.earned}>₹{l.totalEarned.toLocaleString('en-IN')}</div>
                    <div style={styles.tasks}>{l.tasksCompleted} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: { textAlign: 'center', marginBottom: 36 },
  title: { fontSize: 28, fontWeight: 700 },
  sub: { fontSize: 14, color: '#6B6A64', marginTop: 8 },
  podium: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 32 },
  podiumItem: { textAlign: 'center', flex: 1, maxWidth: 160 },
  podiumFirst: { transform: 'translateY(-16px)' },
  podiumAvatar: { width: 52, height: 52, borderRadius: '50%', background: '#B4B2A9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, margin: '0 auto 8px' },
  podiumAvatarFirst: { width: 64, height: 64, fontSize: 24, background: '#F59E0B' },
  podiumRank: { fontSize: 13, color: '#6B6A64', marginBottom: 4 },
  podiumName: { fontSize: 15, fontWeight: 600, marginBottom: 4 },
  podiumEarned: { fontSize: 16, fontWeight: 700, color: '#3B30CC' },
  seniorTag: { display: 'inline-block', background: '#FAEEDA', color: '#854F0B', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, marginLeft: 4 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid #E4E2DC' },
  rank: { width: 32, textAlign: 'center', fontSize: 18, flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  meta: { fontSize: 12, color: '#6B6A64', marginBottom: 4 },
  skillTags: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  stats: { textAlign: 'right', flexShrink: 0 },
  earned: { fontSize: 16, fontWeight: 700, color: '#3B30CC' },
  tasks: { fontSize: 11.5, color: '#6B6A64' },
};

export default LeaderboardPage;
