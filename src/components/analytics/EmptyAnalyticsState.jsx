import React from 'react';
import { BarChart3 } from 'lucide-react';

export function EmptyAnalyticsState({ onAddLead }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center bg-white dark:bg-slate-900 shadow-sm animate-fadeIn max-w-lg mx-auto mt-12">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 rounded-2xl mb-6">
        <BarChart3 className="w-10 h-10 stroke-1" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        No analytics available yet
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        Add your first lead to start tracking business performance, pipeline valuations, conversion trends, and insights.
      </p>

      <button
        onClick={onAddLead}
        className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
      >
        Add Lead
      </button>
    </div>
  );
}

export default React.memo(EmptyAnalyticsState);
