import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 6 KPI Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl h-28 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-8 h-8 bg-slate-250 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-12 h-2.5 bg-slate-100 dark:bg-slate-850 dark:bg-slate-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 2 Column Large Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl h-80 space-y-6"
          >
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-48 h-3 bg-slate-150 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Row 3: 2 Column Medium Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl h-80 space-y-6"
          >
            <div className="space-y-2">
              <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-56 h-3 bg-slate-150 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(LoadingSkeleton);
