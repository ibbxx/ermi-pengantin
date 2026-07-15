import 'server-only';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { BookingRequestInput, PaymentType } from '@/types';
import { calculateBookingEstimate, normalizeWhatsApp } from '@/lib/booking-rules';
import { createSupabaseAdmin } from '@/server/supabase-admin';

export const CUSTOMER_COOKIE = 'ermi_booking_access';

export function hashAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function invoiceNumber() {
  const date = new Date();
  const compact = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return `EP-${compact}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

function mapDress(row: Record<string, unknown>) {
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), category: String(row.category),
    price: Number(row.price), deposit: Number(row.deposit || 0), sizes: (row.sizes as string[]) || [],
    colors: (row.colors as string[]) || [], images: (row.images as string[]) || [],
    description: String(row.description || ''), material: String(row.material || ''),
    rentalDurationDays: Number(row.rental_duration_days || 3), rating: Number(row.rating || 5),
    reviewCount: Number(row.review_count || 0), isPopular: Boolean(row.is_popular),
    status: (row.status || 'available') as 'available' | 'rented' | 'maintenance',
  };
}

export async function createBookingRequest(input: BookingRequestInput) {
  if (!input.consent) throw new Error('Persetujuan pemrosesan data wajib dicentang.');
  if (!input.customerName?.trim() || !input.eventDate || !input.eventLocation?.trim()) {
    throw new Error('Nama, tanggal, dan lokasi acara wajib diisi.');
  }
  if (input.eventDate < new Date().toISOString().slice(0, 10)) {
    throw new Error('Tanggal acara tidak boleh berada di masa lalu.');
  }

  const customerWhatsApp = normalizeWhatsApp(input.customerWhatsApp);
  const supabase = createSupabaseAdmin();
  const [dressesResult, makeupResult, decorResult, packagesResult, settingsResult] = await Promise.all([
    supabase.from('dresses').select('*'),
    supabase.from('makeup_packages').select('*'),
    supabase.from('decor_packages').select('*'),
    supabase.from('wedding_packages').select('*'),
    supabase.from('system_settings').select('*').eq('id', 1).single(),
  ]);
  const firstError = [dressesResult, makeupResult, decorResult, packagesResult, settingsResult].find((result) => result.error)?.error;
  if (firstError) throw new Error('Katalog belum dapat dimuat. Silakan coba lagi.');

  const catalog = {
    dresses: (dressesResult.data || []).map((row) => mapDress(row)),
    makeup: (makeupResult.data || []).map((row) => ({
      id: row.id, name: row.name, price: Number(row.price), description: row.description || '',
      features: row.features || [], images: row.images || [],
    })),
    decor: (decorResult.data || []).map((row) => ({
      id: row.id, decorType: row.decor_type === 'item' ? 'item' as const : 'package' as const,
      name: row.name, theme: row.theme, price: Number(row.price), description: row.description || '',
      features: row.features || [], images: row.images || [],
    })),
    packages: (packagesResult.data || []).map((row) => ({
      id: row.id, name: row.name, price: Number(row.price), dressesIncluded: row.dresses_included || 0,
      makeupIncluded: row.makeup_included || [], decorIncluded: row.decor_included || '',
      features: row.features || [], depositRequired: Number(row.deposit_required || 0), isPopular: Boolean(row.is_popular),
    })),
  };
  const settings = settingsResult.data;
  const estimate = calculateBookingEstimate(input, catalog, {
    minDpPercent: Number(settings.min_dp_percent || 0),
    transportBase: Number(settings.transport_base || 0),
  });
  const id = randomUUID();
  const invoice = invoiceNumber();
  const accessToken = randomBytes(32).toString('base64url');
  const { error } = await supabase.from('bookings').insert({
    id,
    invoice_number: invoice,
    customer_id: randomUUID(),
    customer_name: input.customerName.trim(),
    customer_whatsapp: customerWhatsApp,
    customer_email: input.customerEmail?.trim() || '',
    customer_address: input.customerAddress?.trim() || '',
    event_date: input.eventDate,
    event_location: input.eventLocation.trim(),
    event_type: input.eventType,
    services_selected: estimate.servicesSelected,
    notes: input.notes?.trim() || null,
    subtotal: estimate.subtotal,
    additional_fees: estimate.additionalFees,
    deposit_required: estimate.depositRequired,
    total_amount: estimate.totalAmount,
    payment_type: 'dp',
    payment_method: '',
    payment_status: 'not_due',
    booking_status: 'submitted',
    access_token_hash: hashAccessToken(accessToken),
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Permintaan booking gagal disimpan: ${error.message}`);

  return {
    id,
    invoiceNumber: invoice,
    accessToken,
    estimate,
    adminWhatsApp: String(settings.whatsapp_admin || ''),
  };
}

