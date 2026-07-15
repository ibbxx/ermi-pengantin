'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, MapPin, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/data/db';

const serviceLinks = [
  ['Koleksi busana', '/dresses'],
  ['Makeup pengantin', '/makeup'],
  ['Dekorasi', '/decor'],
  ['Paket wedding', '/packages'],
  ['Buat booking', '/booking'],
];

export default function Footer() {
  const pathname = usePathname();
  const [settings] = useSettings();

  if (pathname?.startsWith('/admin')) return null;

  const formatPhoneNumber = (num: string) => {
    if (!num) return '';
    if (num.startsWith('62')) {
      return `+62 ${num.slice(2, 5)}-${num.slice(5, 9)}-${num.slice(9)}`;
    }
    return num;
  };

  return (
    <footer className="mt-24 border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="font-heading text-3xl tracking-tight">Ermi Pengantin</Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Wedding atelier yang menyatukan busana, rias, dan dekorasi melalui satu proses konsultasi.</p>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground">
              <svg aria-hidden="true" className="size-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
              </svg>
              Instagram
            </a>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Layanan</p>
            <nav className="grid gap-3 text-sm">
              {serviceLinks.map(([label, href]) => <Link key={href} href={href} className="hover:text-muted-foreground">{label}</Link>)}
            </nav>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kontak</p>
            <ul className="grid gap-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{settings.address || 'Jl. Kemang Raya No. 12, Jakarta Selatan'}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="size-4 shrink-0 text-foreground" />
                <span>{formatPhoneNumber(settings.whatsappAdmin) || '+62 812-3456-7890'}</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Studio</p>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0 text-foreground" />
              <div className="space-y-3"><p><span className="block font-medium text-foreground">Senin—Sabtu</span>09.00—18.00 WIB</p><p><span className="block font-medium text-foreground">Minggu</span>Dengan janji temu</p></div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />
        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ermi Pengantin.</p>
          <div className="flex gap-5"><Link href="/admin">Admin</Link><span>Jakarta, Indonesia</span></div>
        </div>
      </div>
    </footer>
  );
}
