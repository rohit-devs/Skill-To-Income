const express = require('express');
const router  = express.Router();
const { Assessment, Attempt } = require('../models/Assessment');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emails }    = require('../services/email');

// GET /api/assessments — list all active assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ isActive: true })
      .select('-questions.correct');
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assessments/:skill — get assessment for a skill
router.get('/:skill', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ skill: req.params.skill, isActive: true })
      .select('-questions.correct');
    if (!assessment) return res.status(404).json({ message: 'Assessment not found for this skill' });

    const prevAttempt = await Attempt.findOne({
      userId: req.user._id, skill: req.params.skill, passed: true,
    });
    if (prevAttempt) return res.status(200).json({ alreadyPassed: true, assessment });

    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/assessments/:skill/submit — submit answers
router.post('/:skill/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const assessment = await Assessment.findOne({ skill: req.params.skill, isActive: true });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    // Count attempts
    const prevAttempts = await Attempt.countDocuments({ userId: req.user._id, skill: req.params.skill });

    // Score the answers
    let score = 0;
    const total = assessment.questions.reduce((s, q) => s + q.points, 0);
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correct) score += q.points;
    });
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= assessment.passMark;

    const attempt = await Attempt.create({
      userId: req.user._id, assessmentId: assessment._id,
      skill: req.params.skill, answers, score, percentage,
      passed, timeTaken, attemptCount: prevAttempts + 1,
    });

    if (passed) {
      // Add verified skill badge to user
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { verifiedSkills: req.params.skill },
        $push: { badges: { name: `${req.params.skill} Verified`, awardedAt: new Date(), icon: '✓' } },
      });
      // Send congratulations email
      const user = await User.findById(req.user._id);
      if (user?.emailNotifications) {
        const e = emails.assessmentPassed(user.name, req.params.skill);
        await sendEmail(user.email, e.subject, e.html);
      }
    }

    res.json({ passed, percentage, score, total, attempt: attempt._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/assessments — admin: create assessment
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const assessment = await Assessment.create(req.body);
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
