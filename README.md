# Skill-To-Income

Skill-To-Income is a MERN micro-internship marketplace where businesses post paid, short-cycle tasks and students earn money while building a verified portfolio.

## Architecture

The project is split into a React client and an Express API:

```text
skillearn/
├── client/                 React 18 application
│   └── src/
│       ├── api/            API client helpers
│       ├── components/     Layout, feature, and UI components
│       ├── context/        Auth and socket providers
│       ├── hooks/          Reusable React hooks
│       ├── pages/          Route-level screens
│       ├── styles/         Tailwind input and generated CSS
│       └── utils/          Shared frontend utilities
├── server/                 Express and MongoDB API
│   ├── config/             Passport and integration config
│   ├── controllers/        Request handlers and business logic
│   ├── middleware/         Auth, validation, async, and error middleware
│   ├── models/             Mongoose schemas
│   ├── routes/             REST API routes
│   ├── services/           Email, Razorpay, Cloudinary integrations
│   ├── socket/             Socket.IO events
│   └── utils/              Backend helpers
├── documentation/          Interview and architecture notes
├── tests/                  Playwright smoke tests
└── package.json            Root orchestration scripts
```

## Features

- Role-based dashboards for students, businesses, seniors, and admins.
- Task marketplace with posting, browsing, assignment, submission, review, and dispute flows.
- JWT authentication with role-based route protection.
- Real-time task chat using Socket.IO.
- Assessment and AI review flows for student qualification.
- Earnings, analytics, leaderboard, profile, and portfolio pages.
- Responsive Tailwind UI with reusable layout, feature, and UI components.

## Tech Stack

- Frontend: React 18, React Router, Tailwind CSS, CRACO, Axios, Recharts, Three.js/OGL.
- Backend: Node.js, Express, MongoDB, Mongoose, Passport, JWT, Socket.IO.
- Integrations: Razorpay, Cloudinary, Nodemailer, Twilio-ready environment variables.
- QA: Production build validation and Playwright smoke test structure.

## Installation

Prerequisites:

- Node.js 18 or newer.
- MongoDB running locally or a MongoDB Atlas URI.

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Copy `.env.example` into `server/.env` and update secrets:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillearn
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
NODE_ENV=development
```

## Commands

```bash
npm run dev             # run API and client together
npm run build           # production client build
npm run client          # run only the React client
npm run server          # run only the Express API
npm run seed            # seed sample backend data
node server/scripts/verifyEnv.js
```

## Screenshots

Add final screenshots after deployment:

- Homepage
- Task marketplace
- Student dashboard
- Business dashboard
- Task detail and chat

## Deployment

1. Build the client with `npm run build`.
2. Deploy `client/build` to a static host.
3. Deploy `server` to a Node.js host.
4. Set production environment variables, including `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and payment/storage credentials.
5. Configure CORS so the API trusts the deployed frontend origin.

## Future Improvements

- Add automated API tests and CI coverage gates.
- Add a formal escrow ledger and payout reconciliation workflow.
- Add observability dashboards for API latency and task conversion.
- Add typed contracts with TypeScript or OpenAPI-generated clients.
