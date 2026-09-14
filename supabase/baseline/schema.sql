-- ============================================================
-- PROMO'S WORLD — LIVE DATABASE BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- PostgreSQL 17.6.1.155 | Region: eu-west-1
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- 1. addresses (delivery addresses per user)
CREATE TABLE public.addresses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  label text DEFAULT 'Principal'::text NOT NULL,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text DEFAULT 'Bénin'::text NOT NULL,
  instructions text,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT addresses_user_label_unique UNIQUE (user_id, label)
);

-- 2. avis (reviews: client rates vendeur after completed reservation)
CREATE TABLE public.avis (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id uuid NOT NULL,
  vendeur_id uuid NOT NULL,
  reservation_id uuid NOT NULL,
  note integer NOT NULL,
  commentaire text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT avis_pkey PRIMARY KEY (id),
  CONSTRAINT avis_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT avis_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id),
  CONSTRAINT avis_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id),
  CONSTRAINT avis_unique_client_reservation UNIQUE (client_id, reservation_id),
  CONSTRAINT avis_note_check CHECK (note >= 1 AND note <= 5)
);

-- 3. cart_items (shopping cart per user)
CREATE TABLE public.cart_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT cart_items_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT cart_items_user_id_promotion_id_key UNIQUE (user_id, promotion_id),
  CONSTRAINT cart_items_quantity_check CHECK (quantity > 0)
);

-- 4. categories (product categories, 22 seed rows)
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nom text NOT NULL,
  actif boolean DEFAULT true NOT NULL,
  ordre integer DEFAULT 0 NOT NULL,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_nom_key UNIQUE (nom)
);

-- 5. customer_service_config (singleton: admin support user)
CREATE TABLE public.customer_service_config (
  id boolean DEFAULT true NOT NULL,
  user_id uuid NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT customer_service_config_pkey PRIMARY KEY (id),
  CONSTRAINT customer_service_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT customer_service_config_id_check CHECK (id)
);

-- 6. favorites (user product bookmarks)
CREATE TABLE public.favorites (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT favorites_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT favorites_user_id_promotion_id_key UNIQUE (user_id, promotion_id)
);

-- 7. kyc_submissions (KYC identity verification documents)
CREATE TABLE public.kyc_submissions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  status text DEFAULT 'en_attente'::text NOT NULL,
  nom_complet text,
  telephone text,
  pays text,
  ville text,
  adresse text,
  document_type text,
  document_number text,
  document_url text,
  face_video_url text,
  entreprise_nom text,
  entreprise_type text,
  entreprise_adresse text,
  entreprise_telephone text,
  entreprise_description text,
  rejection_reason text,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT kyc_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT kyc_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT kyc_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id),
  CONSTRAINT kyc_role_check CHECK (role = ANY (ARRAY['client','vendeur'])),
  CONSTRAINT kyc_status_check CHECK (status = ANY (ARRAY['en_attente','verifie','rejete']))
);

-- 8. litiges (disputes on transactions)
CREATE TABLE public.litiges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  transaction_id uuid NOT NULL,
  client_id uuid NOT NULL,
  promotion_id uuid,
  motif text NOT NULL,
  statut text DEFAULT 'ouvert'::text NOT NULL,
  decision_admin text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  categorie text,
  details text,
  preuves jsonb DEFAULT '[]'::jsonb NOT NULL,
  resolu_at timestamptz,
  CONSTRAINT litiges_pkey PRIMARY KEY (id),
  CONSTRAINT litiges_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT litiges_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT litiges_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT litiges_statut_check CHECK (statut = ANY (ARRAY['ouvert','en_cours','resolu','rejete']))
);

-- 9. messages (peer-to-peer chat, optionally linked to a product)
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  expediteur_id uuid NOT NULL,
  destinataire_id uuid NOT NULL,
  promotion_id uuid,
  contenu text NOT NULL,
  lu boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_expediteur_id_fkey FOREIGN KEY (expediteur_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_destinataire_id_fkey FOREIGN KEY (destinataire_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id)
);

-- 10. notifications (in-app notification feed)
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  href text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 11. platform_ledger (commission tracking, append-only)
CREATE TABLE public.platform_ledger (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  transaction_id uuid NOT NULL,
  type text NOT NULL,
  montant numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT platform_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT platform_ledger_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT platform_ledger_type_check CHECK (type = 'commission'),
  CONSTRAINT platform_ledger_montant_check CHECK (montant > 0)
);

-- 12. platform_settings (singleton: global settings)
CREATE TABLE public.platform_settings (
  id boolean DEFAULT true NOT NULL,
  test_mode boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT platform_settings_pkey PRIMARY KEY (id),
  CONSTRAINT platform_settings_id_check CHECK (id = true)
);

