-- Run this once against an EXISTING database (one already upgraded with
-- 001 and 002). A fresh install using the current schema.sql already
-- includes this table.

CREATE TABLE IF NOT EXISTS password_resets (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  token_hash    TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
