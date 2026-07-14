# Project Structure Analysis (Client + Server)

> Scope: MERN micro-internship marketplace (SkillEarn). This doc captures the repository structure and the primary request/render flow between frontend and backend.

---

## 1) Top-level layout

```text
skillearn/
├── client/                 React 18 application
│   └── src/
│       ├── App.js          React Router + route map + role guards
│       ├── index.js        React root mount + global CSS import
│       ├── api/            API helpers (axios/client wrappers)
│       ├── utils/         Shared frontend utilities
│       ├── context/       AuthProvider + SocketProvider
│       ├── hooks/         Reusable hooks
│       ├── components/    UI/layout/feature components
│       │   ├── layout/    Navbar, Sidebar, ProtectedRoute, DashboardLayout
│       │   ├── features/  Marketplace/analytics/feature blocks
│       │   └── ui/         Reusable primitives + WebGL/3D canvases
│       ├── pages/         Route-level screens
│       └── styles/        Tailwind input + generated Tailwind output + tokens
│
├── server/                 Express + MongoDB backend
│   ├── server.js          Express bootstrap + route mounting + Socket.IO init
│   ├── routes/           REST endpoints grouped by resource
│   ├── controllers/     Business logic per resource
│   ├── middleware/      Auth, validation, error handling
│   ├── models/          Mongoose schemas
│   ├── services/        Cloudinary/email/Razorpay integrations
│   ├── socket/          Socket.IO events bootstrap
│   └── utils/           Backend helpers (e.g., chat access control)
│
├── documentation/          Project notes & architecture docs
└── tests/                  Playwright smoke tests
```

---

## 2) Frontend (client) request/render flow

### 2.1 App entry + providers
- **`client/src/index.js`**
  - Creates the React root.
  - Imports global generated Tailwind CSS: `./styles/generated-tailwind.css`.
  - Renders `<App />`.

- **`client/src/App.js`**
  - Wraps app with:
    - `<AuthProvider>` (auth state)
    - `<SocketProvider>` (socket connectivity)
  - Sets up **React Router** and defines the route map.
  - Conditionally renders `<Navbar />` via `NavbarWrapper`.

### 2.2 Route protection and role gating
- **`client/src/App.js`** defines protected routes using **`ProtectedRoute`**.
- Role rules are expressed inline, e.g.:
  - Student routes: `roles={['student']}`
  - Business routes: `roles={['business','company']}`
  - Senior routes: no explicit role prop needed in `App.js` route wrappers beyond protected route (but an `/ai-test-review` and `/senior` are guarded by `ProtectedRoute`).
  - Admin routes: `roles={['admin']}`

**Key concept:** `ProtectedRoute` is the single frontend gatekeeper; backend independently enforces roles via middleware.

### 2.3 Page composition
Pages under `client/src/pages/*` assemble UI blocks and, where needed, call API helpers under `client/src/api/*` or `client/src/utils/*`.

Known pages from the repository list:
- Public: `HomePage`, `LoginPage`, `RegisterPage`, `TasksPage`, `TaskDetailPage`, `LeaderboardPage`, `OAuthSuccess`, `PricingPage`
- Student: `StudentHome`, `MyTasksPage`, `EarningsPage`, `AssessmentsListPage`, `AssessmentPage`, `ReviewQueuePage`, `TaskTestPage`, `AITestReviewPage`
- Business: `BusinessHome`, `PostTaskPage`, `AnalyticsPage`
- Senior: `SeniorHome`
- Admin: `AdminHome`
- Disputes: `DisputeListPage`, `DisputeDetailPage`

### 2.4 UI design system
- **`client/src/styles/index.css`**
  - Holds design tokens (`:root` CSS variables), base styles, and many reusable CSS classes.
- **`client/src/styles/tailwind.css`** → generates **`client/src/styles/generated-tailwind.css`**.
- **`client/src/components/ui/*`**
  - Reusable UI primitives: `Button`, `Badge`, `Card`, `Modal`, etc.
  - WebGL/3D components: `Hyperspeed`, `Orb`, `Waves`, `Ballpit`, `LiquidEther`.

Notably:
- `client/src/pages/PricingPage.js` uses `<Hyperspeed />` for animated background.

---

## 3) Backend (server) request flow

