/**
 * SkillEarn — Database Seed Script
 * Run: node server/seed.js
 * Creates demo users and sample tasks
 */

const mongoose = require('mongoose');
const User = require('./server/models/User');
const Task = require('./server/models/Task');
require('dotenv').config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillearn';

const users = [
  {
    name: 'Priya Sharma',
    email: 'student@demo.com',
    password: 'demo123',
    role: 'student',
    college: 'FAMT Ratnagiri',
    city: 'Ratnagiri',
    skills: ['Design', 'Writing', 'Canva', 'Social Media'],
    whatsapp: '+91 9876543210',
    tasksCompleted: 4,
    totalEarned: 840,
    isSenior: false,
  },
  {
    name: 'Arjun Patil',
    email: 'senior@demo.com',
    password: 'demo123',
    role: 'student',
    college: 'COEP Pune',
    city: 'Pune',
    skills: ['Design', 'Coding', 'Research'],
    whatsapp: '+91 9876501234',
    tasksCompleted: 12,
    totalEarned: 4250,
    isSenior: true,
  },
  {
    name: 'Ravi Kulkarni',
    email: 'business@demo.com',
    password: 'demo123',
    role: 'business',
    businessName: "Ravi's Bakery",
    city: 'Nashik',
  },
  {
    name: 'Meera Joshi',
    email: 'business2@demo.com',
    password: 'demo123',
    role: 'business',
    businessName: 'Meera Boutique',
    city: 'Pune',
  },
  {
    name: 'TechStart HR',
    email: 'company@demo.com',
    password: 'demo123',
    role: 'company',
    businessName: 'TechStart India',
    city: 'Mumbai',
  },
];

const seedTasks = (businessId) => [
  {
    title: 'Design a Diwali festival sale poster',
    description: 'A4 size poster for our Diwali sale. Include shop name "Ravi\'s Bakery", 20% off on all items, contact number 9999999999. Use warm festive colours. Canva or any design tool is fine. Deliver as PNG + editable Canva link.',
    category: 'Design',
    budget: 350,
    deadline: '24 hrs',
    revisions: 2,
    priority: true,
    postedBy: businessId,
    status: 'open',
  },
  {
    title: 'Write 5 Instagram captions for bakery posts',
    description: 'We need 5 engaging Instagram captions for our bakery. Topics: 1) Morning freshness 2) Weekend special 3) Custom cake order 4) Festival season 5) Thank you post. Keep them short, fun, with 5-7 relevant hashtags each.',
    category: 'Writing',
    budget: 200,
    deadline: '12 hrs',
    revisions: 1,
    priority: false,
    postedBy: businessId,
    status: 'open',
  },
  {
    title: 'Create a simple product catalogue in Excel',
    description: 'Enter 30 product names, prices, categories, and stock quantity into a clean Excel sheet. We will provide the data as a WhatsApp voice note or text list. Deliver as .xlsx file. Formatting should be neat with column headers.',
    category: 'Data',
    budget: 150,
    deadline: '48 hrs',
    revisions: 1,
    priority: false,
    postedBy: businessId,
    status: 'open',
  },
  {
    title: 'Design WhatsApp offer flyer for weekend special',
    description: 'Small flyer (1080x1080 px) for our WhatsApp broadcast. Show: "Weekend Special - Buy 2 Get 1 Free on all pastries". Include shop logo area, product image placeholder, and contact details. Canva preferred.',
    category: 'Design',
    budget: 250,
    deadline: '6 hrs',
    revisions: 1,
    priority: false,
    postedBy: businessId,
    status: 'open',
  },
  {
    title: 'Write 3 product descriptions for website',
    description: 'Write 3 product descriptions (150-200 words each) for our premium cake range: 1) Chocolate Truffle Cake 2) Mango Delight Cake 3) Red Velvet Cake. Tone should be warm and appetising. Include key ingredients and best-for occasions.',
    category: 'Writing',
    budget: 300,
    deadline: '24 hrs',
    revisions: 2,
    priority: false,
    postedBy: businessId,
    status: 'open',
  },
  {
    title: 'Social media content calendar for November',
    description: 'Create a 30-day social media content calendar for Instagram and Facebook. Include: post topic, caption idea, hashtags, and best time to post for each day. Format it in a Google Sheet or Excel. Focus on a fashion boutique niche.',
    category: 'Social Media',
    budget: 450,
    deadline: '72 hrs',
    revisions: 2,
    priority: true,
    postedBy: businessId,
    status: 'open',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    // Clear existing demo data
    const demoEmails = users.map((u) => u.email);
    await User.deleteMany({ email: { $in: demoEmails } });
    await Task.deleteMany({});
    console.log('Cleared existing demo data.');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} demo users:`);
    createdUsers.forEach((u) => console.log(`  ${u.role.padEnd(8)} → ${u.email}`));

    // Find business user
    const business = createdUsers.find((u) => u.email === 'business@demo.com');

    // Create tasks
    const tasks = await Task.create(seedTasks(business._id));
    console.log(`\nCreated ${tasks.length} demo tasks.`);

    console.log('\n✅ Seed complete!\n');
    console.log('Demo login credentials:');
    console.log('  🎓 Student   → student@demo.com  / demo123');
    console.log('  ⭐ Senior    → senior@demo.com   / demo123');
    console.log('  🏪 Business  → business@demo.com / demo123');
    console.log('  🏢 Company   → company@demo.com  / demo123');
    console.log('\nFrontend: http://localhost:3000');
    console.log('Backend:  http://localhost:5000');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
