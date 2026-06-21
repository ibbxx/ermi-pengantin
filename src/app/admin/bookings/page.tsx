'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MessageSquare, Trash2, Edit3, Check, FileText } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { INITIAL_BOOKINGS } from '@/data/mockData';
import EmptyState from '@/components/ui/EmptyState';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load bookings
  useEffect(() => {
    const savedBookingsStr = localStorage.getItem('elika_bookings');
    if (savedBookingsStr) {
      try {
        setBookings(JSON.parse(savedBookingsStr));
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.setItem('elika_bookings', JSON.stringify(INITIAL_BOOKINGS));
      setBookings(INITIAL_BOOKINGS);
    }
  }, []);

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Update booking status in local storage
  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    const updatedList = bookings.map((b) => {
      if (b.id === id) {
        // Also update payment status to paid if bookingStatus goes to paid/confirmed
        const isPaid = newStatus === 'paid' || newStatus === 'fitting' || newStatus === 'ready' || newStatus === 'completed';
        return {
          ...b,
          bookingStatus: newStatus,
          paymentStatus: isPaid ? ('paid' as const) : b.paymentStatus
        };
      }
      return b;
    });

    setBookings(updatedList);
    localStorage.setItem('elika_bookings', JSON.stringify(updatedList));
  };

  // Delete booking
  const handleDeleteBooking = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus booking ini secara permanen dari sistem?')) {
      const updatedList = bookings.filter((b) => b.id !== id);
      setBookings(updatedList);
      localStorage.setItem('elika_bookings', JSON.stringify(updatedList));
    }
  };

  const handleWhatsAppContact = (booking: Booking) => {
    const text = encodeURIComponent(`Halo ${booking.customerName}, kami dari Elika Wedding ingin mengonfirmasi detail fitting/booking Anda untuk Invoice ${booking.invoiceNumber}.`);
    window.open(`https://wa.me/${booking.customerWhatsApp}?text=${text}`, '_blank');
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerWhatsApp.includes(searchQuery);
      
      const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const statuses: { label: string; value: string }[] = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Paid', value: 'paid' },
    { label: 'Fitting', value: 'fitting' },
    { label: 'Ready', value: 'ready' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Cari Invoice atau Nama Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-gold rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters status */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 focus:border-gold rounded-xl py-1.5 px-3 text-xs focus:outline-none w-full sm:w-44"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Bookings Table List */}
      {filteredBookings.length > 0 ? (
        <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 font-serif font-bold text-charcoal">
                  <th className="p-4 md:p-5">Invoice</th>
                  <th className="p-4 md:p-5">Pelanggan & Kontak</th>
                  <th className="p-4 md:p-5">Detail Acara</th>
                  <th className="p-4 md:p-5">Total Biaya</th>
                  <th className="p-4 md:p-5">Status Booking</th>
                  <th className="p-4 md:p-5 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredBookings.map((item) => {
                  const servicesList = [];
                  if (item.servicesSelected.weddingPackage) {
                    servicesList.push(item.servicesSelected.weddingPackage.name);
                  } else {
                    if (item.servicesSelected.dresses?.length) {
                      servicesList.push(`Gaun: ${item.servicesSelected.dresses.map((d) => d.name).join(', ')}`);
                    }
                    if (item.servicesSelected.makeup) {
                      servicesList.push(`MUA: ${item.servicesSelected.makeup.name}`);
                    }
                    if (item.servicesSelected.decor) {
                      servicesList.push(`Dekor: ${item.servicesSelected.decor.name}`);
                    }
                  }

                  return (
                    <tr key={item.id} className="hover:bg-ivory-light/35 transition-colors">
                      {/* Invoice */}
                      <td className="p-4 md:p-5 align-top font-bold text-charcoal space-y-1">
                        <span className="block">{item.invoiceNumber}</span>
                        <span className="text-[9px] text-stone-400 font-mono block leading-none">{item.createdAt.slice(0, 10)}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4 md:p-5 align-top space-y-1.5">
                        <p className="font-bold text-charcoal-light">{item.customerName}</p>
                        <p className="text-[10px] text-stone-500 font-mono">{item.customerWhatsApp}</p>
                        <p className="text-[10px] text-stone-400 max-w-xs truncate">{item.customerAddress}</p>
                      </td>

                      {/* Event Inclusions */}
                      <td className="p-4 md:p-5 align-top space-y-1.5 text-stone-600">
                        <p className="font-semibold text-charcoal">
                          Tanggal: <span className="text-gold-dark">{item.eventDate}</span>
                        </p>
                        <p className="text-[10px] font-bold text-stone-500 uppercase">{item.eventType} • {item.eventLocation}</p>
                        <div className="text-[10px] text-stone-400 font-semibold">{servicesList.join(' | ')}</div>
                      </td>

                      {/* Price */}
                      <td className="p-4 md:p-5 align-top font-bold text-gold-dark space-y-1">
                        <span className="block">{item.totalAmount}</span>
                        <span className="text-[9px] text-stone-400 uppercase font-mono block">
                          {item.paymentType === 'dp' ? 'Uang Muka (DP)' : 'Lunas'} ({item.paymentStatus})
                        </span>
                      </td>

                      {/* Booking Status Dropdown */}
                      <td className="p-4 md:p-5 align-top">
                        <select
                          value={item.bookingStatus}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as BookingStatus)}
                          className={`px-2 py-1 rounded-xl text-[10px] font-bold border focus:outline-none ${
                            item.bookingStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.bookingStatus === 'confirmed' || item.bookingStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.bookingStatus === 'fitting' || item.bookingStatus === 'ready'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="paid">Paid</option>
                          <option value="fitting">Fitting</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 md:p-5 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleWhatsAppContact(item)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-all inline-block"
                          title="Hubungi Klien"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(item.id)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-red-500 hover:bg-red-50 text-stone-600 hover:text-red-700 transition-all inline-block"
                          title="Hapus Pesanan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Booking Tidak Ditemukan"
          description="Tidak ada pesanan masuk yang cocok dengan kriteria filter pencarian Anda."
          actionText="Tampilkan Semua"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      )}

    </div>
  );
}
