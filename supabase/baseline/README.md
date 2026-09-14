# Promo's World — Supabase Live Database Baseline

> **Captured**: 2026-09-13  
> **Project ID**: `rzrddmsviveuschrbphu`  
> **PostgreSQL**: 17.6.1.155  
> **Region**: eu-west-1  
> **Status**: ACTIVE_HEALTHY

## Purpose

This directory contains a **reference-only snapshot** of the live Supabase database schema as it exists in production. These files are NOT meant to be executed directly — they serve as the baseline for planning migrations.

## Files

| File | Description | Count |
|------|-------------|-------|
| `schema.sql` | CREATE TABLE DDL for all tables | 22 tables (23 with wallets) |
| `functions.sql` | All PL/pgSQL functions (RPCs, triggers, utilities, cron) | 40 functions (38 unique + 2 overloads) |
| `triggers.sql` | All triggers (public + auth schema) | 17 triggers |
| `rls.sql` | All Row Level Security policies with ENABLE statements | 56 policies |
| `indexes.sql` | All indexes (PK + secondary) | 90 indexes |
| `grants.sql` | EXECUTE grants for anon/authenticated/service_role | ~100 grant statements |
| `cron.sql` | pg_cron scheduled jobs | 3 jobs |
| `storage.sql` | Storage buckets and object policies | 3 buckets + 7 policies |
| `extensions.sql` | Installed PostgreSQL extensions | 6 extensions |

## Key Metrics

- **22 public tables** (addresses, avis, cart_items, categories, customer_service_config, favorites, kyc_submissions, litiges, messages, notifications, platform_ledger, platform_settings, price_alerts, product_views, profiles, promotion_media, promotions, publication_promotions, recent_views, reservations, transactions, wallet_transactions, wallets)
- **40 functions** (25 RPC métier + 14 trigger functions + 4 utility + 3 cron)
- **17 triggers** (16 on public tables + 1 on auth.users)
- **56 RLS policies** across 19 tables
- **90 indexes** (22 PK + 68 secondary including partial indexes)
- **3 storage buckets** (promos [public, 2 files], publication-media [public, empty], kyc-documents [private, empty])
- **3 pg_cron jobs** (all running every minute)
- **6 extensions** (plpgsql, uuid-ossp, pgcrypto, pg_stat_statements, pg_cron, supabase_vault)
- **0 views**, **0 custom ENUMs**, **0 Edge Functions**

## Known Issues (from Audit)

### Critical
1. **Schema Drift**: The Git repository contains only 3 partial SQL files covering ~6 tables. The live database has 22 tables and 40 functions not version-controlled.
2. **Commission Rate Inconsistency**: RPCs use `0.02` (2%) but `lib/utils/constants.ts` has `PLATFORM_COMMISSION_RATE = 0.05` (5%).
3. **Duplicate Wallet Triggers**: Two triggers fire on `profiles` INSERT — `on_profile_created_wallet` (calls `handle_new_wallet`) and `trigger_create_wallet_for_profile` (calls `create_wallet_for_profile`). This creates duplicate wallets.
4. **Duplicate updated_at Functions**: `handle_updated_at()` and `update_updated_at()` are functionally identical.

### Security
5. **Anon EXECUTE Grants**: `add_to_cart`, `checkout_cart`, `create_direct_purchase_from_wallet(uuid)`, `stop_publication` are callable by unauthenticated users.
6. **Role Injection Risk**: `handle_new_user()` reads `role` from `raw_user_meta_data`, allowing clients to self-assign any role.

### Business Logic
7. **Inspection Deadline**: Currently 48h in RPCs, user wants 24h.
8. **Deposit Rate**: Correctly 20% in live code.
9. **Expired Reservation Split**: 50% client / 25% vendor / 25% platform (in `expire_reservation_3_months`).

## Do NOT

- Apply these files directly to any database
- Modify these files (they represent a frozen snapshot)
- Use them as migration scripts

## Next Steps

See `docs/SUPABASE_BASELINE.md` for the complete drift analysis and `docs/MIGRATION_PLAN.md` for the phased migration plan.
