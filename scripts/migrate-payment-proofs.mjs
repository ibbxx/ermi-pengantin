import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia.');
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: queue, error } = await supabase.from('payment_proof_migration_queue')
  .select('*').in('status', ['pending', 'failed']).order('created_at');
if (error) throw error;

for (const item of queue || []) {
  try {
    const response = await fetch(item.legacy_public_url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) throw new Error('File kosong');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const checksum = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const objectPath = `${item.booking_id}/legacy-${checksum}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('payment-proofs-private')
      .upload(objectPath, bytes, { contentType, upsert: false });
    if (uploadError && !uploadError.message.toLowerCase().includes('already exists')) throw uploadError;

    const { data: signed, error: signError } = await supabase.storage.from('payment-proofs-private').createSignedUrl(objectPath, 60);
    if (signError || !signed?.signedUrl) throw signError || new Error('Validasi signed URL gagal');
    const validation = await fetch(signed.signedUrl);
    if (!validation.ok || Number(validation.headers.get('content-length') || bytes.length) !== bytes.length) {
      throw new Error('Ukuran objek privat tidak cocok');
    }

    await supabase.from('payment_proof_migration_queue').update({
      status: 'migrated', private_object_path: objectPath, validated_at: new Date().toISOString(),
    }).eq('booking_id', item.booking_id);
    const { data: booking } = await supabase.from('bookings')
      .select('payment_type,payment_method,payment_status,deposit_required,total_amount')
      .eq('id', item.booking_id).single();
    if (booking) {
      const paymentType = booking.payment_type === 'full' ? 'full' : 'dp';
      await supabase.from('payment_submissions').upsert({
        booking_id: item.booking_id,
        payment_type: paymentType,
        payment_method: booking.payment_method || 'legacy',
        amount: paymentType === 'full' ? Number(booking.total_amount) : Number(booking.deposit_required),
        object_path: objectPath,
        status: booking.payment_status === 'paid' ? 'approved' : 'under_review',
        reviewed_at: booking.payment_status === 'paid' ? new Date().toISOString() : null,
      }, { onConflict: 'object_path' });
    }
    await supabase.from('bookings').update({ payment_proof: null }).eq('id', item.booking_id);

    const marker = '/storage/v1/object/public/';
    const index = item.legacy_public_url.indexOf(marker);
    if (index >= 0) {
      const [bucket, ...pathParts] = decodeURIComponent(item.legacy_public_url.slice(index + marker.length)).split('/');
      if (bucket && pathParts.length) await supabase.storage.from(bucket).remove([pathParts.join('/')]);
    }
  } catch (cause) {
    await supabase.from('payment_proof_migration_queue').update({ status: 'failed' }).eq('booking_id', item.booking_id);
    console.error(`Gagal memigrasikan booking ${item.booking_id}:`, cause instanceof Error ? cause.message : cause);
  }
}

console.log(`Selesai memproses ${(queue || []).length} bukti pembayaran lama.`);
