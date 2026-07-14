# Application Flow

```mermaid
flowchart TD
  A[User opens app] --> B[React Router loads page]
  B --> C{Authenticated?}
  C -- No --> D[Login or register]
  C -- Yes --> E[Role dashboard]
  D --> F[Express auth API]
  F --> G[(MongoDB users)]
  G --> H[JWT returned]
  H --> E
  E --> I[Browse or manage tasks]
  I --> J[Express task APIs]
  J --> K[(MongoDB tasks/applications)]
  K --> L[Response rendered in UI]
  I --> M[Socket.IO chat]
```

## Request Flow

1. React page calls `client/src/utils/api.js`.
2. Axios sends a request to the Express route.
3. Middleware validates auth and request data.
4. Controller executes business logic.
5. Mongoose reads or writes MongoDB.
6. API responds with JSON.
7. React updates local component state and renders feedback.

## Protected Flow

`ProtectedRoute` checks `AuthContext`. If the user is missing, it redirects to login. If roles are supplied and the role does not match, it redirects to the public home page.
