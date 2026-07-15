-- Add dedicated homepage service thumbnails to existing Supabase projects.
-- Run this once in the Supabase SQL Editor before deploying the app changes.

ALTER TABLE public.system_settings
    ADD COLUMN IF NOT EXISTS service_dress_image TEXT,
    ADD COLUMN IF NOT EXISTS service_makeup_image TEXT,
    ADD COLUMN IF NOT EXISTS service_decor_image TEXT;

NOTIFY pgrst, 'reload schema';
