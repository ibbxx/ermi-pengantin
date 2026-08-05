import LoadingSkeleton, { PageHeaderSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeaderSkeleton />
      <div className="pt-6">
        <LoadingSkeleton count={4} />
      </div>
    </div>
  );
}
