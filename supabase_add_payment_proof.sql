-- Menambahkan kolom payment_proof ke tabel bookings untuk menyimpan URL bukti transfer
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS payment_proof TEXT;

COMMENT ON COLUMN public.bookings.payment_proof IS 'URL file bukti pembayaran (bukti transfer / screenshot QRIS)';
