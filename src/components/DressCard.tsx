'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Star } from 'lucide-react';
import { Dress } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DressCardProps {
  dress: Dress;
}

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(price);

const statusLabels: Record<Dress['status'], string> = {
  available: 'Tersedia',
  rented: 'Sedang disewa',
  maintenance: 'Perawatan',
};

export default function DressCard({ dress }: DressCardProps) {
  return (
    <Card className="group h-full gap-0 py-0 ring-foreground/10 transition-colors hover:ring-foreground/25">
      <Link href={`/dresses/${dress.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-muted">
        {dress.images[0] ? (
          <Image src={dress.images[0]} alt={dress.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        ) : (
          <ImagePlaceholder label="Foto busana kosong" />
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl leading-tight"><Link href={`/dresses/${dress.slug}`}>{dress.name}</Link></h3>
            <p className="mt-1 text-xs text-muted-foreground">{dress.sizes.join(' · ')} {dress.colors.length > 0 ? `— ${dress.colors.join(', ')}` : ''}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs"><Star className="size-3.5 fill-accent text-accent" /> {dress.rating}</div>
        </div>

        <div className="mt-auto flex items-end justify-between border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Sewa {dress.rentalDurationDays} hari</p>
            <p className="mt-0.5 font-semibold">{formatPrice(dress.price)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{statusLabels[dress.status]}</p>
          </div>
          <Button asChild variant="outline" size="icon" aria-label={`Lihat ${dress.name}`}>
            <Link href={`/dresses/${dress.slug}`}><ArrowUpRight /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
