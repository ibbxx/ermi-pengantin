import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-stone-200 rounded-lg w-1/4" />
      <TableSkeleton rows={6} />
    </div>
  );
}
