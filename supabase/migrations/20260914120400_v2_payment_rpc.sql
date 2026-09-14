-- V2 Payment Simulation RPC
-- In production, this logic will be called by Edge Functions triggered by FedaPay/Kkiapay webhooks.
-- For now, this RPC handles the backend transition from payment_pending to paid_escrow.

CREATE OR REPLACE FUNCTION public.simulate_v2_payment(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_sub_order RECORD;
    v_buyer_account uuid;
    v_escrow_account uuid;
    v_tx_id uuid;
BEGIN
    -- Verify Order
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id AND status = 'payment_pending';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not in payment_pending status';
    END IF;

    -- Update Order Status
    UPDATE public.orders SET status = 'paid_escrow', updated_at = NOW() WHERE id = p_order_id;
    
    -- Update SubOrders Status
    UPDATE public.sub_orders SET status = 'paid_escrow', updated_at = NOW() WHERE order_id = p_order_id;

    -- Ensure Buyer Wallet exists (for the simulation/record)
    SELECT id INTO v_buyer_account FROM public.ledger_accounts WHERE type = 'user_wallet' AND owner_id = v_order.buyer_id;
    IF NOT FOUND THEN
        INSERT INTO public.ledger_accounts (owner_id, type) VALUES (v_order.buyer_id, 'user_wallet') RETURNING id INTO v_buyer_account;
    END IF;

    -- Ensure Escrow exists
    SELECT id INTO v_escrow_account FROM public.ledger_accounts WHERE type = 'escrow' AND owner_id IS NULL;
    IF NOT FOUND THEN
        INSERT INTO public.ledger_accounts (type) VALUES ('escrow') RETURNING id INTO v_escrow_account;
    END IF;

    -- Create Ledger Transaction
    INSERT INTO public.ledger_transactions (reference, description) 
    VALUES ('PAY_ORD_' || p_order_id, 'Payment simulation for Order ' || p_order_id)
    RETURNING id INTO v_tx_id;

    -- Create Postings (Buyer -> Escrow)
    INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
    VALUES (v_tx_id, v_buyer_account, -v_order.total_amount);

    INSERT INTO public.ledger_postings (transaction_id, account_id, amount) 
    VALUES (v_tx_id, v_escrow_account, v_order.total_amount);

    RETURN true;
END;
$$;
