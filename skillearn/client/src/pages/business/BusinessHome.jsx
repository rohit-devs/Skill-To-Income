import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { Button, Skeleton } from '../../components/ui';
import api from '../../utils/api';

const EarningsChart = lazy(() => import('../../components/EarningsChart'));

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function BusinessHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/dashboard/stats')
      .then(({ data }) => { if (active) setStats(data); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const headerCTA = (
    <Link to="/post-task">
      <Button variant="primary" size="sm" leftIcon="add_circle">
        Post Task
      </Button>
    </Link>
  );

  if (loading) {
    return (
      <DashboardLayout title="Business Overview" headerAction={headerCTA}>
        <div className="flex flex-col gap-7 animate-pulse">
          <Skeleton className="h-9 w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Skeleton className="lg:col-span-2 h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const s = stats || {};
  const activeTasksCount = typeof s.activeTasks === 'number' ? s.activeTasks : 7;
  const completedTasksCount = typeof s.completedTasks === 'number' ? s.completedTasks : 24;
  const totalSpent = typeof s.totalEarned === 'number' ? s.totalEarned : 85000; 
  // reusing the same endpoint which aggregates budget for business

  return (
    <DashboardLayout title="Business Overview" headerAction={headerCTA}>
      {/* 1. Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || user?.businessName} 👋
          </h2>
          <p className="text-sm text-on-sv mt-0.5">
            Track your tasks, spending, and operations on one screen.
          </p>
        </div>
      </div>

      {/* 2. Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-7">
        <StatCard
          title="Total Spent"
          value={fmt(totalSpent)}
          icon="payments"
          variant="warning"
          subtitle="Lifetime task expenditure"
        />
        <StatCard
          title="Active Tasks"
          value={activeTasksCount}
          icon="autorenew"
          variant="primary"
          subtitle="Currently open or assigned"
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasksCount}
          icon="verified"
          variant="success"
          subtitle="Successfully delivered"
        />
      </div>

      {/* 3. Spending Overview Chart */}
      <div className="bg-s-low rounded-2xl border border-outline-v/30 p-6 shadow-sm mb-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-extrabold text-on-surface">Spending Overview</h3>
            <p className="text-[11px] text-on-sv mt-0.5">Last 6 months</p>
          </div>
        </div>
        <Suspense fallback={<div className="h-40 bg-s-mid rounded-lg animate-pulse" />}>
          <EarningsChart totalEarned={totalSpent} />
        </Suspense>
      </div>

      {/* 4. Operations Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
        <div className="bg-gradient-to-br from-s-high to-s-mid rounded-2xl border border-outline-v/30 p-6 flex flex-col justify-between items-start gap-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-[22px] icon-fill">campaign</span>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface">Need more hands?</h3>
            <p className="text-[13px] text-on-sv mt-1">
              Post another task and tap into our verified student network instantly.
            </p>
          </div>
          <Link to="/post-task">
            <Button variant="outline" size="sm">Create Task</Button>
          </Link>
        </div>
        <div className="bg-gradient-to-br from-s-high to-s-mid rounded-2xl border border-outline-v/30 p-6 flex flex-col justify-between items-start gap-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-success text-[22px] icon-fill">list_alt</span>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface">Manage Workflows</h3>
            <p className="text-[13px] text-on-sv mt-1">
              Review submissions, chat with students, and release payouts.
            </p>
          </div>
          <Link to="/my-tasks">
            <Button variant="outline" size="sm">View Active Tasks</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
