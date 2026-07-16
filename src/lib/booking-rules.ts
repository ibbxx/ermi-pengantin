import type {
  BookingRequestInput,
  BookingStatus,
  DecorPackage,
  Dress,
  MakeupPackage,
  PaymentStatus,
  WeddingPackage,
} from '@/types';

export function normalizeWhatsApp(value: string): string {
  let digits = value.trim().replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  digits = digits.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;

  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    throw new Error('Nomor WhatsApp tidak valid. Gunakan format 08xx atau 628xx.');
  }
  return digits;
}

export function rupiah(value: number | string): number {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0;
  const digits = value.replace(/[^\d-]/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
}

export interface CatalogForBooking {
  dresses: Dress[];
  makeup: MakeupPackage[];
  decor: DecorPackage[];
  packages: WeddingPackage[];
}

export interface BookingEstimate {
  servicesSelected: {
    dresses?: Array<{ id: string; name: string; size: string; color: string; price: number; image: string }>;
    makeup?: { id: string; name: string; price: number };
    decor?: { id: string; name: string; price: number };
    weddingPackage?: { id: string; name: string; price: number; dressesIncluded: number };
  };
  subtotal: number;
  additionalFees: number;
  depositRequired: number;
  totalAmount: number;
}

export function calculateBookingEstimate(
  input: BookingRequestInput,
  catalog: CatalogForBooking,
  settings: { minDpPercent: number; transportBase: number },
): BookingEstimate {
  const services: BookingEstimate['servicesSelected'] = {};
  let subtotal = 0;

  if (input.weddingPackageId) {
    const item = catalog.packages.find((candidate) => candidate.id === input.weddingPackageId);
    if (!item) throw new Error('Paket yang dipilih tidak tersedia.');
    services.weddingPackage = {
      id: item.id,
      name: item.name,
      price: rupiah(item.price),
      dressesIncluded: Math.max(0, Math.round(item.dressesIncluded)),
    };
    subtotal = rupiah(item.price);
  } else {
    if (input.dressPreferences?.length) {
      services.dresses = input.dressPreferences.map((preference) => {
        const item = catalog.dresses.find((candidate) => candidate.id === preference.dressId);
        if (!item) throw new Error('Model busana yang dipilih tidak tersedia.');
        if (preference.size && item.sizes.length && !item.sizes.includes(preference.size)) {
          throw new Error(`Ukuran ${preference.size} tidak tersedia untuk ${item.name}.`);
        }
        if (preference.color && item.colors.length && !item.colors.includes(preference.color)) {
          throw new Error(`Warna ${preference.color} tidak tersedia untuk ${item.name}.`);
        }
        const price = rupiah(item.price);
        subtotal += price;
        return {
          id: item.id,
          name: item.name,
          size: preference.size || '',
          color: preference.color || '',
          price,
          image: item.images[0] || '',
        };
      });
    }

    if (input.makeupId) {
      const item = catalog.makeup.find((candidate) => candidate.id === input.makeupId);
      if (!item) throw new Error('Layanan makeup yang dipilih tidak tersedia.');
      services.makeup = { id: item.id, name: item.name, price: rupiah(item.price) };
      subtotal += rupiah(item.price);
    }

    if (input.decorId) {
      const item = catalog.decor.find((candidate) => candidate.id === input.decorId);
      if (!item) throw new Error('Layanan dekorasi yang dipilih tidak tersedia.');
      services.decor = { id: item.id, name: item.name, price: rupiah(item.price) };
      subtotal += rupiah(item.price);
    }
  }

  if (subtotal <= 0) throw new Error('Pilih minimal satu layanan.');
  const additionalFees = Math.max(0, rupiah(settings.transportBase));
  const totalAmount = subtotal + additionalFees;
  const packageDp = services.weddingPackage
    ? catalog.packages.find((item) => item.id === services.weddingPackage?.id)?.depositRequired
    : undefined;
  const depositRequired = packageDp
    ? Math.min(totalAmount, rupiah(packageDp))
    : Math.min(totalAmount, Math.round(subtotal * Math.max(0, settings.minDpPercent) / 100));

  return { servicesSelected: services, subtotal, additionalFees, depositRequired, totalAmount };
}

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  submitted: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['fitting', 'ready', 'cancelled'],
  fitting: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  declined: [],
  cancelled: [],
  pending: ['confirmed', 'declined', 'cancelled'],
  paid: ['fitting', 'ready', 'completed', 'cancelled'],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return from === to || BOOKING_TRANSITIONS[from].includes(to);
}

export function canSubmitPayment(booking: BookingStatus, payment: PaymentStatus): boolean {
  return ['confirmed', 'fitting', 'ready'].includes(booking)
    && ['awaiting_payment', 'rejected', 'partially_paid'].includes(payment);
}

export function periodsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA <= endB && startB <= endA;
}
