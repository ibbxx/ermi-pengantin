'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, FileText, Calendar, MessageSquare, ExternalLink, Plus } from 'lucide-react';
import { Booking } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { useBookings } from '@/data/db';

export default function CustomerDashboard() {
  const router = useRouter();
  const [bookings] = useBookings();

  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: Booking['bookingStatus']) => {
    const statusMap = {
      pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
      confirmed: { label: 'Confirmed', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
      paid: { label: 'Paid', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      fitting: { label: 'Fitting', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
      ready: { label: 'Ready', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      completed: { label: 'Completed', classes: 'bg-stone-100 text-stone-700 border-stone-300' },
      cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border-red-200' }
    };
    const config = statusMap[status] || { label: status, classes: 'bg-stone-50 border-stone-200' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const handleWhatsAppConsult = (booking: Booking) => {
    const text = encodeURIComponent(`Halo Admin Elika, saya ingin bertanya mengenai status booking saya untuk Invoice ${booking.invoiceNumber}.`);
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner Profile Summary */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gold-light/20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-ivory to-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-champagne text-gold-dark rounded-full flex items-center justify-center border border-gold/10">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-charcoal">Halo, Calon Pengantin!</h1>
            <p className="text-xs text-stone-500">
              Selamat datang di dashboard Anda. Di sini Anda dapat melihat status fitting gaun, konfirmasi MUA, dan jadwal pelaminan.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/booking')}
          className="px-5 py-3 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Booking Layanan
        </button>
      </div>

      {/* Booking History Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-charcoal flex items-center gap-1.5">
          <ShoppingBag className="h-5 w-5 text-gold-dark" /> Riwayat Booking Pernikahan
        </h2>

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((item) => {
              // Create readable summary of services selected
              const servicesNames = [];
              if (item.servicesSelected.weddingPackage) {
                servicesNames.push(item.servicesSelected.weddingPackage.name);
              } else {
                if (item.servicesSelected.dresses?.length) {
                  servicesNames.push(`Sewa Gaun (${item.servicesSelected.dresses.map((d) => d.name).join(', ')})`);
                }
                if (item.servicesSelected.makeup) {
                  servicesNames.push(`MUA (${item.servicesSelected.makeup.name})`);
                }
                if (item.servicesSelected.decor) {
                  servicesNames.push(`Dekorasi (${item.servicesSelected.decor.name})`);
                }
              }

              return (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-gold-light/20 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  {/* Row 1: Invoice & Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gold-light/10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Nomor Invoice</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-charcoal text-sm">{item.invoiceNumber}</span>
                        {item.paymentStatus === 'pending' && (
                          <Link
                            href={`/checkout?bookingId=${item.id}`}
                            className="text-[10px] font-semibold text-gold hover:text-gold-dark flex items-center gap-0.5"
                          >
                            <span>Bayar Sekarang</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-stone-400 block uppercase">Metode Bayar</span>
                        <span className="text-xs font-bold text-charcoal uppercase">{item.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-stone-400 block uppercase">Status Booking</span>
                        {getStatusBadge(item.bookingStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Event Details & Selected services */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gold-dark" /> Detail Acara
                      </h4>
                      <p className="flex justify-between">
                        <span>Tanggal:</span>
                        <span className="font-bold text-charcoal">{item.eventDate}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Jenis:</span>
                        <span className="font-bold text-charcoal uppercase">{item.eventType}</span>
                      </p>
                      <p className="flex flex-col">
                        <span>Lokasi Venue:</span>
                        <span className="font-bold text-charcoal leading-relaxed">{item.eventLocation}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-gold-dark" /> Layanan Dipesan
                      </h4>
                      <ul className="space-y-1 list-disc pl-4 font-semibold text-charcoal">
                        {servicesNames.map((name, i) => (
                          <li key={i} className="leading-relaxed">{name}</li>
                        ))}
                      </ul>
                      {item.notes && (
                        <p className="text-[10px] text-stone-400 italic">Catatan: {item.notes}</p>
                      )}
                    </div>

                    <div className="bg-ivory p-4 rounded-2xl border border-gold-light/10 space-y-2.5 h-fit">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-charcoal">{item.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Pengantaran:</span>
                        <span className="font-semibold text-charcoal">{item.additionalFees}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-charcoal pt-1.5 border-t border-dashed border-gold-light/15">
                        <span>Total Biaya:</span>
                        <span className="text-gold-dark">{item.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold border-t border-gold-light/5 pt-1.5">
                        <span>Status Bayar:</span>
                        <span className={`uppercase ${item.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.paymentStatus === 'paid' ? 'LUNAS / DP OK' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-gold-light/5 text-xs font-semibold">
                    {item.paymentStatus === 'pending' && (
                      <Link
                        href={`/checkout?bookingId=${item.id}`}
                        className="py-2 px-4 bg-gold hover:bg-gold-dark text-white rounded-lg transition-colors shadow-sm"
                      >
                        Bayar Sekarang
                      </Link>
                    )}
                    <button
                      onClick={() => handleWhatsAppConsult(item)}
                      className="py-2 px-4 border border-stone-200 hover:border-gold hover:text-gold text-stone-700 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <span>Hubungi Admin Butik</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Belum Ada Booking"
            description="Anda belum memiliki riwayat pemesanan layanan gaun, makeup, atau dekorasi pernikahan saat ini."
            actionText="Buat Booking Baru"
            onAction={() => router.push('/booking')}
          />
        )}
      </div>

    </div>
  );
}
