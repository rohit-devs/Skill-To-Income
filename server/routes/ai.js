const express = require('express');

const TaskTest = require('../models/TaskTest');
const Task = require('../models/Task');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

const PASS_THRESHOLD = 70;

const FALLBACK_QUIZ_BANK = {
  Design: [
    {
      question: 'Which Canva principle helps keep a bakery launch post visually balanced and easy to read?',
      options: ['Random font sizes everywhere', 'Using alignment and spacing consistently', 'Adding as many colors as possible', 'Placing text over every image'],
      correctAnswer: 1,
      correctHint: 'Consistent alignment and spacing improve readability and visual hierarchy.',
    },
    {
      question: 'For a social media launch visual, what should be most prominent?',
      options: ['The software version used', 'The offer or key message', 'A long paragraph about the business', 'Hidden contact details'],
      correctAnswer: 1,
      correctHint: 'The key offer or message should stand out first.',
    },
    {
      question: 'What file output is most useful when a client may want quick edits later?',
      options: ['A blurred screenshot only', 'Editable design link plus export', 'Only a compressed thumbnail', 'A text file'],
      correctAnswer: 1,
      correctHint: 'An editable design link plus the final export gives flexibility.',
    },
    {
      question: 'Why is visual hierarchy important in promotional creatives?',
      options: ['It helps viewers notice the most important information first', 'It reduces image quality', 'It removes the need for branding', 'It makes every element equally important'],
      correctAnswer: 0,
      correctHint: 'Hierarchy guides attention to the most important details first.',
    },
    {
      question: 'Which choice is best for a bakery campaign targeting local customers?',
      options: ['Tiny unreadable text', 'Relevant product imagery and clear CTA', 'No brand name', 'Only abstract shapes'],
      correctAnswer: 1,
      correctHint: 'Relevant visuals and a clear call to action improve campaign effectiveness.',
    },
  ],
  Writing: [
    {
      question: 'What makes marketing copy stronger for a small business task?',
      options: ['Vague statements', 'Clear benefit-driven wording', 'Repeating the same sentence', 'Using unrelated jargon'],
      correctAnswer: 1,
      correctHint: 'Benefit-driven writing makes the message clearer and more persuasive.',
    },
    {
      question: 'Which opening is best for a short social caption?',
      options: ['A hook that grabs attention quickly', 'A long legal disclaimer', 'Random hashtags', 'An unrelated quote'],
      correctAnswer: 0,
      correctHint: 'Short-form writing works best with a fast, engaging hook.',
    },
    {
      question: 'What should product descriptions usually include?',
      options: ['Only internal company terms', 'Key features and customer value', 'Personal diary notes', 'Irrelevant history'],
      correctAnswer: 1,
      correctHint: 'Good product descriptions connect features to customer value.',
    },
    {
      question: 'Why should tone match the brand?',
      options: ['To create consistency and trust', 'To make the text longer', 'To avoid mentioning the product', 'To remove all emotion'],
      correctAnswer: 0,
      correctHint: 'Consistent tone makes the brand feel more reliable.',
    },
    {
      question: 'What is the best final line in promotional copy?',
      options: ['A clear call to action', 'A confusing technical term', 'An empty sentence', 'A random emoji string'],
      correctAnswer: 0,
      correctHint: 'Promotional copy should end with a clear next step.',
    },
  ],
};

const buildFallbackQuiz = (task) => {
  const categoryQuestions = FALLBACK_QUIZ_BANK[task.category] || FALLBACK_QUIZ_BANK.Design;
  const questions = categoryQuestions.slice(0, 5).map((question) => ({
    ...question,
    type: 'mcq',
    points: 20,
  }));

  return {
    testTitle: `Quick quiz for ${task.title}`,
    testIntro: `Answer these 5 MCQs based on ${task.category}. You need at least ${PASS_THRESHOLD}% to unlock this task.`,
    questions,
  };
};

const callClaude = async (systemPrompt, messages, maxTokens = 1000) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
};

const getStudentAttempt = (test, studentId) =>
  test.attempts?.find((attempt) => String(attempt.studentId) === String(studentId)) || null;

const hasPassingAttempt = (test, studentId) => {
  const attempt = getStudentAttempt(test, studentId);
  return Boolean(attempt?.passed && attempt?.percentage >= (test.passThreshold || PASS_THRESHOLD));
};

const sanitizeAttempt = (attempt) => {
  if (!attempt) return null;

  return {
    studentId: attempt.studentId,
    answers: attempt.answers || [],
    score: attempt.score,
    percentage: attempt.percentage,
    submittedAt: attempt.submittedAt,
    timeTakenTotal: attempt.timeTakenTotal,
    passed: attempt.passed,
    status: attempt.status,
  };
};

