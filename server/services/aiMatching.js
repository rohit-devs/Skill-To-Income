const User = require('../models/User');

/**
 * AI Task Matching Engine
 * Scores each eligible student for a given task using weighted factors:
 * - Skill match (40%)
 * - Past rating (25%)
 * - Completion speed history (20%)
 * - Task category experience (15%)
 */

const scoreStudent = (student, task) => {
  let score = 0;

  // 1. Skill match (40 pts)
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const taskCat = task.category.toLowerCase();
  if (studentSkills.includes(taskCat)) score += 40;
  else if (studentSkills.some(s => s.includes(taskCat.slice(0, 4)))) score += 20;

  // 2. Rating score (25 pts) — normalized 0-5 → 0-25
  const rating = student.rating || 0;
  score += (rating / 5) * 25;

  // 3. Tasks completed (20 pts) — experience factor, capped at 50
  const completed = Math.min(student.tasksCompleted || 0, 50);
  score += (completed / 50) * 20;

  // 4. Category-specific experience (15 pts)
  const catExp = student.categoryStats?.[task.category] || 0;
  score += Math.min(catExp * 3, 15);

  // Bonus: Senior student gets +5
  if (student.isSenior) score += 5;

  // Penalty: if currently has 3+ active tasks, deprioritise
  const activeTasks = student.activeTasks || 0;
  if (activeTasks >= 3) score -= 15;

  return Math.max(0, Math.round(score));
};

const matchStudentsToTask = async (task, limit = 5) => {
  try {
    // Find all eligible students with the relevant skill
    const candidates = await User.find({
      role: 'student',
      skills: { $in: [task.category, task.category.toLowerCase()] },
    }).select('name skills rating tasksCompleted isSenior categoryStats activeTasks city');

    // Score and sort
    const scored = candidates
      .map(student => ({ student, score: scoreStudent(student, task) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  } catch (err) {
    console.error('AI matching error:', err.message);
    return [];
  }
};

// Generate a human-readable match explanation
const explainMatch = (student, score) => {
  const reasons = [];
  if (student.isSenior) reasons.push('Senior reviewer');
  if (student.rating >= 4.5) reasons.push(`${student.rating}★ rating`);
  if (student.tasksCompleted >= 10) reasons.push(`${student.tasksCompleted} tasks completed`);
  return {
    studentId: student._id,
    name: student.name,
    score,
    matchReasons: reasons,
  };
};

module.exports = { matchStudentsToTask, scoreStudent, explainMatch };
