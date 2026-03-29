import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';

const STATUS_ICON = {
  open:               'radio_button_unchecked',
  assigned:           'pending',
  submitted:          'upload_file',
  under_review:       'rate_review',
  revision_requested: 'edit_note',
  completed:          'task_alt',
  cancelled:          'cancel',
  disputed:           'gavel',
};

const TIME_AGO = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

function ActivityItem({ task, index }) {
  const icon   = STATUS_ICON[task.status] || 'info';
  const isNew  = index === 0;

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="flex items-start gap-3 p-3.5 rounded-lg hover:bg-s-mid transition-all duration-150 group"
    >
      {/* Timeline dot + icon */}
      <div className="relative flex flex-col items-center shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg bg-s-mid border border-outline-v/30 flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-colors">
          <span className="material-symbols-outlined text-on-sv text-[16px] group-hover:text-primary transition-colors icon-fill">
            {icon}
          </span>
        </div>
        {isNew && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-s-low animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge status={task.status} size="sm" />
          <span className="text-[10px] text-on-sv font-semibold">{TIME_AGO(task.updatedAt)}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-[12px] font-black text-success">
          ₹{(task.studentPay || 0).toLocaleString('en-IN')}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wide text-on-sv mt-0.5">Payout</div>
      </div>
    </Link>
  );
}

/**
 * ActivityFeed — shows recent task activity for the user
 * @param {Array} tasks - list of user's tasks
 * @param {boolean} loading
 */
export default function ActivityFeed({ tasks = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-s-mid shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-s-mid rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-s-mid rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const recentTasks = [...tasks]
    .filter(t => t.status !== 'open')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  if (recentTasks.length === 0) {
    return (
      <div className="text-center py-10 text-on-sv">
        <span className="material-symbols-outlined text-3xl opacity-30 block mb-2">history</span>
        <p className="text-xs font-bold">No activity yet — accept a task to start!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {recentTasks.map((task, i) => (
        <ActivityItem key={task._id} task={task} index={i} />
      ))}
    </div>
  );
}
