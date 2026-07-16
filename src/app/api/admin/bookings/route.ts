import { requireAdmin } from '@/server/supabase-admin';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const { data, error } = await supabase.from('bookings')
      .select('id,invoice_number,customer_id,customer_name,customer_whatsapp,customer_email,customer_address,event_date,event_location,event_type,services_selected,notes,subtotal,additional_fees,deposit_required,total_amount,payment_type,payment_method,payment_status,booking_status,payment_due_at,rental_start,rental_end,admin_notes,created_at,booking_dress_assignments(*,dress_units(*)),payment_submissions(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const packageIds = [...new Set((data || []).map((booking) => booking.services_selected?.weddingPackage?.id).filter(Boolean))] as string[];
    const packageDressCounts = new Map<string, number>();
    if (packageIds.length) {
      const { data: packageRows, error: packageError } = await supabase.from('wedding_packages')
        .select('id,dresses_included').in('id', packageIds);
      if (packageError) throw packageError;
      packageRows?.forEach((item) => packageDressCounts.set(item.id, Number(item.dresses_included || 0)));
    }

    const bookings = await Promise.all((data || []).map(async (booking) => ({
      ...booking,
      services_selected: booking.services_selected?.weddingPackage
        ? {
          ...booking.services_selected,
          weddingPackage: {
            ...booking.services_selected.weddingPackage,
            dressesIncluded: Number(
              booking.services_selected.weddingPackage.dressesIncluded
              ?? packageDressCounts.get(booking.services_selected.weddingPackage.id)
              ?? 0,
            ),
          },
        }
        : booking.services_selected,
      payment_submissions: await Promise.all((booking.payment_submissions || []).map(async (submission: Record<string, unknown>) => {
        const { data: signed } = await supabase.storage.from('payment-proofs-private')
          .createSignedUrl(String(submission.object_path), 300);
        return { ...submission, amount: Number(submission.amount), proof_url: signed?.signedUrl || null };
      })),
    })));
    return Response.json({ bookings });
  } catch (cause) {
    const status = cause instanceof Error && 'status' in cause ? Number(cause.status) : 500;
    return Response.json({ error: cause instanceof Error ? cause.message : 'Data gagal dimuat.' }, { status });
  }
}
