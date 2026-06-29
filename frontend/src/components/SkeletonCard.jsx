import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
    {/* Image skeleton */}
    <div className="h-40 skeleton-shimmer rounded-none" />

    {/* Content skeleton */}
    <div className="p-4 space-y-3 flex-grow">
      {/* Brand line */}
      <div className="h-2.5 w-16 skeleton-shimmer rounded-full" />
      {/* Name line */}
      <div className="h-3.5 w-3/4 skeleton-shimmer rounded-full" />
      {/* Salt line */}
      <div className="h-2.5 w-1/2 skeleton-shimmer rounded-full" />

      {/* Price + button row */}
      <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 dark:border-slate-700">
        <div className="space-y-1.5">
          <div className="h-4 w-16 skeleton-shimmer rounded-full" />
          <div className="h-2.5 w-10 skeleton-shimmer rounded-full" />
        </div>
        <div className="h-8 w-20 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