const sanitizeTestResponse = (test, attempt) => {
  const quiz = test.toObject ? test.toObject() : test;

  return {
    ...quiz,
    passThreshold: quiz.passThreshold || PASS_THRESHOLD,
    questions: (quiz.questions || []).map((question) => ({
      question: question.question,
      type: 'mcq',
      options: question.options || [],
      points: question.points,
    })),
    attempt: sanitizeAttempt(attempt),
  };
};

router.post('/chat', protect, requireRole('business', 'company', 'admin'), async (req, res) => {
  try {
    const { messages, taskDraft } = req.body;
    const system = `You are an expert task brief assistant for Skill-To-Income, India's micro-internship platform.
Your job is to help a small business owner clearly define their micro-task so that a college student can complete it successfully.

Current task draft:
${JSON.stringify(taskDraft || {}, null, 2)}

Guidelines:
- Ask ONE focused question at a time
- Keep language simple and friendly because many business owners speak Hinglish
- You must gather information for: title, description, category, budget (min ₹50), and deadline (e.g. 24 hrs).
- Limit the conversation to 4-5 total exchanges to be respectful of the user's time.
- Once you have gathered the requirements, you MUST generate the final brief.
- To generate the final brief, your response MUST contain a JSON block with exactly these keys: {"title": "", "description": "", "category": "", "budget": 500, "deadline": "24 hrs"} wrapped in \`\`\`json ... \`\`\`. Give the client a success message along with it.
- Never ask technical questions.`;

    const reply = await callClaude(system, messages);
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ message: 'AI assistant unavailable. Please try again.', error: err.message });
  }
});

router.post('/ai-task', protect, requireRole('business', 'company', 'admin'), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const system = `You are an expert task brief assistant for Skill-To-Income.
Based on the user's prompt, generate a complete task brief in JSON format.
Return ONLY valid JSON. Do not use markdown backticks around the json.
Structure:
{
  "title": "Short catchy title",
  "category": "Design|Writing|Data|Social Media|Video|Coding|Research|Marketing|Other",
  "description": "**Context:**\\n...\\n\\n**Requirements:**\\n...\\n\\n**Deliverables:**\\n...",
  "budget": 500,
  "deadline": "24 hrs|48 hrs|1 week"
}`;

    const raw = await callClaude(system, [{ role: 'user', content: prompt }], 1000);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const taskData = JSON.parse(cleaned);

    res.json(taskData);
  } catch (err) {
    res.status(500).json({ message: 'AI generation failed', error: err.message });
  }
});

router.post('/generate-test', protect, requireRole('business', 'company', 'admin'), async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const existing = await TaskTest.findOne({ taskId });
    if (existing) {
      return res.json({ test: sanitizeTestResponse(existing, null), alreadyExists: true });
    }

    const system = `You are an expert skill evaluator for Skill-To-Income, a micro-internship platform for Indian college students.
Generate a short pre-acceptance screening quiz for the following task. The quiz will be shown before a student can accept the task.
Return ONLY valid JSON. Do not use markdown.`;

    const prompt = `Task Title: ${task.title}
Category / Skill: ${task.category}
Description: ${task.description}
Budget: Rs ${task.budget}
Deadline: ${task.deadline}

Generate JSON with exactly this structure:
{
  "testTitle": "Quick quiz for [task name]",
  "testIntro": "Answer these 5 MCQs to unlock this task. You need at least 70% to pass.",
  "questions": [
    {
      "question": "...",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "correctHint": "The correct answer is ... because ...",
      "points": 20
    }
  ]
}

Rules:
- Create exactly 5 MCQ questions
- Each question must have exactly 4 options
- correctAnswer must be the zero-based index of the correct option
- Focus tightly on practical knowledge needed for this task
- Keep it understandable for college students in Tier-2/3 India
- Total points must equal 100
- Make the quiz directly related to the task category and subject`;

    let testData;
    try {
      const raw = await callClaude(system, [{ role: 'user', content: prompt }], 1500);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      testData = JSON.parse(cleaned);
    } catch (error) {
      console.warn('Claude quiz generation failed, using fallback quiz:', error.message);
      testData = buildFallbackQuiz(task);
    }

    const questions = Array.isArray(testData.questions) ? testData.questions.slice(0, 5) : [];
    const normalizedQuestions = questions.map((question) => ({
      question: question.question,
      type: 'mcq',
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correctAnswer: Number(question.correctAnswer),
      correctHint: question.correctHint || '',
      points: Number(question.points) || 20,
    }));

    const validQuiz =
      normalizedQuestions.length === 5 &&
      normalizedQuestions.every((question) =>
        question.question &&
        question.options.length === 4 &&
        Number.isInteger(question.correctAnswer) &&
        question.correctAnswer >= 0 &&
        question.correctAnswer <= 3
      );

    if (!validQuiz) {
      return res.status(500).json({ message: 'AI generated an invalid quiz. Please try again.' });
    }

    const test = await TaskTest.create({
      taskId,
      generatedBy: 'claude-sonnet-4-20250514',
      passThreshold: PASS_THRESHOLD,
      testTitle: testData.testTitle,
      testIntro: testData.testIntro,
      questions: normalizedQuestions,
      attempts: [],
      status: 'pending_student',
    });

    await Task.findByIdAndUpdate(taskId, { hasAITest: true });

    res.json({ test: sanitizeTestResponse(test, null) });
  } catch (err) {
    console.error('Test generation error:', err.message);
    res.status(500).json({ message: 'Failed to generate quiz. Please try again.', error: err.message });
  }
});

