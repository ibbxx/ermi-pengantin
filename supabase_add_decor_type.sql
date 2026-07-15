-- Memisahkan paket dekorasi yang dapat dibooking dari item dekorasi katalog.
-- Data lama tetap kompatibel dan otomatis dianggap sebagai paket dekorasi.
ALTER TABLE public.decor_packages
    ADD COLUMN IF NOT EXISTS decor_type TEXT;

UPDATE public.decor_packages
SET decor_type = 'package'
WHERE decor_type IS NULL OR decor_type NOT IN ('package', 'item');

ALTER TABLE public.decor_packages
    ALTER COLUMN decor_type SET DEFAULT 'package',
    ALTER COLUMN decor_type SET NOT NULL;

ALTER TABLE public.decor_packages
    DROP CONSTRAINT IF EXISTS decor_packages_decor_type_check;

ALTER TABLE public.decor_packages
    ADD CONSTRAINT decor_packages_decor_type_check
    CHECK (decor_type IN ('package', 'item'));

COMMENT ON COLUMN public.decor_packages.decor_type IS
    'package dapat masuk booking; item hanya dipesan melalui WhatsApp';
