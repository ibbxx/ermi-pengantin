'use client';

import { useState, useMemo } from 'react';
import { Search, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { Booking } from '@/types';
import { useBookings } from '@/data/db';

export default function AdminPayments() {
  const [bookings] = useBookings();
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredPayments = useMemo(() => {
    return bookings.filter((b) => {
      return b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [bookings, searchQuery]);

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-base text-charcoal">Jurnal Transaksi Keuangan (Payments)</h2>
          <p className="text-[10px] text-stone-400">Verifikasi status transaksi transfer Virtual Account, Gopay, atau cicilan DP.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari Invoice atau Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-gold rounded-xl py-1.5 px-3 pl-8 text-xs focus:outline-none"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table List of Transactions */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 font-serif font-bold text-charcoal">
              <th className="p-4 md:p-5">Tanggal Transaksi</th>
              <th className="p-4 md:p-5">Invoice Tagihan</th>
              <th className="p-4 md:p-5">Nama Pelanggan</th>
              <th className="p-4 md:p-5 text-center">Metode Pembayaran</th>
              <th className="p-4 md:p-5">Tipe Bayar</th>
              <th className="p-4 md:p-5 text-center">Status</th>
              <th className="p-4 md:p-5 text-right font-semibold">Nominal Bayar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {filteredPayments.map((item) => {
              // Strip formatting to get numeric amount
              const cleanNum = (str: string) => Number(str.replace(/[^0-9]/g, ''));
              const amount = item.paymentType === 'dp' ? cleanNum(item.depositRequired) : cleanNum(item.totalAmount);

              return (
                <tr key={item.id} className="hover:bg-ivory-light/35 transition-colors">
                  <td className="p-4 md:p-5 font-mono text-stone-500">{item.createdAt.slice(0, 19).replace('T', ' ')}</td>
                  <td className="p-4 md:p-5 font-bold text-charcoal">{item.invoiceNumber}</td>
                  <td className="p-4 md:p-5 font-semibold text-stone-700">{item.customerName}</td>
                  <td className="p-4 md:p-5 text-center text-charcoal font-bold uppercase">{item.paymentMethod.replace('_', ' ')}</td>
                  <td className="p-4 md:p-5 text-stone-600 uppercase font-mono">{item.paymentType}</td>
                  <td className="p-4 md:p-5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center justify-center gap-1 w-20 mx-auto ${
                      item.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.paymentStatus === 'failed'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.paymentStatus === 'paid' ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> SUCCESS
                        </>
                      ) : item.paymentStatus === 'failed' ? (
                        <>
                          <AlertTriangle className="h-3 w-3" /> FAILED
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3 w-3" /> PENDING
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-right font-bold text-emerald-700">{formatPrice(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
