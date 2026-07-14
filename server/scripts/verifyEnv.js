// ----------------------------------------------------------------------
// File: server/scripts/verifyEnv.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: project runtime dependencies.
// Used By: Express backend application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------


require('dotenv').config();

const requiredInProd = ['JWT_SECRET', 'MONGO_URI', 'CLIENT_URL', 'REDIS_URL'];
const optional = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CLOUDINARY_API_KEY', 'SENTRY_DSN'];

const present = (key) => Boolean(process.env[key]);

console.log('Environment variables checklist');
console.log('-------------------------------');

const env = process.env.NODE_ENV || 'development';
console.log(`Environment: ${env}`);

requiredInProd.forEach((k) => {
  const ok = present(k);
  console.log(`${ok ? '✅' : '❌'} ${k} ${ok ? '' : '- MISSING'}`);
});

optional.forEach((k) => {
  console.log(`${present(k) ? '✅' : 'ℹ️'} ${k}`);
});

if (env === 'production') {
  const missing = requiredInProd.filter((k) => !present(k));
  if (missing.length) {
    console.error('\nMissing required production environment variables:', missing.join(', '));
    process.exit(1);
  }
}

console.log('\nAll checks completed.');
