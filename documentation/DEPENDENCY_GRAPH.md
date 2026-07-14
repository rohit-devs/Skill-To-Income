# Dependency Graph And Cleanup Notes

## Active Entry Points

- `client/src/index.js` mounts `App`.
- `client/src/App.js` defines routes and providers.
- `server/server.js` creates the Express app, Socket.IO server, routes, middleware, and MongoDB connection.

## Frontend Dependency Shape

```mermaid
flowchart TD
  Index[index.js] --> App[App.js]
  App --> Auth[AuthContext]
  App --> Socket[SocketContext]
  App --> Layout[layout components]
  App --> Pages[route pages]
  Pages --> Features[feature components]
  Pages --> UI[ui components]
  Features --> UI
  Pages --> Api[utils/api.js]
  Layout --> Api
```

## Backend Dependency Shape

```mermaid
flowchart TD
  Server[server.js] --> Routes[routes]
  Routes --> Middleware[middleware]
  Routes --> Controllers[controllers]
  Controllers --> Models[Mongoose models]
  Controllers --> Services[services]
  Server --> Socket[socket/index.js]
```

## Removed Or Obsolete

- Nested `skillearn/` duplicate project tree.
- Old root `seed.js`.
- Old flat `client/src/index.css` and `client/src/tailwind.css` after styles moved to `client/src/styles/`.
- `.playwright-mcp/` and `test-results/` generated run artifacts.
- `README_local.md` duplicate documentation.

## Circular Dependencies

No circular source dependency was found in the active route/component structure during manual import review.

## Remaining Runtime Constraints

`npm run dev` requires ports `3000` and `5000` to be free and MongoDB to be reachable through `MONGO_URI`.