### 3.1 Express bootstrap + route mounting
- **`server/server.js`**
  - Loads environment variables.
  - Initializes Passport (`require('./config/passport')`).
  - Applies middleware:
    - `cors({ origin: CLIENT_URL, credentials: true })`
    - `express.json()`
    - `passport.initialize()`
  - Mounts REST APIs:
    - `/api/auth` → `routes/auth.js`
    - `/api/tasks` → `routes/tasks.js`
    - `/api/users` → `routes/users.js`
    - `/api/payments` → `routes/payments.js`
    - `/api/chat` → `routes/chat.js`
    - `/api/disputes` → `routes/disputes.js`
    - `/api/assessments` → `routes/assessments.js`
    - `/api/admin` → `routes/admin.js`
    - `/api/ai` → `routes/ai.js`
    - `/api/uploads` → `routes/uploads.js`
    - `/api/dashboard` → `routes/dashboard.js`
    - `/api/applications` → `routes/applications.js`
  - Initializes Socket.IO: `initSocket(io)`.
  - Uses `notFound` + `errorHandler`.
  - Connects to MongoDB and starts listening.

### 3.2 Authentication (REST)
- **`server/routes/auth.js`**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protected)

**Middleware stack:**
- Uses `protect` from `middleware/auth.js`.
- Uses request validation via `express-validator` + `middleware/validate.js`.

### 3.3 Task marketplace (REST)
- **`server/routes/tasks.js`**
  - `GET /api/tasks` (public listing; supports query validators)
  - `GET /api/tasks/my` (protected)
  - `GET /api/tasks/review` (protected + `requireSenior`)
  - `GET /api/tasks/:id` (public detail)

Mutations are role-gated:
- `POST /api/tasks` (protected + `requireRole('business','company','admin')`)
- `PATCH /api/tasks/:id/accept` (protected + `requireRole('student')`)
- `PATCH /api/tasks/:id/submit` (protected + `requireRole('student')`)
- `PATCH /api/tasks/:id/review` (protected + `requireSenior`)
- `PATCH /api/tasks/:id/approve` (protected + `requireRole('business','company')`)
- `PATCH /api/tasks/:id/status` (protected)
- `PUT /api/tasks/:id` (protected)
- `DELETE /api/tasks/:id` (protected)

### 3.4 Chat system (REST + access control)
- **`server/routes/chat.js`**
  - `GET /api/chat/:taskId` (protected; access validated via `ensureTaskChatAccess`)
  - `GET /api/chat/:taskId/unread` (protected; unread count)

**Access enforcement:**
- Uses `ensureTaskChatAccess(req.params.taskId, req.user._id)`.

Live sockets are bootstrapped by:
- `server/socket/index.js` + `initSocket(io)` from `server/server.js`.

---

## 4) Layering contracts (how data flows)

### 4.1 Frontend → Backend
- UI events (page buttons, form submits, chat components) call API helpers.
- The backend validates and enforces:
  - authentication via `protect`
  - role eligibility via `requireRole` / `requireSenior`
  - schema constraints via `express-validator` and `validate`

### 4.2 Backend → Database
- Controllers use Mongoose models:
  - `server/models/User.js`
  - `server/models/Task.js`
  - `server/models/Message.js`
  - `server/models/Application.js`, `Assessment.js`, `Dispute.js`, `Payment.js`, `TaskTest.js`

---

## 5) Where to extend / how to locate behavior

When modifying/adding a feature, the fastest mapping is:

1) **UI / Route**
   - `client/src/App.js` (add route + guard)
   - `client/src/pages/*` (screen)
   - `client/src/components/*` (UI building blocks)

2) **API call**
   - `client/src/api/*` or `client/src/utils/api.js` (axios wrappers)

3) **Backend endpoint**
   - `server/routes/<resource>.js`

4) **Backend business logic**
   - `server/controllers/<resource>Controller.js`

5) **Auth / roles**
   - `server/middleware/auth.js`

6) **Persistence**
   - `server/models/*.js`

7) **Real-time chat**
   - `server/socket/*` (socket events)
   - `server/routes/chat.js` (history/unread)
   - `server/utils/chatAccess.js`

---

## 6) Known verified files (opened during analysis)

- `client/src/App.js`
- `client/src/index.js`
- `client/src/pages/PricingPage.js`
- `client/src/pages/HomePage.js`
- `client/src/styles/index.css`
- `client/src/styles/generated-tailwind.css` (as present artifact; huge generated file)
- `client/src/components/ui/index.js`
- `client/src/components/ui/Hyperspeed/Hyperspeed.js`
- `server/server.js`
- `server/routes/auth.js`
- `server/routes/tasks.js`
- `server/routes/chat.js`

---

## 7) Completion note
This document captures architecture and primary flow between client routes/components and server REST/socket endpoints. For a deeper “controller-to-model” dependency graph, the next step is to open controller/model files and trace the specific CRUD paths for tasks, messages, payments, and disputes.

