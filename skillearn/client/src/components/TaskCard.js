import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';

const CAT_ICON = {
  Design: 'palette', Writing: 'edit', Data: 'bar_chart',
  'Social Media': 'share', Video: 'videocam', Coding: 'code',
  Research: 'search', Marketing: 'campaign', Other: 'work',
};

const CAT_COLOR = {
  Design:        'bg-primary/10 text-primary',
  Writing:       'bg-success/10 text-success',
  Data:          'bg-secondary/15 text-secondary',
  'Social Media':'bg-error/10 text-error',
  Video:         'bg-indigo-400/10 text-indigo-400',
  Coding:        'bg-primary-dim/10 text-primary-dim',
  Research:      'bg-warning/10 text-warning',
  Marketing:     'bg-pink-400/10 text-pink-400',
  Other:         'bg-s-high text-on-sv',
};

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function TaskCard({ task, compact = false }) {
  const catIcon   = CAT_ICON[task.category]  || 'work';
  const catColor  = CAT_COLOR[task.category] || CAT_COLOR.Other;
  const pay       = task.studentPay ?? Math.round((task.budget || 0) * 0.88);
  const bizName   = task.postedBy?.businessName || task.postedBy?.name || 'Verified Business';
  const isUrgent  = /^(6|12)\s*hr/i.test(task.deadline || '');

  if (compact) {
    return (
      <Link to={`/tasks/${task._id}`} className="block group">
        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-s-low border border-outline-v hover:border-primary/40 hover:bg-s-mid hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all duration-300">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${catColor}`}>
            <span className="material-symbols-outlined text-[17px] icon-fill">{catIcon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={task.status} size="sm" />
              <span className="text-[10px] text-on-sv">Due {task.deadline}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[14px] font-black text-success">{fmt(pay)}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/tasks/${task._id}`} className="block group h-full">
      <div className="task-card h-full flex flex-col overflow-hidden">

        {/* Priority ribbon */}
        {task.priority && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-accent-cyan to-primary text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-[24px] z-10 shadow-sm">
            ⭐ Featured
          </div>
        )}

        <div className="p-6 md:p-7 flex flex-col flex-1">
          {/* Category + Status row */}
          <div className="flex flex-wrap gap-2.5 mb-5 items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wide ${catColor}`}>
              <span className="material-symbols-outlined text-[12px] icon-fill">{catIcon}</span>
              {task.category}
            </span>
            {task.status && <Badge status={task.status} size="sm" />}
            {isUrgent && (
              <span className="inline-flex items-center gap-1 bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wide">
                <span className="material-symbols-outlined text-[11px]">bolt</span>
                Urgent
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-extrabold text-on-surface leading-snug mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-[13px] text-on-sv leading-relaxed mb-4 flex-grow line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-on-sv font-semibold mb-6">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">storefront</span>
              {bizName}
            </span>
            {task.postedBy?.city && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {task.postedBy.city}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {task.deadline}
            </span>
            {task.revisions > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">redo</span>
                {task.revisions} revision{task.revisions > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-outline-v/20 pt-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-on-sv mb-1">Student Payout</div>
              <div className="text-[22px] font-black text-success tracking-tight leading-none">{fmt(pay)}</div>
              {task.budget && task.budget !== pay && (
                <div className="text-[10px] text-on-sv mt-0.5">Budget: ₹{task.budget}</div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 bg-s-highest text-primary font-bold text-[12.5px] px-4 py-2.5 rounded-xl
              group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent-violet group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] transition-all duration-300 shrink-0">
              {task.status === 'open' ? 'Accept Task' : 'View Details'}
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
