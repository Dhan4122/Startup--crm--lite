import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function LineChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, rate } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{rate}% Conversion</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Conversion Trend</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Ratio of won deals over total monthly leads.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#22C55E"
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#22C55E' }}
              dot={{ r: 4, strokeWidth: 2, stroke: '#22C55E', fill: 'transparent' }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(LineChartCard);
