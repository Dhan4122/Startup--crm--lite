import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';
import { useChartTheme } from '../../hooks/useChartTheme';

export function ForecastCard({ forecast }) {
  const isPositiveGrowth = forecast.growth >= 0;
  const { cardClass } = useChartTheme();

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Forecast</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Predictive growth models based on past monthly revenue.</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Target className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Predicted Revenue Next Month
          </p>
          <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            {formatCurrency(forecast.predicted)}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                isPositiveGrowth
                  ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/45'
                  : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/45'
              }`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositiveGrowth ? '+' : ''}
              {forecast.growth}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">projected growth</span>
          </div>
        </div>

        {/* Confidence score indicator */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Model Confidence</span>
            <span className="font-bold text-slate-900 dark:text-slate-200">{forecast.confidence}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${forecast.confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
            Confidence score scales up based on historical data volume and consistent monthly conversions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ForecastCard);
