import { NextResponse, type NextRequest } from 'next/server';
import { CUSTOMER_COOKIE, getCustomerBooking } from '@/server/booking-dal';

export async function GET(request: NextRequest) {
  try {
    const bookingId = request.nextUrl.searchParams.get('booking') || '';
    const token = request.nextUrl.searchParams.get('token') || '';
    const booking = bookingId && token ? await getCustomerBooking(bookingId, token) : null;
    if (!booking) return NextResponse.redirect(new URL('/booking/status?error=invalid', request.url));

    const response = NextResponse.redirect(new URL('/booking/status', request.url));
    response.cookies.set(CUSTOMER_COOKIE, `${bookingId}.${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL('/booking/status?error=unavailable', request.url));
  }
}
