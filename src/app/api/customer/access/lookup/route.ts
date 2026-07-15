import { NextResponse, type NextRequest } from 'next/server';
import { CUSTOMER_COOKIE, lookupCustomerAccess, RateLimitError } from '@/server/booking-dal';

export async function POST(request: NextRequest) {
  try {
    const { invoiceNumber, whatsapp } = await request.json() as { invoiceNumber?: string; whatsapp?: string };
    if (!invoiceNumber || !whatsapp) throw new Error('Data tidak lengkap.');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown';
    const access = await lookupCustomerAccess(invoiceNumber, whatsapp, ip);
    if (!access) return Response.json({ error: 'Data booking tidak ditemukan atau tidak cocok.' }, { status: 404 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(CUSTOMER_COOKIE, `${access.bookingId}.${access.token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (cause) {
    const status = cause instanceof RateLimitError ? cause.status : 400;
    return Response.json({ error: status === 429 && cause instanceof Error ? cause.message : 'Data booking tidak ditemukan atau tidak cocok.' }, { status });
  }
}
