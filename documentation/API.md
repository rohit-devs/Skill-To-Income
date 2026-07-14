# API Reference

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/register`: create user account.
- `POST /auth/login`: authenticate and return token/user data.
- `GET /auth/me`: fetch current authenticated user.

## Tasks

- `GET /tasks`: list marketplace tasks.
- `POST /tasks`: create a task for business/company users.
- `GET /tasks/:id`: fetch task details.
- `PUT /tasks/:id`: update task data.
- `POST /tasks/:id/submit`: submit completed work.

## Applications

- `GET /applications`: list applications.
- `POST /applications`: apply for a task.
- `PATCH /applications/:id`: update application status.

## Dashboard

- `GET /dashboard/student`: student dashboard metrics.
- `GET /dashboard/business`: business dashboard metrics.
- `GET /dashboard/admin`: admin overview.

## Assessments And AI

- `GET /assessments`: list available assessments.
- `POST /assessments/:skill`: submit assessment answers.
- `GET /ai/review-queue`: reviewer queue for AI-assisted task checks.

## Chat

- `GET /chat/:taskId`: load task messages.
- Socket events: `join_task`, `send_message`, `new_message`, `typing`, `user_typing`.

## Error Handling

The API returns JSON error responses through centralized error middleware. Validation failures return HTTP `400`, auth failures return `401` or `403`, not-found resources return `404`, and unexpected failures return `500`.
