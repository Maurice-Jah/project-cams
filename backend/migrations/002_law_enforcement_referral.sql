-- Run this once against an EXISTING database (one already upgraded with
-- 001_link_workers_to_users.sql). A fresh install using the current
-- schema.sql already includes these columns.

ALTER TABLE cases ADD COLUMN IF NOT EXISTS referred_to_law_enforcement BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS referral_agency TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS referral_contact TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS referral_reference_number TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;
