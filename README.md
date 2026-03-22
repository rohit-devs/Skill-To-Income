# Skill-To-Income â€” MERN Stack Micro-Internship Platform

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
Skill-To-Income/
â”œâ”€â”€ server/                  â† Express + MongoDB backend
â”‚   â”œâ”€â”€ server.js            â† Entry point
â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”œâ”€â”€ User.js          â† User schema (student/business/company)
â”‚   â”‚   â””â”€â”€ Task.js          â† Task schema with commission logic
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”œâ”€â”€ auth.js          â† /api/auth  (register, login, me)
â”‚   â”‚   â”œâ”€â”€ tasks.js         â† /api/tasks (CRUD + workflow)
â”‚   â”‚   â””â”€â”€ users.js         â† /api/users (profile, earnings, leaderboard)
â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â””â”€â”€ auth.js          â† JWT protect + role guard
â”‚   â”œâ”€â”€ .env.example         â† Copy to .env and fill in values
â”‚   â””â”€â”€ package.json
â”‚
â””â”€â”€ client/                  â† React frontend
    â”œâ”€â”€ public/
    â”‚   â””â”€â”€ index.html
    â””â”€â”€ src/
        â”œâ”€â”€ App.js           â† Router + layout
        â”œâ”€â”€ index.js         â† Root render
        â”œâ”€â”€ index.css        â† Global design system
        â”œâ”€â”€ context/
        â”‚   â””â”€â”€ AuthContext.js
        â”œâ”€â”€ utils/
        â”‚   â””â”€â”€ api.js       â† Axios instance
        â”œâ”€â”€ components/
        â”‚   â”œâ”€â”€ Navbar.js
        â”‚   â”œâ”€â”€ TaskCard.js
        â”‚   â””â”€â”€ ProtectedRoute.js
        â””â”€â”€ pages/
            â”œâ”€â”€ HomePage.js
            â”œâ”€â”€ LoginPage.js
            â”œâ”€â”€ RegisterPage.js
            â”œâ”€â”€ TasksPage.js
            â”œâ”€â”€ TaskDetailPage.js
            â”œâ”€â”€ PostTaskPage.js
            â”œâ”€â”€ MyTasksPage.js
            â”œâ”€â”€ EarningsPage.js
            â”œâ”€â”€ LeaderboardPage.js
            â””â”€â”€ ProfilePage.js
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
cd Skill-To-Income
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
MONGO_URI=mongodb://localhost:27017/Skill-To-Income
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
  console.log('  Student  â†’ student@demo.com / demo123');
  console.log('  Business â†’ business@demo.com / demo123');
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
open â†’ assigned â†’ submitted â†’ under_review â†’ completed
              â†‘                     â†“
         revision_requested â†â”€â”€â”€â”€â”€â”€â”€â”˜  (senior requests revision)
```

1. **Business posts** task â†’ status: `open`
2. **Student accepts** â†’ status: `assigned`
3. **Student submits** work â†’ status: `submitted`
4. **Senior reviews** â†’ approves â†’ status: `under_review`  OR  requests revision â†’ status: `revision_requested`
5. **Business approves** â†’ status: `completed` â†’ student paid via UPI

---

## User Roles

| Role      | Can do                                           |
|-----------|--------------------------------------------------|
| student   | Browse & accept tasks, submit work, earn         |
| business  | Post tasks, review submissions, approve & pay    |
| company   | Same as business + access senior review panel    |
| isSenior  | Flag on student â€” unlocked after 10 tasks + 4.5â˜… |

---

## Environment Variables

| Variable    | Description                         | Default                          |
|-------------|-------------------------------------|----------------------------------|
| PORT        | Server port                         | 5000                             |
| MONGO_URI   | MongoDB connection string           | mongodb://localhost:27017/Skill-To-Income |
| JWT_SECRET  | JWT signing secret (keep private!)  | â€”                                |
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
MIT â€” free to use and modify.
