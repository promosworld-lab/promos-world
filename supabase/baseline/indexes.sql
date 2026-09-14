-- ============================================================
-- PROMO'S WORLD — LIVE INDEX BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 90 indexes (22 PK + 68 secondary)
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- addresses (3 indexes)
CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);
CREATE UNIQUE INDEX addresses_user_label_unique ON public.addresses USING btree (user_id, label);
CREATE INDEX idx_addresses_user ON public.addresses USING btree (user_id, is_default DESC, created_at DESC);

-- avis (4 indexes)
CREATE UNIQUE INDEX avis_pkey ON public.avis USING btree (id);
CREATE UNIQUE INDEX avis_unique_client_reservation ON public.avis USING btree (client_id, reservation_id);
CREATE INDEX idx_avis_reservation_id ON public.avis USING btree (reservation_id);
CREATE INDEX idx_avis_vendeur ON public.avis USING btree (vendeur_id);

-- cart_items (3 indexes)
CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);
CREATE UNIQUE INDEX cart_items_user_id_promotion_id_key ON public.cart_items USING btree (user_id, promotion_id);
CREATE INDEX idx_cart_user ON public.cart_items USING btree (user_id, created_at DESC);

-- categories (2 indexes)
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);
CREATE UNIQUE INDEX categories_nom_key ON public.categories USING btree (nom);

-- customer_service_config (1 index)
CREATE UNIQUE INDEX customer_service_config_pkey ON public.customer_service_config USING btree (id);

-- favorites (3 indexes)
CREATE UNIQUE INDEX favorites_pkey ON public.favorites USING btree (id);
CREATE UNIQUE INDEX favorites_user_id_promotion_id_key ON public.favorites USING btree (user_id, promotion_id);
CREATE INDEX idx_favorites_user ON public.favorites USING btree (user_id, created_at DESC);

-- kyc_submissions (5 indexes)
CREATE UNIQUE INDEX kyc_submissions_pkey ON public.kyc_submissions USING btree (id);
CREATE INDEX idx_kyc_user_id ON public.kyc_submissions USING btree (user_id);
CREATE INDEX idx_kyc_status ON public.kyc_submissions USING btree (status);
CREATE INDEX idx_kyc_role ON public.kyc_submissions USING btree (role);
CREATE INDEX idx_kyc_submissions_reviewed_by ON public.kyc_submissions USING btree (reviewed_by);
CREATE UNIQUE INDEX unique_active_kyc_submission ON public.kyc_submissions USING btree (user_id) WHERE (status = 'en_attente'::text);

-- litiges (5 indexes)
CREATE UNIQUE INDEX litiges_pkey ON public.litiges USING btree (id);
CREATE INDEX idx_litiges_transaction_id ON public.litiges USING btree (transaction_id);
CREATE INDEX idx_litiges_client_id ON public.litiges USING btree (client_id);
CREATE INDEX idx_litiges_promotion_id ON public.litiges USING btree (promotion_id);
CREATE INDEX idx_litiges_statut ON public.litiges USING btree (statut);

-- messages (5 indexes)
CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);
CREATE INDEX idx_messages_expediteur ON public.messages USING btree (expediteur_id);
CREATE INDEX idx_messages_destinataire ON public.messages USING btree (destinataire_id);
CREATE INDEX idx_messages_promotion ON public.messages USING btree (promotion_id);
CREATE INDEX idx_messages_created ON public.messages USING btree (created_at);

-- notifications (2 indexes)
CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);
CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, created_at DESC);

-- platform_ledger (1 index)
CREATE UNIQUE INDEX platform_ledger_pkey ON public.platform_ledger USING btree (id);

-- platform_settings (1 index)
CREATE UNIQUE INDEX platform_settings_pkey ON public.platform_settings USING btree (id);

-- price_alerts (3 indexes)
CREATE UNIQUE INDEX price_alerts_pkey ON public.price_alerts USING btree (id);
CREATE UNIQUE INDEX price_alerts_user_id_promotion_id_key ON public.price_alerts USING btree (user_id, promotion_id);

-- product_views (3 indexes)
CREATE UNIQUE INDEX product_views_pkey ON public.product_views USING btree (id);
CREATE INDEX product_views_promotion_created_idx ON public.product_views USING btree (promotion_id, created_at DESC);
CREATE INDEX product_views_viewer_idx ON public.product_views USING btree (viewer_id);

-- profiles (8 indexes)
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX idx_profiles_kyc_status ON public.profiles USING btree (kyc_status);
CREATE INDEX idx_profiles_location ON public.profiles USING btree (pays, ville);
CREATE INDEX profiles_pays_idx ON public.profiles USING btree (pays);
CREATE INDEX profiles_ville_idx ON public.profiles USING btree (ville);
CREATE UNIQUE INDEX profiles_telephone_unique_idx ON public.profiles USING btree (telephone) WHERE ((telephone IS NOT NULL) AND (btrim(telephone) <> ''::text));
CREATE INDEX idx_profiles_onboarding_completed ON public.profiles USING btree (onboarding_completed) WHERE (onboarding_completed = false);

