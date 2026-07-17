-- Run this once against an EXISTING database that was created from an older
-- version of schema.sql (one that didn't have workers.user_id yet).
-- A fresh install using the current schema.sql already includes this column,
-- so this file is only needed for upgrading a database you already have data in.

ALTER TABLE workers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
