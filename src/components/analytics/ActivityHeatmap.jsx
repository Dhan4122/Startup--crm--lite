import React from 'react';
import { useChartTheme } from '../../hooks/useChartTheme';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ActivityHeatmap({ data }) {
  const { cardClass, isDarkMode } = useChartTheme();

  // Colour intensity based on lead count — maps to both light and dark
  const getCellColor = (count) => {
    if (count === 0)  return isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100';
    if (count <= 1)   return isDarkMode ? 'bg-blue-900/50' : 'bg-blue-200';
    if (count <= 2)   return isDarkMode ? 'bg-blue-800/70' : 'bg-blue-300';
    if (count <= 4)   return 'bg-blue-500 text-white';
    return 'bg-blue-700 text-white';
  };

  // Theme-aware tooltip class (mirrors useChartTheme.tooltipWrapperClass but for absolute-positioned DOM)
  const hoverTipClass = isDarkMode
    ? 'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 pointer-events-none bg-slate-950 border border-slate-700 text-white text-[10px] font-medium py-1.5 px-2.5 rounded-md whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.7)]'
    : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 pointer-events-none bg-white border border-gray-200 text-gray-900 text-[10px] font-medium py-1.5 px-2.5 rounded-md whitespace-nowrap shadow-lg';

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Deal Ingestion Activity</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Heatmap tracking incoming lead volume over the past 52 weeks.</p>
      </div>

      <div className="mt-6 overflow-x-auto select-none">
        <div className="min-w-[760px] flex flex-col gap-2">
          
          {/* Month Headers */}
          <div className="flex text-[10px] font-semibold text-slate-400 dark:text-slate-500 h-4 relative">
            <div className="w-8 shrink-0" /> {/* Spacer for days column */}
            <div className="flex-1 flex justify-between pr-4">
              {MONTHS_SHORT.map((m, idx) => (
                <span key={`${m}-${idx}`} className="w-12 text-center">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div className="flex gap-2">
            
            {/* Days column */}
            <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1.5 w-8 shrink-0">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex-1 flex gap-1">
              {data.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1 flex-1">
                  {week.map((day) => {
                    const formattedDate = new Date(day.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={day.date}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 relative group cursor-pointer ${getCellColor(day.count)}`}
                      >
                        {/* Theme-aware tooltip */}
                        <div className={hoverTipClass}>
                          <span className="font-bold">{day.count} Leads</span> on {formattedDate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">
            <span>Less</span>
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-200'}`} />
            <div className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-blue-800/70' : 'bg-blue-300'}`} />
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-700" />
            <span>More</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default React.memo(ActivityHeatmap);
