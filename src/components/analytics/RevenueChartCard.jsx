import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';
import { formatCurrency } from '../../utils/analyticsHelpers';

export function RevenueChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, revenue } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month} Revenue</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(revenue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Analytics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Total won revenue trends calculated month over month.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(val) => formatCurrency(val)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22C55E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGreenGradient)"
              animationDuration={800}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#22C55E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(RevenueChartCard);
