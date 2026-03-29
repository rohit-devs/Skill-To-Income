# SkillEarn — MERN Stack Micro-Internship Platform

A full-stack MERN application connecting college students in Tier-2/3 Indian cities with small businesses and companies for affordable micro-tasks.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Axios    |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Validation | express-validator                   |

---

## Project Structure

```
skillearn/
├── server/                  ← Express + MongoDB backend
│   ├── server.js            ← Entry point
│   ├── models/
│   │   ├── User.js          ← User schema (student/business/company)
│   │   └── Task.js          ← Task schema with commission logic
│   ├── routes/
│   │   ├── auth.js          ← /api/auth  (register, login, me)
│   │   ├── tasks.js         ← /api/tasks (CRUD + workflow)
│   │   └── users.js         ← /api/users (profile, earnings, leaderboard)
│   ├── middleware/
│   │   └── auth.js          ← JWT protect + role guard
│   ├── .env.example         ← Copy to .env and fill in values
│   └── package.json
│
└── client/                  ← React frontend
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js           ← Router + layout
        ├── index.js         ← Root render
        ├── index.css        ← Global design system
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js       ← Axios instance
        ├── components/
        │   ├── Navbar.js
        │   ├── TaskCard.js
        │   └── ProtectedRoute.js
        └── pages/
            ├── HomePage.js
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── TasksPage.js
            ├── TaskDetailPage.js
            ├── PostTaskPage.js
            ├── MyTasksPage.js
            ├── EarningsPage.js
            ├── LeaderboardPage.js
            └── ProfilePage.js
```

---

## Quick Start

### Prerequisites
- Node.js v16+
- MongoDB running locally OR a MongoDB Atlas URI
- npm v8+

---

### 1. Clone / extract the project

```bash
cd skillearn
```

---

### 2. Set up the backend

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillearn
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev        # development with nodemon
# OR
npm start          # production
```

You should see:
```
MongoDB connected
Server running on port 5000
```

---

### 3. Set up the frontend

Open a new terminal:

```bash
cd client
npm install
npm start
```

React will open at **http://localhost:3000**

---

### 4. Seed demo data (optional)

Run this in your terminal to create demo accounts:

```bash
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({ email: { \$in: ['student@demo.com','business@demo.com'] }});
  await User.create([
    { name: 'Priya Sharma', email: 'student@demo.com', password: 'demo123',
      role: 'student', college: 'FAMT Ratnagiri', city: 'Ratnagiri',
      skills: ['Design','Writing','Canva'], whatsapp: '+91 9876543210',
      tasksCompleted: 4, totalEarned: 840 },
    { name: 'Ravi Kulkarni', email: 'business@demo.com', password: 'demo123',
      role: 'business', businessName: \"Ravi's Bakery\", city: 'Nashik' }
  ]);
  console.log('Demo accounts created:');
  console.log('  Student  → student@demo.com / demo123');
  console.log('  Business → business@demo.com / demo123');
  process.exit(0);
});
"
```

---

## API Reference

### Auth
| Method | Route               | Description        | Auth |
|--------|---------------------|--------------------|------|
| POST   | /api/auth/register  | Register new user  | No   |
| POST   | /api/auth/login     | Login              | No   |
| GET    | /api/auth/me        | Get current user   | Yes  |

### Tasks
| Method | Route                      | Description                    | Auth         |
|--------|----------------------------|--------------------------------|--------------|
| GET    | /api/tasks                 | List open tasks (+ filters)    | No           |
| GET    | /api/tasks/my              | My tasks (posted or assigned)  | Yes          |
| GET    | /api/tasks/review          | Tasks awaiting senior review   | Senior only  |
| GET    | /api/tasks/:id             | Task detail                    | No           |
| POST   | /api/tasks                 | Post new task                  | Business/Co  |
| PATCH  | /api/tasks/:id/accept      | Student accepts task           | Student      |
| PATCH  | /api/tasks/:id/submit      | Student submits work           | Student      |
| PATCH  | /api/tasks/:id/review      | Senior approves/revises        | Senior       |
| PATCH  | /api/tasks/:id/approve     | Client final approval          | Business/Co  |
| DELETE | /api/tasks/:id             | Delete open task               | Business/Co  |

### Users
| Method | Route                | Description          | Auth |
|--------|----------------------|----------------------|------|
| GET    | /api/users/profile   | Own profile          | Yes  |
| PUT    | /api/users/profile   | Update profile       | Yes  |
| GET    | /api/users/earnings  | Earnings + weekly    | Yes  |
| GET    | /api/users/leaderboard | Top 10 students    | No   |
| GET    | /api/users/:id       | Public user profile  | No   |

---

## Task Workflow

```
open → assigned → submitted → under_review → completed
              ↑                     ↓
         revision_requested ←───────┘  (senior requests revision)
```

1. **Business posts** task → status: `open`
2. **Student accepts** → status: `assigned`
3. **Student submits** work → status: `submitted`
4. **Senior reviews** → approves → status: `under_review`  OR  requests revision → status: `revision_requested`
5. **Business approves** → status: `completed` → student paid via UPI

---

## User Roles

| Role      | Can do                                           |
|-----------|--------------------------------------------------|
| student   | Browse & accept tasks, submit work, earn         |
| business  | Post tasks, review submissions, approve & pay    |
| company   | Same as business + access senior review panel    |
| isSenior  | Flag on student — unlocked after 10 tasks + 4.5★ |

---

## Environment Variables

| Variable    | Description                         | Default                          |
|-------------|-------------------------------------|----------------------------------|
| PORT        | Server port                         | 5000                             |
| MONGO_URI   | MongoDB connection string           | mongodb://localhost:27017/skillearn |
| JWT_SECRET  | JWT signing secret (keep private!)  | —                                |
| CLIENT_URL  | Frontend URL for CORS               | http://localhost:3000            |

---

## Pages

| Route         | Page               | Access       |
|---------------|--------------------|--------------|
| /             | Landing page       | Public       |
| /tasks        | Task feed          | Public       |
| /tasks/:id    | Task detail        | Public       |
| /leaderboard  | Top earners        | Public       |
| /login        | Login              | Public       |
| /register     | Register           | Public       |
| /post-task    | Post a task        | Business/Co  |
| /my-tasks     | My tasks           | Logged in    |
| /earnings     | Earnings dashboard | Student      |
| /profile      | Edit profile       | Logged in    |

---

## License
MIT — free to use and modify.
