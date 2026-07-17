# CAMS — Child Abuse Management System (PHP backend edition)

This is the same application as the original `cams-js` project, with the
**backend rewritten from Node/Express/Drizzle to plain PHP + PDO**. The
frontend (React + Vite) is unchanged and talks to the new backend through the
identical `/api/*` REST contract.

## Structure
- `frontend/` — React + Vite (unchanged)
- `backend/`  — **PHP 8.1+ / PDO (PostgreSQL)** — see `backend/README.md`

## Quick Start

### Backend
```
cd backend
cp .env.example .env             # set DATABASE_URL
psql "$DATABASE_URL" -f schema.sql
php -S localhost:5000 -t public public/router.php
```

### Frontend
```
cd frontend
npm install
npm run dev      # starts on port 5173, proxies /api to localhost:5000
```
