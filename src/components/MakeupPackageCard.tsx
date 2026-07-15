'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, MessageCircle } from 'lucide-react';
import { MakeupPackage } from '@/types';
import { useSettings } from '@/data/db';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MakeupPackageCardProps { pkg: MakeupPackage }

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function MakeupPackageCard({ pkg }: MakeupPackageCardProps) {
  const [settings] = useSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappAdmin}?text=${encodeURIComponent(`Halo Ermi Pengantin, saya tertarik dengan layanan "${pkg.name}".`)}`;

  return (
    <Card className="h-full gap-0 py-0 ring-foreground/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {pkg.images[0] ? <Image src={pkg.images[0]} alt={pkg.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /> : <ImagePlaceholder label="Foto makeup kosong" />}
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-2xl">{pkg.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pkg.description}</p>
        <p className="mt-5 text-xl font-semibold">{formatPrice(pkg.price)}</p>
        <ul className="my-6 space-y-2.5 border-t pt-5">
          {pkg.features.map((feature, index) => <li key={`${index}-${feature}`} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-foreground" />{feature}</li>)}
        </ul>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button asChild variant="outline"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Konsultasi</a></Button>
          <Button asChild><Link href={`/booking?makeupId=${pkg.id}`}>Booking</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}
