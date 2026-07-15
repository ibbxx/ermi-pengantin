'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Koleksi', href: '/dresses' },
  { name: 'Makeup', href: '/makeup' },
  { name: 'Dekorasi', href: '/decor' },
  { name: 'Paket', href: '/packages' },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Beranda Ermi Pengantin">
          <span className="font-heading text-2xl leading-none tracking-tight">Ermi</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pengantin & Wedding</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm text-muted-foreground transition-colors hover:text-foreground',
                pathname === item.href && 'text-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Akun pelanggan">
            <Link href="/account"><UserRound /></Link>
          </Button>
          <Button asChild size="lg" className="px-5">
            <Link href="/booking">Buat janji</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Buka menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[88%] sm:max-w-sm">
            <SheetHeader className="border-b">
              <SheetTitle className="font-heading text-xl">Ermi Pengantin</SheetTitle>
              <SheetDescription>Busana, rias, dan dekorasi dalam satu kurasi.</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col px-4" aria-label="Navigasi seluler">
              <SheetClose asChild>
                <Link href="/" className="py-4 text-base font-medium">Beranda</Link>
              </SheetClose>
              <Separator />
              {navItems.map((item) => (
                <div key={item.href}>
                  <SheetClose asChild>
                    <Link href={item.href} className="block py-4 text-base font-medium">{item.name}</Link>
                  </SheetClose>
                  <Separator />
                </div>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 p-4">
              <SheetClose asChild>
                <Button asChild size="lg"><Link href="/booking">Buat janji</Link></Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="outline" size="lg"><Link href="/account">Lihat pesanan</Link></Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