-- 13. price_alerts (user price drop / restock notifications)
CREATE TABLE public.price_alerts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  target_price numeric,
  alert_restock boolean DEFAULT true NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT price_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT price_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT price_alerts_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT price_alerts_user_id_promotion_id_key UNIQUE (user_id, promotion_id)
);

-- 14. product_views (analytics: page views per product)
CREATE TABLE public.product_views (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  promotion_id uuid NOT NULL,
  viewer_id uuid,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT product_views_pkey PRIMARY KEY (id),
  CONSTRAINT product_views_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT product_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id)
);

-- 15. profiles (user identity, linked 1:1 to auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nom text DEFAULT ''::text NOT NULL,
  email text,
  role text DEFAULT 'client'::text NOT NULL,
  telephone text DEFAULT ''::text,
  adresse text DEFAULT ''::text,
  created_at timestamptz DEFAULT now() NOT NULL,
  pays text,
  ville text,
  kyc_status text DEFAULT 'non_soumis'::text NOT NULL,
  kyc_verified_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  onboarding_completed boolean DEFAULT false NOT NULL,
  boutique_description text,
  boutique_logo_url text,
  boutique_banner_url text,
  horaires text,
  politique_livraison text,
  politique_retour text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['client','vendeur','admin'])),
  CONSTRAINT profiles_kyc_status_check CHECK (kyc_status = ANY (ARRAY['non_soumis','en_attente','verifie','rejete']))
);

-- 16. promotion_media (multi-media attachments per product)
CREATE TABLE public.promotion_media (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  promotion_id uuid NOT NULL,
  vendeur_id uuid NOT NULL,
  storage_path text NOT NULL,
  media_type text NOT NULL,
  position integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT promotion_media_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_media_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promotion_media_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id),
  CONSTRAINT promotion_media_media_type_check CHECK (media_type = ANY (ARRAY['image','video']))
);

-- 17. promotions (products/articles published by sellers)
CREATE TABLE public.promotions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  vendeur_id uuid NOT NULL,
  titre text NOT NULL,
  description text,
  categorie text DEFAULT 'Autres'::text NOT NULL,
  prix_original numeric NOT NULL,
  prix_promo numeric NOT NULL,
  stock integer DEFAULT 1 NOT NULL,
  date_expiration date,
  statut text DEFAULT 'en_attente'::text NOT NULL,
  photo_url text,
  media_type text,
  pays text,
  ville text,
  created_at timestamptz DEFAULT now() NOT NULL,
  delai_livraison_jours integer,
  publication_type text DEFAULT 'promotion'::text,
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  is_active boolean DEFAULT true,
  is_promoted boolean DEFAULT false NOT NULL,
  promoted_until timestamptz,
  date_debut_promo timestamptz,
  date_fin_promo timestamptz,
  CONSTRAINT promotions_pkey PRIMARY KEY (id),
  CONSTRAINT promotions_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id),
  CONSTRAINT promotions_statut_check CHECK (statut = ANY (ARRAY['en_attente','actif','rejete','expire'])),
  CONSTRAINT promotions_media_type_check CHECK (media_type IS NULL OR media_type = ANY (ARRAY['image','video'])),
  CONSTRAINT promotions_publication_type_check CHECK (publication_type = ANY (ARRAY['article','promotion'])),
  CONSTRAINT promotions_stock_positif CHECK (stock >= 0),
  CONSTRAINT promotions_prix_positifs CHECK (prix_original > 0 AND prix_promo > 0),
  CONSTRAINT promotions_prix_promo_inferieur CHECK (prix_promo < prix_original)
);

-- 18. publication_promotions (sponsored placement slots)
CREATE TABLE public.publication_promotions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  publication_id uuid NOT NULL,
  vendeur_id uuid NOT NULL,
  statut text DEFAULT 'en_attente'::text NOT NULL,
  emplacement text DEFAULT 'marketplace'::text NOT NULL,
  date_debut timestamptz NOT NULL,
  date_fin timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT publication_promotions_pkey PRIMARY KEY (id),
  CONSTRAINT publication_promotions_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.promotions(id),
  CONSTRAINT publication_promotions_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id),
  CONSTRAINT publication_promotions_statut_check CHECK (statut = ANY (ARRAY['en_attente','active','terminee','rejetee'])),
  CONSTRAINT publication_promotions_emplacement_check CHECK (emplacement = ANY (ARRAY['accueil','marketplace','categorie','ville'])),
  CONSTRAINT publication_promotions_dates_valid CHECK (date_fin > date_debut)
);

-- 19. recent_views (recently viewed products per user)
CREATE TABLE public.recent_views (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT recent_views_pkey PRIMARY KEY (id),
  CONSTRAINT recent_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT recent_views_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT recent_views_user_id_promotion_id_key UNIQUE (user_id, promotion_id)
);