router.get('/test/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const test = await TaskTest.findOne({ taskId: req.params.taskId });
    if (!test) return res.status(404).json({ message: 'No quiz found for this task' });

    const attempt = req.user.role === 'student' ? getStudentAttempt(test, req.user._id) : null;

    res.json({
      test: sanitizeTestResponse(test, attempt),
      alreadySubmitted: Boolean(attempt?.submittedAt),
      passed: Boolean(attempt?.passed),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/test/:taskId/submit', protect, requireRole('student'), async (req, res) => {
  try {
    const { answers, timeTakenTotal } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'This task is no longer open for quiz attempts' });
    }

    const test = await TaskTest.findOne({ taskId: req.params.taskId });
    if (!test) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const processedAnswers = (Array.isArray(answers) ? answers : [])
      .map((answer, index) => {
        const question = test.questions[index];
        if (!question) return null;

        const mcqChoice = Number(answer?.mcqChoice);
        if (Number.isInteger(mcqChoice) && mcqChoice === question.correctAnswer) {
          score += question.points;
        }

        return {
          questionIndex: index,
          mcqChoice: Number.isInteger(mcqChoice) ? mcqChoice : null,
          timeTaken: Number(answer?.timeTaken) || 0,
        };
      })
      .filter(Boolean);

    const totalPoints = test.questions.reduce((sum, question) => sum + (question.points || 0), 0) || 100;
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (test.passThreshold || PASS_THRESHOLD);

    const attempt = {
      studentId: req.user._id,
      answers: processedAnswers,
      score,
      percentage,
      submittedAt: new Date(),
      timeTakenTotal: Number(timeTakenTotal) || 0,
      passed,
      status: passed ? 'passed' : 'failed',
    };

    const existingAttemptIndex = test.attempts.findIndex((entry) => String(entry.studentId) === String(req.user._id));
    if (existingAttemptIndex >= 0) {
      test.attempts[existingAttemptIndex] = attempt;
    } else {
      test.attempts.push(attempt);
    }

    test.status = passed ? 'passed' : 'failed';
    await test.save();

    res.json({
      message: passed
        ? 'Quiz passed. You can now accept this task.'
        : 'Quiz submitted. You need at least 70% to unlock this task.',
      test: sanitizeTestResponse(test, attempt),
      score,
      percentage,
      passed,
    });
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/test/:taskId/responses', protect, async (req, res) => {
  try {
    if (!req.user.isSenior && req.user.role !== 'admin' && req.user.role !== 'business' && req.user.role !== 'company') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const test = await TaskTest.findOne({ taskId: req.params.taskId })
      .populate('attempts.studentId', 'name college city skills rating tasksCompleted');
    if (!test) return res.status(404).json({ message: 'No quiz found' });

    res.json({ test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/test/:taskId/review', protect, async (_req, res) => {
  return res.status(410).json({ message: 'AI quiz reviews are no longer required. Quizzes are auto-scored now.' });
});

router.get('/pending-reviews', protect, async (req, res) => {
  try {
    if (!req.user.isSenior && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Senior access required' });
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/business-notifications', protect, requireRole('business', 'company'), async (req, res) => {
  try {
    const myTasks = await Task.find({ postedBy: req.user._id, assignedTo: { $ne: null } })
      .populate('assignedTo', 'name college city skills rating tasksCompleted')
      .sort({ updatedAt: -1 })
      .limit(10);

    const notifications = await Promise.all(myTasks.map(async (task) => {
      const test = await TaskTest.findOne({ taskId: task._id });
      return {
        taskId: task._id,
        taskTitle: task.title,
        student: task.assignedTo,
        taskStatus: task.status,
        testStatus: test && task.assignedTo ? (hasPassingAttempt(test, task.assignedTo._id) ? 'passed' : test.status) : null,
        assignedAt: task.updatedAt,
      };
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
