import React from 'react';

const FILTER_OPTIONS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

export function AnalyticsFilters({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800/70 rounded-xl w-fit border border-gray-200 dark:border-slate-700/60">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default React.memo(AnalyticsFilters);

