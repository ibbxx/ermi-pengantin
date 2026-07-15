export type DressCategory = string;

export interface Dress {
  id: string;
  slug: string;
  name: string;
  category: DressCategory;
  price: number;
  deposit: number; // Uang jaminan
  sizes: string[]; // ['S', 'M', 'L', 'XL']
  colors: string[]; // ['Ivory', 'White', 'Champagne', 'Rose Gold']
  images: string[];
  description: string;
  material: string;
  rentalDurationDays: number;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  status: 'available' | 'rented' | 'maintenance';
}

export interface MakeupPackage {
  id: string;
  name: string; // Akad, Resepsi, Prewedding, Bridesmaid, Keluarga
  price: number;
  description: string;
  features: string[]; // ['Hairdo/Hijab do', 'Retouch 1x', 'Free Transport Jabodetabek']
  images: string[];
}

export interface DecorPackage {
  id: string;
  decorType: 'package' | 'item';
  name: string;
  theme: string; // Traditional, Modern, Rustic, White Classic, Garden
  price: number; // Mulai dari
  description: string;
  features: string[]; // Detail fleksibel: ukuran, material, warna, isi paket, dan lainnya
  images: string[];
}

export interface WeddingPackage {
  id: string;
  name: string; // Paket Hemat, Paket Standard, Paket Premium, Paket Luxury
  price: number;
  dressesIncluded: number; // Jumlah baju
  makeupIncluded: string[]; // e.g. ['Makeup Akad', 'Retouch Resepsi', '2 Ibu Kandung']
  decorIncluded: string; // Tema dekorasi apa saja
  features: string[]; // Fasilitas bonus
  depositRequired: number; // DP estimasi
  isPopular: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'paid'
  | 'fitting'
  | 'ready'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface Booking {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerWhatsApp: string;
  customerEmail: string;
  customerAddress: string;
  eventDate: string; // ISO Date String
  eventLocation: string;
  eventType: 'akad' | 'resepsi' | 'prewedding' | 'lamaran';
  
  // Selected Services
  servicesSelected: {
    dresses?: {
      id: string;
      name: string;
      size: string;
      color: string;
      price: number;
      image: string;
    }[];
    makeup?: {
      id: string;
      name: string;
      price: number;
    };
    decor?: {
      id: string;
      name: string;
      price: number;
    };
    weddingPackage?: {
      id: string;
      name: string;
      price: number;
    };
  };

  notes?: string;
  subtotal: string; // For display, can also be number
  additionalFees: string; // For display, transport or fitting changes
  depositRequired: string; // DP Amount
  totalAmount: string; // Total Amount
  paymentType: PaymentType;
  paymentMethod: string; // 'va_bca' | 'va_mandiri' | 'gopay' | 'credit_card'
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paymentProof?: string;
  createdAt: string;
}

export type PaymentType = 'dp' | 'full' | 'settlement' | 'pelunasan';
export type PaymentStatus =
  | 'not_due'
  | 'awaiting_payment'
  | 'under_review'
  | 'partially_paid'
  | 'paid'
  | 'rejected'
  | 'pending'
  | 'failed';

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  address: string;
  bookingsCount: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  paymentType: 'dp' | 'full' | 'pelunasan';
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  transactionTime: string;
}

export interface Gallery {
  id: string;
  title: string;
  category: 'makeup' | 'decor' | 'dress-showcase';
  image: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string; // e.g. "Pengantin Akad Mei 2026"
  rating: number;
  comment: string;
  avatar: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface SystemSettings {
  shopName: string;
  whatsappAdmin: string;
  emailAdmin: string;
  minDpPercent: number;
  transportBase: number;
  address: string;
  heroImage: string;
  serviceDressImage: string;
  serviceMakeupImage: string;
  serviceDecorImage: string;
  tfEnabled: boolean;
  tfBankName: string;
  tfAccountNumber: string;
  tfAccountHolder: string;
  qrisEnabled: boolean;
  qrisImage: string;
}

export type DressUnitStatus = 'ready' | 'maintenance' | 'retired';

export interface BookingRequestInput {
  customerName: string;
  customerWhatsApp: string;
  customerEmail?: string;
  customerAddress?: string;
  eventDate: string;
  eventLocation: string;
  eventType: 'akad' | 'resepsi' | 'prewedding' | 'lamaran';
  notes?: string;
  consent: boolean;
  paymentType: 'dp' | 'full';
  paymentMethod: string;
  weddingPackageId?: string;
  dressPreferences?: Array<{
    dressId: string;
    size?: string;
    color?: string;
  }>;
  makeupId?: string;
  decorId?: string;
}
