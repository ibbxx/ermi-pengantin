'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dresses: 'Koleksi Busana',
  makeup: 'Jasa Makeup',
  decor: 'Dekorasi',
  packages: 'Paket Wedding',
  booking: 'Booking Layanan',
  checkout: 'Checkout',
  account: 'Akun Saya',
  payment: 'Pembayaran',
  success: 'Sukses',
  pending: 'Tertunda',
  failed: 'Gagal',
};

interface BreadcrumbProps {
  customLastLabel?: string;
  className?: string;
}

export default function Breadcrumb({ customLastLabel, className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage or admin panel
  if (!pathname || pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-[11px] font-medium tracking-wide uppercase text-muted-foreground/75 py-2', className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors duration-200"
          >
            <Home className="size-3.5" />
            <span className="sr-only">Beranda</span>
          </Link>
        </li>

        {segments.map((segment, idx) => {
          const href = `/${segments.slice(0, idx + 1).join('/')}`;
          const isLast = idx === segments.length - 1;
          
          // Determine the display label
          let label = routeLabels[segment] || segment;
          
          // Clean dynamic segment IDs or slugs
          if (segment.startsWith('book-') || segment.startsWith('INV-')) {
            label = segment;
          } else if (isLast && customLastLabel) {
            label = customLastLabel;
          } else if (!routeLabels[segment]) {
            // Replace hyphens/underscores and capitalize words
            label = segment
              .replace(/[-_]+/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }

          return (
            <li key={href} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="size-3 shrink-0 text-muted-foreground/45" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground transition-colors duration-200 truncate max-w-[160px]"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
