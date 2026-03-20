import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EarningsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/earnings').then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const maxBar = data?.weekly ? Math.max(...data.weekly.map((w) => w.amount), 1) : 1;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={styles.title}>Earnings Dashboard</h1>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.heroCard}>
            <div style={styles.heroLabel}>Total earned</div>
            <div style={styles.heroVal}>₹{(data?.totalEarned || 0).toLocaleString('en-IN')}</div>
            <div style={styles.heroSub}>{user?.tasksCompleted || 0} tasks completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>This month</div>
            <div style={styles.statVal}>
              ₹{data?.completedTasks?.filter(t => {
                const d = new Date(t.updatedAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).reduce((s, t) => s + (t.studentPay || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Avg per task</div>
            <div style={styles.statVal}>
              ₹{data?.completedTasks?.length ? Math.round(data.totalEarned / data.completedTasks.length) : 0}
            </div>
          </div>
          {user?.isSenior && (
            <div style={{ ...styles.statCard, background: '#FAEEDA' }}>
              <div style={styles.statLabel}>Status</div>
              <div style={{ ...styles.statVal, color: '#854F0B' }}>⭐ Senior</div>
            </div>
          )}
        </div>

        {/* Weekly bar chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={styles.sectionTitle}>Weekly earnings</h3>
          <div style={styles.barChart}>
            {data?.weekly?.map((w) => (
              <div key={w.label} style={styles.barCol}>
                <div style={styles.barAmount}>₹{w.amount}</div>
                <div style={styles.barWrap}>
                  <div style={{ ...styles.bar, height: `${Math.max((w.amount / maxBar) * 100, 4)}%` }} />
                </div>
                <div style={styles.barLabel}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payouts */}
        <div className="card">
          <h3 style={styles.sectionTitle}>Recent payouts</h3>
          {data?.completedTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <p>No completed tasks yet. Accept a task to start earning!</p>
            </div>
          ) : (
            <div>
              {data?.completedTasks?.slice(0, 10).map((task, i) => (
                <div key={task._id}>
                  {i > 0 && <hr className="divider" style={{ margin: '12px 0' }} />}
                  <div style={styles.payoutRow}>
                    <div>
                      <div style={styles.payoutTitle}>{task.title}</div>
                      <div style={styles.payoutMeta}>
                        {task.postedBy?.businessName || task.postedBy?.name} · {new Date(task.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={styles.payoutRight}>
                      <div style={styles.payoutAmount}>+₹{task.studentPay}</div>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>Paid</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 26, fontWeight: 700, marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 24 },
  heroCard: { background: 'linear-gradient(135deg, #3B30CC, #1E1B4B)', borderRadius: 14, padding: '24px 20px', color: '#fff' },
  heroLabel: { fontSize: 13, opacity: 0.75, marginBottom: 8 },
  heroVal: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
  heroSub: { fontSize: 13, opacity: 0.7 },
  statCard: { background: '#fff', border: '1px solid #E4E2DC', borderRadius: 12, padding: '20px' },
  statLabel: { fontSize: 12, color: '#6B6A64', marginBottom: 8 },
  statVal: { fontSize: 22, fontWeight: 700 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20 },
  barChart: { display: 'flex', gap: 8, height: 140, alignItems: 'flex-end' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' },
  barAmount: { fontSize: 10, color: '#6B6A64', whiteSpace: 'nowrap' },
  barWrap: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', background: '#F1EFE8', borderRadius: 4 },
  bar: { width: '100%', background: '#3B30CC', borderRadius: 4, transition: 'height 0.3s' },
  barLabel: { fontSize: 11, color: '#6B6A64' },
  payoutRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  payoutTitle: { fontSize: 14, fontWeight: 500, marginBottom: 4 },
  payoutMeta: { fontSize: 12, color: '#6B6A64' },
  payoutRight: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  payoutAmount: { fontSize: 15, fontWeight: 600, color: '#10B981' },
};

export default EarningsPage;
