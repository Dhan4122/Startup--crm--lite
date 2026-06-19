import React from 'react';
import { Award, Percent } from 'lucide-react';
import { formatCurrency, getInitials } from '../../utils/analyticsHelpers';
import { useChartTheme } from '../../hooks/useChartTheme';

export function TopPerformersCard({ performers }) {
  // Grab top won revenue as a baseline to display progress bars
  const maxRevenue = performers[0]?.wonRevenue || 1;
  const { cardClass } = useChartTheme();

  return (
    <div className={cardClass}>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Sales Reps</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reps ranked by closed-won deal value.</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Rep leaderboard list */}
        <div className="mt-6 space-y-4">
          {performers.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
              No won sales data available for this range.
            </div>
          ) : (
            performers.map((rep, idx) => {
              const widthPct = Math.max(10, Math.round((rep.wonRevenue / maxRevenue) * 100));

              return (
                <div key={rep.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <span className="w-5 text-xs font-black text-slate-400 dark:text-slate-500">
                        #{idx + 1}
                      </span>
                      {/* Avatar initials fallback */}
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-700/60">
                        {getInitials(rep.name)}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {rep.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-950 dark:text-white">
                          {formatCurrency(rep.wonRevenue)}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-0.5 justify-end">
                          <Percent className="w-2.5 h-2.5" /> {rep.convRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Relative value progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-650 bg-purple-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(TopPerformersCard);
