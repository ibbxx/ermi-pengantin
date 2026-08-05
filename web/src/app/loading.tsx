import LoadingSkeleton, { PageHeaderSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <PageHeaderSkeleton />
      <LoadingSkeleton count={6} />
    </div>
  );
}
