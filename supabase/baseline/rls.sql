-- ============================================================
-- PROMO'S WORLD — LIVE RLS POLICIES BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 56 policies across 22 tables (not all tables have policies)
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================
-- All tables with RLS ENABLED are listed.
-- Tables without policies: none.
-- ============================================================

-- ========================
-- addresses (1 policy)
-- ========================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY addresses_owner ON public.addresses
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- avis (4 policies)
-- ========================
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

CREATE POLICY avis_public_read ON public.avis
  FOR SELECT TO public
  USING (true);

CREATE POLICY avis_client_insert ON public.avis
  FOR INSERT TO authenticated
  WITH CHECK (client_id = (SELECT auth.uid() AS uid));

CREATE POLICY avis_client_update ON public.avis
  FOR UPDATE TO authenticated
  USING (client_id = (SELECT auth.uid() AS uid))
  WITH CHECK (client_id = (SELECT auth.uid() AS uid));

CREATE POLICY avis_client_delete ON public.avis
  FOR DELETE TO authenticated
  USING (client_id = (SELECT auth.uid() AS uid));

-- ========================
-- cart_items (1 policy)
-- ========================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cart_owner ON public.cart_items
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- categories (1 policy)
-- ========================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated
  USING (actif = true);

-- ========================
-- customer_service_config (2 policies)
-- ========================
ALTER TABLE public.customer_service_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_config_read ON public.customer_service_config
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY support_config_admin ON public.customer_service_config
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'::text
  ));

-- ========================
-- favorites (1 policy)
-- ========================
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_owner ON public.favorites
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- kyc_submissions (3 policies)
-- ========================
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY kyc_read_own_or_admin ON public.kyc_submissions
  FOR SELECT TO authenticated
  USING ((user_id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY kyc_insert_own ON public.kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

CREATE POLICY kyc_update ON public.kyc_submissions
  FOR UPDATE TO authenticated
  USING (((user_id = (SELECT auth.uid() AS uid)) AND (status = 'en_attente'::text)) OR is_admin())
  WITH CHECK (((user_id = (SELECT auth.uid() AS uid)) AND (status = 'en_attente'::text)) OR is_admin());

-- ========================
-- litiges (3 policies)
-- ========================
ALTER TABLE public.litiges ENABLE ROW LEVEL SECURITY;

CREATE POLICY litiges_read ON public.litiges
  FOR SELECT TO authenticated
  USING ((client_id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY litiges_insert ON public.litiges
  FOR INSERT TO authenticated
  WITH CHECK (client_id = (SELECT auth.uid() AS uid));

CREATE POLICY litiges_admin_update ON public.litiges
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========================
-- messages (3 policies)
-- ========================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_read ON public.messages
  FOR SELECT TO authenticated
  USING (
    (expediteur_id = (SELECT auth.uid() AS uid))
    OR (destinataire_id = (SELECT auth.uid() AS uid))
    OR is_admin()
  );

CREATE POLICY messages_insert ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (expediteur_id = (SELECT auth.uid() AS uid));

CREATE POLICY messages_update_receiver ON public.messages
  FOR UPDATE TO authenticated
  USING (destinataire_id = (SELECT auth.uid() AS uid))
  WITH CHECK (destinataire_id = (SELECT auth.uid() AS uid));

-- ========================
-- notifications (2 policies)
-- ========================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_owner ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid));

CREATE POLICY notifications_mark_read ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- platform_ledger (1 policy)
-- ========================
ALTER TABLE public.platform_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_ledger_admin_read ON public.platform_ledger
  FOR SELECT TO authenticated
  USING ((SELECT is_admin() AS is_admin));

-- ========================
-- platform_settings (2 policies)
-- ========================
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_settings_admin_read ON public.platform_settings
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY platform_settings_admin_update ON public.platform_settings
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========================
-- price_alerts (1 policy)
-- ========================
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_owner ON public.price_alerts
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- product_views (2 policies)
-- ========================
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_views_insert_public ON public.product_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY product_views_seller_read ON public.product_views
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM promotions p
    WHERE p.id = product_views.promotion_id AND p.vendeur_id = auth.uid()
  ));

-- ========================
-- profiles (3 policies)
-- ========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_read ON public.profiles
  FOR SELECT TO public
  USING (true);

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING ((id = (SELECT auth.uid() AS uid)) OR is_admin())
  WITH CHECK ((id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- ========================
-- promotion_media (2 policies)
-- ========================
ALTER TABLE public.promotion_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY promotion_media_public_read ON public.promotion_media
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM promotions p
    WHERE p.id = promotion_media.promotion_id AND p.is_active = true
  ));

