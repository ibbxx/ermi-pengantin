-- Run after supabase_customer_journey_v2.sql on a staging database.
-- These checks are read-only except for their surrounding rollback.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles))
  ) THEN RAISE EXCEPTION 'Anon/public booking policy still exists'; END IF;

  IF (SELECT public FROM storage.buckets WHERE id = 'payment-proofs-private') IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Payment proof bucket is not private';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'confirm_booking_with_units') THEN
    RAISE EXCEPTION 'Atomic confirmation function is missing';
  END IF;
END $$;

ROLLBACK;

-- Concurrency acceptance (two SQL sessions):
-- 1. Begin both transactions with two submitted bookings and the same ready unit.
-- 2. Call confirm_booking_with_units for overlapping dates in both sessions.
-- 3. Commit session A. Session B must resume and fail with "Unit ... bentrok".
