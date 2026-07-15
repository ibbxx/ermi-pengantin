'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, MessageCircle } from 'lucide-react';
import { DecorPackage } from '@/types';
import { useSettings } from '@/data/db';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DecorPackageCardProps { pkg: DecorPackage }

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function DecorPackageCard({ pkg }: DecorPackageCardProps) {
  const [settings] = useSettings();
  const whatsappMessage = pkg.decorType === 'item'
    ? `Halo Ermi Pengantin, saya ingin bertanya dan memesan item dekorasi "${pkg.name}".`
    : `Halo Ermi Pengantin, saya ingin berkonsultasi mengenai paket dekorasi "${pkg.name}".`;
  const whatsappUrl = `https://wa.me/${settings.whatsappAdmin}?text=${encodeURIComponent(whatsappMessage)}`;
  const typeLabel = pkg.decorType === 'package' ? 'Paket Dekorasi' : 'Item Dekorasi';

  return (
    <Card className="h-full gap-0 py-0 ring-foreground/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {pkg.images[0] ? <Image src={pkg.images[0]} alt={pkg.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /> : <ImagePlaceholder label="Foto dekorasi kosong" />}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="bg-foreground text-background">{typeLabel}</Badge>
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm">{pkg.theme}</Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-2xl">{pkg.name}</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{pkg.description}</p>
        <div className="mt-5">
          <p className="text-xs text-muted-foreground">Mulai dari</p>
          <p className="text-xl font-semibold">{formatPrice(pkg.price)}</p>
        </div>
        <ul className="my-6 space-y-2.5 border-t pt-5">
          {pkg.features.map((feature, index) => <li key={`${pkg.id}-${index}`} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-foreground" />{feature}</li>)}
        </ul>
        {pkg.decorType === 'package' ? (
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button asChild variant="outline"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Konsultasi</a></Button>
            <Button asChild><Link href={`/booking?decorId=${pkg.id}`}>Booking</Link></Button>
          </div>
        ) : (
          <Button asChild className="mt-auto w-full">
            <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Tanya via WhatsApp</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