-- 20. reservations (deposit-based reservation workflow)
CREATE TABLE public.reservations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  montant_acompte numeric DEFAULT 0 NOT NULL,
  montant_restant numeric DEFAULT 0 NOT NULL,
  statut text DEFAULT 'acompte_paye'::text NOT NULL,
  methode_paiement text,
  client_confirme boolean DEFAULT false NOT NULL,
  vendeur_confirme boolean DEFAULT false NOT NULL,
  date_expiration timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  vendeur_decision text DEFAULT 'en_attente'::text,
  vendeur_decision_at timestamptz,
  paiement_complet boolean DEFAULT false,
  paiement_complet_at timestamptz,
  vendeur_expedie boolean DEFAULT false,
  vendeur_expedie_at timestamptz,
  vendeur_confirme_livraison boolean DEFAULT false,
  vendeur_confirme_livraison_at timestamptz,
  client_confirme_reception boolean DEFAULT false,
  client_confirme_reception_at timestamptz,
  client_confirme_conformite boolean DEFAULT false,
  client_confirme_conformite_at timestamptz,
  date_limite_acceptation timestamptz,
  date_limite_solde timestamptz,
  date_limite_expedition timestamptz,
  date_limite_livraison timestamptz,
  date_limite_inspection timestamptz,
  livraison_prolongee boolean DEFAULT false,
  livraison_prolongation_at timestamptz,
  expedition_prolongee boolean DEFAULT false,
  expedition_prolongation_at timestamptz,
  livraison_confirmee_at timestamptz,
  CONSTRAINT reservations_pkey PRIMARY KEY (id),
  CONSTRAINT reservations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT reservations_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT reservations_statut_check CHECK (statut = ANY (ARRAY['acompte_paye','reservation_acceptee','solde_paye','expediee','livree','inspection','terminee','annulee','expiree','litige']))
);

-- 21. transactions (payment transactions for direct purchases and reservations)
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  type text NOT NULL,
  client_id uuid NOT NULL,
  vendeur_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  reservation_id uuid,
  montant_total numeric DEFAULT 0 NOT NULL,
  montant_paye numeric DEFAULT 0 NOT NULL,
  commission_plateforme numeric DEFAULT 0 NOT NULL,
  methode_paiement text,
  statut text DEFAULT 'bloque'::text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  vendeur_expedie boolean DEFAULT false NOT NULL,
  vendeur_expedie_at timestamptz,
  client_confirme_reception boolean DEFAULT false NOT NULL,
  client_confirme_reception_at timestamptz,
  date_limite_expedition timestamptz,
  date_limite_inspection timestamptz,
  extension_expedition_at timestamptz,
  extension_expedition_accordee boolean DEFAULT false NOT NULL,
  client_confirme_conformite boolean DEFAULT false NOT NULL,
  client_confirme_conformite_at timestamptz,
  quantity integer DEFAULT 1 NOT NULL,
  delivery_address jsonb,
  order_number text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT transactions_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id),
  CONSTRAINT transactions_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT transactions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id),
  CONSTRAINT transactions_type_check CHECK (type = ANY (ARRAY['achat_direct','reservation'])),
  CONSTRAINT transactions_statut_check CHECK (statut = ANY (ARRAY['bloque','libere','rembourse','litige','expiree'])),
  CONSTRAINT transactions_quantity_check CHECK (quantity > 0)
);

-- 22. wallet_transactions (wallet movement ledger)
CREATE TABLE public.wallet_transactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  wallet_id uuid NOT NULL,
  type text NOT NULL,
  montant numeric NOT NULL,
  solde_avant numeric DEFAULT 0 NOT NULL,
  solde_apres numeric DEFAULT 0 NOT NULL,
  reference text,
  description text,
  statut text DEFAULT 'complete'::text NOT NULL,
  promotion_id uuid,
  reservation_id uuid,
  transaction_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id),
  CONSTRAINT wallet_transactions_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT wallet_transactions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id),
  CONSTRAINT wallet_transactions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT wallet_transactions_type_check CHECK (type = ANY (ARRAY['depot','retrait','achat','reservation','remboursement','liberation_fonds','commission','ajustement'])),
  CONSTRAINT wallet_transactions_statut_check CHECK (statut = ANY (ARRAY['en_attente','complete','echoue','annule'])),
  CONSTRAINT wallet_transactions_montant_check CHECK (montant > 0)
);

-- 23. wallets (user wallet with available and blocked balances)
CREATE TABLE public.wallets (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  solde_disponible numeric DEFAULT 0 NOT NULL,
  solde_bloque numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  solde numeric DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_key UNIQUE (user_id),
  CONSTRAINT wallets_solde_disponible_check CHECK (solde_disponible >= 0),
  CONSTRAINT wallets_solde_bloque_check CHECK (solde_bloque >= 0),
  CONSTRAINT wallets_solde_check CHECK (solde >= 0)
);
