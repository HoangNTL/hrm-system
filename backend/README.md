# HRM System Backend

## Tests

This project uses Vitest for unit tests and Supertest for simple integration tests.

### Install

Dependencies are already listed. If needed, install with:

```powershell
npm install
```

### Run

- Run all tests (once):

```powershell
npm test
```

- Watch mode:

```powershell
npm run test:watch
```

### Environment variables

Tests provide safe defaults via `tests/setup.js`:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `PORT`

Unit tests mock database (`prisma`), `bcrypt`, `jsonwebtoken`, and the token service—no real DB is used.

### Notes

- The Express app is exported from `src/app.js` so tests can import it without starting the server.
- The server bootstrap remains in `src/index.js`.
