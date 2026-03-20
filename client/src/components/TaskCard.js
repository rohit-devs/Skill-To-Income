import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  Design: { bg: '#EEEDFE', color: '#3C3489' },
  Writing: { bg: '#E1F5EE', color: '#085041' },
  Data: { bg: '#FAEEDA', color: '#633806' },
  'Social Media': { bg: '#FAECE7', color: '#4A1B0C' },
  Video: { bg: '#E6F1FB', color: '#0C447C' },
  Coding: { bg: '#EAF3DE', color: '#27500A' },
  Research: { bg: '#FBEAF0', color: '#4B1528' },
  Other: { bg: '#F1EFE8', color: '#444441' },
};

const URGENCY_COLOR = (deadline) => {
  if (!deadline) return '#10B981';
  if (deadline.includes('6') || deadline.includes('12')) return '#EF4444';
  if (deadline.includes('24')) return '#F59E0B';
  return '#10B981';
};

const TaskCard = ({ task }) => {
  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
  const urgencyColor = URGENCY_COLOR(task.deadline);
  const businessName = task.postedBy?.businessName || task.postedBy?.name || 'Business';

  return (
    <Link to={`/tasks/${task._id}`} style={{ textDecoration: 'none' }}>
      <div style={styles.card}>
        {/* Top row */}
        <div style={styles.topRow}>
          <span style={{ ...styles.catBadge, background: cat.bg, color: cat.color }}>
            {task.category}
          </span>
          {task.priority && (
            <span style={styles.featuredBadge}>⭐ Featured</span>
          )}
          <span style={styles.pay}>₹{task.budget}</span>
        </div>

        {/* Title */}
        <h3 style={styles.title}>{task.title}</h3>

        {/* Business */}
        <div style={styles.meta}>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>🏪</span>
            <span>{businessName}</span>
          </div>
          {task.postedBy?.city && (
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>📍</span>
              <span>{task.postedBy.city}</span>
            </div>
          )}
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>⏰</span>
            <span>Due in {task.deadline}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.urgencyBar}>
            <div style={{ ...styles.urgencyFill, background: urgencyColor }} />
          </div>
          <div style={styles.studentPay}>
            Student earns <strong>₹{task.studentPay}</strong>
          </div>
          <span style={styles.viewBtn}>View →</span>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    background: '#fff', border: '1px solid #E4E2DC', borderRadius: 12,
    padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s',
    ':hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)', transform: 'translateY(-2px)' },
  },
  topRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  catBadge: { padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500 },
  featuredBadge: { background: '#FAEEDA', color: '#854F0B', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500 },
  pay: { marginLeft: 'auto', fontWeight: 700, fontSize: 16, color: '#1A1A18' },
  title: { fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 10, lineHeight: 1.4 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 12 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#6B6A64' },
  metaIcon: { fontSize: 12 },
  footer: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  urgencyBar: { flex: 1, height: 4, background: '#E4E2DC', borderRadius: 999, overflow: 'hidden' },
  urgencyFill: { width: '60%', height: '100%', borderRadius: 999 },
  studentPay: { fontSize: 12, color: '#6B6A64' },
  viewBtn: { fontSize: 12.5, fontWeight: 500, color: '#3B30CC' },
};

export default TaskCard;
