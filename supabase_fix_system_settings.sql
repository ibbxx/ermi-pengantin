-- Fix existing Supabase projects created before hero_image was introduced.
-- Run this once in the Supabase SQL Editor.

ALTER TABLE public.system_settings
    ADD COLUMN IF NOT EXISTS hero_image TEXT;

NOTIFY pgrst, 'reload schema';
