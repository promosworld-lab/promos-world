-- ============================================================
-- PROMO'S WORLD — STORAGE BUCKETS & POLICIES BASELINE
-- Captured: 2026-09-13 from project rzrddmsviveuschrbphu
-- Total: 3 buckets, 7 storage policies
-- ============================================================
-- THIS FILE REPRESENTS THE CURRENT LIVE STATE.
-- DO NOT APPLY THIS FILE — it is a reference snapshot.
-- ============================================================

-- ========================
-- BUCKETS
-- ========================

-- 1. promos (PUBLIC)
-- Legacy bucket, created 2026-08-12
-- Contains 2 test JPEG files from a single user
-- No file_size_limit, no MIME filtering
-- WARNING: No read policy exists (only INSERT policy)
INSERT INTO storage.buckets (id, name, public)
VALUES ('promos', 'promos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. publication-media (PUBLIC)
-- Active media bucket for product images/videos
-- Created 2026-09-04, no file_size_limit, no MIME filtering
-- Full CRUD policies with folder-based ownership (folder = user_id)
INSERT INTO storage.buckets (id, name, public)
VALUES ('publication-media', 'publication-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. kyc-documents (PRIVATE)
-- KYC identity documents, private access only
-- Created 2026-09-04, no file_size_limit, no MIME filtering
-- Owner-folder read/write + admin read
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ========================
-- STORAGE POLICIES (on storage.objects)
-- ========================

-- promos bucket: INSERT only for authenticated users
CREATE POLICY "Allow authenticated users to upload promos 1itrex0_0"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'promos');

-- publication-media: public read
CREATE POLICY "publication_media_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'publication-media');

-- publication-media: owner insert
CREATE POLICY "publication_media_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'publication-media'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- publication-media: owner update
CREATE POLICY "publication_media_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'publication-media'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'publication-media'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- publication-media: owner delete
CREATE POLICY "publication_media_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'publication-media'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- kyc-documents: owner insert (folder = uid)
CREATE POLICY "kyc_insert_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = (SELECT (auth.uid())::text AS uid)
  );

-- kyc-documents: owner or admin read
CREATE POLICY "kyc_select_own_folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (
      (storage.foldername(name))[1] = (SELECT (auth.uid())::text AS uid)
      OR is_admin()
    )
  );
