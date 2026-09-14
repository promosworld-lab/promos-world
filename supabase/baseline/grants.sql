-- ============================================================
-- PROMO'S WORLD — FUNCTION EXECUTE GRANTS BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================
-- Lists EXECUTE grants on public functions to anon, authenticated,
-- and service_role roles.
-- WARNING: Some functions granted to 'anon' may be a security risk.
-- ============================================================

-- ========================
-- GRANTS TO: anon
-- ========================
-- WARNING: The following functions are callable by unauthenticated users
GRANT EXECUTE ON FUNCTION public.add_to_cart(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.checkout_cart(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_kyc_verified(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_test_mode() TO anon;
GRANT EXECUTE ON FUNCTION public.make_order_number() TO anon;
GRANT EXECUTE ON FUNCTION public.stop_publication(uuid) TO anon;

-- ========================
-- GRANTS TO: authenticated
-- ========================
GRANT EXECUTE ON FUNCTION public.accept_reservation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_cart(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_check_expeditions_48h() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_expire_reservations_36h() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_expire_reservations_3_months() TO authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_cart(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_delivery(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_direct_conformity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_direct_reception(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_direct_shipped(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_reception(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_conformity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_delivery(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_reception(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_shipped(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_reservation_from_wallet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_test_wallet(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_reservation_3_months(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extend_direct_shipping(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_reservation_decision(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_kyc_verified(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_test_mode() TO authenticated;
GRANT EXECUTE ON FUNCTION public.make_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_reservation_dispute(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_reservation_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_reservation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_reservation_dispute(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_test_mode(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_wallet_deposit(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.stop_publication(uuid) TO authenticated;

-- ========================
-- GRANTS TO: service_role
-- ========================
GRANT EXECUTE ON FUNCTION public.accept_reservation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_to_cart(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_check_expeditions_48h() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_expire_reservations_36h() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_expire_reservations_3_months() TO service_role;
GRANT EXECUTE ON FUNCTION public.checkout_cart(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_delivery(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_direct_conformity(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_direct_reception(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_direct_shipped(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_reception(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_conformity(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_delivery(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_reception(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_reservation_shipped(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_reservation_from_wallet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_test_wallet(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_reservation_3_months(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.extend_direct_shipping(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_reservation_decision(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_kyc_verified(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_test_mode() TO service_role;
GRANT EXECUTE ON FUNCTION public.make_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.open_reservation_dispute(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.pay_reservation_balance(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_reservation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_reservation_dispute(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_test_mode(boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.simulate_wallet_deposit(uuid, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.stop_publication(uuid) TO service_role;

-- ========================
-- TRIGGER FUNCTIONS (no direct EXECUTE grants needed)
-- ========================
-- The following trigger functions are invoked only by triggers,
-- not by RPC calls. They are listed for completeness:
--   handle_new_user, handle_new_wallet, create_wallet_for_profile,
--   handle_updated_at, update_updated_at, set_publication_location,
--   sync_publication_visibility, prevent_unverified_seller_publication,
--   notify_message, notify_promotion_change, sync_kyc_status_to_profile,
--   sync_publication_promotion_updated_at, sync_wallet_total,
--   ensure_one_default_address
