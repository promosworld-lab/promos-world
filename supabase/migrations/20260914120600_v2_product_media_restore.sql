-- V2 Product Media Architecture
-- Re-introducing a dedicated media table for extensibility (video vs image, positioning, metadata)

CREATE TYPE media_type AS ENUM ('image', 'video');

CREATE TABLE IF NOT EXISTS public.product_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    storage_path text NOT NULL,
    url text NOT NULL,
    media_type media_type NOT NULL DEFAULT 'image',
    position integer NOT NULL DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media(product_id);

-- RLS
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media visible to everyone"
ON public.product_media FOR SELECT
USING (true);

CREATE POLICY "Sellers can manage their own product media"
ON public.product_media FOR ALL
USING (auth.uid() = (SELECT owner_id FROM public.shops WHERE id = shop_id))
WITH CHECK (auth.uid() = (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- Trigger to auto-update the products.thumbnail_url for fast reads
CREATE OR REPLACE FUNCTION sync_product_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.position = 0 THEN
            UPDATE public.products SET thumbnail_url = NEW.url WHERE id = NEW.product_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- If thumbnail is deleted, set to null or next available
        IF OLD.position = 0 THEN
            UPDATE public.products SET thumbnail_url = (
                SELECT url FROM public.product_media WHERE product_id = OLD.product_id ORDER BY position ASC LIMIT 1
            ) WHERE id = OLD.product_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_media_change
AFTER INSERT OR UPDATE OR DELETE ON public.product_media
FOR EACH ROW EXECUTE FUNCTION sync_product_thumbnail();
