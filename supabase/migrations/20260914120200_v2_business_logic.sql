-- V2 Business Logic: Reservations & Conformity & Escrow Management

CREATE TYPE reservation_status AS ENUM ('active', 'completed', 'expired', 'cancelled');

CREATE TABLE public.reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id uuid NOT NULL REFERENCES public.sub_orders(id) ON DELETE CASCADE,
    deposit_amount bigint NOT NULL CHECK (deposit_amount >= 0),
    remaining_amount bigint NOT NULL CHECK (remaining_amount >= 0),
    expiration_date timestamptz NOT NULL,
    status reservation_status NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_sub_order ON public.reservations(sub_order_id);
CREATE INDEX idx_reservations_status_expiration ON public.reservations(status, expiration_date);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_buyer_read" ON public.reservations FOR SELECT USING (
  sub_order_id IN (SELECT id FROM public.sub_orders WHERE order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()))
);
CREATE POLICY "reservations_seller_read" ON public.reservations FOR SELECT USING (
  sub_order_id IN (SELECT id FROM public.sub_orders WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
);


-- 1. Conformity Auto-Release (24h)
-- This function finds sub_orders in 'awaiting_conformity' for > 24h and releases funds to the seller.
CREATE OR REPLACE FUNCTION public.process_auto_conformity()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub_order RECORD;
    v_count integer := 0;
    v_commission_rate numeric;
    v_commission_amount bigint;
    v_seller_amount bigint;
    v_tx_id uuid;
    v_escrow_account uuid;
    v_seller_account uuid;
    v_platform_account uuid;
BEGIN
    -- Get current commission rate
    SELECT commission_rate INTO v_commission_rate FROM public.platform_config WHERE id = true;
    
    -- Get the global escrow and platform accounts
    SELECT id INTO v_escrow_account FROM public.ledger_accounts WHERE type = 'escrow' AND owner_id IS NULL;
    IF NOT FOUND THEN
        INSERT INTO public.ledger_accounts (type) VALUES ('escrow') RETURNING id INTO v_escrow_account;
    END IF;

    SELECT id INTO v_platform_account FROM public.ledger_accounts WHERE type = 'platform_revenue' AND owner_id IS NULL;
    IF NOT FOUND THEN
        INSERT INTO public.ledger_accounts (type) VALUES ('platform_revenue') RETURNING id INTO v_platform_account;
    END IF;

    FOR v_sub_order IN 
        SELECT so.id, so.total_amount, so.shipping_fee, s.owner_id as seller_id
        FROM public.sub_orders so
        JOIN public.shops s ON s.id = so.shop_id
        WHERE so.status = 'awaiting_conformity' 
        AND so.updated_at < (NOW() - INTERVAL '24 hours')
    LOOP
        -- Update status
        UPDATE public.sub_orders SET status = 'completed', updated_at = NOW() WHERE id = v_sub_order.id;

        -- Calculate amounts
        v_commission_amount := (v_sub_order.total_amount * v_commission_rate)::bigint;
        v_seller_amount := (v_sub_order.total_amount + v_sub_order.shipping_fee) - v_commission_amount;

        -- Ensure seller has a user_wallet
        SELECT id INTO v_seller_account FROM public.ledger_accounts WHERE type = 'user_wallet' AND owner_id = v_sub_order.seller_id;
        IF NOT FOUND THEN
            INSERT INTO public.ledger_accounts (owner_id, type) VALUES (v_sub_order.seller_id, 'user_wallet') RETURNING id INTO v_seller_account;
        END IF;

        -- Create ledger transaction
        INSERT INTO public.ledger_transactions (reference, description) 
        VALUES ('RELEASE_' || v_sub_order.id, 'Release of funds after conformity window for SubOrder ' || v_sub_order.id)
        RETURNING id INTO v_tx_id;

        -- Debit Escrow
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_escrow_account, -(v_sub_order.total_amount + v_sub_order.shipping_fee));

        -- Credit Seller
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_seller_account, v_seller_amount);

        -- Credit Platform
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_platform_account, v_commission_amount);

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- 2. Reservation Expiration Default (3 months)
-- 55% Buyer, 35% Seller, 10% Platform of the deposit amount.
CREATE OR REPLACE FUNCTION public.process_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_res RECORD;
    v_count integer := 0;
    v_buyer_share bigint;
    v_seller_share bigint;
    v_platform_share bigint;
    v_tx_id uuid;
    v_escrow_account uuid;
    v_buyer_account uuid;
    v_seller_account uuid;
    v_platform_account uuid;
BEGIN
    SELECT id INTO v_escrow_account FROM public.ledger_accounts WHERE type = 'escrow' AND owner_id IS NULL;
    SELECT id INTO v_platform_account FROM public.ledger_accounts WHERE type = 'platform_revenue' AND owner_id IS NULL;
    
    FOR v_res IN 
        SELECT r.id, r.sub_order_id, r.deposit_amount, o.buyer_id, s.owner_id as seller_id
        FROM public.reservations r
        JOIN public.sub_orders so ON so.id = r.sub_order_id
        JOIN public.orders o ON o.id = so.order_id
        JOIN public.shops s ON s.id = so.shop_id
        WHERE r.status = 'active'
        AND r.expiration_date < NOW()
    LOOP
        -- Mark as expired
        UPDATE public.reservations SET status = 'expired', updated_at = NOW() WHERE id = v_res.id;
        UPDATE public.sub_orders SET status = 'cancelled', updated_at = NOW() WHERE id = v_res.sub_order_id;

        -- Split calculation
        v_buyer_share := (v_res.deposit_amount * 0.55)::bigint;
        v_seller_share := (v_res.deposit_amount * 0.35)::bigint;
        v_platform_share := v_res.deposit_amount - v_buyer_share - v_seller_share;

        -- Ensure wallets exist
        SELECT id INTO v_buyer_account FROM public.ledger_accounts WHERE type = 'user_wallet' AND owner_id = v_res.buyer_id;
        IF NOT FOUND THEN
            INSERT INTO public.ledger_accounts (owner_id, type) VALUES (v_res.buyer_id, 'user_wallet') RETURNING id INTO v_buyer_account;
        END IF;

        SELECT id INTO v_seller_account FROM public.ledger_accounts WHERE type = 'user_wallet' AND owner_id = v_res.seller_id;
        IF NOT FOUND THEN
            INSERT INTO public.ledger_accounts (owner_id, type) VALUES (v_res.seller_id, 'user_wallet') RETURNING id INTO v_seller_account;
        END IF;

        -- Create ledger transaction
        INSERT INTO public.ledger_transactions (reference, description) 
        VALUES ('RES_EXP_' || v_res.id, 'Default split for expired reservation ' || v_res.id)
        RETURNING id INTO v_tx_id;

        -- Debit Escrow
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_escrow_account, -v_res.deposit_amount);

        -- Credit Buyer (55%)
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_buyer_account, v_buyer_share);

        -- Credit Seller (35%)
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_seller_account, v_seller_share);

        -- Credit Platform (10%)
        INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
        VALUES (v_tx_id, v_platform_account, v_platform_share);

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;
