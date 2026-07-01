const express = require('express');
const router  = express.Router();
const { Assessment, Attempt } = require('../models/Assessment');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emails }    = require('../services/email');

const MOCK_ASSESSMENTS = [
  { _id: 'm1', skill: 'Design', description: 'Prove your UI/UX and Graphic Design capabilities.', duration: 15, passMark: 70, questions: [
    { question: 'Which color mode is best for print?', options: ['RGB', 'CMYK', 'HEX', 'HSL'], correct: 1, points: 10 },
    { question: 'What does UX stand for?', options: ['User Exchange', 'User Experience', 'User Exit', 'Universal Experience'], correct: 1, points: 10 }
  ]},
  { _id: 'm2', skill: 'Writing', description: 'Showcase your copywriting and content creation skills.', duration: 10, passMark: 80, questions: [
    { question: 'Which is structurally correct?', options: ['Its raining', 'It\'s raining', 'Its\' raining', 'It is\' raining'], correct: 1, points: 10 }
  ]},
  { _id: 'm3', skill: 'Coding', description: 'Technical assessment for HTML, CSS, and basic JavaScript.', duration: 20, passMark: 75, questions: [
    { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperLoop Machine Language', 'None'], correct: 0, points: 10 }
  ]}
];

// GET /api/assessments — list all active assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ isActive: true }).select('-questions.correct');
    
    if (assessments.length === 0) {
      // Inject mock data if DB is empty to prevent empty UI rendering
      return res.json(MOCK_ASSESSMENTS.map(a => ({ ...a, questions: a.questions.map(q => ({ question: q.question, options: q.options, points: q.points })) })));
    }
    
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assessments/:skill — get assessment for a skill
router.get('/:skill', protect, async (req, res) => {
  try {
    let assessment = await Assessment.findOne({ skill: req.params.skill, isActive: true }).select('-questions.correct');
    
    if (!assessment) {
      // Fallback to mock data to prevent 404 dead ends in the UI
      const mockAssg = MOCK_ASSESSMENTS.find(m => m.skill === req.params.skill);
      if (!mockAssg) return res.status(404).json({ message: 'Assessment not found for this skill' });
      assessment = { ...mockAssg, questions: mockAssg.questions.map(q => ({ question: q.question, options: q.options, points: q.points })) };
    }

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
