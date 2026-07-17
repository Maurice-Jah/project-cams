# CAMS Backend — PHP

A plain PHP + PDO (PostgreSQL) port of the original Express + Drizzle ORM backend.
It exposes the **exact same `/api/*` REST contract**, so the existing React
frontend works against it without any changes.

## Requirements
- PHP 8.1+
- `pdo_pgsql` extension enabled
- PostgreSQL database

## Structure
```
backend/
  public/index.php     # front controller (entry point)
  public/.htaccess      # Apache rewrite rules
  public/router.php     # router for PHP's built-in dev server
  src/Env.php            # tiny .env loader
  src/Database.php       # PDO connection (parses DATABASE_URL)
  src/Router.php         # minimal path router (":id" params)
  src/Response.php       # JSON response helpers
  src/Utils.php          # camelCase <-> snake_case conversion, JSON body parsing
  src/Model.php          # generic list/find/insert/update/delete helpers
  src/routes.php         # registers every route (like routes/index.js)
  src/routes/*.php       # one file per resource, mirrors the original routes/
  schema.sql             # CREATE TABLE statements (replaces drizzle-kit push)
```

## Quick start

```bash
cd backend
cp .env.example .env        # set DATABASE_URL and APP_SECRET
psql "$DATABASE_URL" -f schema.sql   # create tables

# Create the first administrator login (prompts for name/email/password):
php bin/create-admin.php

# Dev server (built-in PHP server), listens on PORT from .env (default 5000):
php -S localhost:5000 -t public public/router.php
```

## Authentication & roles

Every `/api/*` route except `/api/healthz` and `POST /api/auth/login`
requires a valid `Authorization: Bearer <token>` header (enforced centrally
in `public/index.php` via `Auth::requireAuth()`). Tokens are issued by
`POST /api/auth/login` and are a small self-signed HMAC token (see
`src/Auth.php`) — no external JWT library needed.

There are two roles, stored on the `users` table (separate from the
`workers` staff directory, which is just case-management data):

- **`admin`** — full permissions, including destructive actions: deleting a
  case (`DELETE /api/cases/:id`), deleting a worker or child record, and
  managing login accounts (`/api/users/*`).
- **`staff`** — can use the app (view/create/update cases, children,
  workers, reports, investigations) but cannot delete records or manage
  users. `Auth::requireAdmin()` guards every admin-only route and responds
  `403 Forbidden` otherwise.

Manage login accounts (admin-only) via:
- `GET /api/users` — list accounts
- `POST /api/users` — create `{ name, email, password, role }`
- `PATCH /api/users/:id` — update `{ name, email, role, status, password? }`
- `DELETE /api/users/:id` — remove an account (can't delete your own)

The frontend's Vite dev server proxies `/api` to `localhost:5000`, exactly as
before — no frontend changes needed.

### Production (Apache)
Point the Apache vhost's document root at `backend/public` and make sure
`mod_rewrite` is enabled; `.htaccess` routes every request through `index.php`.

### Production (Nginx)
```nginx
location /api/ {
    try_files $uri /index.php$is_args$args;
}
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

## Notes on the conversion
- **ORM → PDO**: Drizzle's typed query builder is replaced with parameterized
  PDO queries in `src/Model.php`. Table-specific joins (the `cases` ↔
  `children`/`workers` relation) live in `src/routes/cases.php`, mirroring the
  original `getWithRel()` helper.
- **Field naming**: the database still uses `snake_case` columns (see
  `schema.sql`); `src/Utils.php` converts to/from the `camelCase` JSON shape
  the frontend expects, the same shape Drizzle produced automatically.
- **Timestamps**: `created_at`, `updated_at`, `reported_at`, and `closed_at`
  are serialized as ISO-8601 strings (`Y-m-d\TH:i:s.v\Z`), matching
  `Date.prototype.toISOString()` from the Node version. Plain `date` columns
  (e.g. `date_of_birth`) are passed through as-is, matching Drizzle's
  `mode: 'string'`.
- **`updated_at` bump**: handled in `Model::update()` instead of relying on
  application code to set it, matching the effect of the original routes.
- **Migrations**: `drizzle-kit push` is replaced by running `schema.sql`
  directly against your database.
