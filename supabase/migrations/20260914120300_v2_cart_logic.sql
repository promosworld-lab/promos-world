-- V2 Cart & Order Logic
-- A cart is simply an Order with status = 'pending'.

CREATE OR REPLACE FUNCTION public.add_to_v2_cart(
    p_product_id uuid,
    p_quantity integer
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_buyer_id uuid;
    v_order_id uuid;
    v_sub_order_id uuid;
    v_shop_id uuid;
    v_product_price bigint;
    v_stock integer;
    v_item_id uuid;
BEGIN
    v_buyer_id := auth.uid();
    IF v_buyer_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate product and stock
    SELECT shop_id, COALESCE(promo_price, price), stock 
    INTO v_shop_id, v_product_price, v_stock
    FROM public.products 
    WHERE id = p_product_id AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or inactive';
    END IF;

    IF v_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;

    -- Find or create pending order (Cart)
    SELECT id INTO v_order_id FROM public.orders WHERE buyer_id = v_buyer_id AND status = 'pending' LIMIT 1;
    
    IF v_order_id IS NULL THEN
        INSERT INTO public.orders (buyer_id, total_amount, shipping_address) 
        VALUES (v_buyer_id, 0, '{}'::jsonb) 
        RETURNING id INTO v_order_id;
    END IF;

    -- Find or create sub_order for this shop
    SELECT id INTO v_sub_order_id FROM public.sub_orders WHERE order_id = v_order_id AND shop_id = v_shop_id LIMIT 1;

    IF v_sub_order_id IS NULL THEN
        INSERT INTO public.sub_orders (order_id, shop_id, total_amount) 
        VALUES (v_order_id, v_shop_id, 0)
        RETURNING id INTO v_sub_order_id;
    END IF;

    -- Upsert item
    SELECT id INTO v_item_id FROM public.order_items WHERE sub_order_id = v_sub_order_id AND product_id = p_product_id;

    IF v_item_id IS NOT NULL THEN
        -- Add to existing quantity
        UPDATE public.order_items SET quantity = quantity + p_quantity WHERE id = v_item_id;
    ELSE
        -- Insert new item
        INSERT INTO public.order_items (sub_order_id, product_id, quantity, unit_price)
        VALUES (v_sub_order_id, p_product_id, p_quantity, v_product_price);
    END IF;

    -- Recalculate SubOrder and Order totals
    UPDATE public.sub_orders so
    SET total_amount = (
        SELECT SUM(quantity * unit_price) FROM public.order_items WHERE sub_order_id = so.id
    )
    WHERE id = v_sub_order_id;

    UPDATE public.orders o
    SET total_amount = (
        SELECT SUM(total_amount + shipping_fee) FROM public.sub_orders WHERE order_id = o.id
    )
    WHERE id = v_order_id;

    RETURN json_build_object('success', true, 'order_id', v_order_id);
END;
$$;


CREATE OR REPLACE FUNCTION public.get_v2_cart()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_buyer_id uuid;
    v_cart json;
BEGIN
    v_buyer_id := auth.uid();
    
    SELECT json_build_object(
        'order_id', o.id,
        'total_amount', o.total_amount,
        'sub_orders', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'sub_order_id', so.id,
                    'shop_id', so.shop_id,
                    'shop_name', s.name,
                    'sub_total', so.total_amount,
                    'items', (
                        SELECT json_agg(
                            json_build_object(
                                'item_id', oi.id,
                                'product_id', p.id,
                                'title', p.title,
                                'quantity', oi.quantity,
                                'unit_price', oi.unit_price,
                                'stock', p.stock
                            )
                        )
                        FROM public.order_items oi
                        JOIN public.products p ON p.id = oi.product_id
                        WHERE oi.sub_order_id = so.id
                    )
                )
            )
            FROM public.sub_orders so
            JOIN public.shops s ON s.id = so.shop_id
            WHERE so.order_id = o.id
        ), '[]'::json)
    ) INTO v_cart
    FROM public.orders o
    WHERE o.buyer_id = v_buyer_id AND o.status = 'pending'
    LIMIT 1;

    RETURN COALESCE(v_cart, '{"order_id": null, "total_amount": 0, "sub_orders": []}'::json);
END;
$$;
