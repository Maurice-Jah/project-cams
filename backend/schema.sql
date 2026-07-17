-- CAMS schema — PostgreSQL
-- Equivalent to the original Drizzle ORM schema (backend/src/db.js)

-- Login accounts for the web app. This is separate from `workers` (the staff
-- directory): a `users` row is a credential + role, used only for
-- authentication/authorization. role = 'admin' has full permissions
-- (including destructive actions like deleting a case); role = 'staff' can
-- use the app but not perform admin-only actions.
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'staff', -- 'admin' | 'staff'
  status         TEXT NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id               SERIAL PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  date_of_birth    DATE NOT NULL,
  gender           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active',
  address          TEXT,
  guardian_name    TEXT,
  guardian_phone   TEXT,
  school_name      TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workers (
  id               SERIAL PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT,
  role             TEXT NOT NULL DEFAULT 'social_worker',
  department       TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active',
  -- Optional link to a login account (users.id). This is what lets someone
  -- who signs in see "their" assigned cases: we resolve their worker record
  -- via this column, then look up cases/investigations by worker_id.
  -- Nullable because not every staff directory entry needs a login (e.g. a
  -- worker who isn't a system user yet), and not every login needs a staff
  -- record (e.g. an admin who only manages accounts).
  user_id          INTEGER REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id                 SERIAL PRIMARY KEY,
  reporter_name      TEXT NOT NULL,
  reporter_type      TEXT NOT NULL DEFAULT 'anonymous',
  reporter_phone     TEXT,
  reporter_email     TEXT,
  abuse_type         TEXT NOT NULL,
  description        TEXT NOT NULL,
  child_first_name   TEXT,
  child_last_name    TEXT,
  child_age          INTEGER,
  incident_location  TEXT,
  incident_date      DATE,
  status             TEXT NOT NULL DEFAULT 'new',
  reported_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cases (
  id            SERIAL PRIMARY KEY,
  case_number   TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'open',
  priority      TEXT NOT NULL DEFAULT 'medium',
  abuse_type    TEXT NOT NULL,
  description   TEXT,
  reported_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at     TIMESTAMPTZ,
  child_id      INTEGER REFERENCES children(id),
  worker_id     INTEGER REFERENCES workers(id),
  report_id     INTEGER REFERENCES reports(id),
  -- Law-enforcement referral: a record-keeping flag only. Referring a case
  -- does NOT grant any outside party access to this system — it just marks
  -- that the case was handed off externally, with who/what reference number
  -- to follow up with. See CHANGES.md for why this is intentionally a flag
  -- and not a real external account/integration.
  referred_to_law_enforcement  BOOLEAN NOT NULL DEFAULT false,
  referral_agency               TEXT,
  referral_contact              TEXT,
  referral_reference_number     TEXT,
  referred_at                   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-service / admin-assisted password reset tokens. We store a hash of
-- the token (never the raw token) so that even a full database leak can't
-- be used to reset accounts — same principle as password_hash on users.
CREATE TABLE IF NOT EXISTS password_resets (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  token_hash    TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investigations (
  id            SERIAL PRIMARY KEY,
  case_id       INTEGER NOT NULL REFERENCES cases(id),
  worker_id     INTEGER REFERENCES workers(id),
  status        TEXT NOT NULL DEFAULT 'open',
  started_at    DATE NOT NULL,
  completed_at  DATE,
  findings      TEXT NOT NULL DEFAULT '',
  outcome       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_notes (
  id           SERIAL PRIMARY KEY,
  case_id      INTEGER NOT NULL REFERENCES cases(id),
  content      TEXT NOT NULL,
  author_name  TEXT NOT NULL DEFAULT 'Unknown',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
