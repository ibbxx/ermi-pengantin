-- Run after supabase_customer_journey_v2.sql and
-- supabase_simplify_booking_confirmation.sql on a staging database.
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
    RAISE EXCEPTION 'Legacy atomic confirmation function is missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'confirm_booking') THEN
    RAISE EXCEPTION 'Automatic booking confirmation function is missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'assign_package_dress_units') THEN
    RAISE EXCEPTION 'Package fitting assignment function is missing';
  END IF;
END $$;

ROLLBACK;

-- Concurrency acceptance (two SQL sessions):
-- 1. Begin both transactions with two submitted direct-dress bookings requesting
--    the same model, size, and color and only one matching ready unit.
-- 2. Call confirm_booking for overlapping dates in both sessions.
-- 3. Commit session A. Session B must resume and fail with
--    "BUSANA_TIDAK_TERSEDIA" without changing its booking/payment status.
-- 4. Confirm a wedding-package booking without units, move it to fitting, then
--    call assign_package_dress_units. Overlapping units must be rejected.
