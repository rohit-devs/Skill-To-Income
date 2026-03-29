import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import ActivityFeed from '../../components/ActivityFeed';
import { Badge, Button, Skeleton } from '../../components/ui';
import api from '../../utils/api';

const EarningsChart = lazy(() => import('../../components/EarningsChart'));

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

/* ── Readiness progress bar ─────────────────────────────────── */
function ReadinessBar({ score }) {
  const milestone = score >= 100 ? 'Senior unlocked 🎉' : `${100 - score}% to Senior`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-sv">S2I Readiness</span>
        <span className="text-[11px] font-black text-primary">{score}%</span>
      </div>
      <div className="relative w-full h-2 bg-s-high rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-dim to-primary rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-on-sv">{milestone}</span>
    </div>
  );
}

/* ── Recommended task row ───────────────────────────────────── */
function RecommendedTask({ task }) {
  return (
    <Link
      to={`/tasks/${task._id}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-s-low border border-transparent hover:border-primary/20 hover:bg-s-mid hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge variant="primary" size="sm">{task.category}</Badge>
          {task.priority && <Badge variant="secondary" size="sm">Priority</Badge>}
        </div>
        <h4 className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
          {task.title}
        </h4>
        <p className="text-[11px] text-on-sv mt-0.5">Due in {task.deadline}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-black text-success leading-tight">
          {fmt(task.studentPay)}
        </div>
        <div className="text-[9px] uppercase font-bold tracking-wide text-on-sv mt-0.5">Payout</div>
      </div>
      <span className="material-symbols-outlined text-on-sv text-[18px] group-hover:text-primary group-hover:translate-x-0.5 transition-all">
        chevron_right
      </span>
    </Link>
  );
}

/* ── Skeleton grid ─────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-7 animate-pulse">
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0,1,2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────── */
export default function StudentHome() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/dashboard/stats')
      .then(({ data }) => { if (active) setStats(data); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const headerCTA = (
    <Link to="/tasks">
      <Button variant="primary" size="sm" leftIcon="add_task">
        Find Tasks
      </Button>
    </Link>
  );

  if (loading) {
    return (
      <DashboardLayout title="Overview" headerAction={headerCTA}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const s = stats || {};
  const hasActiveTasks     = (s.activeTasks || 0) > 0;
  const recommendedTasks   = s.recommendedTasks || [];
  const allTasks           = s.allTasks || [];
  const readiness          = s.readinessScore || 0;

  return (
    <DashboardLayout title="Overview" headerAction={headerCTA}>

      {/* ── 1. Greeting ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">
            Good {getGreeting()}, {firstName} 👋
          </h2>
          <p className="text-sm text-on-sv mt-0.5">
            {hasActiveTasks
              ? `You have ${s.activeTasks} active task${s.activeTasks > 1 ? 's' : ''} in progress.`
              : 'Ready to earn? Browse the latest tasks below.'}
          </p>
        </div>
        {user?.isSenior && (
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-1.5">
            <span className="material-symbols-outlined text-success text-[15px] icon-fill">verified</span>
            <span className="text-success text-[11px] font-black uppercase tracking-wide">Senior Reviewer</span>
          </div>
        )}
      </div>

      {/* ── 2. Hero + Readiness row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Hero CTA card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#2D24C4] via-[#4F46E5] to-[#6D67F5] p-8 md:p-10 shadow-2xl shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/10 ring-1 ring-white/5">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-white/70 text-[10px] font-black uppercase tracking-[0.15em] mb-2">
              {hasActiveTasks ? '⚡ Action needed' : '🚀 Next best action'}
            </div>
            <h3 className="text-white text-[20px] font-extrabold leading-snug mb-1">
              {hasActiveTasks ? 'Complete your active tasks' : 'Start earning today'}
            </h3>
            <p className="text-white/80 text-[13px]">
              {hasActiveTasks
                ? 'Finish submissions to secure your payouts.'
                : recommendedTasks.length > 0
                  ? `Top task pays ${fmt(recommendedTasks[0].studentPay)} — grab it before it's gone.`
                  : 'New tasks are posted every day. Check the board.'}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link to={hasActiveTasks ? '/my-tasks' : '/tasks'}>
              <button className="bg-white text-primary-dim font-black text-[13px] px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-opacity-95 hover:-translate-y-0.5 active:scale-95 transition-all">
                {hasActiveTasks ? 'Go to My Tasks →' : 'Browse Tasks →'}
              </button>
            </Link>
          </div>
        </div>

        {/* Readiness + streak card */}
        <div className="bg-s-low rounded-[24px] border border-outline-v/30 p-8 flex flex-col justify-between gap-6 shadow-sm">
          <ReadinessBar score={readiness} />
          <div className="h-px bg-outline-v/20" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary icon-fill text-[20px]">local_fire_department</span>
            </div>
            <div>
              <div className="text-[15px] font-black text-on-surface leading-tight">{user?.streak || 0}-day streak</div>
              <div className="text-[11px] text-on-sv">Keep it going!</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Earnings"
          value={fmt(s.totalEarned)}
          icon="account_balance_wallet"
          variant="success"
          trend={s.totalEarned > 0 ? '+12% this month' : undefined}
          subtitle="Lifetime payout"
        />
        <StatCard
          title="Active Tasks"
          value={s.activeTasks || 0}
          icon="pending_actions"
          variant="warning"
          subtitle={s.activeTasks ? 'awaiting submission' : 'Nothing in progress'}
        />
        <StatCard
          title="Completed"
          value={s.completedTasks || 0}
          icon="task_alt"
          variant="primary"
          subtitle={`${user?.tasksCompleted || 0} total`}
          trend={s.completedTasks > 0
            ? { value: `${s.completedTasks} done`, isUp: true }
            : undefined}
        />
      </div>

      {/* ── 4. Chart + Activity (side-by-side) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Earnings chart card */}
        <div className="bg-s-low rounded-[24px] border border-outline-v/30 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-extrabold text-on-surface">Earnings Overview</h3>
              <p className="text-[11px] text-on-sv mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] font-black text-success">Earnings</span>
            </div>
          </div>
          <Suspense fallback={<div className="h-40 bg-s-mid rounded-lg animate-pulse" />}>
            <EarningsChart totalEarned={s.totalEarned || 0} />
          </Suspense>
        </div>

        {/* Activity feed card */}
        <div className="bg-s-low rounded-[24px] border border-outline-v/30 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-extrabold text-on-surface">Recent Activity</h3>
            <Link to="/my-tasks" className="text-[12px] font-bold text-primary hover:underline">
              View all →
            </Link>
          </div>
          <ActivityFeed tasks={allTasks} loading={false} />
        </div>
      </div>

      {/* ── 5. Recommended Tasks ────────────────────────────────── */}
      <div className="bg-s-low rounded-[24px] border border-outline-v/30 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-extrabold text-on-surface">Recommended for You</h3>
            <p className="text-[11px] text-on-sv mt-0.5">Matched to your skills</p>
          </div>
          <Link to="/tasks">
            <Button variant="ghost" size="sm" rightIcon="arrow_forward">Browse All</Button>
          </Link>
        </div>

        {recommendedTasks.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 text-on-sv gap-3">
            <span className="material-symbols-outlined text-3xl opacity-25">inbox</span>
            <p className="text-[13px] font-bold">No recommendations yet</p>
            <p className="text-[11px] text-on-sv/60">Complete skill tests to unlock personalised matches.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendedTasks.slice(0, 5).map(task => (
              <RecommendedTask key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