export function parseCustomerCookie(value: string | undefined) {
  if (!value) return null;
  const separator = value.indexOf('.');
  if (separator < 1) return null;
  return { bookingId: value.slice(0, separator), token: value.slice(separator + 1) };
}

export async function getCustomerBooking(bookingId: string, token: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('bookings')
    .select('id,invoice_number,customer_name,event_date,event_location,event_type,services_selected,notes,subtotal,additional_fees,deposit_required,total_amount,payment_type,payment_method,payment_status,booking_status,payment_due_at,rental_start,rental_end,created_at')
    .eq('id', bookingId)
    .eq('access_token_hash', hashAccessToken(token))
    .maybeSingle();
  if (error || !data) return null;

  const { data: settings } = await supabase
    .from('system_settings')
    .select('whatsapp_admin,tf_enabled,tf_bank_name,tf_account_number,tf_account_holder,qris_enabled,qris_image')
    .eq('id', 1)
    .maybeSingle();
  const { data: submissions } = await supabase
    .from('payment_submissions')
    .select('id,payment_type,amount,status,rejection_reason,created_at,reviewed_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    customerName: data.customer_name,
    eventDate: data.event_date,
    eventLocation: data.event_location,
    eventType: data.event_type,
    servicesSelected: data.services_selected,
    notes: data.notes || '',
    subtotal: Number(data.subtotal),
    additionalFees: Number(data.additional_fees),
    depositRequired: Number(data.deposit_required),
    totalAmount: Number(data.total_amount),
    paymentType: data.payment_type as PaymentType,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    bookingStatus: data.booking_status,
    paymentDueAt: data.payment_due_at,
    rentalStart: data.rental_start,
    rentalEnd: data.rental_end,
    createdAt: data.created_at,
    paymentSubmissions: (submissions || []).map((item) => ({ ...item, amount: Number(item.amount) })),
    paymentInstructions: ['confirmed', 'fitting', 'ready'].includes(data.booking_status)
      ? settings
      : null,
  };
}

export async function lookupCustomerAccess(invoice: string, whatsapp: string, ip: string) {
  const supabase = createSupabaseAdmin();
  const normalizedInvoice = invoice.trim().toUpperCase();
  const normalizedWhatsApp = normalizeWhatsApp(whatsapp);
  const since = new Date(Date.now() - 15 * 60_000).toISOString();
  const [ipAttempts, invoiceAttempts] = await Promise.all([
    supabase.from('booking_access_audit').select('id', { count: 'exact', head: true })
      .gte('created_at', since).eq('ip_address', ip),
    supabase.from('booking_access_audit').select('id', { count: 'exact', head: true })
      .gte('created_at', since).eq('invoice_number', normalizedInvoice),
  ]);
  if (ipAttempts.error || invoiceAttempts.error) throw new Error('Pemeriksaan akses sementara tidak tersedia.');
  if ((ipAttempts.count || 0) >= 8 || (invoiceAttempts.count || 0) >= 8) throw new RateLimitError();

  const { data } = await supabase.from('bookings').select('id').eq('invoice_number', normalizedInvoice)
    .eq('customer_whatsapp', normalizedWhatsApp).maybeSingle();
  const { error: auditError } = await supabase.from('booking_access_audit').insert({
    ip_address: ip, invoice_number: normalizedInvoice, success: Boolean(data), created_at: new Date().toISOString(),
  });
  if (auditError) throw new Error('Pemeriksaan akses sementara tidak tersedia.');
  if (!data) return null;
  const token = randomBytes(32).toString('base64url');
  await supabase.from('bookings').update({ access_token_hash: hashAccessToken(token) }).eq('id', data.id);
  return { bookingId: data.id, token };
}

export class RateLimitError extends Error {
  status = 429;
  constructor() { super('Terlalu banyak percobaan. Coba lagi beberapa saat.'); }
}
