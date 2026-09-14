-- V2 Security and RLS
-- Revoke anon access from V1 vulnerable RPCs
REVOKE EXECUTE ON FUNCTION public.add_to_cart(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.checkout_cart(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_direct_purchase_from_wallet(uuid, integer, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.stop_publication(uuid) FROM anon;

-- Enable RLS on new tables
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Platform Config Policies (Public read, Admin update)
CREATE POLICY "platform_config_read" ON public.platform_config FOR SELECT USING (true);
CREATE POLICY "platform_config_admin_all" ON public.platform_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Shops Policies (Public read, Owner/Admin manage)
CREATE POLICY "shops_public_read" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_owner_insert" ON public.shops FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "shops_owner_update" ON public.shops FOR UPDATE USING (owner_id = auth.uid());

-- Products Policies (Public read active, Owner/Admin manage)
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "products_owner_all" ON public.products FOR ALL USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- Orders Policies (Buyer read, Admin read)
CREATE POLICY "orders_buyer_read" ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SubOrders Policies (Buyer read, Seller read, Admin read)
CREATE POLICY "sub_orders_buyer_read" ON public.sub_orders FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
);
CREATE POLICY "sub_orders_seller_read" ON public.sub_orders FOR SELECT USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- Order Items Policies
CREATE POLICY "order_items_buyer_read" ON public.order_items FOR SELECT USING (
  sub_order_id IN (SELECT id FROM public.sub_orders WHERE order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()))
);
CREATE POLICY "order_items_seller_read" ON public.order_items FOR SELECT USING (
  sub_order_id IN (SELECT id FROM public.sub_orders WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
);

-- Ledger Accounts Policies (Owner read)
CREATE POLICY "ledger_accounts_owner_read" ON public.ledger_accounts FOR SELECT USING (owner_id = auth.uid());

-- Ledger Transactions & Postings (Owner read via account)
CREATE POLICY "ledger_postings_owner_read" ON public.ledger_postings FOR SELECT USING (
  account_id IN (SELECT id FROM public.ledger_accounts WHERE owner_id = auth.uid())
);

-- Payment Intents (Buyer read)
CREATE POLICY "payment_intents_buyer_read" ON public.payment_intents FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
);

-- Analytics (Owner read)
CREATE POLICY "analytics_seller_read" ON public.analytics_events FOR SELECT USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
