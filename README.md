# AutoHubX Monorepo

Runs the **AutoNova frontend** and **AutoHubX backend** together with a single command.

```
autohubx-monorepo/
├── backend/     AutoHubX API (Node/Express/MongoDB) — see backend/README.md
├── frontend/    AutoNova app (React/Vite) — see frontend equivalent notes in the main handoff
└── package.json  root scripts that orchestrate both
```

## 1. First-time setup

```bash
npm run install:all
```

This installs dependencies for both `backend/` and `frontend/` in one step
(equivalent to running `npm install` inside each folder separately).

Then configure environment variables:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

- **`backend/.env`** — fill in your MongoDB Atlas URI, Firebase Admin credentials,
  Cloudinary keys, Turnstile secret, and Resend API key. See `backend/README.md` §9.
- **`frontend/.env`** — leave `VITE_API_URL` **unset** to run the frontend in its
  built-in demo/mock mode (no backend required). Set it (plus the `VITE_FIREBASE_*`
  vars) once the backend is configured, to switch the app to real data.

> The frontend works standalone even with an empty `backend/.env` — it only calls
> the real API when `VITE_API_URL` is set. The backend itself, however, **will
> fail to start** without a valid `MONGODB_URI` (and will error on any request
> that needs Firebase/Cloudinary/Turnstile/Resend until those are filled in too).

## 2. Run both together

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000` (or your configured `PORT`)
- **Frontend** on `http://localhost:5173`

Both processes stream their logs to the same terminal, color-coded and prefixed
(`BACKEND` in blue, `FRONTEND` in cyan). Press `Ctrl+C` once to stop both.

## 3. Other useful root commands

```bash
npm run seed           # populates MongoDB with demo data (backend/scripts/seed.js)
npm run test:backend   # runs the backend's vitest suite
npm run build:frontend # production build of the frontend (outputs to frontend/dist)
```

## Demo accounts (frontend mock mode — no backend needed)

| Role | Email | Password |
|---|---|---|
| Customer | customer@demo.com | password123 |
| Receptionist | reception@demo.com | password123 |
| Mechanic | mechanic@demo.com | password123 |
| Admin | admin@demo.com | password123 |

Or use the "Explore a demo role" buttons on the login page.

For full architecture, API docs, security notes, and testing details, see
`backend/README.md`.
