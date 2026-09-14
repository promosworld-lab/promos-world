-- ============================================================
-- PROMO'S WORLD — INSTALLED EXTENSIONS BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 6 installed extensions
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- Core PostgreSQL (always present)
CREATE EXTENSION IF NOT EXISTS plpgsql
  SCHEMA pg_catalog VERSION '1.0';

-- UUID generation (used by gen_random_uuid() defaults)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
  SCHEMA extensions VERSION '1.1';

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto
  SCHEMA extensions VERSION '1.3';

-- Query performance statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements
  SCHEMA extensions VERSION '1.11';

-- Scheduled jobs (used for auto-expiration cron)
CREATE EXTENSION IF NOT EXISTS pg_cron
  SCHEMA pg_catalog VERSION '1.6.4';

-- Supabase secret management
CREATE EXTENSION IF NOT EXISTS supabase_vault
  SCHEMA vault VERSION '0.3.1';
