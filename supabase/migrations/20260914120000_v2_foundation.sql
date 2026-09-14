-- V2 Foundation Schema for Promo's World
-- Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE kyc_level AS ENUM ('none', 'level_1_individual', 'level_2_professional', 'level_3_verified');
CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected', 'expired');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'rejected', 'expired');
CREATE TYPE product_type AS ENUM ('standard', 'promotion', 'flash_sale', 'negotiable', 'reservable');
CREATE TYPE order_status AS ENUM ('pending', 'payment_pending', 'paid_escrow', 'preparing', 'shipped', 'in_transit', 'delivered', 'awaiting_conformity', 'completed', 'disputed', 'cancelled', 'refunded');
CREATE TYPE payment_intent_status AS ENUM ('created', 'processing', 'succeeded', 'failed', 'cancelled');
CREATE TYPE ledger_account_type AS ENUM ('user_wallet', 'escrow', 'platform_revenue', 'gateway');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_buyer', 'resolved_seller');
CREATE TYPE chat_offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled');

-- Tables
CREATE TABLE public.platform_config (
    id boolean PRIMARY KEY DEFAULT true,
    commission_rate numeric NOT NULL DEFAULT 0.02,
    reservation_deposit_rate numeric NOT NULL DEFAULT 0.20,
    reservation_duration_months integer NOT NULL DEFAULT 3,
    conformity_window_hours integer NOT NULL DEFAULT 24,
    seller_shipping_deadline_hours integer NOT NULL DEFAULT 48,
    minimum_payout bigint NOT NULL DEFAULT 5000,
    sponsorship_price_weekly bigint NOT NULL DEFAULT 5000,
    test_mode boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT platform_config_id_check CHECK (id)
);

INSERT INTO public.platform_config (id) VALUES (true) ON CONFLICT DO NOTHING;

-- Map profiles (we keep the table but we'll add english columns, eventually dropping french ones)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role user_role DEFAULT 'buyer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_level kyc_level DEFAULT 'none';

CREATE TABLE public.shops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    logo_url text,
    banner_url text,
    business_registration_number text,
    tax_id text,
    is_verified boolean DEFAULT false,
    is_professional boolean DEFAULT false,
    country text NOT NULL DEFAULT 'Benin',
    city text NOT NULL,
    address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_shop_owner UNIQUE (owner_id)
);

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id uuid, -- will link to categories
    title text NOT NULL,
    description text,
    price bigint NOT NULL CHECK (price >= 0),
    promo_price bigint CHECK (promo_price >= 0),
    stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status product_status NOT NULL DEFAULT 'draft',
    type product_type NOT NULL DEFAULT 'standard',
    is_negotiable boolean DEFAULT false,
    is_reservable boolean DEFAULT false,
    shipping_zones jsonb, -- e.g. [{"city": "Cotonou", "fee": 1500, "hours": 24}]
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid NOT NULL REFERENCES public.profiles(id),
    total_amount bigint NOT NULL CHECK (total_amount >= 0),
    status order_status NOT NULL DEFAULT 'pending',
    shipping_address jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sub_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    shop_id uuid NOT NULL REFERENCES public.shops(id),
    total_amount bigint NOT NULL CHECK (total_amount >= 0),
    shipping_fee bigint NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    platform_fee bigint NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    status order_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id uuid NOT NULL REFERENCES public.sub_orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price bigint NOT NULL CHECK (unit_price >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ledger_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES public.profiles(id),
    type ledger_account_type NOT NULL,
    currency text NOT NULL DEFAULT 'XOF',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_wallet UNIQUE (owner_id, type)
);

CREATE TABLE public.ledger_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ledger_postings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES public.ledger_accounts(id),
    amount bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_intents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id),
    amount bigint NOT NULL,
    provider text NOT NULL,
    provider_reference text UNIQUE,
    idempotency_key text UNIQUE NOT NULL,
    status payment_intent_status NOT NULL DEFAULT 'created',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sponsorship_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id uuid NOT NULL REFERENCES public.shops(id),
    product_id uuid NOT NULL REFERENCES public.products(id),
    target_city text NOT NULL,
    amount_paid bigint NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    user_id uuid REFERENCES public.profiles(id),
    session_id text,
    product_id uuid REFERENCES public.products(id),
    shop_id uuid REFERENCES public.shops(id),
    campaign_id uuid REFERENCES public.sponsorship_campaigns(id),
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Core indexes
CREATE INDEX idx_products_shop ON public.products(shop_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_sub_orders_order ON public.sub_orders(order_id);
CREATE INDEX idx_sub_orders_shop ON public.sub_orders(shop_id);
CREATE INDEX idx_ledger_postings_account ON public.ledger_postings(account_id);
CREATE INDEX idx_ledger_postings_transaction ON public.ledger_postings(transaction_id);
CREATE INDEX idx_analytics_events_type_product ON public.analytics_events(event_type, product_id);
CREATE INDEX idx_analytics_events_shop ON public.analytics_events(shop_id);
