import { supabase } from '@/lib/supabase';
import type { BookingStatus, PaymentStatus, PaymentType } from '@/types';

export interface AdminPaymentSubmission {
  id: string;
  payment_type: PaymentType;
  payment_method: string;
  amount: number;
  status: 'under_review' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  proof_url?: string | null;
  created_at: string;
}

export interface AdminBooking {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  customer_address: string;
  event_date: string;
  event_location: string;
  event_type: string;
  services_selected: {
    dresses?: Array<{ id: string; name: string; size: string; color: string; price: number }>;
    makeup?: { id: string; name: string; price: number };
    decor?: { id: string; name: string; price: number };
    weddingPackage?: { id: string; name: string; price: number; dressesIncluded?: number };
  };
  notes?: string | null;
  subtotal: number;
  additional_fees: number;
  deposit_required: number;
  total_amount: number;
  payment_type: PaymentType;
  payment_method: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  payment_due_at?: string | null;
  rental_start?: string | null;
  rental_end?: string | null;
  admin_notes?: string | null;
  created_at: string;
  payment_submissions: AdminPaymentSubmission[];
  booking_dress_assignments: Array<{ id: string; dress_unit_id: string; dress_units?: DressUnit }>;
}

export interface DressUnit {
  id: string;
  dress_id: string;
  unit_code: string;
  size: string;
  color: string;
  status: 'ready' | 'maintenance' | 'retired';
  notes?: string | null;
  dresses?: { id: string; name: string };
}

export interface AdminDressOption {
  id: string;
  name: string;
  sizes: string[];
  colors: string[];
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sesi admin berakhir. Silakan masuk kembali.');
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
      ...init?.headers,
      authorization: `Bearer ${session.access_token}`,
    },
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'Permintaan admin gagal diproses.');
  return data;
}