-- promotion_media (2 indexes)
CREATE UNIQUE INDEX promotion_media_pkey ON public.promotion_media USING btree (id);
CREATE INDEX idx_promotion_media_promotion ON public.promotion_media USING btree (promotion_id, "position");

-- promotions (7 indexes)
CREATE UNIQUE INDEX promotions_pkey ON public.promotions USING btree (id);
CREATE INDEX idx_promotions_vendeur ON public.promotions USING btree (vendeur_id);
CREATE INDEX idx_promotions_statut ON public.promotions USING btree (statut);
CREATE INDEX idx_promotions_created_at ON public.promotions USING btree (created_at DESC);
CREATE INDEX idx_promotions_location ON public.promotions USING btree (pays, ville);
CREATE INDEX idx_promotions_type ON public.promotions USING btree (publication_type);
CREATE INDEX idx_promotions_promoted_until ON public.promotions USING btree (is_promoted, promoted_until) WHERE (is_promoted = true);

-- publication_promotions (4 indexes)
CREATE UNIQUE INDEX publication_promotions_pkey ON public.publication_promotions USING btree (id);
CREATE INDEX idx_publication_promotions_publication ON public.publication_promotions USING btree (publication_id);
CREATE INDEX idx_publication_promotions_vendeur ON public.publication_promotions USING btree (vendeur_id);
CREATE INDEX idx_publication_promotions_active_window ON public.publication_promotions USING btree (statut, emplacement, date_debut, date_fin);

-- recent_views (3 indexes)
CREATE UNIQUE INDEX recent_views_pkey ON public.recent_views USING btree (id);
CREATE UNIQUE INDEX recent_views_user_id_promotion_id_key ON public.recent_views USING btree (user_id, promotion_id);
CREATE INDEX idx_recent_views_user ON public.recent_views USING btree (user_id, viewed_at DESC);

-- reservations (8 indexes)
CREATE UNIQUE INDEX reservations_pkey ON public.reservations USING btree (id);
CREATE INDEX idx_reservations_client_id ON public.reservations USING btree (client_id);
CREATE INDEX idx_reservations_promotion_id ON public.reservations USING btree (promotion_id);
CREATE INDEX idx_reservations_statut ON public.reservations USING btree (statut);
CREATE INDEX idx_reservations_date_limite_acceptation ON public.reservations USING btree (date_limite_acceptation);
CREATE INDEX idx_reservations_date_limite_solde ON public.reservations USING btree (date_limite_solde);
CREATE INDEX idx_reservations_date_limite_expedition ON public.reservations USING btree (date_limite_expedition);
CREATE INDEX idx_reservations_date_limite_livraison ON public.reservations USING btree (date_limite_livraison);
CREATE INDEX idx_reservations_date_limite_inspection ON public.reservations USING btree (date_limite_inspection);

-- transactions (7 indexes)
CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);
CREATE INDEX idx_transactions_client ON public.transactions USING btree (client_id);
CREATE INDEX idx_transactions_vendeur ON public.transactions USING btree (vendeur_id);
CREATE INDEX idx_transactions_promotion ON public.transactions USING btree (promotion_id);
CREATE INDEX idx_transactions_reservation_id ON public.transactions USING btree (reservation_id);
CREATE INDEX idx_transactions_statut ON public.transactions USING btree (statut);
CREATE UNIQUE INDEX idx_transactions_order_number ON public.transactions USING btree (order_number) WHERE (order_number IS NOT NULL);

-- wallet_transactions (8 indexes)
CREATE UNIQUE INDEX wallet_transactions_pkey ON public.wallet_transactions USING btree (id);
CREATE INDEX idx_wallet_transactions_user ON public.wallet_transactions USING btree (user_id);
CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions USING btree (wallet_id);
CREATE INDEX idx_wallet_transactions_promotion_id ON public.wallet_transactions USING btree (promotion_id);
CREATE INDEX idx_wallet_transactions_reservation_id ON public.wallet_transactions USING btree (reservation_id);
CREATE INDEX idx_wallet_transactions_transaction_id ON public.wallet_transactions USING btree (transaction_id);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions USING btree (statut);
CREATE INDEX idx_wallet_transactions_created ON public.wallet_transactions USING btree (created_at DESC);

-- wallets (2 indexes)
CREATE UNIQUE INDEX wallets_pkey ON public.wallets USING btree (id);
CREATE UNIQUE INDEX wallets_user_id_key ON public.wallets USING btree (user_id);
