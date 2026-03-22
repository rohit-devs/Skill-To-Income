# Skill-To-Income — Micro-Internship Platform

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B4FD8,100:F5630A&height=220&section=header&text=Skill-To-Income&fontSize=70&fontColor=ffffff&fontAlignY=38&desc=Micro-Internship%20Platform%20%F0%9F%87%AE%F0%9F%87%B3&descAlignY=60&descSize=20&animation=fadeIn" width="100%"/>

<br/>

<img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/Socket.io-4.6-010101?style=flat-square&logo=socket.io&logoColor=white"/>

<br/><br/>

<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square"/>
<img src="https://img.shields.io/badge/Version-2.0.0-1B4FD8?style=flat-square"/>
<img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square"/>
<img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square"/>

<br/><br/>

<h3>Turn your skills into income.</h3>

<p>
India first peer-reviewed micro-internship platform.<br/>
College students earn Rs 150 to Rs 500 per task. Businesses get quality work in 24 to 72 hours.
</p>

</div>

---

## What is Skill-To-Income?

Skill-To-Income is a full-stack MERN marketplace that solves two problems at once:

- Students in Tier-2 and Tier-3 cities have digital skills but no income source during college
- Small businesses need affordable design, writing, and data tasks but cannot afford agencies

Skill-To-Income bridges the gap with micro-tasks (Rs 150 to Rs 500, completed in 6 to 72 hours), a built-in peer review quality system, and UPI payouts within 24 hours.

---

## Features

| Student Side | Business Side |
|---|---|
| Browse tasks by skill category | Post tasks in 2 minutes |
| Accept and complete in 6 to 72 hours | AI-powered student matching |
| Submit files via Cloudinary | Real-time chat per task |
| Get paid via UPI (Razorpay) | Escrow payments on approval |
| Senior-Junior peer review | Business analytics and ROI |
| Skill assessment and verified badges | Dispute resolution |
| Earnings dashboard with charts | Priority task listings |
| Public portfolio page | Monthly subscription plans |

### Platform Infrastructure

| Feature | Technology | Status |
|---------|-----------|:------:|
| Authentication | JWT + Passport.js | Done |
| Social Login | Google OAuth 2.0 | Done |
| Real-time Chat | Socket.io | Done |
| File Uploads | Cloudinary + Multer | Done |
| Payments | Razorpay Escrow + UPI Payout | Done |
| Email Alerts | Nodemailer + Gmail | Done |
| AI Matching | Custom scoring engine | Done |
| Skill Tests | Timed MCQ assessments | Done |
| Dispute System | Admin arbitration | Done |
| Admin Panel | Full analytics + moderation | Done |

---

## Project Structure
```
skill-to-income/
├── server/
│   ├── config/passport.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Message.js
│   │   ├── Payment.js
│   │   ├── Dispute.js
│   │   └── Assessment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   ├── chat.js
│   │   ├── disputes.js
│   │   ├── assessments.js
│   │   └── admin.js
│   ├── services/
│   │   ├── razorpay.js
│   │   ├── cloudinary.js
│   │   ├── email.js
│   │   └── aiMatching.js
│   ├── socket/index.js
│   └── server.js
└── client/src/
    ├── context/
    ├── components/
    └── pages/
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v7+
- npm v8+

### 1 — Clone the repo
```bash
git clone https://github.com/rohit-devs/skillearn.git
cd skillearn
```

### 2 — Set up the backend
```bash
cd server
npm install
cp .env.example .env
```

Edit server/.env:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillearn
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```
```bash
npm run dev
```

### 3 — Set up the frontend
```bash
cd ../client
npm install
npm start
```

### 4 — Seed demo data
```bash
node server/seed.js
```

### 5 — Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | demo123 |
| Senior | senior@demo.com | demo123 |
| Business | business@demo.com | demo123 |
| Company | company@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## API Reference

### Auth — /api/auth

| Method | Route | Description | Auth |
|--------|-------|-------------|:----:|
| POST | /register | Register new user | No |
| POST | /login | Login | No |
| GET | /me | Current user | Yes |

### Tasks — /api/tasks

| Method | Route | Description | Role |
|--------|-------|-------------|------|
| GET | / | List open tasks (public) | Public |
| POST | / | Post new task | Business |
| GET | /:id | Task detail | Public |
| PATCH | /:id/accept | Accept task | Student |
| PATCH | /:id/submit | Submit work | Student |
| PATCH | /:id/review | Senior review | Senior |
| PATCH | /:id/approve | Final approval | Business |
| DELETE | /:id | Delete task | Business |

### Payments — /api/payments

| Method | Route | Description | Role |
|--------|-------|-------------|------|
| POST | /create-order | Razorpay order | Business |
| POST | /verify | Verify signature | Business |
| POST | /release/:taskId | Release to student | Business |

---

## Task Lifecycle
```
Business posts task
       |
       v
    [ open ]
       |  Student accepts
       v
  [ assigned ] — Student works on task
       |  Student submits work + link
       v
  [ submitted ]
       |  Senior student reviews quality
    pass   fail
       |     |
       v     v
[ under_review ]  [ revision_requested ]
       |
       |  Business approves
       v
  [ completed ]
       |
       UPI payout released to student
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + React Router v6 | UI and routing |
| Styling | Custom CSS — Plus Jakarta Sans | Design system |
| Charts | Recharts | Earnings and analytics |
| Real-time | Socket.io | Chat and notifications |
| Backend | Node.js + Express 4 | REST API |
| Database | MongoDB + Mongoose | Data persistence |
| Auth | JWT + bcryptjs | Secure authentication |
| OAuth | Passport.js + Google | Social login |
| Payments | Razorpay | Escrow and UPI payouts |
| Files | Cloudinary + Multer | Uploads up to 10MB |
| Email | Nodemailer | Transactional alerts |
| AI | Custom scoring engine | Task-student matching |

---

## Roadmap

- [x] MERN stack MVP
- [x] JWT auth + Google OAuth
- [x] Real-time chat with Socket.io
- [x] Razorpay escrow + UPI payouts
- [x] Cloudinary file uploads
- [x] Skill assessment tests
- [x] Admin dashboard
- [x] Dispute resolution
- [x] AI task matching
- [x] Business analytics
- [x] Public portfolio pages
- [x] Rebrand to Skill-To-Income
- [ ] React Native mobile app
- [ ] WhatsApp bot integration
- [ ] Hindi and Marathi language support
- [ ] Blockchain skill certificates

---

## Contributing
```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

See CONTRIBUTING.md for full guidelines.

---

## License

MIT — see LICENSE for details.

---

<div align="center">

**Built by Rohit — SE IT, FAMT Ratnagiri**

Bridging the gap between student skills and business needs across India

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rohit-devs)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/rohit-devs)

Star this repo if it helped you!

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B4FD8,100:F5630A&height=100&section=footer" width="100%"/>

</div>

