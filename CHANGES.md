# CAMS — What changed and how to try it

## 1. Database

**`backend/schema.sql`** — added one column:

```sql
ALTER TABLE workers ADD COLUMN user_id INTEGER REFERENCES users(id);
```

This is the missing link between a **login account** (`users`) and a **staff
directory record** (`workers`). Everything else (assignment, "my cases",
dashboard personalization) depends on this.

- **Fresh install:** just run the updated `schema.sql` — the column is
  already in it.
- **Existing database:** run `backend/migrations/001_link_workers_to_users.sql`
  once against it.

## 2. Backend (PHP)

| File | What changed |
|---|---|
| `routes/workers.php` | `WORKERS_COLUMNS` now includes `user_id`. New `GET /workers/me` — resolves the logged-in user's linked worker record (or `null`). |
| `routes/cases.php` | `GET /cases?assignedToMe=1` filters to cases assigned to the caller's linked worker. `PATCH /cases/:id` now auto-stamps `closed_at` when status becomes `closed`, and clears it if the case is reopened/reassigned away from `closed`. |
| `routes/dashboard.php` | Response now includes `myWorkerId`, `myOpenCaseCount`, and `myAssignedCases` (the caller's own cases), computed from the linked worker record. |

Nothing else in the backend changed — validation, admin-only rules
(deleting cases/workers/users, managing accounts) are untouched.

## 3. Frontend

- **`layout.jsx`** — the "3 Critical Alerts" badge is now the *real* count
  of cases with `priority = critical` (from the dashboard summary), hidden
  when zero, and clickable → filtered case list.
- **`dashboard.jsx`** — the four stat cards are now links (Active → open
  cases, Critical → critical cases, Children, Investigations). Staff with a
  linked worker record see a new **"My Assigned Cases"** panel.
- **`cases.jsx`** — reads `?status=`, `?priority=`, `?assignedToMe=1` from
  the URL to filter the list; a **"My Cases"** toggle button; shows the
  assigned worker per row.
- **`cases-new.jsx`** — you can now pick a child and assign a worker at
  creation time, and status includes the full workflow (`open` →
  `under_investigation` → `escalated` → `closed`). If you arrive from a
  report conversion, the abuse type/description are prefilled.
- **`cases-detail.jsx`** — new **Workflow** panel: change status, priority,
  and reassign the worker inline. Escalated cases show a reminder banner;
  closed cases show the closing timestamp. Shows a link back to the source
  report, if any.
- **`reports-detail.jsx`** — new **"Convert to Case"** button (hidden once
  a report is closed). It opens a prefilled case form; on save, the report
  is marked `escalated` so it's clear it's been acted on.
- **`workers-detail.jsx`** — admins get a **Login Account** selector to
  link a staff record to a sign-in account.
- **`users.jsx`** — shows each login account's linked staff record (if
  any), for visibility from the other direction.

## What this gets you

- **Reports vs. Cases**: a report is the intake record; "Convert to Case"
  is the deliberate step that opens an investigable case and keeps the
  paper trail (`case.reportId`).
- **Sign-in and "my cases"**: link a `users` account to a `workers` record
  from that worker's profile page (admin-only). That person's dashboard and
  Cases page (via the "My Cases" toggle) will then show only what's
  assigned to them.
- **Who assigns a case**: anyone signed in can (re)assign a case's worker
  from the case detail page — that's the "Assigned Worker" dropdown in the
  Workflow panel. Deleting a case remains admin-only.
- **Escalated vs. closed**: escalating just changes status and flags the
  case for supervisor attention (banner shown on the case). Closing sets
  `closedAt` automatically and is meant to signal no further action is
  expected; reopening clears that timestamp again.

## Known limitations (out of scope for this pass)

- `GET /workers` and `GET /cases` (without `assignedToMe`) still don't
  require authentication at the backend route level — this matches the
  original app's behavior and wasn't part of what was asked, but worth
  knowing if you tighten security later.
- There's no audit trail of *who* changed a case's status/assignment, only
  *that* it changed (case notes remain a manual, free-text log).

---

## Round 2: real role permissions, law-enforcement referral, PDF export

### 1. Staff roles now actually mean something (not just labels)

Two rules are enforced **on the backend**, not just hidden in the UI:

- **Closing an escalated case** requires the current user to be a
  login-level `admin`, or have a linked worker record tagged `supervisor`
  or `admin`. Anyone else gets a `403` from the API — the frontend also
  disables the "Closed" option in that case so people aren't surprised, but
  the real enforcement is server-side (`Auth::requireCaseClosePermission()`
  in `Auth.php`, called from `routes/cases.php`).
