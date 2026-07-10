'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { useSettings } from '@/data/db';

export default function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const pathname = usePathname();
  const [settings] = useSettings();

  useEffect(() => {
    // Show tooltip after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide WhatsApp floating button on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleWhatsAppRedirect = () => {
    const phoneNumber = settings.whatsappAdmin;
    const message = encodeURIComponent('Halo Elika Wedding, saya tertarik dengan layanan sewa gaun/makeup/dekorasi untuk pernikahan saya. Ingin konsultasi lebih lanjut.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip Chat Bubble */}
      {showTooltip && (
        <div className="bg-white text-charcoal border border-gold-light p-4 rounded-2xl shadow-xl max-w-xs mb-3 relative animate-fade-in glass">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-stone-400 hover:text-charcoal transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-xs font-semibold text-gold-dark mb-1">Elika Wedding Assistant</div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            Halo! Ada yang bisa kami bantu mengenai sewa gaun, makeup, atau dekorasi? Konsultasikan pernikahan impian Anda bersama kami!
          </p>
          <button
            onClick={handleWhatsAppRedirect}
            className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Chat Admin WhatsApp</span>
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleWhatsAppRedirect}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group"
        aria-label="Hubungi kami melalui WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-charcoal text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
          Konsultasi WhatsApp
        </span>
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-25 -z-10" />
      </button>
    </div>
  );
}
