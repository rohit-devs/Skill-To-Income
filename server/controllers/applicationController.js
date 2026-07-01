const Application = require('../models/Application');
const Task = require('../models/Task');
const User = require('../models/User');

const applyForTask = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    if (req.user.role === 'student' && !req.user.isSenior && req.user.activeTasks >= 3) {
      return res.status(403).json({ message: 'You have reached the maximum limit of 3 active tasks simultaneously. Please complete current tasks before applying for new ones.' });
    }
    
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ message: 'Cover message must be at least 10 characters long' });
    }

    const task = await Task.findById(taskId);
    if (!task || task.status !== 'open') {
      return res.status(400).json({ message: 'This task is no longer open for new applications.' });
    }

    const existing = await Application.findOne({ taskId, studentId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted an application for this task.' });
    }

    const application = await Application.create({
      taskId,
      studentId: req.user._id,
      message,
    });
    
    // Implicit tracking on task model
    await Task.findByIdAndUpdate(taskId, { $addToSet: { applicants: req.user._id } });

    res.status(201).json({ message: 'Application submitted successfully! The business will review your pitch.', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskApplications = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view applicants for this task.' });
    }

    const applications = await Application.find({ taskId: req.params.taskId })
      .populate('studentId', 'name college city rating skills tasksCompleted verifiedSkills avatar')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptApplicant = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('taskId');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    const task = application.taskId;
    if (String(task.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'This task has already been assigned to someone else.' });
    }

    application.status = 'accepted';
    await application.save();

    await Application.updateMany(
      { taskId: task._id, _id: { $ne: application._id } },
      { status: 'rejected' }
    );

    task.assignedTo = application.studentId;
    task.status = 'assigned';
    await task.save();

    await User.findByIdAndUpdate(application.studentId, { $inc: { activeTasks: 1 } });

    res.json({ message: 'Student hired and task explicitly assigned!', application, task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyForTask, getTaskApplications, acceptApplicant };