- **Assigning an investigation** requires the chosen worker's staff role to
  be `investigator`. The API rejects (`422`) any other worker id
  (`assertAssignableInvestigator()` in `routes/investigations.php`). The
  investigator dropdowns on the investigation pages are filtered to match.
- This logic is centralized in one place — `Auth::currentWorker()` and
  `Auth::requireCaseClosePermission()` — so it can be extended (e.g. more
  rules) without duplicating checks across routes.

### 2. Law-enforcement referral flag (record-only, no external access)

- New columns on `cases`: `referred_to_law_enforcement`, `referral_agency`,
  `referral_contact`, `referral_reference_number`, `referred_at`.
- A new **"Law Enforcement Referral"** panel on the case detail page lets
  staff mark a case as referred, with the agency name, a contact, and an
  optional reference number. `referred_at` is stamped automatically.
- This is explicitly **not** an integration or an account — no outside
  party gets access to CAMS. It's a record for your own staff to know a
  case was handed off and to whom.

### 3. Case export (PDF via print)

- New route `/cases/:id/report` — a clean, standalone printable page (no
  sidebar/nav) summarizing the case: overview, child, assignment, referral
  (if any), investigations, and case notes.
- A **"Export Report"** button on the case detail page opens it in a new
  tab; from there, "Print / Save as PDF" uses the browser's native print
  dialog. No new dependencies — this was a deliberate choice over a PDF
  library, since browser printing is reliable everywhere and needs no extra
  packages.
- Still requires being logged in (it's not a public URL), it's just
  rendered without the app chrome so it prints cleanly.

### Migration for existing databases

If you're upgrading a database that already ran `001_link_workers_to_users.sql`,
also run:
```bash
psql "$DATABASE_URL" -f backend/migrations/002_law_enforcement_referral.sql
```
A fresh install from the current `schema.sql` already has everything.

---

## Round 3: password reset, and logo/avatars

### 1. Password reset — three ways, matching who's asking

- **Self-service "Forgot password?"** — `/forgot-password` on the login
  page. Requests a time-limited (30 min), single-use token; the API always
  returns the same generic message whether or not the email exists, so the
  endpoint can't be used to discover which emails have accounts (a standard
  anti-enumeration practice worth mentioning in a defense). The link opens
  `/reset-password?token=...` to set a new password.
- **Self-service "Change Password"** — a new `/account` page (linked from
  the gear icon next to Sign Out in the sidebar) for a logged-in user who
  knows their current password and just wants to change it.
- **Admin-assisted reset** — a "Send Reset Link" button per row on Users &
  Access. Triggers the exact same token flow as "Forgot password?", so an
  admin can help someone who's locked out without ever seeing or setting
  their password directly.
- Tokens are stored **hashed** (`sha256`) in a new `password_resets` table,
  never in plaintext — the same principle as `users.password_hash`.
- **Emailing**: a small `Mailer` class (`backend/src/Mailer.php`) either
  sends via PHP's `mail()` (if `MAIL_ENABLED=true` and a real mail server
  is configured) or, by default, writes the email to
  `backend/storage/outbox/` as a `.txt` file — this mirrors how mainstream
  frameworks handle local development (e.g. Laravel's "log" mail driver),
  so the whole flow can be exercised and demoed without needing SMTP set
  up. Same code path either way; just flip `MAIL_ENABLED` for production.

### 2. Branding: logo and avatars

- Added a small inline-SVG **logo mark** (`components/logo.jsx`) used on
  the login/forgot/reset pages, the sidebar header, and the case report
  letterhead — replacing the generic icon that was there before.
- Added **initials avatars** (`components/avatar-initials.jsx`) for
  workers, children, and users lists, each with a consistent color derived
  from the person's name.
- Deliberately **not** using stock/generated photos anywhere, and
  especially not for children: this system holds sensitive information
  about minors, so a photo-shaped placeholder would be inappropriate even
  as a mockup. Initials avatars give the same visual polish without that
  risk.

### Migration for existing databases

Also run, on top of 001 and 002:
```bash
psql "$DATABASE_URL" -f backend/migrations/003_password_resets.sql
```
And update `.env` with the new `FRONTEND_URL`, `MAIL_ENABLED`, and
`MAIL_FROM` keys (see `.env.example`) — defaults work fine for local
testing.
