const Task = require('../models/Task');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  const isStudent = req.user.role === 'student';

  const filter = isStudent ? { assignedTo: req.user._id } : { postedBy: req.user._id };

  const tasks = await Task.find(filter)
    .populate('postedBy', 'name businessName city')
    .populate('assignedTo', 'name college city')
    .sort({ updatedAt: -1 });

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const activeTasksCount = tasks.filter(
    (t) =>
      t.status === 'assigned' ||
      t.status === 'revision_requested' ||
      t.status === 'submitted' ||
      t.status === 'under_review'
  ).length;

  let totalEarned = 0;
  let readinessScore = 0;
  let recommendedTasks = [];

  if (isStudent) {
    totalEarned = completedTasks.reduce((acc, t) => acc + (t.studentPay || 0), 0);
    
    // Calculate Skill-To-Income Readiness (e.g. Needs 10 tasks to become Senior)
    const tasksDone = req.user.tasksCompleted || completedTasks.length;
    readinessScore = Math.min(100, Math.floor((tasksDone / 10) * 100));

    // Fetch a few unassigned tasks to recommend
    recommendedTasks = await Task.find({ status: 'open' })
      .populate('postedBy', 'name businessName city')
      .sort({ createdAt: -1 })
      .limit(3);
  } else {
    totalEarned = completedTasks.reduce((acc, t) => acc + (t.budget || 0), 0); // businesses track total spent here
  }

  res.json({
    totalEarned,
    completedTasks: completedTasks.length,
    activeTasks: activeTasksCount,
    allTasks: tasks, // sending latest tasks to populate the task list
    readinessScore,
    recommendedTasks,
  });
};

module.exports = {
  getDashboardStats,
};
