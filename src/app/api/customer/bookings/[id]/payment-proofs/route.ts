import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { canSubmitPayment } from '@/lib/booking-rules';
import { CUSTOMER_COOKIE, getCustomerBooking, parseCustomerCookie } from '@/server/booking-dal';
import { createSupabaseAdmin } from '@/server/supabase-admin';
import type { PaymentType } from '@/types';

const MAX_BYTES = 5 * 1024 * 1024;

function validImage(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = parseCustomerCookie(request.cookies.get(CUSTOMER_COOKIE)?.value);
    if (!access || access.bookingId !== id) throw new Error('Booking tidak ditemukan.');
    const booking = await getCustomerBooking(id, access.token);
    if (!booking || !canSubmitPayment(booking.bookingStatus, booking.paymentStatus)) {
      return Response.json({ error: 'Booking ini belum dapat menerima pembayaran.' }, { status: 409 });
    }

    const form = await request.formData();
    const file = form.get('proof');
    const paymentType = String(form.get('paymentType') || 'dp') as PaymentType;
    const paymentMethod = String(form.get('paymentMethod') || 'tf');
    if (!(file instanceof File) || !['dp', 'full', 'settlement'].includes(paymentType)) {
      throw new Error('Bukti atau tipe pembayaran tidak valid.');
    }
    const instructions = booking.paymentInstructions;
    if (!instructions || (paymentMethod === 'tf' && !instructions.tf_enabled)
      || (paymentMethod === 'qris' && !instructions.qris_enabled)
      || !['tf', 'qris'].includes(paymentMethod)) {
      throw new Error('Metode pembayaran tidak tersedia.');
    }
    if (file.size <= 0 || file.size > MAX_BYTES) throw new Error('Ukuran bukti maksimal 5 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validImage(bytes, file.type)) throw new Error('Bukti harus berupa JPEG, PNG, atau WebP yang valid.');

    const approved = (booking.paymentSubmissions || [])
      .filter((item: { status: string }) => item.status === 'approved')
      .reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0);
    const amount = paymentType === 'dp'
      ? booking.depositRequired
      : paymentType === 'full' ? booking.totalAmount : Math.max(0, booking.totalAmount - approved);
    if (amount <= 0) return Response.json({ error: 'Tidak ada sisa pembayaran.' }, { status: 409 });

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const objectPath = `${id}/${randomUUID()}.${extension}`;
    const supabase = createSupabaseAdmin();
    const { error: uploadError } = await supabase.storage.from('payment-proofs-private')
      .upload(objectPath, bytes, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(`Bukti gagal diunggah: ${uploadError.message}`);

    const { error: insertError } = await supabase.from('payment_submissions').insert({
      booking_id: id,
      payment_type: paymentType,
      payment_method: paymentMethod,
      amount,
      object_path: objectPath,
      status: 'under_review',
    });
    if (insertError) {
      await supabase.storage.from('payment-proofs-private').remove([objectPath]);
      throw new Error(`Bukti gagal dicatat: ${insertError.message}`);
    }
    await supabase.from('bookings').update({
      payment_type: paymentType,
      payment_method: paymentMethod,
      payment_status: 'under_review',
    }).eq('id', id);
    return Response.json({ status: 'under_review', amount }, { status: 201 });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : 'Bukti gagal diproses.' }, { status: 400 });
  }
}
