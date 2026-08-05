import type { BookingRequestInput } from '@/types';
import { createBookingRequest } from '@/server/booking-dal';

export async function POST(request: Request) {
  try {
    const input = await request.json() as BookingRequestInput;
    const result = await createBookingRequest(input);
    const origin = new URL(request.url).origin;
    const accessUrl = `${origin}/api/customer/access/exchange?booking=${encodeURIComponent(result.id)}&token=${encodeURIComponent(result.accessToken)}`;
    return Response.json({
      bookingId: result.id,
      invoiceNumber: result.invoiceNumber,
      estimate: result.estimate,
      accessUrl,
      adminWhatsApp: result.adminWhatsApp,
    }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Permintaan tidak dapat diproses.';
    const unavailable = message.startsWith('Konfigurasi server ');
    return Response.json({ error: unavailable ? 'Layanan booking sementara belum tersedia.' : message }, { status: unavailable ? 503 : 400 });
  }
}
