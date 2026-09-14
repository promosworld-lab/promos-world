-- ============================================================
-- PROMO'S WORLD — LIVE TRIGGER BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 17 triggers (16 public + 1 auth)
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- ========================
-- PUBLIC SCHEMA TRIGGERS
-- ========================

-- addresses
CREATE TRIGGER trg_one_default_address
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_one_default_address();

-- kyc_submissions
CREATE TRIGGER kyc_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER sync_kyc_to_profile
  AFTER INSERT OR UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_kyc_status_to_profile();

-- litiges
CREATE TRIGGER litiges_updated_at
  BEFORE UPDATE ON public.litiges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- messages
CREATE TRIGGER trg_notify_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_message();

-- profiles
-- WARNING: DUPLICATE wallet creation triggers (both fire on INSERT)
CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();

CREATE TRIGGER trigger_create_wallet_for_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_profile();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- promotions
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER publication_location_trigger
  BEFORE INSERT OR UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_publication_location();

CREATE TRIGGER trg_notify_promotion_change
  AFTER UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.notify_promotion_change();

CREATE TRIGGER trg_sync_publication_visibility
  BEFORE INSERT OR UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.sync_publication_visibility();

CREATE TRIGGER verify_seller_before_publication
  BEFORE INSERT ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_unverified_seller_publication();

-- publication_promotions
CREATE TRIGGER trg_publication_promotions_updated_at
  BEFORE UPDATE ON public.publication_promotions
  FOR EACH ROW EXECUTE FUNCTION public.sync_publication_promotion_updated_at();

-- wallets
CREATE TRIGGER trg_sync_wallet_total
  BEFORE INSERT OR UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.sync_wallet_total();

CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ========================
-- AUTH SCHEMA TRIGGER
-- ========================

-- auth.users (creates profile on signup)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
