const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const emailStyles = `
  body{font-family:Arial,sans-serif;background:#F8F7F4;margin:0;padding:0;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E4E2DC;}
  .header{background:#3B30CC;padding:24px 32px;color:#fff;}
  .header h1{margin:0;font-size:20px;font-weight:700;}
  .header p{margin:6px 0 0;font-size:13px;opacity:.8;}
  .body{padding:28px 32px;}
  .body p{font-size:14px;color:#3d3d3a;line-height:1.7;margin:0 0 14px;}
  .btn{display:inline-block;background:#3B30CC;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0 16px;}
  .info-box{background:#EEEDFE;border-radius:8px;padding:14px 18px;margin:14px 0;}
  .info-box p{margin:0;font-size:13px;color:#3C3489;}
  .footer{background:#F8F7F4;padding:16px 32px;font-size:12px;color:#6B6A64;border-top:1px solid #E4E2DC;}
`;

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SkillEarn" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<html><head><style>${emailStyles}</style></head><body>${html}</body></html>`,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

// ── Email templates ────────────────────────────────────────────────────────

const emails = {
  taskAssigned: (studentName, task) => ({
    subject: `New task assigned: ${task.title}`,
    html: `<div class="wrap">
      <div class="header"><h1>New Task Assigned!</h1><p>You have a new micro-task waiting</p></div>
      <div class="body">
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>A new task matching your skills is available on SkillEarn.</p>
        <div class="info-box">
          <p><strong>${task.title}</strong><br/>
          Category: ${task.category} | Budget: ₹${task.budget} | Due: ${task.deadline}</p>
        </div>
        <p>You will earn <strong>₹${task.studentPay}</strong> after the platform fee upon completion.</p>
        <a href="${BASE_URL}/tasks/${task._id}" class="btn">View Task →</a>
        <p style="font-size:12px;color:#6B6A64;">Accept it before another student does!</p>
      </div>
      <div class="footer">SkillEarn · Real skills. Real income. · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),

  taskSubmitted: (businessName, task, studentName) => ({
    subject: `Work submitted for review: ${task.title}`,
    html: `<div class="wrap">
      <div class="header"><h1>Submission Ready for Review</h1><p>A student has submitted work on your task</p></div>
      <div class="body">
        <p>Hi <strong>${businessName}</strong>,</p>
        <p><strong>${studentName}</strong> has submitted work for your task:</p>
        <div class="info-box"><p><strong>${task.title}</strong><br/>This work has been reviewed by a senior student and approved for quality.</p></div>
        <a href="${BASE_URL}/tasks/${task._id}" class="btn">Review & Approve →</a>
        <p>Once you approve, payment will be released automatically to the student.</p>
      </div>
      <div class="footer">SkillEarn · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),

  paymentReleased: (studentName, amount, taskTitle) => ({
    subject: `₹${amount} has been credited to your account!`,
    html: `<div class="wrap">
      <div class="header" style="background:#10B981;"><h1>Payment Released! 🎉</h1><p>Your earnings have been credited</p></div>
      <div class="body">
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>Great news! The business has approved your work and your payment has been released.</p>
        <div class="info-box" style="background:#EAF3DE;">
          <p style="color:#27500A;"><strong>Task:</strong> ${taskTitle}<br/>
          <strong>Amount:</strong> ₹${amount}<br/>
          <strong>Status:</strong> Credited to your account</p>
        </div>
        <a href="${BASE_URL}/earnings" class="btn" style="background:#10B981;">View Earnings →</a>
      </div>
      <div class="footer">SkillEarn · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),

  disputeOpened: (recipientName, taskTitle, disputeId) => ({
    subject: `Dispute opened on task: ${taskTitle}`,
    html: `<div class="wrap">
      <div class="header" style="background:#EF4444;"><h1>Dispute Opened</h1><p>Action required on your task</p></div>
      <div class="body">
        <p>Hi <strong>${recipientName}</strong>,</p>
        <p>A dispute has been opened on the task: <strong>${taskTitle}</strong>.</p>
        <p>Our team will review the case within 48 hours and reach a fair resolution.</p>
        <a href="${BASE_URL}/disputes/${disputeId}" class="btn" style="background:#EF4444;">View Dispute →</a>
      </div>
      <div class="footer">SkillEarn · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),

  welcome: (name, role) => ({
    subject: `Welcome to SkillEarn, ${name}!`,
    html: `<div class="wrap">
      <div class="header"><h1>Welcome to SkillEarn! 🚀</h1><p>Your account is ready</p></div>
      <div class="body">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your SkillEarn account has been created successfully as a <strong>${role}</strong>.</p>
        ${role === 'student' ? `<p>Browse available tasks, accept one that matches your skills, and start earning today.</p>
        <a href="${BASE_URL}/tasks" class="btn">Browse Tasks →</a>` :
        `<p>Post your first micro-task and get it completed by a skilled student within 24–72 hours.</p>
        <a href="${BASE_URL}/post-task" class="btn">Post Your First Task →</a>`}
      </div>
      <div class="footer">SkillEarn · Real skills. Real income. · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),

  assessmentPassed: (name, skill) => ({
    subject: `Skill verified: ${skill} ✓`,
    html: `<div class="wrap">
      <div class="header" style="background:#10B981;"><h1>Skill Verified! ✓</h1><p>You passed the ${skill} assessment</p></div>
      <div class="body">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Congratulations! You have passed the <strong>${skill}</strong> skill assessment.</p>
        <p>A verified badge has been added to your profile and you can now access premium ${skill} tasks.</p>
        <a href="${BASE_URL}/profile" class="btn">View Your Profile →</a>
      </div>
      <div class="footer">SkillEarn · <a href="${BASE_URL}">skillearn.in</a></div>
    </div>`,
  }),
};

module.exports = { sendEmail, emails };
