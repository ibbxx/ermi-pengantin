import { requireAdmin } from '@/server/supabase-admin';

const PROOF_BUCKET = 'payment-proofs-private';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin(request);

    const { data: booking, error: bookingError } = await supabase.from('bookings')
      .select('id, invoice_number, payment_submissions(object_path)').eq('id', id).maybeSingle();
    if (bookingError) throw bookingError;
    if (!booking) return Response.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });

    const objectPaths = (booking.payment_submissions || [])
      .map((submission: { object_path?: string | null }) => submission.object_path)
      .filter((path): path is string => Boolean(path));

    // Child rows (assignments, submissions, migration queue) cascade from the booking row.
    const { error: deleteError } = await supabase.from('bookings').delete().eq('id', id);
    if (deleteError) throw deleteError;

    if (objectPaths.length) {
      const { error: storageError } = await supabase.storage.from(PROOF_BUCKET).remove(objectPaths);
      // The booking is already gone, so a leftover object must not fail the request.
      if (storageError) console.warn(`Booking ${id}: bukti pembayaran gagal dihapus dari storage: ${storageError.message}`);
    }

    return Response.json({ ok: true, id });
  } catch (cause) {
    const status = cause instanceof Error && 'status' in cause ? Number(cause.status) : 400;
    return Response.json({ error: cause instanceof Error ? cause.message : 'Booking gagal dihapus.' }, { status });
  }
}
