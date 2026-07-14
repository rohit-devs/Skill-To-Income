# Interview Guide

## 5-Minute Answer

Skill-To-Income is a MERN micro-internship marketplace. Students earn through paid tasks, businesses get affordable short-cycle work, and the platform supports role-based dashboards, task workflows, real-time chat, assessments, reviews, and admin moderation. The frontend is React with reusable component layers, and the backend is Express with MongoDB, JWT auth, Mongoose models, and Socket.IO.

## 10-Minute Answer

The project solves the experience gap for students and the execution gap for small businesses. I designed it around clear roles: students, businesses, seniors, and admins. React Router handles public and protected routes, `AuthContext` owns session state, and shared layout components keep dashboards consistent. The API is organized into routes, controllers, middleware, models, and services. MongoDB stores users, tasks, applications, payments, messages, assessments, and disputes. Socket.IO enables task chat.

## 15-Minute Answer

The architecture is intentionally simple but scalable. The client talks to the API through a centralized Axios helper, so auth headers and error formatting are consistent. Protected routes enforce role access at the UI layer while backend middleware remains the real authorization boundary. The backend separates request routing from controller logic and keeps persistence in Mongoose models. Integrations such as Razorpay, Cloudinary, and email live in services so business logic is not tied to provider code.

Performance improvements include lazy-loaded dashboard charts, reusable loading states, centralized API calls, memoized WebGL options, and cleanup for socket/timer effects. Security choices include JWT auth, bcrypt password hashing, role checks, validation middleware, and environment verification for production secrets.

## 30-Minute Answer

Explain the project as a marketplace workflow:

1. A business registers, posts a paid task, and reviews applicants.
2. A student registers, browses tasks, applies, and completes assigned work.
3. The platform tracks status transitions, chat, submissions, payments, and disputes.
4. Senior reviewers and admins provide quality control.

Why React: it fits route-driven dashboards, reusable UI primitives, component-local state, and real-time updates. Why Express/MongoDB: the data model is document-friendly and Express keeps API iteration fast for a marketplace MVP. State management is deliberately light: context for auth/socket scope and local component state for page-specific data. This avoids over-engineering while preserving clear ownership.

Challenges included keeping role-specific dashboards consistent, managing real-time socket cleanup under React StrictMode, making moved folder imports reliable, and keeping the visual landing experience performant. Future improvements would include TypeScript, API test coverage, OpenAPI-generated clients, payment ledger reconciliation, observability, and a stronger CI quality gate.
