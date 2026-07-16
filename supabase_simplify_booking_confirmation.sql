-- Simplify the admin confirmation flow while keeping dress allocation atomic.
-- Run after supabase_customer_journey_v2.sql.
BEGIN;

CREATE OR REPLACE FUNCTION public.confirm_booking(
  p_booking_id TEXT,
  p_admin_id UUID,
  p_rental_start DATE,
  p_rental_end DATE,
  p_additional_fees BIGINT,
  p_total_amount BIGINT,
  p_deposit_required BIGINT,
  p_payment_due_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_booking public.bookings%ROWTYPE;
  dress_preferences JSONB;
  dress_preference JSONB;
  matched_unit public.dress_units%ROWTYPE;
  preference_name TEXT;
  preference_size TEXT;
  preference_color TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_admin_id) THEN
    RAISE EXCEPTION 'Admin tidak terdaftar';
  END IF;
  IF p_rental_start IS NULL OR p_rental_end IS NULL OR p_rental_end < p_rental_start THEN
    RAISE EXCEPTION 'Periode sewa tidak valid';
  END IF;

  SELECT * INTO current_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Booking tidak ditemukan'; END IF;
  IF current_booking.booking_status NOT IN ('submitted', 'pending') THEN
    RAISE EXCEPTION 'Booking sudah diproses';
  END IF;

  dress_preferences := CASE
    WHEN jsonb_typeof(current_booking.services_selected -> 'dresses') = 'array'
      THEN current_booking.services_selected -> 'dresses'
    ELSE '[]'::JSONB
  END;

  -- Serialize confirmations that compete for the same model, size, and color.
  -- Locks are acquired in a stable order so multi-dress bookings cannot deadlock.
  PERFORM pg_advisory_xact_lock(hashtextextended(lock_key, 0))
  FROM (
    SELECT DISTINCT concat_ws(
      '|',
      preference ->> 'id',
      lower(trim(preference ->> 'size')),
      lower(trim(preference ->> 'color'))
    ) AS lock_key
    FROM jsonb_array_elements(dress_preferences) AS preference
    ORDER BY lock_key
  ) AS requested_inventory;

  -- A submitted booking should not already have assignments. Removing any legacy
  -- rows here keeps this function idempotent inside the locked transaction.
  DELETE FROM public.booking_dress_assignments WHERE booking_id = p_booking_id;

  FOR dress_preference IN SELECT value FROM jsonb_array_elements(dress_preferences)
  LOOP
    preference_name := COALESCE(NULLIF(trim(dress_preference ->> 'name'), ''), 'Busana pilihan');
    preference_size := trim(COALESCE(dress_preference ->> 'size', ''));
    preference_color := trim(COALESCE(dress_preference ->> 'color', ''));

    IF NULLIF(trim(dress_preference ->> 'id'), '') IS NULL
       OR preference_size = '' OR preference_color = '' THEN
      RAISE EXCEPTION 'BUSANA_TIDAK_TERSEDIA: Pilihan % belum memiliki model, ukuran, dan warna yang lengkap.', preference_name;
    END IF;

    SELECT unit.* INTO matched_unit
    FROM public.dress_units AS unit
    WHERE unit.dress_id = dress_preference ->> 'id'
      AND lower(trim(unit.size)) = lower(preference_size)
      AND lower(trim(unit.color)) = lower(preference_color)
      AND unit.status = 'ready'
      AND NOT EXISTS (
        SELECT 1
        FROM public.booking_dress_assignments AS assignment
        LEFT JOIN public.bookings AS assigned_booking ON assigned_booking.id = assignment.booking_id
        WHERE assignment.dress_unit_id = unit.id
          AND (
            assignment.booking_id = p_booking_id
            OR (
              assigned_booking.booking_status IN ('confirmed', 'paid', 'fitting', 'ready')
              AND assignment.rental_start <= p_rental_end
              AND assignment.rental_end >= p_rental_start
            )
          )
      )
    ORDER BY unit.unit_code, unit.id
    FOR UPDATE OF unit
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'BUSANA_TIDAK_TERSEDIA: % ukuran % warna % tidak tersedia pada periode ini. Tolak booking atau ubah periode sewa.',
        preference_name, preference_size, preference_color;
    END IF;

    INSERT INTO public.booking_dress_assignments (booking_id, dress_unit_id, rental_start, rental_end)
    VALUES (p_booking_id, matched_unit.id, p_rental_start, p_rental_end);
  END LOOP;

  UPDATE public.bookings SET
    booking_status = 'confirmed',
    payment_status = 'awaiting_payment',
    rental_start = p_rental_start,
    rental_end = p_rental_end,
    additional_fees = GREATEST(0, p_additional_fees),
    total_amount = GREATEST(0, p_total_amount),
    deposit_required = LEAST(GREATEST(0, p_deposit_required), GREATEST(0, p_total_amount)),
    payment_due_at = p_payment_due_at
  WHERE id = p_booking_id;

  RETURN (SELECT to_jsonb(booking) FROM public.bookings AS booking WHERE id = p_booking_id);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_booking(TEXT,UUID,DATE,DATE,BIGINT,BIGINT,BIGINT,TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_booking(TEXT,UUID,DATE,DATE,BIGINT,BIGINT,BIGINT,TIMESTAMPTZ) TO service_role;

CREATE OR REPLACE FUNCTION public.assign_package_dress_units(
  p_booking_id TEXT,
  p_admin_id UUID,
  p_unit_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_booking public.bookings%ROWTYPE;
  package_id TEXT;
  expected_unit_count INTEGER;
  normalized_unit_ids UUID[];
  unit_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_admin_id) THEN
    RAISE EXCEPTION 'Admin tidak terdaftar';
  END IF;

  SELECT * INTO current_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Booking tidak ditemukan'; END IF;
  IF current_booking.booking_status <> 'fitting' THEN
    RAISE EXCEPTION 'Unit paket hanya dapat ditentukan pada tahap fitting';
  END IF;
  IF NOT (current_booking.services_selected ? 'weddingPackage') THEN
    RAISE EXCEPTION 'Booking ini bukan booking paket';
  END IF;
  IF current_booking.rental_start IS NULL OR current_booking.rental_end IS NULL THEN
    RAISE EXCEPTION 'Periode sewa booking belum ditentukan';
  END IF;

  package_id := current_booking.services_selected -> 'weddingPackage' ->> 'id';
  IF (current_booking.services_selected -> 'weddingPackage') ? 'dressesIncluded'
     AND (current_booking.services_selected -> 'weddingPackage' ->> 'dressesIncluded') ~ '^\d+$' THEN
    expected_unit_count := (current_booking.services_selected -> 'weddingPackage' ->> 'dressesIncluded')::INTEGER;
  ELSE
    SELECT GREATEST(0, COALESCE(dresses_included, 0)) INTO expected_unit_count
    FROM public.wedding_packages
    WHERE id = package_id;
    expected_unit_count := COALESCE(expected_unit_count, 0);
  END IF;

  IF expected_unit_count = 0 THEN
    RAISE EXCEPTION 'Paket ini tidak memerlukan unit busana';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT requested_id ORDER BY requested_id), ARRAY[]::UUID[])
  INTO normalized_unit_ids
  FROM unnest(COALESCE(p_unit_ids, ARRAY[]::UUID[])) AS requested(requested_id);

  IF cardinality(normalized_unit_ids) <> expected_unit_count THEN
    RAISE EXCEPTION 'Pilih tepat % unit busana sesuai isi paket', expected_unit_count;
  END IF;

  -- UUID order is stable across sessions, preventing deadlocks when a package
  -- contains more than one dress.
  FOREACH unit_id IN ARRAY normalized_unit_ids
  LOOP
    PERFORM 1 FROM public.dress_units WHERE id = unit_id AND status = 'ready' FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'UNIT_FITTING_TIDAK_TERSEDIA: Salah satu unit yang dipilih tidak berstatus siap.';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.booking_dress_assignments AS assignment
      JOIN public.bookings AS assigned_booking ON assigned_booking.id = assignment.booking_id
      WHERE assignment.dress_unit_id = unit_id
        AND assignment.booking_id <> p_booking_id
        AND assigned_booking.booking_status IN ('confirmed', 'paid', 'fitting', 'ready')
        AND assignment.rental_start <= current_booking.rental_end
        AND assignment.rental_end >= current_booking.rental_start
    ) THEN
      RAISE EXCEPTION 'UNIT_FITTING_TIDAK_TERSEDIA: Salah satu unit yang dipilih sudah dipakai booking lain pada periode ini.';
    END IF;
  END LOOP;

  DELETE FROM public.booking_dress_assignments WHERE booking_id = p_booking_id;
  FOREACH unit_id IN ARRAY normalized_unit_ids
  LOOP
    INSERT INTO public.booking_dress_assignments (booking_id, dress_unit_id, rental_start, rental_end)
    VALUES (p_booking_id, unit_id, current_booking.rental_start, current_booking.rental_end);
  END LOOP;

  RETURN (
    SELECT COALESCE(jsonb_agg(to_jsonb(assignment) ORDER BY assignment.created_at), '[]'::JSONB)
    FROM public.booking_dress_assignments AS assignment
    WHERE assignment.booking_id = p_booking_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.assign_package_dress_units(TEXT,UUID,UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_package_dress_units(TEXT,UUID,UUID[]) TO service_role;

COMMIT;
