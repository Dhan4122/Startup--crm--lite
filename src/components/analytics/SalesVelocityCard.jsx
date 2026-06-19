import React from 'react';
import { Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';
import { useChartTheme } from '../../hooks/useChartTheme';

export function SalesVelocityCard({ velocity }) {
  const { cardClass } = useChartTheme();
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Velocity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">The rate at which deals move through your pipeline.</p>
        </div>
        <div className="p-2 bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
            {formatCurrency(velocity)}
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/day</span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/45 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
          </div>
        </div>

        {/* Formula breakdown explainer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" /> Pipeline Acceleration Formula
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Calculated as: <span className="font-semibold text-slate-800 dark:text-slate-200">(Opportunities × Win Rate × Avg Deal Value) ÷ Average Sales Cycle Length</span>. Optimise any input parameter to increase velocity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SalesVelocityCard);
