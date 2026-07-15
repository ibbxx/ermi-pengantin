'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { WeddingPackage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PackageCardProps {
  pkg: WeddingPackage;
}

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(price);

export default function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Card className="h-full gap-0 py-0 ring-foreground/10">
      <CardHeader className="p-6 pb-5">
        <div className="mb-5 flex h-6 items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Paket Ermi Pengantin</span>
          {pkg.isPopular && <Badge>Paling diminati</Badge>}
        </div>
        <CardTitle className="font-heading text-3xl font-normal">{pkg.name}</CardTitle>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{formatPrice(pkg.price)}</p>
        <p className="text-xs text-muted-foreground">DP mulai {formatPrice(pkg.depositRequired)}</p>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-1 flex-col p-6">
        <dl className="mb-6 grid gap-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Busana</dt><dd className="text-right font-medium">{pkg.dressesIncluded} pasang</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Makeup</dt><dd className="max-w-[65%] text-right font-medium">{pkg.makeupIncluded.join(', ')}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Dekorasi</dt><dd className="max-w-[65%] text-right font-medium">{pkg.decorIncluded}</dd></div>
        </dl>
        <Separator />
        <ul className="mt-6 space-y-3">
          {pkg.features.slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="border-t bg-transparent p-4">
        <Button asChild className="w-full" size="lg"><Link href={`/booking?packageId=${pkg.id}`}>Pilih paket</Link></Button>
      </CardFooter>
    </Card>
  );
}
