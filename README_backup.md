<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,20&height=220&section=header&text=SkillEarn&fontSize=90&fontColor=ffffff&fontAlignY=38&desc=Micro-Internship%20Platform%20%F0%9F%87%AE%F0%9F%87%B3&descAlignY=60&descSize=22&animation=fadeIn" width="100%"/>
<br/>
<img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/Socket.io-4.6-010101?style=flat-square&logo=socket.io&logoColor=white"/>
<br/><br/>
<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square"/>
<img src="https://img.shields.io/badge/Version-2.0.0-5B4FE8?style=flat-square"/>
<img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square"/>
<img src="https://img.shields.io/badge/PRs-Welcome-orange?style=flat-square"/>
<img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square"/>
<br/><br/>
<h3>🚀 Real skills. Real tasks. Real income.</h3>
<p><b>SkillEarn</b> connects college students in Tier-2 & Tier-3 Indian cities with small businesses<br/>for affordable micro-tasks — with AI matching, real-time chat, and UPI payouts.</p>
<br/>
<a href="#-quick-start"><img src="https://img.shields.io/badge/Get%20Started-5B4FE8?style=for-the-badge&logoColor=white"/></a> 
<a href="#-api-reference"><img src="https://img.shields.io/badge/API%20Docs-00A878?style=for-the-badge&logoColor=white"/></a> 
<a href="#-features"><img src="https://img.shields.io/badge/Features-F5A623?style=for-the-badge&logoColor=white"/></a>
</div>
---
🌟 What is SkillEarn?
SkillEarn is a full-stack MERN marketplace that solves two problems at once:
🎓 Students in Tier-2/3 cities have digital skills but no income source during college
🏪 Small businesses need affordable design, writing, and data tasks but can't afford agencies
SkillEarn bridges the gap with micro-tasks (₹150–₹500, completed in 6–72 hours), a built-in peer review quality system, and UPI payouts within 24 hours.
---
✨ Features
<table>
<tr>
<td width="50%" valign="top">
🎓 Student Side
```
✅ Browse tasks by skill category
✅ Accept & complete in 6–72 hours
✅ Submit files via Cloudinary
✅ Get paid via UPI (Razorpay)
✅ Senior-Junior peer review
✅ Skill assessment + verified badges
✅ Earnings dashboard + charts
✅ Public portfolio page
✅ Streak & achievement badges
✅ Leaderboard ranking
```
</td>
<td width="50%" valign="top">
🏪 Business Side
```
✅ Post tasks in 2 minutes
✅ AI-powered student matching
✅ Real-time chat per task
✅ Escrow payments (pay on approval)
✅ File reference uploads
✅ Business analytics + ROI
✅ Priority task listings
✅ Dispute resolution
✅ Monthly subscription plans
✅ Company HR project boards
```
</td>
</tr>
</table>
🛡️ Platform Infrastructure
Feature	Technology	Status
Authentication	JWT + Passport.js	✅
Social Login	Google OAuth 2.0	✅
Real-time Chat	Socket.io	✅
File Uploads	Cloudinary + Multer	✅
Payments	Razorpay Escrow + UPI Payout	✅
Email Alerts	Nodemailer + Gmail	✅
AI Matching	Custom scoring engine	✅
Skill Tests	Timed MCQ assessments	✅
Dispute System	Admin arbitration	✅
Admin Panel	Full analytics + moderation	✅
Mobile Support	Progressive Web App	✅
---
🗂️ Project Structure
```
skillearn/
│
├── 📦 server/                         Backend — Express.js + MongoDB
│   ├── config/passport.js             Google OAuth 2.0 strategy
│   ├── middleware/auth.js             JWT protect + role guard
│   ├── models/
│   │   ├── User.js                    Student / Business / Company / Admin
│   │   ├── Task.js                    Full task lifecycle model
│   │   ├── Message.js                 Real-time chat messages
│   │   ├── Payment.js                 Razorpay escrow tracking
│   │   ├── Dispute.js                 Dispute resolution records
│   │   └── Assessment.js              Skill tests + attempt history
│   ├── routes/
│   │   ├── auth.js                    /api/auth
│   │   ├── tasks.js                   /api/tasks
│   │   ├── users.js                   /api/users
│   │   ├── payments.js                /api/payments
│   │   ├── chat.js                    /api/chat
│   │   ├── disputes.js                /api/disputes
│   │   ├── assessments.js             /api/assessments
│   │   └── admin.js                   /api/admin
│   ├── services/
│   │   ├── razorpay.js                Order creation, verify, payout
│   │   ├── cloudinary.js              File upload + storage
│   │   ├── email.js                   Transactional email templates
│   │   └── aiMatching.js              Student-task scoring engine
│   ├── socket/index.js                Socket.io real-time engine
│   └── server.js                      Entry point
│
└── 📦 client/src/                     Frontend — React 18
    ├── context/
    │   ├── AuthContext.js             Global auth state
    │   └── SocketContext.js           Real-time socket state
    ├── components/
    │   ├── Navbar.js                  Role-aware navigation
    │   ├── TaskCard.js                Task preview card
    │   ├── ChatWindow.js              In-task chat UI
    │   └── ProtectedRoute.js          Auth route guard
    └── pages/
        ├── HomePage.js                Landing page
        ├── TasksPage.js               Task feed + filters
        ├── TaskDetailPage.js          Task + chat + actions
        ├── AdminDashboard.js          Analytics + moderation
        ├── AssessmentPage.js          Timed skill test
        ├── AnalyticsPage.js           Business ROI dashboard
        ├── PortfolioPage.js           Public student profile
        └── 8 more pages...
```
---
⚡ Quick Start
Prerequisites
Node.js `v18+`
MongoDB `v7+` (local or Atlas)
npm `v8+`
1 — Clone the repo
```bash
git clone https://github.com/yourusername/skillearn.git
cd skillearn
```
2 — Set up the backend
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillearn
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000

