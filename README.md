# CrisisConnect – Crisis Support Platform

Secure reporting, role-aware dashboards, and lightweight analytics for crisis and incident response teams. Built with a React/Vite front end and an Express/Prisma REST API.

## Features
- Auth: JWT login/register, profile avatar upload, role-aware access (admin vs user)
- Reporting: Create, list, filter, and delete reports; admin-only status updates; recent activity feed
- Analytics: Time-series trends and status breakdowns with Recharts
- Users: Admin view to search/sort/delete non-admin accounts; avatar support
- UX: Dark/light theming, responsive layout, animated UI with Framer Motion and particles

## Tech Stack
- Frontend: React 19, Vite, React Router, Framer Motion, Recharts, tsParticles, Tailwind utilities (custom CSS), Axios
- Backend: Node.js, Express 5, Prisma ORM, JWT, bcryptjs, Multer, CORS
- Database: MySQL (configured via Prisma `DATABASE_URL`)

## Directory Structure
- `src/` – React app (pages, components, styling, API helpers)
- `server/` – Express API, routes, controllers, Prisma client, uploads
- `server/prisma/schema.prisma` – DB schema for `User` and `Report`
- `public/` – Static assets for the Vite app
- `uploads/avatars/` – Stored profile images (served statically by the API)

## Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- MySQL instance and a connection string

## Setup
1) Install dependencies
```bash
# frontend
npm install

# backend
cd server
npm install
```

2) Configure environment variables

Create `server/.env` with at least:
```
PORT=5000
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-strong-secret"
```

Optionally set `VITE_API_URL` in a frontend `.env` (defaults to `http://localhost:5000`).

3) Apply database migrations
```bash
cd server
npx prisma migrate deploy   # or `prisma migrate dev` during development
```

4) Run the apps
```bash
# backend (from /server)
node index.js

# frontend (from repo root)
npm run dev
```

The API defaults to `http://localhost:5000` and the Vite dev server to `http://localhost:5173`.

## Available Scripts (frontend)
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – run ESLint

## API Overview (key routes)
- `POST /api/auth/register` – create user
- `POST /api/auth/login` – issue JWT
- `GET /api/auth/me` – current user profile + report counts (auth required)
- `POST /api/reports` – create report (auth)
- `GET /api/reports` – list reports (admin sees all; users see their own)
- `PUT /api/reports/:id/status` – update status (admin)
- `DELETE /api/reports/:id` – delete report (admin)
- `GET /api/reports/stats` – analytics (admin)
- `GET /api/users` – list users (admin)
- `PUT /api/users/profile-picture` – upload avatar (auth)
- `POST /api/users/update-profile` – update name/email (auth)

## Data Model (Prisma)
- `User`: id, name, email (unique), password (hashed), role (`user` or `admin`), avatar, lastLogin, createdAt
- `Report`: id, title, description, status (`Pending` default), createdAt, userId (relation)

## File Uploads
- Avatars are stored under `server/uploads/avatars/` and exposed via `/uploads/...` from the API.

## Notes
- Ensure the `uploads/avatars` directory exists and the process has write permissions.
- `JWT_SECRET` must be set; otherwise token verification will fail.
- API uses JSON bodies except for avatar uploads (multipart/form-data).
