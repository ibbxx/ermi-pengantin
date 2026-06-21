'use client';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex flex-col h-full p-4 space-y-4">
          {/* Image skeleton */}
          <div className="bg-stone-200 aspect-[3/4] w-full rounded-xl" />
          {/* Title skeleton */}
          <div className="h-4 bg-stone-200 w-3/4 rounded" />
          {/* Details skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-stone-200 w-1/2 rounded" />
            <div className="h-3 bg-stone-200 w-1/3 rounded" />
          </div>
          {/* Button skeleton */}
          <div className="h-10 bg-stone-200 w-full rounded-xl mt-auto" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse">
      <div className="h-10 bg-stone-200 rounded-lg w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-4 border-b border-stone-100">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-4 bg-stone-200 rounded w-1/6" />
          <div className="h-4 bg-stone-200 rounded w-1/12" />
          <div className="h-4 bg-stone-200 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
}