# Optional — full features
RAZORPAY_KEY_ID=rzp_test_xxxx
CLOUDINARY_CLOUD_NAME=your_cloud
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```
Start the backend:
```bash
npm run dev
# MongoDB connected
# SkillEarn V2 server running on port 5000
```
3 — Set up the frontend
```bash
cd ../client
npm install
npm start
# App running on http://localhost:3000
```
4 — Seed demo data
```bash
node server/quickseed.js
```
5 — Demo accounts
Role	Email	Password
🎓 Student	`student@demo.com`	`demo123`
⭐ Senior	`senior@demo.com`	`demo123`
🏪 Business	`business@demo.com`	`demo123`
🏢 Company	`company@demo.com`	`demo123`
---
🔌 API Reference
<details>
<summary><b>🔐 Auth — /api/auth</b></summary>
Method	Route	Description	Auth
`POST`	`/register`	Register new user	❌
`POST`	`/login`	Login	❌
`GET`	`/me`	Current user	✅
`GET`	`/google`	Google OAuth	❌
</details>
<details>
<summary><b>📋 Tasks — /api/tasks</b></summary>
Method	Route	Description	Role
`GET`	`/`	List open tasks	Public
`POST`	`/`	Post new task	Business
`GET`	`/:id`	Task detail	Public
`PATCH`	`/:id/accept`	Accept task	Student
`PATCH`	`/:id/submit`	Submit work	Student
`PATCH`	`/:id/review`	Senior review	Senior
`PATCH`	`/:id/approve`	Final approval	Business
`DELETE`	`/:id`	Delete task	Business
</details>
<details>
<summary><b>💳 Payments — /api/payments</b></summary>
Method	Route	Description	Role
`POST`	`/create-order`	Razorpay order	Business
`POST`	`/verify`	Verify signature	Business
`POST`	`/release/:taskId`	Release to student	Business
</details>
<details>
<summary><b>💬 Chat — /api/chat + Socket.io</b></summary>
Type	Event / Route	Description
REST `GET`	`/:taskId`	Message history
Socket	`join_task`	Join task room
Socket	`send_message`	Send message
Socket	`new_message`	Receive message
Socket	`typing`	Typing indicator
</details>
<details>
<summary><b>🛡️ Admin — /api/admin</b></summary>
Method	Route	Description
`GET`	`/stats`	Platform analytics
`GET`	`/users`	All users + filters
`PATCH`	`/users/:id/ban`	Ban / unban user
`GET`	`/disputes`	All disputes
`GET`	`/revenue`	Revenue breakdown
</details>
---
🔄 Task Lifecycle
```
Business posts ──▶ [ open ]
                      │
               Student accepts
                      │
                  [ assigned ]
                      │
              Student submits work
                      │
                  [ submitted ]
                      │
            Senior reviews quality
               ┌──────┴──────┐
           PASS│             │FAIL
               ▼             ▼
       [ under_review ]  [ revision_requested ]
               │                  │
       Client approves    Student revises
               │
           [ completed ]
               │
       💸 UPI payout released
```
---
🛠️ Tech Stack
Layer	Technology	Purpose
Frontend	React 18 + React Router v6	UI & routing
Styling	Custom CSS (Plus Jakarta Sans)	Design system
Charts	Recharts	Earnings & analytics
Real-time	Socket.io	Chat + notifications
Backend	Node.js + Express 4	REST API
Database	MongoDB + Mongoose	Data persistence
Auth	JWT + bcryptjs	Secure auth
OAuth	Passport.js + Google	Social login
Payments	Razorpay	Escrow + UPI payouts
Files	Cloudinary + Multer	Uploads up to 10MB
Email	Nodemailer	Transactional alerts
AI	Custom scoring engine	Task-student matching
---
🗺️ Roadmap
[x] MERN stack MVP
[x] JWT auth + Google OAuth
[x] Real-time chat (Socket.io)
[x] Razorpay escrow + UPI payouts
[x] Cloudinary file uploads
[x] Skill assessment tests
[x] Admin dashboard
[x] Dispute resolution
[x] AI task matching
[x] Business analytics
[x] Public portfolio pages
[ ] React Native mobile app
[ ] WhatsApp bot integration
[ ] Hindi + Marathi language support
[ ] Blockchain skill certificates
[ ] Video task deliverables
---
🤝 Contributing
Contributions are welcome! See CONTRIBUTING.md for guidelines.
```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Then open a Pull Request
```
---
📄 License
MIT — see LICENSE for details.
---
<div align="center">
Built by Rohit — SE IT, FAMT Ratnagiri 🇮🇳
Building SkillEarn to solve the income gap for Indian college students
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)
<br/>
⭐ Star this repo if it helped you!
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,20&height=100&section=footer" width="100%"/>
</div>
