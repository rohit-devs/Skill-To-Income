require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/skillearn';

async function seed() {
  await mongoose.connect(MONGO);
  console.log('MongoDB connected');

  // Use raw collections to avoid schema conflicts
  const users = mongoose.connection.collection('users');
  const tasks = mongoose.connection.collection('tasks');

  const emails = ['student@demo.com','senior@demo.com','business@demo.com',
                  'company@demo.com','admin@demo.com'];
  await users.deleteMany({ email: { $in: emails } });
  await tasks.deleteMany({});
  console.log('Cleared old demo data');

  const hash = await bcrypt.hash('demo123', 12);

  const inserted = await users.insertMany([
    { name:'Priya Sharma',  email:'student@demo.com',  password:hash,
      role:'student',  college:'FAMT Ratnagiri', city:'Ratnagiri',
      skills:['Design','Writing','Canva','Social Media'],
      isSenior:false, tasksCompleted:4, totalEarned:840,
      isVerified:true, isBanned:false, createdAt:new Date() },
    { name:'Arjun Patil',   email:'senior@demo.com',   password:hash,
      role:'student',  college:'COEP Pune', city:'Pune',
      skills:['Design','Coding','Research'],
      isSenior:true, tasksCompleted:14, totalEarned:4800,
      isVerified:true, isBanned:false, createdAt:new Date() },
    { name:'Ravi Kulkarni', email:'business@demo.com', password:hash,
      role:'business', businessName:"Ravi's Bakery", city:'Nashik',
      isSenior:false, tasksCompleted:0, totalEarned:0,
      isVerified:true, isBanned:false, createdAt:new Date() },
    { name:'TechStart HR',  email:'company@demo.com',  password:hash,
      role:'company',  businessName:'TechStart India', city:'Mumbai',
      isSenior:false, tasksCompleted:0, totalEarned:0,
      isVerified:true, isBanned:false, createdAt:new Date() },
    { name:'Admin User',    email:'admin@demo.com',    password:hash,
      role:'admin', isSenior:false, tasksCompleted:0, totalEarned:0,
      isVerified:true, isBanned:false, createdAt:new Date() },
  ]);

  const biz = inserted.insertedIds[2]; // business user
  const now = new Date();

  await tasks.insertMany([
    { title:'Design a Diwali festival sale poster',
      description:"A4 poster for Diwali sale. Include shop name Ravi's Bakery, 20% off offer, contact 9999999999. Canva ok. Deliver PNG + editable Canva link.",
      category:'Design', budget:350, deadline:'24 hrs', revisions:2,
      priority:true, status:'open', commission:0.12, studentPay:308,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
    { title:'Write 5 Instagram captions for bakery',
      description:'5 engaging Instagram captions. Topics: morning freshness, weekend special, custom cake, festival, thank you. Include 5-7 relevant hashtags each.',
      category:'Writing', budget:200, deadline:'12 hrs', revisions:1,
      priority:false, status:'open', commission:0.12, studentPay:176,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
    { title:'Create product catalogue in Excel',
      description:'Enter 30 products with name, price, category, and stock quantity into a neat Excel sheet. Deliver as .xlsx with formatted headers.',
      category:'Data', budget:150, deadline:'48 hrs', revisions:1,
      priority:false, status:'open', commission:0.12, studentPay:132,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
    { title:'Design WhatsApp offer flyer',
      description:'1080x1080 px flyer for WhatsApp broadcast. Show Buy 2 Get 1 Free on all pastries. Include shop name and contact number.',
      category:'Design', budget:250, deadline:'6 hrs', revisions:1,
      priority:false, status:'open', commission:0.12, studentPay:220,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
    { title:'Write 3 product descriptions for website',
      description:'150-200 words each for Chocolate Truffle Cake, Mango Delight Cake, Red Velvet Cake. Warm appetising tone. Include key ingredients.',
      category:'Writing', budget:300, deadline:'24 hrs', revisions:2,
      priority:false, status:'open', commission:0.12, studentPay:264,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
    { title:'Social media content calendar for November',
      description:'30-day content calendar for Instagram and Facebook. Post topic, caption idea, hashtags, best time to post. Google Sheet or Excel. Fashion boutique niche.',
      category:'Social Media', budget:450, deadline:'72 hrs', revisions:2,
      priority:true, status:'open', commission:0.12, studentPay:396,
      postedBy:biz, assignedTo:null, isPaid:false, createdAt:now },
  ]);

  console.log('\n=== SEED COMPLETE ===');
  console.log('5 users created:');
  console.log('  student@demo.com  / demo123  (Student)');
  console.log('  senior@demo.com   / demo123  (Senior Student)');
  console.log('  business@demo.com / demo123  (Business)');
  console.log('  company@demo.com  / demo123  (Company)');
  console.log('  admin@demo.com    / demo123  (Admin)');
  console.log('6 tasks created');
  process.exit(0);
}

seed().catch(e => { console.error('SEED ERROR:', e.message); process.exit(1); });
