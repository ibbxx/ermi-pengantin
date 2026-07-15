import type { NextRequest } from 'next/server';
import { CUSTOMER_COOKIE, getCustomerBooking, parseCustomerCookie } from '@/server/booking-dal';

export async function GET(request: NextRequest) {
  try {
    const access = parseCustomerCookie(request.cookies.get(CUSTOMER_COOKIE)?.value);
    if (!access) return Response.json({ error: 'Sesi booking tidak ditemukan.' }, { status: 404 });
    const booking = await getCustomerBooking(access.bookingId, access.token);
    return booking
      ? Response.json({ booking })
      : Response.json({ error: 'Sesi booking tidak ditemukan.' }, { status: 404 });
  } catch {
    return Response.json({ error: 'Status booking sementara tidak tersedia.' }, { status: 503 });
  }
}