CREATE POLICY promotion_media_owner_manage ON public.promotion_media
  FOR ALL TO authenticated
  USING ((vendeur_id = auth.uid()) OR is_admin())
  WITH CHECK ((vendeur_id = auth.uid()) OR is_admin());

-- ========================
-- promotions (5 policies)
-- ========================
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY promotions_read ON public.promotions
  FOR SELECT TO public
  USING (
    (statut = 'actif'::text)
    OR (vendeur_id = (SELECT auth.uid() AS uid))
    OR is_admin()
  );

CREATE POLICY promotions_insert ON public.promotions
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      (vendeur_id = (SELECT auth.uid() AS uid))
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid() AS uid)
          AND profiles.role = 'vendeur'::text
          AND (profiles.kyc_status = 'verifie'::text OR is_test_mode())
      )
    ) OR is_admin()
  );

CREATE POLICY promotions_update ON public.promotions
  FOR UPDATE TO authenticated
  USING ((vendeur_id = (SELECT auth.uid() AS uid)) OR is_admin())
  WITH CHECK ((vendeur_id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY promotions_delete ON public.promotions
  FOR DELETE TO authenticated
  USING ((vendeur_id = (SELECT auth.uid() AS uid)) OR is_admin());

-- ========================
-- publication_promotions (4 policies)
-- ========================
ALTER TABLE public.publication_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY publication_promotions_read ON public.publication_promotions
  FOR SELECT TO anon, authenticated
  USING (
    ((statut = 'active'::text) AND (date_debut <= now()) AND (date_fin >= now()))
    OR (vendeur_id = (SELECT auth.uid() AS uid))
    OR (SELECT is_admin() AS is_admin)
  );

CREATE POLICY publication_promotions_vendor_insert ON public.publication_promotions
  FOR INSERT TO authenticated
  WITH CHECK (
    (vendeur_id = (SELECT auth.uid() AS uid))
    AND EXISTS (
      SELECT 1 FROM promotions p
      WHERE p.id = publication_promotions.publication_id
        AND p.vendeur_id = (SELECT auth.uid() AS uid)
    )
  );

CREATE POLICY publication_promotions_vendor_update ON public.publication_promotions
  FOR UPDATE TO authenticated
  USING ((vendeur_id = (SELECT auth.uid() AS uid)) OR (SELECT is_admin() AS is_admin))
  WITH CHECK ((vendeur_id = (SELECT auth.uid() AS uid)) OR (SELECT is_admin() AS is_admin));

CREATE POLICY publication_promotions_admin_delete ON public.publication_promotions
  FOR DELETE TO authenticated
  USING (is_admin());

-- ========================
-- recent_views (1 policy)
-- ========================
ALTER TABLE public.recent_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY recent_views_owner ON public.recent_views
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid() AS uid))
  WITH CHECK (user_id = (SELECT auth.uid() AS uid));

-- ========================
-- reservations (4 policies)
-- ========================
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY reservations_read ON public.reservations
  FOR SELECT TO authenticated
  USING (
    (client_id = (SELECT auth.uid() AS uid))
    OR EXISTS (
      SELECT 1 FROM promotions p
      WHERE p.id = reservations.promotion_id
        AND p.vendeur_id = (SELECT auth.uid() AS uid)
    )
    OR is_admin()
  );

CREATE POLICY reservations_admin_insert ON public.reservations
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY reservations_admin_update ON public.reservations
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY reservations_admin_delete ON public.reservations
  FOR DELETE TO authenticated
  USING (is_admin());

-- ========================
-- transactions (4 policies)
-- ========================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_read ON public.transactions
  FOR SELECT TO authenticated
  USING (
    (client_id = (SELECT auth.uid() AS uid))
    OR (vendeur_id = (SELECT auth.uid() AS uid))
    OR is_admin()
  );

CREATE POLICY transactions_admin_insert ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY transactions_admin_update ON public.transactions
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY transactions_admin_delete ON public.transactions
  FOR DELETE TO authenticated
  USING (is_admin());

-- ========================
-- wallet_transactions (4 policies)
-- ========================
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_transactions_read ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING ((user_id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY wallet_transactions_admin_insert ON public.wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY wallet_transactions_admin_update ON public.wallet_transactions
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY wallet_transactions_admin_delete ON public.wallet_transactions
  FOR DELETE TO authenticated
  USING (is_admin());

-- ========================
-- wallets (4 policies)
-- ========================
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallets_read ON public.wallets
  FOR SELECT TO authenticated
  USING ((user_id = (SELECT auth.uid() AS uid)) OR is_admin());

CREATE POLICY wallets_admin_manage ON public.wallets
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY wallets_admin_update ON public.wallets
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY wallets_admin_delete ON public.wallets
  FOR DELETE TO authenticated
  USING (is_admin());
