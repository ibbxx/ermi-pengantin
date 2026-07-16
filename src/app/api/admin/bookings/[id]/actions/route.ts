import { randomBytes } from 'node:crypto';
import { canTransitionBooking } from '@/lib/booking-rules';
import { hashAccessToken } from '@/server/booking-dal';
import { requireAdmin } from '@/server/supabase-admin';
import type { BookingStatus } from '@/types';

type ActionBody =
  | { action: 'confirm'; rentalStart: string; rentalEnd: string; additionalFees: number; totalAmount: number; depositRequired: number; paymentDueAt?: string }
  | { action: 'assign_fitting_units'; unitIds: string[] }
  | { action: 'decline'; reason?: string }
  | { action: 'status'; status: BookingStatus }
  | { action: 'review_payment'; submissionId: string; decision: 'approve' | 'reject'; rejectionReason?: string }
  | { action: 'create_link' };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAdmin(request);
    const body = await request.json() as ActionBody;

    if (body.action === 'confirm') {
      if (!body.rentalStart || !body.rentalEnd || body.rentalEnd < body.rentalStart) {
        return Response.json({ error: 'Periode sewa tidak valid.' }, { status: 400 });
      }
      const { data, error } = await supabase.rpc('confirm_booking', {
        p_booking_id: id,
        p_admin_id: user.id,
        p_rental_start: body.rentalStart,
        p_rental_end: body.rentalEnd,
        p_additional_fees: Math.max(0, Math.round(body.additionalFees)),
        p_total_amount: Math.max(0, Math.round(body.totalAmount)),
        p_deposit_required: Math.max(0, Math.round(body.depositRequired)),
        p_payment_due_at: body.paymentDueAt || null,
      });
      if (error) return rpcError(error.message);
      return Response.json({ booking: data });
    }

    if (body.action === 'assign_fitting_units') {
      if (!Array.isArray(body.unitIds) || body.unitIds.some((unitId) => typeof unitId !== 'string')) {
        return Response.json({ error: 'Pilihan unit fitting tidak valid.' }, { status: 400 });
      }
      const { data, error } = await supabase.rpc('assign_package_dress_units', {
        p_booking_id: id,
        p_admin_id: user.id,
        p_unit_ids: body.unitIds,
      });
      if (error) return rpcError(error.message);
      return Response.json({ assignments: data });
    }

    const { data: booking, error: bookingError } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (bookingError) throw bookingError;

    if (body.action === 'decline') {
      if (!canTransitionBooking(booking.booking_status, 'declined')) return Response.json({ error: 'Status tidak dapat ditolak.' }, { status: 409 });
      const { error } = await supabase.from('bookings').update({ booking_status: 'declined', payment_status: 'not_due', admin_notes: body.reason || null }).eq('id', id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    if (body.action === 'status') {
      if (!canTransitionBooking(booking.booking_status, body.status)) return Response.json({ error: 'Transisi status tidak diizinkan.' }, { status: 409 });
      const weddingPackage = booking.services_selected?.weddingPackage as { id?: string; dressesIncluded?: number } | undefined;
      if (body.status === 'ready' && weddingPackage) {
        let requiredUnits = Number(weddingPackage.dressesIncluded);
        if (!Number.isFinite(requiredUnits)) {
          const { data: packageRow } = await supabase.from('wedding_packages')
            .select('dresses_included').eq('id', weddingPackage.id || '').maybeSingle();
          requiredUnits = Number(packageRow?.dresses_included || 0);
        }
        if (booking.booking_status === 'confirmed' && requiredUnits > 0) {
          return Response.json({ error: 'Booking paket harus masuk tahap fitting sebelum dinyatakan siap.' }, { status: 409 });
        }
        if (requiredUnits > 0) {
          const { count, error: assignmentError } = await supabase.from('booking_dress_assignments')
            .select('id', { count: 'exact', head: true }).eq('booking_id', id);
          if (assignmentError) throw assignmentError;
          if ((count || 0) !== requiredUnits) {
            return Response.json({ error: `Pilih dan simpan ${requiredUnits} unit busana saat fitting sebelum booking dinyatakan siap.` }, { status: 409 });
          }
        }
      }
      const { error } = await supabase.from('bookings').update({ booking_status: body.status }).eq('id', id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    if (body.action === 'review_payment') {
      const { data: submission, error } = await supabase.from('payment_submissions').select('*')
        .eq('id', body.submissionId).eq('booking_id', id).eq('status', 'under_review').single();
      if (error) throw error;
      const approved = body.decision === 'approve';
      const { error: reviewError } = await supabase.from('payment_submissions').update({
        status: approved ? 'approved' : 'rejected', reviewer_id: user.id,
        rejection_reason: approved ? null : body.rejectionReason?.trim() || 'Bukti belum dapat diverifikasi.',
        reviewed_at: new Date().toISOString(),
      }).eq('id', submission.id);
      if (reviewError) throw reviewError;

      const { data: approvedRows, error: approvedError } = await supabase.from('payment_submissions').select('amount')
        .eq('booking_id', id).eq('status', 'approved');
      if (approvedError) throw approvedError;
      const paid = (approvedRows || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const paymentStatus = paid >= Number(booking.total_amount)
        ? 'paid'
        : paid > 0 ? 'partially_paid' : approved ? 'partially_paid' : 'rejected';
      const { error: paymentError } = await supabase.from('bookings').update({ payment_status: paymentStatus }).eq('id', id);
      if (paymentError) throw paymentError;
      return Response.json({ paymentStatus, paidAmount: paid });
    }

    if (body.action === 'create_link') {
      const token = randomBytes(32).toString('base64url');
      const { error } = await supabase.from('bookings').update({ access_token_hash: hashAccessToken(token) }).eq('id', id);
      if (error) throw error;
      const origin = new URL(request.url).origin;
      return Response.json({ accessUrl: `${origin}/api/customer/access/exchange?booking=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}` });
    }

    return Response.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (cause) {
    const status = cause instanceof Error && 'status' in cause ? Number(cause.status) : 400;
    return Response.json({ error: cause instanceof Error ? cause.message : 'Aksi gagal diproses.' }, { status });
  }
}

function rpcError(message: string) {
  const availabilityMarkers = ['BUSANA_TIDAK_TERSEDIA:', 'UNIT_FITTING_TIDAK_TERSEDIA:'];
  const marker = availabilityMarkers.find((candidate) => message.includes(candidate));
  if (marker) {
    return Response.json({ error: message.slice(message.indexOf(marker) + marker.length).trim() }, { status: 409 });
  }
  return Response.json({ error: message }, { status: 400 });
}
