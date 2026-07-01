const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order (escrow - business pays upfront)
const createOrder = async (amount, taskId, currency = 'INR') => {
  const options = {
    amount: amount * 100, // paise
    currency,
    receipt: `task_${taskId}`,
    notes: { taskId: String(taskId) },
  };
  return await razorpay.orders.create(options);
};

// Verify payment signature after frontend confirmation
const verifyPayment = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSig === signature;
};

// Payout to student via UPI (Fund Account + Payout API)
const createPayout = async ({ name, upi, amount, taskId }) => {
  try {
    // Step 1: Create contact
    const contact = await razorpay.contacts.create({
      name,
      type: 'student',
      reference_id: String(taskId),
    });
    // Step 2: Create fund account
    const fundAccount = await razorpay.fundAccount.create({
      contact_id: contact.id,
      account_type: 'vpa',
      vpa: { address: upi },
    });
    // Step 3: Create payout
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: fundAccount.id,
      amount: amount * 100,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      narration: `SkillEarn task payment`,
      notes: { taskId: String(taskId) },
    });
    return { success: true, payoutId: payout.id };
  } catch (err) {
    console.error('Payout error:', err.message);
    return { success: false, error: err.message };
  }
};

// Refund to business if task cancelled
const createRefund = async (paymentId, amount) => {
  return await razorpay.payments.refund(paymentId, { amount: amount * 100 });
};

module.exports = { createOrder, verifyPayment, createPayout, createRefund };
