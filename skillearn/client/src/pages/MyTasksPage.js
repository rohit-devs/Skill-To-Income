import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { Badge, Button, EmptyState, Card } from '../components/ui';
import api, { getApiErrorMessage } from '../utils/api';

const STATUS_MAP = {
  open: { label: 'Open', color: 'primary' },
  assigned: { label: 'In Progress', color: 'secondary' },
  submitted: { label: 'Submitted', color: 'warning' },
  under_review: { label: 'Client Review', color: 'primary' },
  revision_requested: { label: 'Needs Revision', color: 'danger' },
  completed: { label: 'Completed', color: 'success' },
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-');

// Helper to simulate XP points
const calculateXP = (budget) => Math.round((budget || 0) / 10);

// Helper to calculate progress percentage based on status
const calculateProgress = (status) => {
  switch (status) {
    case 'open': return 0;
    case 'assigned': return 25;
    case 'submitted': return 75;
    case 'under_review': return 80;
    case 'revision_requested': return 60;
    case 'completed': return 100;
    default: return 0;
  }
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/tasks/my');
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setTasks([]);
        setError(getApiErrorMessage(err, 'Failed to load your tasks.'));
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const isStudent = user?.role === 'student';
  const isBusiness = user?.role === 'business' || user?.role === 'company';
  
  const active = tasks.filter((t) => t.status !== 'completed');
  const completed = tasks.filter((t) => t.status === 'completed');
  
  const totalStudentEarned = completed.reduce((sum, t) => sum + (t.studentPay || 0), 0);
  const totalXP = completed.reduce((sum, t) => sum + calculateXP(t.budget), 0);
  const totalBusinessSpent = completed.reduce((sum, t) => sum + (t.budget || 0), 0);
  
  const openCount = tasks.filter((t) => t.status === 'open').length;
  const inProgressCount = tasks.filter((t) => ['assigned', 'submitted', 'under_review', 'revision_requested'].includes(t.status)).length;
  const assignedCount = tasks.filter((t) => Boolean(t.assignedTo)).length;

  const pageTitle = isStudent ? 'My Workspace' : 'Project Management';
  const pageSubtitle = isStudent
    ? 'Track accepted tasks, active progress, and earned XP.'
    : 'Actionable Kanban tracking for your posted projects.';

  // Render a Single Task Card (List View for Students / Fallback)
  const renderTaskCard = (task) => {
    const status = STATUS_MAP[task.status] || STATUS_MAP.open;
    const studentPay = task.studentPay || Math.round((task.budget || 0) * 0.88);
    const xp = calculateXP(task.budget);
    const progress = calculateProgress(task.status);

    return (
      <Link key={task._id} to={`/tasks/${task._id}`} className="block transition-all hover:-translate-y-0.5">
        <Card className="px-5 py-5 border-outline-v/30 hover:border-outline-v/50 hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start bg-s-low">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-2 flex-wrap items-center">
              <Badge variant="secondary" size="sm" className="font-extrabold uppercase tracking-widest text-[10px]">{task.category}</Badge>
              <Badge variant={status.color} size="sm">{status.label}</Badge>
              {task.hasAITest && <Badge variant="primary" size="sm" className="bg-primary/10 text-primary">AI Validated</Badge>}
            </div>

            <h3 className="text-[16px] font-extrabold text-on-surface mb-2 leading-snug">{task.title}</h3>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-on-sv font-medium">
              {isStudent && task.postedBy && (
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">storefront</span> {task.postedBy.businessName || task.postedBy.name}</span>
              )}
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_today</span> Due {task.deadline}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">history</span> {isStudent ? `Posted ${formatDate(task.createdAt)}` : task.submittedAt ? `Submitted ${formatDate(task.submittedAt)}` : `Posted ${formatDate(task.createdAt)}`}</span>
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="mt-4 pt-4 border-t border-outline-v/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-on-sv">Task Lifecycle</span>
                <span className="text-[11px] font-black text-on-surface">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-s-mid rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Value Engine */}
          <div className="md:w-40 shrink-0 bg-s-mid/50 rounded-xl p-4 border border-outline-v/20 flex flex-col items-end text-right w-full">
            <div className="text-[20px] font-black text-on-surface tracking-tight mb-0.5">
              {isStudent ? formatCurrency(studentPay) : formatCurrency(task.budget)}
            </div>
            <div className="text-[10px] uppercase font-black tracking-widest text-on-sv mb-3">
              {isStudent ? 'Est. Payout' : 'Total Budget'}
            </div>
            {isStudent && (
              <div className="flex items-center gap-1.5 mb-2 bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                <span className="material-symbols-outlined text-[14px] icon-fill">stars</span>
                <span className="text-[12px] font-extrabold">+{xp} XP</span>
              </div>
            )}
            <div className="mt-auto">
              <Button size="sm" variant="outline" className="w-full mt-3">View Details</Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  // Render Kanban Columns for Business Workspace
  const renderKanban = () => {
    const columns = [
      { id: 'open', title: 'Open', status: ['open'] },
      { id: 'progress', title: 'In Progress', status: ['assigned'] },
      { id: 'review', title: 'Needs Review', status: ['submitted', 'under_review', 'revision_requested'] },
      { id: 'done', title: 'Completed', status: ['completed'] }
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[500px]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => col.status.includes(t.status));
          return (
            <div key={col.id} className="flex-1 min-w-[300px] w-[300px] bg-s-low/50 border border-outline-v/20 rounded-2xl p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-v/20">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-on-surface">{col.title}</h3>
                <Badge variant="secondary" size="sm">{colTasks.length}</Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[32px] text-on-sv/30 mb-2">inbox</span>
                    <p className="text-[12px] font-bold text-on-sv">No tasks</p>
                  </div>
                ) : colTasks.map(task => (
                  <Link key={task._id} to={`/tasks/${task._id}`}>
                    <Card className="p-3.5 border-outline-v/30 hover:border-primary/50 hover:shadow-md cursor-pointer transition-all bg-bg relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1 h-full bg-${STATUS_MAP[task.status]?.color || 'primary'}`} />
                      <div className="pl-2">
                        <div className="text-[10px] font-black text-on-sv uppercase tracking-widest mb-1.5">{task.category}</div>
                        <h4 className="text-[14px] font-bold text-on-surface leading-snug mb-2 line-clamp-2">{task.title}</h4>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-[12px] font-black text-primary">{formatCurrency(task.budget)}</div>
                          {task.assignedTo && (
                            <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-surface" title={task.assignedTo.name}>
                              {task.assignedTo.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout title={pageTitle}>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-v/20 pb-5">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight text-on-surface mb-1">{pageTitle}</h1>
            <p className="text-[13.5px] text-on-sv font-medium">{pageSubtitle}</p>
          </div>
          <div className="flex gap-2">
            {isBusiness && (
              <Link to="/post-task">
                <Button variant="primary" leftIcon="add">Create Project</Button>
              </Link>
            )}
            {user?.isSenior && (
              <Link to="/senior">
                <Button variant="secondary" leftIcon="rate_review">Review Queue</Button>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
            <span className="text-error text-[13.5px] font-bold">{error}</span>
          </div>
        )}

        {/* Analytics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isStudent ? (
            <>
              <StatCard title="Total Tasks" value={tasks.length} icon="assignment" variant="primary" />
              <StatCard title="Active Work" value={active.length} icon="pending_actions" variant="warning" />
              <StatCard title="Earned XP" value={`${totalXP} pts`} icon="stars" variant="secondary" />
              <StatCard title="Total Earned" value={formatCurrency(totalStudentEarned)} icon="payments" variant="success" />
            </>
          ) : (
            <>
              <StatCard title="Projects Posted" value={tasks.length} icon="assignment" variant="primary" />
              <StatCard title="Open Tasks" value={openCount} icon="inbox" variant="warning" />
              <StatCard title="Assigned Workers" value={assignedCount} icon="groups" variant="secondary" />
              <StatCard title="Total Capital" value={formatCurrency(totalBusinessSpent)} icon="account_balance_wallet" variant="success" />
            </>
          )}
        </div>

        {/* Dynamic Display Mode */}
        {loading ? (
          <div className="flex flex-col gap-4 py-8">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-s-low/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-8">
            <EmptyState 
              icon="inventory_2" 
              title={isStudent ? "Workspace is empty" : "No projects posted"} 
              description={isStudent ? "Browse the marketplace and accept tasks to start earning Points and Income." : "Post your first project to assign students and track their progress here."}
              action={
                <Link to={isStudent ? '/tasks' : '/post-task'}>
                  <Button variant="primary" leftIcon={isStudent ? "explore" : "add"}>
                    {isStudent ? "Browse Projects" : "Create Task"}
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-4">
            {isBusiness ? (
              // Business get the robust Kanban management mode
              renderKanban()
            ) : (
              // Students get the classic detailed listing with Progress & XP
              <>
                <div className="flex gap-1 border-b border-outline-v/20 mb-6 custom-scrollbar overflow-x-auto pb-0">
                  <button 
                    onClick={() => setTab('active')}
                    className={`px-5 py-3 text-[13px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${tab === 'active' ? 'border-primary text-primary' : 'border-transparent text-on-sv hover:text-on-surface'}`}
                  >
                    Active Progress ({active.length})
                  </button>
                  <button 
                    onClick={() => setTab('completed')}
                    className={`px-5 py-3 text-[13px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${tab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-on-sv hover:text-on-surface'}`}
                  >
                    Completed ({completed.length})
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {(tab === 'active' ? active : completed).length === 0 ? (
                    <EmptyState 
                      icon="task_alt" 
                      title={`No ${tab} tasks`} 
                      description={`You don't have any ${tab} assignments currently.`} 
                    />
                  ) : (
                    (tab === 'active' ? active : completed).map(renderTaskCard)
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
