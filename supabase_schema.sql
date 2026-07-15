-- ==========================================
-- SQL SETUP FOR SUPABASE DATABASE TABLES
-- ==========================================
-- Jalankan query ini di SQL Editor dashboard Supabase Anda.

-- 1. Create table for dresses
CREATE TABLE IF NOT EXISTS public.dresses (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    deposit INTEGER NOT NULL DEFAULT 0,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    colors TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    material TEXT,
    rental_duration_days INTEGER DEFAULT 3,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available'
);

-- Keep existing installations aligned with the current application model.
ALTER TABLE public.dresses DROP COLUMN IF EXISTS available_dates;

-- Enable RLS for dresses
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;

-- DROP policies if they exist (to avoid error when running multiple times)
DROP POLICY IF EXISTS "Allow public read access to dresses" ON public.dresses;
DROP POLICY IF EXISTS "Allow authenticated full access to dresses" ON public.dresses;

CREATE POLICY "Allow public read access to dresses" ON public.dresses
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to dresses" ON public.dresses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 2. Create table for makeup_packages
CREATE TABLE IF NOT EXISTS public.makeup_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.makeup_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to makeup_packages" ON public.makeup_packages;
DROP POLICY IF EXISTS "Allow authenticated full access to makeup_packages" ON public.makeup_packages;

CREATE POLICY "Allow public read access to makeup_packages" ON public.makeup_packages
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to makeup_packages" ON public.makeup_packages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. Create table for decor_packages
CREATE TABLE IF NOT EXISTS public.decor_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    venue_size TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.decor_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to decor_packages" ON public.decor_packages;
DROP POLICY IF EXISTS "Allow authenticated full access to decor_packages" ON public.decor_packages;

CREATE POLICY "Allow public read access to decor_packages" ON public.decor_packages
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to decor_packages" ON public.decor_packages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4. Create table for wedding_packages
CREATE TABLE IF NOT EXISTS public.wedding_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    dresses_included INTEGER NOT NULL DEFAULT 0,
    makeup_included TEXT[] NOT NULL DEFAULT '{}',
    decor_included TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    deposit_required INTEGER NOT NULL DEFAULT 0,
    is_popular BOOLEAN DEFAULT false
);

ALTER TABLE public.wedding_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to wedding_packages" ON public.wedding_packages;
DROP POLICY IF EXISTS "Allow authenticated full access to wedding_packages" ON public.wedding_packages;

CREATE POLICY "Allow public read access to wedding_packages" ON public.wedding_packages
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to wedding_packages" ON public.wedding_packages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 5. Create table for gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow authenticated full access to gallery" ON public.gallery;

CREATE POLICY "Allow public read access to gallery" ON public.gallery
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to gallery" ON public.gallery
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 6. Create table for testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    comment TEXT NOT NULL,
    avatar TEXT
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated full access to testimonials" ON public.testimonials;

CREATE POLICY "Allow public read access to testimonials" ON public.testimonials
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to testimonials" ON public.testimonials
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 7. Create table for bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_location TEXT NOT NULL,
    event_type TEXT NOT NULL,
    services_selected JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    subtotal TEXT NOT NULL,
    additional_fees TEXT NOT NULL,
    deposit_required TEXT NOT NULL,
    total_amount TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    booking_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public select to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow authenticated full access to bookings" ON public.bookings;

CREATE POLICY "Allow public insert to bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select to bookings" ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY "Allow public update to bookings" ON public.bookings
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to bookings" ON public.bookings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 8. Create table for system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    shop_name TEXT NOT NULL,
    whatsapp_admin TEXT NOT NULL,
    email_admin TEXT NOT NULL,
    min_dp_percent INTEGER NOT NULL DEFAULT 30,
    transport_base INTEGER NOT NULL DEFAULT 0,
    address TEXT NOT NULL,
    hero_image TEXT
);

-- Keep existing installations aligned when the table predates hero images.
ALTER TABLE public.system_settings
    ADD COLUMN IF NOT EXISTS hero_image TEXT;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated full access to system_settings" ON public.system_settings;

CREATE POLICY "Allow public read access to system_settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to system_settings" ON public.system_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- Insert default system settings row if not exists
INSERT INTO public.system_settings (id, shop_name, whatsapp_admin, email_admin, min_dp_percent, transport_base, address, hero_image)
VALUES (
    1, 
    'Elika Wedding Organizer & Atelier', 
    '6281234567890', 
    'info@elikawedding.com', 
    30, 
    150000, 
    'Jl. Kemang Raya No. 12, Mampang Prapatan, Jakarta Selatan, 12730', 
    ''
) ON CONFLICT (id) DO NOTHING;
