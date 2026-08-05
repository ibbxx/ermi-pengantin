import type { NextRequest } from 'next/server';
import { CUSTOMER_COOKIE, getCustomerBooking, parseCustomerCookie } from '@/server/booking-dal';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = parseCustomerCookie(request.cookies.get(CUSTOMER_COOKIE)?.value);
    if (!access || access.bookingId !== id) return Response.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
    const booking = await getCustomerBooking(id, access.token);
    return booking
      ? Response.json({ booking })
      : Response.json({ error: 'Booking tidak ditemukan.' }, { status: 404 });
  } catch {
    return Response.json({ error: 'Status booking sementara tidak tersedia.' }, { status: 503 });
  }
}
