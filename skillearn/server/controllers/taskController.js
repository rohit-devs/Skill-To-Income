const Task = require('../models/Task');
const TaskTest = require('../models/TaskTest');
const User = require('../models/User');

const STATUS_ALIAS_MAP = {
  accepted: 'assigned',
  in_progress: 'assigned',
  completed: 'completed',
};

const normalizeCategory = (value) => (value === 'skill' ? 'Other' : value);

const getCanonicalCategory = (value) => {
  if (!value) return value;
  return normalizeCategory(String(value).trim());
};

const getCanonicalBudget = (body) => body.budget ?? body.price;

const serializeTask = (task) => {
  const serialized = typeof task.toJSON === 'function' ? task.toJSON() : task;
  return {
    ...serialized,
    price: serialized.budget,
    skill: serialized.category,
  };
};

const serializeTasks = (tasks) => tasks.map(serializeTask);

const canUpdateToCompleted = (task, user) => {
  if (user.role === 'admin') return true;
  if (
    (user.role === 'business' || user.role === 'company') &&
    String(task.postedBy) === String(user._id)
  ) {
    return ['under_review', 'completed'].includes(task.status);
  }
  return false;
};

const getTasks = async (req, res) => {
  const { category, search, status } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = 'open';
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const tasks = await Task.find(filter)
    .populate('postedBy', 'name businessName city rating ratingCount role')
    .sort({ priority: -1, createdAt: -1 });

  res.json(serializeTasks(tasks));
};

const getMyTasks = async (req, res) => {
  const isStudent = req.user.role === 'student';
  const filter = isStudent
    ? { assignedTo: req.user._id }
    : { postedBy: req.user._id };

  const query = Task.find(filter).sort({ createdAt: -1 });

  if (isStudent) {
    query.populate('postedBy', 'name businessName city');
  } else {
    query.populate('assignedTo', 'name college city rating tasksCompleted skills');
  }

  const tasks = await query;
  res.json(serializeTasks(tasks));
};

const getTasksForReview = async (req, res) => {
  const tasks = await Task.find({ status: 'submitted' })
    .populate('postedBy', 'name businessName')
    .populate('assignedTo', 'name college city')
    .sort({ submittedAt: 1 });

  res.json(serializeTasks(tasks));
};

const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('postedBy', 'name businessName city rating ratingCount role')
    .populate('assignedTo', 'name college city skills rating')
    .populate('reviewedBy', 'name');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.json(serializeTask(task));
};

const createTask = async (req, res) => {
  console.log('Create Task Request:', req.body);
  const { title, deadline, revisions, priority } = req.body;

  if (req.user.role === 'business' || req.user.role === 'company') {
    const limits = { free: 3, basic: 10, pro: 999 };
    const plan = req.user.subscriptionPlan || 'free';
    
    const activeTasksCount = await Task.countDocuments({ 
      postedBy: req.user._id, 
      status: { $in: ['open', 'assigned', 'submitted', 'under_review', 'revision_requested'] } 
    });
    
    if (activeTasksCount >= limits[plan]) {
        return res.status(403).json({ message: `Your ${plan.toUpperCase()} plan limits you to ${limits[plan]} active tasks simultaneously. Upgrade your plan or wait for a task to complete.` });
    }
  }

  const category = getCanonicalCategory(req.body.category || req.body.skill);
  const budget = getCanonicalBudget(req.body);

  if (!category) {
    return res.status(400).json({ message: 'Category or skill is required' });
  }

  if (budget === undefined || budget === null || Number.isNaN(Number(budget))) {
    return res.status(400).json({ message: 'Budget or price must be a number' });
  }

  const task = await Task.create({
    ...req.body,
    category,
    budget: Number(budget),
    deadline: String(deadline),
    revisions: Number(revisions) || 1,
    priority: priority === true || priority === 'true',
    postedBy: req.user._id,
  });

  if (req.user.role === 'business' || req.user.role === 'company') {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tasksPosted: 1 } });
  }

  res.status(201).json(serializeTask(task));
};

const acceptTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.status !== 'open') {
    return res.status(400).json({ message: 'This task is no longer available' });
  }

  if (String(task.assignedTo) === String(req.user._id)) {
    return res.status(400).json({ message: 'You already accepted this task' });
  }

  if (task.hasAITest) {
    const test = await TaskTest.findOne({ taskId: task._id });
    const attempt = test?.attempts?.find((entry) => String(entry.studentId) === String(req.user._id));

    if (!attempt?.passed || attempt.percentage < (test?.passThreshold || 70)) {
      return res.status(403).json({ message: 'Pass the AI quiz with at least 70% before accepting this task' });
    }
  }

  task.status = 'assigned';
  task.assignedTo = req.user._id;
  await task.save();

  await User.findByIdAndUpdate(req.user._id, { $inc: { activeTasks: 1 } });

  res.json({ message: 'Task accepted! Get started and submit your work.', task: serializeTask(task) });
};

const submitTaskForReview = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(task.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: 'This is not your task' });
  }

  if (!['assigned', 'revision_requested'].includes(task.status)) {
    return res.status(400).json({ message: 'Task is not in a submittable state' });
  }

  const submissionLink = req.body.link || '';
  if (!submissionLink.trim()) {
    return res.status(400).json({ message: 'Add a file upload or valid submission link before submitting' });
  }

  task.status = 'submitted';
  task.submissionNote = req.body.note || '';
  task.submissionLink = submissionLink;
  task.submittedAt = new Date();
  await task.save();

  res.json({ message: 'Work submitted! A senior student will review it shortly.', task: serializeTask(task) });
};

const reviewTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.status !== 'submitted') {
    return res.status(400).json({ message: 'Task is not awaiting review' });
  }

  const { action, note } = req.body;

  task.reviewedBy = req.user._id;
  task.reviewNote = note || '';
  task.reviewedAt = new Date();
  task.status = action === 'approve' ? 'under_review' : 'revision_requested';
  await task.save();

  res.json({
    message: action === 'approve' ? 'Approved and sent to the client for final review.' : 'Revision requested and sent back to the student.',
    task: serializeTask(task),
  });
};

const clientApproveTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedTo');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(task.postedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'This is not your task' });
  }

  if (task.status !== 'under_review') {
    return res.status(400).json({ message: 'Task must pass senior review first' });
  }

  task.status = 'completed';
  task.isPaid = true;
  await task.save();

  if (task.assignedTo) {
    const pay = task.studentPay || Math.round(task.budget * 0.88);

    await User.findByIdAndUpdate(task.assignedTo._id, {
      $inc: { totalEarned: pay, tasksCompleted: 1, activeTasks: -1 },
    });

    const student = await User.findById(task.assignedTo._id);
    if (student && student.tasksCompleted >= 10 && !student.isSenior) {
      await User.findByIdAndUpdate(student._id, { isSenior: true });
    }
  }

  res.json({ message: 'Task completed and payment released to the student.', task: serializeTask(task) });
};

const updateTaskStatus = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const requestedStatus = String(req.body.status).trim();
  const normalizedStatus = STATUS_ALIAS_MAP[requestedStatus] || requestedStatus;

  if (!Task.schema.path('status').enumValues.includes(normalizedStatus)) {
    return res.status(400).json({ message: 'Unsupported task status' });
  }

  if (normalizedStatus === 'assigned') {
    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Only open tasks can be accepted or moved in progress' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can accept tasks' });
    }

    task.assignedTo = req.user._id;
    task.status = 'assigned';
    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { activeTasks: 1 } });

    return res.json({ message: 'Task moved to assigned', task: serializeTask(task) });
  }

  if (normalizedStatus === 'completed') {
    if (!canUpdateToCompleted(task, req.user)) {
      return res.status(403).json({ message: 'You are not allowed to mark this task completed' });
    }

    if (task.status !== 'under_review' && task.status !== 'completed') {
      return res.status(400).json({ message: 'Task must be under review before completion' });
    }

    task.status = 'completed';
    task.isPaid = true;
    await task.save();

    return res.json({ message: 'Task marked completed', task: serializeTask(task) });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can directly set this status' });
  }

  task.status = normalizedStatus;
  await task.save();

  return res.json({ message: `Task status updated to ${normalizedStatus}`, task: serializeTask(task) });
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (task.status !== 'open') {
    return res.status(400).json({ message: 'Cannot delete an active task' });
  }

  await task.deleteOne();

  if (req.user.role === 'business' || req.user.role === 'company') {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tasksPosted: -1 } });
  }

  res.json({ message: 'Task deleted' });
};

const updateTask = async (req, res) => {
  console.log('Update Task Request:', req.body);
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(serializeTask(updatedTask));
};

module.exports = {
  getTasks,
  getMyTasks,
  getTasksForReview,
  getTaskById,
  createTask,
  acceptTask,
  submitTaskForReview,
  reviewTask,
  clientApproveTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
