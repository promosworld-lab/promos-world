-- ============================================================
-- PROMO'S WORLD — LIVE pg_cron JOBS BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 3 cron jobs
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- Job 4: Auto-expire reservations where seller has not responded within 36h
-- Refunds deposit to client wallet, marks reservation as annulee
-- Schedule: every minute
SELECT cron.schedule(
  'auto_expire_reservations_36h',
  '* * * * *',
  $$SELECT public.auto_expire_reservations_36h();$$
);

-- Job 5: Auto-expire reservations accepted but balance unpaid after 3 months
-- Splits deposit: 50% client, 25% seller, 25% platform
-- Schedule: every minute
SELECT cron.schedule(
  'auto_expire_reservations_3_months',
  '* * * * *',
  $$SELECT public.auto_expire_reservations_3_months();$$
);

-- Job 6: Check for overdue shipments (48h after full payment)
-- READ-ONLY: only counts overdue reservations, does NOT take action
-- Schedule: every minute
SELECT cron.schedule(
  'auto_check_expeditions_48h',
  '* * * * *',
  $$SELECT public.auto_check_expeditions_48h();$$
);
