-- ==========================================
-- SQL SETUP FOR SUPABASE STORAGE (elika-assets)
-- ==========================================
-- Jalankan query ini di SQL Editor dashboard Supabase Anda.

-- 1. Buat bucket 'elika-assets' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('elika-assets', 'elika-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus policy lama jika sudah pernah dibuat (untuk menghindari error duplikasi)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Full Access (Development)" ON storage.objects;

-- ==========================================
-- PILIHAN A: SECURE POLICY (DIREKOMENDASIKAN UNTUK PRODUKSI)
-- ==========================================
-- Hanya admin/user logged-in yang bisa mengunggah/mengedit/menghapus, tetapi siapa saja bisa membaca gambar.

-- Policy untuk membaca gambar (SELECT) - Publik
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'elika-assets');

-- Policy untuk mengunggah gambar (INSERT) - Hanya Authenticated
CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'elika-assets');

-- Policy untuk memperbarui gambar (UPDATE) - Hanya Authenticated
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'elika-assets');

-- Policy untuk menghapus gambar (DELETE) - Hanya Authenticated
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'elika-assets');


/*
-- ==========================================
-- PILIHAN B: DEV ONLY (TIDAK DIREKOMENDASIKAN UNTUK PRODUKSI)
-- ==========================================
-- Jika Anda belum mengkonfigurasi login admin atau ingin testing lokal tanpa autentikasi,
-- aktifkan policy di bawah ini (hapus tanda komentar /* dan */).

CREATE POLICY "Public Full Access (Development)"
ON storage.objects FOR ALL
USING (bucket_id = 'elika-assets')
WITH CHECK (bucket_id = 'elika-assets');
*/
