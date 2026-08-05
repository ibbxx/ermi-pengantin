'use client';

export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-card rounded-2xl overflow-hidden shadow-xs border border-border flex flex-col h-full p-4 space-y-4">
          {/* Image skeleton */}
          <div className="bg-muted aspect-[4/3] w-full rounded-xl" />
          {/* Title skeleton */}
          <div className="h-5 bg-muted w-3/4 rounded-md" />
          {/* Details skeleton */}
          <div className="space-y-2">
            <div className="h-3.5 bg-muted w-1/2 rounded-md" />
            <div className="h-3.5 bg-muted w-1/3 rounded-md" />
          </div>
          {/* Button skeleton */}
          <div className="h-10 bg-muted w-full rounded-xl mt-auto" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 w-full animate-pulse">
      <div className="h-12 bg-muted rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-4 px-2 border-b border-border/60">
          <div className="h-4 bg-muted rounded-md w-1/4" />
          <div className="h-4 bg-muted rounded-md w-1/6" />
          <div className="h-4 bg-muted rounded-md w-1/12" />
          <div className="h-4 bg-muted rounded-md w-1/12" />
        </div>
      ))}
    </div>
  );
}

export function PackageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-card rounded-3xl overflow-hidden border border-border shadow-xs p-6 flex flex-col space-y-5">
          <div className="h-4 bg-muted rounded-md w-1/3" />
          <div className="h-8 bg-muted rounded-md w-3/4" />
          <div className="h-6 bg-muted rounded-md w-1/2" />
          <div className="space-y-2.5 pt-4 border-t border-border">
            <div className="h-4 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-5/6" />
            <div className="h-4 bg-muted rounded-md w-2/3" />
          </div>
          <div className="h-11 bg-muted rounded-xl w-full mt-auto" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="text-center max-w-xl mx-auto space-y-3 animate-pulse">
      <div className="h-8 bg-muted rounded-lg w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded-md w-5/6 mx-auto" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-[4/5] bg-muted rounded-3xl w-full" />
      <div className="space-y-6 flex flex-col justify-center">
        <div className="h-4 bg-muted rounded-md w-1/4" />
        <div className="h-10 bg-muted rounded-lg w-3/4" />
        <div className="h-6 bg-muted rounded-md w-1/3" />
        <div className="space-y-2 pt-4">
          <div className="h-4 bg-muted rounded-md w-full" />
          <div className="h-4 bg-muted rounded-md w-full" />
          <div className="h-4 bg-muted rounded-md w-4/5" />
        </div>
        <div className="h-12 bg-muted rounded-xl w-full pt-4" />
      </div>
    </div>
  );
}

