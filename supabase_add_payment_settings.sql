-- Menambahkan konfigurasi metode pembayaran Transfer Bank (TF) dan QRIS ke system_settings
ALTER TABLE public.system_settings
    ADD COLUMN IF NOT EXISTS tf_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS tf_bank_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS tf_account_number TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS tf_account_holder TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS qris_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS qris_image TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.system_settings.tf_enabled IS 'Menentukan apakah metode Transfer Bank aktif secara publik';
COMMENT ON COLUMN public.system_settings.qris_enabled IS 'Menentukan apakah metode QRIS aktif secara publik';
