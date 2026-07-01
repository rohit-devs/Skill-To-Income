const express = require('express');
const router  = express.Router();
const { createOrder, verifyPayment, createPayout, createRefund } = require('../services/razorpay');
const Payment = require('../models/Payment');
const Task    = require('../models/Task');
const User    = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emails }    = require('../services/email');

// POST /api/payments/create-order — business initiates payment
router.post('/create-order', protect, requireRole('business', 'company'), async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your task' });

    const commission = Math.round(task.budget * task.commission);
    const studentPay = task.studentPay;

    const order = await createOrder(task.budget, taskId);

    const payment = await Payment.create({
      taskId, businessId: req.user._id,
      amount: task.budget, commission, studentPay,
      razorpayOrderId: order.id, status: 'pending',
    });

    res.json({
      orderId: order.id,
      amount:  order.amount,
      currency: order.currency,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/verify — verify Razorpay signature after payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { orderId, paymentId, signature, taskId } = req.body;
    const isValid = verifyPayment(orderId, paymentId, signature);
    if (!isValid) return res.status(400).json({ message: 'Invalid payment signature' });

    await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { razorpayPaymentId: paymentId, razorpaySignature: signature, status: 'in_escrow', paidAt: new Date() }
    );
    await Task.findByIdAndUpdate(taskId, { paymentStatus: 'in_escrow', status: 'open' });

    res.json({ message: 'Payment verified. Task is now live.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/release/:taskId — release escrow to student on approval
router.post('/release/:taskId', protect, requireRole('business', 'company'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignedTo');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.postedBy) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your task' });

    const payment = await Payment.findOne({ taskId: task._id, status: 'in_escrow' });
    if (!payment) return res.status(400).json({ message: 'No escrow payment found' });

    const student = task.assignedTo;
    let payoutResult = { success: false };

    if (student?.upiId) {
      payoutResult = await createPayout({
        name:   student.name,
        upi:    student.upiId,
        amount: payment.studentPay,
        taskId: task._id,
      });
    }

    payment.status = 'released';
    payment.studentId = student?._id;
    payment.payoutId  = payoutResult.payoutId;
    payment.releasedAt = new Date();
    await payment.save();

    await Task.findByIdAndUpdate(task._id, { status: 'completed', paymentStatus: 'released' });
    if (student) {
      await User.findByIdAndUpdate(student._id, {
        $inc: { totalEarned: payment.studentPay, tasksCompleted: 1, activeTasks: -1 },
      });
      if (student.emailNotifications) {
        const e = emails.paymentReleased(student.name, payment.studentPay, task.title);
        await sendEmail(student.email, e.subject, e.html);
      }
    }

    res.json({ message: 'Payment released to student', payoutResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/task/:taskId
router.get('/task/:taskId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ taskId: req.params.taskId });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/webhook — Razorpay webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const body = req.body.toString();
  const expectedSig = require('crypto')
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(body).digest('hex');

  if (sig !== expectedSig) return res.status(400).send('Invalid signature');
  const event = JSON.parse(body);
  console.log('Razorpay webhook:', event.event);
  res.json({ received: true });
});

module.exports = router;
